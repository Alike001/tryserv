import {test,expect} from "@playwright/test";

const caseId="11111111-1111-4111-8111-111111111111";
const caseToken="t".repeat(43);
const quote="The site completion register records Site A as completed on 12 August 2026 after a commissioning visit.";
const reviewCase={
 project:{name:"Community Water Access Project",funder:"Community Development Fund",reporting_period:"Q3 2026",currency:"NGN"},
 requirements:[{id:"R1",text:"Report progress against all three approved water-facility milestones."}],
 report_text:"The narrative report says that all three facilities were completed and 500 households were reached during the reporting period.",
 approved_budget_minor:500000000,reported_spend_minor:450000000,
 budget_check:{status:"within_budget",currency:"NGN",approved_minor:500000000,reported_minor:450000000,variance_minor:-50000000,note:"Arithmetic only."},
 financial_reconciliation:{status:"attention_required",summary:"The supplied schedules contain differences or evidence gaps that need human review.",currency:"NGN",schedule_totals:{budget_minor:500000000,expense_minor:450000000},checks:[{type:"category_over_budget",category:"Testing",variance_minor:80000000},{type:"missing_receipt_reference",locator:"Row 5",description:"Water quality",amount_minor:180000000},{type:"receipt_reference_found",reference:"REC-001",locator:"Row 2",supporting_documents:["receipt-register.pdf"]}],issues:[],notes:["Arithmetic checks only."]},
 documents:[{id:"doc-1",name:"site-status.csv",kind:"csv",size_bytes:120,extracted_chars:quote.length,truncated:false,segments:[{id:"doc-1-s1",locator:"Row 2",text:quote}]}],
 source_segments:[],analysis_status:"not_started",review:null,provider:null,analysis_error:null,reviewer_actions:[]
};
const review={
 summary:"The submitted bundle supports one site completion record, but does not establish that all three facilities were completed. The household reach claim also needs reconciliation.",
 review_state:"needs_clarification",
 findings:[{
  id:"F-01",requirement_id:"R1",claim:"All three water facilities were completed.",
  status:"partially_supported",severity:"high",
  explanation:"The supplied site record supports completion of Site A, but the submitted bundle does not include equivalent completion records for the other sites.",
  evidence_refs:[{document_id:"doc-1",document_name:"site-status.csv",segment_id:"doc-1-s1",locator:"Row 2",quote}],
  missing_items:["Completion records for Sites B and C."],
  suggested_question:"Can the project team provide the missing commissioning records?"
 }],
 limitations:["Document review cannot establish physical completion.","Missing evidence in this bundle does not prove a claim is false."]
};
async function mockStatus(page,configured=true){
 await page.route("**/api/tabbata/status",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
  storage_configured:configured,serv_configured:configured,model:"gpt-5.4-mini",
  upload_limits:{files:5,per_file_bytes:2097152,total_bytes:8388608}
 })}));
}
test("Tabbas root page is responsive, accessible and its sample preview is clearly illustrative",async({page})=>{
 let inference=0;
 await mockStatus(page,true);
 page.on("request",request=>{if(new URL(request.url()).pathname.endsWith("/analyze"))inference++;});
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  await expect(page.getByRole("heading",{level:1})).toContainText("Check the report");
  await expect(page.getByRole("link",{name:/Start a review/i}).first()).toBeVisible();
  await expect(page.locator("#case-form")).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow,"horizontal overflow at "+width).toBeLessThanOrEqual(2);
 }
 await page.setViewportSize({width:375,height:812});
 await page.goto("/");
 await page.getByRole("button",{name:/Explore a sample pack/i}).click();
 await expect(page.locator("#project-name")).toHaveValue("Community Water Access Project");
 await expect(page.locator("#file-list .file-item")).toHaveCount(5);
 await expect(page.locator("#form-status")).toContainText("No SERV request");
 await page.locator('[data-preview="1"]').click();
 await expect(page.locator("#preview-detail h3")).toContainText("500 households");
 await expect(page.locator('[data-preview="1"]')).toHaveAttribute("aria-pressed","true");
 await page.keyboard.press("Tab");
 expect(inference).toBe(0);
});
test("a report pack is created without inference; SERV runs only after explicit click",async({page})=>{
 await mockStatus(page,true);
 let createBody=null,analysisCalls=0,actions=[];
 await page.route("**/api/tabbata/cases**",async route=>{
  const request=route.request();const url=new URL(request.url());const method=request.method();
  if(url.pathname==="/api/tabbata/cases"&&method==="POST"){
   createBody=request.postDataJSON();
   await route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({
    case_id:caseId,case_token:caseToken,expires_at:"2026-11-15T00:00:00.000Z",review_case:reviewCase
   })});return;
  }
  if(url.pathname.endsWith("/analyze")&&method==="POST"){
   analysisCalls++;
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
    analysis_status:"complete",review,budget_check:reviewCase.budget_check,
    provider:{model:"gpt-5.4-mini-2026-03-17",completion_id:"serv-live-completion",latency_ms:8200,usage:{input_tokens:900,output_tokens:500}},reused:false
   })});return;
  }
  if(url.pathname.endsWith("/actions")&&method==="POST"){
   actions.push(request.postDataJSON());
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
    reviewer_actions:actions.map((action,index)=>({id:"A-"+(index+1),...action,created_at:"2026-11-14T10:00:00Z"}))
   })});return;
  }
  if(url.pathname.endsWith("/"+caseId)&&method==="DELETE"){
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({deleted:true})});return;
  }
  await route.fulfill({status:404,contentType:"application/json",body:JSON.stringify({error:"Unexpected route"})});
 });
 await page.goto("/");
 await page.getByRole("button",{name:/Load fictional sample pack/i}).click();
 await page.getByRole("button",{name:/Create review workspace/i}).click();
 await expect(page.locator("#workspace-title")).toHaveText("Community Water Access Project");
 await expect(page.locator("#case-status")).toHaveText("Ready to analyze");
 expect(createBody.files).toHaveLength(3);
 expect(createBody.files.map(file=>file.name)).toContain("household-register.csv");
 expect(createBody.budget_schedule_file.name).toBe("approved-budget.csv");
 expect(createBody.expense_schedule_file.name).toBe("expense-schedule.csv");
 await expect(page.locator("#financial-check")).toContainText("Testing");
 await expect(page.locator("#financial-check")).toContainText("receipt-register.pdf");
 expect(analysisCalls).toBe(0);
 await expect(page.locator("#analysis-cta")).toBeVisible();
 await page.locator("#analyze-case").click();
 await expect(page.locator("#review-summary")).toContainText("does not establish");
 await expect(page.locator("#review-findings")).toContainText("Partially supported");
 await expect(page.locator("#review-findings")).toContainText(quote);
 await expect(page.locator("#review-provider")).toContainText("serv-live-completion");
 expect(analysisCalls).toBe(1);
 await page.locator("#review-note").fill("Please attach the missing Site C commissioning record.");
 await page.locator("#request-clarification").click();
 await expect(page.locator("#reviewer-action-list")).toContainText("Clarification requested");
 await page.locator("#mark-reviewed").click();
 await expect(page.locator("#reviewer-action-list")).toContainText("Findings marked reviewed");
 expect(actions).toHaveLength(2);
 await page.evaluate(()=>{window.__printed=false;window.print=()=>{window.__printed=true;};});
 await page.locator("#print-report").click();
 expect(await page.evaluate(()=>window.__printed)).toBe(true);
 page.on("dialog",dialog=>dialog.accept());
 await page.locator("#delete-case").click();
 await expect(page.locator("#case-workspace")).toBeHidden();
 expect(analysisCalls).toBe(1);
});
test("a narrative report can be uploaded instead of pasted",async({page})=>{
 await mockStatus(page,true);
 let createBody=null;
 const reportText="This uploaded narrative report states that the community water project completed all three planned facilities during the reporting period.";
 const reportDoc={id:"doc-1",name:"narrative-report.txt",kind:"txt",size_bytes:120,extracted_chars:reportText.length,truncated:false,segments:[{id:"doc-1-s1",locator:"Line 1",text:reportText}]};
 const supportDoc={id:"doc-2",name:"site-log.txt",kind:"txt",size_bytes:100,extracted_chars:quote.length,truncated:false,segments:[{id:"doc-2-s1",locator:"Line 1",text:quote}]};
 await page.route("**/api/tabbata/cases",async route=>{
  createBody=route.request().postDataJSON();
  await route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({
   case_id:caseId,case_token:caseToken,expires_at:"2026-11-15T00:00:00Z",
   review_case:{...reviewCase,report_text:reportText,report_document:reportDoc,documents:[supportDoc]}
  })});
 });
 await page.goto("/");
 await page.locator("#project-name").fill("Community Water Access Project");
 await page.locator("#reporting-period").fill("Q3 2026");
 await page.locator("#requirements").fill("Report progress against all approved water facility milestones.");
 await page.locator("#report-file").setInputFiles({name:"narrative-report.txt",mimeType:"text/plain",buffer:Buffer.from(reportText)});
 await page.locator("#evidence-files").setInputFiles({name:"site-log.txt",mimeType:"text/plain",buffer:Buffer.from(quote)});
 await expect(page.locator("#file-list .file-item")).toHaveCount(2);
 await page.locator("#create-case").click();
 await expect(page.locator("#workspace-title")).toHaveText("Community Water Access Project");
 expect(createBody.report_file.name).toBe("narrative-report.txt");
 expect(createBody.report_text).toBe("");
 expect(createBody.files).toHaveLength(1);
 await expect(page.locator("#case-documents")).toContainText("Narrative report: narrative-report.txt");
 await expect(page.locator("#case-documents")).toContainText("Supporting evidence: site-log.txt");
});

test("without configured storage the workspace is disabled and no review request can be sent",async({page})=>{
 await mockStatus(page,false);
 let requests=0;
 page.on("request",request=>{if(request.url().includes("/api/tabbata/cases"))requests++;});
 await page.goto("/");
 await expect(page.locator("#create-case")).toBeDisabled();
 await page.getByRole("button",{name:/Load fictional sample pack/i}).click();
 await expect(page.locator("#file-list .file-item")).toHaveCount(5);
 expect(requests).toBe(0);
});
test("reduced-motion preference disables decorative flow animation",async({page})=>{
 await mockStatus(page,true);
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/");
 const animation=await page.locator(".reason-orbit").evaluate(element=>getComputedStyle(element).animationName);
 expect(animation).toBe("none");
});
