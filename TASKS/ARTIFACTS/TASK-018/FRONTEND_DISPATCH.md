# TASK-018 Frontend Dispatch

status: `AUTHORIZED_AFTER_MESSAGE_ACK`
owner: `frontend`

## Objective

Implement the frozen local-only FGD X15+PVC product-detail slice at
`/products/fgd-x15-pvc/` using strict TDD and the existing server-only Schema 3
`/resolve` boundary.

## Required delivery

1. Add one closed `GDHE_PRODUCT_DETAIL_MODE=preview|cms` non-production mode
   reader; all other values and production are disabled.
2. Add the minimum deeply readonly Product Detail DTO and one frozen preview
   DTO using the existing protected asset.
3. Add an authentic-wrapper Product Detail Adapter that consumes only output
   from the existing 16-Schema Validator and fails closed on identity or
   required confirmed-value mismatch.
4. Add one server-only loader with
   `disabled|ready|not_found|unavailable` states:
   - preview: zero network;
   - CMS: exactly one fixed `/resolve` for
     `/products/fgd-x15-pvc/`;
   - zero ProductCard collection calls and zero retries;
   - only validated `gdhe_not_found` HTTP 404 becomes `not_found`;
   - every other failure becomes sanitized `unavailable`.
5. Add only Product Hero, Product Overview and Key Specifications
   presentation, fixed noindex metadata and the navigation-only Request a
   Quote CTA.
6. Add focused tests and built-runtime production smoke.
7. Update `frontend/README.md` and TASK-018 execution artifacts; record the
   exact proposed root README delta for Planner instead of editing root
   `README.md`.

## Frozen visible data

- model: `FGD X15+PVC`;
- name: `FGD X15+PVC Track`;
- path: `/products/fgd-x15-pvc/`;
- category: `Manual Curtain Tracks`;
- category path:
  `/products/curtain-track-systems/manual-curtain-tracks/`;
- image: `/test-candidates/fgd-x15-protected.png`;
- overview: clearly marked replaceable local test copy;
- five rows: `28 × 27 mm`, `6 m`, `Ceiling or wall mount`,
  `155–160 g/m` track weight and `115 g/m` PVC strip weight;
- action: `Request a Quote` -> `/request-a-quote/`.

Do not expose Article Number or internal product code.

## TDD requirement

For each production slice, write the smallest real behavior test, run it and
record the expected missing-behavior RED before adding production code. Then
write only the minimum GREEN and rerun the focused regression.

At minimum preserve RED/GREEN evidence for:

1. config/DTO/preview;
2. authentic Adapter and identity/value negatives;
3. one-resolve loader and state semantics;
4. three-module route/presentation;
5. production fail-closed smoke.

Do not use source-only assertions as the sole proof of request count, media
isolation or rendered data leakage; include real rendered markup and loopback
request observations.

## Allowed product paths

- `frontend/src/app/products/fgd-x15-pvc/**`
- `frontend/src/components/product-detail/**`
- `frontend/src/types/product-detail.ts`
- `frontend/src/lib/product-detail/**`
- new Product Detail-only files under `frontend/src/lib/cms/server/**`
- TASK-018-only files under `frontend/tests/**`
- `frontend/README.md`
- `TASKS/ARTIFACTS/TASK-018/**`
- `LANES/frontend/**`

## Protected paths

Do not modify:

- `README.md` at project root;
- `cms/**`;
- `frontend/package.json`, `frontend/package-lock.json` or dependencies;
- `frontend/src/lib/cms/contracts/**`;
- existing `/resolve` Transport, URL builder or runtime Validator files;
- `frontend/src/lib/cms/product-card-contract/**`;
- `frontend/src/lib/cms/server/product-cards/**`;
- `frontend/src/types/product-card.ts`;
- `frontend/src/lib/product-list/**`;
- `frontend/src/components/product-card/**`;
- existing TASK-008 through TASK-017 artifacts;
- Planner-owned current task, Project State, Board, registry or acceptance
  state.

If a requirement appears to need a protected-path edit or an unconfirmed
product value, stop and send a linked blocker message. Do not choose a
convenient workaround.

## Validation

Use Node `24.18.0` / npm `11.16.0`. Report exact focused and full counts.

- TASK-018 focused tests and production smoke;
- TASK-017 ProductList regression;
- TASK-008–011 CMS `/resolve` regression;
- TASK-014–016 ProductCard regression;
- both contract verifiers;
- full Vitest, lint, typecheck and production build;
- protected image/package/lock/Transport/Validator/manifest hashes;
- CMS and protected-path zero diff;
- rendered no-WordPress/no-internal-field evidence;
- `git diff --check` and DPG project/registry/messages/strict lane gates.

## Stop boundary

Stop after one controlled `execution_response` linked to the dispatch message.
Do not perform visual QA, adversarial review, Planner final validation, user
acceptance, commit, push, merge, deployment, CMS/database/Feishu mutation,
working RFQ or later product-detail modules.
