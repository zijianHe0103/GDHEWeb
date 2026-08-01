# TASK-020 Implementation Plan

status: `PLANNED`
method: strict TDD

Each numbered seam is a separate RED -> verify RED -> minimum GREEN -> verify
GREEN loop. Production code for a seam is forbidden until its directly related
test has failed for the expected missing behavior.

## A0. Protect the delivered baseline

1. Reproduce all three contract verifiers, focused detail/configuration tests,
   full Vitest, lint, typecheck, build and production smokes.
2. Freeze CMS, Product Configuration snapshot, QuoteLine Schema/samples,
   package/lock, ProductCard/list, protected media and next-env hashes.
3. Record the precise allowed frontend paths and reject all other drift.

Exit: `BASELINE_VALIDATION.md` and `PROTECTED_BASELINE.md` PASS.

## A1. Fixed Product Configuration Transport

RED 1:

- importing the planned Transport fails because it does not exist;
- wished-for URL is exact and has only locale/schema/path;
- one real loopback request must be GET, one call, redirect error, no retry.

GREEN 1:

- add closed errors and a no-query fixed Transport;
- implement JSON/content/cache/ETag/status, timeout and abort behavior only.

RED 2:

- wrong content type, empty/invalid JSON, redirect, 2xx other than 200, missing
  ETag, wrong cache control, HTTP error without no-store, timeout, abort and
  network failure each lack the frozen result.

GREEN 2:

- add the minimum mappings and sanitized error objects.

Checkpoint: focused Transport tests all pass; no Validator/Adapter/UI yet.

## A2. Exact four-Schema Runtime Validator

RED 1:

- missing static registry and root validation;
- tampered root, unknown field, remote/unknown `$ref`, unsupported version and
  non-JSON input are rejected.

GREEN 1:

- statically import the exact local closure and compile with existing AJV;
- clone/freeze before validation.

RED 2:

- forged wrapper, wrong product identity, duplicate option identity, invalid
  ordering and mismatched closed policies pass without semantic/authenticity
  gates.

GREEN 2:

- add only the page-specific semantic checks and WeakSet-backed wrapper.

Checkpoint: exact success fixture passes; mutation/error matrix fails closed.

## A3. Public DTO Adapter and server-only boundary

RED:

- raw payload or forged wrapper reaches Adapter;
- nested output is mutable;
- internal/unused fields can be observed;
- Transport/Validator/Adapter deep Client Component imports compile.

GREEN:

- implement exact-field copy and deep freeze;
- add `server-only` markers to every server module;
- prove real Next builds fail for direct and deep client imports while
  marker-stripped controls build.

Checkpoint: Client-visible object contains only the designed DTO.

## A4. Configuration loader and page-state composition

RED 1:

- preview has no configuration DTO;
- CMS ready page makes no fixed configuration request;
- normalized configuration not-found/error cannot be distinguished from detail
  not-found/error.

GREEN 1:

- add preview DTO and closed `ready|not_found|unavailable` configuration loader;
- extend Product Detail page state without exposing private errors.

RED 2:

- ready CMS page violates one `/resolve` + one `/product-configurations` + zero
  ProductCard requests;
- failed detail still performs unnecessary configuration request;
- hostile/internal payload leaks into route markup.

GREEN 2:

- use sequential orchestration and fail closed before React.

Checkpoint: real route tests prove exact request counts and sanitized states.

## A5. Pure QuoteLine builder

RED 1 resolved branch:

- exact standard option cannot produce the frozen resolved line;
- client-claimed length/color can override the selected Article Number.

GREEN 1:

- exact-match Article Number and copy option facts from DTO.

RED 2 custom branch:

- positive one-decimal custom length and real color cannot produce a null-
  Article-Number line;
- zero, signs, exponent, multiple decimals, unknown colors and extra precision
  are accepted.

GREEN 2:

- canonical string parsing and DTO color membership.

RED 3 common configuration:

- missing/unknown installation, base packaging, protection, logo type and
  quantity invalid matrix are accepted;
- quantity above safe integer passes.

GREEN 3:

- closed primitive validation, exact DTO membership and frozen result.

Checkpoint: resolved/custom results validate against the frozen QuoteLine
Schema; no contract authority byte changes.

## A6. Visible ProductConfigurator

RED 1:

- route markup lacks section anchor, field groups, labels, current real option,
  installation, packaging, quantity and action.

GREEN 1:

- add one Client Component and local CSS with native semantic controls.

RED 2:

- invalid form has no associated accessible errors;
- valid resolved/custom submit has no `aria-live` result;
- result persists or a network/storage call occurs.

GREEN 2:

- add component-memory state, closed errors and user-readable result only.

RED 3:

- Hero still navigates directly instead of reaching configuration;
- configuration failure exposes partial form or loses navigation fallback.

GREEN 3:

- wire in-page CTA for ready state and explicit fallback for unavailable state.

Checkpoint: preview and CMS route tests plus DOM/storage/network negatives pass.

## A7. Responsive and interaction refinement

1. Run focused source/DOM tests before visual QA.
2. Start one controlled current-byte local preview.
3. Capture 1440/1024/768/390 and 320 reflow for:
   - initial form;
   - validation errors;
   - resolved success;
   - custom success.
4. Check keyboard order, focus-visible, labels, error announcement and touch
   targets.
5. Grade severe/obvious/detail differences; any code fix begins with a direct
   failing regression and returns to GREEN before visual retest.

Exit: independent Visual QA current verdict PASS with history preserved.

## A8. Regression and protected-state verification

- new focused suites;
- TASK-017 ProductList and TASK-018 Product Detail suites;
- TASK-019 Product Configuration and QuoteLine suites;
- full Vitest;
- three contract verifiers;
- lint, typecheck, production build and list/detail smokes;
- exact CMS/snapshot/Schema/sample/package/lock/image/next-env hashes;
- no temporary server, build copy, bytecode, test Fixture or database residue;
- `git diff --check`, governance validate, messages and strict lane audit.

## A9. Review and acceptance gates

1. Frontend writes execution, validation and diff reports plus README/docs.
2. Planner independently reproduces the declared evidence.
3. Visual QA produces a separate result.
4. Adversarial reviewer performs read-only review and returns PASS/FAIL with
   P0/P1/P2.
5. Planner final validation and Summary follow only after final PASS.
6. Checked `prepare-awaiting-user` is the only path to user acceptance wait.

No commit, push, merge or deployment is authorized by this plan.

## Rollback

TASK-020 has no database or external mutation. Before formal delivery, rollback
is deletion/reversion of only TASK-020-added frontend files and restoration of
the explicitly changed FGD detail files to the frozen baseline. CMS, Product
Configuration authority, QuoteLine Schema/samples, package/lock and protected
media must remain byte-identical throughout.
