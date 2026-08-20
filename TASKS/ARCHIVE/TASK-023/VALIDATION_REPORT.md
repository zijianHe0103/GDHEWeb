# TASK-023 Adversarial Review Report

Verdict: PASS

review_round: `Return-state closure Round 4`
reviewed_at: `2026-08-07T17:07:16Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-023-ADVERSARIAL-RETURN-STATE-CLOSURE-R4`
verdict: `PASS`
P0: `0`
P1: `0`
P2: `0`
planner_final_validation_allowed: `YES — fresh Planner final validation and checked acceptance preparation only`
adversarial_round_1_history: `FAIL / P0=0 / P1=1 / P2=2`
adversarial_round_2_history: `PASS / P0=0 / P1=0 / P2=0`
unified_cards_round_3_history: `FAIL / P0=0 / P1=1 / P2=0`
visual_round_1_history: `FAIL / severe=0 / obvious=1 / detail=0`
visual_round_2_history: `FAIL / severe=0 / obvious=1 / detail=0`
visual_round_3_history: `PASS / severe=0 / obvious=0 / detail=0`
unified_visual_round_4_history: `PASS / severe=0 / obvious=0 / detail=0`

## Return-State Closure Round 4 Current Outcome

`PASS / P0=0 / P1=0 / P2=0`.

The isolated Unified Cards Round 3 pre-parse P1 is closed on current shared
bytes. A primitive-string and 256-character maximum gate now runs before
reflection, coercion or `JSON.parse`; the ordinary exact-key, clamp, scroll,
one-time consume and canonical navigation paths remain intact. No new finding
was reproduced in the directly affected card, Basket, collection, browser
identity, protected-media, server-only, production or governance boundaries.

Planner may perform fresh final validation and checked acceptance preparation
after the linked response is acknowledged. This PASS is not user acceptance
and does not authorize Git delivery, deployment, CMS/Feishu work, final RFQ
submission or later work.

### Round 3 P1 closure — hostile inputs are zero-read and the size limit is pre-parse

- `frontend/src/components/related-products/index.tsx:55-61` now exposes the
  runtime input as `unknown` and short-circuits unless it is a primitive string
  of at most 256 characters. Only then can `JSON.parse` run. Production SHA-256
  is `4cd73a261e133e49f637d3cf02f624167a23fe3faf6802a8e691e4d6a7673b56`.
- An independent Node 24.18.0 Vite SSR probe passed a hostile null-prototype
  Proxy capable of returning valid JSON from `Symbol.toPrimitive`. The result
  was `null`; `get`, `getPrototypeOf`, `ownKeys`,
  `getOwnPropertyDescriptor` and the coercion callback each remained exactly
  zero.
- The same probe instrumented `JSON.parse`. A legal exact-key state padded to
  exactly 256 characters was parsed exactly once and returned
  `{ visibleCount: 6, scrollY: 432 }`; the same legal state at 257 characters
  returned `null` with zero parse calls.
- Ordinary serializer output remained exactly
  `{"version":1,"visibleCount":6,"scrollY":432}`. It restored 6 of 7,
  clamped to 4 of 4, retained scrollY 432, rejected malformed JSON and rejected
  an added `productUuid` key.

### Direct regressions and preserved product boundaries

- Current direct presentation/parser tests independently pass `1 file / 12
  tests`; the TASK-023 focused suite independently passes `15 files / 143
  tests`. Test SHA-256 is
  `5be16708447c5d1398e77fb961cc6132d83e92e83ba69f7cd15efbdd0c5da644`.
- The effect still reads and removes the fixed session entry before ordinary
  restoration. View Product still uses the unchanged public href directly,
  adds no return query and has no navigation cancellation. Storage read,
  removal and write failures remain caught, so unavailable session storage
  cannot prevent native canonical navigation.
- One semantic `article > figure + body > information + footer` skeleton and
  the shared full-width 44-pixel action geometry remain. There is no
  recommendation quantity input. A deliberate accessory action still creates
  a quantity-one `catalog_accessory` or deterministically merges the same
  identity; later quantity edits and removal remain Basket-owned, with no
  price, payment, checkout or enabled submission behavior.
- The focused regression retains `3 -> 6 -> 7`, new-action focus, polite live
  announcements, reduced-motion handling, one related collection request and
  zero per-card resolve. Public projection still removes internal identity and
  remote CMS media before the Client Component; deep consumer paths remain
  server-only and production/CMS paths remain fail closed.

### Independent evidence, protected scope and cleanup

- All seven offline verifiers independently pass: CMS `16/2/2`, ProductCard
  `8/3/6`, Product Configuration 1.0 `4/1/6`, Product Configuration 2.0,
  QuoteLine 2.0, RelatedProductCard `9/4/9` and Quote Basket 2.0 `1/1/3`.
  ESLint also independently passes.
- The current frontend evidence covers the exact 51-file inventory once as
  `17/275 + 17/116 + 17/153 = 51 files / 544 tests`, plus typecheck, Next
  16.2.11 build and four production smokes. Planner independently checked the
  direct gate, seven verifiers, lint/typecheck, code/test hashes and cleanup.
  Those broader generated-output gates were inspected rather than repeated
  after this review's directly relevant focused run.
- Historical visual bytes remain exact: canonical `50/50`, Round 2 `17/17`,
  Round 3 `14/14` and Unified Visual Round 4 `31/31`. The isolated R4 inventory
  also verifies `31/31`, and every R4 `.png` name retains the disclosed actual
  JPEG/JFIF prefix `ffd8ffe000104a4649460001`.
- Package, lock, protected media, ProductCard, QuoteLine, CMS ProductCard and
  TASK-014 authority hashes reproduce exactly. No dependency, CMS, contract,
  visual or external-system drift was found.
- The isolated reviewer probe was deleted. Direct/focused Vitest generated a
  Next tree and development next-env import; the controlled cleanup request
  was ACKed/done, Planner recoverably moved only that tree, and the reviewer
  rechecked `.next`, TypeScript cache and `.vitest` absent, port 3000 clear and
  production next-env SHA-256
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
- Task, Project State and Board remain
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY` with this closure as the sole current
  gate. Project, controlled-message, strict-lane and whitespace validation
  pass with no issues.

### Scope and Authorization for Return-State Closure Round 4

The reviewer did not repair product code or tests and did not modify CMS,
contracts, Planner-owned task/project state, visual evidence, dependencies,
Git, deployment or external systems. Only this canonical report, reviewer lane
records and controlled messages were written. Reviewer-generated cleanup was
handled by Planner as a separate recovery action and was not a business repair.

## Unified Recommendation Cards Round 3 Current Outcome

`FAIL / P0=0 / P1=1 / P2=0`.

The unified semantic card skeleton, bottom action geometry, quantity-one
accessory add and deterministic merge, Basket-owned quantity editing and
removal, unchanged canonical View Product navigation, normal one-time Back
restoration, progressive reveal, accessibility, RelatedProductCard network
boundaries, protected media and all Visual Round 4 evidence pass. The new
browser return-state parser does not, however, establish a primitive-string and
bounded-size boundary before `JSON.parse`. It accepts an oversized legal state
and invokes attacker-controlled coercion on a hostile non-string value.

Planner final validation is not allowed. The smallest bounded recovery is one
frontend parser/test revision that rejects non-string values without any
reflection, rejects oversized input before parsing, preserves the exact three
public state keys and normal Back behavior, followed by fresh validation and a
new independent narrow review. This FAIL is not acceptance and does not
authorize Git, deployment, CMS/Feishu work, final RFQ submission or later work.

### P1-1 — Return-state parsing coerces hostile values and accepts oversized legal JSON

`frontend/src/components/related-products/index.tsx:55-61` types the input as
`string | null`, but its runtime gate checks only `null` before immediately
calling `JSON.parse(serialized)`. There is no `typeof serialized === "string"`
check and no maximum serialized length before parsing.

An isolated Node 24.18.0 Vite SSR probe imported the exact current component
and called the exported parser with two hostile inputs:

- one million ASCII spaces followed by an otherwise valid three-key state had
  length `1,000,044` and was accepted as
  `{ visibleCount: 6, scrollY: 432 }`;
- a null-prototype Proxy exposed only `Symbol.toPrimitive`, returned that valid
  JSON string, was reflectively read once by `JSON.parse` and was accepted as
  the same state instead of being rejected with zero attacker reads.

The same probe confirmed malformed JSON and a fourth `productUuid` key return
`null`, so exact post-parse key validation is intact. The defect is the missing
pre-parse browser boundary, not the frozen output or private-key filter. It is
P1 because this review explicitly requires oversized and reflective/hostile
session-state inputs to fail safely, and the current public parser executes an
attacker coercion hook and accepts both adversarial values.

The minimum revision is to reject every non-string input before any operation
that can coerce or reflect it, reject a small fixed maximum character/byte
length before `JSON.parse`, and add direct regressions proving an oversized but
valid payload returns `null` and a hostile object returns `null` with every
trap counter at zero. Keep the normal exact-key/clamp/one-time-consume path,
canonical anchor navigation and storage exception fallbacks unchanged.

### Independently Reproduced Passing Boundaries

- The current component renders View Product and Add to Quote through one
  `article > figure + body > information + footer` skeleton. Both controls use
  the same full-width, minimum-44-pixel action class; no recommendation card
  contains a quantity label or input.
- Accessory projection produces only a `catalog_accessory` draft at quantity
  `1`. One deliberate click creates one line and a repeated click merges that
  identity deterministically; later quantity edits and removal are exposed
  only by the Quote Basket. No recommendation, Basket or route path introduces
  price, payment, checkout or enabled submission behavior.
- View Product uses the unchanged public `href` directly and adds no return
  query. The serializer emits only `version`, `visibleCount` and `scrollY`;
  ordinary parsing clamps visible count to the current item count, and the
  effect removes the key before a successful normal restore. Storage get,
  remove and set exceptions are caught, and the native anchor remains
  navigable. The P1 above is the isolated hostile/oversized gap.
- The `3 -> 6 -> 7` reveal order, focus transfer, polite live announcement,
  reduced-motion CSS, one RelatedProductCard collection call and zero per-card
  resolve remain intact. Remote CMS media is removed before the Client
  Component; related projection/preview, Transport, Validator and Adapter
  retain server-only entry points; production/CMS routes remain fail closed.
- Visual Round 4 remains `PASS / 0/0/0`. Its isolated inventory verifies
  `31/31`; every historical `.png` name contains actual JPEG/JFIF bytes with
  prefix `ffd8ffe000104a4649460001`, matching the explicit report disclosure.
  Visual Round 1/2 FAIL and Round 3/Round 4 PASS histories are unchanged.
- Frozen Node 24.18.0/npm 11.16.0 direct presentation tests passed `1/10`, and
  the independent focused regression passed `15/141`. All seven offline
  verifiers pass: CMS `16/2/2`, ProductCard `8/3/6`, Product Configuration 1.0
  `4/1/6`, Product Configuration 2.0, QuoteLine 2.0, RelatedProductCard `9/4/9`
  and Quote Basket 2.0 `1/1/3`.
- Planner's fresh current-byte evidence records the complete safe-group suite
  `51/542`, lint, typecheck, Next 16.2.11 build and four production smokes as
  PASS. This reviewer did not repeat those generated-output gates after the
  focused suite had already produced Next residue; the direct hostile probe,
  focused suite, verifiers, exact hashes and DPG gates were independently run.
- Exact package, lock, production next-env, protected media, ProductCard,
  QuoteLine, CMS ProductCard and TASK-014 authority hashes reproduce. Task,
  Project State and Board consistently show
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`; the request and generated-cleanup
  messages are ACKed/done; project, message, strict-lane and whitespace checks
  pass.
- The isolated hostile probe was deleted. Planner recoverably moved only the
  reviewer-generated `.next`, restored next-env SHA-256
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`
  and confirmed no TypeScript cache or port-3000 listener. The reviewer then
  independently rechecked all four cleanup facts.

### Scope and Authorization for Unified Recommendation Cards Round 3

The reviewer did not modify product code, tests, CMS, contracts, Planner-owned
task/project state, visual evidence, dependencies, Git or external systems.
Only this canonical report, reviewer lane records and controlled messages were
written. The cleanup request covered reviewer-generated output only and was
not a business repair.

## Round 2 Final Outcome

`PASS / P0=0 / P1=0 / P2=0`.

The final narrow review independently closes the Round 1 public-UUID P1, the
trap-unsafe Transport P2 and the current-fact narration P2 on current shared
bytes. Final CMS error evidence is deterministic without replacing real
runtime UUIDv4 identity, the frontend binds only the final literal 26-file
authority, and all direct regression gates pass.

Planner may perform fresh final validation after the linked response is
acknowledged. This PASS is not user acceptance and does not authorize Git,
deployment, Feishu, final RFQ submission or later work.

### Round 1 P1 closure — public UUID conflicts fail closed as one aggregate identity

- Current `related-product-cards.php` first de-duplicates candidate post IDs,
  projects all otherwise eligible candidates, builds public-UUID ownership by
  distinct post ID including the source, and emits only identities with one
  owner. It no longer publishes a first conflicted card before seeing a later
  owner.
- The real Fixture contains twelve removable posts and an independently
  eligible second post sharing the first detail card's UUID. Its relation
  matrix asserts that both conflict cards and both `view_product` actions are
  absent while unrelated public IDs remain in stored order.
- An isolated reviewer probe against the exact production PHP used relation
  order `unrelated-first, conflict-alpha, conflict-beta, conflict-alpha,
  unrelated-last`. It returned only public IDs ending `0004, 0005`, preserved
  both unrelated action paths, contained no conflict bytes and projected the
  repeated same post exactly once. Thus distinct-owner rejection and same-post
  duplicate handling are both closed without disturbing unrelated order.

### Round 1 Transport P2 closure — hostile thrown values remain inside the sanitized boundary

- Current Transport uses Node's server-only proxy classifier before prototype
  reflection. Trusted internal errors are preserved only after guarded
  classification; redirect detection accepts guarded own data descriptors.
  Failed reflection and unclassifiable values fall through to the fixed
  network error.
- An isolated Node 24.18.0 Vite SSR probe threw an ordinary hostile Proxy with
  traps for prototype, property, membership, own descriptor and key access.
  The result was one request followed by
  `RelatedProductCardTransportError(kind=network)`; every trap counter was
  zero and no private diagnostic escaped. A revoked Proxy produced the same
  stable result.
- The same probe retained trusted redirect classification and caller-abort
  classification. The focused suite independently retained the fixed 5000 ms
  timeout, no retry, internal HTTP/protocol behavior and outward sanitization.

### Deterministic evidence and final authority

- Two live anonymous invalid requests returned distinct UUIDv4 request IDs;
  the saved nine-error evidence alone uses the valid fixed non-production UUID
  `00000000-0000-4000-8000-000000000023`.
- Both recorded Fixture lifecycles used different database IDs, produced
  identical four-Golden hashes and identical error-fixture hash
  `e431d02338ccc82f9f576044dc860501c7711856bb01d8a09a454b86ecc2c91c`,
  then removed exactly twelve posts and three terms with all six residue counts
  at zero.
- The handoff checksum stream verified literal `26/26`; manifest SHA-256 is
  `809fe879374e604553311217e6085f5f2b605c4a78bcb00258b8c6b2965cf51e`
  and checksum-stream SHA-256 is
  `fc3552dc84c8e6eacb954654b4d858a326eab03261eda02da440aa48bddfde90`.
- The frontend manifest and verifier hard-code only those final identities.
  The error snapshot is byte-identical to CMS, and exact source/snapshot `cmp`
  passed for all nine Schema files and all four unchanged success samples.
  The direct verifier returned `9 Schema / 4 success / 9 error`.

### Direct regressions, governance and cleanup

- Frozen Node 24.18.0 / npm 11.16.0 focused tests: `5 files / 45 tests` PASS;
  full suite: `51 files / 540 tests` PASS.
- All seven contract verifiers, ESLint, clean TypeScript, Next.js 16.2.11
  production build and all four production smokes pass. Production Product
  List, Product Detail/candidates and Quote Basket remain final 404 with zero
  unintended CMS/submission requests; the separately authorized CMS
  integration smoke retains one fixed request.
- WordPress Core and official SCF checksums, all twelve database tables, route
  presence, plugin PHP syntax and JSON/Python parse gates pass. Current Fixture
  manifest is empty and database/upload residue remains zero.
- The protected baseline is exactly `22 match / 5 declared TASK-023
  differences`; package, lock, next-env, protected image, ProductCard,
  QuoteLine, CMS source/Schema and TASK-014 authorities are unchanged. The
  trap-safe Transport hash remains
  `de0a4645c942671bbc0974d8b6c730be3a24ca1c9be46e9f0f10162296d882d1`.
- Canonical Visual evidence verifies `50/50`; Round 3 verifies `14/14`; all
  fifty historical `.png` names still contain JPEG/JFIF bytes. Visual Round 1
  and Round 2 FAIL plus Round 3 PASS history remains intact.
- Task frontmatter/current review narration, Project State and Board all show
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, preserve Round 1, and identify Round 2
  as the sole current gate. The R2 request and the exact generated-cleanup
  recovery request are ACKed/done; queues are empty.
- Reviewer probes were deleted. Planner recoverably moved only the review-run
  `.next` and TypeScript cache after the reviewer hook correctly blocked an
  out-of-scope cleanup. Both are absent, next-env retains SHA-256
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`,
  port 3000 has no listener, and no reviewer probe, Python bytecode or temporary
  TASK-023 residue remains.

## Round 1 Historical Outcome — Preserved

`FAIL / P0=0 / P1=1 / P2=2`.

The ordinary stored-order, publication, ProductCard, media, direct-quote,
one-request, Basket, progressive-UI, closed-route, visual and protected-scope
paths pass. The current WordPress collection does not, however, fail closed
when two different eligible posts share one public Product UUID: it returns the
first conflicting card and silently drops the second. A separate lower-severity
Transport issue allows a hostile thrown value to escape stable error
normalization, and the active-task review narration remains stale after the
controlled request was acknowledged.

Planner final validation is not allowed. The smallest bounded recovery is one
WordPress identity-conflict correction, one trap-safe RelatedProductCard
Transport error correction, Planner-owned current-fact narration sync, fresh
validation and a new independent review. This result is not user acceptance or
authorization for Git, deployment, Feishu integration, final RFQ submission or
later work.

## Round 1 Historical Findings — Preserved

### P1-1 — Distinct WordPress posts sharing one public UUID use first-wins instead of fail-closed identity handling

`gdhe_product_card_for_post` reads the candidate public UUID directly without
proving that no other published Product owns it. The RelatedProductCard
collection then appends the first valid item immediately and treats a later
card with the same UUID like an ordinary duplicate. The first ambiguous card
therefore remains public.

Relevant current bytes:

- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php:207-214`
  reads and validates the UUID for one post but performs no repository-wide
  UUID uniqueness check;
- `cms/wp-content/plugins/gdhe-site/includes/related-product-cards.php:156-188`
  appends the first public UUID and only skips later occurrences;
- `cms/wp-content/plugins/gdhe-site/includes/fixtures-task023.php:277-289`
  covers a repeated post ID, not two different posts with one public UUID.

An isolated reviewer-scope PHP probe loaded the exact current
`related-product-cards.php`, supplied two distinct otherwise eligible target
post IDs, and made both ProductCard projections carry the same UUID. The
current collection returned:

```json
{
  "returnedItemCount": 1,
  "returnedModels": ["CONFLICT-2"],
  "returnedPublicIds": ["70000000-0000-4000-8000-000000000002"]
}
```

The first conflicted identity was therefore published rather than failing
closed. This violates the active acceptance rule that a relationship identity
conflict generates no card or link. It also permits relation order to decide
which of two records represents one supposedly stable public identity.

Smallest bounded revision:

1. project the distinct candidate posts without publishing them immediately,
   count public UUID ownership across those candidates and the source, and omit
   every target whose UUID is owned by more than one distinct post; preserve
   the existing first-occurrence behavior only for a repeated identical post;
2. add an isolated Fixture case with two different published eligible posts
   sharing one UUID and assert that neither conflicting card/action enters the
   response while unrelated eligible predecessors and successors retain stored
   order;
3. re-run exact runtime, Golden, Schema, determinism, cleanup, handoff and
   frontend snapshot/regression gates without changing ProductCard 1.0 bytes.

### P2-1 — Hostile fetch exceptions can escape the stable server Transport boundary

The new RelatedProductCard Transport classifies a caught unknown value using
several direct `instanceof` operations and then reads `cause` and `message`.
Those operations are not trap-safe. A thrown Proxy can make the first
prototype lookup throw a second raw diagnostic from inside the `catch` block.

Relevant current bytes are
`frontend/src/lib/cms/server/related-product-cards/transport.ts:84-87` and
`frontend/src/lib/cms/server/related-product-cards/transport.ts:141-158`.

An isolated reviewer-scope Vite SSR probe imported the current production
module under the frozen Node 24.18.0 path, installed a one-call fetch that
throws a null-prototype Proxy whose `getPrototypeOf` trap throws
`Error("PRIVATE_DIAGNOSTIC_023")`, and called the fixed public-path request.
Current output was:

```json
{
  "outcome": "reject",
  "name": "Error",
  "message": "PRIVATE_DIAGNOSTIC_023"
}
```

The normal Product Detail orchestrator catches all related-module failures and
still degrades to an empty recommendation collection, so this probe did not
show a browser leak and is graded P2 rather than P1. The direct server-only
Transport boundary nevertheless fails its stable sanitized network-error
semantics and exposes an internal diagnostic to a server caller.

Smallest bounded revision:

1. make preservation of trusted internal error classes and redirect detection
   trap-safe; any failed reflection or unclassifiable thrown value must fall
   back to the existing fixed aborted, timeout or network error without reading
   attacker-controlled diagnostics;
2. add direct tests for an ordinary hostile Proxy, a revoked Proxy and unsafe
   `cause` or `message` access while preserving the current one-call,
   no-retry, redirect, caller-abort and 5000 ms timeout results;
3. keep the production page-level empty-module degradation and all public
   metadata/body-isolation behavior unchanged.

### P2-2 — The active task still says this acknowledged review has not started

The exact request was acknowledged before substantive work and is now in
`LANES/messages/done/MSG-TASK-023-ADVERSARIAL-REVIEW-R1.json`. The active task
remains correctly `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, but its current
`Adversarial Review` section at
`TASKS/ACTIVE/TASK-023-related-products-progressive-slice.md:207-209` says
`尚未开始`, and its Messages section has no entry for the acknowledged request.

This does not change product behavior, so it is P2. It does make the current
task authority contradict the controlled-message fact source.

Smallest bounded revision: after acknowledging this response and recording the
governed FAIL recovery, update only Planner-owned current narration and message
status to record the completed Round 1 result, preserve all earlier visual and
execution history, and name the bounded revision plus fresh-validation/review
gate as the unique next step.

## Independently Reproduced Passing Boundaries

### WordPress truth, eligibility and determinism

- The anonymous GET route exists; its query is closed to English, Schema
  1.0.0 and one canonical source path. The source resolves uniquely and the
  raw `relationships.products` array remains the sole order authority with an
  exact maximum of 20.
- Same-post duplicate, self, unpublished, website-revoked, invalid ProductCard,
  hostile media, missing direct-quote unit and action mismatch paths fail
  closed. Detail cards retain canonical `view_product`; only active accessories
  with the independent literal `piece` projection enter direct quote, with no
  fabricated configuration.
- The 26-file handoff checksum stream reproduced `26/26`. The current Schema,
  runtime and two-lifecycle determinism JSON records are valid; the two
  lifecycles used different database IDs and retained identical four-Golden
  hashes.
- Current read-only runtime checks found the route present, an empty Fixture
  manifest, database residue `0/0/0/0/0`, zero TASK-023 upload residue, all
  twelve database tables OK, WordPress Core checksums valid, SCF 6.9.2 active
  with official checksums valid, and GDHE Site 0.7.0 active. Plugin PHP lint was
  `34/34` plus the TASK-023 MU bootstrap.

### Network, server-only, browser identity and media

- Product Detail keeps one detail resolve, one Product Configuration request
  and one RelatedProductCard collection request after a ready detail; no
  ProductCard collection or per-card resolve exists.
- The browser-facing projection removes Product, Media and taxonomy UUIDs,
  modified timestamps, raw action enums and direct-quote diagnostics. Remote
  CMS media is rejected before React; local preview uses only the protected
  same-origin TEST_CANDIDATE image.
- Public and deep RelatedProductCard Transport, Validator and Adapter imports
  remain blocked from a real Client Component build. Ordinary success, closed
  query, normalized HTTP error, redirect, caller abort, timeout, bodyless 304
  without a cache owner, no retry and fixed URL behavior pass.
- Production smokes returned final 404 for Product Detail, candidate routes,
  Product List and Quote Basket with zero unintended CMS or submission
  request. CMS integration retained its separately authorized one fixed
  request behavior.

### Quote Basket 2.0

- Quote Basket 1.0 protected bytes remain exact. A valid v1 document migrates
  in memory to configured-product lines, leaves the v1 storage bytes unchanged
  on read and writes canonical 2.0 only on the next legal mutation.
- Catalog accessories retain separate public product/catalog/unit identity,
  positive safe-integer quantities, same-identity merge and different-identity
  split. They contain no length, color, packaging, Article Number, internal ID,
  price, payment or checkout semantics.
- The existing 30-day TTL, 256 KiB ceiling, mutation ordering and cross-tab
  newer-snapshot behavior remain green.

### Progressive UI, routes, accessibility and visual history

- Current tests reproduce 0/1/3/4+ states, authority order, initial maximum
  three and append maximum three. The button disappears after the final reveal;
  pointer, native keyboard, focus transfer, aria-live and reduced-motion paths
  remain covered.
- Preview candidates 1/3/5/7 are protected, noindex, same-origin 200 landings.
  Candidates 2/4/6/8, the accessory candidate and unknown routes remain 404.
  Every production mode stays closed.
- The full visual history is preserved: Round 1 `FAIL / 0/1/0` for dead detail
  actions, Round 2 `FAIL / 0/1/0` for 832 px landing overflow, and current
  Round 3 `PASS / 0/0/0` after both closures.
- Canonical evidence reproduced `50/50`; Round 3 reproduced `14/14`. All fifty
  historical `.png` names contain the disclosed JPEG/JFIF prefix
  `ffd8ffe000104a4649460001`, and `file` classified all fifty as JFIF.

### Current-byte automated and protected-scope gates

- Frozen runtime: Node 24.18.0 and npm 11.16.0.
- Independent focused suite: `15 files / 135 tests` PASS.
- Independent full suite: `51 files / 536 tests` PASS.
- Seven verifiers PASS: CMS `16/2/2`, ProductCard `8/3/6`, Product
  Configuration 1.0 `4/1/6`, Product Configuration 2.0, QuoteLine 2.0,
  RelatedProductCard `9/4/9` and Quote Basket 2.0 `1/1/3`.
- ESLint, TypeScript and Next.js 16.2.11 production build PASS. All four
  production smokes PASS.
- Package, lock, next-env, protected image, ProductCard type/manifest/verifier,
  QuoteLine v1/v2, CMS ProductCard source/Schemas and TASK-014 authorities match
  their exact baseline hashes. Only the declared Product Detail, related
  products and additive Basket v2 integration paths changed.
- The reviewer-created build tree, TypeScript cache and both isolated probes
  were removed; no TASK-023 listener, Python bytecode, temporary root or
  reviewer-generated residue remains.
- `git diff --check`, project validation, controlled-message validation and
  strict lane audit pass. Task, Project State and Board consistently show
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`; the stale review paragraph is the
  isolated governance finding above.

## Scope and Authorization

The reviewer did not repair product code, CMS code, tests, documentation,
Planner-owned task/project state or visual evidence. No database mutation,
Fixture creation, dependency change, Feishu operation, Git delivery, deployment
or external write was performed. The WordPress checks in this review were
read-only; the recorded determinism lifecycle was inspected and its final
zero-residue state was independently rechecked.
