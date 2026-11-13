import http from "node:http";
import crypto from "node:crypto";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {readFile} from "node:fs/promises";
import {publicLessons,checkExercise,findLesson} from "./curriculum.mjs";
import {answerWithServ} from "./mentor.mjs";
import {executeLearnerRequest} from "./try-live.mjs";
import {guestTrialConfigured,reserveGuestTrial,guestFailure,getGuestTrialStatus} from "./guest-budget.mjs";
import {debugCases,validateDebugBlueprint} from "./debug-lab.mjs";
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const files={"/":["landing.html","text/html; charset=utf-8"],"/learn":["index.html","text/html; charset=utf-8"],"/try":["index.html","text/html; charset=utf-8"],"/landing.css":["landing.css","text/css; charset=utf-8"],"/styles.css":["styles.css","text/css; charset=utf-8"],"/app.js":["app.js","text/javascript; charset=utf-8"],"/serv-map.js":["serv-map.js","text/javascript; charset=utf-8"],"/serv-hero-illustration.svg":["serv-hero-illustration.svg","image/svg+xml"],"/progress.mjs":["progress.mjs","text/javascript; charset=utf-8"],"/debug":["debug.html","text/html; charset=utf-8"],"/debug.js":["debug.js","text/javascript; charset=utf-8"],"/debug.css":["debug.css","text/css; charset=utf-8"],"/brand.css":["brand.css","text/css; charset=utf-8"],"/docs":["docs.html","text/html; charset=utf-8"],"/docs.css":["docs.css","text/css; charset=utf-8"],"/docs.js":["docs.js","text/javascript; charset=utf-8"]};
function json(res,status,payload){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(payload));}
function tokenEquals(value,expected){
 if(typeof value!=="string"||!expected)return false;
 const a=Buffer.from(value),b=Buffer.from(expected);
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
async function readJson(req){
 if(req.headers["content-type"]?.split(";")[0]!=="application/json")throw new Error("Expected application/json.");
 let body="";
 for await(const chunk of req){
  body+=chunk.toString("utf8");
  if(Buffer.byteLength(body)>2400)throw new Error("Request is too large.");
 }
 try{return JSON.parse(body);}catch{throw new Error("Invalid request JSON.");}
}
export function createApp({env=process.env,fetchImpl=fetch,guestReserve=reserveGuestTrial,guestStatus=getGuestTrialStatus}={}){
 const enabled=Boolean(env.SERV_API_KEY&&env.LEARN_ACCESS_TOKEN);
 const publicTutorEnabled=enabled&&guestTrialConfigured(env);
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
   return json(res,200,{status:"ok",service:"tryserv",tutor_enabled:enabled,public_tutor_enabled:publicTutorEnabled,mode:"independent learning pilot"});
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
