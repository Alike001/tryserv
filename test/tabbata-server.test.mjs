import test from "node:test";
import assert from "node:assert/strict";
import {createApp} from "../server.mjs";

const env={
 DATABASE_URL:"postgresql://example.invalid/tabbata",
 SERV_API_KEY:"test-only-openserv-secret-key",
 PUBLIC_TUTOR_ENABLED:"true"
};
const id="11111111-1111-4111-8111-111111111111";
const token="t".repeat(43);
const evidenceText="The site completion register records Site A as completed on 12 August 2026 after a commissioning visit.";
const docs=[{id:"doc-1",name:"site-log.txt",kind:"txt",size_bytes:100,extracted_chars:evidenceText.length,truncated:false,segments:[{id:"doc-1-s1",locator:"Line 1",text:evidenceText}]}];
const input={
 project_name:"Community Water Access Project",funder:"Community Fund",reporting_period:"Q3 2026",currency:"NGN",
 approved_budget:"5000000",reported_spend:"4500000",
 requirements:"Report progress against all approved water facility milestones.",
 report_text:"The narrative report states that all three water facilities were completed during the reporting period and 500 households were reached.",
 files:[{name:"site-log.txt",type:"text/plain",data_base64:"c2l0ZSBsb2c="}]
};
const review={
 summary:"The submitted report is only partly supported by the supplied site records. One site has a completion entry, but the remaining records are not present.",
 review_state:"needs_clarification",
 findings:[{id:"F-01",requirement_id:"R1",claim:"All three water facilities were completed.",status:"partially_supported",severity:"high",explanation:"The supplied site record supports completion of Site A, but does not support all three facilities.",evidence_refs:[{document_id:"doc-1",document_name:"site-log.txt",segment_id:"doc-1-s1",locator:"Line 1",quote:evidenceText}],missing_items:["Completion records for Sites B and C."],suggested_question:"Can the project team provide the remaining commissioning records?",citation_validation:"Exact source quotation validated."}],
 limitations:["Document review cannot establish physical completion."]
};
function fakeStore(){
 const rows=new Map();
 return {
  rows,
  async create(payload){rows.set(id,{token,payload,expires_at:"2026-11-15T00:00:00.000Z"});return {id,token,expires_at:"2026-11-15T00:00:00.000Z"};},
  async get(caseId,access){const row=rows.get(caseId);return row&&row.token===access?{id:caseId,payload:row.payload,expires_at:row.expires_at}:null;},
  async update(caseId,access,payload){const row=rows.get(caseId);if(!row||row.token!==access)return false;row.payload=payload;return true;},
  async delete(caseId,access){const row=rows.get(caseId);if(!row||row.token!==access)return false;rows.delete(caseId);return true;}
 };
}
async function withApp(options,fn){
 const server=createApp(options);
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try{await fn("http://127.0.0.1:"+server.address().port);}
 finally{await new Promise(resolve=>server.close(resolve));}
}
const post=(url,path,body,access)=>fetch(url+path,{
 method:"POST",headers:{"Content-Type":"application/json",...(access?{"X-Case-Token":access}:{})},
 body:JSON.stringify(body)
});
test("status and case creation never spend SERV credits; access token protects the case",async()=>{
 const store=fakeStore();let reserveCalls=0,reviewCalls=0;
 await withApp({env,tabbataStore:store,documentExtractor:async()=>docs,guestReserve:async()=>{reserveCalls++;return {allowed:true,remaining:20};},reviewWithServFn:async()=>{reviewCalls++;return {review,provider:{model:"gpt-5.4-mini",completion_id:"serv-demo",latency_ms:100,usage:{input_tokens:10,output_tokens:20}}};}},async url=>{
  const status=await (await fetch(url+"/api/tabbata/status")).json();
  assert.equal(status.storage_configured,true);
  assert.equal(status.serv_configured,true);
  assert.ok(!JSON.stringify(status).includes(env.SERV_API_KEY));
  const created=await post(url,"/api/tabbata/cases",input);
  assert.equal(created.status,201);
  const body=await created.json();
  assert.equal(body.case_id,id);
  assert.equal(body.review_case.analysis_status,"not_started");
  assert.equal(body.review_case.documents[0].name,"site-log.txt");
  assert.ok(!JSON.stringify(body).includes(env.SERV_API_KEY));
  assert.equal(reserveCalls,0);
  assert.equal(reviewCalls,0);
  const denied=await fetch(url+"/api/tabbata/cases/"+id);
  assert.equal(denied.status,401);
  const loaded=await fetch(url+"/api/tabbata/cases/"+id,{headers:{"X-Case-Token":token}});
  assert.equal(loaded.status,200);
  assert.equal((await loaded.json()).review_case.project.name,"Community Water Access Project");
  assert.equal(reserveCalls,0);
  assert.equal(reviewCalls,0);
 });
});
test("uploaded narrative reports retain their page locators separately from supporting evidence",async()=>{
 const store=fakeStore();let extractedNames=[];
 const reportText="This uploaded narrative report states that the community water project completed all three planned facilities during the reporting period.";
 const reportDoc={id:"doc-1",name:"narrative-report.txt",kind:"txt",size_bytes:120,extracted_chars:reportText.length,truncated:false,segments:[{id:"doc-1-s1",locator:"Line 1",text:reportText}]};
 const supportDoc={id:"doc-2",name:"site-log.txt",kind:"txt",size_bytes:100,extracted_chars:evidenceText.length,truncated:false,segments:[{id:"doc-2-s1",locator:"Line 1",text:evidenceText}]};
 await withApp({env,tabbataStore:store,documentExtractor:async files=>{extractedNames=files.map(file=>file.name);return [reportDoc,supportDoc];},guestReserve:async()=>{throw Error("case creation must not reserve");}},async url=>{
  const body={...input,report_text:"",report_file:{name:"narrative-report.txt",type:"text/plain",data_base64:"bmFycmF0aXZl"},files:[{name:"site-log.txt",type:"text/plain",data_base64:"c2l0ZSBsb2c="}]};
  const response=await post(url,"/api/tabbata/cases",body);
  assert.equal(response.status,201);
  const result=await response.json();
  assert.deepEqual(extractedNames,["narrative-report.txt","site-log.txt"]);
  assert.equal(result.review_case.report_document.name,"narrative-report.txt");
  assert.equal(result.review_case.report_document.segments[0].locator,"Line 1");
  assert.equal(result.review_case.documents[0].id,"doc-2");
  assert.equal(result.review_case.report_text,reportText);
  assert.equal(result.review_case.source_segments,undefined);
 });
});

test("one explicit analyze action reserves one shared credit and returns structured review",async()=>{
 const store=fakeStore();let reserveCalls=0,reviewCalls=0;
 await withApp({env,tabbataStore:store,documentExtractor:async()=>docs,guestReserve:async()=>{reserveCalls++;return {allowed:true,remaining:19};},reviewWithServFn:async({casePayload,apiKey})=>{
  reviewCalls++;assert.equal(apiKey,env.SERV_API_KEY);assert.equal(casePayload.source_segments[1].role,"supporting_evidence");
  return {review,provider:{model:"gpt-5.4-mini",completion_id:"serv-demo",latency_ms:100,usage:{input_tokens:10,output_tokens:20}}};
 }},async url=>{
  const created=await post(url,"/api/tabbata/cases",input);assert.equal(created.status,201);
  const first=await post(url,"/api/tabbata/cases/"+id+"/analyze",{},token);
  assert.equal(first.status,200);
  const result=await first.json();
  assert.equal(result.analysis_status,"complete");
  assert.equal(result.review.findings[0].status,"partially_supported");
  assert.equal(result.provider.completion_id,"serv-demo");
  const second=await post(url,"/api/tabbata/cases/"+id+"/analyze",{},token);
  assert.equal(second.status,200);
  assert.equal((await second.json()).reused,true);
  assert.equal(reserveCalls,1);
  assert.equal(reviewCalls,1);
 });
});
test("exhausted guest allowance fails closed without calling SERV",async()=>{
 const store=fakeStore();let reviewCalls=0;
 await withApp({env,tabbataStore:store,documentExtractor:async()=>docs,guestReserve:async()=>({allowed:false,reason:"global_exhausted"}),reviewWithServFn:async()=>{reviewCalls++;throw Error("must not run");}},async url=>{
  const created=await post(url,"/api/tabbata/cases",input);assert.equal(created.status,201);
  const response=await post(url,"/api/tabbata/cases/"+id+"/analyze",{},token);
  assert.equal(response.status,429);
  assert.match((await response.json()).error,/total credit allowance/i);
  assert.equal(reviewCalls,0);
  assert.equal(store.rows.get(id).payload.analysis_status,"not_started");
 });
});
test("invalid case input is rejected before document extraction or credit reservation",async()=>{
 const store=fakeStore();let extraction=0,reserve=0;
 await withApp({env,tabbataStore:store,documentExtractor:async()=>{extraction++;return docs;},guestReserve:async()=>{reserve++;return {allowed:true};}},async url=>{
  const bad=await post(url,"/api/tabbata/cases",{...input,report_text:"too short"});
  assert.equal(bad.status,400);
  assert.equal(extraction,0);
  assert.equal(reserve,0);
 });
});
test("case creation is rate-limited per visitor without spending inference credits",async()=>{
 const store=fakeStore();let creates=0,reserves=0;
 const wrapped={...store,async create(payload){creates++;return store.create(payload);}};
 await withApp({env,tabbataStore:wrapped,documentExtractor:async()=>docs,guestReserve:async()=>{reserves++;return {allowed:true};}},async url=>{
  for(let index=0;index<5;index++){
   const response=await post(url,"/api/tabbata/cases",input);
   assert.equal(response.status,201);
  }
  const limited=await post(url,"/api/tabbata/cases",input);
  assert.equal(limited.status,429);
  assert.equal(creates,5);
  assert.equal(reserves,0);
 });
});

test("reviewer actions are recorded and case deletion removes the workspace",async()=>{
 const store=fakeStore();
 await withApp({env,tabbataStore:store,documentExtractor:async()=>docs,guestReserve:async()=>({allowed:true}),reviewWithServFn:async()=>({review,provider:{model:"test",completion_id:"c",latency_ms:1,usage:{}}})},async url=>{
  await post(url,"/api/tabbata/cases",input);
  await post(url,"/api/tabbata/cases/"+id+"/analyze",{},token);
  const action=await post(url,"/api/tabbata/cases/"+id+"/actions",{action:"request_clarification",note:"Please provide the Site C commissioning record."},token);
  assert.equal(action.status,200);
  assert.equal((await action.json()).reviewer_actions[0].action,"request_clarification");
  const missingNote=await post(url,"/api/tabbata/cases/"+id+"/actions",{action:"request_clarification",note:""},token);
  assert.equal(missingNote.status,400);
  const removed=await fetch(url+"/api/tabbata/cases/"+id,{method:"DELETE",headers:{"X-Case-Token":token}});
  assert.equal(removed.status,200);
  assert.equal(store.rows.has(id),false);
  const after=await fetch(url+"/api/tabbata/cases/"+id,{headers:{"X-Case-Token":token}});
  assert.equal(after.status,404);
 });
});
