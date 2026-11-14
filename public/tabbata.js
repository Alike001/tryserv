const $=id=>document.getElementById(id);
const SESSION_KEY="tabbata.active-case.v1";
const MAX_FILE=2*1024*1024,MAX_TOTAL=8*1024*1024,MAX_FILES=5;
let sampleFiles=null,activeCase=null,activePayload=null,activeExpiresAt=null,servConfigured=false,storageConfigured=false;

const samplePack={
 project_name:"Community Water Access Project",
 funder:"Community Development Fund",
 reporting_period:"Q3 2026",
 currency:"NGN",
 approved_budget:"5000000",
 reported_spend:"4500000",
 requirements:[
  "Report progress against all three approved water-facility milestones.",
  "Provide the number of households reached and supporting distribution records.",
  "Reconcile reported expenditure against the approved budget and supporting schedule.",
  "Explain delays and the mitigation actions taken during the reporting period."
 ].join("\n"),
 report_text:"During Q3 2026, the Community Water Access Project completed and commissioned all three planned water facilities. The facilities now serve 500 households across the three target communities. The programme spent NGN 4,500,000 against an approved budget of NGN 5,000,000. All planned activities were delivered on schedule and no material delays were recorded. The project team completed community engagement and distributed water access information to all target households."
};
const sampleEvidence=[
 {name:"site-status.csv",type:"text/csv",content:"Site,Status,Last update,Note\nSite A,Completed,2026-08-02,Commissioning record filed\nSite B,Completed,2026-08-16,Commissioning record filed\nSite C,Testing pending,2026-09-28,Water quality testing not complete"},
 {name:"household-register.csv",type:"text/csv",content:"Community,Households reached,Distribution date\nCommunity A,150,2026-08-12\nCommunity B,140,2026-08-20\nCommunity C,130,2026-09-10"},
 {name:"expense-schedule.csv",type:"text/csv",content:"Date,Category,Description,Amount NGN,Receipt reference\n2026-07-14,Materials,Pipes and fittings,1500000,REC-001\n2026-08-02,Construction,Site works and labour,1200000,REC-002\n2026-09-03,Testing,Water quality and distribution,1800000,REC-003"},
 {name:"field-notes.txt",type:"text/plain",content:"Field notes — 28 September 2026\nSite C: commissioning visit deferred pending water quality testing. The team expects a follow-up inspection after test results are received.\nCommunity reach register currently contains 420 household entries across the three target communities."}
];
const previewData=[
 {status:"PARTIALLY SUPPORTED · SAMPLE",kind:"warning",title:"Three water facilities completed",body:"The report states that all three sites were commissioned. The supplied site log records two as completed and one as still undergoing testing.",source:"SUPPORTING DOCUMENT · site-status.csv · ROW 4",quote:"Site C — Testing pending — 2026-09-28 — Water quality testing not complete",action:"Request the completion or commissioning record for Site C."},
 {status:"PARTIALLY SUPPORTED · SAMPLE",kind:"warning",title:"500 households reached",body:"The report claims 500 households. The supplied household register lists 150, 140 and 130 households, totalling 420 entries.",source:"SUPPORTING DOCUMENT · household-register.csv · ROWS 2–4",quote:"150 + 140 + 130 = 420 household entries in the supplied register.",action:"Reconcile the 80-household difference and attach the missing distribution records."},
 {status:"WITHIN BUDGET · RULE-BASED SAMPLE",kind:"rule",title:"NGN 4,500,000 reported expenditure",body:"The entered reported expenditure is NGN 500,000 below the entered approved budget. This is arithmetic only; it does not establish that expenses are eligible or supported.",source:"REVIEW INPUT · approved budget and reported expenditure",quote:"NGN 5,000,000 approved budget − NGN 4,500,000 reported spend = NGN 500,000 remaining.",action:"Compare each expense line with the funder-approved budget and retain the supporting receipts."}
];
function toast(message){const el=$("toast");el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4200);}
function formStatus(message,type="info"){const el=$("form-status");el.textContent=message;el.className="form-status "+type;el.hidden=false;}
function analysisStatus(message,type="info"){const el=$("analysis-status");el.textContent=message;el.className="analysis-status "+type;el.hidden=false;}
function preview(index){
 const item=previewData[index];const root=$("preview-detail");root.replaceChildren();
 const badge=document.createElement("span");badge.className="preview-status status-"+item.kind;badge.textContent=item.status;root.append(badge);
 const title=document.createElement("h3");title.textContent=item.title;root.append(title);
 const body=document.createElement("p");body.textContent=item.body;root.append(body);
 const quote=document.createElement("div");quote.className="source-quote";
 const source=document.createElement("span");source.textContent=item.source;quote.append(source);
 const block=document.createElement("blockquote");block.textContent=item.quote;quote.append(block);root.append(quote);
 const action=document.createElement("div");action.className="preview-action";
 const label=document.createElement("b");label.textContent="Suggested next step";action.append(label);
 const detail=document.createElement("span");detail.textContent=item.action;action.append(detail);root.append(action);
 document.querySelectorAll("[data-preview]").forEach(button=>button.setAttribute("aria-pressed",String(Number(button.dataset.preview)===index)));
}
function displayFiles(){
 const list=$("file-list");list.replaceChildren();
 const reportFile=$("report-file").files?.[0]??null;
 const files=sampleFiles??Array.from($("evidence-files").files??[]);
 const entries=[...(reportFile?[{file:reportFile,label:"Narrative report"}]:[]),...files.map(file=>({file,label:"Supporting evidence"}))];
 if(!entries.length){const empty=document.createElement("span");empty.className="file-empty";empty.textContent="No files added yet.";list.append(empty);return;}
 for(const entry of entries){
  const file=entry.file;
  const row=document.createElement("div");row.className="file-item";
  const name=document.createElement("b");name.textContent=entry.label+": "+file.name;row.append(name);
  const size=document.createElement("span");size.textContent=(file.size??new TextEncoder().encode(file.content??"").length).toLocaleString()+" bytes";row.append(size);
  list.append(row);
 }
}
function loadSample(){
 Object.entries(samplePack).forEach(([key,value])=>{
  const map={project_name:"project-name",funder:"funder",reporting_period:"reporting-period",currency:"currency",approved_budget:"approved-budget",reported_spend:"reported-spend",requirements:"requirements",report_text:"report-text"};
  $(map[key]).value=value;
 });
 sampleFiles=sampleEvidence.map(file=>({...file,size:new TextEncoder().encode(file.content).length}));
 $("report-file").value="";$("evidence-files").value="";
 displayFiles();
 formStatus("Fictional sample loaded. Review the details, then create a workspace. No SERV request has been made.","success");
 $("review").scrollIntoView({behavior:"smooth",block:"start"});
}
function bytesToBase64(bytes){
 let binary="";for(let offset=0;offset<bytes.length;offset+=0x8000)binary+=String.fromCharCode(...bytes.subarray(offset,offset+0x8000));
 return btoa(binary);
}
async function filePayload(file){
 const bytes=file.content!==undefined?new TextEncoder().encode(file.content):new Uint8Array(await file.arrayBuffer());
 return {name:file.name,type:file.type??"",data_base64:bytesToBase64(bytes)};
}
function sessionFor(id,token){activeCase={id,token};sessionStorage.setItem(SESSION_KEY,JSON.stringify(activeCase));}
function clearSession(){activeCase=null;activePayload=null;activeExpiresAt=null;sessionStorage.removeItem(SESSION_KEY);}
function formatMoney(minor,currency){
 if(minor===null||minor===undefined)return "Not supplied";
 return new Intl.NumberFormat("en-NG",{style:"currency",currency,maximumFractionDigits:2}).format(minor/100);
}
function addText(parent,tag,className,value){
 const node=document.createElement(tag);if(className)node.className=className;node.textContent=value;parent.append(node);return node;
}
function renderBudget(check){
 const box=$("budget-check");box.replaceChildren();
 if(!check){addText(box,"p","","Enter both budget totals to run a deterministic comparison.");return;}
 if(check.status==="incomplete_inputs"){addText(box,"p","budget-details",check.message);return;}
 addText(box,"div","budget-result "+(check.status==="over_budget"?"over":"within"),check.status==="over_budget"?"Above approved budget":"Within entered budget");
 addText(box,"div","budget-details","Approved: "+formatMoney(check.approved_minor,check.currency));
 addText(box,"div","budget-details","Reported: "+formatMoney(check.reported_minor,check.currency));
 addText(box,"div","budget-details","Variance: "+formatMoney(Math.abs(check.variance_minor),check.currency)+(check.variance_minor>0?" over":check.variance_minor<0?" under":" exactly"));
 addText(box,"div","budget-details",check.note);
}
function statusLabel(status){
 return ({
  supported_in_documents:["Supported in submitted documents","supported"],
  partially_supported:["Partially supported","partial"],
  not_found_in_submitted_documents:["Not found in submitted documents","missing"],
  conflicting_documents:["Conflicting documents","conflict"],
  human_review_required:["Human review required","human"]
 })[status]??["Human review required","human"];
}
function renderDocuments(payload){
 const list=$("case-documents");list.replaceChildren();
 const allDocs=[...(payload.report_document?[{...payload.report_document,display_name:"Narrative report"}]:[]),...(payload.documents??[]).map(doc=>({...doc,display_name:"Supporting evidence"}))];
 for(const doc of allDocs){
  const row=addText(list,"div","case-doc",(doc.display_name?doc.display_name+": ":"")+doc.name);
  row.title=doc.extracted_chars+" extracted characters"+(doc.truncated?" · text limit reached":"");
 }
}
function renderActions(actions=[]){
 const list=$("reviewer-action-list");list.replaceChildren();
 for(const action of actions){
  const label=({mark_reviewed:"Findings marked reviewed",request_clarification:"Clarification requested",acknowledge_finding:"Finding acknowledged",dismiss_finding:"Finding dismissed"})[action.action]??action.action;
  const row=addText(list,"div","action-item",label+(action.note?" — "+action.note:""));
 }
}
function renderReview(review,provider){
 $("review-results").hidden=false;
 $("review-summary").textContent=review.summary;
 const meta=$("review-provider");meta.textContent="SERV model: "+(provider?.model??"unknown")+" · "+(provider?.latency_ms??"—")+" ms · completion "+(provider?.completion_id??"not returned")+" · usage "+(provider?.usage?.input_tokens??"—")+"/"+(provider?.usage?.output_tokens??"—")+" tokens";
 const findings=$("review-findings");findings.replaceChildren();
 $("finding-count").textContent=review.findings.length+" findings";
 for(const finding of review.findings){
  const card=document.createElement("article");card.className="finding-card";
  const head=document.createElement("div");head.className="finding-head";
  const [label,kind]=statusLabel(finding.status);
  addText(head,"span","finding-status "+kind,label);
  addText(head,"span","finding-severity",finding.severity+" priority");
  card.append(head);
  addText(card,"h4","",finding.claim);
  addText(card,"p","",finding.explanation);
  if(finding.requirement_id)addText(card,"div","finding-requirement","Requirement "+finding.requirement_id);
  if(finding.evidence_refs?.length){
   const evidence=document.createElement("div");evidence.className="evidence-list";
   for(const ref of finding.evidence_refs){
    const item=document.createElement("div");item.className="evidence-ref";
    addText(item,"span","",ref.document_name+" · "+ref.locator);
    addText(item,"blockquote","",ref.quote);evidence.append(item);
   }
   card.append(evidence);
  }else addText(card,"div","finding-requirement","No supporting quotation passed the source check.");
  if(finding.missing_items?.length)addText(card,"p","finding-next","Missing or unclear: "+finding.missing_items.join("; "));
  if(finding.suggested_question)addText(card,"p","finding-next","Suggested question: "+finding.suggested_question);
  findings.append(card);
 }
 const limits=$("review-limitations");limits.replaceChildren();
 for(const limitation of review.limitations??[])addText(limits,"li","",limitation);
 $("analysis-cta").hidden=true;
 $("analysis-status").hidden=true;
}
function renderCase(payload,expiresAt){
 activePayload=payload;activeExpiresAt=expiresAt??activeExpiresAt;
 $("case-workspace").hidden=false;
 $("workspace-title").textContent=payload.project.name;
 $("workspace-meta").textContent=[payload.project.funder,payload.project.reporting_period,payload.project.currency].filter(Boolean).join(" · ");
 renderDocuments(payload);renderBudget(payload.budget_check);
 const status=$("case-status");
 status.textContent=payload.analysis_status==="complete"?"Review complete":payload.analysis_status==="failed"?"Analysis attempt used":"Ready to analyze";
 $("case-expiry").textContent=expiresAt?"Expires "+new Date(expiresAt).toLocaleString():"This workspace expires within 24 hours.";
 $("analysis-cta").hidden=Boolean(payload.review)||payload.analysis_status==="failed";
 if(!servConfigured){$("analyze-case").disabled=true;analysisStatus("SERV review is not configured. You can still inspect, print and delete this workspace.","error");}else{$("analyze-case").disabled=false;}
 if(payload.analysis_status==="failed"){analysisStatus(payload.analysis_error??"The analysis attempt could not be completed. No automatic retry was made.","error");}
 else if(payload.review){renderReview(payload.review,payload.provider);renderActions(payload.reviewer_actions);}
 else if(payload.analysis_status==="running"){analysisStatus("A SERV review is already running for this case.","info");}
 else{$("review-results").hidden=true;$("analysis-status").hidden=true;}
 $("case-workspace").scrollIntoView({behavior:"smooth",block:"start"});
}
async function createWorkspace(event){
 event.preventDefault();
 if(!storageConfigured){formStatus("Secure review storage is not configured on the server yet. The form has not been sent.","error");return;}
 const reportFile=$("report-file").files?.[0]??null;
 const supportFiles=sampleFiles??Array.from($("evidence-files").files??[]);
 const files=[...(reportFile?[reportFile]:[]),...supportFiles];
 if(supportFiles.length<1||files.length>MAX_FILES){formStatus("Add at least one supporting document and no more than 5 files total, including the report.","error");return;}
 const total=files.reduce((sum,file)=>sum+(file.size??new TextEncoder().encode(file.content??"").length),0);
 if(files.some(file=>(file.size??new TextEncoder().encode(file.content??"").length)>MAX_FILE)||total>MAX_TOTAL){formStatus("Files exceed the 2 MiB per-file or 8 MiB combined limit.","error");return;}
 if(!reportFile&&$("report-text").value.trim().length<80){formStatus("Paste at least 80 characters of narrative report, or upload the report file above.","error");$("report-text").focus();return;}
 const button=$("create-case");button.disabled=true;button.textContent="Preparing documents…";
 try{
  const encoded=[];for(const file of supportFiles)encoded.push(await filePayload(file));
  const body={
   project_name:$("project-name").value,funder:$("funder").value,
   reporting_period:$("reporting-period").value,currency:$("currency").value,
   approved_budget:$("approved-budget").value,reported_spend:$("reported-spend").value,
   requirements:$("requirements").value,report_text:$("report-text").value,files:encoded
  };
  if(reportFile)body.report_file=await filePayload(reportFile);
  button.textContent="Creating workspace…";
  const response=await fetch("/api/tabbata/cases",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error??"Could not create the review workspace.");
  sessionFor(result.case_id,result.case_token);
  renderCase(result.review_case,result.expires_at);
  formStatus("Workspace created. No SERV inference has been made yet. Review the extracted files, then choose whether to analyze.","success");
  toast("Your private review workspace is ready.");
 }catch(error){formStatus(error.message||"Could not create the review workspace.","error");}
 finally{button.disabled=false;button.innerHTML='Create review workspace <span aria-hidden="true">→</span>';}
}
async function analyzeCase(){
 if(!activeCase)return;
 const button=$("analyze-case");button.disabled=true;button.textContent="Analyzing with SERV…";
 analysisStatus("A single SERV Reasoning request is being made. The existing shared guest allowance is reserved first.","info");
 try{
  const response=await fetch("/api/tabbata/cases/"+activeCase.id+"/analyze",{method:"POST",headers:{"X-Case-Token":activeCase.token}});
  const result=await response.json();
  if(!response.ok){const error=new Error(result.error??"SERV review failed.");error.httpStatus=response.status;throw error;}
  activePayload.review=result.review;activePayload.provider=result.provider;activePayload.analysis_status="complete";
  activePayload.budget_check=result.budget_check;
  renderCase(activePayload,activeExpiresAt);
  toast("SERV review completed. Inspect each source-linked finding.");
 }catch(error){analysisStatus(error.message||"SERV review failed.","error");const status=error.httpStatus??0;if(status===502||status===409){button.disabled=true;button.textContent="Analysis attempt used";}else{button.disabled=false;button.textContent="Analyze with SERV";}return;}
 button.disabled=false;button.textContent="Analyze with SERV";
}
async function recordAction(action){
 if(!activeCase)return;
 const note=$("review-note").value.trim();
 if(action==="request_clarification"&&!note){toast("Add a short clarification request first.");$("review-note").focus();return;}
 const response=await fetch("/api/tabbata/cases/"+activeCase.id+"/actions",{method:"POST",headers:{"Content-Type":"application/json","X-Case-Token":activeCase.token},body:JSON.stringify({action,note})});
 const result=await response.json();
 if(!response.ok){toast(result.error??"Could not save reviewer action.");return;}
 activePayload.reviewer_actions=result.reviewer_actions;renderActions(result.reviewer_actions);$("review-note").value="";
 toast("Reviewer action recorded.");
}
async function deleteCase(){
 if(!activeCase)return;
 if(!confirm("Delete this review workspace and its extracted document text? This cannot be undone."))return;
 const response=await fetch("/api/tabbata/cases/"+activeCase.id,{method:"DELETE",headers:{"X-Case-Token":activeCase.token}});
 const result=await response.json();
 if(!response.ok){toast(result.error??"Could not delete the case.");return;}
 clearSession();$("case-workspace").hidden=true;$("review-results").hidden=true;toast("Review workspace deleted.");
}
async function restoreCase(){
 let saved;try{saved=JSON.parse(sessionStorage.getItem(SESSION_KEY)??"null");}catch{return;}
 if(!saved?.id||!saved?.token)return;
 activeCase=saved;
 try{
  const response=await fetch("/api/tabbata/cases/"+saved.id,{headers:{"X-Case-Token":saved.token}});
  const result=await response.json();
  if(!response.ok){clearSession();return;}
  renderCase(result.review_case,result.expires_at);
 }catch{analysisStatus("Could not reconnect to your saved review workspace.","error");}
}
async function loadStatus(){
 try{
  const response=await fetch("/api/tabbata/status");const status=await response.json();
  storageConfigured=status.storage_configured===true;
  servConfigured=status.serv_configured===true;
  if(!storageConfigured)formStatus("Secure review storage is not configured. Case creation is disabled until the existing database connection is available.","error");
 }catch{storageConfigured=false;servConfigured=false;formStatus("Could not check workspace availability. Try again in a moment.","error");}
}
document.addEventListener("DOMContentLoaded",async()=>{
 document.querySelectorAll("[data-preview]").forEach(button=>button.addEventListener("click",()=>preview(Number(button.dataset.preview))));
 $("load-sample").addEventListener("click",loadSample);
 $("load-sample-top").addEventListener("click",loadSample);
 $("evidence-files").addEventListener("change",()=>{sampleFiles=null;displayFiles();});
 $("report-file").addEventListener("change",displayFiles);
 $("case-form").addEventListener("submit",createWorkspace);
 $("analyze-case").addEventListener("click",analyzeCase);
 $("print-report").addEventListener("click",()=>window.print());
 $("delete-case").addEventListener("click",deleteCase);
 $("mark-reviewed").addEventListener("click",()=>recordAction("mark_reviewed"));
 $("request-clarification").addEventListener("click",()=>recordAction("request_clarification"));
 preview(0);displayFiles();await loadStatus();await restoreCase();
});
