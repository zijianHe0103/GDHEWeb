# TASK-027 A0 Protected Baseline

captured_at: 2026-08-12T04:15:15Z
count: 47
result: PASS

## Purpose

The checksum stream freezes the delivered TASK-026 v2 contract, TASK-025 mixed consumer, Quote Basket 3.0 boundary, WordPress batch Schemas, dependencies and current documentation before TASK-027 product implementation.

All 47 paths are regular non-symlink files. Their SHA-256 values are in `A0_PROTECTED_CHECKSUMS.sha256`.

## Allowed later differences

Only these protected documentation files may change after an independently validated implementation checkpoint:

- `README.md`;
- `frontend/README.md`;
- `docs/architecture/headless-wordpress-nextjs-contract.md`;
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md`.

Their differences must state only implemented local behavior and remaining production gates. Every other protected path must remain byte-identical.

## Existing dirty boundary

`frontend/tsconfig.json` was already modified before TASK-027 intake. Its current byte hash is frozen only to prevent TASK-027 from changing or reverting that user-owned state. `.codex/config.toml`, TASK-021–026 closure narration and historical resume packets are pre-existing and remain excluded from TASK-027 delivery.

## Generated output

`frontend/.next`, `frontend/tsconfig.tsbuildinfo`, temporary server-only build roots and listeners are not deliverables. They must be absent after each checkpoint, while `frontend/next-env.d.ts` must return to the protected production hash.
