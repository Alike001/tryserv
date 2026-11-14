import {test,expect} from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base="https://tryserv.onrender.com";
const reportDir=path.resolve("production-evidence");
fs.mkdirSync(reportDir,{recursive:true});
const note=(name,data)=>fs.writeFileSync(path.join(reportDir,name+".json"),
  JSON.stringify({checked_at:new Date().toISOString(),environment:"TrySERV public Render production",...data},null,2)+"\n");
async function picture(page,name){
 await page.screenshot({path:path.join(reportDir,name+".png"),fullPage:false,animations:"disabled"});
}
const validBlueprint={
 endpoint:"https://inference-api.openserv.ai/v1/chat/completions",
 model:"gpt-5.4-mini",
 messages:[
  {role:"system",content:"You explain API concepts and acknowledge uncertainty."},
  {role:"user",content:"Explain when SERV Reasoning is a better fit than deterministic rules."}
 ]
};

test("public production: beginner and developer workflows, no paid inference",async({page})=>{
 let paid=0;
 page.on("request",r=>{if(new URL(r.url()).pathname==="/api/mentor"||new URL(r.url()).pathname==="/api/try-serv")paid++});
 const health=await page.request.get(base+"/healthz");
 expect(health.status()).toBe(200);
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:860});
  for(const route of ["/","/learn","/try","/debug","/docs"]){
   const response=await page.goto(route,{waitUntil:"load"});
   expect(response.status(),route).toBe(200);
   // DOMContentLoaded is too early for an accurate hosted Google-font layout measurement.
   await page.evaluate(()=>document.fonts.ready);
   if(route==="/learn"||route==="/try")await expect(page.locator("#lesson-nav .nav-lesson")).toHaveCount(4);
   if(route==="/debug")await expect(page.locator("#cases .case-button")).toHaveCount(3);
   await expect(page.locator('link[href="/brand.css"]')).toHaveCount(1);
   if(width===375)await picture(page,"public-"+route.replace("/","home").replace("homelearn","learn").replace("hometry","builder").replace("homedebug","debug").replace("homedocs","docs")+"-phone");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>2){
     const offenders=await page.evaluate(()=>[...document.querySelectorAll("body *")]
       .map(el=>({selector:el.tagName.toLowerCase()+"."+(typeof el.className==="string"?el.className:""),
         right:Math.round(el.getBoundingClientRect().right)}))
       .filter(el=>el.right>innerWidth+3).slice(0,12));
     console.error("PRODUCTION_OVERFLOW",JSON.stringify({route,width,overflow,offenders}));
   }
   expect(overflow,route+" horizontal overflow at "+width).toBeLessThanOrEqual(2);
   if(width===375)await expect(page.getByRole("navigation",{name:"TrySERV pages"})).toBeVisible();
  }
 }
 await page.setViewportSize({width:1440,height:900});
 await page.goto("/learn");
 await expect(page.locator("#lesson-nav .nav-lesson")).toHaveCount(4);
 await page.locator("#start-fresh").click();
 await page.locator("#answers .choice").nth(1).click();
 await page.locator("#check").click();
 await expect(page.locator("#feedback")).toContainText("Hint:");
 await expect(page.locator("#progress-count")).toHaveText("0 of 4");
 await expect(page.locator("#xp-count")).toHaveCount(0);
 await page.locator("#answers .choice").nth(0).click();
 await page.locator("#check").click();
 await expect(page.locator("#progress-count")).toHaveText("1 of 4");
 await page.locator("#next").click();
 for(const index of [1,1]){
  await page.locator("#answers .choice").nth(index).click();
  await page.locator("#check").click();
  await expect(page.locator("#feedback")).toContainText("Correct.");
  await page.locator("#next").click();
 }
 await expect(page.locator("#builder")).toBeVisible();
 await page.locator("#check").click();
 await expect(page.locator("#json-preview")).toContainText('gpt-5.4-mini');
 await expect(page.locator("#progress-count")).toHaveText("4 of 4");
 await page.locator("#next").click();
 await expect(page.locator("#completion-panel")).toBeVisible();
 await expect(page.locator("#completion-panel")).toContainText("all four lessons");
 await expect(page.locator("body")).not.toContainText(/\bXP\b/i);
 await picture(page,"beginner-real-completion");
 await page.reload();
 await expect(page.locator("#progress-count")).toHaveText("4 of 4");
 await page.goto("/debug");
 await expect(page.locator("#cases .case-button")).toHaveCount(3);
 for(let i=0;i<3;i++){
  await page.locator("#cases .case-button").nth(i).click();
  await page.locator("#editor").fill(JSON.stringify(validBlueprint,null,2));
  await page.locator("#check").click();
  await expect(page.locator("#result")).toContainText("Correct");
  await expect(page.locator("#solution")).toBeVisible();
 }
 await expect(page.locator("#progress")).toContainText("3 / 3");
 await picture(page,"developer-real-3-repairs");
 await page.reload();
 await expect(page.locator("#progress")).toContainText("3 / 3");
 expect(paid).toBe(0);
 note("public-journeys",{status:"pass",widths:[320,375,768,1024,1440],routes:["/","/learn","/try","/debug","/docs"],
  beginner:{completed_lessons:4},developer:{repairs:3},paid_calls:0,limits:"Browser automation is not unassisted human testing"});
});

test("single approved live SERV diagnosis in production, no automatic retry",async({page})=>{
 // Only use a paid request after all free hosted readiness checks have passed.
 test.skip(!fs.existsSync(path.join(reportDir,"public-journeys.json")),
  "The free hosted acceptance journey failed; no paid SERV call is allowed.");
 // Guard prevents accidental usage from other environments or re-runs.
 test.skip(process.env.ALLOW_ONE_SERV_CALL!=="yes"||process.env.GITHUB_RUN_ATTEMPT!=="1",
  "Only the specially gated one-shot release workflow may spend a public guest reservation.");
 const beforeRes=await page.request.get("/api/tutor/allowance");
 expect(beforeRes.status()).toBe(200);
 const before=await beforeRes.json();
 note("serv-preflight",{status:before.status,remaining_today:before.remaining_today,remaining_total:before.remaining_total});
 test.skip(before.status!=="available"||before.remaining_today<1||before.remaining_total<1,
  "Shared public budget unavailable: no request will be made.");
 await page.goto("/debug");
 await expect(page.locator("#cases .case-button")).toHaveCount(3);
 let sends=0;let body=null;
 page.on("request",req=>{
  if(new URL(req.url()).pathname==="/api/mentor"){
   sends++;
   body=req.postDataJSON();
  }
 });
 await page.locator("#check").click();
 await expect(page.locator("#result")).toContainText("messages.instructions");
 await expect(page.locator("#serv-diagnostic")).toBeVisible();
 await expect(page.locator("#serv-explain")).toBeEnabled();
 expect(sends).toBe(0);
 await picture(page,"before-serv-diagnostic");
 await page.locator("#serv-explain").click(); // The only action authorized to spend one reservation.
 await expect(page.locator("#serv-ai-response")).toContainText("LIVE RESPONSE",{timeout:45000});
 await expect(page.locator("#serv-ai-response")).toContainText("Completion:");
 await expect(page.locator("#serv-ai-response a")).toHaveAttribute("href",/^https:\/\/docs\.openserv\.ai\//);
 expect(sends).toBe(1);
 expect(body.lesson_id).toBe("build");
 expect(typeof body.question).toBe("string");
 expect(body.question).not.toContain("Bearer");
 expect(body.question).not.toContain("SERV_API_KEY");
 const metadata=await page.locator("#serv-ai-response small").innerText();
 const explanation=await page.locator("#serv-ai-response p").first().innerText();
 expect(metadata).toMatch(/Model: [^·]+ · Completion: [^·]+ · Latency: \d+ ms/);
 await picture(page,"serv-live-response");
 const after=await (await page.request.get("/api/tutor/allowance")).json();
 note("serv-production-result",{
   status:"observed_live_completion",send_count:sends,
   model:metadata.match(/Model: ([^·]+)/)?.[1]?.trim()??"unknown",
   completion:metadata.match(/Completion: ([^·]+)/)?.[1]?.trim()??"unavailable",
   latency_ms:Number(metadata.match(/Latency: (\d+)/)?.[1]??-1),
   raw_explanation_length:explanation.length,
   remaining_before:before.remaining_total,remaining_after:after.remaining_total,
   source:"https://docs.openserv.ai/serv-reasoning/api/chat-completions",
   provenance:"Actual hosted browser clicked the live SERV diagnostic; no stubbed API"
 });
 await page.locator("#editor").fill(JSON.stringify(validBlueprint,null,2));
 await page.locator("#check").click();
 await expect(page.locator("#result")).toContainText("Correct");
 await picture(page,"serv-repaired-and-rechecked");
 expect(sends).toBe(1);
});
