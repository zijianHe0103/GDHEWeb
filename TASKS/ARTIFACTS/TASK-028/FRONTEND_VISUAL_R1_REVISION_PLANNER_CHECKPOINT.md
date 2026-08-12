# TASK-028 Frontend Visual R1 Revision Planner Checkpoint

checked_at: `2026-08-12T10:50:15Z`
result: `PASS_AFTER_NARROW_REVISION`
response: `MSG-TASK-028-FRONTEND-VISUAL-R1-REVISION-RESPONSE`

## Independent scope check

- The linked response was validated, ACKed and moved to `done` before this checkpoint.
- The production delta is limited to the three authorized seams: two browser URL literals, Ajv full closed-error collection, and one same-page local Privacy Policy link/section.
- No CSS, field order, Basket/RFQ contract, server Route, clear/retry behavior, dependency, CMS, CRM/Feishu/email, database or external service changed.
- Visual QA Round 1 remains historical `FAIL / severe 1 / obvious 2 / detail 0`; this checkpoint does not claim visual PASS.

## Independent behavior

- S1: the real browser client uses exactly `/api/rfq/intent` and `/api/rfq/intake`, keeps `redirect: "error"`, and preserves one intent then one intake, pending suppression and explicit replay.
- O1: an empty form returns the deterministic ordered set `fullName`, `companyName`, `countryRegion`, `city`, `contactMethods`; presentation tests reproduce all five messages, summary anchors and stable field/error associations.
- O2: one focusable `Privacy Policy` link precedes submit and targets the real same-page `#rfq-privacy-policy` section. The copy is explicitly local/non-production, no Feishu/CRM/email and no durable production storage; there is no external URL or production legal claim.

## Fresh Planner validation

- direct revision tests: `3 files / 29 tests PASS`;
- first monolithic full run: `86/87 files` and `704/705 tests` PASS, with one pre-existing five-second listener counter timing miss in `article-number-batch-transport.test.ts`;
- isolated unchanged timing file: `1 file / 4 tests PASS`;
- serial complete inventory: `87 files / 705 tests PASS` with `--maxWorkers=1`;
- all ten contract verifiers PASS, including RFQ Submission v2 `20 JSON / 5 Schema / 63 closed refs / 94/94`;
- ESLint, non-incremental typecheck, Next 16.2.11 production build and five production smokes PASS;
- RFQ smoke confirms local page/noindex, accepted/processing/conflict/customer/Basket outcomes, exactly one intent plus one intake, replay, zero legacy and unset/disabled/production final 404;
- A0 protection: `47 exact + 2 previously authorized Basket Browser differences + 0 blocking`;
- package, lockfile, pre-existing tsconfig and restored production next-env hashes are exact;
- Planner-generated `.next` was moved recoverably to `/tmp/gdhe-task028-visual-r1-planner.pvurgz/.next`; TypeScript cache and ports 3000/18080 are clear;
- `git diff --check`, DPG project, messages and strict lane audit PASS.

## Gate

Only one narrow Visual QA Round 2 is released. It must reproduce the fixed API path, complete five-error accessibility, Privacy Policy keyboard/target behavior, accepted-cleared, accepted-changed, processing and explicit retry, plus the responsive/privacy/network regression. The task's single complete adversarial review remains blocked until Visual QA PASS.
