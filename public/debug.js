(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const storageKey="tryserv-debug-progress-v1";
 let scenarios=[],current=null,completed=new Set(),lastCorrect=null,validated=null,servAllowed=false;
 try{
  const data=JSON.parse(localStorage.getItem(storageKey)??"[]");
  if(Array.isArray(data))completed=new Set(data.filter(x=>typeof x==="string"));
 }catch{}
 function el(parent,tag,content,cls){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  node.textContent=String(content??"");
  parent.appendChild(node);
  return node;
 }
 function clean(node){while(node.firstChild)node.removeChild(node.firstChild);}
 async function api(url,options){
  const response=await fetch(url,options);
  const data=await response.json().catch(()=>({error:"The server returned an unreadable response."}));
  if(!response.ok)throw new Error(data.error??"Request failed.");
  return data;
 }
 function repaint(){
  const valid=scenarios.filter(s=>completed.has(s.id)).length;
  $("progress").textContent=valid+" / "+scenarios.length+" repaired";
  $("fill").style.width=scenarios.length?(valid/scenarios.length*100)+"%":"0%";
  $("debug-complete").hidden=valid!==scenarios.length;
  const nav=$("cases");clean(nav);
  for(const item of scenarios){
   const button=el(nav,"button","","case-button"+
      (current?.id===item.id?" active":"")+
      (completed.has(item.id)?" done":""));
   button.type="button";
   el(button,"span",completed.has(item.id)?"✓":String(scenarios.indexOf(item)+1).padStart(2,"0"),"number");
   const box=el(button,"span");
   el(box,"strong",item.title);
   el(box,"small",item.category);
   button.addEventListener("click",()=>select(item.id));
  }
 }
 function select(id){
  const scenario=scenarios.find(s=>s.id===id);
  if(!scenario)return;
  current=scenario;lastCorrect=null;validated=null;
  $("serv-diagnostic").hidden=true;$("serv-ai-response").hidden=true;
  $("category").textContent=scenario.category.toUpperCase();
  $("count").textContent=(scenarios.indexOf(scenario)+1)+" OF "+scenarios.length;
  $("title").textContent=scenario.title;
  $("symptom").textContent=scenario.symptom;
  $("task").textContent=scenario.task;
  $("notes").textContent=scenario.notes;
  $("source").textContent=scenario.source.title+" ↗";
  $("source").href=scenario.source.url;
  reset();
  repaint();
 }
 function reset(){
  if(!current)return;
  $("editor").value=JSON.stringify(current.starter,null,2);
  $("result").hidden=true;$("solution").hidden=true;lastCorrect=null;validated=null;
  $("serv-diagnostic").hidden=true;$("serv-ai-response").hidden=true;
 }
 function diagnosticReady(data){
  validated=data;
  $("serv-diagnostic").hidden=false;
  $("serv-ai-response").hidden=true;
  $("serv-diagnostic-title").textContent=data.passed
    ?"Why does this request pass validation?"
    :"Understand why this request failed.";
  $("serv-explain").disabled=!servAllowed;
 }
 async function refreshServAllowance(){
  servAllowed=false;
  $("serv-explain").disabled=true;
  const info=$("serv-diagnostic-status");
  info.textContent="Checking SERV guest trial capacity…";
  try{
   const config=await api("/api/lessons");
   if(!config.public_tutor_enabled){
     info.textContent="Public SERV tutoring is unavailable. The free deterministic checker still works.";
     return;
   }
   const quota=await api("/api/tutor/allowance");
   servAllowed=quota.status==="available"&&Number(quota.remaining_today)>0&&Number(quota.remaining_total)>0;
   if(servAllowed){
     info.textContent="Optional live SERV available: "+quota.remaining_today+" question(s) today; "+
       quota.remaining_total+" in the shared trial. A click spends one reserved allowance.";
   }else if(quota.status==="daily_exhausted"){
     info.textContent="Today's SERV guest allowance is used. The checker remains free; try again tomorrow (UTC).";
   }else if(quota.status==="trial_exhausted"){
     info.textContent="The shared SERV trial is exhausted. Continue repairing requests for free.";
   }else{
     info.textContent="SERV trial capacity cannot be verified. Paid explanations stay disabled.";
   }
  }catch{
   info.textContent="SERV trial capacity could not be checked. No paid call will be made.";
  }finally{
   $("serv-explain").disabled=!servAllowed||!validated;
  }
 }
 function curatedDiagnosticQuestion(){
  if(!current||!validated)return "";
  // The learner's editable JSON is NEVER included in this request.
  // Only pre-authored scenario text and deterministic server field labels.
  const fields=(validated.problems??[]).map(x=>x.field).filter(x=>typeof x==="string").slice(0,5).join(", ");
  const prefix="In an OpenServ practice lab, "+(validated.passed?"the checked blueprint passed":"the checker reported "+(fields||"a request shape issue"))+". ";
  const instructions="Explain the underlying Chat Completions contract using the official lesson context. Give one concrete repair or verification step. This example was only validated, NOT executed.";
  return (prefix+"Example: "+current.title+". "+current.notes+" "+instructions).slice(0,400);
 }
 async function askServAboutIssue(){
  if(!current||!validated||!servAllowed)return;
  const caseId=current.id;
  const question=curatedDiagnosticQuestion();
  // Refresh the read-only allowance immediately before a possible paid call.
  await refreshServAllowance();
  if(!servAllowed||current?.id!==caseId)return;
  const button=$("serv-explain"),output=$("serv-ai-response");
  button.disabled=true;button.textContent="SERV is explaining…";
  output.hidden=false;output.className="serv-ai-response";
  output.textContent="Sending one optional, source-grounded request to SERV…";
  try{
   const data=await api("/api/mentor",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({lesson_id:"build",question})
   });
   if(current?.id!==caseId)return;
   clean(output);
   el(output,"strong","SERV EXPLANATION · LIVE RESPONSE");
   el(output,"p",data.explanation);
   el(output,"strong","TRY THIS NEXT");
   el(output,"p",data.next_action);
   const ref=data.reference;
   if(ref?.url?.startsWith("https://docs.openserv.ai/")){
     const a=el(output,"a",(ref.title||"OpenServ API reference")+" ↗");
     a.href=ref.url;a.target="_blank";a.rel="noopener noreferrer";
   }
   el(output,"small","Model: "+data.model+" · Completion: "+(data.completion_id??"not supplied")+
     " · Latency: "+(data.latency_ms??"unavailable")+" ms · Tokens: "+
     (data.usage?.input_tokens??"–")+" input / "+(data.usage?.output_tokens??"–")+" output"+
     " · AI explanations can be mistaken");
  }catch(error){
   if(current?.id===caseId){output.className="serv-ai-response error";output.textContent=
     "SERV could not provide an explanation: "+error.message+" Free request validation remains available.";}
  }finally{
   button.textContent="Ask SERV to explain this issue →";
   await refreshServAllowance();
  }
 }
 function showError(message,problems=[]){
  const panel=$("result");clean(panel);panel.hidden=false;panel.className="";
  el(panel,"strong",message);
  for(const problem of problems){
   const card=el(panel,"div","","error-row");
   el(card,"strong",(problem.field??"Request")+": "+(problem.message??""));
   el(card,"span",problem.hint??"");
  }
 }
 async function check(){
  if(!current)return;
  let parsed;
  try{parsed=JSON.parse($("editor").value);}
  catch(e){showError("This isn't valid JSON. Check brackets, commas and quotation marks before validating.");return;}
  const button=$("check");button.disabled=true;button.textContent="Checking…";
  try{
   const data=await api("/api/debug/check",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id:current.id,config:parsed})
   });
   diagnosticReady(data);
   if(!data.passed){
    lastCorrect=null;
    showError("The request still has "+data.problems.length+" issue"+(data.problems.length===1?"":"s")+".",data.problems);
    $("solution").hidden=true;
    return;
   }
   const panel=$("result");clean(panel);panel.hidden=false;panel.className="success";
   el(panel,"strong","Correct — this request blueprint passed validation.");
   el(panel,"p","The checker inspected its endpoint, model and required role messages. No SERV API call was made.");
   completed.add(current.id);
   try{localStorage.setItem(storageKey,JSON.stringify([...completed]));}catch{}
   repaint();
   $("solution").hidden=false;
   lastCorrect=data.request;
   $("solution-code").textContent=JSON.stringify(lastCorrect,null,2);
   $("next").textContent=scenarios.every(s=>completed.has(s.id))?"Return to learning studio →":"Next unfinished mission →";
  }catch(e){showError(e.message);}
  finally{button.disabled=false;button.textContent="Validate my fix →";}
 }
 async function copy(){
  if(!lastCorrect)return;
  try{
   await navigator.clipboard.writeText(JSON.stringify(lastCorrect,null,2));
   $("copy").textContent="Copied ✓";
  }catch{showError("Automatic copying was blocked. Select and copy the preview JSON manually.");}
 }
 function next(){
  const unfinished=scenarios.find(s=>!completed.has(s.id));
  if(unfinished)select(unfinished.id);
  else window.location.href="/learn";
 }
 async function start(){
  $("check").addEventListener("click",check);
  $("reset").addEventListener("click",reset);
  $("copy").addEventListener("click",copy);
  $("next").addEventListener("click",next);
  $("serv-explain").addEventListener("click",askServAboutIssue);
  try{
   const data=await api("/api/debug/scenarios");
   scenarios=data.scenarios??[];
   if(scenarios.length===0)throw Error("No practice scenarios are available.");
   // Retain only known IDs in browser progress, not arbitrary stored values.
   completed=new Set([...completed].filter(id=>scenarios.some(s=>s.id===id)));
   select(scenarios[0].id);
   void refreshServAllowance();
  }catch(e){
   $("title").textContent="The debugging lab could not load.";
   $("task").textContent=e.message;
   $("check").disabled=true;$("reset").disabled=true;
  }
 }
 start();
})();