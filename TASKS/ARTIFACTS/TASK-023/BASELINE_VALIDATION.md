# TASK-023 Baseline Validation

Captured: 2026-08-06 before product implementation

## Frontend

- Node `24.18.0`, npm `11.16.0` fixed PATH.
- Full Vitest: `44 files / 463 tests` PASS.
- CMS contract verifier: `16 schemas / 2 success / 2 error` PASS.
- ProductCard verifier: `8 schemas / 3 success / 6 error` PASS.
- Product Configuration v1: `4 / 1 / 6` PASS.
- Product Configuration v2 verifier: PASS.
- QuoteLine v2 verifier: PASS.
- ESLint: PASS.
- TypeScript `tsc --noEmit`: PASS.
- Next.js `16.2.11` production build: PASS; routes unchanged: `/`, `/_not-found`, `/icon.svg`, `/integration/cms`, `/products`, `/products/fgd-x15-pvc`, `/request-a-quote`.
- Build output and TypeScript cache were moved recoverably to `/Users/arron/.Trash/gdhe-task023-baseline.wb6UoZ`; no `.next` or `*.tsbuildinfo` remains.

## WordPress / CMS

- WordPress `7.0.2`.
- PHP `8.3.32`.
- `gdhe-site` active at `0.7.0`.
- All 12 WordPress database tables: OK.
- ProductCard Schema validation: 8-file closure, 1 inline positive, 6 negatives, 8 runtime Goldens PASS.
- `includes/product-cards.php` and `includes/public-api.php`: PHP lint PASS.
- TASK-014/TASK-019/TASK-021 fixture option residue query: `[]`.
- No fixture create or live business-data write was performed by Planner baseline validation.

## Governance and Git boundary

- Branch/head baseline: `codex/TASK-023-related-products-progressive` at `6c5b7644c8bbabf8771223eb7baadb2964498e6b`.
- `main` and `origin/main` equal the same commit.
- User/local `.codex/config.toml`, `frontend/tsconfig.json`, prior closure edits and historical resume packets are preserved.
- No CMS/frontend product implementation, external-system action, commit, push, merge or deployment occurred during A0.
