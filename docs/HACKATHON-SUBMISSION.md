# TrySERV — OpenServ Edition 02 submission pack

**Status:** Draft, not submitted. Last reviewed November 13, 2026 (Africa/Lagos).

**Track:** Open Track (must use SERV Reasoning)

**Deadline:** November 15, 2026 at 23:59 UTC = **November 16 at 00:59 WAT**.

**Official source:** https://www.openserv.ai/hackathon-2

## Submission links

- Product: https://tryserv.onrender.com/
- Source: https://github.com/Alike001/tryserv
- Documentation: https://tryserv.onrender.com/docs
- Public video: **PENDING — add only after upload**
- X launch post: **PENDING — add public post URL**
- Submission form: https://openserv.typeform.com/submissions02 (verified from official Hackathon 02 page)

## Suggested listing

**Name:** TrySERV

**One-line pitch:** Learn OpenServ by doing: validate real API mistakes, ask SERV Reasoning why they matter, and apply your own verified repair.

**Project description:**

TrySERV is an independent interactive learning companion for OpenServ. Instead of sending beginners into long reference docs or offering a general-purpose chatbot, TrySERV gives them a path to a real, valid SERV request. Four server-graded lessons explain agents, workflows and reasoning. A request builder produces correctly structured JSON/curl previews; a debugging lab gives three editable integration repair missions. A limited SERV Reasoning tutor can explain a learner's misconception or why a server-validated API request failed, using verified scenario details and an official reference. Lesson correctness, progress and request-shape validation are deterministic and never delegated to the model.

**How SERV is used:**

TrySERV's backend calls OpenServ's Chat Completions API for constrained lesson-specific tutoring AND opt-in diagnostic explanations after deterministic request validation. The debug lab sends only pre-authored scenario context and known validator field labels—not the editor's raw JSON. A successful SERV response returns model, completion ID, measured latency, usage, an official-source link and a next action. The learner applies and revalidates the repair; SERV neither authorizes execution nor grades progress. Visitor calls are restricted by a durable Neon-backed 2/day, 24-total guest pilot budget. The owner-only custom request runner is separately gated. The provider was previously observed responding in the operator's public browser; record a fresh redacted live demo if the shared budget allows.

**What was built for the hackathon:**

A standalone public learning product, four source-linked deterministic exercises, the validated SERV request builder, SERV-powered lesson tutor, bounded public inference access, persistent local XP, three realistic editable debugging missions, a full in-app documentation portal, and automated Node/Chromium journeys. Describe only the features present in the deployed commit.

**Revenue potential (hypothesis, not existing revenue):**

A developer-onboarding product that could eventually be commissioned by SDK, API and AI infrastructure ecosystems to provide guided learning and first-request success. No paying customers, conversion data, sales or partnership claims are established.

**Honest limitations:** Local XP is not a credential; previews never execute; model explanations may be inaccurate; guest inference is capped and can run out; a separate access code is needed for operator-only custom inference; production human usability and accessibility signoff are pending.

## Recommended demonstration (3–4 minutes; record actual app)

| Sequence | Real page | What to show | Boundary |
| --- | --- | --- | --- |
| 0:00–0:25 | / | Explain the problem and the beginner/build/debug routes; original unified navy/cobalt design | Independent community product |
| 0:25–1:10 | /debug | Select missing instructions, submit broken JSON and show deterministic field-level error | **No inference and no credits** |
| 1:10–1:55 | /debug | **Only if guest quota is available:** click Ask SERV, show a genuine explanation, partially redacted completion ID, model, latency and linked source | Paid inference ONLY after click; no raw editor JSON sent |
| 1:55–2:20 | /debug | Correct the instruction, validate again and copy blueprint | Fix remains user-directed, never executed here |
| 2:20–2:55 | /learn | Finish or review a sourced lesson, show non-spoiler feedback and real on-device XP | XP is local, not an official credential |
| 2:55–3:20 | /try | Validate and copy example request/curl; show clearly labeled preview | Not a live request unless separately authorized |
| 3:20–3:40 | /docs and GitHub | Real product guides, source, and passing Chromium tests | No fabricated users, payments or revenue |

**Evidence requirement:** the cloud browser tests use a mocked SERV response; a fresh hosted debug explanation is not considered independently verified until the actual site returns a real model/completion ID in the production browser. If credits are unavailable, label a previously captured genuine hosted response as a recorded example rather than pretending a new request succeeded.

Keep personal browser secrets, private access codes, network addresses and private logs outside screenshots. For an unavailable SERV trial, show the truthful capped/unavailable UI and use an explicitly labeled earlier **genuine recorded** live inference clip if one exists.

## X launch post draft

I built TrySERV for the @openservai SERV Hackathon — Open Track.

Most AI infrastructure onboarding stops at documentation. TrySERV turns OpenServ concepts into things you can actually verify:

• Four short, server-graded lessons with useful correction hints
• A valid SERV Chat Completions request builder
• Three editable API debugging missions with exact server-validated errors
• Optional SERV Reasoning explanations of those errors, with actual model metadata and a tightly capped public trial

No account or API key is needed for free practice. XP stays in your browser; request previews do not send inference calls.

Live: https://tryserv.onrender.com/
Code: https://github.com/Alike001/tryserv

[Add verified video link and a screenshot before posting.]

#SERVHackathon #BuildOnSERV

## Release gate

- [x] Public TrySERV repository and working demo URL exist.
- [x] Unified UX and SERV diagnostic PR #10 merged as `0cde1376`; the Render deploy for that code is LIVE.
- [x] Node, GitGuardian and **48 cloud Chromium browser checks passed** for PR #10, including mobile navigation, quota fail-closed, and simulated SERV debug response.
- [x] Official rules, deadline and Open Track requirements checked Nov 12.
- [x] Reproducible desktop/phone UI snapshots created in the GitHub browser workflow.
- [ ] Verify Render LIVE at the final documentation-only commit as well as the merged code.
- [ ] Run two genuine user journeys (one beginner, one developer) without coaching; record actual blockers using [the tester kit](REAL-USER-ACCEPTANCE.md).
- [ ] Inspect actual mobile/desktop focus and screen-reader experience; don't equate responsive tests with human review.
- [ ] Capture genuine final screenshots and optionally one budgeted live SERV tutoring response.
- [ ] Record and publish a truthful demo video, post on X, submit the Typeform and save the confirmation.

Do not spend more guest credits just to create marketing media if the cap is nearly exhausted. Never reset the global budget without investigating provider costs and abuse conditions.
