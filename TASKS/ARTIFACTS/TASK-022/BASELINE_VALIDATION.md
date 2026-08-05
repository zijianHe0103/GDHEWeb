# TASK-022 Baseline Validation

Captured: 2026-08-05
Runtime: Node `24.18.0`, npm `11.16.0`

## Results

| gate | result |
| --- | --- |
| Focused configurator + QuoteLine | PASS, 6 files / 35 tests |
| Full Vitest | PASS, 40 files / 422 tests |
| CMS contract verifier | PASS, 16 schemas / 2 success / 2 errors |
| ProductCard verifier | PASS, 8 schemas / 3 success / 6 errors |
| Product Configuration v1 verifier | PASS, 4 schemas / 1 success / 6 errors |
| Product Configuration v2 verifier | PASS |
| ESLint | PASS |
| TypeScript | PASS |
| Production build | PASS |
| Existing build routes | `/`, `/_not-found`, `/icon.svg`, `/integration/cms`, `/products`, `/products/fgd-x15-pvc` |
| CMS integration production smoke | PASS |
| Product Detail production smoke | PASS, preview/cms final 404, CMS requests 0 |
| ProductList production smoke | PASS, preview/cms final 404, CMS requests 0 |
| DPG project/messages/strict lane/diff | PASS before design |

The absence of `/request-a-quote/` is the expected pre-implementation route
baseline and will form one explicit RED.

## Cleanup

- Production build left `frontend/next-env.d.ts` at its exact baseline hash.
- Generated `.next` was moved recoverably to
  `/Users/arron/.Trash/gdhe-task022-baseline-b9cBZj/.next`.
- No task-owned listener or generated build root remains.
- No frontend or CMS product file was changed while collecting this baseline.
