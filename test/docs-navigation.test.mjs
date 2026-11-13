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


test("one shared brand stylesheet and working first-party navigation across the app",async()=>{
 await withApp(async (url,calls)=>{
  const style=await fetch(url+"/brand.css");
  assert.equal(style.status,200);
  assert.match(style.headers.get("content-type"),/text\/css/);
  const css=await style.text();
  assert.match(css,/--ts-blue:#4269e9/);
  assert.match(css,/--ts-navy:#132b42/);
  for(const route of ["/","/learn","/try","/debug","/docs"]){
   const html=await (await fetch(url+route)).text();
   assert.match(html,/href="\/brand\.css"/,route+" must use the same brand");
   assert.match(html,/class="brand-route-nav"/,route+" must have mobile page navigation");
   for(const link of ["/","/learn","/try","/debug","/docs"]){
    assert.ok(html.includes('href="'+link+'"'),route+" links to "+link);
   }
  }
  const html=await (await fetch(url+"/debug")).text();
  assert.match(html,/id="serv-diagnostic"/);
  assert.match(html,/only this exercise's known scenario/);
  assert.equal(calls(),0,"reading public pages cannot make paid SERV requests");
 });
});


test("docs finder script is allowlisted, self-contained and never triggers inference",async()=>{
 await withApp(async(url,calls)=>{
  const html=await (await fetch(url+"/docs")).text();
  assert.match(html,/id="docs-search"/);
  assert.match(html,/src="\/docs\.js"/);
  assert.match(html,/id="docs-search-status"/);
  const result=await fetch(url+"/docs.js");
  assert.equal(result.status,200);
  assert.match(result.headers.get("content-type"),/javascript/);
  const script=await result.text();
  assert.match(script,/filterGuides/);
  assert.doesNotMatch(script,/fetch\s*\(|XMLHttpRequest|localStorage|\/api\/mentor/);
  assert.equal(calls(),0);
 });
});


test("original OpenServ hero illustration is publicly served as an image with safe static markup",async()=>{
 await withApp(async(url,calls)=>{
   const page=await (await fetch(url+"/")).text();
   assert.match(page,/src="\/serv-hero-illustration\.svg"/);
   assert.match(page,/data-hero-explorer/);
   assert.match(page,/ILLUSTRATION · NO LIVE API CALL/);
   const response=await fetch(url+"/serv-hero-illustration.svg");
   assert.equal(response.status,200);
   assert.match(response.headers.get("content-type"),/image\/svg\+xml/);
   const svg=await response.text();
   assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
   assert.match(svg,/<desc/);
   assert.doesNotMatch(svg,/<script|onload=|<foreignObject|xlink:href=/i);
   assert.equal(calls(),0);
 });
});


test("human-centered OpenServ illustration animates without fabricating an API result",async()=>{
 await withApp(async(url,calls)=>{
   const response=await fetch(url+"/serv-hero-illustration.svg");
   assert.equal(response.status,200);
   const svg=await response.text();
   assert.match(svg,/<title id="humanTitle">/);
   assert.match(svg,/expressive eyes/);
   assert.match(svg,/class="person"/);
   assert.match(svg,/class="leftHand"/);
   assert.match(svg,/class="rightHand"/);
   assert.match(svg,/class="eyelids"/);
   assert.match(svg,/@keyframes blink/);
   assert.match(svg,/@keyframes typeRight/);
   assert.match(svg,/@media\(prefers-reduced-motion:reduce\)/);
   assert.match(svg,/PREVIEW ONLY/);
   assert.match(svg,/No automatic inference/);
   assert.doesNotMatch(svg,/tool_choice|missing required field|LIVE RESPONSE|Completion ID/);
   assert.doesNotMatch(svg,/<script\b|onload=|onerror=|<foreignObject/i);
   assert.equal(calls(),0);
 });
});
