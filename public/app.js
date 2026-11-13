import {loadProgress,award,pointsFor,summaryProgress} from "./progress.mjs";

(() => {
 "use strict";
 const $=(id)=>document.getElementById(id);
 let lessons=[],current=null,chosen=null,requestJson="",curl="",tutorEnabled=false,publicTutorEnabled=false;
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
   let debugCompleted=[];
   try{
     const stored=JSON.parse(localStorage.getItem("tryserv-debug-progress-v1")??"[]");
     if(Array.isArray(stored))debugCompleted=stored;
   }catch{}
   const journey=summaryProgress([...done],debugCompleted);
   $("completion-panel").hidden=!journey.learningPathComplete;
   $("practice-progress").textContent=journey.practiceComplete
     ?"Debugging practice completed: 3 of 3 repairs on this browser."
     :"Debugging practice: "+journey.repairsCompleted+" of 3 repairs completed on this browser.";
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
 function setLessonStage(stage){
   const labels={read:"Understand the idea",check:"Check your understanding",apply:"Ready to move forward"};
   const stages=["read","check","apply"];
   $("lesson-state").textContent=labels[stage]??labels.read;
   const step=Math.max(1,stages.indexOf(stage)+1);
   $("lesson-journey-track").setAttribute("aria-valuenow",String(step));
   $("lesson-journey-fill").style.width=(step/3*100)+"%";
   for(const item of document.querySelectorAll(".lesson-stages .stage")){
     const index=stages.indexOf(item.dataset.stage);
     const active=stages.indexOf(stage);
     item.classList.toggle("active",index===active);
     item.classList.toggle("complete",index<active);
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
       notify("");$("help-action").hidden=true;setLessonStage("check");
     });
   }
 }
 const lessonConcepts={
   ecosystem:{
     nodes:[["Task","A user requests work"],["Workflow","Coordinates tasks and agents"],["Agent","Performs an assigned task"]],
     note:"Simplified example: a workflow may coordinate agent tasks. This is not a live workflow trace."
   },
   understand:{
     nodes:[["Application","Prepares the request"],["SERV API","Provides a reasoning response"],["Your code","Reviews and uses the result"]],
     note:"SERV Reasoning fits an application through the Chat Completions API. Your application still checks what comes back."
   },
   decide:{
     nodes:[["Facts","Dates, numbers and evidence"],["Exact code","Enforces known rules"],["SERV","Explains ambiguous choices"]],
     note:"Keep arithmetic and hard limits deterministic. Consider reasoning for ambiguous interpretation, then verify its output."
   },
   build:{
     nodes:[["System","Set instructions and limits"],["User","State the task clearly"],["Preview","Check the request shape"]],
     note:"A supported model, system instruction and user task form the blueprint. A valid preview is NOT an executed API request."
   }
 };
 function showLessonConcept(id){
   const scene=lessonConcepts[id];
   if(!scene)return;
   for(const [index,prefix] of ["a","b","c"].entries()){
     $("concept-"+prefix+"-title").textContent=scene.nodes[index][0];
     $("concept-"+prefix+"-detail").textContent=scene.nodes[index][1];
   }
   $("lesson-concept-summary").textContent=scene.note;
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
   const outcomes={
     ecosystem:"Choose the right OpenServ building block for a practical task.",
     understand:"Understand how SERV Reasoning fits an existing application.",
     decide:"Distinguish exact code checks from decisions that benefit from reasoning.",
     build:"Produce a validated SERV API request you can copy and use."
   };
   $("lesson-outcome").textContent="YOUR GOAL  ·  "+(outcomes[id]??lesson.summary);
   $("lesson-takeaway").textContent=lesson.takeaway;
   $("lesson-detail").textContent=lesson.detail;
   showLessonConcept(id);
   $("lesson-source").textContent=lesson.source.title+" ↗";
   $("lesson-source").href=lesson.source.url;
   $("challenge").textContent=lesson.challenge;
   $("mentor-topic").textContent=lesson.title;
   $("mentor-response").hidden=true;
   resetExercise();showChoices(lesson);updateProgress();
   const position=lessons.findIndex(x=>x.id===id)+1;
   $("lesson-count").textContent="LESSON "+String(position).padStart(2,"0")+" OF "+String(lessons.length).padStart(2,"0");
   // The progress bar reflects the active Understand/Practice/Apply stage,
   // not the lesson index. A user jumping to lesson 4 is not automatically 100% done.
   $("reasoning-clinic").hidden=id!=="decide";
   $("practice-guide").textContent=id==="build"
     ?"Write a clear instruction and task. We check the request without calling SERV or using credits."
     :"Choose one answer, then check your reasoning. The server grades it; no AI credits are spent.";
   setLessonStage(done.has(id)?"apply":"read");
   window.scrollTo({top:0,behavior:"smooth"});
 }
 function complete(){
   const result=award([...done],current);
   done=new Set(result.completed);
   try{localStorage.setItem(storageKey,JSON.stringify(result.completed));}catch{}
   updateProgress();setLessonStage("apply");
   $("next").hidden=false;
   const ix=lessons.findIndex(l=>l.id===current);
   $("next").textContent=ix===lessons.length-1?"See your learning summary →":"Continue to next lesson →";
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
       setLessonStage("check");
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
   if(!window.confirm("Reset completed lessons, XP and debugging practice saved on this browser?"))return;
   done=new Set();
   try{localStorage.removeItem(storageKey);localStorage.removeItem("tryserv-debug-progress-v1");}catch{}
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
 function prefillDecisionClinic(){
   if(current!=="decide")return;
   $("mentor-question").value=(
     "In this hypothetical refund case, the customer missed the return window because delivery was delayed. "+
     "Explain which checks deterministic code should handle and which conflicting policy exceptions SERV Reasoning can help a human reviewer weigh. "+
     "Do not decide an actual refund or invent a real merchant policy."
   ).slice(0,400);
   $("tutor-panel").scrollIntoView({behavior:"smooth",block:"nearest"});
   $("mentor-question").focus({preventScroll:true});
   mentorMessage("The reasoning case is prepared. This is a hypothetical example, and no SERV request or refund action has been sent.");
 }
 function prefillCoach(kind){
   const lesson=lessons.find(l=>l.id===current)??lessons[0];
   if(!lesson)return;
   const topic=lesson.title,claim=lesson.takeaway;
   const prompts={
     simplify:"In the lesson '"+topic+"', explain this concept to a complete beginner without giving away quiz answers: "+claim,
     example:"Give one realistic developer example that illustrates the lesson '"+topic+"'. Use only the verified learning context and explain what I should try next.",
     decision:"For the topic '"+topic+"', show when using SERV Reasoning is useful versus when deterministic code is better. Give one concrete decision and explain the tradeoff."
   };
   $("mentor-question").value=(prompts[kind]??prompts.simplify).slice(0,400);
   $("tutor-panel").scrollIntoView({behavior:"smooth",block:"nearest"});
   $("mentor-question").focus({preventScroll:true});
   mentorMessage("Question prepared for "+topic+". No inference sent. Ask SERV tutor only when you want to use a guest trial request.");
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
   mentorMessage("Your lesson-specific question is ready. No SERV request has been sent; click Ask SERV tutor when you want an explanation.");
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
 async function refreshTutorAllowance(){
   const output=$("mentor-allowance");
   if(!publicTutorEnabled){output.hidden=true;return;}
   output.hidden=false;
   try{
     const status=await api("/api/tutor/allowance");
     if(status.status==="available"){
       output.textContent=status.remaining_today+" of "+status.daily_limit+
         " free questions available today. Shared trial capacity: "+
         status.remaining_total+" requests remaining.";
       $("ask-mentor").disabled=false;
     }else if(status.status==="daily_exhausted"){
       output.textContent="You've used today's free tutor allowance. Lessons and practice still work. Check again tomorrow (UTC).";
       $("ask-mentor").disabled=true;
     }else if(status.status==="trial_exhausted"){
       output.textContent="The shared free SERV trial is exhausted. All lessons, XP and the debugging lab remain available.";
       $("ask-mentor").disabled=true;
     }else{
       output.textContent="Tutor allowance could not be checked, so paid guest requests are temporarily unavailable. Lessons still work.";
       $("ask-mentor").disabled=true;
     }
   }catch{
     output.textContent="Tutor allowance could not be checked. Guided practice remains available.";
     $("ask-mentor").disabled=true;
   }
 }
 async function askTutor(){
   const question=$("mentor-question").value.trim();
   if(question.length<8)return mentorMessage("Enter a specific question of at least eight characters.",true);
   const code=$("mentor-access").value;
   if(!publicTutorEnabled&&!code)return mentorMessage("The free SERV tutor is unavailable. Guided lessons still work.",true);
   const button=$("ask-mentor");
   button.disabled=true;button.textContent="Thinking through your question…";
   mentorMessage("Requesting a real SERV explanation. It may take a moment.");
   try{
     const headers={"Content-Type":"application/json"};
     // Guest tutoring intentionally requires no demo token. Only the bounded
     // request lab stays operator-gated.
     if(!publicTutorEnabled&&code)headers["X-Learn-Access-Token"]=code;
     const result=await api("/api/mentor",{
       method:"POST",
       headers,
       body:JSON.stringify({lesson_id:current??lessons[0]?.id,question})
     });
     const host=$("mentor-response");clear(host);
     item(host,"strong","LIVE SERV · EXPLANATION","coach-answer-label");
     item(host,"p",result.explanation,"coach-answer-body");
     item(host,"strong","YOUR NEXT STEP","coach-answer-label");
     item(host,"p",result.next_action,"coach-answer-body");
     item(host,"strong","CHECK THE ORIGINAL SOURCE","coach-answer-label");
     const link=item(host,"a",result.reference.title+" ↗");
     link.href=result.reference.url;link.target="_blank";link.rel="noopener noreferrer";
     item(host,"small","Model: "+result.model+" · Completion: "+(result.completion_id??"not supplied")+
       " · Latency: "+(result.latency_ms??"unavailable")+" ms"+
       " · Tokens: "+((result.usage?.input_tokens??"–")+" input / "+(result.usage?.output_tokens??"–")+" output")+
       (result.guest_trial?" · Free guest trial":"")+" · Not independently fact-checked");
     host.hidden=false;host.className="mentor-response";
   }catch(error){mentorMessage(error.message,true);}
   finally{button.disabled=false;button.textContent="Ask SERV tutor ↗";if(publicTutorEnabled)await refreshTutorAllowance();}
 }
 function mentorMessage(message,failed=false){
   const host=$("mentor-response");host.hidden=false;host.textContent=message;
   host.className="mentor-response"+(failed?" error":"");
 }
 async function init(){
   const buildPage=window.location.pathname==="/try";
   const routes=document.querySelectorAll(".brand-route-nav a");
   for(const link of routes){
     if(link.getAttribute("href")===(buildPage?"/try":"/learn"))link.setAttribute("aria-current","page");
     else link.removeAttribute("aria-current");
   }
   $("start-fresh").addEventListener("click",()=>openLesson("ecosystem"));
   $("resume").addEventListener("click",resumeLearning);
   $("reset-progress").addEventListener("click",resetProgress);
   $("jump-build").addEventListener("click",()=>openLesson("build"));
   $("check").addEventListener("click",check);
   $("next").addEventListener("click",next);
   $("ask-mentor").addEventListener("click",askTutor);
   $("run-serv").addEventListener("click",runLiveRequest);
   $("ask-about-answer").addEventListener("click",prepareTutorQuestion);
   $("clinic-ask").addEventListener("click",prefillDecisionClinic);
   for(const button of document.querySelectorAll("[data-coach]")){
     button.addEventListener("click",()=>prefillCoach(button.dataset.coach));
   }
   $("builder").addEventListener("focusin",()=>setLessonStage("check"));
   $("copy-json").addEventListener("click",()=>copy(requestJson,$("copy-json")));
   $("copy-curl").addEventListener("click",()=>copy(curl,$("copy-curl")));
   try{
     const data=await api("/api/lessons");
     lessons=data.lessons;tutorEnabled=Boolean(data.tutor_enabled);
     publicTutorEnabled=Boolean(data.public_tutor_enabled);
     updateProgress();
     if(window.location.pathname==="/try")openLesson("build");
     $("mentor-gate").textContent=publicTutorEnabled
       ?"Free SERV tutor available: up to "+data.guest_daily_limit+" questions per visitor each day, while the shared trial budget lasts. No account or code required."
       :tutorEnabled
         ?"Private SERV testing is enabled. The free public trial is not yet available."
         :"Guided lessons work now. The live SERV tutor will be enabled when its secure server credentials are configured.";
     $("mentor-access").hidden=publicTutorEnabled||!tutorEnabled;
     $("mentor-access-label").hidden=publicTutorEnabled||!tutorEnabled;
     $("ask-mentor").disabled=!tutorEnabled;
     if(publicTutorEnabled)await refreshTutorAllowance();
   }catch(error){
     $("mentor-gate").textContent="Learning content is temporarily unavailable: "+error.message;
     $("start-fresh").disabled=true;$("jump-build").disabled=true;
   }
 }
 init();
})();
