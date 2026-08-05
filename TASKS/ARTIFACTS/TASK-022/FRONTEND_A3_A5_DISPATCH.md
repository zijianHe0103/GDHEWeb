# TASK-022 Frontend A3-A5 Controlled Dispatch

Date: 2026-08-05
From: `planner`
To: `frontend`
Prior checkpoint: A1/A2 `PASS_AFTER_R1`

## Required reading

Read the active task, all TASK-022 requirements/design/plans, the A1/A2
execution and Planner checkpoint, current Quote Basket code, current product
page/configurator and local route-gating implementations before ACK.

## A3 — product-page Add to Quote integration

Use strict RED before minimum GREEN:

- add a server-owned public Basket product projection for FGD X15+PVC using
  only model, customer name, public path and the approved protected local image;
- prove Product/Media/WordPress/Article Number/internal IDs do not cross into
  the Client Component, Flight, DOM, storage, errors or logs;
- add a small dependency-free client Basket hook/adapter that generates
  browser-only UUIDv4 values, hydrates from validated storage, persists through
  the frozen A1/A2 API and listens to same-origin storage events;
- replace the live one-latest-draft production state with Basket add/merge;
- keep existing field validation and customer labels unchanged;
- valid Add to Quote stays on the product page, announces added versus merged,
  shows Basket line count only and provides `View Quote Basket`;
- invalid form performs zero Basket writes; storage failure preserves the
  previous in-memory state and shows one sanitized public error;
- do not render a cross-unit quantity total.

## A4 — local `/request-a-quote/` Basket page

Use strict RED before minimum GREEN:

- add the local route with the existing preview/cms gate and
  `noindex,nofollow`; production must remain final 404;
- client view must hydrate safely from validated storage and show clear loading,
  empty, storage-unavailable and one/N states;
- empty state links back to `/products/`;
- item rows use the approved Apple-inspired information hierarchy without
  copying Apple assets: protected image on the left, compact model/name and
  length, color, packaging, Logo, protection and quantity/unit on the right;
- support absolute positive-safe-integer quantity editing and Remove for the
  exact target line, with keyboard/focus/live announcements;
- omit price, currency, Save for Later, delivery, checkout, payment, order and
  ecommerce claims;
- do not submit anything. Render a truthful next-step explanation; any
  `Request a Quote` control must be disabled/non-actionable and must not fetch,
  navigate to success or write external state;
- page and product integration perform zero WordPress/Feishu requests and use
  only approved local protected media.

## A5 — documentation and complete validation

- update root `README.md`, `frontend/README.md`, the frontend product/
  configuration quote contract, architecture contract and ADR-006 only for the
  confirmed terminology: Quote Basket is a non-payment RFQ collection; final
  submission and external integration remain unimplemented;
- preserve TASK-021 visual/review history and every frozen authority byte;
- run focused interaction/storage/route/presentation/security tests, existing
  product/configurator regressions, all five verifiers, full Vitest, lint,
  typecheck, production build and all existing plus new production smokes;
- prove production `/request-a-quote/` 404 in preview and cms env variants with
  zero CMS/Feishu requests;
- restore `next-env.d.ts`, remove generated roots/listeners and verify 15/15
  protected hashes, package/lock, CMS zero diff, leakage, scope, diff and DPG
  gates.

## Visual boundary

Frontend must create code-level responsive/accessibility tests but must not
claim visual PASS. Stop after the complete A3-A5 execution response. Planner
will independently start a local preview and dispatch visual QA at
1440/1024/768/390/320 only after its checkpoint passes.

## Hard exclusions

No related products/TASK-023, contact form, attachments, CAPTCHA, final API,
NestJS, Feishu, email, Webhook, account sync, production release, dependencies,
review, acceptance, Git or deployment.

## Required response

Update the aggregate TASK-022 execution/TDD/validation/diff artifacts, add any
focused A3-A5 evidence needed for truthful reproduction, update frontend
worklog, send one linked `execution_response`, and stop for Planner checkpoint.
