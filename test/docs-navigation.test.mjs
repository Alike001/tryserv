import test from "node:test";
import assert from "node:assert/strict";
import {createApp} from "../server.mjs";

async function withApp(fn){
 let upstreamCalls=0;
 const server=createApp({
  env:{},
  fetchImpl:async()=>{upstreamCalls++;throw Error("Documentation must never call SERV.");}
 });
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try{await fn("http://127.0.0.1:"+server.address().port,()=>upstreamCalls);}
 finally{await new Promise(resolve=>server.close(resolve));}
}

test("documentation is a real public route with correct content and assets",async()=>{
 await withApp(async(url,calls)=>{
  const doc=await fetch(url+"/docs");
  assert.equal(doc.status,200);
  assert.match(doc.headers.get("content-type"),/text\/html/);
  const html=await doc.text();
  assert.match(html,/<h1>Understand it\./);
  for(const section of ["overview","paths","learning","serv","api","debugging","architecture","security","faq"]){
   assert.match(html,new RegExp('id="'+section+'"'),section);
  }
  assert.match(html,/independent learning companion/i);
  assert.match(html,/does not issue a certificate or a verified credential/i);
  assert.match(html,/shared lifetime pilot budget/i);
  assert.match(html,/https:\/\/docs\.openserv\.ai\/serv-reasoning\/introduction/);
  assert.match(html,/https:\/\/docs\.openserv\.ai\/serv-reasoning\/api\/chat-completions/);
  const stylesheet=await fetch(url+"/docs.css");
  assert.equal(stylesheet.status,200);
  assert.match(stylesheet.headers.get("content-type"),/text\/css/);
  assert.match(await stylesheet.text(),/\.docs-sidebar/);
  assert.equal(calls(),0);
 });
});

test("TrySERV guide links exist across entry pages without breaking core routes",async()=>{
 await withApp(async(url,calls)=>{
  for(const route of ["/","/learn","/debug","/try"]){
   const response=await fetch(url+route);
   assert.equal(response.status,200,route);
   const html=await response.text();
   assert.match(html,/href="\/docs"/,route+" guide link");
  }
  const homepage=await (await fetch(url+"/")).text();
  assert.match(homepage,/class="trail-grid"/);
  assert.match(homepage,/href="\/learn"/);
  assert.match(homepage,/href="\/try"/);
  assert.match(homepage,/href="\/debug"/);
  assert.match(homepage,/href="\/docs#security"/);
  assert.equal(calls(),0);
 });
});

test("docs describe live inference separately from deterministic previews and quizzes",async()=>{
 await withApp(async url=>{
  const html=await (await fetch(url+"/docs")).text();
  assert.match(html,/not.*graded by the model/i);
  assert.match(html,/Previewing or copying does.*not.*send a request/i);
  assert.match(html,/explicitly requires private authorization/i);
  assert.match(html,/two requests per approximate visitor identity/i);
  assert.match(html,/When it is exhausted or unavailable, paid guest calls stop/i);
  assert.doesNotMatch(html,/Nimiq Pay|wallet[- ]signed|verified on[- ]chain/i);
 });
});
