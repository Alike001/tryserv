# TrySERV — video script and real production capture plan

Created 13 November 2026. **Not a recorded demo yet.** This is a ready-to-read storyboard. Use footage from the actual hosted site, not mock API screens.

## Voiceover (approximately 2 minutes 50 seconds at a natural pace)

**Scene 1 — Intro, 0:00–0:24, https://tryserv.onrender.com/**

> Learning an AI platform should not mean reading documentation for hours and hoping your first API call works. Meet TrySERV: an independent, hands-on onboarding studio for OpenServ. You learn the essentials, build a correctly shaped request, and get meaningful help when something goes wrong.

**Scene 2 — Guided learning, 0:24–0:55, https://tryserv.onrender.com/learn**

> A newcomer starts with four short, sourced lessons. The exercises are checked by deterministic server logic, not by a language model guessing the answer. Here's an incorrect choice, followed by a helpful hint. When the answer is fixed, the lesson is marked complete and saved in this browser. After four lessons, the learner sees a summary of what they explored and where to practise next. This is learning progress, not a certificate.

**Scene 3 — Debug request, 0:55–1:27, https://tryserv.onrender.com/debug**

> Now for the developer experience. Here's a broken SERV Chat Completions request. It has a valid endpoint and model, but no system instruction. TrySERV detects the exact missing field instantly, without spending inference credits. The error is specific, checkable, and linked to the official API documentation.

**Scene 4 — SERV Reasoning, 1:27–2:02, same URL**

> This is where SERV Reasoning adds value. With one explicit click, and only while the shared trial budget allows it, TrySERV sends the verified error category and safe scenario details to OpenServ's live inference API. SERV explains why the instruction matters and suggests a practical next step. The returned model, completion ID, latency, token usage, and source make it clear that this was a genuine model response. The user's edited JSON and API keys are never sent in this coaching request.

**Scene 5 — Apply the fix, 2:02–2:27, same URL**

> The model doesn't silently fix the code, and it never executes the request. The developer adds a clear system instruction, reruns the free validator, and gets a checked request blueprint to copy. The reasoning assists understanding; deterministic code remains responsible for the rules.

**Scene 6 — Build and docs, 2:27–2:48, https://tryserv.onrender.com/try then /docs**

> TrySERV also includes a request builder, three debugging challenges, and documentation for beginner and developer paths. Free practice needs no account or API key; live coaching is deliberately limited by a durable shared budget.

**Scene 7 — Close, 2:48–3:02, https://tryserv.onrender.com/**

> Built for the Open Track of the OpenServ SERV Hackathon, TrySERV helps developers go from confused to capable, one verifiable step at a time. Explore the live app and review the public code.

## Mandatory editing rules

- **Only use real hosted footage for a live SERV scene**, captured after the quota check and a genuine model completion. If no real completion occurs, replace Scene 4 with a truthful explanation of the quota-unavailable state and label any older genuine capture **previously recorded**; never show mock data as a live response.
- Screen-record the actual public URL. Do not expose API keys, operator-only codes, user IP addresses or private Render/Neon dashboards.
- At Scene 4, the overlay should say **OPTIONAL LIVE SERV INFERENCE**, not 'unlimited free' or 'OpenServ-certified'.
- At Scene 5, emphasize **NOT EXECUTED HERE** on the blueprint.
- Lesson completion is saved locally; avoid claims of 'verified proof', 'certified' or 'onchain'.
- Only mention verified functionality and public source code. Do not invent user totals, customer revenue or trial cost figures.
- Visuals: use genuine recordings and screenshots with the navy `#132b42`, cobalt `#4269e9`, mint `#38d4ad` product palette, large legible captions and seamless transitions. Subtitles should match the narration, not improvise extra claims.
- Publish demo as unlisted or public YouTube and link it in the official Typeform. X post should include at least one genuine screenshot or a short video clip.

## Screen sequence for recording

1. `/` home hero and value proposition.
2. `/learn` open first lesson → wrong choice/hint → correct choice/lesson marked complete → short scroll through remaining lessons.
3. `/debug` select first case → submit original broken blueprint → show precise missing-instructions error.
4. **Only after checking allowance** click Ask SERV to explain this issue → wait for real model/ID and explanation → capture safely.
5. Add system instruction → free Validate → show successful request shape.
6. `/try` build/copy JSON or curl (preview only).
7. `/docs` show architecture, API/quotas, and honest safety guidance.
8. Closing brand slate with live link + repo.

## Submission readiness

- [ ] Genuine production-browser /debug live SERV explanation recorded (automation may produce this evidence)
- [ ] Human novice and developer feedback collected; any core blockers addressed
- [ ] Final narration with natural voice produced and synced to actual visuals
- [ ] MP4 checked for readable titles and accurate timing
- [ ] YouTube upload completed and URL recorded
- [ ] Public X post completed and URL recorded
- [ ] Official form submitted at https://openserv.typeform.com/submissions02 by Nov 15 23:59 UTC
