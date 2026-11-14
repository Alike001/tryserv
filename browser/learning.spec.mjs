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
  await expect(page.getByRole("link",{name:/I'm new — start here/i})).toBeVisible();
  await page.getByRole("link",{name:/I'm new — start here/i}).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.locator("#lesson-nav .nav-lesson")).toHaveCount(4);
  await page.goto("/");
  await page.getByRole("link",{name:/I can code — let's build/i}).click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.locator("#builder")).toBeVisible();
});

test("wrong answers give useful hints; only a correct answer completes the lesson",async({page})=>{
  await page.goto("/learn");
  await page.locator("#start-fresh").click();
  await page.locator("#answers .choice").nth(1).click();
  await page.locator("#check").click();
  await expect(page.locator("#feedback")).toContainText("Hint:");
  await expect(page.locator("#progress-count")).toHaveText("0 of 4");
  await expect(page.locator("#xp-count")).toHaveCount(0);
  await page.locator("#answers .choice").nth(0).click();
  await page.locator("#check").click();
  await expect(page.locator("#feedback")).toContainText("Lesson marked complete");
  await expect(page.locator("#progress-count")).toHaveText("1 of 4");
  await expect(page.locator("body")).not.toContainText(/XP/i);
});

test("previously saved lesson IDs remain completed after the XP system is removed",async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("tryserv-progress-v1",JSON.stringify(["ecosystem","understand"])));
  await page.goto("/learn");
  await expect(page.locator("#progress-count")).toHaveText("2 of 4");
  await expect(page.locator("#lesson-nav .nav-lesson.complete")).toHaveCount(2);
  await page.locator("#resume").click();
  await expect(page.locator("#lesson-count")).toHaveText("LESSON 03 OF 04");
  await expect(page.locator("#xp-count")).toHaveCount(0);
});

test("four lessons build a valid request and show a persistent learning summary",async({page})=>{
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
  await expect(page.locator("#feedback")).toContainText("Lesson marked complete");
  await expect(page.locator("#json-preview")).toContainText('"model": "gpt-5.4-mini"');
  await expect(page.locator("#request-preview")).toBeVisible();
  await expect(page.locator("#live-try-panel")).toBeHidden();
  await page.locator("#next").click();
  await expect(page.locator("#completion-panel")).toBeVisible();
  await expect(page.locator("#progress-count")).toHaveText("4 of 4");
  await expect(page.locator("#completion-panel")).toContainText("all four lessons");
  await expect(page.locator("#completion-panel a[href='/debug']")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/XP/i);
  await page.reload();
  await expect(page.locator("#completion-panel")).toBeVisible();
  await expect(page.locator("#progress-count")).toHaveText("4 of 4");
  await page.locator("#lesson-nav .nav-lesson").first().click();
  await page.locator("#answers .choice").first().click();
  await page.locator("#check").click();
  await expect(page.locator("#progress-count")).toHaveText("4 of 4");
  await expect(page.locator("#feedback")).toContainText("already marked complete");
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
 await expect(page.locator("#progress-count")).toHaveText("1 of 4");
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
 await expect(page.locator("#progress-count")).toHaveText("1 of 4");
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


test("debug lab has clear repair stages, accessible entry and no mobile overflow",async({page})=>{
 await page.goto("/debug");
 const skip=page.getByRole("link",{name:"Skip to debug lab"});
 await page.keyboard.press("Tab");
 await expect(skip).toBeFocused();
 await page.keyboard.press("Enter");
 await expect(page).toHaveURL(/\/debug#debug-main$/);
 await expect(page.locator(".debug-journey span")).toHaveCount(3);
 for(const width of [320,375,768,1440]){
   await page.setViewportSize({width,height:850});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   expect(overflow,"debug overflow at "+width).toBeLessThanOrEqual(2);
   await expect(page.locator("#editor")).toBeVisible();
 }
});


test("all pages share the landing's navy/blue brand and mobile page navigation",async({page})=>{
 await page.setViewportSize({width:375,height:812});
 for(const route of ["/","/learn","/try","/debug","/docs"]){
   await page.goto(route);
   await expect(page.locator('link[href="/brand.css"]')).toHaveCount(1);
   const visibleNav=page.getByRole("navigation",{name:"TrySERV pages"});
   await expect(visibleNav).toBeVisible();
   for(const href of ["/","/learn","/try","/debug","/docs"]){
     await expect(visibleNav.locator('a[href="'+href+'"]')).toBeVisible();
   }
   const bg=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
   expect(bg).toBe(route==="/"?"rgb(255, 255, 255)":"rgb(247, 249, 252)");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   expect(overflow,"shared UI overflow at "+route).toBeLessThanOrEqual(2);
 }
 await page.goto("/docs");
 await page.getByRole("navigation",{name:"TrySERV pages"}).locator('a[href="/debug"]').click();
 await expect(page).toHaveURL(/\/debug$/);
 await page.getByRole("navigation",{name:"TrySERV pages"}).locator('a[href="/learn"]').click();
 await expect(page).toHaveURL(/\/learn$/);
});

test("a late lesson does not display false 100 percent stage completion",async({page})=>{
 await page.goto("/try");
 await expect(page.locator("#lesson-count")).toHaveText("LESSON 04 OF 04");
 const bar=page.locator("#lesson-journey-track");
 await expect(bar).toHaveAttribute("aria-valuenow","1");
 const initial=await page.locator("#lesson-journey-fill").evaluate(x=>x.style.width);
 expect(parseFloat(initial)).toBeGreaterThan(33);
 expect(parseFloat(initial)).toBeLessThan(34);
 await page.locator("#check").click();
 await expect(bar).toHaveAttribute("aria-valuenow","3");
 await expect(page.locator("#lesson-journey-fill")).toHaveAttribute("style",/100%/);
});

test("SERV debug explanation requires a verified error and explicit click, never sends user JSON",async({page})=>{
 let paid=0,request=null;
 await page.route("**/api/lessons",async route=>{
  const original=await (await route.fetch()).json();
  await route.fulfill({json:{...original,tutor_enabled:true,public_tutor_enabled:true,guest_daily_limit:2}});
 });
 await page.route("**/api/tutor/allowance",route=>route.fulfill({
  json:{enabled:true,available:true,status:"available",remaining_today:2,remaining_total:23,daily_limit:2}
 }));
 await page.route("**/api/mentor",route=>{
  paid++;request=route.request().postDataJSON();
  return route.fulfill({json:{
   mode:"live-serv-tutor",guest_trial:true,
   explanation:"The request has a missing system instruction, so the intended assistant behavior is underspecified. Correct the configuration before making any real SERV API call.",
   next_action:"Add a concise system instruction and validate the request blueprint again.",
   reference:{title:"Chat completions",url:"https://docs.openserv.ai/serv-reasoning/api/chat-completions"},
   model:"gpt-5.4-mini",completion_id:"stub-serv-debug-id",latency_ms:91,
   usage:{input_tokens:55,output_tokens:31}
  }});
 });
 await page.goto("/debug");
 await expect(page.locator("#serv-diagnostic")).toBeHidden();
 const blueprint=await page.locator("#editor").inputValue();
 await page.locator("#editor").fill(blueprint.replace("Explain when SERV Reasoning is appropriate.","PRIVATE_DUMMY_DONT_SEND_THIS_JSON"));
 await page.locator("#check").click();
 await expect(page.locator("#serv-diagnostic")).toBeVisible();
 await expect(page.locator("#serv-explain")).toBeEnabled();
 expect(paid).toBe(0);
 await page.locator("#serv-explain").click();
 await expect(page.locator("#serv-ai-response")).toContainText("stub-serv-debug-id");
 expect(paid).toBe(1);
 expect(request.lesson_id).toBe("build");
 expect(request.question).toContain("Chat Completions");
 expect(request.question).not.toContain("PRIVATE_DUMMY_DONT_SEND_THIS_JSON");
 await expect(page.locator("#serv-ai-response a")).toHaveAttribute("href",/docs\.openserv\.ai/);
});

test("debug SERV trial fails closed while deterministic request repair stays available",async({page})=>{
 let calls=0;
 await page.route("**/api/lessons",async route=>{
  const original=await (await route.fetch()).json();
  await route.fulfill({json:{...original,tutor_enabled:true,public_tutor_enabled:true,guest_daily_limit:2}});
 });
 await page.route("**/api/tutor/allowance",route=>route.fulfill({
  json:{enabled:true,available:false,status:"trial_exhausted",remaining_today:0,remaining_total:0,daily_limit:2}
 }));
 await page.route("**/api/mentor",route=>{calls++;return route.fulfill({status:429,json:{error:"budget exhausted"}});});
 await page.goto("/debug");
 await page.locator("#check").click();
 await expect(page.locator("#result")).toBeVisible();
 await expect(page.locator("#serv-diagnostic")).toBeVisible();
 await expect(page.locator("#serv-explain")).toBeDisabled();
 await expect(page.locator("#serv-diagnostic-status")).toContainText("shared SERV trial is exhausted");
 expect(calls).toBe(0);
});


test("all four learning modules stay discoverable without a horizontal scroll on phones",async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto("/learn");
 const nav=page.locator("#lesson-nav");
 await expect(nav.locator(".nav-lesson")).toHaveCount(4);
 for(let i=0;i<4;i++)await expect(nav.locator(".nav-lesson").nth(i)).toBeInViewport();
 const overflow=await nav.evaluate(x=>x.scrollWidth-x.clientWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});


test("capture public route previews for visual QA (no credentials, no paid SERV calls)",async({page},testInfo)=>{
 const screens=[
   ["/","home"],["/learn","learn"],["/try","build"],["/debug","debug"],["/docs","docs"]
 ];
 for(const [route,name] of screens){
  await page.goto(route);
  if(route==="/learn"||route==="/try"){
    await expect(page.locator("#lesson-nav .nav-lesson")).toHaveCount(4);
  }
  await page.screenshot({
    path:"test-results/qa-"+testInfo.project.name+"-"+name+".png",
    fullPage:false,animations:"disabled"
  });
 }
});


test("debug hero teaches SERV's specific role without claiming an executed call",async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto("/debug");
 await expect(page.locator(".debug-hero-preview")).toBeVisible();
 await expect(page.locator(".debug-hero-preview")).toContainText("Ask SERV why it matters");
 await expect(page.locator(".debug-hero-preview")).toContainText("WORKFLOW EXAMPLE");
 await page.locator(".debug-hero-link").click();
 await expect(page).toHaveURL(/\/debug#editor$/);
 await page.setViewportSize({width:375,height:812});
 await expect(page.locator(".debug-hero-preview")).toBeHidden();
 await expect(page.locator("#editor")).toBeVisible();
});


test("all routes remain within 320px viewport after fonts settle",async({page})=>{
 await page.setViewportSize({width:320,height:850});
 for(const route of ["/","/learn","/try","/debug","/docs"]){
   await page.goto(route,{waitUntil:"load"});
   await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   expect(overflow,route+" overflow at 320px").toBeLessThanOrEqual(2);
 }
});


test("SERV visual walkthrough is accessible, clickable and no-spend at 320px",async({page})=>{
 let inferenceCalls=0;
 page.on("request",request=>{
   if(["/api/mentor","/api/try-serv","/api/debug/explain"].includes(new URL(request.url()).pathname))inferenceCalls++;
 });
 await page.setViewportSize({width:320,height:850});
 for(const route of ["/","/learn"]){
   await page.goto(route,{waitUntil:"load"});
   const map=page.locator("[data-serv-map] .serv-map");
   await expect(map).toBeVisible();
   const stages=map.locator("[data-serv-step]");
   await expect(stages).toHaveCount(4);
   await expect(stages.nth(0)).toHaveAttribute("aria-pressed","true");
   await stages.nth(2).click();
   await expect(stages.nth(2)).toHaveAttribute("aria-pressed","true");
   await expect(map.locator("[data-serv-title]")).toHaveText("Ask SERV to explain the why.");
   await expect(map.locator("[data-serv-link]")).toHaveAttribute("href","/debug");
   await stages.nth(3).click();
   await expect(map.locator("[data-serv-sample]")).toContainText("NOT EXECUTED");
   await expect(map.locator("[data-serv-link]")).toHaveAttribute("href","/try");
   await expect(map).toContainText("no API calls or changes saved learning progress");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   expect(overflow,route+" visual overflow at 320px").toBeLessThanOrEqual(2);
 }
 expect(inferenceCalls).toBe(0);
});


test("every active lesson has a distinct OpenServ visual, without inference or changes to lesson progress",async({page})=>{
 let paid=0;
 page.on("request",request=>{
   if(["/api/mentor","/api/try-serv","/api/debug/explain"].includes(new URL(request.url()).pathname))paid++;
 });
 await page.setViewportSize({width:320,height:850});
 await page.goto("/learn");
 const expected=[
  ["Task","Workflow","Agent","not a live workflow trace"],
  ["Application","SERV API","Your code","Chat Completions API"],
  ["Facts","Exact code","SERV","arithmetic and hard limits"],
  ["System","User","Preview","NOT an executed API request"]
 ];
 for(let i=0;i<expected.length;i++){
   await page.locator("#lesson-nav .nav-lesson").nth(i).click();
   await expect(page.locator("#lesson-concept-title")).toHaveText("See the concept in action");
   await expect(page.locator("#concept-a-title")).toHaveText(expected[i][0]);
   await expect(page.locator("#concept-b-title")).toHaveText(expected[i][1]);
   await expect(page.locator("#concept-c-title")).toHaveText(expected[i][2]);
   await expect(page.locator("#lesson-concept-summary")).toContainText(expected[i][3]);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   expect(overflow,"concept illustration overflow in lesson "+(i+1)).toBeLessThanOrEqual(2);
 }
 expect(paid).toBe(0);
 await expect(page.locator("#progress-count")).toHaveText("0 of 4");
});


test("editing a debug blueprint invalidates previous validation and SERV explanation",async({page})=>{
 let paid=0;
 page.on("request",request=>{
   if(["/api/mentor","/api/try-serv"].includes(new URL(request.url()).pathname))paid++;
 });
 await page.setViewportSize({width:320,height:850});
 await page.goto("/debug");
 await expect(page.locator('[data-repair-state="inspect"]')).toHaveClass(/is-current/);
 await expect(page.locator("#repair-verify-label")).toContainText("No valid repair");
 await page.locator("#check").click();
 await expect(page.locator("#result")).toBeVisible();
 await expect(page.locator("#repair-inspect-label")).toContainText("Issues detected");
 await expect(page.locator("#serv-diagnostic")).toBeVisible();
 await page.locator("#editor").fill(JSON.stringify(validBlueprint,null,2));
 await expect(page.locator("#result")).toBeHidden();
 await expect(page.locator("#serv-diagnostic")).toBeHidden();
 await expect(page.locator("#serv-explain")).toBeDisabled();
 await page.locator("#check").click();
 await expect(page.locator("#solution")).toBeVisible();
 await expect(page.locator("#repair-verify-label")).toContainText("Validated");
 // A valid checker result must NOT imply that optional SERV inference occurred.
 await expect(page.locator('[data-repair-state="reason"]')).not.toHaveClass(/is-complete/);
 await expect(page.locator('[data-repair-state="verify"]')).toHaveClass(/is-current/);
 await expect(page.locator("#solution")).toContainText("PREVIEW ONLY");
 await page.locator("#editor").fill('{"endpoint":"invalid"}');
 await expect(page.locator("#solution")).toBeHidden();
 await expect(page.locator("#result")).toBeHidden();
 await expect(page.locator("#serv-diagnostic")).toBeHidden();
 await expect(page.locator("#repair-verify-label")).toContainText("No valid repair");
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
 expect(paid).toBe(0);
});

test("developer docs search is local, helps find sections and works on mobile",async({page})=>{
 let paid=0;
 page.on("request",request=>{
   if(["/api/mentor","/api/try-serv"].includes(new URL(request.url()).pathname))paid++;
 });
 await page.setViewportSize({width:320,height:850});
 await page.goto("/docs");
 const search=page.locator("#docs-search");
 await expect(search).toBeVisible();
 await search.fill("architecture");
 await expect(page.locator('#docs-sections a[href="#architecture"]')).toBeVisible();
 await expect(page.locator("#docs-search-status")).toContainText("matching guide");
 await search.fill("zzzz-not-a-guide-phrase");
 await expect(page.locator("#docs-search-status")).toContainText("No matching guides");
 await expect(page.locator('#docs-sections a:visible')).toHaveCount(0);
 await search.fill("");
 await expect(page.locator('#docs-sections a:visible')).toHaveCount(9);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
 expect(paid).toBe(0);
});


test("illustrated OpenServ hero displays original art and changes stages without inference",async({page})=>{
 let paid=0;
 page.on("request",request=>{
   if(["/api/mentor","/api/try-serv"].includes(new URL(request.url()).pathname))paid++;
 });
 for(const width of [320,375,768,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto("/",{waitUntil:"load"});
   const art=page.locator(".hero-original-illustration");
   await expect(art).toBeVisible();
   expect(await art.evaluate(img=>img.complete&&img.naturalWidth>0),"original SVG loads at "+width).toBe(true);
   const story=page.locator("[data-hero-explorer]");
   const buttons=story.locator("[data-hero-stage]");
   await expect(buttons).toHaveCount(3);
   await expect(buttons.nth(0)).toHaveAttribute("aria-pressed","true");
   await buttons.nth(1).click();
   await expect(buttons.nth(1)).toHaveAttribute("aria-pressed","true");
   await expect(story.locator("[data-hero-description]")).toContainText("SERV Reasoning");
   await expect(story.locator("[data-hero-link]")).toHaveAttribute("href","/debug");
   await buttons.nth(2).click();
   await expect(story.locator("[data-hero-description]")).toContainText("deterministic");
   await expect(story.locator("[data-hero-link]")).toHaveAttribute("href","/try");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   expect(overflow,"homepage visual has no overflow at "+width).toBeLessThanOrEqual(2);
 }
 expect(paid).toBe(0);
});

test("hero offers reduced-motion artwork and illustration is not presented as live inference",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/");
 await expect(page.locator(".hero-steps-top")).toContainText("NO LIVE API CALL");
 await expect(page.locator(".hero-original-illustration")).toHaveAttribute("alt",/conceptual SERV API workflow/);
 await expect(page.locator("[data-hero-explorer]")).toHaveAttribute("data-hero-current","0");
 const animation=await page.locator(".hero-art-chip-one").evaluate(el=>getComputedStyle(el).animationName);
 expect(animation).toBe("none");
});
