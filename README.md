# TrySERV — learn OpenServ by doing

> **Working name; independent community project, not an official OpenServ site.**

## Why this exists

Official documentation explains OpenServ and its APIs. TrySERV is an **interactive practice layer**: four short, sourced lessons, deterministic feedback on real exercises, a copyable first SERV request, and an optional SERV-powered tutor that explains the current lesson.

Unlike a general AI chat interface, every lesson has a concrete outcome and links to the official source. Learners can finish the free path with no signup, API key or paid inference.

## How to test

1. Open https://tryserv.onrender.com/. Use **I'm new** for the four lessons, or **I can code** for the builder.
2. Complete "Find your way around OpenServ" (Agents, Workflows, Connect), then "What is SERV?" and observe why a wrong choice is wrong.
3. Complete "When reasoning helps" with an ambiguous decision scenario. No SERV inference is used for exact grading.
4. Complete "Build your first request". Copy the JSON and curl command; nothing is executed on this screen.
5. Earn 20 XP per passed lesson (maximum 80 XP). Repeating a lesson does not add XP. Refresh and verify resume, or use the reset option. Progress/XP are on this browser only.
6. **Optional live SERV tutor:** configure `SERV_API_KEY` and a separate `LEARN_ACCESS_TOKEN` as Render secrets. Enter only the instructor access code in the browser, then ask a lesson-related question. The real model, completion ID and source appear.
7. With no secrets configured, the tutor is visibly unavailable and all free lessons remain functional.

## Run independently (no Docker, no npm dependencies)

Node 22+:

```bash
node --check server.mjs
node --test test/*.test.mjs
node index.mjs
```

Visit http://localhost:3000 (landing), /learn (studio), or /try (builder).

## Server endpoints

- `GET /`: public landing page
- `GET /learn`: learning studio
- `GET /try`: direct request-building lesson
- `GET /api/lessons`: four source-linked lessons, correct answers excluded
- `POST /api/check`: deterministic assessment / validated API request preview
- `GET /healthz`: health and tutor-enabled status
- `POST /api/mentor`: access-gated live SERV Reasoning tutor, using source-specific grounding, strict response validation and per-process limits

Request previews do **not** make paid calls. No one is asked to paste an OpenServ API key into the webpage. Local learning progress stays in the browser and does not imply an account.

## Source trust and safety

- Verified teaching sources: https://docs.openserv.ai/serv-reasoning/introduction, https://docs.openserv.ai/serv-reasoning/day-one and https://docs.openserv.ai/serv-reasoning/api/chat-completions
- A tutor request includes explicit verified lesson context, not a live web crawl.
- An incorrect model response, failure, or timeout is shown as an error, not hidden behind a prerecorded response.
- Inference is disabled unless both server environment secrets are set.
- The service restricts tutor calls to 3 per client/10 minutes and 35 per process lifetime. This is temporary staging protection, not a production multi-tenant billing service.
- No claims of official OpenServ endorsement, teaching certification, or AI explanation accuracy.

## Current phase / not yet done

- [x] Polished standalone landing page with functional beginner/builder entry routes
- [x] Four sourced interactive lessons, browser-only XP and resume, and a request-builder preview
- [x] API backend with deterministic checks
- [x] SERV tutor implementation with HTTP stub tests
- [ ] Cloud live SERV call with operator-provisioned secret
- [ ] Live usability session with a first-time learner
- [ ] Expanded curriculum, stronger learning analytics and public billing safeguards
- [ ] Brand and dedicated repository

## Competition

OpenServ Edition 02, proposed Open Track; deadline November 15, 2026, 23:59 UTC. Public repo, working demo, short write-up and X post required:
https://www.openserv.ai/hackathon-2

This Dedicated public repository; previously developed in an isolated Opsra branch.


## November 12 update — learning guidance and real SERV practice

Wrong answers now give option-specific hints instead of immediately revealing the correct choice. When private tutoring is enabled, **Ask SERV to explain my mistake** prepares a context-specific question without sending a paid request automatically.

The last lesson builds a request in preview mode. After passing validation, an operator can use **Run this request with SERV** with the same private demo access code to execute an actual SERV call. The page then shows response text, model, completion ID, measured latency, and token usage. **No paid call occurs when simply previewing or copying code.**

The private demo access code is NOT a teacher account and not required for normal learners. It protects paid inference while testing. Both paid endpoints share a small in-process allowance (3 requests per 10 minutes per connection peer and 35 per process lifetime); these limits reset on restart and are not production-grade protection for unrestricted public access.

Integration tests use mocked SERV responses. **Live hosted SERV completion remains unverified** until the operator invokes the actual endpoint using the securely configured Render secrets.

## Public SERV tutor — controlled guest trial

TrySERV now offers **limited, account-free SERV tutoring** on the normal learning page. Learners do not enter an instructor code or API key. The tutor reads lesson context and explains a question or misconception using a real OpenServ API call.

To protect the project owner’s SERV credits, the public trial has a **durable lifetime allowance of 24 guest calls** and **2 calls per visitor/browser-network identity per UTC day**. Usage is reserved atomically in a dedicated Neon PostgreSQL database **before** the external API call. Failed provider calls still consume allowance, so repeated upstream failures cannot result in unlimited spending. Each guest is represented by a keyed hash rather than a stored raw IP or user-agent. The global limit remains effective even if a visitor changes identity or restarts Render.

When the guest allowance is exhausted, the free lessons, exercises, XP and JSON/curl request preview continue working. Database outages fail closed and never silently send a paid inference. This is a deliberately small public demonstration budget, **not an unlimited commercial tutor**.

The **advanced live request-builder** still requires the private demo access code, since it accepts custom system/user prompts; the code is not required for ordinary lesson tutoring. Neither the SERV API key nor the database password is exposed to the browser.

Operators: the standalone Neon project is named `tryserv-public-tutor-budget`. The Render secrets `DATABASE_URL`, `SERV_API_KEY`, and `LEARN_ACCESS_TOKEN` are server-side. `PUBLIC_TUTOR_ENABLED=true` opts in to free guest access; omitting it disables guest requests safely. All guest reservations are durable; do not reset quotas without reviewing credit consumption. Live inference should be verified with a single browser request before claiming it works end to end.
