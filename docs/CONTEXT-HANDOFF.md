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
