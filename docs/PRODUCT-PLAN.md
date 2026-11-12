# TrySERV — Product Direction, Feature Plan and Release Gates
Updated: 12 Nov 2026 (Africa/Lagos). Living milestone plan. Update release gates only with tested outcomes.
Working name: TrySERV (not trademark cleared). Independent OpenServ learning companion.

## Product promise
Understand OpenServ by doing. From first-time confusion to a real, valid SERV request, supported by contextual SERV Reasoning tutoring and links to authoritative sources.

## Why it should exist
OpenServ already has official docs, no-code builder, developer workshops, SDK, API playground and an MCP server. A docs chatbot or duplicate playground would be weak. TrySERV teaches with measurable outcomes: short guided concepts, actually graded challenges, an example API integration, error explanations, and on-device progress.

## Primary people
1. Beginner: wants to know what OpenServ offers without jargon.
2. Builder: wants to connect SERV to an actual application and understand practical errors.
3. Returning learner: wants to resume, explore features and ask focused questions.

## Minimal functional pages and experience
LANDING / — A beautiful, real landing page with a strong simple headline, 2 CTAs (Start learning / Jump to build), how it works, supported beginner/build paths, visible module preview, official-source and independent-project attribution. No false metrics or dead links.
EXPLORE — Interactive ecosystem map grounded in docs: Agents, Workflows, Connect/MCP, SDK and SERV Reasoning. Each item should explain what it does, give a realistic example and link to official docs. Can be part of landing/studio rather than a fifth navigation item.
LEARN /learn — Four short modules: ecosystem, SERV explanation, when to use reasoning, request builder. Immediate feedback with actual server-validated results. A useful error state and direct source links.
TRY /try — Checkable JSON/curl output and, only when safe server-side spending controls are configured, a genuine limited SERV call with response model, latency and status. A preview must always say NOT EXECUTED.
HELP /help — Practical troubleshooting for missing system prompt, bad endpoint, bad model, failed auth and other verified SERV situations. Use deterministic detection first and contextual SERV coaching for ambiguity. Do not manufacture support advice.

## Learning flow
Landing -> choose beginner or builder -> explore/lesson -> complete challenge -> see feedback and source -> earn XP -> resume/next -> construct request -> optionally run real SERV behind server controls.
Experienced learners may jump to code without finishing beginner material.

## Points and progress decision
Yes to simple XP and clear progress; NO to complex gamification.
- Four lessons, once-per-lesson 20 XP, max 80 XP initially.
- XP awarded only after deterministic server grading; duplicate submissions do not increase XP.
- Show completed modules, total XP, progress bar, resume CTA, final completion state.
- No user login for basic lessons; store progress/XP in browser localStorage and explicitly label as on-device, resettable, not cryptographically certified.
- No token rewards, leaderboard, certificates, accounts or fabricated user counts.
- Later server-backed progress only if real users and an explicit privacy model justify it.

## AI scope
SERV tutor explains mistakes and suggests next learning task with the current lesson's cited official source. Exact quiz grading, arithmetic, XP and completion happen in normal code. The tutor must NEVER certify progress. An actual tutor response should show real model/completion metadata and never substitute a prewritten AI answer silently.
Current tutor requires the operator to set secret server-side SERV_API_KEY + separately generated LEARN_ACCESS_TOKEN. Public visitors must not be asked for an API key. A safe limited guest demo can be designed only after rate/budget abuse tests.

## UX acceptance
Premium minimal, warm white / deep ink / restrained blue-teal accents, clean readable type, obvious actions. Short explanations, not walls of markdown. Mobile at 320/375/768 and desktop at 1024/1440. Keyboard focus and semantics; contrast checks; optimistic states only where true. No fake buttons.
Design all states: welcome, new user, resume, correct/incorrect, loading, AI unavailable, token needed, rate limit, error, completed. Have one memorable public URL, direct official citations and clear "independent community project" labeling.

## Delivery plan, in order (do not overengineer)
Phase A: Separate clean GitHub repository and brand, migrate learning app only, keep Opsra archived and intact, make a real landing page and navigation.
Exit gate: a stranger understands the product in 10 seconds and can start a lesson.

Phase B: Polish the four lessons and request builder, add source-backed ecosystem explore, on-device XP and resumable progress, check model and endpoint against current docs.
Exit gate: a novice completes all modules without account or API key, only once-per-lesson XP is earned, no dead UI.

Phase C: Turn on real SERV with operator-provided secure Render environment variables; verify actual completion IDs, latency, schema, failure conditions; contextual tutoring after wrong answers; limited genuine request lab.
Exit gate: a first-time user completes a genuinely live SERV-enhanced learning task and can see what SERV did.

Phase D: CI/security/keyboard/mobile tests, real beginner + developer usability checks, README with how-to-test, clean deployment and actual video; submit Open Track.
Exit gate: source public, real SERV use demonstrated, all claims truthful, keys private, demo reproducible.

## Scope we will NOT add before submission
Login, leaderboards, crypto points, NFTs/certificates, multi-tenant course platform, many dozens of lessons, document crawling, voice/multimodal tutor, shell access, complicated agent/MCP orchestration, billing, complex database.

## Repository and deployment strategy
Current standalone deployment: https://tryserv.onrender.com
Source is currently https://github.com/Alike001/opsra on feat/serv-learning-companion under learn/.
Existing unrelated incident product is on Opsra main. **Do not delete it.** Clean public TrySERV repository has been created and populated; unrelated Opsra code remains elsewhere. Reconnect Render service once the new branch tests pass. The name may be refined after checking availability.
No laptop Docker needed; GitHub Actions + Render carry build/test/deploy.

## Mandatory truthfulness and judging gates
Official Open Track requires SERV Reasoning materially included, public repo, demo, write-up, X post and deadline 2026-11-15 23:59 UTC.
Claims of a real SERV call require actual hosted inference and completion metadata. Current copied request is just a preview. Revenue potential is an open hypothesis: onboarding as a service for SDK ecosystems and developer programs, not a proven business.
https://www.openserv.ai/hackathon-2
https://docs.openserv.ai/serv-reasoning/introduction

## Name checkpoint and deployment repair
- 12 Nov: Working name changed from ServSteps to TrySERV (shorter, learning by trying). The current preview URL may retain the old Render slug until clean repo migration.
- Deployment repair: commit c0e6145 restored the original application file tree after a previous docs-only commit unintentionally replaced the tree. Render subsequently built successfully, tests passed and reported live. Not caused by the user's environment variables.

## Execution checkpoint — Nov 12
- [x] Clean standalone GitHub repo: https://github.com/Alike001/tryserv (main, source migrated and CI passing).
- [x] Dedicated Render service: https://tryserv.onrender.com (new service ID srv-dbqvo68ae00c73bepbj0), live deployment verified through Render.
- [x] Full public landing page; /learn lessons and /try builder have functional routes and test coverage.
- [x] On-device 20-XP lesson rewards (maximum 80), idempotence tests, resume and reset.
- [ ] Actual live hosted SERV tutor completion with operator-configured secrets in the NEW service.
- [ ] Browser/mobile accessibility and first-time learner walkthrough.
- [ ] Public safe guest SERV try-it flow and final submission evidence.
Source of truth for next chats: docs/CONTEXT-HANDOFF.md. Old ServSteps preview environment secrets are not automatically available in the new Render service.


## November 12 release-gate checkpoint

- [x] Wrong-answer feedback uses option-specific hints without exposing the correct choice.
- [x] Learners can opt in to SERV guidance about a mistake; preparing the question itself never spends credits.
- [x] Request-builder lesson has a separate access-gated real SERV execution path, with bounded input and output, shared staging rate limits and returned model, completion ID, latency and tokens.
- [x] Stubbed HTTP tests cover refusal without access, invalid models, response failures, and shared paid-call limit.
- [ ] Prove one ACTUAL hosted SERV tutor/request completion using the operator's private demo code; synthetic tests do not establish this.
- [ ] Design safer anonymous guest testing before dropping the private demo code; no public access token should be embedded in the frontend.
- [ ] Browser/mobile and keyboard regression tests; only then polish visuals and finalize submission.

## November 12 public tutor implementation checkpoint

- [x] Remove instructor-code requirement from regular learner tutoring; the advanced custom-request lab remains private.
- [x] Create an isolated Neon database to track guest allowances atomically across deployments.
- [x] Cap guest use at 2 calls per visitor/day and 24 total lifetime calls; a reservation occurs before a paid request.
- [x] Keep free lessons, deterministic grading, progress and XP usable when guest credits run out.
- [x] Test unavailable database, invalid input, anonymous access, quota denials and retention of the protected custom-request lab.
- [x] Set `PUBLIC_TUTOR_ENABLED=true` for the Render service, pending live hosted verification.
- [ ] Prove one real hosted public SERV completion with a redacted completion ID and latency. Simulated upstream test responses are not proof of real inference.
- [ ] Assess public demand and credit economics, and implement a refill/spend policy before exceeding the small lifetime cap.
- [ ] Conduct mobile and desktop usability tests; defer larger visual overhaul until functional flow is stable.


## Next milestone update — interactive practice lab (12 November)

- [x] Research actual learning mechanics of Codecademy, Scrimba, freeCodeCamp, MDN and Postman LiftOff. Write up reusable interaction patterns, not copied content/code.
- [x] Add \`/debug\`: three editable SERV Chat Completions request repair missions, clear server-validated issue feedback, reset, copy, progress and official source links.
- [x] Keep repair missions free, no key, no paid SERV calls, no false success assertions.
- [x] Wire the troubleshooting lab into landing and learning navigation.
- [x] Correct outdated private-access wording in the ordinary public tutor interface.
- [x] PR #1 merged after green CI: https://github.com/Alike001/tryserv/pull/1. Render reports commit \`23050ab\` live and 42 automated tests passing.
- [ ] Verify \`/debug\` visually in desktop and mobile browser; don't conflate HTTP-route unit tests with a real browser usability check.
- [ ] Improve lesson-to-debug-lab handoff and add practical exercise review, without new unnecessary product categories.
- [ ] Show transparent public tutor usage/remaining budget; review actual SERV cost before lifting the 2/day quota.
- [ ] Test a new learner end-to-end and prepare final submission.

Canonical research: [docs/INTERACTIVE-LEARNING-RESEARCH.md](INTERACTIVE-LEARNING-RESEARCH.md).


## November 12 functional journey checkpoint (pending CI + preview)

- [x] Connect four-lesson completion to a truthful summary: modules finished, 80 on-device XP, and next action to practise fixing requests. The completion summary is **not a credential or certificate**.
- [x] Keep the debugging lab as a separate progress track (three real request-repair missions); do not award additional XP just for visiting it.
- [x] Fix last debug mission: continue to any unfinished repair; after all three, return to the learning studio summary rather than an unrelated request-builder page.
- [x] Add a read-only guest SERV allowance endpoint and visible per-visitor questions remaining today plus shared trial remaining. Reading status **never consumes** SERV inference credits.
- [x] Free tutor button disabled when daily/global quota is exhausted or budget status cannot be read; no inference is attempted when protections are down.
- [ ] Validate this branch in CI, merge only after green tests, confirm Render's final deployment and request a browser screenshot.
- [ ] Evaluate real usability with one beginner and one developer before comprehensive visuals. Keep total trial budget at 24 until spending is reviewed; don't silently raise it.
