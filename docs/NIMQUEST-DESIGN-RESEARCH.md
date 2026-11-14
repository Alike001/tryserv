# TrySERV: NimQuest inspiration and original design direction

Reviewed: 12 November 2026.
References: https://github.com/mystiquemide/nimquest and https://nimquest.midelabs.xyz/
Purpose: product research only. No NimQuest source files, artwork, photography, branding, copy, lesson catalogs or code were imported.

## Patterns worth borrowing
- One clear homepage promise and functional entry action.
- A visible learner journey, from short lessons to server-graded exercises to an explicit result.
- Distinct discoverable cards for different kinds of learners.
- Clear progress, review and next actions rather than unrelated disconnected screens.
- An in-app documentation portal covering overview, architecture, integrations, security and setup.
- Honest distinctions between quiz correctness and true wallet proof: NimQuest uses Nimiq Pay signature verification after passing quizzes. TrySERV should not claim an equivalent capability.

## Critical differentiation

| NimQuest | TrySERV |
| --- | --- |
| Nimiq education, wallet signing | OpenServ Agents, Workflows and SERV Reasoning |
| Wallet-verified completion and leaderboard | Browser-local lesson completion, no signed credential |
| Nimiq Pay mini-app | Source-grounded real SERV inference for optional tutoring |
| Wallet proof after quiz | Learn → Practice → Build → Review without wallet actions |
| Nimiq developer onboarding | SERV API request construction, validation and repair |
| Hosted persistent signing receipts | Browser-local lesson and debugging progress |

NimQuest's public repository uses the MIT license. TrySERV uses high-level interaction patterns only and retains original visual implementation.

## Original TrySERV visual direction

- Keep TrySERV's logo and cobalt/navy identity.
- Introduce original mint, light-blue and peach task cards, subtle offset borders/shadows, readable headings and visible keyboard focus.
- Distinguish editorial discovery on the homepage from functional learning studio screens.
- Build first-class documentation at /docs: Overview, paths, progress, SERV integration, sample request, troubleshooting, architecture, security/privacy and FAQ.
- Surface guide links from homepage, lessons, builder and debugging.
- Show exact boundaries: local completion progress is not an official credential, validated preview is not a live API call, SERV tutor can err, and free inference is credit capped.
- Maintain responsive layouts and accessibility.

## Implemented on feat/docs-and-learning-navigation

- New static /docs route and original responsive style.
- Homepage route choice cards for a novice, builder or troubleshooter.
- Homepage documentation preview and product guide links.
- Navigation integration with learning studio and debugging lab.
- Fix an outdated curriculum sentence describing paid SERV calls.
- Node API tests and Chromium browser tests for guide navigation and responsive behavior.

## Remaining acceptance gates

- Check GitHub Node and browser CI before merging.
- Verify Render production deployment after merging.
- Manual first-time learner and developer walkthrough on real mobile and desktop, including keyboard and screen reader checks.
- Prepare hackathon screenshots, walkthrough, and submission from verified claims only.

Principle: Make OpenServ understandable to a newcomer and useful to a developer without demanding a wallet, paid API keys, or a giant generic agent platform.

## Mobile navigation regression caught before merge

Chromium testing exposed two mobile header issues: the newly added guide link was initially hidden behind desktop navigation, and shrinking the 320px header initially hid its primary Start learning CTA. Both were corrected: mobile shows Docs visibly and uses a shorter Start label on the narrowest screens while keeping the accessible full link text. Validate this with the latest branch browser CI before merging.
