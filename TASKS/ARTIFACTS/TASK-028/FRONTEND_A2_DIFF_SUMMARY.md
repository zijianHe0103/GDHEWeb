# TASK-028 Frontend A2 Diff Summary

result: PASS

## New product files

- `frontend/src/lib/rfq/server/v2/intent.ts` — server-only local HMAC intent.
- `frontend/src/app/api/rfq/intent/route.ts` — local issuer Route.
- `frontend/src/lib/rfq/submission/index.ts` — client-safe Basket projection,
  intent-response validation and complete public draft builder.

## Narrow existing product change

- `frontend/src/app/api/rfq/intake/route.ts` — replace the placeholder passing
  pre-reservation gate with `verifyLocalRfqIntent`; map only its existing
  sanitized rejection to `403 invalid_submission_intent`. The delivered runtime
  lookup/reservation/mixed/Sink files remain byte-identical.

## Test and smoke changes

- New: `rfq-intent-v2.test.ts`, `rfq-intent-v2-route.test.ts`,
  `rfq-submission-v2-projection.test.ts`, `rfq-submission-v2-builder.test.ts`.
- Narrow updates: bind the existing intake Route happy fixture to a real issued
  intent; add intent/deep/Route Client Component build negatives; make the RFQ
  production smoke obtain real local intent material and assert intent 404 in
  disabled/production modes.

## Preserved boundaries

- No package, lockfile, dependency, environment file, customer A1 byte,
  Quote Basket 3.0 contract/domain byte, TASK-025 mixed consumer byte, RFQ v2
  Schema/snapshot/runtime byte, page/component/CSS, CMS, CRM/Feishu, Planner
  authority, Git or deployment change.
- A0 protected inventory remains exact `49/49`; the only A0-declared existing
  A2 edit surface used is the intake Route.
- Unrelated shared-worktree governance, `frontend/tsconfig.json`, resume packet
  and historical task edits were preserved and not reformatted or reverted.
