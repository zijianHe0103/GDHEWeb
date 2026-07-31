# TASK-018 Baseline Validation

status: `PASS`
captured_at: `2026-07-31T02:15:46Z`

## Environment

- Node: `24.18.0`
- npm: `11.16.0`
- Next.js: `16.2.11`
- React: `19.2.8`
- TypeScript: `5.9.3`
- Vitest: `4.1.10`

The shell default was Node `20.20.2`; all authoritative baseline commands used
the project-required Node 24 binary explicitly.

## Results

| Gate | Result |
|---|---|
| `npm run verify:product-card-contract` | PASS — 8 schemas, 3 success, 6 errors |
| `npm run verify:cms-contract` | PASS — 16 schemas, 2 success, 2 errors |
| `npm test` | PASS — 19 files, 273 tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

Baseline build routes:

- `/`
- `/_not-found`
- `/integration/cms`
- `/products`

## Protected state

- Baseline commit, local `main` and `origin/main`:
  `238b316003e97194bbed1b41f6b604c48b383587`.
- No TASK-018 diff exists under `frontend/**` or `cms/**`.
- Protected image SHA-256:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
- Package SHA-256:
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`.
- Lockfile SHA-256:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`.
- Existing `/resolve` Transport SHA-256:
  `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3`.
- Existing runtime Validator entry SHA-256:
  `a2efb86017d2e58ae9e34b13b2d25b9bd072418509d83e639d5d4486553c70bd`.
- Existing CMS manifest SHA-256:
  `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`.

The pre-existing user-owned `.codex/config.toml` change and historical resume
packets remain outside TASK-018.
