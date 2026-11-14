# Tabbata — Hackathon Demo Script

**Target length:** 2–3 minutes  
**Demo data:** Fictional Community Water Access Project  
**Important:** The sample preview is illustrative. Only call a finding "SERV-generated" after the actual Analyze action succeeds and its completion ID / token usage are visible.

## Before recording

1. Open the deployed Tabbata root page and hard refresh.
2. Confirm `/healthz` reports `service: tabbata`.
3. Confirm `/api/tabbata/status` reports storage and SERV configured.
4. Confirm the existing shared guest allowance has capacity. Do not reset or increase it.
5. Use only the fictional sample pack. Do not upload real beneficiary information.
6. Capture the actual SERV review after one explicit click. Do not reuse a mocked browser-test response or present the static illustration as live output.
7. If the live review cannot run, do not fabricate a result. Record the limitation and do not claim live acceptance.

## Recording walkthrough

### 0:00–0:20 — The problem

"Donor reports bring together a narrative, financial schedule and supporting documents. Requirements vary between funders, and checking whether every claim is supported across those files takes time. Tabbata is a focused pre-submission review workspace—not another grant-management platform."

### 0:20–0:45 — Create a report pack

"Here is a fictional community water project. We enter the funder requirements, reporting period, approved budget and reported expenditure. Then we paste or upload the narrative report and add supporting files."

Click **Load fictional sample pack**. Point out the site status log, household register, expense schedule and field notes. Explain that the figures are synthetic.

### 0:45–1:05 — Create the private workspace

"Creating the workspace extracts the supporting files and keeps source locations such as CSV rows and document pages. It does not call SERV. The workspace is private to this browser session and expires after 24 hours; we can delete it sooner."

Click **Create review workspace**. Show the supporting-document list and deterministic budget check.

### 1:05–1:45 — Run SERV Reasoning

"Now I explicitly choose Analyze with SERV. This is the one point where we spend a unit from the existing shared inference allowance. SERV reasons across the requirements, narrative claims and supporting excerpts. It returns a structured review rather than a generic chat response."

Click **Analyze with SERV**. Show the actual output and the provider model, completion ID, latency and token usage.

Use only findings actually returned in this live run. If a finding is downgraded because its quotation did not match the source exactly, explain that the backend withheld the unsupported citation.

### 1:45–2:15 — Show evidence and deterministic checks

"Each evidence quotation is checked by our backend against the extracted source segment before it can appear as support. The budget comparison is ordinary deterministic arithmetic, not an AI calculation. Missing evidence means it was not found in this submitted bundle; it does not prove the real-world claim is false."

Open one finding and show its document and row/page locator. Show the budget comparison separately.

### 2:15–2:35 — Human review and limitations

"The reviewer can record a note or request clarification. Tabbata does not approve funding, certify an audit, detect fraud or verify physical delivery. A human remains responsible for the decision."

Record a clarification request, then show Print / Save PDF. Optionally delete the case.

### 2:35–2:50 — Why SERV

"OpenServ SERV Reasoning is central to the cross-document interpretation and evidence-to-claim mapping. Deterministic code handles parsing, arithmetic, schema checks and exact citation validation. This combination makes the result inspectable and bounded."

## Evidence to retain with the submission

- GitHub Actions run showing Node and Playwright results.
- Production health and readiness response (no secrets).
- Screenshot/recording of the actual live SERV review.
- Completion ID, model, latency and token usage from that review.
- Screenshot of source-linked finding and reviewer action.
- Screenshot of the print-ready report.
- Explicit note that the project scenario is synthetic.

## Claims not to make

- "Tabbata verified the project happened."
- "The receipts are authentic."
- "SERV detected fraud."
- "The report passed an audit."
- "A funder approved the project."
- "NGOs are already using Tabbata."
- "We have paying customers or revenue."
- "We conducted human testing" unless real testers have participated.
