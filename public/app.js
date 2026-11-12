import {loadProgress,award,pointsFor} from "./progress.mjs";

(() => {
 "use strict";
 const $=(id)=>document.getElementById(id);
 let lessons=[],current=null,chosen=null,requestJson="",curl="",tutorEnabled=false;
 const clear=(node)=>{while(node.firstChild)node.removeChild(node.firstChild);};
 const item=(parent,tag,text,cls)=>{
   const node=document.createElement(tag);
   if(cls)node.className=cls;
   node.textContent=String(text??"");
   parent.appendChild(node);return node;
 };
 const storageKey="tryserv-progress-v1";
 let done=new Set();
 try{done=new Set(loadProgress(localStorage.getItem(storageKey)));}
 catch{done=new Set();}
 async function api(url,options){
   const response=await fetch(url,options);
   let payload;
   try{payload=await response.json();}catch{throw new Error("The server returned an unreadable response.");}
   if(!response.ok)throw new Error(payload.error??"Request unsuccessful.");
   return payload;
 }
 function updateProgress(){
   const count=lessons.filter(x=>done.has(x.id)).length;
   $("progress-count").textContent=count+" of "+lessons.length;
   $("progress-fill").style.width=lessons.length?(count*100/lessons.length)+"%":"0%";
   $("progress-track").setAttribute("aria-valuenow",String(count));
   $("xp-count").textContent=pointsFor([...done])+" XP";
   const hasProgress=count>0;
   $("resume").hidden=!hasProgress;
   $("resume-hint").hidden=!hasProgress;
   $("start-fresh").textContent=hasProgress?"Review from the beginning →":"I'm new — start learning →";
   const host=$("lesson-nav");clear(host);
   for(const lesson of lessons){
     const button=item(host,"button","","nav-lesson"+(current===lesson.id?" active":"")+(done.has(lesson.id)?" complete":""));
     button.type="button";
     item(button,"span",done.has(lesson.id)?"✓":lesson.number,"nav-number");
     const inner=item(button,"span","","nav-copy");
     item(inner,"strong",lesson.category);
     item(inner,"small",lesson.title);
     button.addEventListener("click",()=>openLesson(lesson.id));
   }
 }
 function notify(message,success=false){
   const host=$("feedback");
   host.hidden=!message;
   host.className="feedback "+(success?"success":"error");
   host.textContent=message;
 }
 function resetExercise(){
   chosen=null;notify("");$("help-action").hidden=true;$("next").hidden=true;$("request-preview").hidden=true;$("live-try-panel").hidden=true;$("try-result").hidden=true;
   $("check").disabled=false;$("check").textContent="Check my answer →";
 }
 function showChoices(lesson){
   const host=$("answers");clear(host);
   $("builder").hidden=lesson.id!=="build";
   host.hidden=lesson.id==="build";
   if(lesson.id==="build"){
      $("system").value=$("system").value||"You are a careful technical assistant. Explain decisions and say when information is missing.";
      $("user-task").value=$("user-task").value||"When is SERV Reasoning useful, and when should I use plain code?";
      return;
   }
   for(const option of lesson.choices??[]){
     const btn=item(host,"button",option.text,"choice");
     btn.type="button";btn.setAttribute("aria-pressed","false");
     btn.addEventListener("click",()=>{
       chosen=option.id;
       for(const b of host.children){
         const selected=b===btn;
         b.classList.toggle("picked",selected);
         b.setAttribute("aria-pressed",String(selected));
       }
       notify("");$("help-action").hidden=true;
     });
   }
 }
 function openLesson(id){
   const lesson=lessons.find(l=>l.id===id);
   if(!lesson)return;
   current=id;
   $("intro").hidden=true;$("learning").hidden=false;
   $("current-crumb").textContent="LESSON "+lesson.number;
   $("lesson-meta").textContent="LESSON "+lesson.number+" · "+lesson.category.toUpperCase();
   $("lesson-time").textContent=lesson.minutes+" MIN";
   $("lesson-title").textContent=lesson.title;
   $("lesson-summary").textContent=lesson.summary;
   $("lesson-takeaway").textContent=lesson.takeaway;
   $("lesson-detail").textContent=lesson.detail;
   $("lesson-source").textContent=lesson.source.title+" ↗";
   $("lesson-source").href=lesson.source.url;
   $("challenge").textContent=lesson.challenge;
   $("mentor-topic").textContent=lesson.title;
   $("mentor-response").hidden=true;
   resetExercise();showChoices(lesson);updateProgress();
   window.scrollTo({top:0,behavior:"smooth"});
 }
 function complete(){
   const result=award([...done],current);
   done=new Set(result.completed);
   try{localStorage.setItem(storageKey,JSON.stringify(result.completed));}catch{}
   updateProgress();
   $("next").hidden=false;
   const ix=lessons.findIndex(l=>l.id===current);
   $("next").textContent=ix===lessons.length-1?"Return to overview →":"Continue to next lesson →";
 }
 function showRequest(data){
   requestJson=JSON.stringify(data.request,null,2);
   curl=data.curl;
   $("json-preview").textContent=requestJson;
   $("curl-preview").textContent=curl;
   $("request-preview").hidden=false;
   $("live-try-panel").hidden=!tutorEnabled;
   $("try-result").hidden=true;
 }
 async function check(){
   if(!current)return;
   const selected=current==="build"
     ?{model:$("model").value,system:$("system").value,user:$("user-task").value}
     :chosen;
   if(!selected)return notify("Choose an answer first.");
   $("check").disabled=true;
   try{
     const data=await api("/api/check",{
       method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({lesson_id:current,answer:selected})
     });
     if(data.passed){
       const alreadyEarned=done.has(current);
       notify("Correct. "+data.feedback+(alreadyEarned?" · You've already earned XP for this lesson.":" · +20 XP earned!"),true);
       complete();
       if(data.request)showRequest(data);
     }else{
       notify(data.feedback+(data.hint?" Hint: "+data.hint:""),false);
       $("help-action").hidden=!tutorEnabled;
     }
   }catch(error){notify(error.message);}
   finally{$("check").disabled=false;}
 }
 function next(){
   const index=lessons.findIndex(l=>l.id===current);
   if(index<lessons.length-1)openLesson(lessons[index+1].id);
   else overview();
 }
 function resumeLearning(){
   const remaining=lessons.find(l=>!done.has(l.id));
   openLesson((remaining??lessons[lessons.length-1])?.id??"ecosystem");
 }
 function resetProgress(){
   if(!window.confirm("Reset completed lessons and XP saved on this browser?"))return;
   done=new Set();
   try{localStorage.removeItem(storageKey);}catch{}
   overview();
 }
 function overview(){
   current=null;$("intro").hidden=false;$("learning").hidden=true;
   $("current-crumb").textContent="OVERVIEW";
   $("mentor-topic").textContent="Getting started";
   $("mentor-response").hidden=true;
   updateProgress();window.scrollTo({top:0,behavior:"smooth"});
 }
 async function copy(text,button){
   try{
     await navigator.clipboard.writeText(text);
     const old=button.textContent;button.textContent="Copied ✓";
     setTimeout(()=>button.textContent=old,1600);
   }catch{notify("Couldn't copy automatically. Select the code and copy it manually.");}
 }
 function prepareTutorQuestion(){
   if(!tutorEnabled || !current)return;
   const lesson=lessons.find(l=>l.id===current);
   if(!lesson)return;
   const option=(lesson.choices??[]).find(o=>o.id===chosen);
   const situation=current==="build"
     ?"I am building a Chat Completions request and my fields failed validation."
     :option
       ?"For this question: "+lesson.challenge+" I chose: "+option.text+"."
       :"I have not understood this lesson's exercise.";
   const question=("In the "+lesson.title+" lesson, "+situation+
     " Explain my misconception and give a practical hint, but do not reveal the correct answer.")
     .slice(0,400);
   $("mentor-question").value=question;
   $("tutor-panel").scrollIntoView({behavior:"smooth",block:"nearest"});
   $("mentor-question").focus({preventScroll:true});
   mentorMessage("Your question is ready. Live SERV tutoring uses the private demo access code during testing; no request has been sent yet.");
 }
 async function runLiveRequest(){
   const code=$("try-access").value;
   if(!code){$("try-result").hidden=false;$("try-result").className="live-result error";$("try-result").textContent="Enter your private demo access code. Do not enter your SERV API key.";return;}
   if(!requestJson)return;
   const request=JSON.parse(requestJson);
   const input={
     model:request.model,
     system:request.messages[0].content,
     user:request.messages[1].content
   };
   const button=$("run-serv"),host=$("try-result");
   button.disabled=true;
   button.textContent="Requesting SERV…";
   host.hidden=false;host.className="live-result";host.textContent="Sending a real request to OpenServ…";
   try{
     const data=await api("/api/try-serv",{
       method:"POST",
       headers:{"Content-Type":"application/json","X-Learn-Access-Token":code},
       body:JSON.stringify({request:input})
     });
     clear(host);
     item(host,"strong","LIVE SERV RESPONSE · "+data.status.toUpperCase());
     item(host,"p",data.response);
     item(host,"small","Model: "+data.model+" · Completion: "+(data.completion_id??"not supplied")+
       " · Latency: "+(data.latency_ms??"unavailable")+" ms"+
       " · Tokens: "+((data.usage?.input_tokens??"–")+" input / "+(data.usage?.output_tokens??"–")+" output"));
     host.className="live-result success";
   }catch(error){host.className="live-result error";host.textContent=error.message;}
   finally{button.disabled=false;button.textContent="Run this request with SERV ↗";}
 }
 async function askTutor(){
   const question=$("mentor-question").value.trim();
   if(question.length<8)return mentorMessage("Enter a specific question of at least eight characters.",true);
   const code=$("mentor-access").value;
   if(!code)return mentorMessage("Enter the private demo access code. Free practice does not require it.",true);
   const button=$("ask-mentor");
   button.disabled=true;button.textContent="Thinking through your question…";
   mentorMessage("Requesting a real SERV explanation. It may take a moment.");
   try{
     const result=await api("/api/mentor",{
       method:"POST",
       headers:{"Content-Type":"application/json","X-Learn-Access-Token":code},
       body:JSON.stringify({lesson_id:current??lessons[0]?.id,question})
     });
     const host=$("mentor-response");clear(host);
     item(host,"strong","SERV TUTOR · LIVE RESPONSE");
     item(host,"p",result.explanation);
     item(host,"strong","TRY NEXT");
     item(host,"p",result.next_action);
     const link=item(host,"a",result.reference.title+" ↗");
     link.href=result.reference.url;link.target="_blank";link.rel="noopener noreferrer";
     item(host,"small","Model: "+result.model+" · Completion: "+(result.completion_id??"not supplied")+
       " · Latency: "+(result.latency_ms??"unavailable")+" ms"+
       " · Tokens: "+((result.usage?.input_tokens??"–")+" input / "+(result.usage?.output_tokens??"–")+" output")+
       " · Not independently fact-checked");
     host.hidden=false;host.className="mentor-response";
   }catch(error){mentorMessage(error.message,true);}
   finally{button.disabled=false;button.textContent="Ask SERV tutor ↗";}
 }
 function mentorMessage(message,failed=false){
   const host=$("mentor-response");host.hidden=false;host.textContent=message;
   host.className="mentor-response"+(failed?" error":"");
 }
 async function init(){
   $("start-fresh").addEventListener("click",()=>openLesson("ecosystem"));
   $("resume").addEventListener("click",resumeLearning);
   $("reset-progress").addEventListener("click",resetProgress);
   $("jump-build").addEventListener("click",()=>openLesson("build"));
   $("check").addEventListener("click",check);
   $("next").addEventListener("click",next);
   $("ask-mentor").addEventListener("click",askTutor);
   $("run-serv").addEventListener("click",runLiveRequest);
   $("ask-about-answer").addEventListener("click",prepareTutorQuestion);
   $("copy-json").addEventListener("click",()=>copy(requestJson,$("copy-json")));
   $("copy-curl").addEventListener("click",()=>copy(curl,$("copy-curl")));
   try{
     const data=await api("/api/lessons");
     lessons=data.lessons;tutorEnabled=Boolean(data.tutor_enabled);
     updateProgress();
     if(window.location.pathname==="/try")openLesson("build");
     $("mentor-gate").textContent=tutorEnabled
       ?"SERV tutoring is in private testing. Use the demo access code (not your SERV API key) to authorize a live call."
       :"Guided lessons work now. The live SERV tutor will be enabled when its secure server credentials are configured.";
     $("mentor-access").hidden=!tutorEnabled;
     $("mentor-access-label").hidden=!tutorEnabled;
     $("ask-mentor").disabled=!tutorEnabled;
   }catch(error){
     $("mentor-gate").textContent="Learning content is temporarily unavailable: "+error.message;
     $("start-fresh").disabled=true;$("jump-build").disabled=true;
   }
 }
 init();
})();
