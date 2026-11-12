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
