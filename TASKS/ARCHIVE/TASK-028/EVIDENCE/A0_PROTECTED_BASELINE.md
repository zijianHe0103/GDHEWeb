# TASK-028 A0 Protected Baseline

captured_at: 2026-08-12T07:46:24Z
count: 49
result: PASS_CANDIDATE

## Purpose

The checksum stream freezes the delivered RFQ Submission 2.0 snapshot, TASK-025 mixed consumer, Quote Basket 3.0 contract/core, TASK-027 server runtime and dependency manifests before TASK-028 product implementation.

All 49 objects are regular non-symlink files. Their SHA-256 values are in `A0_PROTECTED_CHECKSUMS.sha256`.

## Allowed later differences

TASK-028 may intentionally change only these existing product/document paths after the corresponding RED:

- `frontend/src/app/api/rfq/intake/route.ts`;
- `frontend/src/app/request-a-quote/page.tsx`;
- `frontend/src/app/request-a-quote/page.module.css`;
- `frontend/src/components/quote-basket/index.tsx`;
- `frontend/src/components/quote-basket/quote-basket.module.css`;
- `frontend/src/lib/quote-basket/browser.ts`;
- `frontend/src/lib/quote-basket/use-quote-basket.ts`;
- `README.md`;
- `frontend/README.md`;
- `docs/architecture/headless-wordpress-nextjs-contract.md`;
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md` only if the architecture index requires the existing roadmap note to remain current.

Every other protected path must remain byte-identical. New TASK-028 files must stay inside the frozen frontend/artifact scope.

## Existing dirty boundary

`frontend/tsconfig.json` and `.codex/config.toml` predate TASK-028. The current `frontend/tsconfig.json` byte is frozen only to prevent this task from changing or reverting user-owned state. TASK-021 through TASK-027 closure edits and historical resume packets remain unrelated and must not be cleaned or staged by TASK-028.

## Generated output

`frontend/.next`, `frontend/tsconfig.tsbuildinfo`, temporary build roots and listeners are not deliverables. They must be absent after each checkpoint. `frontend/next-env.d.ts` must return to the protected production hash.
