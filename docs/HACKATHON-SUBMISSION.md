# Tabbas — OpenServ Edition 02 Submission Notes

**Project:** Tabbas  
**Tagline:** Check the report before it leaves.  
**Track:** Open Track  
**Technology:** OpenServ SERV Reasoning  
**Repository:** https://github.com/Alike001/tryserv  
**Existing application URL:** https://tryserv.onrender.com/ (the current `main` deployment still serves TrySERV; the Tabbas pivot is not deployed yet).  
**Product specification:** [TABBATA-PRODUCT-SPEC.md](TABBATA-PRODUCT-SPEC.md)

## Short description

Tabbas is a pre-submission donor report pack reviewer. It checks a project's narrative report against funder requirements, financial totals and supporting documents, then returns structured findings linked to exact source passages. It combines SERV Reasoning for contextual cross-document analysis with deterministic budget arithmetic and backend citation validation. A human reviewer remains responsible for decisions.

## Problem

Research on Nigerian civil-society organisations reports that donor reporting requirements, templates, formats and reporting frequency can vary across funders and projects. Tabbas tests a focused workflow hypothesis: smaller implementing organisations need a lightweight way to inspect a prepared report bundle for missing support and inconsistencies before submission.

This is a problem hypothesis. User interviews and willingness-to-pay validation are not yet complete.

## How SERV powers Tabbas

- The server sends the narrative report, funder requirements and extracted supporting-document segments to OpenServ SERV Responses API.
- It uses `reasoning: { effort: "medium", summary: "auto" }` and a forced `submit_report_review` function tool for structured findings.
- SERV reasons about claim-to-evidence relationships, requirement coverage and apparent document contradictions.
- The backend verifies every evidence reference and exact quotation against the extracted source segment before showing it.
- Deterministic code handles file extraction, source locators, budget arithmetic, input validation and result validation.
- The user explicitly clicks Analyze. The call reserves one unit from the existing shared durable guest allowance. No automatic inference or quota increase is introduced.

## What was built during the hackathon

The original repository began as TrySERV, a learning and developer-onboarding product. The hackathon pivot reuses its Node 24 server, Render deployment, Neon connection, SERV integration, CI and browser-test infrastructure to build a substantially different report-review workflow.

The public product root is now Tabbas. The old TrySERV routes are temporarily preserved under `/legacy`, `/learn`, `/try`, `/debug` and `/docs` during transition.

## Demo

The demo must show:
1. A fictional Nigerian community project report pack.
2. Requirements, narrative and evidence upload.
3. Case creation without inference.
4. One real, explicitly authorised SERV analysis.
5. At least one actual source-linked finding.
6. The deterministic budget check.
7. A human reviewer action.
8. Print / Save PDF.

**Do not use the static illustrative preview as proof of a live SERV result.** Capture the actual completion ID, model, latency and token usage from the live review before recording or submitting the final demo.

Demo script: [TABBATA-DEMO-SCRIPT.md](TABBATA-DEMO-SCRIPT.md)

## Honest limitations

- The application reviews supplied documents; it does not verify physical delivery or source authenticity.
- It is not an audit, legal opinion, fraud detector, funder or grant-management platform.
- Scanned PDF OCR is not supported.
- No original file binaries are stored, but extracted text and review output are retained in a private case for up to 24 hours.
- Beneficiary-level personal/sensitive data must be redacted before upload.
- The sample project and records are fictional.
- No NGO adoption, human testing, revenue or paying customers are claimed until verified.
- The real hosted SERV analysis must be separately tested; mocked CI output is not live provider evidence.

## Submission checklist

- [ ] PR merged and deployed commit verified.
- [ ] Public application readiness confirmed.
- [ ] Actual hosted SERV analysis captured.
- [ ] Demo video recorded from the live application.
- [ ] Public repository README and docs reviewed.
- [ ] One NGO programme/M&E officer tested the workflow.
- [ ] One finance/report reviewer tested the workflow.
- [ ] X announcement posted and OpenServ account tagged.
- [ ] Typeform submitted and confirmation retained.
