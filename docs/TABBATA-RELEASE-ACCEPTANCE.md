# Tabbas — Release Acceptance Checklist

This checklist is a gate, not a record of completed work. Check an item only after the named evidence exists.

## A. Build and code quality

- [ ] `npm run check` passes.
- [ ] `npm test` passes.
- [ ] Playwright browser journeys pass.
- [ ] No existing legacy test was weakened just to hide a regression.
- [ ] No new secret, quota reset, paid API key or database service was added.
- [ ] `git diff` / PR review contains only Tabbas pivot work and required route/test updates.

## B. Public interface

- [ ] Root route displays Tabbas, not the old learning product.
- [ ] Budget and expense schedule uploads produce deterministic line-item reconciliation; totals, category variances, duplicate/missing receipt references and period exceptions have regression tests.
- [ ] Main call to action reaches the review form.
- [ ] Sample preview clearly says it is illustrative.
- [ ] Loading the sample does not call SERV.
- [ ] Creating a case does not call SERV.
- [ ] Analyze is the only action that starts inference.
- [ ] Layout checked at 320, 375, 768, 1024 and 1440 px.
- [ ] No horizontal overflow.
- [ ] Keyboard focus is visible and controls have labels.
- [ ] Reduced-motion preference is respected.
- [ ] Screen-reader status updates announce workspace and review results.

## C. Document handling

- [ ] PDF extraction retains page locators.
- [ ] DOCX extraction retains paragraph locators.
- [ ] XLSX extraction retains sheet and row locators.
- [ ] CSV extraction retains row locators.
- [ ] TXT/Markdown extraction retains line locators.
- [ ] Scanned PDFs fail with a clear OCR-not-supported message.
- [ ] Unsupported file types fail closed.
- [ ] File count, per-file size, total size, extracted text and archive expansion limits are enforced.
- [ ] Formula cells are not executed.
- [ ] Original binary uploads are not persisted.
- [ ] Extracted content is rendered as text, never HTML.

## D. SERV integration

- [ ] OpenServ key is present server-side only.
- [ ] Actual hosted SERV model is confirmed.
- [ ] Function tool `submit_report_review` is forced.
- [ ] `reasoning_effort` is sent.
- [ ] The existing durable guest allowance is reserved before the call.
- [ ] No automatic retry follows a failed reserved attempt.
- [ ] The real provider call succeeds once with fictional sample data.
- [ ] Completion ID, model, latency and token usage are captured.
- [ ] No mocked result is presented as a live result.

## E. Evidence integrity and deterministic checks

- [ ] Every displayed citation has a known document and segment ID.
- [ ] Every displayed quotation is an exact substring of the cited segment.
- [ ] A wrong quote is downgraded and cannot appear as support.
- [ ] A conflicting-documents status requires at least two distinct cited documents.
- [ ] A non-existent requirement ID is downgraded.
- [ ] Budget variance is tested in integer minor units.
- [ ] Budget checks are labelled as arithmetic on user-entered totals.
- [ ] Missing evidence is not described as proof that a claim is false.
- [ ] No fraud, physical verification, audit or funding approval claims appear.

## F. Data and privacy

- [ ] Case token is random and only its hash is stored.
- [ ] Case GET, actions and DELETE require the token.
- [ ] Cases expire after 24 hours on subsequent store access.
- [ ] Explicit deletion removes the case.
- [ ] Case responses are no-store.
- [ ] No document text or sensitive financial details are written to logs.
- [ ] UI warns against beneficiary-level personal/sensitive information.
- [ ] Existing Neon database only; no new database/service.
- [ ] Existing shared guest quota is not reset, raised or bypassed.

## G. Production acceptance

- [ ] Render deployment uses the merged commit SHA.
- [ ] `/healthz` returns `service: tabbata`.
- [ ] `/api/tabbata/status` reports storage configured.
- [ ] `/api/tabbata/status` reports SERV configured.
- [ ] A case is created in production with fictional sample data.
- [ ] One explicit live SERV analysis succeeds in production.
- [ ] A source-linked finding is checked manually against the uploaded file.
- [ ] Reviewer action persists.
- [ ] Print / Save PDF works.
- [ ] Case deletion works.
- [ ] Production screenshots and run IDs are retained.

## H. Human validation and submission

- [ ] One NGO programme/M&E officer tests the workflow.
- [ ] One finance/report reviewer tests the workflow.
- [ ] Feedback is recorded accurately; no tester is invented.
- [ ] Willingness-to-pay hypothesis is clearly labelled unvalidated.
- [ ] Demo video shows the actual SERV result.
- [ ] Public repository README and docs match the deployed product.
- [ ] Hackathon form, X announcement and final demo are verified before submission.

**Release rule:** Do not call the product production-accepted or hackathon-ready while any critical item in sections D, E, F or G remains unverified.
