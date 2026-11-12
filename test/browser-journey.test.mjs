// Real Chromium smoke tests for the actual learner UI; no network calls to SERV.
// Run via npm install --no-save playwright@1.56.1 && npx playwright install --with-deps chromium
// then node --test test/browser-journey.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {createApp} from "../server.mjs";

const answers={ecosystem:"Explore OpenServ Workflows and Agents",understand:"Use the SERV base URL and your SERV API key with a supported model",decide:"Decide whether a disputed refund qualifies under several conflicting policy exceptions"};
const baseRequest={
 endpoint:"https://inference-api.openserv.ai/v1/chat/completions",
 model:"gpt-5.4-mini",
 messages:[
  {role:"system",content:"You help developers understand OpenServ examples carefully and clearly."},
  {role:"user",content:"Explain how SERV Reasoning supports difficult choices."}
 ]
};
const server=createApp({env:{}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 await test("homepage routes to the learning experience, with working links",async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(origin+"/");
  assert.match(await page.title(),/TrySERV/);
  await page.getByRole("link",{name:/I'm new.*start here/i}).click();
  await page.waitForURL("**/learn");
  await page.getByRole("button",{name:/start learning/i}).click();
  await page.getByRole("heading",{name:"Find your way around OpenServ"}).waitFor();
  assert.deepEqual(errors,[]);
  await context.close();
 });
 await test("wrong-choice hint, four lesson completions, XP and persistence",async()=>{
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(origin+"/learn");
  await page.getByRole("button",{name:/start learning/i}).click();
  // First lesson: incorrect response should not give XP or expose solution.
  await page.getByRole("button",{name:"Only change the SERV Reasoning API base URL"}).click();
  await page.getByRole("button",{name:/Check my answer/}).click();
  await page.getByRole("status").first().waitFor();
  const feedback=await page.locator("#feedback").innerText();
  assert.match(feedback,/Hint:/);
  assert.doesNotMatch(feedback,/Correct\./);
  assert.equal(await page.locator("#xp-count").innerText(),"0 XP");

  // Success and one-time XP.
  await page.getByRole("button",{name:answers.ecosystem}).click();
  await page.getByRole("button",{name:/Check my answer/}).click();
  await page.getByRole("button",{name:/Continue to next lesson/}).click();
  await page.getByRole("heading",{name:"What is SERV, really?"}).waitFor();
  await page.getByRole("button",{name:answers.understand}).click();
  await page.getByRole("button",{name:/Check my answer/}).click();
  await page.getByRole("button",{name:/Continue to next lesson/}).click();
  await page.getByRole("heading",{name:"Know when reasoning helps"}).waitFor();
  await page.getByRole("button",{name:answers.decide}).click();
  await page.getByRole("button",{name:/Check my answer/}).click();
  await page.getByRole("button",{name:/Continue to next lesson/}).click();
  await page.getByRole("heading",{name:"Build your first valid request"}).waitFor();
  await page.locator("#system").fill("You are a careful assistant that explains developer problems precisely.");
  await page.locator("#user-task").fill("Explain when SERV helps make decisions.");
  await page.getByRole("button",{name:/Check my answer/}).click();
  await page.getByText("Your valid API request").waitFor();
  assert.equal(await page.locator("#xp-count").innerText(),"80 XP");
  await page.getByRole("button",{name:/See your learning summary/}).click();
  await page.getByRole("heading",{name:/You've completed the beginner path/}).waitFor();
  await page.reload();
  await page.getByRole("heading",{name:/You've completed the beginner path/}).waitFor();
  assert.equal(await page.locator("#xp-count").innerText(),"80 XP");
  await page.getByRole("button",{name:/Review from the beginning/}).click();
  await page.getByRole("button",{name:answers.ecosystem}).click();
  await page.getByRole("button",{name:/Check my answer/}).click();
  assert.equal(await page.locator("#xp-count").innerText(),"80 XP");
  assert.deepEqual(errors,[]);
  await context.close();
 });

 await test("debug lab repairs all three requests and returns to learning summary",async()=>{
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(origin+"/debug");
  for(let i=0;i<3;i++){
   const editor=page.locator("#editor");
   const raw=JSON.parse(await editor.inputValue());
   assert.ok(raw.endpoint);
   await editor.fill(JSON.stringify(baseRequest,null,2));
   await page.getByRole("button",{name:/Validate my fix/}).click();
   await page.getByText("Correct — this request blueprint passed validation.").waitFor();
   assert.match(await page.locator("#progress").innerText(),new RegExp((i+1)+" / 3 repaired"));
   await page.locator("#next").click();
  }
  await page.waitForURL("**/learn");
  assert.deepEqual(errors,[]);
  await context.close();
 });
 await test("mobile widths show accessible routes without document horizontal overflow",async()=>{
  for(const width of [320,375,768,1024,1440]){
   const context=await browser.newContext({viewport:{width,height:850},isMobile:false});
   const page=await context.newPage();
   for(const route of ["/","/learn","/debug"]){
    await page.goto(origin+route);
    await page.waitForLoadState("domcontentloaded");
    const dimensions=await page.evaluate(()=>({
      document:document.documentElement.scrollWidth,
      window:document.documentElement.clientWidth
    }));
    assert.ok(dimensions.document<=dimensions.window+2,
      route+" overflows at "+width+"px: "+JSON.stringify(dimensions));
   }
   await context.close();
  }
 });
 await test("keyboard can reach and activate a lesson choice",async()=>{
  const context=await browser.newContext({viewport:{width:1366,height:768}});
  const page=await context.newPage();
  await page.goto(origin+"/learn");
  await page.getByRole("button",{name:/start learning/i}).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("heading",{name:"Find your way around OpenServ"}).waitFor();
  const option=page.getByRole("button",{name:answers.ecosystem});
  await option.focus();
  await page.keyboard.press("Enter");
  assert.equal(await option.getAttribute("aria-pressed"),"true");
  await context.close();
 });
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
