# TASK-020 Frontend Implementation Dispatch

status: `AUTHORIZED_AFTER_MESSAGE_ACK`
owner: `frontend`
date: `2026-08-01`

## Objective

在现有本地测试候选 `/products/fgd-x15-pvc/` 上完成一条可见但不持久化、
不提交外部系统的最小纵向链路：

```text
Product Configuration server-only consumer
  -> public readonly DTO
  -> Configure Your Track form
  -> validated standard/custom selection
  -> one latest in-memory QuoteLine
```

这是 TASK-020 的完整实施范围，不是完整 Quote Basket。执行必须按
`IMPLEMENTATION_PLAN.md` 的 A1～A6 小接缝顺序推进，每个接缝先观察并记录
直接相关 RED，再实施最小 GREEN。

## Frozen product facts

- product model: `FGD X15+PVC`;
- English name: `FGD X15+PVC Track`;
- canonical product path: `/products/fgd-x15-pvc/`;
- current sole standard choice:
  `GDHEPRD000172 / 6 m / Ivory White / piece`;
- installation: explicit `ceiling` or `wall`, neither preselected and neither
  changes the track Article Number;
- no accessory Article Number is currently publishable or selectable;
- standard options come only from the Product Configuration DTO;
- custom length is positive, at most one decimal place, `articleNumber: null`
  and `resolution: sales_follow_up`;
- quantity starts blank and is a positive safe integer in `piece`.

Track packaging is a closed choice:

- one explicit base: `standard | carton | large_shrink_wrap`;
- `logoPrinting` boolean, default false;
- protection: `single_bag | paired | null`, default null;
- `single_bag` and `paired` are mutually exclusive by construction.

## Required sequential TDD seams

### A1. Fixed server-only Transport

Observe a real missing-module/missing-behavior RED before production code. Add a
fixed no-query Transport for exactly:

```text
GET /wp-json/gdhe/v1/product-configurations
  ?locale=en
  &schema=1.0.0
  &path=/products/fgd-x15-pvc/
```

It must preserve the frozen 200/error/304/cache/ETag/content-type semantics,
5000 ms timeout, caller abort distinction, redirect failure, no retry and
sanitized errors. No caller-controlled query object is permitted.

### A2. Exact four-Schema runtime validation

Observe the missing registry/validator RED. Statically import only the exact
four local Product Configuration schemas from the frozen seven-file snapshot.
Reject remote/unknown refs, wrong versions, unknown fields, non-JSON values,
wrong FGD identity, invalid/duplicate options, ordering drift and policy drift.
Produce an authentic non-forgeable validated wrapper; raw or copied bodies must
not reach the Adapter.

### A3. Public DTO and server-only boundary

Observe raw/forged/mutable/internal-field and Client Component build REDs. Copy
only the fields frozen in `DESIGN.md`, deep-freeze the DTO, mark every server
module `server-only`, and prove real Next direct and deep client imports fail
while marker-stripped controls build.

### A4. Loader and page-state composition

Observe missing preview/CMS configuration and request-count REDs. Reuse
`GDHE_PRODUCT_DETAIL_MODE=preview|cms`:

- preview: local detail plus a DTO derived from the exact frozen success sample;
- cms ready: exactly one `/resolve` followed by exactly one
  `/product-configurations`;
- zero `/product-cards`, zero per-option request and zero browser-to-WordPress;
- detail failure stops before configuration;
- configuration failure keeps the detail visible but renders only a sanitized
  unavailable fallback and navigation-only RFQ action.

No raw HTTP body, endpoint, origin, environment variable, WordPress field,
Article Number inventory, internal product field or diagnostic may reach React
markup or a Client Component.

### A5. Pure QuoteLine builder

Observe separate resolved, custom and invalid-matrix REDs. Build only from the
public DTO plus primitive form values:

- standard: exact-match Article Number, copy length/color from the DTO and emit
  `selection.type = article_number`;
- custom: canonical positive one-decimal input, real DTO color, null Article
  Number and `sales_follow_up`;
- common: exact installation/base packaging/protection membership, boolean Logo
  and positive safe-integer quantity;
- output: deep-copied/frozen QuoteLine 1.0.0 or a closed field-error result.

Each success test must validate against the frozen QuoteLine Schema. Do not
change the Schema, samples, safe maximum, equality or merge/split rules. Do not
create line IDs, persist, merge or submit.

### A6. Visible ProductConfigurator

Observe route/UI interaction REDs before component code. Add one semantic,
responsive Client Component with:

- section anchor and title `Configure Your Track`;
- standard/custom length mode;
- current real standard choice only;
- installation, base packaging, Logo, protection and quantity controls;
- associated labels, fieldsets/legends, inline errors, `aria-invalid`,
  `aria-describedby`, visible focus and polite `aria-live` result;
- action `Add to Quote`;
- latest valid line only, replacing the prior local result;
- explicit non-production notice that it is a temporary quote item and has not
  been sent or saved.

In ready configuration state, change the Hero action to
`Configure & Add to Quote` targeting the section anchor. When configuration is
unavailable, retain the existing navigation-only `Request a Quote` fallback and
render no partial form. Refresh must clear the result. Tests must prove no
storage, submission, external request or global basket behavior.

## Production and visual boundary

- preserve `dynamic = force-dynamic`, local mode gating and
  `noindex,nofollow`;
- production preview/cms requests remain final 404 with zero CMS requests;
- preserve the exact protected product image and zero hostile/external media;
- use existing page tokens and local CSS only;
- implementation must reflow at 320 CSS px, but frontend must not run or claim
  independent visual QA; Planner dispatches `visual_qa` only after checkpoint.

## Allowed writes

- `frontend/src/app/products/fgd-x15-pvc/**`;
- minimum Hero action change under `frontend/src/components/product-detail/**`;
- `frontend/src/components/product-configurator/**`;
- TASK-020-independent Product Configuration consumer files under
  `frontend/src/lib/cms/server/**`;
- `frontend/src/lib/product-configuration/**`;
- a minimum client-safe builder under `frontend/src/lib/quote-contract/**` only
  after its real RED, without changing frozen authority bytes or semantics;
- TASK-020 public DTO files under `frontend/src/types/**`;
- TASK-020 tests and necessary validation scripts under `frontend/tests/**` and
  `frontend/scripts/**`;
- `frontend/README.md`, `docs/frontend/**`;
- `TASKS/ARTIFACTS/TASK-020/**`, `LANES/frontend/**`.

Root `README.md` is Planner-owned. Record the exact proposed delta in the
execution report; do not edit it.

## Protected paths and behaviors

Do not modify:

- `cms/**`, database or WordPress content;
- the seven frozen Product Configuration snapshot files or TASK-019 handoff;
- QuoteLine Schema, samples, safe-integer maximum, equality or merge/split
  semantics;
- ProductCard/ProductList source bytes;
- package/lockfile, dependency graph or Next production media allowlist;
- protected FGD image bytes;
- TASK-001～019 authority/history;
- Planner-owned task state, Project State, Board, registry or acceptance state;
- user `.codex/config.toml` or historical resume packets.

If any required behavior appears to need a protected mutation, stop and send a
linked blocker. Do not implement a convenient substitute.

## Required validation

Use Node `24.18.0` / npm `11.16.0` and report exact counts:

- each A1～A6 focused RED and GREEN;
- fixed Transport/status/cache/request matrix;
- four-Schema runtime/semantic mutation matrix;
- Adapter authenticity, deep readonly and server-only real-build negatives;
- preview/CMS/unavailable page states, one resolve + one configuration + zero
  ProductCard and zero browser WordPress;
- resolved/custom QuoteLine plus complete invalid matrix and frozen Schema check;
- form DOM, accessible errors, result replacement, refresh/no-storage/no-network;
- existing Product Detail, ProductList, ProductCard and CMS consumers;
- all three contract verifiers, full Vitest, lint, typecheck, production build
  and list/detail production smokes;
- exact protected hashes/inventories, no generated/temp/listener/test residue,
  `git diff --check`, project/messages validation and strict lane audit.

If loopback/browser tests fail only because the sandbox returns `listen EPERM`,
report the exact skipped/failing commands and ask Planner to run those commands
against unchanged shared bytes. Do not manufacture PASS.

## Expected artifacts

- `TASKS/ARTIFACTS/TASK-020/FRONTEND_TDD_RED_EVIDENCE.md`;
- `TASKS/ARTIFACTS/TASK-020/FRONTEND_EXECUTION_REPORT.md`;
- `TASKS/ARTIFACTS/TASK-020/FRONTEND_TEST_OR_VALIDATION_LOG.md`;
- `TASKS/ARTIFACTS/TASK-020/FRONTEND_DIFF_OR_OUTPUT_SUMMARY.md`.

Update `LANES/frontend/worklog.md` and send exactly one linked
`execution_response` when the full A1～A6 slice and declared validation are
complete.

## Stop boundary

The linked execution response returns control to Planner for an independent
checkpoint. Frontend must not run visual QA, adversarial review, acceptance,
commit, push, merge or deployment. It must not implement a multi-line Basket,
30-day persistence, edit/delete/merge, quote submission, contact form, abuse
controls, NestJS, Feishu, email, Webhook, cache or production publication.
