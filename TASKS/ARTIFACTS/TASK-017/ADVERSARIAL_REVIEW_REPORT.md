# TASK-017 Adversarial Review Report

review_round: `2`
reviewed_at: `2026-07-30T19:04:45Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-017-ADVERSARIAL-REVIEW-R2`
mode: `INDEPENDENT_READ_ONLY_REVIEW`
verdict: `PASS`
status: PASS
p0: `0`
p1: `0`
p2: `0`
planner_final_validation_allowed: `YES_AFTER_CONTROLLED_RESPONSE_ACK_AND_RECOVERY`

## Round 1 Outcome (Preserved)

TASK-017 Round 1 verdict is FAIL with P0=0, P1=1 and P2=2.

The local mode gate, production 404 boundary, one collection request and zero
per-card resolve orchestration, DTO-only card presentation, action matrix,
safe states, exact preview image, responsive behavior and protected
TASK-014～016 authority all pass the independent checks described below.

Visual history is preserved rather than flattened: visual Round 1 remains
`FAIL / severe 0 / obvious 1 / detail 1`, while the appended visual Round 2
remains `PASS / severe 0 / obvious 0 / detail 0`. Direct inspection confirms
that the 1024 CTA clipping and media-focus clipping are closed in the Round 2
screenshots.

The implementation does not, however, enforce the accepted zero-browser-
WordPress-request boundary. A Schema-valid HTTPS WordPress media URL crosses
the existing Validator and Adapter unchanged, and React emits both an image
preload and an `img` request to that URL. The focused test checks only for an
explicit JavaScript `fetch()` call and therefore does not exercise the actual
browser request surface. Two non-blocking but required cleanup/current-fact
issues also remain.

Planner final validation is not allowed. This FAIL is not acceptance and does
not authorize product repair, Git delivery, deployment or later work.

## Findings

### P1 — A valid ProductCard can make the browser request WordPress media

The frozen acceptance boundary requires zero browser requests to WordPress,
but the current source provides no origin or path gate between the validated
media URL and browser markup:

- the public protected-media Schema accepts any HTTPS URI;
- `adapter.ts:18-25` copies `image.url` without an origin policy;
- `product-card/index.tsx:116-129` writes that value directly to native
  `<img src>`;
- React server rendering also adds a preload for that same external URL;
- `product-list-route.test.ts:151-175` calls the behavior
  “browser-fetch protections” but asserts only that the component and route
  source do not contain an explicit `fetch()` call.

An independent no-listener probe loaded the real Validator, Adapter and
ProductCard media component. It changed only the valid one-item sample URL to:

```text
https://cms.example.com/wp-content/uploads/protected.webp
```

The current Validator accepted the payload, the Adapter retained that exact
URL, and the real component rendered:

```html
<link rel="preload" as="image" href="https://cms.example.com/wp-content/uploads/protected.webp"/>
<img src="https://cms.example.com/wp-content/uploads/protected.webp" .../>
```

Probe result:

```text
VALIDATED_AND_ADAPTED=true
WORDPRESS_IMAGE_EMITTED=true
```

This is a browser WordPress request candidate even though no JavaScript
`fetch()` appears in the component. Production hard-disable prevents public
production exposure today, but it does not satisfy the accepted CMS-mode
invariant, and the exact local CMS route is intended to consume authentic
ProductCard DTOs. The deferred production media-origin gate makes the current
claim especially important: an unconstrained HTTPS value cannot be treated as
proof that WordPress will never be contacted by the browser.

Narrow revision:

1. Reconcile the zero-browser-WordPress invariant with the explicitly
   deferred production media-origin decision. Do not silently select a
   production origin.
2. Add a server-owned, fail-closed policy before React, or keep CMS image
   rendering unavailable until an authorized public-media boundary exists.
   The policy must reject a valid HTTPS WordPress `wp-content` URL without
   passing the CMS origin into React.
3. Replace the source-text `fetch()` assertion with a rendered-markup or
   browser-network regression that proves a valid hostile DTO cannot emit a
   WordPress image or preload request.

If the product decision instead permits browser access to WordPress-hosted
public media, Planner must first reopen and correct the accepted task,
TASK-013 collection invariant and dispatch wording rather than claiming the
current implementation meets them.

### P2 — Visual QA left an undeclared tracked Next declaration change

The baseline and task diff claim that product changes are limited to the
declared TASK-017 files and that generated residue is zero. Current Git state
also contains:

```diff
-import "./.next/types/routes.d.ts";
+import "./.next/dev/types/routes.d.ts";
```

in `frontend/next-env.d.ts`. That file is outside the TASK-017 product-file
inventory and is not recorded in `DIFF_OR_OUTPUT_SUMMARY.md`. The timestamps
and current `.next/dev` tree are consistent with the final development-server
visual run occurring after Planner's last production build.

This is not a ProductCard behavior P1, but it is an unreported tracked scope
residue and makes the clean-source claim inaccurate.

Narrow revision: Planner or the authorized implementation lane should restore
the baseline generated declaration deliberately, verify a clean production
type/build cycle, and update scope evidence if the file is intentionally
retained. Reviewer did not run `next build` because it could overwrite this
current evidence and would amount to repairing the residue during review.

### P2 — Human-readable current review narration still says ACK is pending

The controlled request was acknowledged before review and now exists under
`LANES/messages/done`. Project status correctly reports
`UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, but the active task still says:

- reviewer lane: `R1_DISPATCHED; ACK_PENDING`;
- message: waiting for ACK/verdict.

The unique next step, waiting for the verdict, remains directionally correct.
This finding is limited to current-fact narration.

Narrow revision: when Planner acknowledges the linked FAIL response, preserve
all visual and adversarial history, record that Round 1 was ACKed and returned
FAIL, and recover the task to the governed revision state.

## Independent Passing Evidence

### 1. Local mode, route and request orchestration

- `readProductListMode()` is server-only and accepts only exact non-production
  `preview` or `cms`; production and every other value return `disabled`.
- The App Router page is request-dynamic, has fixed
  `noindex,nofollow` metadata and maps disabled mode through `notFound()`.
- Preview returns the frozen local DTO without calling the CMS consumer.
- CMS invokes only
  `loadProductCardCollection({page: 1, perPage: 12,
  sort: "modified_desc"})`; no ProductList source contains `/resolve`.
- No Sitemap, route-manifest or production candidate aggregation file was
  added.
- Planner's fresh same-byte listener evidence reports ProductList `21/21` and
  production smoke with preview/cms 404, root 200, integration 404 and CMS
  request count zero.

### 2. DTO, action and safe-state behavior

- React imports only readonly ProductCard DTO types and renders no raw
  envelope, validated wrapper, error diagnostic, CMS configuration,
  WordPress/SCF field, database identifier or commercial field.
- Detail-product image, title and action use the exact DTO action target.
  Active and discontinued details retain `view_product`; active no-detail
  accessory retains `direct_rfq`; discontinued no-detail accessory retains
  `replacement_contact`. UI source contains no lifecycle-to-action
  derivation.
- Empty, one-item and four-item N cases are covered. Empty content and
  unavailable content have distinct safe English states.
- CMS failures, including the already-enforced TASK-016 bodyless-304 case,
  are caught as unavailable without exposing exception, origin, credential,
  URL, body or error kind.

### 3. Preview image and visual/accessibility history

- The only preview asset is an 800 × 800 RGBA protected GDHE PNG with SHA-256:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
- The preview uses the frozen TASK-013 category path
  `/products/curtain-track-systems/manual-curtain-tracks/`, meaningful English
  Alt and a repository-relative public URL. No unprotected fallback or local
  absolute source path exists.
- Reviewer directly inspected the original Round 1 1024 missing-CTA and
  clipped-focus screenshots, and the Round 2 1024, 768, 390 and mobile-focus
  screenshots.
- Round 2 shows complete 44 px CTA intersections, no horizontal overflow,
  2/2/1 columns and an inset media focus indicator. The 320 evidence retains
  one-column reflow without horizontal overflow.
- Both canonical visual reports retain the complete Round 1 FAIL and appended
  Round 2 PASS evidence, screenshot hashes and closure statements.

### 4. Protected authority, dependencies and documentation

- Protected package and lock hashes reproduce:
  - package:
    `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
  - lock:
    `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`.
- ProductCard Snapshot/verifier hashes remain
  `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254`
  and
  `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e`;
  old resolve Snapshot/verifier hashes remain
  `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`
  and
  `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528`.
  Their inventories remain exactly 13 and 20 files.
- Diff from baseline
  `5b448c5c169db7aba1b6c69b3b4baa216493f4d3` is empty for CMS,
  TASK-014～016 artifacts, package/lock, Next config, ProductCard and resolve
  Snapshot/runtime, existing App routes and global CSS.
- Root and frontend READMEs describe the page as local-only, default-off,
  noindex, production-fail-closed and not a production catalog. They do not
  claim that details, RFQ, public SEO, real products or deployment exist.

## Independent Regression Commands And Environment

Reviewer safe checks used bundled Node `v24.14.0`; Planner's frozen current-byte
evidence uses Node `v24.18.0` and npm `11.16.0`.

| Check | Independent result |
|---|---|
| ProductList no-listener subset | PASS, 3 files / 19 tests; 2 skipped |
| ProductList unfiltered sandbox attempt | 19 PASS; exactly 2 listener cases stopped by `listen EPERM 127.0.0.1` |
| ProductCard verifier | PASS, 8 Schema / 3 success / 6 errors |
| Existing resolve verifier | PASS, 16 Schema / 2 success / 2 errors |
| ESLint | PASS |
| TypeScript typecheck | PASS |
| Protected image | PASS, exact SHA-256 and 800 × 800 RGBA |
| Protected Snapshot inventories | PASS, 13 / 20 |
| Protected baseline diff | PASS except the disclosed TASK-017 files and `next-env.d.ts` P2 |
| DPG project validation | PASS |
| DPG strict lane audit | PASS, zero issues |
| Controlled-message validation before response | PASS |
| Git whitespace check | PASS |

No system privilege was requested. The two listener cases are covered by
Planner's fresh unrestricted `21/21` result; the decisive P1 was independently
reproduced without a listener and is not an environment limitation.

## Boundary And Decision

- Business deliverables, tests, evidence, README and Planner-owned task/project
  state remained read-only.
- No product repair, CMS/database/external mutation, acceptance, commit, push,
  merge, deployment or later-task work was performed.
- The only durable reviewer writes are this canonical report, reviewer lane
  records and controlled messages.
- Final decision: `FAIL / P0=0 / P1=1 / P2=2`.
- Planner final validation: not allowed. Planner should acknowledge the linked
  response, record controlled FAIL recovery and authorize only the minimum
  media-boundary, generated-residue and current-narration revisions before any
  fresh review.

## Round 2 Final Outcome

TASK-017 Round 2 final verdict is `PASS / P0=0 / P1=0 / P2=0`.

The Round 1 media P1 and both P2 findings are closed. A real-page,
no-listener SSR reproduction now proves that a Schema-valid HTTPS
WordPress-shaped media URL causes exactly one fixed ProductCard collection
request, zero per-card resolve requests and a sanitized unavailable state
before React receives any card media. Rendered markup contains neither the
hostile URL nor its origin, external preload, external `img`, raw payload or
policy diagnostic.

Visual history remains unchanged and is not represented as a new visual
round: visual Round 1 is still `FAIL / severe 0 / obvious 1 / detail 1`, and
visual Round 2 is still `PASS / severe 0 / obvious 0 / detail 0`.

Planner final validation is allowed only after the controlled Round 2
response is acknowledged and the review recovery is recorded. This PASS is
not user acceptance and does not authorize Git delivery, deployment or later
work.

## Round 2 Finding Closure

### P1 closure — hostile CMS media fails closed before React

The revised production seam is server-only and has no caller-controlled
origin:

- `media-policy.ts` uses one fixed synthetic
  `https://frontend.invalid` origin;
- only a root-relative value beginning with one slash is eligible;
- protocol-relative, absolute, credential-bearing, malformed and
  raw/decoded-backslash-confused values are rejected;
- URL parsing must retain the synthetic origin and cannot carry credentials;
- `loadProductListPage()` checks every media URL in a non-empty authenticated
  collection and returns the existing unavailable state if any value fails;
- preview bypasses CMS media policy and retains only the exact protected
  repository-relative candidate.

An independent Vite SSR probe exercised the actual ProductList page,
TASK-016 consumer, Validator, Adapter and ProductCard component with:

```text
https://cms.example.com/wp-content/uploads/protected.webp
```

Observed result:

```text
REQUESTS=1
COLLECTION=1
RESOLVE=0
UNAVAILABLE=true
HOSTILE_URL=false
HOSTILE_ORIGIN=false
EXTERNAL_PRELOAD=false
EXTERNAL_IMG=false
```

The resulting HTML was only the generic products-unavailable section. The
policy attack probe rejected absolute HTTPS, protocol-relative,
backslash-confused, credential-bearing, malformed-percent and control-
confused inputs. Accepted encoded root paths still resolved to the fixed
synthetic same-frontend origin; no accepted probe became cross-origin.
Focused tests also retain distinct valid-empty and exact local-preview
states. This closes the Round 1 P1 without selecting or claiming a production
public-media origin.

### P2 closure — generated declaration residue

The final independent production build passed and retained the route
inventory:

```text
○ /
○ /_not-found
ƒ /integration/cms
ƒ /products
```

After that build, `frontend/next-env.d.ts` still contains
`./.next/types/routes.d.ts`; its diff from baseline
`5b448c5c169db7aba1b6c69b3b4baa216493f4d3` is empty. The earlier
development-route declaration remains preserved only in the Round 1 finding
and is no longer current residue.

### P2 closure — current review narration

The frontend revision request and response are both ACKed and done. The
active task, project state and board agree on
`UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, preserve the Round 1 FAIL and identify
Round 2 as the current review gate. The prior `ACK_PENDING` wording is no
longer current.

## Round 2 Independent Regression Evidence

Reviewer safe checks used bundled Node `v24.14.0`.

| Check | Independent result |
|---|---|
| Real hostile-media page SSR | PASS; one collection, zero resolve, unavailable, no hostile URL/origin/preload/img |
| Media-policy attack matrix | PASS; no cross-origin accepted value |
| ProductList no-listener regression | PASS, 4 files / 27 tests; 2 listener cases skipped |
| TASK-016 direct regression | PASS, 5 files / 60 tests; 22 unrelated/listener cases skipped |
| ProductCard verifier | PASS, 8 Schema / 3 success / 6 errors |
| Existing resolve verifier | PASS, 16 Schema / 2 success / 2 errors |
| ESLint | PASS |
| TypeScript typecheck | PASS |
| Production build | PASS; route inventory unchanged |
| `next-env.d.ts` post-build baseline diff | PASS, empty |
| Protected package/lock/CMS/TASK-014～016 baseline diff | PASS, empty |
| Protected hashes | PASS, package, lock, both manifests, both verifiers and preview PNG exact |
| Protected Snapshot inventories | PASS, 13 / 20 |
| DPG project validation | PASS |
| Controlled-message validation before response | PASS |
| DPG strict lane audit | PASS, zero issues |
| Git whitespace check | PASS |

Listener-dependent gates were not independently rerun with system privilege.
Planner's fresh same-current-byte evidence reports ProductList `29/29`,
TASK-016 `73/73`, full Vitest `273/273` and production fail-closed smoke PASS.
Those cross-lane results are consistent with the independently reproduced
non-listener contract and rendered-markup evidence and are not used to hide
an environment failure.

The protected hashes remain:

- package:
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- lock:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- ProductCard manifest/verifier:
  `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254`
  and
  `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e`;
- resolve manifest/verifier:
  `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`
  and
  `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528`;
- protected preview PNG:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.

Frozen Validator, Adapter, DTO, Transport, ProductCard contract, CMS,
component DOM/CSS/action, dependency and package boundaries show no Round 2
regression. Production public-media origin and Next Image allowlisting remain
future deployment gates; Schema-valid non-empty collections containing only
unauthorized remote media intentionally remain unavailable in TASK-017.

## Round 2 Boundary And Decision

- Business deliverables, tests, evidence, README and Planner-owned state
  remained read-only during review.
- No repair, CMS/database/external mutation, acceptance, commit, push, merge,
  deployment or later-task work was performed.
- Final decision: `PASS / P0=0 / P1=0 / P2=0`.
- Planner final validation: allowed only after controlled response
  acknowledgement and governed review recovery.
