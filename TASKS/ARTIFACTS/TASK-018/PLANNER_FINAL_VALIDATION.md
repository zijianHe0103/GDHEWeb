# TASK-018 Planner Final Validation

status: `PASS`
validated_at: `2026-07-31T07:30:24Z`
runtime: `Node 24.18.0 / npm 11.16.0`
acceptance: `NOT_ACCEPTED`
git_delivery: `NOT_STARTED`

## Review Gate

- Final adversarial Round 2:
  `PASS / P0=0 / P1=0 / P2=0`.
- Round 1 `FAIL / P0=0 / P1=0 / P2=1` remains preserved under review
  history.
- The sole evidence-encoding P2 is closed.

## Current-byte Technical Gates

| Gate | Result |
| --- | --- |
| Product Detail focused | PASS — 5 files, 32 tests |
| ProductList regression | PASS — 4 files, 29 tests |
| CMS `/resolve` regression | PASS — 7 files, 156 tests |
| ProductCard regression | PASS — 6 files, 86 tests |
| Full Vitest | PASS — 24 files, 305 tests |
| ProductCard verifier | PASS — 8 schemas, 3 success, 6 errors |
| CMS verifier | PASS — 16 schemas, 2 success, 2 errors |
| ESLint | PASS |
| TypeScript | PASS |
| Next.js production build | PASS |
| Product Detail production smoke | PASS — preview/cms final 404; CMS requests 0 |
| ProductList production smoke | PASS — preview/cms final 404; root 200; integration 404; CMS requests 0 |
| CMS integration production smoke | PASS — disabled 404; enabled 200; root 200; one fixed request |

The production build exposes the existing static root and dynamic
`/integration/cms`, `/products` and `/products/fgd-x15-pvc` routes. The local
product candidates remain request-time gated and return final 404 in
production.

## Visual And Encoding Gates

- Visual Round 2:
  `PASS / severe 0 / obvious 0 / detail 0`.
- Responsive evidence covers 1440, 1024, 768, 390 and 320 CSS px.
- Keyboard order, visible focus, CTA pointer hit, Alt, console and browser
  leakage checks pass.
- All 14 visual files reproduce their preserved filenames, dimensions and
  SHA-256 values.
- Round 1 full/focus and Round 2 focus are accurately disclosed as JPEG/JFIF
  byte streams under historical `.png` names.
- Round 2 full-page composites are true PNG byte streams.

## Protected State

The following current SHA-256 values match the frozen baseline:

| Protected file | SHA-256 |
| --- | --- |
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| CMS `/resolve` Transport | `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3` |
| CMS Validator entry | `a2efb86017d2e58ae9e34b13b2d25b9bd072418509d83e639d5d4486553c70bd` |
| CMS contract manifest | `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7` |
| Protected FGD X15 image | `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880` |
| `frontend/next-env.d.ts` | `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651` |

Protected CMS, dependency, ProductCard and ProductList paths have no TASK-018
diff. No Product Detail temporary test root, Python bytecode, `.DS_Store` or
port 3000 listener remains.

The first read-only protected-hash invocation used two guessed obsolete paths
and exited before completing. The paths were resolved from the frozen
baseline hashes and the corrected complete command produced the exact values
above. This was a validation-command path error, not a product or repository
change.

## Governance Gates

- `git diff --check`: PASS.
- DPG project validation: PASS.
- Lane registry validation: PASS.
- Controlled message validation: PASS.
- Strict lane audit: PASS with zero issues.
- Current branch:
  `codex/TASK-018-fgd-x15-product-detail-slice`.
- User-owned `.codex/config.toml` and historical resume packets remain outside
  TASK-018 delivery scope.

## Result

TASK-018 meets the technical, visual, documentation and independent-review
gates for checked `prepare-awaiting-user`.

This result is not user acceptance and does not authorize commit, push, merge
or deployment.
