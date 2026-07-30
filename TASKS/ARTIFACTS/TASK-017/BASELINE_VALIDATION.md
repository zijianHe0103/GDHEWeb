# TASK-017 Baseline Validation

status: `PASS`
captured_at: `2026-07-30T17:37:41Z`

## Environment

- Node: `24.18.0`
- npm: `11.16.0`
- Next.js: `16.2.11`
- React: `19.2.8`
- TypeScript: `5.9.3`
- Vitest: `4.1.10`

## Results

| Gate | Result |
|---|---|
| `npm run verify:product-card-contract` | PASS — 8 schemas, 3 success, 6 errors |
| `npm run verify:cms-contract` | PASS — 16 schemas, 2 success, 2 errors |
| `npm test` | PASS — 15 files, 244 tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

Baseline build routes:

- `/`
- `/_not-found`
- `/integration/cms`

## Protected state

- Baseline commit: `5b448c5c169db7aba1b6c69b3b4baa216493f4d3`.
- No TASK-017 diff exists under `frontend/**`, root `README.md` or `cms/**`.
- Existing `.codex/config.toml` and resume packets are unrelated user/workspace state and remain excluded.
- User-provided protected-image source is 800 × 800 RGBA PNG with SHA-256 `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
