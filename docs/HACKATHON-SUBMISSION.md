# TrySERV — OpenServ Edition 02 submission pack

**Status:** Draft, not submitted. Last reviewed November 12, 2026 (Africa/Lagos).

**Track:** Open Track (must use SERV Reasoning)

**Deadline:** November 15, 2026 at 23:59 UTC = **November 16 at 00:59 WAT**.

**Official source:** https://www.openserv.ai/hackathon-2

## Submission links

- Product: https://tryserv.onrender.com/
- Source: https://github.com/Alike001/tryserv
- Documentation: https://tryserv.onrender.com/docs
- Public video: **PENDING — add only after upload**
- X launch post: **PENDING — add public post URL**
- Submission form: https://openserv.typeform.com/ (use exact form linked by the official hackathon page)

## Suggested listing

**Name:** TrySERV

**One-line pitch:** Learn OpenServ by doing: complete checkable lessons, fix real API mistakes, and ask a bounded SERV Reasoning tutor for help.

**Project description:**

TrySERV is an independent interactive learning companion for OpenServ. Instead of sending beginners into long reference docs or offering a general-purpose chatbot, TrySERV gives them a path to a real, valid SERV request. Four server-graded lessons explain agents, workflows and reasoning. A request builder produces correctly structured JSON/curl previews; a debugging lab gives three editable integration repair missions. A limited live SERV Reasoning tutor can explain a learner's misconception using the relevant official source. Lesson correctness, progress and request-shape validation are deterministic and never delegated to the model.

**How SERV is used:**

TrySERV's backend calls OpenServ's Chat Completions API for constrained lesson-specific tutoring and returns provider model/completion metadata, latency, and usage alongside a source link and next action. This is the AI-powered capability; it is separate from free deterministic quizzes and safe request previews. Visitor calls are restricted by a durable Neon-backed 2/day, 24-total guest pilot budget. The owner-only custom request runner is separately gated. The provider was previously observed responding in the operator's public browser; record a fresh redacted live demo if the shared budget allows.

**What was built for the hackathon:**

A standalone public learning product, four source-linked deterministic exercises, the validated SERV request builder, SERV-powered lesson tutor, bounded public inference access, persistent local XP, three realistic editable debugging missions, a full in-app documentation portal, and automated Node/Chromium journeys. Describe only the features present in the deployed commit.

**Revenue potential (hypothesis, not existing revenue):**

A developer-onboarding product that could eventually be commissioned by SDK, API and AI infrastructure ecosystems to provide guided learning and first-request success. No paying customers, conversion data, sales or partnership claims are established.

**Honest limitations:** Local XP is not a credential; previews never execute; model explanations may be inaccurate; guest inference is capped and can run out; a separate access code is needed for operator-only custom inference; production human usability and accessibility signoff are pending.

## Recommended demonstration (3–4 minutes; record actual app)

| Sequence | Real page | What to show | Boundary |
| --- | --- | --- | --- |
| 0:00–0:25 | / | Position the problem and the two beginner/builder paths | Independent learning companion |
| 0:25–1:10 | /learn | Explain a lesson; deliberately answer wrongly; show contextual hint, then pass | Server validation awards XP, not AI |
| 1:10–1:45 | /learn or /try | Validate a request; show JSON/curl and copy | Explicit **preview, not executed** |
| 1:45–2:25 | /debug | Repair an incorrect endpoint or missing instruction and submit | Free deterministic repair |
| 2:25–3:05 | /learn | **Only if real guest allowance remains:** make one live SERV tutor question and show model, completion ID (partially redacted), latency and official source | No fake or recorded 'live' model response |
| 3:05–3:30 | /docs and /learn | Show guides, saved 80 XP/3 repair markers if genuinely completed | Local progress, no certificate |
| 3:30–3:45 | GitHub | CI tests, source and next milestone | Don't imply paid users or an audit |

Keep personal browser secrets, private access codes, network addresses and private logs outside screenshots. For an unavailable SERV trial, show the truthful capped/unavailable UI and use an explicitly labeled earlier **genuine recorded** live inference clip if one exists.

## X launch post draft

I built TrySERV for the @openservai SERV Hackathon — Open Track.

Most AI infrastructure onboarding stops at documentation. TrySERV turns OpenServ concepts into things you can actually verify:

• Four short, server-graded lessons with useful correction hints
• A valid SERV Chat Completions request builder
• Three editable API debugging missions
• Live, source-grounded SERV Reasoning tutoring with real provider metadata and a tightly capped public trial

No account or API key is needed for free practice. XP stays in your browser; request previews do not send inference calls.

Live: https://tryserv.onrender.com/
Code: https://github.com/Alike001/tryserv

[Add verified video link and a screenshot before posting.]

#SERVHackathon #BuildOnSERV

## Release gate

- [x] Public TrySERV repository and working demo URL exist.
- [x] Latest docs/navigation release merged and Render reported LIVE on current main as of Nov 12.
- [x] Node and cloud Chromium CI previously passed for the docs/browser release.
- [x] Official rules, deadline and Open Track requirements checked Nov 12.
- [ ] Merge the launch-readiness PR after fresh Node + Chromium CI.
- [ ] Confirm final Render service LIVE at the new main commit.
- [ ] Run two genuine user journeys (one beginner, one developer) without coaching; record actual blockers.
- [ ] Inspect actual mobile/desktop focus and screen-reader experience; don't equate responsive tests with human review.
- [ ] Capture genuine final screenshots and optionally one budgeted live SERV tutoring response.
- [ ] Record and publish a truthful demo video, post on X, submit the Typeform and save the confirmation.

Do not spend more guest credits just to create marketing media if the cap is nearly exhausted. Never reset the global budget without investigating provider costs and abuse conditions.
