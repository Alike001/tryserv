# TrySERV — Learning UX and SERV Coach Research

Reviewed November 12, 2026. Scope: visual clarity, meaningful SERV Reasoning use, safe guest trial and readiness for OpenServ Edition 02 Open Track. No NimQuest source, photos, trademarks or code reused.

## What we are building

**A hands-on OpenServ onboarding studio**, not a generic chatbot and not a wallet quest farm. The measurable learner outcome is: understand agents and workflows, know when SERV Reasoning is suitable, validate a usable API request, identify and repair common integration errors, and optionally obtain a contextual, visibly live SERV explanation.

Persona A: curious beginner, no account or API key; free lessons and progress. Persona B: working developer, jumps to request lab and debugs errors. Persona C: returning learner who needs a guided next step. The product has paths rather than forced sign-up.

## Visual research: NimQuest (https://nimquest.midelabs.xyz and user-provided screenshot walkthrough)

NimQuest uses a strong, generously spaced first impression, a simple Learn → Answer → Prove progression, distinct vivid cards, persistent quest progress and a dedicated docs surface. Its verified wallet receipt is specific to Nimiq and should **not** be copied or misrepresented as a TrySERV credential.

**Reusable high-level design principles:**
- One strong primary action and clear alternative for developers.
- Large, legible concept title; fewer competing surfaces.
- A short explicit journey with step labels and visible completion.
- Distinct state designs for learning, retry, success and explanation.
- A separated proof/result area and accessible docs navigation.

TrySERV should not mimic NimQuest's photography, colors, logos, wallet confirmation or leaderboard. We use an original cream/ink/violet/mint editorial identity compatible with TrySERV's existing cobalt brand and content, with solid card borders and clear focus rings.

## Additional research

1. **Codecademy AI features**: project hints respond to the current stuck step without giving everything away. https://help.codecademy.com/hc/en-us/articles/23400751016859-AI-Features-available-on-Codecademy
2. **Scrimba Docs Done Different**: learning sticks when explanations connect directly to challenges and projects. https://docs.scrimba.com/
3. **IBM progressive disclosure**: reveal what someone needs *now* and bring advanced guidance later, reducing choice overload. https://www.ibm.com/docs/en/technical-content?topic=practices-progressive-disclosure
4. **OpenServ official Chat Completions**: POST https://inference-api.openserv.ai/v1/chat/completions; model, system/developer message and authorized request are core; response exposes model, ID, and token usage. https://docs.openserv.ai/serv-reasoning/api/chat-completions
5. **OpenServ Edition 02 rules**: Open Track requires SERV Reasoning in a working build; evaluation prioritizes creativity, user readiness and revenue potential; deadline November 15 23:59 UTC. https://www.openserv.ai/hackathon-2

## Observed shortcomings in previous TrySERV learning UI

- Three competing columns at once: course sidebar, lesson details and full-height AI assistant. Hard to tell where to focus.
- Text-heavy material and small font sizes without an explicit step boundary.
- Tutor looked like an always-on generic chat window instead of a paid, source-grounded optional tool.
- Beginner could not immediately see which stage they had reached or which action came next.
- Practice-specific guided SERV use cases did not have a clearly identified example of reasoning-versus-code.

## Implemented in feat/learning-studio-coach-refresh

- Rebalanced desktop to two primary columns: progress/lesson, with SERV coach as a contextual full-width tool under the task. Mobile stacks naturally.
- Original warm white and ink visual hierarchy, step progress, read/practice/apply indicators, higher contrast cards and large headings.
- New starting journey cards; clear server-checked exercise badge; preview vs live distinction unchanged.
- One-click focused question starters that **only prefill**. Nothing paid happens before explicit Ask action.
- Lesson 3 contains a hypothetical policy-exception comparison: code checks exact dates; SERV helps explain a human review tradeoff. It does not automatically decide refunds.
- SERV model instructions tightened to answer the specific question, teach with examples/tradeoffs and never give away hidden quiz choices or pretend a preview executed.
- Added real Chromium regressions for stage states, prompting without spending, hypothetical reasoning scenario and breakpoints 320/375/768/1024/1440.

## Next high-impact improvements (not all in this PR)

1. **Unassisted usability testing:** real first-timer and developer, record confusion and measured task success rather than inventing results.
2. **Stronger SERV evaluation evidence:** a redacted genuine production completion; model/ID/latency; prompt safety tests; no new tokens used until budget check and explicit permission.
3. **Consistent cross-page polish:** request-builder and debug editor copy/spacing, large readable labels, coherent completion summary and docs navigation; test keyboard/mobile.
4. **Honest free-trial economics:** continue durable guest 2/day and 24 overall limit, review token spend and drop-off before any increase. Document what happens when the quota runs out.
5. **Demo and submission:** one free lesson task, one deterministic request repair, one real opt-in SERV explanation if available, honest browser-local lesson completion, public source, X post.

## Non-goals before deadline

No wallet or blockchain-based credential; no badges that imply certification; no leaderboards, login systems, multi-agent orchestration or invented traffic; no API key in the browser; no unbounded paid inference.

## Acceptance gate

- Build and Node tests green.
- Actual cloud Chromium desktop/mobile workflow green.
- Quota-exhausted and unavailable conditions still fail closed.
- Manual human readability, focus and real-user onboarding remain clearly marked **PENDING** until exercised.
- Do not merge without green CI. Never edit old Opsra.
