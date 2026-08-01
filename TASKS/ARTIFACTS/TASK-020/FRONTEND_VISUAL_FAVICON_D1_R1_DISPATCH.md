# TASK-020 Frontend Visual Favicon D1 Round 1 Dispatch

status: `AUTHORIZED_NARROW_REVISION`
source_visual_verdict: `FAIL / severe 0 / obvious 0 / detail 1`

## Finding

The system-level keyboard recovery closed every native keyboard gate. A fresh
Google Chrome Guest window exposed one remaining detail finding on initial page
load:

`GET http://127.0.0.1:3000/favicon.ico` → `404 Not Found`

This is the only Console error. Network recording across native Enter remained
empty, and no external, WordPress, ProductCard, submission or Feishu request
occurred. Do not modify configurator logic or reinterpret the keyboard evidence.

## Required TDD revision

1. Record a direct RED proving the Next app currently has no root icon metadata
   file and the browser-visible favicon resource is missing.
2. Add the minimum dependency-free Next App Router special metadata icon:
   `frontend/src/app/icon.svg`.
3. The SVG must be a small self-contained local GDHE fallback monogram only:
   no remote reference, script, animation, embedded raster data, Product data,
   credential or internal field. Mark it in-source as a local non-production
   fallback to be replaced by the approved final brand favicon later.
4. Add a focused regression that proves the file is valid local SVG, contains
   no external/script/data dependency, and remains within a small deterministic
   byte bound. Do not add a package.
5. Prove through the normal Next production build that the special metadata
   icon route is emitted without changing the existing page routes or
   production 404 boundaries. Planner/visual_qa owns the fresh Chrome Console
   retest; frontend must not claim visual PASS.

If `icon.svg` alone does not produce the normal Next icon metadata route in the
build, stop and report the evidence instead of widening into root layout or a
binary/favicon generator without Planner authorization.

## Allowed writes

- `frontend/src/app/icon.svg`;
- one direct focused test under `frontend/tests/**`;
- only the minimum TASK-020 frontend execution/validation/diff artifacts and
  `LANES/frontend/worklog.md`;
- one controlled response linked to
  `MSG-TASK-020-FRONTEND-VISUAL-FAVICON-D1-R1`.

## Protected scope

- no change to `frontend/src/app/layout.tsx`, page metadata or routes;
- no configurator, Product Detail, Product Configuration, QuoteLine,
  ProductCard/ProductList or CMS runtime change;
- no protected image, package, lockfile, dependency or Next config change;
- no CMS/database, task authority, root README, visual evidence, review, Git,
  deployment, Basket, persistence, submission, Feishu or external-system work.

## Required validation

- focused RED then GREEN;
- existing TASK-020 focused suite;
- full Vitest;
- three contract verifiers;
- lint, typecheck and production build;
- Product Detail and ProductList production smokes;
- protected hashes/inventories, generated-file cleanup, `git diff --check` and
  DPG project/messages/strict-lane gates.

Return one linked execution response. Visual Round 1 BLOCKED and keyboard
recovery FAIL histories must remain unchanged until the independent visual
retest.
