# TASK-028 Adversarial Review Report

- review_request: `MSG-TASK-028-ADVERSARIAL-REVIEW-R1`
- delivery_key: `MSG-TASK-028-ADVERSARIAL-REVIEW-R1:019f88d0-018d-75e2-8e28-54a904a6bf8c`
- review_mode: one complete independent read-only review
- reviewed_at: `2026-08-12T11:51:43Z`
- verdict: `FAIL`
- P0: `0`
- P1: `1`
- P2: `1`
- Planner final validation allowed: `NO`
- permitted follow-up: same-reviewer bounded finding closure only; do not repeat the complete review
- acceptance_or_git_authorization: `NO`

## Outcome

The current delivery independently reproduces the intended local-only RFQ flow: closed customer normalization, ready-only Basket projection, a server-owned 30-minute intent, one intent plus one intake request, replay-before-intent behavior, authentic accepted-only clearing, changed-Basket retention, sanitized public DTOs, production/unset/disabled final 404, server-only isolation and the preserved visual history all remain supported by current bytes and evidence. One customer-visible contract boundary is not closed: the domain accepts the frozen Unicode code-point maxima, but the form exposes the same numeric maxima as HTML `maxlength`, which browsers enforce in UTF-16 code units. Legal non-BMP input is therefore stopped below the RFQ Submission 2.0 limit. The controlled review request also names three canonical consolidated evidence files that do not exist. The result is `FAIL / P0=0 / P1=1 / P2=1`.

## Finding

### P1-1 — native `maxlength` silently narrows the frozen Unicode code-point contract

The active acceptance criterion requires the visible field Unicode and length behavior to match RFQ Submission `2.0.0` exactly. `A0_DESIGN.md` freezes code-point maxima `120/160/128/128/254/64/100/100/2048/2000`, and `REQUIREMENTS.md` says values are never silently truncated. The domain implementation correctly follows that authority: `frontend/tests/rfq-customer-domain.test.ts` proves that `fullName: "😀".repeat(120)` is accepted and preserved, while 121 code points returns `too_long`.

The rendered form applies those same maxima directly as HTML `maxlength` values at `frontend/src/components/rfq-form/presentation.tsx:94-102`, with the concrete field values at lines `176-203`. HTML text-control length is enforced in UTF-16 code units. The accepted value above therefore has these current-byte facts:

```text
code points: 120
UTF-16 code units: 240
rendered Full Name maxlength: 120
```

Consequently, a customer typing or pasting legal astral Unicode can reach only half the frozen Full Name limit before the browser blocks further entry; the same mismatch affects other free-text controls such as Company Name, City, WeChat and Additional Requirements. The exact contract validator is never given the legal value, so its correct code-point behavior does not repair the visible flow. Current presentation tests assert the attributes and the domain test asserts the validator independently, but no test connects those two boundaries.

This is P1 because the task explicitly promises a customer-visible form with exact v2 Unicode/length semantics and no silent truncation; a valid contract value cannot be entered through that form.

Minimum bounded revision:

- stop using the code-point maximum itself as the native UTF-16 `maxlength` guard; either rely on the existing exact normalizer at submit or use a safe input boundary that cannot reject any value within the code-point maximum;
- preserve the current exact domain validation, field order, accessible errors and closed UI state;
- add a focused visible-form regression proving an exact-limit non-BMP value remains enterable and reaches normalization unchanged, while the next code point produces the stable `too_long` result without truncation or diagnostic leakage.

No product or test file was changed by this review.

### P2-1 — the controlled review request points to three absent canonical evidence files

`LANES/messages/done/MSG-TASK-028-ADVERSARIAL-REVIEW-R1.json` declares all three of these paths in `context_files`:

- `TASKS/ARTIFACTS/TASK-028/EXECUTION_REPORT.md`;
- `TASKS/ARTIFACTS/TASK-028/TEST_OR_VALIDATION_LOG.md`;
- `TASKS/ARTIFACTS/TASK-028/DIFF_OR_OUTPUT_SUMMARY.md`.

All three are absent on current bytes. The stage-specific `FRONTEND_A1_*` through `FRONTEND_A5_*`, revision artifacts and `PRE_REVIEW_VALIDATION.md` provided enough evidence to complete this review, so this is not a BLOCKED result and does not create another product finding. It is nevertheless a reproducible current evidence-package contradiction: the controlled message promises context that cannot be read, while pre-review validation reports the package ready for its unique complete review.

Minimum bounded correction: create or correct only the canonical consolidated evidence views so every declared context path exists and truthfully summarizes the already-preserved A1–A5, Visual FAIL/closure, protected-scope and current validation history. Do not rewrite historical evidence, relabel cross-lane runs as reviewer runs or change product/task semantics.

## Passing boundaries independently reproduced

- Node `24.18.0` and npm `11.16.0` were used for an independent focused rerun: `11 files / 58 tests PASS`, covering customer normalization, intent issuer/verifier and Route, Basket projection, public draft builder, public response, client orchestration, accepted clear, snapshot token, form presentation and intake Route.
- The current machine authorities passed independently: RFQ Submission v2 `20 JSON / 5 Schema / 63 closed refs / 94/94`, Article Number batch `11 Schema / 5 success / 5 error`, and Quote Basket 3.0 `1 Schema / 1 success / 6 invalid`.
- ESLint and non-incremental TypeScript checks passed. Planner's historical full `87 files / 705 tests`, production build and listener-dependent smoke evidence were inspected but are not relabeled as reviewer reruns.
- Current code preserves one closed customer object, required/contact rules, trim and omission behavior, lone-surrogate rejection, email validation, absolute credential-free HTTP(S) website data and hostile/unknown/accessor/symbol input failure without exposed diagnostics. The P1 is limited to the visible input ceiling.
- Quote Basket `3.0.0` is freshly cloned and validated; only ordered ready `1..50` lines project. Standard/accessory Article Number remains public-but-untrusted request data and is not deliberately rendered; custom lines retain `null / sales_follow_up`. Non-ready rows block the form.
- The signed intent binds contract version, configured loopback Origin, lower-case UUIDv4 idempotency key, exact six-field source snapshot, snapshot token and an exact 30-minute window. Existing-key lookup remains before the unseen-key intent gate. Signature comparison is constant-time and key bytes are not returned to the browser.
- The client uses slashless same-origin `/api/rfq/intent` then `/api/rfq/intake`, no-store and redirect refusal. Pending duplicate activation is suppressed; unchanged explicit retry reuses the byte-identical live draft; processing has no automatic retry or polling.
- Public receipt/error parsing is closed by Schema, semantic status/code pairing and a private receipt-material `WeakMap`. Visible DTOs exclude source snapshot, snapshot token, request reference, Article Number, UUID and diagnostics. Only an authentic accepted instance plus submitted/current six-field equality and recomputed token can remove the single Basket key; a changed or invalid Basket is retained in full.
- Page, intent and intake share the server-only local Stub gate. Production, unset and disabled configurations return final empty 404 before Repository, mixed validation or Sink work. Documentation remains explicit that persistence, production security suppliers, CRM/Feishu/email, deployment and production release are not implemented.
- Visual history is preserved: Round 1 `FAIL 1/2/0`, Round 2 `FAIL 0/1/0`, bounded overflow closure `PASS 0/0/0`. All `20 + 42 + 5 = 67` hashes passed; all 67 `.png`-named files are truthful JPEG/JFIF content. Five-width, accepted/changed, processing/retry, keyboard/focus/live-region, privacy and overflow evidence was not rewritten.
- A0 protection independently reports `47` exact bytes plus only the two authorized Basket browser/hook differences. Package, lock, RFQ contract/runtime core, TASK-025 batch consumer, Quote Basket v3 core and production `next-env.d.ts` remain protected; the latter is still SHA-256 `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
- `.next`, `tsconfig.tsbuildinfo`, temporary roots and listeners on ports `3000` and `18080` are absent. `git diff --check`, project validation, message validation and strict lane audit passed. Task, Project State and Board consistently show `UNDER_REVIEW / NOT_ACCEPTED / DIRTY` with this single complete review as the active gate.

## Decision

`FAIL / P0=0 / P1=1 / P2=1`.

Planner may not enter final validation or checked acceptance preparation on this report. After narrow owner-lane correction of P1-1 and the P2-1 evidence view plus fresh Planner validation, the only permitted reviewer follow-up is a same-reviewer bounded closure of these original findings; a second complete TASK-028 review is not authorized. This report is not user acceptance and does not authorize product repair by the reviewer, commit, push, merge, deployment, CMS/CRM/Feishu action or external-system mutation.

## Same-reviewer Bounded Finding Closure

- closure_request: `MSG-TASK-028-ADVERSARIAL-FINDING-CLOSURE`
- delivery_key: `MSG-TASK-028-ADVERSARIAL-FINDING-CLOSURE:019f88d0-018d-75e2-8e28-54a904a6bf8c`
- closure_mode: original P1-1 and P2-1 only; not a second complete review
- reviewed_at: `2026-08-12T12:10:16Z`
- verdict: PASS
- P0: `0`
- P1: `0`
- P2: `0`
- Planner final validation allowed: `YES`
- acceptance_or_git_authorization: `NO`

### P1-1 closure — PASS

Current rendered bytes expose exactly the ten named customer controls and none contains native `maxlength`. A source scan of the RFQ form, customer normalizer, submission client, quote page and Basket integration found no replacement `slice`, `substring`, `substr`, input-event truncation or length ceiling. The live submit path remains `FormData` to a plain entry snapshot, then the existing submission operation and `normalizeRfqCustomer`; no new validator or coercion was inserted.

The supported runtime was independently reproduced as Node `24.18.0` and npm `11.16.0`. The presentation plus customer-domain rerun passed `2 files / 14 tests`. It proves that 120 non-BMP code points, also 240 UTF-16 code units, remain byte-for-byte equal when accepted by the existing normalizer, while the 121st code point returns exactly `{ field: "fullName", code: "too_long" }`. A broader direct regression passed `11 files / 59 tests`, covering field order, required/contact behavior, ARIA/error targets, the local CSS guard, form submission, intent issuance and Route, intake Route, public response, accepted clearing, snapshot token, Basket projection and client orchestration. The complete RFQ file glob also exited `0`; lint and non-incremental typecheck passed.

No contrary current-byte evidence was found. P1-1 is closed without changing the frozen code-point limits, customer normalizer, field semantics, ARIA, CSS, submission, intent/intake or Basket behavior.

### P2-1 closure — PASS

All three exact paths are regular non-symlink files on current bytes:

- `TASKS/ARTIFACTS/TASK-028/EXECUTION_REPORT.md`;
- `TASKS/ARTIFACTS/TASK-028/TEST_OR_VALIDATION_LOG.md`;
- `TASKS/ARTIFACTS/TASK-028/DIFF_OR_OUTPUT_SUMMARY.md`.

Their claims were traced back to the A1-A5 Planner checkpoints, frontend revision evidence, Visual report and Unicode revision artifacts. The A1-A5 focused/full counts, Visual Round 1 `FAIL 1/2/0`, Visual Round 2 `FAIL 0/1/0`, bounded overflow closure `PASS 0/0/0`, `20/20 + 42/42 + 5/5` evidence inventories, Unicode RED/GREEN, protected `47 exact + 2 authorized`, current generated cleanup and scoped diff descriptions agree with those source records. The validation log explicitly labels Planner, lane, Visual and historical executions and states that cross-lane evidence is not relabeled as reviewer execution. The original complete-review `FAIL / P0=0 / P1=1 / P2=1` remains intact above this closure and is not rewritten as a current complete-review PASS.

P2-1 is therefore closed: the dispatched evidence package now has the three promised consolidated views, with truthful attribution and preserved history.

### Direct integrity regression

- The A0 checksum stream independently returned `47` exact paths and only the two previously authorized A4 Basket browser/hook differences; the frozen RFQ Schema, server authority, intent/intake core, package, lockfile, tsconfig and production `next-env.d.ts` remained exact.
- `frontend/.next` and `frontend/tsconfig.tsbuildinfo` are absent; no listener was present on ports `3000` or `18080` after reviewer tests.
- `git diff --check` passed before this report-only append. No product, test, documentation, Planner authority, CMS, dependency, Visual, Git, deployment or external-system byte was written by this closure.

### Closure decision

`PASS / P0=0 / P1=0 / P2=0` for the bounded finding closure. Planner may proceed only to fresh final validation and checked acceptance preparation after acknowledging the linked controlled response. This closure is not user acceptance and does not authorize commit, push, merge, deployment, CMS/CRM/Feishu work or any new implementation.
