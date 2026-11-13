# TrySERV — Learn OpenServ by doing

**A free, hands-on OpenServ learning companion.** Understand agents and workflows, practise making a valid SERV Reasoning request, and repair realistic API integration mistakes. An optional, budget-limited live SERV tutor provides context-aware help.

**Independent community project.** Not affiliated with, endorsed by, or operated by OpenServ. No wallet, account, or API key is needed to finish the learning exercises.

[**Open TrySERV**](https://tryserv.onrender.com/) · [**Learn**](https://tryserv.onrender.com/learn) · [**Try a request**](https://tryserv.onrender.com/try) · [**Fix a request**](https://tryserv.onrender.com/debug) · [**Docs**](https://tryserv.onrender.com/docs)

## The problem and the result

Getting started with an AI infrastructure platform often means reading multiple documentation pages without knowing whether you understand them—or how to make the first request. TrySERV turns that uncertainty into small, checkable tasks. A newcomer can complete four short lessons; a developer can go directly to the request builder and debug lab.

Unlike a generic documentation chatbot:
- **Exact answers are graded in code on the server.** The model neither selects the correct quiz answer nor grants XP.
- **Wrong answers receive specific, non-spoiler hints.** Learners can try again.
- **A request builder validates the official Chat Completions shape** and produces copyable JSON/curl examples. A preview is never disguised as an API execution.
- **Three editable debugging missions** teach how to repair missing instructions, a wrong endpoint, and an invalid model choice. All three are free and deterministic.
- **SERV Reasoning is genuinely integrated** as an optional lesson-aware tutor. A successful provider response exposes the returned model, completion ID, measured latency, and usage rather than substituting a scripted answer.

## Refreshed learning and reasoning experience

The learning studio now uses a focused **Understand → Practice → Apply** progression, larger readable lesson cards and a distinct SERV coach section. Three question suggestions prepare a beginner explanation, a developer example or a reasoning-versus-code comparison **without sending a paid request**. Lesson three contains a hypothetical policy-exception case showing where exact code stops and careful SERV-assisted review may begin. It never makes a real refund decision.

The standalone debugging lab shares the same original TrySERV visual language, with explicit Read → Edit → Verify steps. These improvements were merged in [PR #8](https://github.com/Alike001/tryserv/pull/8) and [PR #9](https://github.com/Alike001/tryserv/pull/9). Research: [Learning UX and SERV Coach](docs/LEARNING-UX-RESEARCH.md).

**Final visual and validation polish (November 13):** TrySERV now includes an original interactive Learn → Validate → Reason → Verify illustration, lesson-specific OpenServ concept diagrams, a state-driven debugging flow, and a searchable in-page documentation guide. The diagnostic stage responds to real checker output; editing a request clears older validation evidence rather than presenting it as current. Passing validation never implies that an optional paid SERV inference happened. See [PR #14](https://github.com/Alike001/tryserv/pull/14), [PR #15](https://github.com/Alike001/tryserv/pull/15), and [PR #17](https://github.com/Alike001/tryserv/pull/17).

## Try it as a judge or first-time visitor

| Visit | What to do | What proves it works |
| --- | --- | --- |
| [Home](https://tryserv.onrender.com/) | Choose **I'm new**, **I can code**, or the debugging path | Task-specific links lead to working routes |
| [Lessons](https://tryserv.onrender.com/learn) | Finish four short, sourced exercises; deliberately answer one incorrectly first | Specific hint, server-graded result, 20 XP once per lesson |
| [Request builder](https://tryserv.onrender.com/try) | Validate a system instruction, user task and supported model; copy JSON/curl | Request structure and feedback, explicitly **NOT EXECUTED** |
| [Debug lab](https://tryserv.onrender.com/debug) | Repair three broken request examples | Each fix is checked and saved locally; no API credits |
| [SERV tutor](https://tryserv.onrender.com/learn) | Ask a lesson question, **if** public allowance remains | A live answer, official reference, provider model/ID and latency |
| [Docs](https://tryserv.onrender.com/docs) | Explore integration, safety, progress and troubleshooting | A dedicated in-app guide portal |

Lesson progress is kept in **this browser only**: 4 × 20 XP = **80 XP maximum**. Repeating a lesson does not earn more XP. The three debugging missions are a separate 0–3 count. Progress is not independently certified and can disappear if browser storage is cleared.

A previously tested public SERV response was confirmed in the operator's real browser. Automated integration/browser tests use mocks where appropriate; they are **not** a replacement for a fresh production live-inference verification.

## Why SERV Reasoning belongs here

TrySERV sends a constrained, source-grounded lesson question from its server to OpenServ's Chat Completions endpoint (`POST https://inference-api.openserv.ai/v1/chat/completions`). The tutor returns an explanation and one next action, with a link to an official lesson reference. A model answer can be wrong; factual learning and grading stay deterministic. User-facing prompts never need a user-supplied API key.

The separate optional **operator-only** request execution lets an authorized tester make a live call with a custom validated request. Copying or validating a request never consumes SERV credits.

[OpenServ SERV Reasoning API reference](https://docs.openserv.ai/serv-reasoning/api/chat-completions) · [SERV introduction](https://docs.openserv.ai/serv-reasoning/introduction)

## Why SERV Reasoning is central — a reproducible example

The developer/debugging journey is now more than a code preview. Visit [the repair lab](https://tryserv.onrender.com/debug), choose **A request without instructions**, and submit the broken example.

1. **Exact validation (free):** server-side deterministic code reports the missing instruction.
2. **SERV diagnosis (optional, live):** when guest trial capacity is available, explicitly click **Ask SERV to explain this issue**. A constrained prompt uses only the pre-authored scenario and validated error field names—never the user's editable JSON—and asks for a concrete explanation and next check. A successful response displays SERV model, completion ID, latency, usage, and an official reference.
3. **Apply and revalidate (free):** add a system/developer instruction, validate the repair, and copy the checked blueprint. The AI never writes or executes a request for the user.

If guest capacity is exhausted or its status cannot be checked, SERV explanations fail closed, while the entire deterministic lab remains usable. Tests stub the upstream provider; separately verify the live hosted diagnostic before calling it a demonstrated production completion.

The visual system now uses the original [landing page](https://tryserv.onrender.com/) navy/cobalt/mint palette across all routes, with a common responsive Home / Learn / Build / Debug / Docs navigation. Static content and exercise grading are unaffected by brand CSS.

## Safety and real operating limits

- The normal public tutor is explicitly opt-in for the deployment and **budget-limited**: at most **2 guest calls per approximate visitor identity per UTC day**, and **24 shared lifetime guest calls** for the pilot. Allowance is checked before calling SERV.
- A dedicated Neon PostgreSQL budget reservation guards the shared cap across deployments. When budget storage is unavailable or exhausted, paid guest inference stops; free lessons, previews and debug missions still work. Upstream failures can consume a reservation.
- The protected custom-request executor requires a separate private operator access code. Never share that code, the SERV API key, or database connection string.
- The server owns the API key. The browser cannot issue arbitrary direct OpenServ requests through the free tutor.
- No wallet signatures, payments, token rewards, verified certificates, or fictitious usage figures.
- This is a public pilot, not a promise of unlimited free inference or production-grade commercial billing.
- The repo is not presented as security-audited; AI output is informational, not independently guaranteed.

## Architecture at a glance

```text
Browser (landing / lessons / builder / debug / docs)
    |          free server-graded /api/check and /api/debug/check
    +----> Node HTTP server
             |-- deterministic grading, validated request previews
             |-- optional /api/mentor -> atomic Neon guest-budget reservation
             |                        -> SERV Reasoning Chat Completions
             |-- operator-gated /api/try-serv -> authorized SERV call
Browser localStorage: completed lesson IDs, XP, debug repair markers
```

Node 22+, minimal front-end JavaScript/CSS, Neon for limited public guest-credit accounting, GitHub Actions for Node and Chromium tests, Render for deployment. No account database is used for learners.

## Run and test locally

```bash
git clone https://github.com/Alike001/tryserv.git
cd tryserv
npm install
npm run check
npm test
npm start
```

Open `http://localhost:3000`. With no inference secrets, learning and debugging remain functional. The dedicated GitHub Actions browser workflow runs real Chromium desktop/mobile journeys. Do not put tokens in public repository files or client-side JavaScript.

See [release acceptance tasks](docs/RELEASE-ACCEPTANCE.md), [browser regression record](docs/BROWSER-RELIABILITY.md), and [product plan](docs/PRODUCT-PLAN.md) for the test boundaries and open human-testing work.

## Evidence and limitations

- Public source: [Alike001/tryserv](https://github.com/Alike001/tryserv)
- Live Render deployment: [tryserv.onrender.com](https://tryserv.onrender.com/)
- Automated tests: [GitHub Actions](https://github.com/Alike001/tryserv/actions)
- Product design comparison: [NimQuest design research](docs/NIMQUEST-DESIGN-RESEARCH.md)
- **Pending for release:** unassisted first-time learner and developer walkthroughs on the production site, human mobile/screen-reader inspection, final video and X launch post. The browser CI is not a substitute for those human checks.

## Hackathon

**OpenServ SERV Hackathon Edition 02 · Open Track.** The official rules require use of SERV Reasoning, a public code repository, a demo link or video, a short explanation of the project and its track, plus a public X post linked in the submission form. Deadline: **November 15, 2026 at 23:59 UTC**.

Judging focuses on **creativity, user readiness and revenue potential**. A possible future revenue path is onboarding/training tools for developer ecosystems; this is **an unvalidated opportunity**, not traction or revenue.

[Official rules](https://www.openserv.ai/hackathon-2) · [Submission preparation](docs/HACKATHON-SUBMISSION.md)

## License

[MIT](LICENSE).
