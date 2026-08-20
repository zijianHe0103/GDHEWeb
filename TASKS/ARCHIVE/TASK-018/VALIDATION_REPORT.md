# TASK-018 Adversarial Review Report

review_round: `2`
reviewed_at: `2026-07-31T07:25:09Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-018-ADVERSARIAL-REVIEW-R2`
mode: `INDEPENDENT_READ_ONLY_REVIEW`
verdict: `PASS`
status: PASS
p0: `0`
p1: `0`
p2: `0`
planner_final_validation_allowed: `YES_AFTER_CONTROLLED_RESPONSE_ACK_AND_RECOVERY`

## Round 1 Outcome — Preserved

TASK-018 Round 1 verdict is `FAIL / P0=0 / P1=0 / P2=1`.

The product slice itself passes the independently reproduced identity, local
mode, production/noindex, one-resolve, zero-ProductCard, DTO/server-only,
media, internal-field, content, specification, CTA, responsive,
accessibility, regression, protected-scope and generated-file checks described
below.

The current visual behavior also passes. The initial
`BLOCKED_NO_VISUAL_EVIDENCE`, visual Round 1
`FAIL / severe 0 / obvious 2 / detail 0` and visual Round 2
`PASS / severe 0 / obvious 0 / detail 0` histories are all preserved.

One evidence-accuracy P2 remains: the visual report describes Round 1
full-page files as PNG although their actual byte signature is JPEG, and the
two Round 2 focus files also contain JPEG bytes under `.png` filenames.
Images, dimensions and recorded SHA-256 values remain usable and matched, so
this is not a product or visual P1 and does not require recapture.

Planner final validation is not allowed until the narrow evidence-format
disclosure is corrected and independently rechecked. This FAIL is not user
acceptance and does not authorize product repair, Git delivery, deployment or
later work.

## Finding

### P2 — Visual evidence format disclosure is not byte-accurate

`QA/TASK-018/VISUAL_QA_REPORT.md` labels the visual Round 1 full-page evidence
column `Captured PNG` and states that the full-page PNG canvas expanded beyond
the requested CSS width. Independent magic-byte and file-type inspection
instead found:

```text
QA/TASK-018/fgd-x15-pvc-1440.png
  ff d8 ff e0 ... JFIF
  JPEG, 1440 × 1710

QA/TASK-018/fgd-x15-pvc-r2-1440.png
  89 50 4e 47 0d 0a 1a 0a
  PNG, 1440 × 1809

QA/TASK-018/focus-r2-390-category.png
  ff d8 ff e0 ... JFIF
  JPEG, 390 × 900

QA/TASK-018/focus-r2-390-rfq.png
  ff d8 ff e0 ... JFIF
  JPEG, 390 × 900
```

All five visual Round 1 full-page files and both Round 1 focus files are JPEG
bitstreams with `.png` filenames. All five Round 2 full-page composites are
real PNG bitstreams. Both Round 2 focus files are JPEG bitstreams with `.png`
filenames.

Every current file hash matched the visual report, and direct image inspection
confirmed that Round 1 records the disclosed overflow/model-wrap failures and
Round 2 closes them. The issue is therefore the evidence description, not the
visual verdict or content.

Impact:

- tooling or reviewers that trust the filename/report may apply the wrong
  decoder or assume lossless PNG evidence where the stored file is JPEG;
- the capture-method record is not exact even though the current hashes make
  the files reproducible;
- leaving the mismatch unrecorded weakens future auditability of the preserved
  Round 1 and Round 2 histories.

Smallest bounded revision:

1. Do not rename, re-encode or recapture the existing files.
2. Preserve the initial blocker, Round 1 FAIL, Round 2 PASS, dimensions and
   every existing SHA-256.
3. Update the canonical visual evidence and its task summary to disclose the
   actual encoding matrix: Round 1 full-page/focus JPEG bytes under `.png`
   names, Round 2 full-page PNG bytes, and Round 2 focus JPEG bytes under
   `.png` names.
4. Re-run magic-byte/file-type, hash, message, project, strict-lane and
   whitespace checks, then request one narrow Round 2 review of this P2 only.

No frontend, test, screenshot, CMS, dependency or product-code change is
needed.

## Independent Passing Evidence

### 1. Public identity, route and publication gates

- The public model, working English name and sole route are exactly
  `FGD X15+PVC`, `FGD X15+PVC Track` and
  `/products/fgd-x15-pvc/`.
- TASK-017 preview card image, title and `View Product` all retain that target.
  No route, redirect, source constant or rendered text creates
  `/products/fgd-x15/`.
- The inherited protected candidate graphic visibly contains its original
  `FGD X15` artwork label. This is not counted as a second identity because
  the active task explicitly freezes and authorizes that exact replaceable,
  local-only protected asset; route, page model, H1, Alt and CTA identity all
  remain the confirmed `FGD X15+PVC` candidate.
- `readProductDetailMode()` accepts only exact non-production `preview` or
  `cms`; unset, unknown and every production value return `disabled`.
- The page is request-dynamic, exports fixed `noindex,nofollow`, takes no
  browser mode/path/origin input and is absent from public sitemap or route
  aggregation.
- Independent production smokes under Node `24.18.0` returned final 404 for
  both detail modes with zero CMS requests. ProductList and integration
  production smokes also retained their frozen behavior.

### 2. CMS, DTO, server-only, media and error boundaries

- Preview uses the frozen Product Detail DTO with zero network access.
- CMS uses the fixed English Schema 3 canonical path once and performs zero
  ProductCard collection requests and zero retries.
- The real hostile-media route test sends a Schema-valid response through
  Transport, Validator, Product Detail Adapter and React. It observes one
  exact resolve request, the protected local asset and the CMS non-production
  notice, with no hostile URL/origin, `wp-content`, external preload/image,
  Article Number, Product Code, raw marker or diagnostic in markup.
- The Adapter accepts only an authentic validated success wrapper and binds
  exact type, template, locale, path, title, model, category, installation
  modes and confirmed specification values/units.
- The output DTO is deeply frozen at runtime and structurally readonly. It
  contains no raw module, relation, CMS media, wrapper, response metadata,
  origin, Article Number, Product Code or diagnostic.
- Loader and deep Adapter Client Component builds are guarded by
  `server-only`; marker-stripped controls build and guarded imports fail.
- Only an agreed Transport 404 plus validated `gdhe_not_found` error becomes
  `not_found`. Other HTTP, protocol, Schema, identity, specification and
  unexpected failures become the same sanitized unavailable state.

### 3. Content, specifications and CTA

- The visible component contains only Hero, Overview and Key Specifications.
- Exactly five definition rows render:
  `28 × 27 mm`, `6 m`, `Ceiling or wall mount`,
  `155–160 g/m` track weight and `115 g/m` PVC strip weight.
- Width and height are independently validated and combined only in the
  Adapter; track and PVC-strip weights remain separate.
- Preview and CMS ready states display explicit local/non-production candidate
  notices.
- Primary category is exactly
  `/products/curtain-track-systems/manual-curtain-tracks/`.
- The only primary action is ordinary `Request a Quote` navigation to
  `/request-a-quote/`; no option, quantity, saved-list, submission, API,
  Feishu or success claim exists.

### 4. Visual, responsive, accessibility and browser-facing checks

- All fourteen visual files exist and every reported SHA-256 matched.
- Reviewer directly inspected visual Round 1 1440 and visual Round 2
  1440/390/320 plus both Round 2 focus captures.
- Round 2 full-page PNG dimensions match the report:
  `1440×1809`, `1024×1470`, `768×2030`, `390×1824`,
  `320×1861`.
- The R2 screenshots show the Hero using the available width, an intact
  `X15+PVC` token, no narrow clipping, five readable specifications and the
  44px-class CTA.
- Category then RFQ focus order and visible focus rings are evidenced. Source
  retains ordinary anchors, `:focus-visible` and a 2.75rem minimum CTA height.
- The capture report explicitly discloses the vertically joined 900px slices
  and capture-only repeated scrollbar fragments. No accepted R2 full-page
  image was horizontally resized.
- Current code and rendered-route regression keep browser-facing CMS/internal
  leakage at zero.

### 5. Current-byte regression and protected integrity

Authoritative independent commands used project Node `v24.18.0` and npm
`11.16.0`.

| Check | Independent result |
|---|---|
| Product Detail focused | PASS, 5 files / 32 tests |
| ProductList focused | PASS, 4 files / 29 tests |
| Full Vitest | PASS, 24 files / 305 tests |
| ProductCard verifier | PASS, 8 Schema / 3 success / 6 errors |
| CMS verifier | PASS, 16 Schema / 2 success / 2 errors |
| ESLint | PASS |
| TypeScript typecheck | PASS |
| Production build | PASS; exact five-route inventory |
| Product Detail production smoke | PASS; preview/cms final 404, CMS requests 0 |
| ProductList production smoke | PASS |
| CMS integration production smoke | PASS |

The bundled reviewer Node `v24.14.0` produced `304/305` twice because the
existing TASK-009 response-body timeout ordering test resolved after 5.5
seconds; that same case passed when run alone. It is recorded as a
non-authoritative runtime observation, not hidden or reported as PASS. The
project's frozen Node `v24.18.0` was then located and independently reproduced
the complete `305/305` suite.

Protected hashes reproduce exactly:

- package:
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- lock:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- Transport:
  `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3`;
- Validator entry:
  `a2efb86017d2e58ae9e34b13b2d25b9bd072418509d83e639d5d4486553c70bd`;
- CMS manifest:
  `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`;
- protected image:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.

Diff from baseline
`238b316003e97194bbed1b41f6b604c48b383587` is empty for CMS,
package/lock, Next config, `next-env.d.ts`, contracts, Transport, Validator,
ProductCard runtime/snapshot, ProductList and existing components. The final
build retained `./.next/types/routes.d.ts` and SHA-256
`7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
No Product Detail temporary build root, Python bytecode or port 3000 listener
remains.

### 6. Documentation, scope and governance

- Root and frontend READMEs accurately describe local-only preview/CMS modes,
  production hard-disable, one resolve, local media, sanitized states,
  non-production notices and navigation-only RFQ.
- README wording does not claim final SEO, production products, working RFQ,
  deployment or user acceptance.
- Product code diff is limited to the declared Product Detail paths; the
  visual revision changes only local Product Detail CSS and its direct test.
- Project, registry and controlled-message validation pass; strict lane audit
  reports zero issues; `git diff --check` passes.
- No frontend/product/evidence repair, task authority change, Planner-state
  edit, CMS/database/dependency/external mutation, acceptance, commit, push,
  merge or deployment was performed by reviewer.

## Boundary And Decision

- Durable reviewer writes are limited to this canonical report, reviewer lane
  records and one controlled linked response.
- Final decision: `FAIL / P0=0 / P1=0 / P2=1`.
- Planner final validation: not allowed.
- Unique next step: acknowledge the linked FAIL response, record governed
  review recovery, correct only the byte-format disclosure while preserving
  all visual history/files/hashes, fresh-validate and request one narrow Round
  2 recheck.

---

## Round 2 Final Outcome

TASK-018 narrow Round 2 verdict is
`PASS / P0=0 / P1=0 / P2=0`.

The sole Round 1 P2 is closed. Both canonical visual reports now disclose the
actual four-group byte-encoding matrix exactly, all fourteen current files
reproduce the preserved names, dimensions and SHA-256 values, and the initial
blocker, visual Round 1 FAIL and visual Round 2 PASS remain distinct history.

No current finding remains. The independently passing product boundaries from
Round 1 were not reopened because the narrow current-byte checks found no
unexpected product, test, dependency, CMS or generated-file drift.

Planner final validation is allowed only after the linked response is
acknowledged and the review recovery is recorded. This PASS is not user
acceptance and does not authorize Git delivery, deployment or later work.

## Round 2 P2 Closure

### 1. Fourteen-file byte reproduction

Independent `find`, `file`, first-eight-byte `xxd` and `shasum -a 256` checks
returned exactly fourteen evidence files:

| Evidence group | Count | Actual encoding and magic | Dimensions | SHA-256 |
| --- | ---: | --- | --- | --- |
| Round 1 full-page | 5 | JPEG/JFIF; `ff d8 ff e0` | `1440×1710`, `1024×1470`, `792×2064`, `452×1809`, `397×1786` | all five match the preserved Round 1 inventory |
| Round 1 focus | 2 | JPEG/JFIF; `ff d8 ff e0` | both `390×900` | both match the preserved Round 1 inventory |
| Round 2 full-page composites | 5 | PNG; `89 50 4e 47 0d 0a 1a 0a` | `1440×1809`, `1024×1470`, `768×2030`, `390×1824`, `320×1861` | all five match the preserved Round 2 inventory |
| Round 2 focus | 2 | JPEG/JFIF; `ff d8 ff e0` | both `390×900` | both match the preserved Round 2 inventory |

The `.png` names on the three JPEG/JFIF groups remain historical filenames;
no file was renamed, re-encoded or recaptured. Every independently calculated
hash equals the value already preserved in the Round 1 and Round 2 evidence
inventories.

### 2. Canonical report matrix and history

`QA/TASK-018/VISUAL_QA_REPORT.md` and
`TASKS/ARCHIVE/TASK-018/EVIDENCE/VISUAL_QA_REPORT.md` contain the same four matrix
rows, including the complete preserved filename sets and exact magic prefixes:

1. Round 1 full-page: five JPEG/JFIF files under `.png` names.
2. Round 1 focus: two JPEG/JFIF files under `.png` names.
3. Round 2 full-page composites: five real PNG files.
4. Round 2 focus: two JPEG/JFIF files under `.png` names.

The former inaccurate all-PNG/full-page-PNG wording is absent. Both reports
still contain:

- initial `BLOCKED_NO_VISUAL_EVIDENCE`;
- visual Round 1 `FAIL / severe 0 / obvious 2 / detail 0`;
- visual Round 2 `PASS / severe 0 / obvious 0 / detail 0`.

The dimensions, hashes, measurements, findings and capture-method disclosure
remain attached to their original rounds.

### 3. Report-only and protected-scope regression

- The controlled visual revision response and visual lane worklog identify
  only the two canonical visual reports and the visual lane worklog as changed
  by the correction.
- Both report files have the correction timestamp. Product Detail source and
  direct tests predate the correction; root/frontend README and package files
  also predate it. The active task changed later only for Planner-owned
  review-state narration after the correction, not for product authority.
- Baseline diff is empty for CMS, package/lock, Next configuration,
  `next-env.d.ts`, CMS contracts, Transport, Validator, ProductCard runtime,
  ProductList and existing components.
- Protected package, lock, Transport, Validator entry, CMS manifest, local
  protected image and generated `next-env.d.ts` hashes remain respectively:
  `958e8c89…bce`, `dda25a90…52a7`, `1fcbf1b4…de3`,
  `a2efb860…70bd`, `3d3a1379…55c7`, `9a8ed9fe…4880` and
  `7b550dda…2651`.
- No Product Detail temporary build root, Python bytecode, `.DS_Store` or port
  `3000` listener remains.

No frontend, test, README, business/task authority, CMS, dependency, image,
generated file, Git state, deployment or external system was modified by the
reviewer.

### 4. Governance checks

- Exact Round 2 request was acknowledged before substantive review and is in
  `done`.
- Project validation: PASS.
- Controlled-message validation: PASS.
- Strict lane audit: zero issues.
- Four-group report-row comparison: no difference.
- `git diff --check`: PASS.
- Current state remains `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`; acceptance and
  Git delivery remain Planner/user-owned gates.

## Round 2 Boundary And Decision

- Current final decision: `PASS / P0=0 / P1=0 / P2=0`.
- Planner final validation: allowed after controlled response acknowledgement
  and review recovery.
- Round 1 `FAIL / P0=0 / P1=0 / P2=1` remains preserved above.
- Reviewer writes remain limited to this canonical report, reviewer lane
  records and one controlled linked response.
- No acceptance, commit, push, merge, deployment, CMS action or subsequent
  task is authorized.
