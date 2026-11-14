# Tabbas — Delivery Roadmap

**Last updated:** 2026-11-14  
**Product:** Tabbas — donor report-pack review  
**Repository:** `Alike001/tryserv`  
**Production:** https://tryserv.onrender.com/

This is the working delivery plan. It separates what is implemented from what is actually accepted. A passing mock test or successful deployment is not proof that the live provider workflow works.

## Current verified position

### Implemented

- Root TrySERV experience pivoted to Tabbas, with a focused donor-report review workflow.
- Project/funder/report-period/requirements capture and narrative input.
- Fictional illustrative sample preview that does not call SERV.
- PDF, DOCX, XLSX, CSV, TXT and Markdown upload/extraction with source locators and upload limits.
- Deterministic budget and expense-schedule reconciliation, including schedule totals, category comparisons, duplicate/blank/unmatched references and reporting-period checks.
- Private case workspaces with random access tokens, hashed token storage, short retention and explicit deletion.
- Explicit Analyze with SERV action; durable shared allowance reservation; no automatic retry.
- OpenServ Responses API integration for GPT-5.4-mini, medium reasoning, forced `submit_report_review` function tool, source-ID/exact-quote validation and fail-closed handling.
- Reviewer actions and print-friendly browser report interface.
- Production no-inference smoke check: health, Neon storage, SERV configuration, private case create/read/delete and cleanup.
- CI: 104 Node tests passed; 74 desktop/mobile Playwright journeys passed on the last fully verified test run.

### Not yet accepted

Two authorised fictional production analyses reached the provider but neither produced a complete review:

1. Earlier Chat Completions request returned HTTP 502.
2. Responses API request returned `incomplete` because the original `max_output_tokens: 2800` limit was exhausted.

Both fictional cases were deleted. No retry was made. The code now uses an 8,000-token output budget and reports bounded output-token diagnostics. The revised code passed Node CI and was deployed; browser CI for the latest documentation revision was still running at the time of this update. A successful live review has **not** been demonstrated. The remaining 18 shared guest credits are not a reason to spend another one without explicit approval.

## P0 — finish and accept the core workflow

These are the release blockers. Do not broaden the product until they are closed.

### 1. Complete the SERV Responses integration

- [x] Move GPT-5.4-mini function calling to the Responses API.
- [x] Keep medium reasoning and forced structured function output.
- [x] Fail closed on incomplete or malformed responses.
- [x] Increase the output budget from 2,800 to 8,000 tokens.
- [x] Add bounded diagnostics for provider errors and incomplete output.
- [x] Test request shape, provider parsing, provenance, prompt-injection handling and incomplete-response handling with mocks.
- [x] Deploy the revised integration.
- [ ] Confirm latest Node and browser CI are green.
- [ ] After separate user approval, perform one new live test with the same fictional pack; do not retry automatically.
- [ ] Capture provider model, response ID, latency and token usage.
- [ ] Confirm the returned review is complete and persisted.

### 2. Verify the quality of the live findings

- [ ] Manually compare every displayed quotation with the exact source file and row/page/line.
- [ ] Confirm the household reach mismatch (500 reported versus 420 in the supplied register) is described accurately.
- [ ] Confirm the Site C commissioning/testing conflict is surfaced without claiming physical verification.
- [ ] Confirm the duplicate and blank receipt references and category arithmetic are explained as review flags, not fraud.
- [ ] Confirm unsupported or invented citations are downgraded and never shown as supported.
- [ ] Confirm the model does not make audit, eligibility, funding or approval decisions.

### 3. Finish reviewer workflow acceptance

- [ ] Record “mark reviewed” and “request clarification” actions.
- [ ] Reload the case and verify actions and timestamps persist.
- [ ] Verify actions are linked to the correct finding and cannot be written without the case token.
- [ ] Verify case deletion removes the record and the browser session is cleared.
- [ ] Verify expiry behavior and the 24-hour retention statement.

### 4. Verify the report output

- [ ] Print / Save PDF on desktop and mobile.
- [ ] Check page breaks, tables, long quotations, source references, financial flags and footer disclaimers.
- [ ] Ensure no controls, hidden form fields or private tokens appear in the printed report.
- [ ] Decide whether browser print is sufficient for the hackathon MVP; server-generated PDF/DOCX remains post-MVP unless needed for the demo.

### 5. Recheck security and operational limits

- [ ] Verify file count, per-file and total size limits, extraction limits and archive-expansion limits.
- [ ] Test malformed PDFs, DOCX/XLSX ZIP containers, invalid CSV, unsupported extensions and formula cells.
- [ ] Verify all case GET/action/DELETE routes require the token and return no-store headers.
- [ ] Verify logs never include document contents, full financial schedules, case tokens or provider credentials.
- [ ] Verify the shared guest allowance remains durable and unchanged; no reset, bypass or automatic retry.
- [ ] Confirm case creation limits and safe failure when Neon or SERV is unavailable.

## P1 — improve product quality and real-world usability

Start these after the P0 flow is stable.

### 6. Make the review experience easier to use

- [ ] Conduct a focused UX review of the landing page, form, upload states, workspace and findings.
- [ ] Improve upload guidance: accepted formats, file limits, report-vs-supporting-document roles and what happens to files.
- [ ] Improve validation messages for missing requirements, malformed schedules, unsupported headers and oversized files.
- [ ] Make the finding cards easier to scan: requirement, claim, status, severity, explanation, evidence and next question.
- [ ] Make each source reference easier to locate in the uploaded material.
- [ ] Add clear loading, empty, success, failure and expired-case states.
- [ ] Ensure the single-page flow has consistent navigation and a clear route back to the report pack.
- [ ] Manually inspect 320, 375, 768, 1024 and 1440 px widths on real browsers.
- [ ] Conduct keyboard and screen-reader review; Playwright accessibility smoke tests are not a substitute for a human audit.

### 7. Strengthen financial schedule handling

- [ ] Expand regression cases for negative values, decimals, currency precision, duplicate references, blank references, unmatched receipts and out-of-period transactions.
- [ ] Test ambiguous and duplicated column headings and totals.
- [ ] Test CSV quoting, multiline cells and malformed rows.
- [ ] Test XLSX formulas, error cells, hidden sheets and multiple worksheets.
- [ ] Improve error guidance for unsupported regional number/date formats.
- [ ] Keep every arithmetic flag traceable to the exact source row.
- [ ] Never infer receipt authenticity or expense eligibility from a text match.

### 8. Validate with actual users

- [ ] Recruit one NGO programme/M&E officer and one finance/report reviewer.
- [ ] Observe them completing the workflow without coaching.
- [ ] Record where they hesitate, misunderstand a status or cannot find a source.
- [ ] Ask whether the output changes their pre-submission review process.
- [ ] Test the willingness-to-pay hypothesis without presenting it as proven.
- [ ] Only describe interviews or tester feedback after they have actually happened.

## P2 — post-pilot improvements

These are not prerequisites for a focused hackathon MVP:

- Interactive column mapping and explicit multi-sheet selection for financial XLSX files.
- More regional number and date formats.
- OCR for scanned PDFs, with clear confidence and human-review safeguards.
- Server-generated PDF/DOCX exports.
- Organisation accounts, roles and team workspaces.
- Multiple reviewers, assignments and secure sharing.
- Configurable retention and a durable audit log.
- Donor-template import.

## Explicitly out of scope for this build

Do not dilute the product with grant discovery, donor-portal automation, bank integrations, WhatsApp, payroll, beneficiary case management, GPS/photo authenticity, automatic approvals or fraud detection. Tabbas is a pre-submission review of one prepared report pack; it is not a field-verification or audit platform.

## Release gate

Tabbas may be described as a **working pilot** only after a complete live SERV response is source-validated and persisted, reviewer actions survive reload, PDF output is checked, deletion works, and the critical security checks pass. It may be described as **validated with users** only after real NGO and finance reviewers have completed observed sessions. Never claim adoption, revenue, physical verification or audit certification without evidence.
