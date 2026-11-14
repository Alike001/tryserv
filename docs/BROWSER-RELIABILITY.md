# TrySERV Browser Reliability Gate

Updated: 14 November 2026.

## Why it exists

Static tests confirm JSON contracts and request logic, but do not prove that a learner can click through a responsive site, use the keyboard, or retain their progress. This suite drives real Chromium in GitHub Actions. The learning studio tracks completed lessons only; there are no points or XP rewards. It runs on a hosted GitHub runner, **not on the user's laptop**, and never calls the paid SERV API.

## Browser journeys (Chromium, 1440×900 desktop and 375×812 mobile)

1. Landing links lead to /learn and /try; request builder is visible when chosen.
2. A wrong answer yields a meaningful hint; the lesson remains incomplete until the correct answer passes.
3. Complete all four lessons, build the request preview, see the learning summary, reload and verify saved completion.
4. Repair all three /debug cases through the UI, then return to the learning studio and retain progress.
5. Navigate and submit a challenge with keyboard focus and Enter/Space.
6. Read guest tutor allowance without spending credits; model response is an **explicit test mock**, not a hosted SERV completion.
7. Check page-wide horizontal overflow at 320, 375, 768, 1024 and 1440px across /, /learn, /debug and /try.

Run through the dedicated `TrySERV browser journeys` GitHub workflow on pull requests and main pushes. Reports are uploaded on failure. Browser test runner is pinned to `@playwright/test@1.65.0` in the workflow and only installed on cloud CI, separate from Render's small application dependencies.

This is a functional regression gate, **not** a substitute for a real person's screenreader and usability review. We must still manually confirm focus order, colors/contrast, local mobile UX and real user task completion before final submission.

Reference: https://playwright.dev/docs/ci

## No financial side effects

The suite launches a local backend without SERV secrets or guest funding configuration. Mocked /api/mentor responses do not invoke OpenServ and **do not prove paid inference**. The previously supplied real completion screenshot is separate evidence.
