import test from "node:test";
import assert from "node:assert/strict";
import {CHAT_URL,debugCases,validateDebugBlueprint} from "../debug-lab.mjs";
import {createApp} from "../server.mjs";

const all=debugCases();
const baseline={
 endpoint:CHAT_URL,
 model:"gpt-5.4-mini",
 messages:[
  {role:"system",content:"You are a concise assistant who offers careful explanations."},
  {role:"user",content:"Explain how SERV Reasoning helps ambiguous decisions."}
 ]
};

test("three source-linked debugging missions with invalid starting examples",()=>{
 assert.equal(all.length,3);
 assert.deepEqual(all.map(x=>x.id),["missing-instructions","wrong-endpoint","unknown-model"]);
 for(const exercise of all){
  assert.ok(exercise.source.url.startsWith("https://docs.openserv.ai/"));
  const result=validateDebugBlueprint(exercise.id,exercise.starter);
  assert.equal(result.passed,false,exercise.id);
  assert.ok(result.problems.length>=1);
  assert.equal(result.executed,false);
 }
});
test("every mission can be repaired using the published SERV HTTP contract",()=>{
 for(const item of all){
  const result=validateDebugBlueprint(item.id,baseline);
  assert.equal(result.passed,true,item.id);
  assert.equal(result.request.method,"POST");
  assert.equal(result.request.url,CHAT_URL);
  assert.equal(result.executed,false);
  assert.equal(result.request.body.messages[0].role,"system");
 }
});
test("missing-instructions starter receives a precise field-level correction",()=>{
 const result=validateDebugBlueprint("missing-instructions",all[0].starter);
 assert.equal(result.passed,false);
 assert.deepEqual(result.problems.map(p=>p.field),["messages.instructions"]);
 assert.match(result.problems[0].hint,/Add a clear system or developer message/);
 assert.equal(result.executed,false);
});
test("developer prompt is an allowed alternative to system",()=>{
 const config=structuredClone(baseline);
 config.messages[0].role="developer";
 assert.equal(validateDebugBlueprint("missing-instructions",config).passed,true);
});
test("wrong path, unsupported model, missing instruction and invalid roles fail",()=>{
 const wrongUrl=validateDebugBlueprint("wrong-endpoint",{...baseline,endpoint:"https://evil.example/v1/chat/completions"});
 assert.equal(wrongUrl.passed,false);
 assert.ok(wrongUrl.problems.some(x=>x.field==="endpoint"));
 const wrongModel=validateDebugBlueprint("unknown-model",{...baseline,model:"fantasy-model"});
 assert.ok(wrongModel.problems.some(x=>x.field==="model"));
 const missing=validateDebugBlueprint("missing-instructions",{...baseline,messages:baseline.messages.slice(1)});
 assert.ok(missing.problems.some(x=>x.field==="messages.instructions"&&/missing a system or developer instruction/i.test(x.message)));
 const unknownRole=structuredClone(baseline);unknownRole.messages[0].role="admin";
 assert.ok(validateDebugBlueprint("missing-instructions",unknownRole).problems.some(x=>x.field.includes("role")||x.field.includes("instructions")));
});
test("unknown scenario and malformed request are rejected",()=>{
 assert.throws(()=>validateDebugBlueprint("not-an-issue",baseline),/Unknown practice/);
 assert.throws(()=>validateDebugBlueprint("wrong-endpoint",[]),/JSON object/);
 assert.throws(()=>validateDebugBlueprint("wrong-endpoint",null),/JSON object/);
});
async function withApp(fn){
 let calls=0;
 const app=createApp({env:{SERV_API_KEY:"fake-test-key","LEARN_ACCESS_TOKEN":"private-code"},fetchImpl:async()=>{calls++;throw Error("Never call SERV from debug lab");}});
 await new Promise(resolve=>app.listen(0,"127.0.0.1",resolve));
 try{await fn("http://127.0.0.1:"+app.address().port,()=>calls);}
 finally{await new Promise(resolve=>app.close(resolve));}
}
test("debug page, client assets and scenario API available without signup",async()=>{
 await withApp(async url=>{
  assert.equal((await fetch(url+"/debug")).status,200);
  assert.match(await (await fetch(url+"/debug")).text(),/Fix a broken/);
  assert.equal((await fetch(url+"/debug.js")).status,200);
  assert.equal((await fetch(url+"/debug.css")).status,200);
  const data=await (await fetch(url+"/api/debug/scenarios")).json();
  assert.equal(data.scenarios.length,3);
  assert.equal(data.api_execution,false);
 });
});
test("repair validation uses the real HTTP route without calling SERV",async()=>{
 await withApp(async(url,calls)=>{
  const r=await fetch(url+"/api/debug/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:"wrong-endpoint",config:baseline})});
  assert.equal(r.status,200);
  const data=await r.json();
  assert.equal(data.passed,true);
  assert.equal(data.executed,false);
  assert.equal(data.request.url,CHAT_URL);
  assert.equal(calls(),0);
 });
});
test("broken practice request gives actionable feedback, no paid calls",async()=>{
 await withApp(async(url,calls)=>{
  const response=await fetch(url+"/api/debug/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:"missing-instructions",config:all[0].starter})});
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.passed,false);
  assert.ok(data.problems.length>0);
  assert.equal(calls(),0);
 });
});
test("invalid JSON, unknown ID rejected via HTTP 400",async()=>{
 await withApp(async url=>{
  const invalid=await fetch(url+"/api/debug/check",{method:"POST",headers:{"Content-Type":"application/json"},body:"{invalid"});
  assert.equal(invalid.status,400);
  const unknown=await fetch(url+"/api/debug/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:"nope",config:baseline})});
  assert.equal(unknown.status,400);
 });
});
