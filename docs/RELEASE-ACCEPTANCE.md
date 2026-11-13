# TrySERV — Release Acceptance Walkthrough (Nov 12, 2026)

**Purpose:** Verify TrySERV as a useful product for two distinct people (a complete newcomer and an experienced developer) before final visual polish and hackathon submission. The cloud Chromium suite has passed before, but tests alone cannot establish real human understanding.

## Test boundaries

- One public site: https://tryserv.onrender.com
- No user account required. No user should be asked to enter their SERV API key or private demo code for free learning.
- Browser-only progress: XP is not a certificate, account or token.
- Public tutor is a real, limited SERV Reasoning call. Be clear that credits may be exhausted; no guaranteed questions once its lifetime cap is reached.
- The debug lab and JSON request previews never spend SERV credits.
- Never publish API keys, demo codes, database URLs, full private logs, or visitor identifiers.
- User screenshots have confirmed a genuine public tutor response (model, completion ID and latency displayed); we don't claim it can never fail.

## Tester A — first-time learner

**Precondition:** New browser profile or private window, no prior TrySERV progress.

| Step | Task to complete without guidance | Acceptance |
| --- | --- | --- |
| A1 | Open / and explain in one sentence what the app does | Can distinguish TrySERV from official docs and identify a clear first action |
| A2 | Click "I'm new" and complete the ecosystem lesson | Can explain Agents/Workflows vs SERV Reasoning at a basic level |
| A3 | Deliberately choose one wrong answer | A helpful non-spoiler hint appears; XP stays unchanged |
| A4 | Correct the mistake and finish the four lessons | Exactly 80 on-device XP awarded; no extra credit on replay |
| A5 | Finish the request-builder exercise | Can distinguish a **validated preview** from an **executed call** |
| A6 | Reload /learn | Saved XP, completed lesson marks and the completion summary remain |
| A7 | Open /debug from the summary | Knows the difference between lessons and three separate debugging missions |
| A8 | Ask SERV tutor one genuine conceptual question (only if allowance is available) | Response clearly labeled live, cites official source and identifies what to do next |

**Outcome to record:** pass/fail for each step, any confusing wording, wrong assumptions, completion blockers. No fabricated time or satisfaction scores.

## Tester B — experienced developer

| Step | Task | Acceptance |
| --- | --- | --- |
| B1 | Use "I can code" entry without completing beginner lessons | Lands directly in request builder |
| B2 | Build a valid Chat Completions request and copy JSON/curl | Exact valid endpoint, model, system/developer instruction and user task |
| B3 | Open /debug and repair all three errors | Each error diagnosed; each edit validated; 3/3 repairs saved on reload |
| B4 | Compare invalid vs valid request states | Explicit actionable feedback rather than a generic AI guess |
| B5 | Verify free lesson XP and debug repair counts remain separate | XP max is 80 from four lessons; repairs are counted as 0–3, not paid rewards |
| B6 | Inspect source links | OpenServ docs support all stated request requirements |
| B7 | Do not provide any keys and examine execution buttons | No paid request fired without private access/explicit operator authorization |

## Reliability, keyboard and mobile gate

Cloud Chromium tests are in \`browser/learning.spec.mjs\`, run via \`.github/workflows/browser-journeys.yml\`. They automate landing and request navigation, exercise feedback, XP persistence, the debugging journey, keyboard activation, read-only quota checks, and overflow at 320, 375, 768, 1024 and 1440px. Supplemental tests cover exhausted quota, offline quota DB, and private-demo no-spend behavior. This is not a screenreader audit.

Manual checks still needed:
- At 320px, 375px and desktop, no critical button or guidance content is hidden; tutor content can be read without awkward nested scrolling.
- Keyboard Tab order and visible focus through primary navigation, lessons, request fields and debug lab.
- Screen reader or accessibility inspection of form labels and error feedback.
- No misleading CTA that implies "Run with SERV" is free; developer-only live execution is explicitly authorized and separate.
- Real source links continue to resolve to appropriate current docs.

## Failure escalation policy

- If the real SERV tutor returns an error, do not silently substitute canned AI output or retry repeatedly against paid quotas.
- If budget is exhausted or Neon is unavailable, tutor fails closed, while lessons/debug exercises continue.
- If a learner loses progress, first check whether they changed browser profile, cleared storage or reset the site. Do not assert server-side account persistence.
- If an error is reproducible, report the exact page, task, visible message and redacted screenshot; never include any token.

## Submission readiness gate

Before recording a demo:
1. Verify latest CI and Render deployment both refer to current main commit.
2. Perform at least one unassisted beginner and developer walkthrough (or transparently mark missing).
3. Show one **real** SERV tutor completion with genuine model/ID, plus one free debugging exercise.
4. Keep the recording accurate: the request preview is not a paid API call, XP is local and resettable, guest credits have a lifetime cap.
5. Update README with how to test, screenshots/video links when available, and identify remaining limitations.
6. Review official OpenServ hackathon requirements and deadline at https://www.openserv.ai/hackathon-2 before final submission.

**Next product decision:** Once we have actual tester feedback, prioritize fixing the highest-impact task blockers over inventing more modules or features. UI redesign should follow stable end-to-end behavior.


## 13 November 2026 — genuine hosted automation results

**Automated hosted production PASS (not human signoff):** [Run 43382281020](https://github.com/Alike001/tryserv/actions/runs/43382281020), **2/2 real Chromium hosted tests passed** on `https://tryserv.onrender.com` after PR #13 fixing the actionable missing-instruction error and post-font width checks. This verifies routing/overflow at 320/375/768/1024/1440, beginner lessons to 80 local XP, the developer's 3/3 repairs, and free-journey zero paid inference.

The second test separately used one intentional UI-initiated live SERV diagnostic after a read-only quota check. Model `gpt-5.4-mini-2026-03-17`; completion `chatcmpl-EjfWfyCJ7aPECLZXpsPWzmdxeadBK`; 7866ms; token usage 833 input /133 output; real browser screenshot + video, and successful corrective revalidation. [Downloadable evidence artifact](https://github.com/Alike001/tryserv/actions/runs/43382281020/artifacts/14016669211).

**Do not claim this is an unassisted user test.** The two real human tester sessions in [REAL-USER-ACCEPTANCE.md](REAL-USER-ACCEPTANCE.md), actual mobile physical-device check, screen reader audit, final published demo/X post and official Typeform confirmation are still pending. The app never claims an official credential or executes request previews. No more guest credits should be consumed for repeatability unless justified and approved.
