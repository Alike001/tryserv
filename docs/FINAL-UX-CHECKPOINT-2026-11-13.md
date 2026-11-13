# TrySERV — Final visual checkpoint and submission gates (13 Nov 2026)

This document records **verified facts**, not imagined usability results. It is the continuation of [CONTEXT-HANDOFF.md](CONTEXT-HANDOFF.md), [PRODUCT-PLAN.md](PRODUCT-PLAN.md) and [RELEASE-ACCEPTANCE.md](RELEASE-ACCEPTANCE.md).

## Product promise and judge fit

TrySERV is an **independent, hands-on OpenServ learning and developer-readiness platform**, not an official OpenServ website. The outcomes are source-linked conceptual understanding, server-graded practice, a validated Chat Completions request, practical repair missions, and optional real SERV Reasoning explanations for actual learning/debugging problems.

Official rules: https://www.openserv.ai/hackathon-2

- **Edition 02 / Open Track:** the open track accepts original ideas built on SERV Reasoning; every track requires SERV Reasoning.
- **Submissions close November 15, 2026, 23:59 UTC** (November 16, 00:59 WAT).
- Requires a public repo, a demo link or video, a short explanation of what was built / how SERV Reasoning powers it / track entered, and an X post linked in the submission.
- **Judging:** creativity, user readiness, and revenue potential.

A polished course site alone is an incomplete submission story. Lead with the **real feedback loop**: understand → server-check a request → ask bounded SERV Reasoning why an actual issue matters → repair → deterministic re-validation. Already verified production SERV calls and permission boundaries should be demonstrated using existing real evidence, not invented model output. Do not trigger more live inference solely for prettier footage.

**Commercial hypothesis, not a metric:** structured technical onboarding and troubleshooting for API teams, hackathons and developer ecosystems; potentially a branded onboarding product sold to organizations. There are no substantiated revenue, conversion, retention, or user-count numbers yet. Any future organization features are **not part of this submission**.

## Final UI progress (November 13)

| Change | Evidence | Status |
| --- | --- | --- |
| Original interactive Learn → Validate → Reason → Verify visual, shared on home and learning studio | [PR #14](https://github.com/Alike001/tryserv/pull/14) | Merged, deployed |
| Explicit no-inference/no-XP disclosure, accessible stage switching and responsive code-window art | PR #14 tests and Chromium browser journey | Verified by CI |
| Route allowlist entry for new JS asset and actual HTTP 200/mime regression | PR #14, server.mjs + test/serv-map.test.mjs | Verified |
| Individual three-step concept diagrams in four active lessons, with illustrative-only labels | [PR #15](https://github.com/Alike001/tryserv/pull/15) | Merged, deployed |
| Mobile-width stage switching and four lesson-specific diagrams, no paid requests while exploring | PRs #14 and #15 Chromium tests | Verified by CI |
| Render auto-deployed main commit `8c88c15330442719f1f810d5125613a1eb51868c` | Render deploy `dep-dbrcn6ajnfac739arhig` | LIVE on November 13 |

Both feature pull requests passed their full Node and Chromium test gates before merging. CI tests are evidence of functional browser coverage, not proof of human usability or full manual accessibility acceptance.

The new visuals were written originally. References included NimQuest and user-provided Pinterest screenshots/video, but no external artwork, photography, code or text was copied.

## Critical video finding

The previously referenced HeyGen video **`63ef34b8568ac2362576644e7b01c867`** is **FAILED**, not ready for use. HeyGen returned `MOVIO_PAYMENT_INSUFFICIENT_CREDIT` with a requirement for `unlimited_regular` credits. Do not link, publish, or describe it as a finished demo. Do not purchase credits or regenerate without explicit permission. Use genuine existing browser recordings and the prepared synchronized narrative if independently verified, or create an original screen-recording narration with manually checked timing.

## Submission release gates still open

1. One **actual beginner** and one **actual developer** must perform the unassisted tasks in [REAL-USER-ACCEPTANCE.md](REAL-USER-ACCEPTANCE.md). Do not mark passed until observed.
2. Review visual quality in a real production browser at 320/375/768/1024/1440, especially lesson concept diagrams, optional SERV panel, sticky navigation and content wrapping.
3. Verify the latest production browser CI run and latest Render commit; if a regression appears, correct it before final video.
4. Choose and verify a finished narrated demo using **real** hosted SERV evidence; synchronize narration with actual screens and do not fabricate inference.
5. Publish video, post X announcement mentioning `@openservai`, submit [official Typeform](https://openserv.typeform.com/submissions02), keep confirmation.
6. Consider only time-justified final UI changes to /docs, /try and /debug. Preserve static route allowlist, all grading, local progress, guest quota and secrets safeguards. Never modify `Alike001/opsra`.

### Suggested final demo sequence

- **0:00:** name / audience / why API onboarding is confusing.
- **0:20:** Learn: one lesson, server-graded feedback and concept diagram (show local XP accurately).
- **0:55:** Build: supported model, system instruction and user task, copied valid request marked PREVIEW.
- **1:25:** Debug: broken request; deterministic error; explicitly opt-in real SERV explanation using preserved genuine evidence; show authentic metadata and source.
- **2:15:** apply repair and revalidate, without sending an unintended new inference request.
- **2:40:** architecture and safeguards: capped guest usage, no API keys in browser, no automatic spending, independent project; invite users to try.

No demo timing or finished footage is represented as observed or approved here.
