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
