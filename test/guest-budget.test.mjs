import test from "node:test";
import assert from "node:assert/strict";
import {createApp} from "../server.mjs";
import {GUEST_GLOBAL_LIFETIME_LIMIT,GUEST_PER_ACTOR_DAILY_LIMIT,
  guestActorHash,guestTrialConfigured,reserveGuestTrial,guestFailure} from "../guest-budget.mjs";

const key="example-secret-api-key-only-for-tests";
const access="demo-owner-testing-code";
const env={SERV_API_KEY:key,LEARN_ACCESS_TOKEN:access,DATABASE_URL:"postgresql://example.invalid/test",PUBLIC_TUTOR_ENABLED:"true"};

async function withApp(config,fn,fetchImpl=fetch,guestReserve){
 const server=createApp({env:config,fetchImpl,guestReserve});
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try{await fn("http://127.0.0.1:"+server.address().port);}
 finally{await new Promise(resolve=>server.close(resolve));}
}
const question={lesson_id:"understand",question:"Why does SERV need a system prompt?"};
const serv=()=>({ok:true,status:200,json:async()=>({
  id:"real-shape-but-mocked",
  model:"gpt-5.4-mini",
  usage:{prompt_tokens:70,completion_tokens:45},
  choices:[{finish_reason:"stop",message:{content:JSON.stringify({
    explanation:"The system instruction defines the model's role and what constraints the assistant must respect while serving the learner.",
    next_action:"Compare the role messages in the official example request."
  })}}]
})});

test("guest mode must be explicitly opted into with a real budget database",()=>{
 assert.equal(guestTrialConfigured(env),true);
 assert.equal(guestTrialConfigured({...env,DATABASE_URL:""}),false);
 assert.equal(guestTrialConfigured({...env,PUBLIC_TUTOR_ENABLED:"false"}),false);
});
test("visitor identity is a non-reversible hash, not raw IP or agent text",()=>{
 const req={headers:{"x-forwarded-for":"203.0.113.7","user-agent":"TestBrowser"},socket:{remoteAddress:"127.0.0.1"}};
 const a=guestActorHash(req,key);
 assert.match(a,/^[a-f0-9]{64}$/);
 assert.ok(!a.includes("203.0.113.7"));
 assert.notEqual(a,guestActorHash({...req,headers:{...req.headers,"user-agent":"OtherBrowser"}},key));
});
test("durable reserve call requires hard global and daily limits",async()=>{
 let observed;
 const query=async(_db,actor,globalLimit,dailyLimit)=>{
  observed={actor,globalLimit,dailyLimit};
  return [{allowed:true,reason:"reserved",remaining:23}];
 };
 const req={headers:{"user-agent":"test visitor"},socket:{remoteAddress:"127.0.0.1"}};
 const result=await reserveGuestTrial({req,env,query});
 assert.equal(result.allowed,true);
 assert.equal(result.remaining,23);
 assert.equal(observed.globalLimit,24);
 assert.equal(observed.dailyLimit,2);
 assert.equal(GUEST_GLOBAL_LIFETIME_LIMIT,24);
 assert.equal(GUEST_PER_ACTOR_DAILY_LIMIT,2);
 assert.match(observed.actor,/^[a-f0-9]{64}$/);
});
test("database outage, exhausted budget and malformed responses fail closed",async()=>{
 const req={headers:{},socket:{remoteAddress:"127.0.0.1"}};
 assert.equal((await reserveGuestTrial({req,env,query:async()=>{throw Error("database unavailable");}})).allowed,false);
 assert.equal((await reserveGuestTrial({req,env,query:async()=>[{garbage:true}]})).allowed,false);
 const exhausted=await reserveGuestTrial({req,env,query:async()=>[{allowed:false,reason:"global_exhausted",remaining:0}]});
 assert.equal(exhausted.allowed,false);
 assert.equal(guestFailure(exhausted.reason).status,429);
 assert.equal(guestFailure("unavailable").status,503);
});
test("a normal visitor can ask SERV without a code and gets genuine-shaped provenance",async()=>{
 let used=0;
 let reserves=0;
 await withApp(env,async url=>{
  const metadata=await (await fetch(url+"/api/lessons")).json();
  assert.equal(metadata.tutor_enabled,true);
  assert.equal(metadata.public_tutor_enabled,true);
  assert.equal(metadata.guest_daily_limit,2);
  const response=await fetch(url+"/api/mentor",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(question)
  });
  assert.equal(response.status,200);
  const result=await response.json();
  assert.equal(result.guest_trial,true);
  assert.equal(result.guest_remaining,22);
  assert.equal(result.completion_id,"real-shape-but-mocked");
  assert.equal(result.model,"gpt-5.4-mini");
  assert.equal(used,1);
  assert.equal(reserves,1);
  assert.ok(!JSON.stringify(result).includes(key));
 },async()=>{used++;return serv();},async()=>{reserves++;return {allowed:true,reason:"reserved",remaining:22}});
});
test("budget exhaustion rejects paid tutoring, never calls SERV",async()=>{
 let used=0;
 await withApp(env,async url=>{
  const response=await fetch(url+"/api/mentor",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(question)
  });
  assert.equal(response.status,429);
  assert.match((await response.json()).error,/allowance/i);
  assert.equal(used,0);
 },async()=>{used++;return serv();},async()=>({allowed:false,reason:"global_exhausted",remaining:0}));
});
test("guest paid lab remains private, invalid question doesn't consume quota",async()=>{
 let used=0,reserves=0;
 await withApp(env,async url=>{
  const r=await fetch(url+"/api/try-serv",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({request:{
      model:"gpt-5.4-mini",
      system:"You are a focused tutor who explains concepts carefully.",
      user:"Explain when reasoning is appropriate for an AI agent."
    }})
  });
  assert.equal(r.status,401);
  const bad=await fetch(url+"/api/mentor",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({lesson_id:"understand",question:"short"})
  });
  assert.equal(bad.status,400);
  assert.equal(used,0);
  assert.equal(reserves,0);
 },async()=>{used++;return serv();},async()=>{reserves++;return {allowed:true,reason:"reserved",remaining:22}});
});
test("without guest flag a public caller is denied and owner still has private demo option",async()=>{
 let used=0;
 await withApp({...env,PUBLIC_TUTOR_ENABLED:"false"},async url=>{
  const r=await fetch(url+"/api/mentor",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(question)
  });
  assert.equal(r.status,503);
  const status=await (await fetch(url+"/api/lessons")).json();
  assert.equal(status.public_tutor_enabled,false);
  assert.equal(used,0);
 },async()=>{used++;return serv();},async()=>({allowed:true,reason:"reserved",remaining:23}));
});
