# TrySERV — independent real-user acceptance kit

**State:** Recruiting/observations pending, not complete. Created 13 November 2026.

This is a human usability gate, **not** an automated test. GitHub Chromium tests and hosted production smoke checks cannot tell us if real people understand OpenServ or know what TrySERV does.

## Tester A — new to OpenServ

Share only: https://tryserv.onrender.com/ . Ask for a fresh private browser window, a phone or laptop, and no account or wallet connection. Do not show answers or lead them to specific buttons.

### Neutral script to send

> Try this independent OpenServ learning website. Without instructions from me, tell me what it does, complete the beginner lessons, and show me your learning summary. Explain whether its request builder sends an API call or only checks a preview. If anything confuses you, please tell me where you got stuck.

Capture the **actual** result: reached entry CTA, understood that app is independent from OpenServ, completed all four lessons, understood preview ≠ live execution, could find official source, and could recover after a wrong answer. Record pass/fail, what they clicked, exact confusing copy, whether mobile/desktop, and one or two direct quotes with permission.

## Tester B — developer familiar with APIs but new to TrySERV

Share only: https://tryserv.onrender.com/ . Do not supply the docs link or step-by-step rescue instructions.

### Neutral script to send

> Open this website and find the fastest path to building a SERV request. Validate a request, then use its debugging area to correct the three sample mistakes. Show me which actions cost AI credits and which are free. Tell me whether you would find this useful when first integrating an unfamiliar SDK/API.

Capture: developer can find /try, validates/copies request, fixes three repair tasks, understands the sandbox distinction, can find source docs, can inspect optional SERV reasoning, and describes one specific future use or limitation. Do not require the tester to consume the scarce public SERV trial.

## Observation form (duplicate for each genuine tester)

- Date/time (WAT), device/browser, first-time or existing OpenServ experience
- Tester consent to recording? yes/no (never publicize personal identifiers without permission)
- Task completion: entry __/__, exercises __/__, debugging __/__, preview-vs-execution correctly explained? yes/no
- Top confusion/blocker (quote exact visible UI)
- Navigation confusing? yes/no, where
- One thing they understood only after using the app
- One thing they would change before recommending TrySERV
- Willingness to use for a first API integration: yes/no/unsure, reason
- Screenshots or screen recording: redacted, optional
- **Tester result:** verified human pass / partial / blocked (never infer from automated tests)

## Human mobile/accessibility checklist

Use at least one physical phone if available. At 320px/375px: primary navigation discoverable; all four lessons visible; no horizontal clipping; tap targets comfortably sized; form labels and validation errors legible; onscreen keyboard does not hide essential actions. On desktop: keyboard Tab/Enter alone can reach the lesson, answer, builder, debug, docs and SERV button; the skip link works; focus remains visible. If possible, use a screen reader and inspect spoken status messages. Automated ARIA checks are not proof of screen-reader usability.

## Release decision

If a tester is blocked before completing a core task, fix that exact blocker, add a regression, and verify Render before submission. If all tasks work but someone dislikes the appearance, prioritize clarity improvements only. **Do not claim user traction, satisfaction statistics or field-tested accessibility until observations are recorded.**

### Current project boundaries

Free and deterministic: lesson quizzes, browser-local lesson completion, request builder validation, and three debugging missions. Optional paid live SERV: context-aware tutor and explaining an actual validated debugging issue, only after explicit click and within the durable budget (two calls per approximate visitor per UTC day; 24 shared lifetime). Private custom inference requires operator authorization. Do not ask testers for API keys, private access codes or payments.
