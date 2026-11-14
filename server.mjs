import http from "node:http";
import crypto from "node:crypto";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {readFile} from "node:fs/promises";
import {publicLessons,checkExercise,findLesson} from "./curriculum.mjs";
import {answerWithServ} from "./mentor.mjs";
import {executeLearnerRequest} from "./try-live.mjs";
import {guestTrialConfigured,reserveGuestTrial,guestFailure,getGuestTrialStatus,guestActorHash} from "./guest-budget.mjs";
import {debugCases,validateDebugBlueprint} from "./debug-lab.mjs";
import {extractTABBATADocuments,TABBATA_UPLOAD_LIMITS} from "./tabbata-documents.mjs";
import {validateTabbataCaseInput,makeReviewSourceSegments,reviewWithServ} from "./tabbata-review.mjs";
import {createTabbataStore} from "./tabbata-store.mjs";
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const files={"/":["tabbata.html","text/html; charset=utf-8"],"/legacy":["landing.html","text/html; charset=utf-8"],"/tabbata.css":["tabbata.css","text/css; charset=utf-8"],"/tabbata.js":["tabbata.js","text/javascript; charset=utf-8"],"/learn":["index.html","text/html; charset=utf-8"],"/try":["index.html","text/html; charset=utf-8"],"/landing.css":["landing.css","text/css; charset=utf-8"],"/styles.css":["styles.css","text/css; charset=utf-8"],"/app.js":["app.js","text/javascript; charset=utf-8"],"/serv-map.js":["serv-map.js","text/javascript; charset=utf-8"],"/serv-hero-illustration.svg":["serv-hero-illustration.svg","image/svg+xml"],"/progress.mjs":["progress.mjs","text/javascript; charset=utf-8"],"/debug":["debug.html","text/html; charset=utf-8"],"/debug.js":["debug.js","text/javascript; charset=utf-8"],"/debug.css":["debug.css","text/css; charset=utf-8"],"/brand.css":["brand.css","text/css; charset=utf-8"],"/docs":["docs.html","text/html; charset=utf-8"],"/docs.css":["docs.css","text/css; charset=utf-8"],"/docs.js":["docs.js","text/javascript; charset=utf-8"]};
function json(res,status,payload){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(payload));}
function tokenEquals(value,expected){
 if(typeof value!=="string"||!expected)return false;
 const a=Buffer.from(value),b=Buffer.from(expected);
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
async function readJson(req,maxBytes=2400){
 if(req.headers["content-type"]?.split(";")[0]!=="application/json")throw new Error("Expected application/json.");
 let body="";
 for await(const chunk of req){
  body+=chunk.toString("utf8");
  if(Buffer.byteLength(body)>maxBytes)throw new Error("Request is too large.");
 }
 try{return JSON.parse(body);}catch{throw new Error("Invalid request JSON.");}
}
export function createApp({env=process.env,fetchImpl=fetch,guestReserve=reserveGuestTrial,guestStatus=getGuestTrialStatus,tabbataStore,documentExtractor=extractTABBATADocuments,reviewWithServFn=reviewWithServ}={}){
 const enabled=Boolean(env.SERV_API_KEY&&env.LEARN_ACCESS_TOKEN);
 const publicTutorEnabled=enabled&&guestTrialConfigured(env);
 const reviewStore=tabbataStore??createTabbataStore({databaseUrl:env.DATABASE_URL});
 const reviewInFlight=new Set();
 const caseCreateWindows=new Map();
 function allowCaseCreate(req){
  const actor=guestActorHash(req,env.SERV_API_KEY||env.DATABASE_URL||"tabbata-case-limit");
  const now=Date.now();
  const recent=(caseCreateWindows.get(actor)??[]).filter(timestamp=>timestamp>now-60*60*1000);
  if(recent.length>=5)return false;
  recent.push(now);caseCreateWindows.set(actor,recent);
  if(caseCreateWindows.size>2000){for(const [key,times] of caseCreateWindows)if(!times.some(timestamp=>timestamp>now-60*60*1000))caseCreateWindows.delete(key);}
  return true;
 }
 const recent=new Map();
 let total=0;
 function reservePaidCall(req){
   const remote=req.socket.remoteAddress??"unknown";
   const now=Date.now();
   const history=(recent.get(remote)??[]).filter(t=>now-t<600000);
   // Both paid features share the same strict staging allowance.
   if(history.length>=3||total>=35)return false;
   history.push(now);recent.set(remote,history);total++;
   return true;
 }
 return http.createServer(async(req,res)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","no-referrer");
  res.setHeader("Content-Security-Policy","default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'");
  const url=new URL(req.url??"/","http://localhost");
  const pathname=url.pathname;
  if(req.method==="GET"&&pathname==="/healthz")
   return json(res,200,{status:"ok",service:"tabbata",tutor_enabled:enabled,public_tutor_enabled:publicTutorEnabled,mode:"donor report review pilot"});
  if(req.method==="GET"&&pathname==="/api/tutor/allowance"){
   const status=await guestStatus({req,env});
   return json(res,200,status);
  }
  if(req.method==="GET"&&pathname==="/api/lessons")
   return json(res,200,{lessons:publicLessons(),tutor_enabled:enabled,public_tutor_enabled:publicTutorEnabled,guest_daily_limit:publicTutorEnabled?2:0,progress_storage:"on-device only"});
  if(req.method==="GET"&&pathname==="/api/debug/scenarios")
   return json(res,200,{scenarios:debugCases(),api_execution:false,progress_storage:"on-device only"});
  if(req.method==="POST"&&pathname==="/api/debug/check"){
   try{
     const input=await readJson(req);
     return json(res,200,{scenario_id:input?.id,...validateDebugBlueprint(input?.id,input?.config)});
   }catch(e){return json(res,400,{error:String(e.message).slice(0,145)});}
  }
  if(req.method==="POST"&&pathname==="/api/check"){
   try{
    const input=await readJson(req);
    return json(res,200,{lesson_id:input?.lesson_id,...checkExercise(input?.lesson_id,input?.answer)});
   }catch(e){return json(res,400,{error:String(e.message).slice(0,160)});}
  }
  if(req.method==="POST"&&pathname==="/api/try-serv"){
   if(!enabled)return json(res,503,{error:"Live SERV testing is not yet configured. The request preview still works."});
   if(!tokenEquals(req.headers["x-learn-access-token"],env.LEARN_ACCESS_TOKEN))
     return json(res,401,{error:"A valid private demo access code is needed for live SERV calls."});
   let input;
   try{
     const body=await readJson(req);
     input=body?.request;
     const result=checkExercise("build",input);
     if(!result.passed)return json(res,400,{error:result.feedback});
   }catch(error){return json(res,400,{error:String(error.message).slice(0,140)});}
   if(!reservePaidCall(req))return json(res,429,{error:"Live demo limit reached. You can still use the request preview."});
   try{
     const result=await executeLearnerRequest({input,apiKey:env.SERV_API_KEY,fetchImpl});
     console.info("tryserv.serv_result",JSON.stringify({
       kind:"request-lab",model:result.model,latency_ms:result.latency_ms,
       completion_id:result.completion_id,input_tokens:result.usage.input_tokens,
       output_tokens:result.usage.output_tokens
     }));
     return json(res,200,result);
   }catch(error){return json(res,502,{error:"Live SERV call failed: "+String(error.message).slice(0,140)});}
  }
  if(req.method==="POST"&&pathname==="/api/mentor"){
   if(!enabled)return json(res,503,{error:"Live SERV tutor is not configured. Free practice still works."});
   const supplied=req.headers["x-learn-access-token"];
   const ownerAuthorized=tokenEquals(supplied,env.LEARN_ACCESS_TOKEN);
   if(supplied&&!ownerAuthorized)
     return json(res,401,{error:"Invalid private testing code. Leave the field empty for the free guest tutor."});
   if(!ownerAuthorized&&!publicTutorEnabled)
     return json(res,503,{error:"Free guest tutoring is not enabled yet. Free exercises still work."});
   let input;
   try{
     input=await readJson(req);
     if(!findLesson(input?.lesson_id))return json(res,400,{error:"Select a valid lesson."});
     if(typeof input?.question!=="string"||input.question.trim().length<8||input.question.length>400)
       return json(res,400,{error:"Enter a question between 8 and 400 characters."});
   }catch(e){return json(res,400,{error:String(e.message).slice(0,145)});}
   let remaining=null;
   if(ownerAuthorized){
     if(!reservePaidCall(req))return json(res,429,{error:"Private testing limit reached. Practice lessons remain available."});
   }else{
     const guest=await guestReserve({req,env});
     if(!guest.allowed){
       const failure=guestFailure(guest.reason);
       return json(res,failure.status,{error:failure.message});
     }
     remaining=guest.remaining;
   }
   try{
    const result=await answerWithServ({lessonId:input.lesson_id,question:input.question,
      apiKey:env.SERV_API_KEY,model:env.SERV_MODEL??"gpt-5.4-mini",fetchImpl});
    console.info("tryserv.serv_result",JSON.stringify({
      kind:"tutor",guest:!ownerAuthorized,lesson_id:input.lesson_id,model:result.model,
      latency_ms:result.latency_ms,completion_id:result.completion_id,
      input_tokens:result.usage.input_tokens,output_tokens:result.usage.output_tokens
    }));
    return json(res,200,{mode:"live-serv-tutor",guest_trial:!ownerAuthorized,
      guest_remaining:remaining,...result});
   }catch(e){
    return json(res,502,{error:"Tutor failed safely: "+String(e.message).slice(0,145)});
   }
  }
  if(req.method==="GET"&&pathname==="/api/tabbata/status")
   return json(res,200,{storage_configured:Boolean(env.DATABASE_URL),serv_configured:guestTrialConfigured(env),model:env.SERV_MODEL??"gpt-5.4-mini",upload_limits:{files:TABBATA_UPLOAD_LIMITS.files,per_file_bytes:TABBATA_UPLOAD_LIMITS.perFileBytes,total_bytes:TABBATA_UPLOAD_LIMITS.totalBytes}});
  if(req.method==="POST"&&pathname==="/api/tabbata/cases"){
   if(!env.DATABASE_URL)return json(res,503,{error:"Review storage is not configured. The existing case workspace is unavailable."});
   if(!allowCaseCreate(req))return json(res,429,{error:"This browser has reached the five-workspaces-per-hour limit. Reuse or delete an existing case and try later."});
   let normalized,documents,reportDocument;
   try{
    const input=await readJson(req,12*1024*1024);
    const reportFile=input.report_file??null;
    const supportingFiles=Array.isArray(input.files)?input.files:[];
    if(supportingFiles.length<1)throw new Error("Upload at least one supporting document.");
    if(!reportFile){
     normalized=validateTabbataCaseInput(input);
     documents=await documentExtractor(supportingFiles);
     reportDocument=null;
    }else{
     const extracted=await documentExtractor([reportFile,...supportingFiles]);
     reportDocument=extracted[0];
     documents=extracted.slice(1);
     if(!documents.length)throw new Error("Upload at least one supporting evidence file in addition to the narrative report.");
     const reportText=reportDocument.segments.map(segment=>segment.text).join("\n\n");
     normalized=validateTabbataCaseInput({...input,report_text:reportText});
    }
   }catch(error){return json(res,400,{error:String(error.message).slice(0,220)});}
   const payload={...normalized,report_document:reportDocument??null,documents,analysis_status:"not_started",review:null,provider:null,analysis_error:null,reviewer_actions:[],created_at:new Date().toISOString()};
   try{
    const created=await reviewStore.create(payload);
    return json(res,201,{case_id:created.id,case_token:created.token,expires_at:created.expires_at,review_case:payload});
   }catch(error){return json(res,503,{error:"Could not create a secure review workspace. Check storage availability and try again."});}
  }
  const tabbataCaseMatch=pathname.match(new RegExp("^/api/tabbata/cases/([0-9a-f-]{36})(?:/(analyze|actions))?$","i"));
  if(tabbataCaseMatch){
   const caseId=tabbataCaseMatch[1];
   const routeAction=tabbataCaseMatch[2]??"";
   const caseToken=req.headers["x-case-token"];
   if(typeof caseToken!=="string"||caseToken.length<40)return json(res,401,{error:"A valid case access token is required."});
   if(req.method==="GET"&&!routeAction){
    try{const record=await reviewStore.get(caseId,caseToken);return record?json(res,200,{case_id:caseId,review_case:record.payload,expires_at:record.expires_at}):json(res,404,{error:"Review workspace not found or expired."});}
    catch{return json(res,503,{error:"Review storage is temporarily unavailable."});}
   }
   if(req.method==="DELETE"&&!routeAction){
    try{const deleted=await reviewStore.delete(caseId,caseToken);return deleted?json(res,200,{deleted:true}):json(res,404,{error:"Review workspace not found or expired."});}
    catch{return json(res,503,{error:"Review storage is temporarily unavailable."});}
   }
   if(req.method==="POST"&&routeAction==="analyze"){
    if(!guestTrialConfigured(env))return json(res,503,{error:"SERV review is not configured. You can still inspect and print the saved report pack."});
    if(reviewInFlight.has(caseId))return json(res,409,{error:"This review is already running."});
    let record;
    try{record=await reviewStore.get(caseId,caseToken);}catch{return json(res,503,{error:"Review storage is temporarily unavailable."});}
    if(!record)return json(res,404,{error:"Review workspace not found or expired."});
    if(record.payload.review)return json(res,200,{analysis_status:"complete",review:record.payload.review,budget_check:record.payload.budget_check,provider:record.payload.provider,reused:true});
    if(record.payload.analysis_status==="running"||record.payload.analysis_status==="failed")return json(res,409,{error:record.payload.analysis_error??"This case has already used its one analysis attempt. Create a new case to try again."});
    reviewInFlight.add(caseId);
    try{
     const allowance=await guestReserve({req,env});
     if(!allowance.allowed){const failure=guestFailure(allowance.reason);return json(res,failure.status,{error:failure.message});}
     record.payload.analysis_status="running";
     if(!await reviewStore.update(caseId,caseToken,record.payload))throw new Error("Review case expired before analysis.");
     const caseForReview={...record.payload,source_segments:makeReviewSourceSegments(record.payload.report_text,record.payload.documents,record.payload.report_document)};
     const result=await reviewWithServFn({casePayload:caseForReview,apiKey:env.SERV_API_KEY,model:env.SERV_MODEL??"gpt-5.4-mini",fetchImpl});
     record.payload.review=result.review;
     record.payload.provider=result.provider;
     record.payload.analysis_status="complete";
     record.payload.analysis_error=null;
     if(!await reviewStore.update(caseId,caseToken,record.payload))throw new Error("Review case expired while saving the result.");
     console.info("tabbata.serv_review",JSON.stringify({model:result.provider.model,completion_id:result.provider.completion_id,latency_ms:result.provider.latency_ms,input_tokens:result.provider.usage.input_tokens,output_tokens:result.provider.usage.output_tokens}));
     return json(res,200,{analysis_status:"complete",review:result.review,budget_check:record.payload.budget_check,provider:result.provider,reused:false});
    }catch(error){
     record.payload.analysis_status="failed";
     record.payload.analysis_error="The reserved SERV review attempt could not be completed. No automatic retry was made; create a new case only if you choose to spend another review credit.";
     try{await reviewStore.update(caseId,caseToken,record.payload);}catch{}
     return json(res,502,{error:record.payload.analysis_error});
    }finally{reviewInFlight.delete(caseId);}
   }
   if(req.method==="POST"&&routeAction==="actions"){
    let input;try{input=await readJson(req,5000);}catch(error){return json(res,400,{error:String(error.message).slice(0,160)});}
    const allowed=new Set(["mark_reviewed","request_clarification","acknowledge_finding","dismiss_finding"]);
    if(!allowed.has(input?.action))return json(res,400,{error:"Choose a supported reviewer action."});
    const note=typeof input.note==="string"?input.note.trim().slice(0,500):"";
    if(input.action==="request_clarification"&&!note)return json(res,400,{error:"Add a short clarification request."});
    let record;try{record=await reviewStore.get(caseId,caseToken);}catch{return json(res,503,{error:"Review storage is temporarily unavailable."});}
    if(!record)return json(res,404,{error:"Review workspace not found or expired."});
    if(!record.payload.review)return json(res,409,{error:"Run the report review before recording reviewer actions."});
    if(record.payload.reviewer_actions.length>=50)return json(res,429,{error:"This review has reached its reviewer-action limit."});
    const findingId=typeof input.finding_id==="string"?input.finding_id:"";
    if(findingId&&!(record.payload.review?.findings??[]).some(finding=>finding.id===findingId))return json(res,400,{error:"The selected finding does not exist in this review."});
    record.payload.reviewer_actions.push({id:"A-"+(record.payload.reviewer_actions.length+1),action:input.action,finding_id:findingId||null,note,created_at:new Date().toISOString()});
    try{await reviewStore.update(caseId,caseToken,record.payload);return json(res,200,{reviewer_actions:record.payload.reviewer_actions});}
    catch{return json(res,503,{error:"Could not save the reviewer action."});}
   }
   return json(res,405,{error:"Method not allowed."});
  }
  if(req.method==="GET"&&Object.hasOwn(files,pathname)){
   try{
    const [filename,mime]=files[pathname];
    const bytes=await readFile(path.join(ROOT,"public",filename));
    res.writeHead(200,{"Content-Type":mime,"Cache-Control":"public, max-age=120"});
    return res.end(bytes);
   }catch{return json(res,500,{error:"Learning interface unavailable."});}
  }
  return json(res,404,{error:"Not found."});
 });
}
