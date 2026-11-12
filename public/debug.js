(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const storageKey="tryserv-debug-progress-v1";
 let scenarios=[],current=null,completed=new Set(),lastCorrect=null;
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
  current=scenario;lastCorrect=null;
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
  $("result").hidden=true;$("solution").hidden=true;lastCorrect=null;
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
   if(!data.passed){
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
   $("next").textContent=scenarios.every(s=>completed.has(s.id))?"See your learning summary →":"Next unfinished mission →";
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
  try{
   const data=await api("/api/debug/scenarios");
   scenarios=data.scenarios??[];
   if(scenarios.length===0)throw Error("No practice scenarios are available.");
   // Retain only known IDs in browser progress, not arbitrary stored values.
   completed=new Set([...completed].filter(id=>scenarios.some(s=>s.id===id)));
   select(scenarios[0].id);
  }catch(e){
   $("title").textContent="The debugging lab could not load.";
   $("task").textContent=e.message;
   $("check").disabled=true;$("reset").disabled=true;
  }
 }
 start();
})();