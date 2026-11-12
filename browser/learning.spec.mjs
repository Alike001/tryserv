import {test,expect} from "@playwright/test";

const validBlueprint={
  endpoint:"https://inference-api.openserv.ai/v1/chat/completions",
  model:"gpt-5.4-mini",
  messages:[
    {role:"system",content:"You explain technical tasks precisely and admit uncertainty."},
    {role:"user",content:"Explain when SERV Reasoning helps decide between options."}
  ]
};

test("landing sends newcomers and developers to real working routes",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{level:1})).toContainText("Stop reading");
  await expect(page.locator("a[href='/learn']").first()).toBeVisible();
  await page.getByRole("link",{name:/I'm new — start here/i}).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.locator("#lesson-nav .nav-lesson")).toHaveCount(4);
  await page.goto("/");
  await page.getByRole("link",{name:/I can code — let's build/i}).click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.locator("#builder")).toBeVisible();
});

test("wrong answer gives a useful hint and no XP until the correction is checked",async({page})=>{
  await page.goto("/learn");
  await page.locator("#start-fresh").click();
  await page.locator("#answers .choice").nth(1).click();
  await page.locator("#check").click();
  await expect(page.locator("#feedback")).toContainText("Hint:");
  await expect(page.locator("#xp-count")).toHaveText("0 XP");
  await page.locator("#answers .choice").nth(0).click();
  await page.locator("#check").click();
  await expect(page.locator("#feedback")).toContainText("+20 XP");
  await expect(page.locator("#xp-count")).toHaveText("20 XP");
});

test("four lessons build a valid request, save exactly 80 XP and show a completion path",async({page})=>{
  await page.goto("/learn");
  await page.locator("#start-fresh").click();
  for(const answerIndex of [0,1,1]){
    await page.locator("#answers .choice").nth(answerIndex).click();
    await page.locator("#check").click();
    await expect(page.locator("#feedback")).toContainText("Correct.");
    await page.locator("#next").click();
  }
  await expect(page.locator("#builder")).toBeVisible();
  await page.locator("#check").click();
  await expect(page.locator("#feedback")).toContainText("+20 XP");
  await expect(page.locator("#json-preview")).toContainText('"model": "gpt-5.4-mini"');
  await expect(page.locator("#request-preview")).toBeVisible();
  await expect(page.locator("#live-try-panel")).toBeHidden();
  await page.locator("#next").click();
  await expect(page.locator("#completion-panel")).toBeVisible();
  await expect(page.locator("#xp-count")).toHaveText("80 XP");
  await expect(page.locator("#completion-panel")).toContainText("on-device XP");
  await expect(page.locator("#completion-panel a[href='/debug']")).toBeVisible();
  await page.reload();
  await expect(page.locator("#completion-panel")).toBeVisible();
  await expect(page.locator("#xp-count")).toHaveText("80 XP");
  await page.locator("#lesson-nav .nav-lesson").first().click();
  await page.locator("#answers .choice").first().click();
  await page.locator("#check").click();
  await expect(page.locator("#xp-count")).toHaveText("80 XP");
  await expect(page.locator("#feedback")).toContainText("already earned XP");
});

test("developer repairs all three real-contract examples without spending SERV credits",async({page})=>{
  await page.goto("/debug");
  const response=await page.request.get("/api/debug/scenarios");
  expect(response.ok()).toBeTruthy();
  const {scenarios,api_execution}=await response.json();
  expect(api_execution).toBe(false);
  expect(scenarios).toHaveLength(3);
  for(let i=0;i<scenarios.length;i++){
    await expect(page.locator("#editor")).toBeVisible();
    await page.locator("#editor").fill(JSON.stringify(validBlueprint,null,2));
    await page.locator("#check").click();
    await expect(page.locator("#result")).toContainText("Correct");
    await expect(page.locator("#solution")).toBeVisible();
    await expect(page.locator("#solution")).toContainText("PREVIEW ONLY");
    await expect(page.locator("#progress")).toHaveText(String(i+1)+" / 3 repaired");
    await page.locator("#next").click();
  }
  await expect(page).toHaveURL(/\/learn$/);
  await page.goto("/debug");
  await expect(page.locator("#progress")).toHaveText("3 / 3 repaired");
  await expect(page.locator("#debug-complete")).toBeVisible();
});

test("keyboard can start a lesson, select and submit an answer",async({page})=>{
  await page.goto("/learn");
  await page.locator("#start-fresh").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#learning")).toBeVisible();
  const choice=page.locator("#answers .choice").first();
  await choice.focus();
  await page.keyboard.press("Space");
  await expect(choice).toHaveAttribute("aria-pressed","true");
  await page.locator("#check").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#feedback")).toContainText("Correct.");
});

test("public tutor quota can be read without a paid call and errors stay nonfinancial",async({page})=>{
  let submits=0;
  await page.route("**/api/lessons",async route=>{
    const data=await (await route.fetch()).json();
    await route.fulfill({json:{...data,tutor_enabled:true,public_tutor_enabled:true,guest_daily_limit:2}});
  });
  await page.route("**/api/tutor/allowance",route=>route.fulfill({
    json:{enabled:true,available:true,remaining_today:1,remaining_total:23,daily_limit:2,status:"available"}
  }));
  await page.route("**/api/mentor",route=>{
    submits++;
    return route.fulfill({json:{
      mode:"live-serv-tutor",explanation:"A workflow sequences steps, while reasoning helps decide between ambiguous alternatives.",
      next_action:"Try comparing a known lookup with a disputed refund decision.",
      reference:{title:"Official source",url:"https://docs.openserv.ai/serv-reasoning/introduction"},
      model:"TEST-ONLY",completion_id:"PLAYWRIGHT-MOCK",latency_ms:5,
      usage:{input_tokens:2,output_tokens:7},guest_trial:true,guest_remaining:22
    }});
  });
  await page.goto("/learn");
  await expect(page.locator("#mentor-allowance")).toContainText("1 of 2 free questions");
  expect(submits).toBe(0);
  await page.locator("#mentor-question").fill("Why is SERV Reasoning different from a workflow?");
  await page.locator("#ask-mentor").click();
  await expect(page.locator("#mentor-response")).toContainText("PLAYWRIGHT-MOCK");
  expect(submits).toBe(1);
});

test("responsive layout has no unexpected page-wide horizontal scrolling",async({page})=>{
  for(const width of [320,375,768,1024,1440]){
    await page.setViewportSize({width,height:850});
    for(const path of ["/","/learn","/debug","/try","/docs"]){
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      expect(overflow,path+" at "+width+"px must not overflow by "+overflow+"px").toBeLessThanOrEqual(2);
    }
  }
});


test("shared guest trial exhausted: no paid request and learning remains usable",async({page})=>{
 let submissions=0;
 await page.route("**/api/lessons",async route=>{
   const original=await (await route.fetch()).json();
   await route.fulfill({json:{...original,tutor_enabled:true,public_tutor_enabled:true,guest_daily_limit:2}});
 });
 await page.route("**/api/tutor/allowance",route=>route.fulfill({
   json:{enabled:true,available:false,remaining_today:0,remaining_total:0,daily_limit:2,status:"trial_exhausted"}
 }));
 await page.route("**/api/mentor",route=>{
   submissions++;
   return route.fulfill({status:500,json:{error:"This should never be requested."}});
 });
 await page.goto("/learn");
 await expect(page.locator("#mentor-allowance")).toContainText("shared free SERV trial is exhausted");
 await expect(page.locator("#ask-mentor")).toBeDisabled();
 await page.locator("#start-fresh").click();
 await page.locator("#answers .choice").first().click();
 await page.locator("#check").click();
 await expect(page.locator("#xp-count")).toHaveText("20 XP");
 expect(submissions).toBe(0);
});

test("quota database unavailable: paid tutor remains disabled, free learning works",async({page})=>{
 let submissions=0;
 await page.route("**/api/lessons",async route=>{
  const original=await (await route.fetch()).json();
  await route.fulfill({json:{...original,tutor_enabled:true,public_tutor_enabled:true,guest_daily_limit:2}});
 });
 await page.route("**/api/tutor/allowance",route=>route.fulfill({
   json:{enabled:true,available:false,remaining_today:0,remaining_total:0,daily_limit:2,status:"unavailable"}
 }));
 await page.route("**/api/mentor",route=>{
   submissions++;
   return route.fulfill({status:502,json:{error:"Unexpected paid call."}});
 });
 await page.goto("/learn");
 await expect(page.locator("#mentor-allowance")).toContainText("could not be checked");
 await expect(page.locator("#ask-mentor")).toBeDisabled();
 await page.locator("#start-fresh").click();
 await expect(page.locator("#learning")).toBeVisible();
 await page.locator("#answers .choice").first().click();
 await page.locator("#check").click();
 await expect(page.locator("#feedback")).toContainText("Correct.");
 expect(submissions).toBe(0);
});

test("private custom SERV request is never run by preview or missing authorization",async({page})=>{
 let calls=0;
 await page.route("**/api/lessons",async route=>{
  const original=await (await route.fetch()).json();
  await route.fulfill({json:{...original,tutor_enabled:true,public_tutor_enabled:true,guest_daily_limit:2}});
 });
 await page.route("**/api/tutor/allowance",route=>route.fulfill({
   json:{enabled:true,available:true,remaining_today:2,remaining_total:23,daily_limit:2,status:"available"}
 }));
 await page.route("**/api/try-serv",route=>{
   calls++;
   return route.fulfill({status:401,json:{error:"Invalid private demo access code"}});
 });
 await page.goto("/try");
 await expect(page.locator("#builder")).toBeVisible();
 await page.locator("#check").click();
 await expect(page.locator("#request-preview")).toBeVisible();
 expect(calls).toBe(0);
 await expect(page.locator("#live-try-panel")).toBeVisible();
 await page.locator("#run-serv").click();
 await expect(page.locator("#try-result")).toContainText("Enter your private demo access code");
 expect(calls).toBe(0);
});


test("new guide page has working navigation, documentation anchors, and learning handoff",async({page})=>{
 await page.goto("/");
 await expect(page.locator(".trail-card")).toHaveCount(3);
 await page.locator("a[href='/docs']:visible").first().click();
 await expect(page).toHaveURL(/\/docs$/);
 await expect(page.getByRole("heading",{name:/Understand it/})).toBeVisible();
 await expect(page.locator(".docs-sidebar nav a")).toHaveCount(9);
 await page.locator(".docs-sidebar a[href='#serv']").click();
 await expect(page).toHaveURL(/\/docs#serv$/);
 await expect(page.locator("#serv")).toBeVisible();
 await page.locator(".path-card[href='/debug']").click();
 await expect(page).toHaveURL(/\/debug$/);
 await expect(page.locator("#editor")).toBeVisible();
 await page.getByRole("link",{name:"Docs",exact:true}).click();
 await expect(page).toHaveURL(/\/docs$/);
});

test("mobile docs remains readable and its in-page navigation works",async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto("/docs");
 await expect(page.locator(".docs-intro")).toBeVisible();
 await page.locator(".docs-sidebar a[href='#security']").click();
 await expect(page).toHaveURL(/\/docs#security$/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
 await expect(page.locator("#security")).toBeVisible();
});


test("keyboard users can skip homepage navigation and reach main content",async({page})=>{
 await page.goto("/");
 await page.keyboard.press("Tab");
 const skip=page.getByRole("link",{name:"Skip to main content"});
 await expect(skip).toBeFocused();
 await expect(skip).toBeVisible();
 await page.keyboard.press("Enter");
 await expect(page).toHaveURL(/#main-content$/);
 await expect(page.locator("main#main-content")).toBeVisible();
});


test("learning studio presents a focused journey with a safe contextual SERV coach",async({page})=>{
 let paidRequests=0;
 await page.route("**/api/mentor",route=>{
   paidRequests++;
   return route.fulfill({status:503,json:{error:"No paid calls are expected from question preparation."}});
 });
 await page.goto("/learn");
 await page.getByRole("link",{name:"Skip to lesson content"}).focus();
 await expect(page.getByRole("link",{name:"Skip to lesson content"})).toBeVisible();
 await page.getByRole("button",{name:/I'm new — start learning/}).click();
 await expect(page.locator("#lesson-count")).toHaveText("LESSON 01 OF 04");
 await expect(page.locator(".lesson-stages .stage.active")).toContainText("Understand");
 await page.locator("#answers .choice").nth(1).click();
 await expect(page.locator(".lesson-stages .stage.active")).toContainText("Practice");
 await page.locator("#check").click();
 await expect(page.locator("#feedback")).toContainText("Hint:");
 await page.getByRole("button",{name:"Show an example"}).click();
 await expect(page.locator("#mentor-question")).toHaveValue(/realistic developer example/);
 await expect(page.locator("#mentor-response")).toContainText("No inference sent");
 expect(paidRequests).toBe(0);
 await page.locator("#answers .choice").nth(0).click();
 await page.locator("#check").click();
 await expect(page.locator(".lesson-stages .stage.active")).toContainText("Apply");
 await expect(page.locator("#xp-count")).toHaveText("20 XP");
});

test("refreshed studio stays readable at 320, 375, 768, 1024 and 1440 pixels",async({page})=>{
 for(const width of [320,375,768,1024,1440]){
   await page.setViewportSize({width,height:850});
   await page.goto("/learn");
   await page.locator("#start-fresh").click();
   await expect(page.locator("#lesson-title")).toBeVisible();
   await expect(page.locator("#progress-count")).toBeVisible();
   await expect(page.locator("#mentor-question")).toBeAttached();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   expect(overflow, "horizontal overflow at "+width+"px").toBeLessThanOrEqual(2);
 }
});

test("reasoning clinic uses SERV only after explicit approval, never on question preparation",async({page})=>{
 let paid=0;
 await page.route("**/api/mentor",route=>{
   paid++;
   return route.fulfill({status:503,json:{error:"No spending expected from preparation."}});
 });
 await page.goto("/learn");
 await page.locator("#start-fresh").click();
 await page.locator("#lesson-nav .nav-lesson").nth(2).click();
 await expect(page.locator("#reasoning-clinic")).toBeVisible();
 await page.locator("#clinic-ask").click();
 await expect(page.locator("#mentor-question")).toHaveValue(/hypothetical refund case/);
 await expect(page.locator("#mentor-response")).toContainText("no SERV request");
 expect(paid).toBe(0);
 await page.locator("#lesson-nav .nav-lesson").nth(0).click();
 await expect(page.locator("#reasoning-clinic")).toBeHidden();
});
