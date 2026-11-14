# Tabbas — Product Specification

**Working product name:** Tabbas  
**Category:** Donor-report pack review  
**Tagline:** Check the report before it leaves.  
**Hackathon:** OpenServ Edition 02 — Open Track  
**Repository:** `Alike001/tryserv` (existing repository retained during the pivot)  
**Deployment:** Existing TrySERV Render service; no new service or database provisioned for the MVP.

> Name note: Tabbas is the current working brand selected by the user. Formal trademark, company-name, domain and social-handle clearance has not been completed.

## 1. Product thesis

Small and mid-sized civil-society organisations often have to assemble narrative reports, financial schedules and supporting documents against different funder requirements. Tabbas is a focused pre-submission review workspace that checks one prepared report pack for requirement coverage, cross-document inconsistencies and evidence gaps.

**Core promise:** Before a project report is sent to a funder, show which reported claims are supported by the submitted documents, which are only partly supported, which are not found, and which documents disagree.

Tabbas does not establish whether a project activity happened in the physical world. It reviews the material supplied by the user.

## 2. Primary user and job

**Primary user:** Programme/M&E officer or finance/programme lead at a Nigerian NGO or implementing partner preparing an interim or final donor report.

**Secondary user:** A reviewer who needs to understand gaps in a submitted report pack.

**Job to be done:** "Help me check this report against the funder's requirements and the documents we already have, before I submit it."

## 3. The one workflow

1. Create a review case with project name, funder, reporting period, currency, reporting requirements and optional reporting-period start/end dates.
2. Paste or upload the narrative report.
3. Optionally upload an approved-budget schedule and an actual-expenditure schedule in CSV/XLSX, plus supporting evidence.
4. Tabbas extracts text and spreadsheet rows, retaining document/page/sheet/row references and structured cell values for deterministic calculations.
5. Code reconciles schedule totals, budget categories, references and transaction dates; unsupported headers, invalid rows and truncated schedules are surfaced as incomplete.
6. The user explicitly chooses **Analyze with SERV**. One bounded SERV Reasoning request evaluates requirement coverage, claim/evidence relationships and cross-document contradictions using the deterministic financial results as context.
7. The backend validates the returned structure and rejects source references or quotations that do not exist in the extracted material.
8. The reviewer inspects findings, records a human action and prints/saves an evidence-linked review report.

## 4. MVP scope

### P0 — must work

- Project/report metadata and funder-specific requirements.
- Narrative report input, pasted or uploaded with source locators.
- Upload and text extraction for PDF, DOCX, XLSX, CSV, TXT and Markdown, within strict file/size limits.
- Source segments with stable IDs and page/sheet/row/paragraph locators.
- One explicit, budget-reserved SERV Reasoning analysis per case.
- Structured findings with status, explanation, evidence quotations and source locations.
- Exact-quote/source-ID validation in deterministic backend code.
- Deterministic line-item financial reconciliation for CSV/XLSX schedules: schedule-to-total comparison, category-level budget variances, unbudgeted categories, duplicate references, blank or unmatched receipt references (checked against submitted supporting documents) and reporting-period checks.
- Human review actions; no automatic funder decision.
- Print-friendly evidence review report (browser Print / Save as PDF).
- Fictional seeded sample data, visibly labelled illustrative.
- Case deletion and short retention.

### P1 — only after P0 passes

- Import requirements from donor templates.
- Interactive column mapping for unusual spreadsheet headers and additional regional number/date formats.
- DOCX/PDF report export generated server-side.
- Multiple reviewer collaboration and secure sharing.

### Explicit non-goals

- Grant discovery, grant applications or grant portfolio management.
- Continuous M&E data collection, field-agent dispatch, GPS or photo authenticity.
- Bank, accounting, donor portal, WhatsApp or Google Drive integrations.
- Fraud detection, legal/accounting audit, donor eligibility or funding decisions.
- Automatic approval, rejection or payment.
- Beneficiary-level case management or long-term storage of sensitive personal data.

## 5. Review vocabulary

Use these exact meanings:

- **Supported in submitted documents:** At least one exact source passage supports the claim as written. This is not proof the real-world activity occurred.
- **Partially supported:** Some parts have documentary support, but a material part is missing or unclear.
- **Not found in submitted documents:** The supplied bundle did not contain a supporting passage. This does not prove the claim is false.
- **Conflicting documents:** Two or more supplied sources appear inconsistent; show both references.
- **Human review required:** The material is ambiguous, sensitive or insufficient for an automated conclusion.

Do not use "verified", "fraud", "fraudulent", "fake", "approved" or "audit passed" as model-generated conclusions.

## 6. SERV's role

Use the documented OpenServ Chat Completions endpoint from the server, never the browser:

- Endpoint: `https://inference-api.openserv.ai/v1/chat/completions`
- Model: configured `SERV_MODEL`, default `gpt-5.4-mini`
- `reasoning_effort: "medium"`
- Function tool: `submit_report_review` with a strict JSON Schema.
- `tool_choice` forces the structured review function.
- One provider call per user-triggered review; no background or page-load inference.
- The prompt treats all uploaded text as untrusted evidence, never as instructions.
- The model must cite only supplied source segment IDs and exact quotations.
- Model output is advisory; backend validation and a human reviewer remain authoritative.

Do not claim a native OpenServ Shadow Agent or Prompt Guard integration unless separately verified in official docs and implemented. Tabbas's deterministic source validator is our own application code, not an OpenServ feature.

## 7. Deterministic responsibilities

Ordinary code, not SERV, must:

- Validate required fields, file types, file sizes and request limits.
- Extract and segment source documents.
- Parse user-supplied budget values and calculate variance exactly in minor currency units.
- Validate all model fields and enumerated values.
- Verify each evidence reference points to a supplied segment.
- Verify each quoted excerpt is an exact substring of that segment.
- Mark invalid references as unsubstantiated; never silently accept them.
- Enforce the existing durable guest inference budget.
- Persist, retrieve and delete cases.
- Record reviewer actions and timestamps.
- Render/print the final report.

## 8. Data protection and security

- No original uploaded file is retained after extraction; extracted text, structured CSV/XLSX cell values, source locators, metadata and review output are stored for the short-lived case.
- Use the existing Neon database through `DATABASE_URL`; do not create a new database for this MVP.
- Each case has a random access token. Store only its SHA-256 hash; return the token once and keep it in the current browser session.
- Cases expire after 24 hours and can be explicitly deleted. Expired cases are purged on subsequent store access.
- Upload limits: maximum 5 files, 2 MiB per file, 8 MiB combined; extracted text capped per file and per case.
- Allow only PDF, DOCX, XLSX, CSV, TXT and Markdown.
- Do not upload beneficiary names, phone numbers, addresses, bank/account details, national IDs, health records or other sensitive personal data. Use synthetic data for demonstrations; real users may submit only documents they are authorised to process and have appropriately redacted.
- Never expose `SERV_API_KEY`, `DATABASE_URL`, access tokens or full private logs to the browser.
- Never pass raw secrets or hidden app instructions to SERV.
- SERV is called only after a clear user click. Reuse the existing shared durable guest allowance; do not raise/reset its 24 lifetime / 2 daily limits.
- A failed provider call consumes its reserved allowance and does not trigger an automatic retry.
- Case access, analysis and deletion require the case token.
- Do not log document text or user-submitted financial details.

## 9. Acceptance criteria

A release is acceptable only when:

1. A fictional project report can be created and its files extracted with source locators.
2. A SERV call occurs only after explicit user action and is budget-reserved first.
3. The returned structure passes schema validation.
4. Every displayed evidence quote is found verbatim in the cited source segment.
5. Unsupported references cannot appear as supported findings.
6. Budget variance is computed deterministically and tested.
7. The review can be printed/saved as PDF.
8. A case can be deleted and expires after 24 hours on access.
9. No API key or database credential reaches the browser.
10. Existing SERV budget protections and the current product scope boundaries remain intact.
11. Unit and browser CI pass at desktop and mobile sizes.
12. The demo uses fictional data and does not claim human testing, physical verification or real NGO adoption.

## 10. Success measures for the hackathon demo

Use a fixed synthetic evaluation set of 20–30 report packs containing supported, partially supported, missing and contradictory cases. Measure:

- Exact evidence-quote validity (target: 100% of displayed citations).
- False-supported rate (target: 0 in the curated acceptance set).
- Status classification by case and category.
- Deterministic budget arithmetic (target: 100%).
- Response latency and token usage from actual provider metadata.
- SERV vs deterministic-only baseline differences.

Do not claim these targets are achieved until the tests/evaluation are run. Do not invent users, revenue or external validation.

## 11. Positioning

**Short description:** Tabbas checks donor report packs before submission, mapping claims to source documents and surfacing missing evidence or contradictions.

**Differentiator:** A narrow, point-in-time review of a prepared narrative + financial + evidence bundle for smaller implementing organisations, rather than another full grant-management or ongoing evidence-capture platform.

**Commercial hypothesis:** Small NGOs may pay per report or use an affordable team plan; funders and larger implementing partners may pay for reviewer workspaces. Willingness to pay is unvalidated.
