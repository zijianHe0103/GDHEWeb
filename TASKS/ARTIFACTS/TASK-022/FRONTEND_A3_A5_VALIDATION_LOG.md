# TASK-022 Frontend A3-A5 Validation Log

Date: 2026-08-05
Runtime: Node `24.18.0`, npm `11.16.0`

| Gate | Current-byte result |
| --- | --- |
| Product Detail/configurator/Basket focused | PASS, 13 files / 73 tests |
| Real local Next preview response | PASS, 1 file / 2 tests |
| Full Vitest | PASS, 44 files / 459 tests |
| CMS verifier | PASS, 16 schemas / 2 success / 2 errors |
| ProductCard verifier | PASS, 8 schemas / 3 success / 6 errors |
| Product Configuration v1 verifier | PASS, 4 schemas / 1 success / 6 errors |
| Product Configuration v2 verifier | PASS |
| QuoteLine v2 verifier | PASS |
| ESLint | PASS |
| TypeScript | PASS |
| Production build | PASS; dynamic `/request-a-quote` emitted |
| CMS integration smoke | PASS |
| ProductList smoke | PASS, production 404 / CMS 0 |
| Product Detail smoke | PASS, production 404 / CMS 0 |
| Quote Basket smoke | PASS, preview/cms production 404 / CMS 0 / submission 0 |
| Package and lock | PASS, exact baseline hashes |
| Immutable protected subset | PASS, 13 exact or authorized entries accounted |
| CMS | PASS, zero task-owned diff |
| Runtime leakage/import scan | PASS, zero matches |
| `git diff --check` | PASS |
| Generated `.next` | PASS, absent after recoverable Trash cleanup |
| Protected `next-env.d.ts` | PASS, exact baseline hash |
| DPG project/messages/strict lane | PASS |

## Protected baseline accounting

Thirteen of the fifteen `PROTECTED_BASELINE.md` paths retain exact hashes.
The only two changed paths are the ProductConfigurator and Product Detail page,
which the baseline explicitly marks as authorized direct A3 changes. Package,
lock, Product Configuration source/manifest, QuoteLine v1/v2, both CSS files,
protected image and `next-env.d.ts` remain exact. This is truthful 15/15
accounting, not a false claim that the two authorized source hashes stayed
unchanged.

The pre-existing `frontend/tsconfig.json` formatting diff was present at lane
recovery and was preserved without editing.

## Production and cleanup

The final build emitted `/`, `/_not-found`, `/icon.svg`, `/integration/cms`,
`/products`, `/products/fgd-x15-pvc` and `/request-a-quote`. All four production
smokes stopped their Next/CMS listeners. No task-owned Next/Vitest process or
`.next` root remains; the generated `next-env.d.ts` dev line was restored by
`apply_patch` to SHA-256
`7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
