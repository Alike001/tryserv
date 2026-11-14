# TrySERV — Interaction research and the functional product roadmap
Reviewed: 12 November 2026. Prepared to guide a **small product**, not a generic online academy.

## Product promise and target audience

TrySERV helps someone new to OpenServ become a confident first-time user, and helps someone already building with SERV diagnose common integration mistakes. Our product is *independent* of OpenServ; every technical claim should connect to official docs.

## Existing learning products — what to borrow, not copy

| Product | Verified feature pattern | What TrySERV should learn |
| --- | --- | --- |
| Codecademy | Automatically checked lessons; AI assistant understands the current exercise; personalized hints that avoid immediate spoilers | Make the learner retry, supply a source-backed hint and show a concrete next action |
| Scrimba | Browser-based editable lesson code instead of only watching/read-only instruction | Let users change an example and verify their correction without installing anything |
| freeCodeCamp | Small instructional steps, workshops and labs leading to larger independent challenges | Teach concept → practice → apply → reflect |
| MDN Learn | Authoritative tutorial alongside editable examples and skills checks | Keep a source reference adjacent to each challenge |
| Postman LiftOff / Learn by API | Real API literacy missions and step validation, progress through a sequence | Test the actual request shape and show what went wrong |

These are interaction patterns; TrySERV is not importing their source code, brand assets, lesson text or curricula.

References:
- https://help.codecademy.com/hc/en-us/articles/23400751016859-AI-Features-available-on-Codecademy
- https://help.codecademy.com/hc/en-us/articles/14298560842267-How-Lessons-and-Projects-Differ-in-Codecademy-s-Learning-Environment
- https://scrimba.com/our-pricing
- https://contribute.freecodecamp.org/how-to-work-on-coding-challenges/
- https://developer.mozilla.org/en-US/docs/Learn_web_development
- https://www.postman.com/liftoff/
- https://blog.postman.com/how-we-build-learning-experiences-inside-postman/

## Verified technical rules for hands-on SERV exercises

The official API docs show:
- \`POST https://inference-api.openserv.ai/v1/chat/completions\`
- Authorization with a SERV API key kept server-side or in the developer's private environment, never pasted into TrySERV.
- A supported model ID (for example \`gpt-5.4-mini\`).
- A \`messages\` array that contains a \`system\` or \`developer\` instruction and a user task.
- The model may return an \`id\`, content, \`finish_reason\` and usage counts.

Source: https://docs.openserv.ai/serv-reasoning/api/chat-completions and https://docs.openserv.ai/serv-reasoning/introduction

## What we have done

- Verified full public lesson + genuine SERV contextual tutoring through user screenshot (real model and completion ID visible).
- Four official-source lessons, deterministic quizzes, browser-local completion state for passed lessons.
- Validated request-builder preview, separate private live-execution lab.
- Public SERV tutor protected by separate lifetime guest budget on Neon (2/day, 24 total initially); do **not** silently increase budget based on a guess.
- New implementation: **Fix a SERV request** debugging lab. Three editable HTTP request blueprints (missing instruction, wrong endpoint, unrecognized model); user repairs JSON and gets immediate deterministic diagnosis. No key, account, payment or model inference required. Source links and progress are shown. Corrections generate validated HTTP request blueprints but never execute the API.
- Fixed obsolete private-code copy in the public tutor interface.

## Remaining priority order

### P0 — Complete one newcomer-to-builder journey
- An unassisted first-timer enters landing, understands OpenServ and finishes four exercises.
- Developer can jump to /try, construct a real request shape and test a safe sample if owner-authorized.
- Developer can visit /debug and repair all three failures without looking up hidden solutions.
- All links/buttons work, errors are actionable and source links resolve.

### P1 — Make SERV tutor useful for actual learning
- Tutor context from the selected lesson and wrong answer, actionable next question, no unsupported statements.
- Keep the real response model, completion ID, latency, usage and disclaimer visible.
- Show remaining allowance / exhausted budget, using durable quota store; avoid exposing keys or raw visitor IPs.
- Consider slightly increasing per-visitor questions **only after** checking actual usage and cost; the shared lifetime cap must remain protective.

### P2 — Verify quality before adding more content
- Automated tests for malformed payloads, fake source IDs, rate limits, invalid input, missing secrets and completion contracts.
- 320/375/768/1024/1440px, keyboard and screen reader check; fix real blockers.
- Manually test with one beginner and one developer; record their task outcome, not a fabricated satisfaction metric.

### P3 — Launch/readiness
- One public URL, clear README How to Test, documentation freshness notes, license, independent attribution.
- Truthful 90–120 second demo including real SERV answer and a practical challenge.
- Submission page, X post, Open Track requirements, and final deadline check.

## Not now

No account/login, social leaderboard, certificates, payment tiers, autonomous agent, model marketplace, giant lesson library, fake user reviews or overcomplicated telemetry. Defer visual refinement until core flows are stable, while fixing broken navigation and confusing language immediately.

## Open questions to validate with real users

- Can a true newcomer explain the difference between Workflows and SERV after one lesson?
- Can a developer correct a missing system instruction without being given the full answer?
- Do real SERV hints help someone recover from a wrong decision faster than a static hint?
- Will beginners prefer a short walkthrough or a separate guided demo?
- Is there demand beyond a one-off hackathon walkthrough? Revenue potential is **not** proven.

## Implementation gate

A feature is "working" only after its current branch tests pass **and** its deployed route is checked. Stubbed SERV API tests are not proof of a real hosted completion. A source-grounded edit validation is not a model execution.
