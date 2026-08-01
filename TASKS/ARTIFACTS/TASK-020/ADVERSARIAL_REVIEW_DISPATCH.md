# TASK-020 Adversarial Review Dispatch

status: `READY_FOR_INDEPENDENT_REVIEW`
owner: `adversarial_reviewer`

## Objective

Independently challenge the complete TASK-020 Product Configuration runtime
consumer, visible FGD X15+PVC configurator, one latest in-memory QuoteLine,
favicon correction and visual evidence. Do not rely on frontend, visual or
Planner PASS statements without reproducing relevant current-byte evidence.

Return one current verdict:

- `PASS / P0=0 / P1=0 / P2=0`; or
- `FAIL` with exact P0/P1/P2 findings, reproduction, impact and the smallest
  bounded revision.

## Review Scope

1. Fixed server-only Product Configuration consumer:
   - exact anonymous GET path and closed
     `locale=en / schema=1.0.0 / /products/fgd-x15-pvc/` query;
   - one 5000 ms timeout, no retry, redirect/cache/content-type/ETag/cache-header
     and normalized error semantics;
   - exact four-Schema static closure, authentic wrapper and public Adapter;
   - public/deep Client Component imports fail while marker-stripped controls
     build;
   - raw response, origin, request ID, diagnostics, WordPress/SCF/Feishu,
     supplier, cost, price, inventory, profit and internal fields never reach
     React.
2. Page orchestration and request cardinality:
   - disabled/production remains final 404 with zero CMS request;
   - preview uses exact local public DTOs;
   - CMS ready performs exactly one `/resolve`, then one
     `/product-configurations`, zero ProductCard and zero per-option requests;
   - detail not-found/unavailable stops correctly;
   - configuration unavailable preserves detail and shows only sanitized
     navigation RFQ fallback, never partial or guessed options;
   - browser never directly requests WordPress.
3. FGD X15+PVC public configuration facts:
   - model/path/name are exact;
   - sole current resolved option is
     `GDHEPRD000172 / 6 m / Ivory White / piece`;
   - no invented standard length, color, Article Number or accessory;
   - ceiling/wall do not change the track Article Number;
   - standard/custom selection, explicit installation, exactly one base
     packaging, independent logo printing, nullable mutually exclusive
     protection and positive safe-integer quantity match the frozen rules;
   - customer labels remain human-readable and do not expose internal enum or
     Article Number as the product headline.
4. QuoteLine construction and client state:
   - standard branch copies exact selected-option facts by Article Number;
   - custom branch accepts only positive one-decimal length, uses an exact
     validated color and emits `articleNumber: null` plus
     `resolution: sales_follow_up`;
   - invalid matrices fail closed with stable accessible inline errors;
   - valid outputs satisfy frozen QuoteLine 1.0.0; frozen equality, safe-integer
     and merge/split semantics remain unchanged;
   - one latest scalar result replaces the previous result, including
     standard-to-custom; it never appends or claims save/send;
   - no localStorage, sessionStorage, cookie, IndexedDB, server mutation,
     submission or Feishu write occurs.
5. Presentation, accessibility and responsive behavior:
   - Hero target and visible `Configure Your Track` / `Add to Quote` path;
   - complete customer-readable summary contains model, standard/custom type,
     length, color, installation, base packaging, Logo, protection, quantity
     and unit, without raw JSON/internal enums;
   - form/fieldset/legend/label/error/aria-invalid/aria-describedby/live-region
     behavior and native keyboard order remain correct;
   - 1440/1024/768/390 plus 320 reflow, zero overflow, CTA hit target, focus and
     reduced-motion evidence remain credible.
6. Media, favicon and browser network isolation:
   - protected local product media remains unchanged and hostile CMS media
     fails closed before React;
   - local `icon.svg` is self-contained, explicitly temporary/non-production,
     has no external/script/product/internal content and is the only additive
     favicon correction;
   - fresh Chrome evidence proves icon 200, no favicon.ico request/404, Console
     zero and native Enter adds zero Network requests;
   - screenshot actual encoding, dimensions and hashes are accurately disclosed;
   - original visual BLOCKED and Keyboard Recovery FAIL histories remain
     preserved rather than rewritten.
7. Regression, documentation and scope:
   - current full tests, three verifiers, lint, typecheck, clean build and three
     production smokes;
   - protected snapshot/QuoteLine/CMS/ProductCard/ProductList/package/lock/
     next-env/image/layout hashes and diff boundaries;
   - root README, frontend README and frontend contract accurately describe the
     current local-only slice and deferred work;
   - no Basket, 30-day persistence, count badge/drawer, contact form, quote API,
     NestJS, Feishu, email, CMS/database change, dependency, SEO, multilingual,
     production publication, deployment, acceptance or Git delivery was added.

## Required Read-only Reproduction

Inspect the current diff and independently run the most relevant current-byte
frontend, browser-evidence and governance checks needed to challenge the
boundaries above. Verify protected hashes, request cardinality, server/client
isolation, result replacement, visual history, evidence encoding, documentation
truth and diff hygiene. Do not treat prior checkpoints as authority.

## Allowed Writes

- `TASKS/ARTIFACTS/TASK-020/ADVERSARIAL_REVIEW_REPORT.md`;
- `LANES/adversarial_reviewer/**`;
- one controlled linked review response message.

## Protected Scope

Do not edit frontend source, tests, docs, README, CMS/database, task authority,
Planner state, dependencies, visual evidence bytes, Git, deployment or external
systems. Do not repair findings in the reviewer lane.

## Stop Boundary

Stop after one controlled review response. A PASS is not user acceptance and
does not authorize commit, push, merge, deployment, TASK-021 or any deferred
Basket/submission/Feishu capability.
