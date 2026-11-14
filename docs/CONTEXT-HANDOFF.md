# Tabbas — Current product handoff (14 November 2026)

**Current product decision:** Build **Tabbas**, an independent, file-first pre-submission donor-report quality checker for NGOs and implementing organisations. This is a real product build, not a demo-only exercise. The fictional sample pack is optional onboarding material only; real users must be able to submit their own authorised, redacted report packs and get reliable, traceable checks. The user has selected the name **Tabbas** for the current direction. Earlier Tabbata and Shaida references are superseded for public branding. Formal trademark, domain and handle clearance remains outstanding.

**Problem:** Donor report packs combine narrative claims, funder requirements, approved budgets, expenditure schedules and supporting evidence. These files can disagree or leave requirements unsupported. Tabbas checks one prepared pack before submission; it does not replace an NGO MIS, accounting system or auditor.

**Repository:** `Alike001/tryserv`  
**Branch:** `feat/tabbata-donor-report-review`  
**Draft PR:** [#22](https://github.com/Alike001/tryserv/pull/22)  
**Existing Render service:** `https://tryserv.onrender.com/` (still deploys `main`; not yet updated to Tabbas)  
**Track:** OpenServ Edition 02 — Open Track.

## Current product implementation

- Public product workspace is at `/`; legacy TrySERV learning routes are temporarily preserved at `/legacy`, `/learn`, `/try`, `/debug` and `/docs`.
- Bounded extraction for PDF, DOCX, XLSX, CSV, TXT and Markdown, retaining page/sheet/row/line source locators.
- Private case workspaces use the existing Neon `DATABASE_URL`, random one-time case tokens (hashes stored), 24-hour expiry and explicit deletion. Original file binaries are not persisted.
- SERV is invoked only after an explicit Analyze action, with one reservation from the existing durable guest allowance and a forced `submit_report_review` structured response.
- Backend verifies document IDs and exact quotations against extracted supporting-source text. Invalid or unsupported citations are downgraded.
- Human reviewer actions and print/save-PDF output are implemented. Tabbas never makes funding or audit decisions.
- Optional approved-budget and actual-expenditure CSV/XLSX schedules are now supported. Structured cell values are retained separately from source text for deterministic calculations.
- New `tabbas-financial.mjs` computes schedule totals, compares them with entered totals, reconciles spend by budget category, flags category overspend/unbudgeted categories, duplicate references, blank receipt references, receipt references not found in separately submitted supporting documents and transactions outside an explicitly entered reporting period. Invalid rows, unsupported/ambiguous headers, duplicate columns, inconsistent column sets, blank/unparsed dates and multi-worksheet schedules fail visibly rather than being guessed or silently combined.
- SERV receives the deterministic reconciliation result as context and is instructed not to recalculate or override it. The code remains authoritative for arithmetic.
- The workspace UI has dedicated schedule uploads and a line-item reconciliation panel, including where receipt-reference text was found or not found. The optional fictional sample pack demonstrates category overspend and receipt-reference issues; it is explicitly illustrative and not a real customer case. Public branding now says Tabbas and positions it as an independent product, not a hackathon build.

## Verification status

- Latest Node CI on current head `0e97ade1952ff3c88624f2f5779275afb82e73cf`: **103 passed, 0 failed**. This includes financial schedule parsing, receipt-reference matching, duplicate-header preservation, inconsistent-sheet and multi-worksheet handling, reporting-period validation, blank-date checks, prompt-injection separation, schedule integration, existing extraction, security and case-workflow tests.
- Desktop/mobile Playwright journeys: **74 passed** on UI-tested commit `f7d25898609321685b6b272bf2d715f6e7c8545f`. The current head adds backend date-validation tests after that UI-tested commit; the current browser workflow is still running.
- No live SERV inference credits have been spent by these financial changes or CI.
- PR #22 remains **open and draft**. Do not merge it or claim production acceptance until all tests, product branding, security and release checks pass.
- Render `tryserv` still tracks `main`; the public URL is still the previous TrySERV deployment. No new Render service or database has been created.
- This pilot uses one-time private case links rather than organisation accounts or team roles; those are on the product roadmap. No NGO programme/M&E officer or finance reviewer has tested Tabbas yet. No customer adoption, revenue or product-market fit is claimed.

## Safety and product boundaries

- Only the explicit Analyze action may trigger SERV; no automatic retries after a reserved provider failure.
- Never reset, raise or bypass the existing shared inference allowance.
- Uploaded binaries are not persisted; extracted text, structured CSV/XLSX cell values, source locators and review output expire after up to 24 hours.
- Do not upload beneficiary names, phone numbers, addresses, bank details, IDs, health data or other sensitive personal information; redact first.
- Financial checks are arithmetic and document-structure checks. A duplicate reference, missing/unmatched receipt reference, category variance or out-of-period row is a review flag—not proof of fraud, misconduct, ineligibility or improper spending. A reference not found in the submitted bundle may exist outside the bundle or in an unextractable file.
- Tabbas is not an auditor, accountant, funder, fraud detector or physical-verification service. A human reviewer remains responsible for decisions.

## Next actions

1. Finish public brand alignment to **Tabbas** across the page, README, submission notes, product specification, smoke workflow and PR metadata. Internal filenames/API identifiers may remain historical temporarily, but user-facing copy must be consistent.
2. Verify the in-progress browser workflow. Fix any failures and add regression coverage for uploaded financial schedules, mobile layout and the reconciliation panel.
3. Review the financial schedule parser against real-world CSV/XLSX variations, especially headers, number formats, date formats, totals rows, duplicate columns and truncated files. Keep unsupported formats explicit rather than guessing.
4. Add the stronger SERV Prompt Guard / Shadow Agent integration only after checking the current official API contract and benchmarking it against the existing one-call implementation. Do not claim native features that have not been verified and tested.
5. Keep PR #22 draft until all tests and release gates pass. After explicit approval, merge and let the existing Render service auto-deploy; do not create a second service or database.
6. Run the no-inference production smoke workflow, verify storage/SERV readiness, and then perform a live SERV review only after the user explicitly authorises spending one existing allowance unit on fictional or otherwise authorised redacted data.
7. Conduct real acceptance sessions with at least one NGO programme/M&E officer and one finance/report reviewer. Record findings and revise the product; do not claim this has happened before it does.
8. Prepare the submission from the actual working product: truthful screenshots/video, public repository, clear SERV integration explanation, commercial hypothesis and required X/Typeform submission.


---

# TrySERV — Current handoff update (14 November 2026)

**Latest product decision:** XP, point totals and reward messages have been removed. The learning studio now records completed lesson IDs only, shows a 0–4 completion count and a practical learning summary, and keeps the three debugging repairs as a separate progress track. The existing `tryserv-progress-v1` localStorage format (an array of lesson IDs) is unchanged, so previously completed lessons remain completed after this UI update. The change is being delivered through `feat/remove-xp-learning-progress`; do not reintroduce XP or points.

Historical notes below include XP figures and earlier test results from previous builds. Those are historical evidence, not the current product behavior. Current user-facing documentation, demo narration, unit tests, browser tests and production smoke checks must describe completion-only progress.

---

# TrySERV — canonical handoff
Updated: 12 November 2026, Africa/Lagos. Verify fresh remote status before taking actions.

## Product direction
TrySERV is an independent hands-on OpenServ learning companion for newcomers and experienced developers. Focus on an excellent learning experience: understand OpenServ, complete checkable exercises, build a valid request, obtain grounded SERV Reasoning help, save progress. Do not build a generic docs chatbot, incident dashboard, huge agent platform, or fake integrations.

## Canonical infrastructure
- Repo: https://github.com/Alike001/tryserv (PUBLIC, main). All future learning development here.
- Old unrelated Opsra incident project https://github.com/Alike001/opsra remains untouched. Its feat/serv-learning-companion branch is only historical source; do not merge it.
- Dedicated Render URL: https://tryserv.onrender.com/
- Render service ID: srv-dbqvo68ae00c73bepbj0. Workspace: tea-dbgctlnb9u1s73cu22bg. Region: Frankfurt. Plan: free.
- Render dashboard: https://dashboard.render.com/web/srv-dbqvo68ae00c73bepbj0
- Build: npm run build (syntax+tests). Start: npm start. Auto-deploy main.
- The old preview https://servsteps-preview.onrender.com/ is separate and must not be treated as final.
- Live-deploy report as of Nov 12: initial TrySERV deployment dep-dbqvo70ae00c73bepebg reports LIVE. Recheck most recent build.

## Features implemented
- Real standalone responsive homepage at /, full story, curriculum preview, official docs, and functional beginner/builder CTAs.
- /learn four short source-linked OpenServ/SERV lessons, server-graded multiple-choice exercises.
- /try request builder: validated JSON/curl previews, NOT an executed SERV request.
- 20 XP per unique passed lesson (maximum 80), progress/resume/reset in localStorage only. XP not signed/certified.
- /api/mentor sends a SERV Chat Completions request with official lesson context and validated JSON output; stub tests pass. Real hosted inference is NOT YET verified.
- /healthz, /api/lessons, /api/check all functional in automated tests.
- Node 22+ backend, no DB, no npm runtime dependencies or laptop Docker.

## Crucial secrets
- SERV_API_KEY comes from https://console.openserv.ai/ per https://docs.openserv.ai/serv-reasoning/introduction .
- LEARN_ACCESS_TOKEN is a separate long private operator-generated access code (not an OpenServ key).
- User previously configured variables on OLD ServSteps preview. They are NOT automatically transferred to NEW TrySERV Render service.
- Set secrets in NEW Render service Environment page privately, never paste in chat, code or screenshots. Browser should receive only LEARN_ACCESS_TOKEN as operator code; never SERV_API_KEY.
- In current implementation, tutor is disabled without BOTH variables. Public free lesson path remains available.
- In-process token/rate caps are only a staging safeguard; public paid tutor must be constrained before broad access.

## Outstanding work in order
1. Verify new repo latest CI and Render live deployment; test /, /learn, /try and /healthz in actual browser.
2. Configure server-side secrets privately on NEW Render and perform real hosted SERV tutoring request; record actual completion ID/model/status, no guessed successful output.
3. Improve learning after wrong answers (guided hint and optional contextual tutor) and validate official docs references.
4. Improve mobile/keyboard UX and practical exercise depth; avoid decorative or inert controls.
5. Benchmark meaningful learning and prove novice-builder outcomes; finish README, screenshots, demo and submission.

## Hackathon
OpenServ Edition 02, proposed Open Track, deadline 15 November 2026 23:59 UTC. Public repo, working demo/video, short write-up and X post. Official page https://www.openserv.ai/hackathon-2 . Don't overclaim commercial readiness.

## Cross-chat resume instruction
Continue TrySERV from https://github.com/Alike001/tryserv. Read docs/CONTEXT-HANDOFF.md and docs/PRODUCT-PLAN.md, verify GitHub CI and Render srv-dbqvo68ae00c73bepbj0, then focus on real SERV tutor and learner experience. Do not modify Opsra main.


## November 12 follow-up — access-code rationale and latest engineering work

The user uploaded screenshots showing the NEW TrySERV website and studio loading, and Render confirmed the environment-variable deployment succeeded. User has added SERV_API_KEY and LEARN_ACCESS_TOKEN to the NEW Render service and wants to focus on functionality before visual redesign.

The instructor access code is NOT a teacher account: LEARN_ACCESS_TOKEN is a separate operator-chosen testing secret protecting paid SERV credits. Free lessons do not require it. UI now labels it private demo access code. Never expose the access code or SERV_API_KEY.

Latest feature commits on https://github.com/Alike001/tryserv (main): non-spoiler, per-choice wrong-answer hints; a button to prefill a focused SERV tutoring question; measured tutor latency/usage; optional actual paid SERV request execution in lesson 4, distinct from request preview; shared per-process paid-call quota (3 per 10 minutes per connection peer, maximum 35 per process lifetime); integration tests with simulated SERV replies.

Next: verify latest GitHub CI and Render (srv-dbqvo68ae00c73bepbj0) live. Operator tests ONE real SERV call at https://tryserv.onrender.com/learn or /try using only their private demo access code. Collect completion ID, model and latency; do not claim actual completion before verifying. Fix any real API error, then assess learner task success and mobile/browser UX. Previous unrelated Opsra repo must stay untouched.

## November 12 follow-up — public no-code tutor

- User asked to remove the private instructor code so anyone can use the SERV tutor, while focusing on functionality before visual polish.
- IMPLEMENTED: normal `/api/mentor` and learning studio are accessible without a code when `PUBLIC_TUTOR_ENABLED=true` and DATABASE_URL+SERV_API_KEY+LEARN_ACCESS_TOKEN exist. The advanced `/api/try-serv` remains guarded by the private demo access code.
- New dedicated free Neon project: `tryserv-public-tutor-budget`, id `autumn-field-84765264` (Frankfurt). Created tables `tryserv_guest_budget`, `tryserv_guest_daily` and atomic function `tryserv_reserve_guest(...)`.
- Server protects owner credits with persistent hard total budget 24 guest calls and 2 per visitor identity/day. Actor id stored as HMAC using server SERV_API_KEY (not raw visitor IP). Spent attempts are reserved before inference. Database outages or exhausted credits fail closed. No unlimited inference.
- DATABASE_URL was added privately to the existing Render service srv-dbqvo68ae00c73bepbj0. `PUBLIC_TUTOR_ENABLED=true` was enabled; verify latest deployment and public browser first.
- GitHub source uses pinned `@neondatabase/serverless` 1.2.0, installed in the cloud build, and automated tests verify fail-closed guest access and owner-only custom request lab.
- Real hosted SERV answer is not yet independently confirmed. In a follow-up, test one guest question from https://tryserv.onrender.com/learn, then check Render logs for `tryserv.serv_result` (does not include prompt or secret) and Neon SQL `SELECT used FROM tryserv_guest_budget WHERE id=1`. Never reveal API key, database URL or private demo code.
- Existing feature roadmap: beginner-to-builder lessons, source-backed corrections, XP, guest tutor, private real request lab, mobile/keyboard/browser checks, hackathon demo. Leave Opsra untouched.


## Nov 12 continuation — learning product research and deployed developer lab

- User asked to **continue the project functionally before final visual polish**, and to study existing educational products whose proven learning mechanics we can adapt.
- Research checked Codecademy (checked steps, contextual help), Scrimba (editable code), freeCodeCamp (progressive labs), MDN (official sources with skills checks), and Postman LiftOff (API learning missions). Summary: \`docs/INTERACTIVE-LEARNING-RESEARCH.md\`. Do not copy logos, code or copyrighted lesson content.
- Created feature branch \`feat/request-debug-lab\`, PR #1; merged after passing tests into \`Alike001/tryserv\` main (merge SHA \`23050ab9725b248e2a822307a729a58e0bd75068\`).
- NEW \`https://tryserv.onrender.com/debug\`: three real-contract SERV request repair missions. Learner edits a request blueprint, /api/debug/check validates endpoint/model/system/user messages, feedback guides repairs, and the corrected HTTP request blueprint is previewed only. No keys, model inference or credits spent. /api/debug/scenarios serves cases; browser stores completed mission IDs only. Links from landing and studio now exist.
- 42 tests passed, 0 failed. Render reports deployment live. Independent page screenshot/keyboard/mobile check has NOT yet occurred; direct public browsing from assistant was blocked.
- Public tutor real SERV completion has already been confirmed by user screenshot (real model, completion ID and latency). Guest tutoring remains limited to 2/day and 24 lifetime in durable Neon budget; do not increase without reviewing costs.
- Next: beginner/developer full-journey validation, access and use of /debug, clearer final learning completion and usage visibility, then visual polish and hackathon submission. Old Opsra remains untouched.


## Nov 12 later milestone — completed path + quota visibility

The user confirmed https://tryserv.onrender.com/debug visually loads and asked to keep executing the functional roadmap. Working feature branch: feat/learning-journey-allowance in Alike001/tryserv, pending CI and merge at time of writing.
- Four passed lessons now show a meaningful completion summary, not a certificate; links to /debug and /try. The existing four lesson XP points remain maximum 80, on-device only.
- Debug lab fixed to guide the learner to unfinished missions, then return to /learn when all three are completed. Debug missions have a separate on-device counter; not added to XP.
- Added GET /api/tutor/allowance reading Neon counters without consuming credits or reserving an allowance. The public tutor UI shows visitor/day and shared remaining. Free questions are disabled if the budget is exhausted or status check fails. The actual paid POST retains atomic reservation and protection; no change to budgets (2/visitor/day, 24 lifetime).
- Added tests for quota status read-only/no SERV calls, exhaustion, DB failure and summary derivation. Inspect GitHub CI and Render before any LIVE claim.
- Next milestone: real browser walkthrough all four lessons plus debugging repair and tutor exhaustion flow; then final UI/UX review and submission. No laptop Docker required.

## Nov 12 verified release — learning journey and tutor allowance
- Feature PR #2 https://github.com/Alike001/tryserv/pull/2 was merged into main as commit `579c658b6950d26bbbc6526a04b3d50884df3558`.
- GitHub CI run https://github.com/Alike001/tryserv/actions/runs/43295096842 completed successfully.
- Render deploy `dep-dbr1jbm7bikc73cht8gg` reported LIVE; deployment logs showed 47 tests, 47 pass, 0 fail and server started on port 10000.
- Learning studio shows a truthful summary once all 4 lessons are finished (80 on-device XP). /debug leads through any remaining missions, then navigates to the learning summary. Debug repairs are not extra XP.
- Read-only GET /api/tutor/allowance returns today's available guest requests and remaining total shared quota, based on existing Neon counters. It never calls SERV or reserves credits. Learners see availability before asking; paid requests continue to require atomic reservation.
- Existing limits remain 2 guest questions per approximate visitor/day and 24 total guest calls. No budget increase or price assertion was made.
- Browser interaction across all new states is NOT yet manually verified. User screenshot confirmed prior /debug first challenge; ask for full path test next.
- Next priorities: independent novice and developer walkthrough, mobile/keyboard browser regression, source/lesson review and final demo/submission. Existing old Opsra repository remains untouched.


## November 12 late-night checkpoint — real browser regression gate (verified)
- User asked whether progress will survive ChatGPT chat limits and to continue the next project task. **GitHub is canonical memory**, not a promise that ChatGPT saved memory updates instantly.
- Branch `test/browser-journey-a11y` created and merged via PR #3: https://github.com/Alike001/tryserv/pull/3
- Merge SHA: `04689c65965d61d82942f77355cc16d6ac5916ab`; main GitHub application CI succeeded.
- Added a dedicated Chromium Playwright GitHub Actions workflow `.github/workflows/browser-journeys.yml`, config `browser/playwright.config.mjs`, 7 tests in `browser/learning.spec.mjs` each for desktop (1440×900) and mobile (375×812).
- Verified **14 of 14 actual browser tests passed**, including working landing -> learn/try links, wrong answer then correction, four lessons -> 80 XP persisted/no duplicate XP, three debugging exercises -> learning studio, keyboard activation, mock-only guest tutor usage interface, and page-wide overflow at 320/375/768/1024/1440px. Reports: https://github.com/Alike001/tryserv/actions/runs/43309621574 (PR) and https://github.com/Alike001/tryserv/actions/runs/43309890087 (main).
- Fixed test runner server path `node ../index.mjs` (the first attempt failed before any browser tests because of relative working directory). Corrected final debugging lab button from misleading “See your learning summary” to “Return to learning studio.”
- Browser runner pinned `@playwright/test@1.65.0`, installed exclusively on **GitHub cloud runner**; the user's laptop and Render production backend do not need Chromium.
- Render service `srv-dbqvo68ae00c73bepbj0` deployment `dep-dbr2st942hec73efj00g` reported **LIVE** at merge SHA. The prior existing 47 unit/HTTP tests are still used in normal app build.
- Browser tests use a **local no-secret backend**, with clearly marked mock tutor response; they do **not** spend real SERV credits or independently prove hosted inference. Real public SERV inference was separately confirmed in the user's screenshot in the earlier milestone. Public URL cannot be independently opened through the assistant's web fetch, so human production-browser validation of the newest release remains to do.
- Next: verify at least one real first-time learner and one developer using the current deployed UI; inspect genuine mobile screenshots/accessibility. Fix observed blockers, then UI/UX polish, concise README/demo, hackathon submission. Avoid new expansive features or inflated claims; old Opsra remains untouched. Deadline Nov 15, 2026 23:59 UTC (verify on official site if needed).
- Permanent browser testing notes: `docs/BROWSER-RELIABILITY.md`. Keep this handoff updated after material changes.

Resume in a new chat: "Continue TrySERV in Alike001/tryserv main. Read docs/CONTEXT-HANDOFF.md and docs/PRODUCT-PLAN.md. Verify GitHub CI and Render service srv-dbqvo68ae00c73bepbj0. Browser regression PR #3 is merged with 14/14 Chromium tests. Next focus on real-user flow review and final UX/submission. Leave Opsra untouched."


## 12 November 2026 — verified browser reliability, guest credit safeguards

- Canonical code: https://github.com/Alike001/tryserv main; old Alike001/opsra remains untouched.
- PR #3 https://github.com/Alike001/tryserv/pull/3 merged browser-level Chromium reliability tests. Its GitHub Actions workflow is `.github/workflows/browser-journeys.yml`, its specs are `browser/learning.spec.mjs`, and details are in `docs/BROWSER-RELIABILITY.md`. The tests cover the landing page, full four-lesson path, wrong-answer hints, XP idempotency and persistence, all three developer debugging missions, keyboard/Enter/Space, guest allowance, and no horizontal overflow across 320/375/768/1024/1440px. GitHub cloud runners install Chromium; the user's laptop needs no Docker or browser dependencies. Test models and API calls are mocked where appropriate; don't misrepresent them as live SERV inference.
- A redundant PR #4 was closed without merging because PR #3 already provided the browser testing suite. Avoid duplicate browser workflows.
- PR #5 https://github.com/Alike001/tryserv/pull/5 **merged** as commit `0272bf418fe65c4be670bb4ec976f98ec640d4cf`; browser CI succeeded. It adds three more real-Chromium cases: global trial exhaustion, quota database outage, and private SERV custom-request preview not spending credits without authorization. It uses mocked network routes, makes no actual paid calls, and leaves production budgets unchanged.
- Underlying public SERV tutoring previously succeeded in a real user screenshot, with genuine model/completion/timing. It remains bounded by 2 guest questions/day per approximate identity and 24 global guest calls in Neon; do not increase quotas without budget review.
- After pushing docs, verify GitHub CI and Render deploy status. Do NOT claim actual browser walkthrough by a human; hosted Chromium automation and human UX tests are different.
- **Next product milestone**: real-user acceptance test with one first-timer and one experienced developer, source/lesson freshness review, accessible mobile/focus/contrast check, and truthful OpenServ hackathon submission assets before Nov 15 2026 23:59 UTC. Avoid unnecessary feature sprawl and final UI redesign until core acceptance gates pass.

## Resume next chat

"Continue TrySERV in Alike001/tryserv main. Read docs/CONTEXT-HANDOFF.md and docs/BROWSER-RELIABILITY.md. Verify CI and Render service srv-dbqvo68ae00c73bepbj0, and the merged PR #5 quota/browser tests. Focus on real-user end-to-end acceptance and remaining hackathon submission checks. Do not touch Opsra. Do not reveal SERV or database secrets."


## Nov 12 inspiration milestone — NimQuest comparison and TrySERV product guides

User supplied ten screenshots of https://nimquest.midelabs.xyz and requested learning from its UI/UX, quest flow and docs; reference repository https://github.com/mystiquemide/nimquest . Research confirms its server-graded quiz + Nimiq Pay wallet signature proof sequence, visually strong discovery cards and dedicated docs. DO NOT copy Nimiq branding, photos, code or proof mechanism, and do not imply TrySERV XP is wallet-verified.

Work in feat/docs-and-learning-navigation:
- Added public /docs with guides: overview, choice of learning paths, progress, SERV integration, validated request, debug examples, architecture, safety/privacy and FAQ.
- Added homepage task-based entry cards for beginner, developer and troubleshooter, with separate documentation preview; original mint, blue and peach cards retain TrySERV's navy/cobalt identity.
- Added accessible docs links to learning studio, request builder and debug lab.
- Fixed stale curriculum detail about operator-only paid request executions.
- Added Node route tests and Chromium browser tests including 320px and /docs navigation.
- Research write-up at docs/NIMQUEST-DESIGN-RESEARCH.md .
- Do NOT claim merged or deployed without checking CI + Render. If tests fail, fix on this branch and recheck.
- Keep real SERV inference proof already reported in screenshots, shared guest budget (2 per day / 24 global), three debugging scenarios, four lessons and 80 local XP unchanged.
- Next: inspect PR checks, merge when green, deploy, conduct human first-time learner and developer testing, then final UI/UX and hackathon demo/submission.


## 12 November — NimQuest-inspired documentation release merged

- User supplied ten NimQuest screenshots and asked to study its visual hierarchy, learning steps, detailed quest flow and dedicated docs. Public comparison: https://github.com/mystiquemide/nimquest and https://nimquest.midelabs.xyz/ . Research notes: docs/NIMQUEST-DESIGN-RESEARCH.md. No NimQuest source, assets or brand copy were reused.
- Feature PR #6 https://github.com/Alike001/tryserv/pull/6 **MERGED** to main as commit e84b0853b2f03ce3160c55ed22ae075d4ff5345c after green checks: Node CI https://github.com/Alike001/tryserv/actions/runs/43318495081 and desktop/mobile Chromium https://github.com/Alike001/tryserv/actions/runs/43318495060 .
- New first-class product documentation at https://tryserv.onrender.com/docs: Overview; learner/builder paths; four lessons and local XP; how real SERV tutoring and budget work; validated request example; three debugging missions; small architecture; data and privacy boundaries; FAQ. Static page has original responsive styling and accessible anchors.
- Homepage now has three colored, navigable learning starting points for a newcomer, builder and troubleshooter, plus an in-app documentation preview. Learning studio and /debug have guide links. Mobile header has discoverable Docs and compact visible Start action at 320px.
- Browser CI originally caught mobile navigation regressions; they were fixed before merge. Final feature branch tests passed across desktop/mobile and responsive widths. No SERV quotas, authentication, payments or scoring rules were changed.
- Do not claim success of the production deployment until checking latest Render service srv-dbqvo68ae00c73bepbj0. No need to change old Opsra repo.
- Next: manually inspect public homepage and /docs on the user's browser, run novice and developer acceptance walkthroughs, fix any UX blockers, and prepare submission/video assets truthfully ahead of Nov 15 23:59 UTC.


## November 12 final-release preparation — PR #7 merged

- The NimQuest-inspired docs/navigation release remains merged as PR #6; its production deployment was verified LIVE on Render at commit `224edb15fed2de5642a5d5cfe494ed3a023baa24`.
- Follow-up PR #7 https://github.com/Alike001/tryserv/pull/7 **MERGED** as `8783d5efb2d2e9ba34a78a2803575c460a569115` after GitHub Node CI, security and real Chromium browser jobs all reported SUCCESS (GitHub Actions browser workflow run 43320703998). Adds a keyboard-accessible landing-page skip link, Playwright regression, fully current README, and `docs/HACKATHON-SUBMISSION.md` with track description, video storyboard, honest claims and X-post draft.
- Verified OpenServ official Hackathon Edition 02 rules Nov 12: Open Track requires SERV Reasoning, public repo, demo/video, short write-up, X post and Typeform submission. Deadline **November 15, 2026 23:59 UTC** (November 16 00:59 Africa/Lagos). Criteria: creativity, user readiness, revenue potential. Official source https://www.openserv.ai/hackathon-2 .
- No source or artwork copied from NimQuest. No quotas, auth, app server, AI spending or Opsra code changed in PR #7. Guest tutor is still capped at 2/visitor/day and 24 shared calls lifetime, with private operator-only custom execution.
- **Remaining:** verify freshest Render deployment of main (including this handoff docs commit); perform real unassisted novice and developer acceptance walkthroughs and human mobile/screen-reader audit. Take actual production screenshots, record/upload a truthful demo, publish X post and fill submission form. Neither human testing nor submission is complete; do not infer it from passing automation.
- This is the current cross-chat resume checkpoint; use `docs/HACKATHON-SUBMISSION.md`, `docs/RELEASE-ACCEPTANCE.md`, and `docs/PRODUCT-PLAN.md`. Do NOT alter `Alike001/opsra`.

## November 12 — major learner UX and SERV coach improvements (verified)

- PR #8 https://github.com/Alike001/tryserv/pull/8 **merged** as `51b3452be5bb1277b837a492e597e22d5e061f23` after Node, GitGuardian and cloud Chromium checks passed; Render deployment `dep-dbr470142hec73b5ilkg` confirmed **LIVE** for that commit.
- Studio redesign replaces a cramped three-column view with a focused two-column course/lesson desktop layout; the coach follows the lesson as a distinct contextual section. Adds visible Understand → Practice → Apply lesson states, stronger mobile progress, accessible keyboard skip, higher-contrast original cream/ink/violet lesson cards, and clearer request preview boundaries.
- SERV tutor gets three context-specific question starters (simple explanation, developer example, when reasoning vs code). Buttons only prefill; no automatic guest spending. Backend coaching system prompt now demands concrete examples, non-spoiler guidance, and honest preview/execution wording.
- Lesson 3 includes a hypothetical refund-policy case comparing deterministic checks with reviewable human judgment; learner can optionally prefill a SERV reasoning question. Does not send payments, approve refunds, certify policies or make inference until explicitly asked.
- PR #9 https://github.com/Alike001/tryserv/pull/9 **merged** as `1dc068a31216da46c0e66a535bd72bafb3ee0614` after Node, security and Chromium browser checks passed. Unifies /debug visual language and adds visible Read → Edit → Verify stages and keyboard skip navigation. Debug grader and no-spend safeguards unchanged.
- Neon read-only check on Nov 12 reported `used=1` of 24 shared guest lifetime reservations at that moment. Do NOT silently change budget, assume it means one successful inference, or claim the count is static.
- Research record: `docs/LEARNING-UX-RESEARCH.md`; original NimQuest images/code/brand were not copied. Official OpenServ Chat Completions docs confirm the endpoint and `gpt-5.4-mini` examples; official Edition 02 hackathon rules still apply.
- **After this docs commit:** verify latest Render `main` deployment and GitHub CI. Human novice/developer walkthrough and actual phone/screen-reader review, live question observation, final screenshots, X post/video and Typeform submission remain **NOT DONE**. Keep Opsra untouched and preserve testable truth claims.


## November 13 continuation — unified design + SERV-as-core debugging release

**Verified release:** PR #10 https://github.com/Alike001/tryserv/pull/10 **MERGED** as `0cde1376f30c70e70005c25f0e23153f325cb075`. GitHub Node CI, GitGuardian and browser tests all succeeded. **48 of 48 Chromium tests passed** on the final PR head. Visual QA archive: https://github.com/Alike001/tryserv/actions/runs/43328806026/artifacts/13993498764 (10 real no-secret desktop/mobile screenshot previews). Render deployment `dep-dbr4mru7bikc73ehk9sg` reported **LIVE** for merge `0cde1376` on November 12 23:28 UTC. Documentation-only follow-up commits after that may have a newer deployment; always re-check before claiming final main is live.

**Design:** Source of truth is the landing site's existing navy `#132b42`, cobalt `#4269e9`, mint `#38d4ad`, blue/mint/peach accents, white/light-slate backgrounds and readable DM Sans/Space Grotesk. `public/brand.css` is a unified final override included on /, /learn, /try, /debug, /docs. Every route has clear Home/Learn/Build/Debug/Docs mobile navigation. Desktop paths remain accessible. Docs and learning hero sections are cleaner; debug hero contains a new *illustrative* three-step preview (detect, opt in to SERV, recheck), NOT fabricated successful inference. Four lessons show as 2×2 grid on phone. Learning stage progress now tracks Understand/Practice/Apply, not lesson ordinal (jumping to lesson 4 does not show 100% progress immediately). Debug top logo matches landing and docs. All links have tests.

**SERV's meaningful role:** On /debug, deterministic `/api/debug/check` identifies a problem for free. After validation, a distinct section offers *explicit* `Ask SERV to explain this issue`. Only known pre-authored scenario details + server-returned validation field names are sent to existing `POST /api/mentor`, never the user's editable raw JSON. The read-only `GET /api/tutor/allowance` ensures availability before enabling and rechecks before sending. The existing Neon durable budget (2 calls/approximate visitor/day; 24 lifetime shared guest calls) remains unchanged and fails closed on exhausted/unavailable status. A successful live response shows model/completion ID/latency/usage/source/action. The user must repair/revalidate their own request. Browser tests simulate the upstream; this newly integrated hosted debug flow **has not been independently exercised with paid live SERV after merge**. Earlier live lesson tutor was verified in user screenshots. Do not confuse the two.

**Visual QA:** Cloud Chromium captured five desktop and five phone screenshots, inspected in this chat. Main landing, docs, learning, mobile nav and new desktop debug hero are visually coherent. This is visual screenshot review of local test server, not human usability evaluation of the deployed site. Do not claim screen-reader audit.

**Current product scope:** Four source-backed server-graded lessons with browser-local completion progress, one deterministic request builder, three request repair missions, optional real SERV tutor and post-validation error reasoning, in-app docs and one Render URL. No wallet receipt, official training credential, login, demo fake transactions or fabricated usage.

**Now do (before submission):**
1. Verify final Render deployment/CI for latest main after documentation updates.
2. Have one unassisted beginner and one developer do real public-browser journeys; record blockers and resolve them.
3. Use at most a justified budgeted call to verify **new /debug → SERV** live completion: choose broken instruction scenario, click Check, confirm quota, explicitly ask SERV, record actual model/ID/latency, then fix and revalidate. Never paste SERV API keys in browser. Do not reset guest budget.
4. Capture production screenshots, record a truthful 3–4 minute demo including a genuine SERV output only if verified.
5. Upload demo, publish X post with @openservai, submit official OpenServ Edition 02 Typeform by **November 15, 2026 at 23:59 UTC** (Nov 16 00:59 WAT). See `docs/HACKATHON-SUBMISSION.md`.

**Revenue potential** is an unvalidated B2B onboarding/SDK integration training hypothesis; no users or revenue claimed. Keep Opsra `Alike001/opsra` entirely untouched. Do not add unnecessary feature sprawl before the deadline.

**New chat resume:** Continue TrySERV from `Alike001/tryserv` main. Read `docs/CONTEXT-HANDOFF.md`, `docs/PRODUCT-PLAN.md`, `docs/HACKATHON-SUBMISSION.md`. Check PR #10 and Render `srv-dbqvo68ae00c73bepbj0`. Next is real-user acceptance and true live SERV diagnostic verification; final video/X/Typeform are not yet done. Do not modify Opsra.


## November 13 — hosted TrySERV readiness reached

- PR #11 (QA harness) merged a6481572 and PR #12 (workflow YAML fix) merged 61e95a1. First gated hosted acceptance failed before spending guest credits: responsive measurement before fonts settled and imprecise default missing-instructions error.
- PR #13 merged 7cf28f4850184b0b56b5edf6e69a165d4d11c8f0; Render confirmed LIVE. The default checker now returns messages.instructions with a concrete fix; mobile tests wait for fonts and dynamic content. Pre-merge Node/security/Chromium green.
- **Second hosted acceptance SUCCESS**: https://github.com/Alike001/tryserv/actions/runs/43382281020, 2/2 real production Chromium tests passed, public site checked at widths 320/375/768/1024/1440; 80 XP on-device, all 3 debug repairs, zero paid calls during free journey.
- **Live production /debug SERV diagnostic independently verified**, not mocked. One explicit click after quota preflight returned model gpt-5.4-mini-2026-03-17, completion chatcmpl-EjfWfyCJ7aPECLZXpsPWzmdxeadBK, latency 7866ms, usage 833 input / 133 output tokens, and an official OpenServ reference. Applied system-message repair and revalidated successfully. Evidence https://github.com/Alike001/tryserv/actions/runs/43382281020/artifacts/14016669211 includes genuine screenshots, video, JSON.
- Neon global guest reservation count increased from 1 to **2 used of 24**, 22 remained when checked. Do NOT reset/replay paid test. Human beginner/developer independent observations remain pending; neutral test kit docs/REAL-USER-ACCEPTANCE.md.
- Remaining: genuinely narrated demo MP4 from real screen capture; YouTube upload; X launch post with real screenshot; official Typeform https://openserv.typeform.com/submissions02 by Nov 15 23:59 UTC. Do not claim submission. Demo storyboard docs/DEMO-SCRIPT.md and listing docs/HACKATHON-SUBMISSION.md prepared. Keep Opsra untouched.


### Narrated demo packaging (November 13)
- Genuine production image/video evidence: https://github.com/Alike001/tryserv/actions/runs/43382281020/artifacts/14016669211 . Screenshot and browser-video evidence is verified from the real hosted test, **not mocked**.
- Created captioned 1280×720 146.25-second video from verified screen evidence, with two real Chromium screen recordings at end. User-facing conversation download: tryserv_verified_demo_preview.mp4 (artifact path should only be linked in the creating chat session, not invented later).
- Created original navy/cobalt cover tryserv_submission_cover.jpg and SRT captions.
- HeyGen natural Joanna narration generated at 146.285s and HeyGen Studio **narrated video submitted**, video ID `63ef34b8568ac2362576644e7b01c867`, title “TrySERV | Real SERV Reasoning Debugging Demo (Verified)”, 720p 16:9. Render **processing at creation**; video status was **not yet completed** when handoff saved. Use HeyGen get_video for status in a later user turn if asked; do not create a duplicate video.
- For final submission, review completed narrated output for speech/visual alignment and truthful labels, then upload to YouTube; record public video URL in docs. X post, actual human participant feedback, Typeform response confirmation not done. Official form https://openserv.typeform.com/submissions02; deadline November 15 2026 23:59 UTC. No new SERV paid calls required.


## November 13 — final visual release checkpoint

The latest verified visual work, official Edition 02 judging rules, authentic HeyGen failure, revenue hypothesis, and remaining human/video/submission gates are documented in [`docs/FINAL-UX-CHECKPOINT-2026-11-13.md`](FINAL-UX-CHECKPOINT-2026-11-13.md). The source of truth is main after merged PRs #14 and #15; deployed commit `8c88c15330442719f1f810d5125613a1eb51868c` was reported LIVE on Render. Do not claim actual human usability testing has occurred. Do not treat the previously referenced HeyGen video `63ef34b8568ac2362576644e7b01c867` as completed; it failed for insufficient video credits.
