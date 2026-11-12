import test from "node:test";
import assert from "node:assert/strict";
import {executeLearnerRequest} from "../try-live.mjs";
import {createApp} from "../server.mjs";

const request={
 model:"gpt-5.4-mini",
 system:"You are a practical AI tutor who explains hard decisions carefully.",
 user:"When should an AI agent choose reasoning instead of arithmetic?"
};
const key="test-only-openserv-key-123456";
const access="test-private-demo-code-123456";

function servStub(){
 let called=0;
 const fetchImpl=async(url,options)=>{
   called++;
   assert.equal(url,"https://inference-api.openserv.ai/v1/chat/completions");
   assert.equal(options.headers.Authorization,"Bearer "+key);
   const body=JSON.parse(options.body);
   assert.equal(body.model,request.model);
   assert.equal(body.messages[0].role,"system");
   assert.equal(body.messages[1].role,"user");
   assert.equal(body.max_completion_tokens,800);
   return {ok:true,status:200,json:async()=>({
      id:"serv-live-example-stub",
      model:"gpt-5.4-mini-2026-03-17",
      usage:{prompt_tokens:41,completion_tokens:59},
      choices:[{finish_reason:"stop",message:{content:"Reasoning is useful for ambiguous decisions, while arithmetic should be handled by exact code."}}]
   })};
 };
 return {fetchImpl,count:()=>called};
}

async function withApp(env,fn,fetchImpl=fetch){
 const server=createApp({env,fetchImpl});
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try {await fn("http://127.0.0.1:"+server.address().port);}
 finally {await new Promise(resolve=>server.close(resolve));}
}

test("real request helper uses a bounded, authorized OpenServ endpoint and exposes provenance only",async()=>{
 const mock=servStub();
 const result=await executeLearnerRequest({input:request,apiKey:key,fetchImpl:mock.fetchImpl});
 assert.equal(mock.count(),1);
 assert.equal(result.mode,"live-serv-request");
 assert.equal(result.status,"completed");
 assert.equal(result.completion_id,"serv-live-example-stub");
 assert.equal(result.usage.output_tokens,59);
 assert.ok(result.latency_ms>=0);
 assert.match(result.response,/ambiguous decisions/);
 assert.ok(!JSON.stringify(result).includes(key));
});

test("unrecognized model, short instruction and incomplete upstream output are refused",async()=>{
 const mock=servStub();
 await assert.rejects(()=>executeLearnerRequest({input:{...request,model:"invented-model"},apiKey:key,fetchImpl:mock.fetchImpl}),/supported model/);
 await assert.rejects(()=>executeLearnerRequest({input:{...request,system:"short"},apiKey:key,fetchImpl:mock.fetchImpl}),/at least 20/);
 assert.equal(mock.count(),0);
 const bad=async()=>({ok:true,status:200,json:async()=>({
   choices:[{finish_reason:"length",message:{content:"Incomplete..."}}]
 })});
 await assert.rejects(()=>executeLearnerRequest({input:request,apiKey:key,fetchImpl:bad}),/complete text response/);
});

test("public cannot run paid requests without private code or secret configuration",async()=>{
 await withApp({},async url=>{
  const r=await fetch(url+"/api/try-serv",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({request})
  });
  assert.equal(r.status,503);
 });
 const mock=servStub();
 await withApp({SERV_API_KEY:key,LEARN_ACCESS_TOKEN:access},async url=>{
  const r=await fetch(url+"/api/try-serv",{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Learn-Access-Token":"wrong"},
    body:JSON.stringify({request})
  });
  assert.equal(r.status,401);
  assert.equal(mock.count(),0);
 },mock.fetchImpl);
});

test("verified paid test runs through the actual HTTP route but never leaks the key",async()=>{
 const mock=servStub();
 await withApp({SERV_API_KEY:key,LEARN_ACCESS_TOKEN:access},async url=>{
  const response=await fetch(url+"/api/try-serv",{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Learn-Access-Token":access},
    body:JSON.stringify({request})
  });
  assert.equal(response.status,200);
  const result=await response.json();
  assert.equal(result.mode,"live-serv-request");
  assert.equal(result.completion_id,"serv-live-example-stub");
  assert.match(result.response,/reasoning/i);
  assert.ok(!JSON.stringify(result).includes(key));
  assert.ok(!JSON.stringify(result).includes(access));
  assert.equal(mock.count(),1);
 },mock.fetchImpl);
});

test("both tutor and request lab share the paid per-process limit",async()=>{
 const mock=servStub();
 await withApp({SERV_API_KEY:key,LEARN_ACCESS_TOKEN:access},async url=>{
  for(let i=0;i<3;i++){
    const r=await fetch(url+"/api/try-serv",{
      method:"POST",
      headers:{"Content-Type":"application/json","X-Learn-Access-Token":access},
      body:JSON.stringify({request})
    });
    assert.equal(r.status,200);
  }
  const refused=await fetch(url+"/api/try-serv",{
    method:"POST",headers:{"Content-Type":"application/json","X-Learn-Access-Token":access},
    body:JSON.stringify({request})
  });
  assert.equal(refused.status,429);
  assert.equal(mock.count(),3);
 },mock.fetchImpl);
});

test("invalid request cannot spend the paid-call allowance",async()=>{
 const mock=servStub();
 await withApp({SERV_API_KEY:key,LEARN_ACCESS_TOKEN:access},async url=>{
   const r=await fetch(url+"/api/try-serv",{
     method:"POST",
     headers:{"Content-Type":"application/json","X-Learn-Access-Token":access},
     body:JSON.stringify({request:{...request,model:"not-allowed"}})
   });
   assert.equal(r.status,400);
   assert.equal(mock.count(),0);
 },mock.fetchImpl);
});
