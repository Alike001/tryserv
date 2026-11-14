# Tabbas

**Check the report before it leaves.**

Tabbas is a focused donor-report pack reviewer built on OpenServ SERV Reasoning. It helps a programme/M&E or finance officer review one prepared report bundle against funder requirements before submission.

Bring the narrative report, reporting requirements, approved budget, reported expenditure and supporting documents. Tabbas extracts source passages, asks SERV to reason across the claims and evidence, validates every cited quotation in deterministic code, and leaves the decision with a human reviewer.

> Tabbas reviews the submitted documents. It does not verify that an activity happened in the physical world, prove a receipt is authentic, detect fraud, or provide an audit opinion.

## Why this product

Research on Nigerian civil-society organisations reports that donor requirements, templates, reporting formats and reporting cadence can vary across partners and projects. That makes preparing and reconciling a report pack a plausible administrative pain for smaller implementing organisations. This is a problem hypothesis, not a claim of product-market fit; user interviews are still required.

See [problem and competitor research](docs/TABBATA-RESEARCH.md) for the evidence, limitations and existing alternatives.

## The workflow

1. **Create a review case.** Enter the project, funder, reporting period, currency, requirements and optional budget totals.
2. **Add the narrative report.** Paste the report text or upload one PDF, DOCX, XLSX, CSV, TXT or Markdown report file.
3. **Add financial schedules.** Optionally upload an approved-budget CSV/XLSX and an actual-expenditure CSV/XLSX. Tabbas checks schedule totals, category variances, duplicate references, blank or unmatched receipt references and transaction dates when the reporting period is supplied.
4. **Upload supporting evidence.** Add site records, attendance registers, receipts and other evidence in PDF, DOCX, XLSX, CSV, TXT or Markdown.
5. **Create a private workspace.** Files are extracted with page, sheet, row or paragraph locators. Original binary uploads are not retained; structured spreadsheet cell values are retained for deterministic checks.
6. **Choose Analyze with SERV.** Only this explicit action calls the OpenServ Chat Completions API. It uses one unit from the existing shared durable guest allowance.
7. **Inspect findings.** Review supported-in-document, partial, missing, conflicting and human-review-required findings, with exact source quotations.
8. **Record a reviewer action.** Mark findings reviewed or request clarification.
9. **Print / Save PDF.** Use the browser print dialog to save the review report.


## What makes the review trustworthy

- **SERV handles contextual reasoning:** mapping narrative claims to requirements and supporting document passages.
- **Code handles deterministic work:** input validation, extraction, schedule totals, category-level financial reconciliation, schema validation and exact citation checks.
- **Every displayed citation is checked:** the backend verifies the document ID, segment ID and exact quotation against the extracted source.
- **Invalid citations are downgraded:** unsupported or mismatched quotations cannot appear as supported findings.
- **Humans make decisions:** the product never automatically approves or rejects a project report.

The SERV request uses a forced function tool named `submit_report_review`, `reasoning_effort: "medium"`, and a bounded output schema. Uploaded documents are treated as untrusted data, not instructions. See [architecture and safety](docs/TABBATA-ARCHITECTURE.md).

## Current MVP limits

- Maximum 5 files, 2 MiB each, 8 MiB total.
- Maximum 40,000 extracted characters per case.
- Scanned-image PDF OCR is not supported.
- CSV/XLSX line-item checks rely on recognised column headings and stored cell values; unsupported or ambiguous headers are surfaced for review. Financial XLSX schedules must contain one data worksheet; multiple worksheets are not silently combined, so export the relevant sheet separately.
- Spreadsheet formulas are not executed or recalculated; only stored cell values are read.
- Financial flags are not proof of fraud, expense eligibility or improper spending. A receipt-reference text match does not authenticate the document or verify the amount.
- This pilot uses one-time private case links rather than organisation accounts or team roles; organisation workspaces and role-based access are on the product roadmap.
- Cases are stored in the existing Neon database for up to 24 hours and can be deleted sooner. Extracted text, structured spreadsheet cell values, source locators and review output are retained during that period.
- No original file binaries are stored.
- Do not upload beneficiary names, phone numbers, addresses, bank details, IDs, health data or other sensitive personal information. Redact first.
- The seeded Community Water Access example is fictional and illustrative.

## OpenServ integration and inference budget

The server calls:

`https://inference-api.openserv.ai/v1/chat/completions`

with the configured `SERV_MODEL` (default `gpt-5.4-mini`). The API key is server-side only.

A review request is made only when the user clicks **Analyze with SERV**. The endpoint reserves one unit from the existing durable guest allowance before calling SERV. No quota has been reset, increased or bypassed. A failed reserved attempt does not trigger an automatic retry.

No live inference is performed by unit tests or browser CI.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run check
npm test
npm start
```

The app listens on `PORT` (default 3000).

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Existing Neon Postgres connection used for short-lived review cases and the existing guest allowance |
| `SERV_API_KEY` | Server-side OpenServ inference key |
| `SERV_MODEL` | Optional model override; defaults to `gpt-5.4-mini` |
| `PUBLIC_TUTOR_ENABLED` | Must be `true` with database and key configured to enable bounded public SERV calls |
| `PORT` | HTTP server port |

Do not commit secrets or upload a real `.env` file. Tabbas does not provision a new database or Render service; it reuses the existing TrySERV deployment and Neon connection.

## Tests

`npm test` includes document extraction, financial schedule parsing and reconciliation, store, input validation, exact-evidence-quote, HTTP route and no-spend tests.

The Playwright browser suite covers:
- Desktop and mobile layouts at 320, 375, 768, 1024 and 1440 px.
- Fictional sample-pack loading.
- Workspace creation without inference.
- One explicit mocked SERV review action.
- Source-linked finding rendering.
- Reviewer actions and case deletion.
- Reduced-motion behavior.

The browser suite uses mocked provider responses. It does not spend live SERV credits or prove that the deployed provider credentials are working. A separately authorised live production review is required before claiming live acceptance.

## Routes

- `/` — Tabbas product and review workspace.
- `/api/tabbata/status` — readiness flags only.
- `/api/tabbata/cases` — create a short-lived review case.
- `/api/tabbata/cases/:id` — retrieve a case with its random case token.
- `/api/tabbata/cases/:id/analyze` — one explicit SERV review.
- `/api/tabbata/cases/:id/actions` — record reviewer actions.
- `/api/tabbata/cases/:id` (`DELETE`) — delete a case.
- `/healthz` — service health.

The former TrySERV learning product is temporarily preserved at `/legacy`, `/learn`, `/try`, `/debug` and `/docs` during the pivot. It is not the current product direction.

## Documentation

- [Product specification](docs/TABBATA-PRODUCT-SPEC.md)
- [Problem and competitor research](docs/TABBATA-RESEARCH.md)
- [Technical architecture and security](docs/TABBATA-ARCHITECTURE.md)
- [Product walkthrough script](docs/TABBATA-DEMO-SCRIPT.md)
- [Release acceptance checklist](docs/TABBATA-RELEASE-ACCEPTANCE.md)
- [Real-user acceptance plan](docs/TABBATA-REAL-USER-ACCEPTANCE.md)

## Hackathon

OpenServ Edition 02 · Open Track.

The work must demonstrate a real SERV-powered report-review workflow, explain the role of SERV, and include a public repository and a demo. See [hackathon submission notes](docs/HACKATHON-SUBMISSION.md).

## Status and honesty

This repository contains a working pivot implementation under review. The latest code-check commit passed all 85 Node tests and all 74 desktop/mobile Playwright tests. Documentation-only commits followed those green checks. The existing Render deployment remains on the old `main` commit until this PR is approved and merged. Do not claim external NGO adoption, user interviews, revenue, physical verification, audit certification or live production SERV acceptance until independently demonstrated.
