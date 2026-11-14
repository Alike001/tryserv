import {test,expect} from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base="https://tryserv.onrender.com";
const reportDir=path.resolve("production-evidence");
fs.mkdirSync(reportDir,{recursive:true});
const note=(name,data)=>fs.writeFileSync(path.join(reportDir,name+".json"),
 JSON.stringify({checked_at:new Date().toISOString(),environment:"Tabbata public Render production",...data},null,2)+"\n");

test("public production: Tabbata report-review interface is responsive and makes no inference automatically",async({page})=>{
 let inference=0;
 page.on("request",request=>{
  const url=new URL(request.url());
  if(url.pathname==="/api/tabbata/cases"&&request.method()==="POST")return;
  if(url.pathname.endsWith("/analyze")||url.pathname==="/api/mentor"||url.pathname==="/api/try-serv")inference++;
 });
 const health=await page.request.get(base+"/healthz");
 expect(health.status()).toBe(200);
 expect((await health.json()).service).toBe("tabbata");
 const status=await page.request.get(base+"/api/tabbata/status");
 expect(status.status()).toBe(200);
 const readiness=await status.json();
 expect(readiness).toHaveProperty("storage_configured");
 expect(readiness).toHaveProperty("serv_configured");
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  const response=await page.goto("/",{waitUntil:"load"});
  expect(response.status()).toBe(200);
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole("heading",{level:1})).toContainText("Check the report");
  await expect(page.locator("#case-form")).toBeVisible();
  await expect(page.locator('link[href="/tabbata.css"]')).toHaveCount(1);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow,"Tabbata horizontal overflow at "+width).toBeLessThanOrEqual(2);
 }
 await page.setViewportSize({width:375,height:812});
 await page.goto("/");
 await page.getByRole("button",{name:/Explore a sample pack/i}).click();
 await expect(page.locator("#project-name")).toHaveValue("Community Water Access Project");
 await expect(page.locator("#file-list .file-item")).toHaveCount(4);
 await page.locator('[data-preview="1"]').click();
 await expect(page.locator("#preview-detail h3")).toContainText("500 households");
 await expect(page.locator('[data-preview="1"]')).toHaveAttribute("aria-pressed","true");
 expect(inference).toBe(0);
 const legacy=await page.request.get(base+"/legacy");
 expect(legacy.status()).toBe(200);
 note("tabbata-public-journey",{status:"pass",widths:[320,375,768,1024,1440],routes:["/","/legacy"],sample_files:4,automatic_inference_calls:inference,limitations:"No live SERV request was made by this smoke test; no human testing is implied."});
});
