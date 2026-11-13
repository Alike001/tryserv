// Lightweight, on-device documentation finder.
// Search indexes the rendered guide sections and never calls a server.
(() => {
 "use strict";
 const input=document.getElementById("docs-search");
 const nav=document.getElementById("docs-sections");
 const status=document.getElementById("docs-search-status");
 if(!input||!nav||!status)return;
 const links=Array.from(nav.querySelectorAll('a[href^="#"]'));
 const guideIndex=links.map(link => {
   const id=link.getAttribute("href").slice(1);
   const section=document.getElementById(id);
   return {
     link,
     // Content is published and already visible on this page. No data leaves the browser.
     corpus:((link.textContent??"")+" "+(section?.textContent??"")).toLocaleLowerCase()
   };
 });
 function filterGuides() {
   const query=input.value.trim().toLocaleLowerCase();
   let matches=0;
   for(const guide of guideIndex){
     const matched=!query||guide.corpus.includes(query);
     guide.link.hidden=!matched;
     if(matched)matches++;
   }
   if(!query){
     status.textContent="Search the "+guideIndex.length+" guide sections.";
   }else if(matches===0){
     status.textContent="No matching guides. Try SERV, request, privacy, or debugging.";
   }else{
     status.textContent=matches+" matching guide"+(matches===1?"":"s")+". Choose a result to jump to its section.";
   }
 }
 input.addEventListener("input",filterGuides);
 nav.addEventListener("click",event=>{
   if(event.target.closest("a")){
     input.value="";
     filterGuides();
   }
 });
 filterGuides();
})();
