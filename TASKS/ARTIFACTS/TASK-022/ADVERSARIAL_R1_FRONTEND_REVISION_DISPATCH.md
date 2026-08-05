# TASK-022 Adversarial Round 1 Frontend Revision Dispatch

request_id: MSG-TASK-022-FRONTEND-ADVERSARIAL-P1-P2-R1
source_review: MSG-TASK-022-ADVERSARIAL-REVIEW-R1-RESPONSE
scope: four_bounded_closures_only
task_state: NEEDS_REVISION

## Required strict TDD closures

### P1-1 Domain stable error boundary

- Reproduce the reviewer secondary thrown-Proxy reflection attack and raw TTL `RangeError` at the JavaScript Date maximum.
- Make every public domain reflection/copy failure trap-safe and sanitized without attacker-observable `instanceof` or property access on an untrusted thrown value.
- Validate `now + 2592000000 ms` is finite and representable before `toISOString()`.
- Prove the same stable boundary across create/add/set/remove as applicable.
- Preserve exact 30-day acceptance, the historical A1/A2 Proxy closure, immutability and atomic rejection.

### P1-2 Storage stable error boundary

- Reproduce a storage backend throwing a hostile Proxy, Proxy-wrapped DOMException and unsafe `name` access.
- Make quota classification trap-safe; unsafe/unclassifiable thrown values become only `storage_unavailable` with no raw diagnostic.
- Preserve native quota/security classification and the original legal in-memory Basket on rejected writes.

### P2-1 Truthful add/merge classification

- Reproduce expiry between the adapter's prior and mutation clock reads.
- Sample the operation time once and derive `added`/`merged` from the same exact validated base and identity used by the mutation, not line-count equality across a second snapshot.
- Preserve ordinary identical merge, different split, persistence and cross-tab newer-snapshot behavior.

### P2-2 Persistent final-remove live region

- Reproduce final-line Remove returning the empty branch without the removal announcement in an `aria-live` node.
- Keep one sanitized live region across loading/error/empty/one/N states.
- Add a real client-level regression that removes the final line and asserts both empty state and exact removal announcement.
- Do not change the passed layout or any existing visual evidence byte.

## Validation and boundaries

- Run the direct new RED/GREEN tests, ordinary Basket focused suite, full frontend suite, five verifiers, lint, typecheck, production build and four production smokes.
- Verify package/lock, PublicQuoteDraft, Product Configuration, QuoteLine, protected media/CSS, CMS and visual 15/15 hashes remain unchanged.
- Restore generated `next-env.d.ts`, remove generated `.next`, temporary probes/listeners and preserve user-owned/unrelated dirty files.
- Update only TASK-022 frontend execution evidence and frontend worklog; do not modify Planner-owned active task, Project State/Board, root docs or canonical reviewer report.
- Do not implement final RFQ submission, Feishu, TASK-023, CMS, dependency, Git or deployment work.

Return one linked `execution_response` after all four closures and fresh lane validation. This is not review PASS or acceptance.
