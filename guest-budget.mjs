import crypto from "node:crypto";

// Guest tutoring requires both explicit operator opt-in and a durable Neon budget.
// No in-memory fallback: database outages close the paid endpoint.
export const GUEST_GLOBAL_LIFETIME_LIMIT=24;
export const GUEST_PER_ACTOR_DAILY_LIMIT=2;

export function guestActorHash(req,secret){
 const forwardedHeader=req.headers?.["x-forwarded-for"];
 const forwarded=typeof forwardedHeader==="string"?forwardedHeader.split(",")[0].trim():"";
 const ip=(forwarded||req.socket?.remoteAddress||"unknown").slice(0,160);
 const agent=String(req.headers?.["user-agent"]??"unknown").slice(0,180);
 // No raw visitor IP or user agent is stored in the quota table.
 return crypto.createHmac("sha256",secret).update(ip+"\n"+agent).digest("hex");
}

export function guestTrialConfigured(env){
 return env.PUBLIC_TUTOR_ENABLED==="true" && Boolean(env.DATABASE_URL && env.SERV_API_KEY);
}

async function defaultReserveQuery(databaseUrl,actor,globalCap,dailyCap){
 const {neon}=await import("@neondatabase/serverless");
 const sql=neon(databaseUrl);
 return sql.query(
   "SELECT allowed,reason,remaining FROM tryserv_reserve_guest($1,$2,$3)",
   [actor,globalCap,dailyCap]
 );
}

// Every attempt reserves the allowance BEFORE inference. A failed provider request
// still counts, ensuring retries cannot circumvent the spending guard.
export async function reserveGuestTrial({req,env,query=defaultReserveQuery}){
 if(!guestTrialConfigured(env))
   return {allowed:false,reason:"unavailable",remaining:0};
 const actor=guestActorHash(req,env.SERV_API_KEY);
 try{
   const rows=await query(env.DATABASE_URL,actor,GUEST_GLOBAL_LIFETIME_LIMIT,GUEST_PER_ACTOR_DAILY_LIMIT);
   const row=Array.isArray(rows)?rows[0]:null;
   if(!row||typeof row.allowed!=="boolean")
     return {allowed:false,reason:"unavailable",remaining:0};
   const remaining=Number.isInteger(Number(row.remaining))?Math.max(0,Number(row.remaining)):0;
   const reason=["reserved","global_exhausted","daily_exhausted","invalid"].includes(row.reason)
     ?row.reason:"unavailable";
   return {allowed:row.allowed===true&&reason==="reserved",reason,remaining};
 }catch{
   return {allowed:false,reason:"unavailable",remaining:0};
 }
}

export function guestFailure(reason){
 if(reason==="global_exhausted")
   return {status:429,message:"The free tutor trial has used its total credit allowance. Guided lessons remain free."};
 if(reason==="daily_exhausted")
   return {status:429,message:"Today's free tutor allowance for this visitor has been used. Try again tomorrow."};
 return {status:503,message:"The free tutor's usage protection is unavailable. Free lessons still work."};
}


// Read-only allowance lookup. It never reserves a credit or calls SERV.
async function defaultStatusQuery(databaseUrl,actor){
 const {neon}=await import("@neondatabase/serverless");
 const sql=neon(databaseUrl);
 return sql.query(
  "SELECT b.used AS global_used, COALESCE(d.used,0) AS actor_used " +
  "FROM tryserv_guest_budget b LEFT JOIN tryserv_guest_daily d " +
  "ON d.actor_hash=$1 AND d.day=(now() AT TIME ZONE 'UTC')::date " +
  "WHERE b.id=1",
  [actor]
 );
}
export async function getGuestTrialStatus({req,env,query=defaultStatusQuery}){
 const defaults={enabled:false,available:false,remaining_today:0,remaining_total:0,
  daily_limit:GUEST_PER_ACTOR_DAILY_LIMIT,status:"disabled"};
 if(!guestTrialConfigured(env))return defaults;
 try{
  const actor=guestActorHash(req,env.SERV_API_KEY);
  const rows=await query(env.DATABASE_URL,actor);
  const row=Array.isArray(rows)?rows[0]:null;
  const used=Number(row?.global_used),daily=Number(row?.actor_used);
  if(!Number.isSafeInteger(used)||used<0||!Number.isSafeInteger(daily)||daily<0)
   return {...defaults,enabled:true,status:"unavailable"};
  const remaining_total=Math.max(0,GUEST_GLOBAL_LIFETIME_LIMIT-used);
  const remaining_today=Math.min(Math.max(0,GUEST_PER_ACTOR_DAILY_LIMIT-daily),remaining_total);
  return {
    enabled:true,available:remaining_today>0,
    remaining_today,remaining_total,daily_limit:GUEST_PER_ACTOR_DAILY_LIMIT,
    status:remaining_total===0?"trial_exhausted":remaining_today===0?"daily_exhausted":"available"
  };
 }catch{
  return {...defaults,enabled:true,status:"unavailable"};
 }
}
