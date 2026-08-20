# TASK-018 Test and Validation Log

status: `PASS`
validated_at: `2026-07-31T02:28:44Z`
runtime: `Node 24.18.0 / npm 11.16.0`

## Focused results

| Gate | Result |
|---|---|
| Product Detail config/Adapter/loader/route | PASS — 4 files, 28 tests |
| TASK-017 ProductList regression | PASS — 4 files, 29 tests |
| TASK-008–011 CMS `/resolve` regression | PASS — 7 files, 156 tests |
| TASK-014–016 ProductCard regression | PASS — 6 files, 86 tests |
| CMS contract verifier | PASS — 16 schemas, 2 success, 2 errors |
| ProductCard contract verifier | PASS — 8 schemas, 3 success, 6 errors |

## Full project results

| Gate | Result |
|---|---|
| `npm test` | PASS — 23 files, 301 tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

Final build routes:

- `/`
- `/_not-found`
- `/integration/cms`
- `/products`
- `/products/fgd-x15-pvc`

The detail route is dynamic and request-time gated.

## Production smoke

| Gate | Result |
|---|---|
| Product Detail preview/cms | PASS — final 404 in both modes, CMS requests 0 |
| ProductList preview/cms | PASS — final 404, root 200, integration 404, CMS requests 0 |
| CMS integration | PASS — disabled 404, enabled 200, root 200, one fixed request |

The Product Detail smoke explicitly observes Next.js trailing-slash `308`
normalization before requiring the final framework `404`; it does not treat the
redirect itself as route exposure.

## Protected hashes

These are the retained protected baseline values:

| File | SHA-256 |
|---|---|
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| existing `/resolve` Transport | `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3` |
| runtime Validator entry | `a2efb86017d2e58ae9e34b13b2d25b9bd072418509d83e639d5d4486553c70bd` |
| CMS contract manifest | `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7` |
| protected image | `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880` |

## Scope and leakage

- Protected frontend/CMS path diff: empty.
- `frontend/next-env.d.ts` diff: empty after final build.
- Rendered component/route scan: no `wp-content`, WordPress origin, Article
  Number, internal product code, raw wrapper, environment or CMS diagnostic.
- Product Detail React component imports only the frontend DTO type and owns no
  fetch, environment or contract logic.
- No `.tmp-*` frontend test roots remain.
- `git diff --check`: PASS.
- DPG project validation: PASS.
- DPG message validation: PASS.
- strict Lane audit: PASS with zero issues.
- Strict project audit reports only expected dirty-worktree governance state
  plus pre-existing low-severity runtime/source-name heuristics; it does not
  report a TASK-018 contract or Lane violation.

## Planner checkpoint R1 fresh validation

validated_at: `2026-07-31T02:39:44Z`

| Gate | Result |
|---|---|
| Product Detail focused | PASS — 5 files, 31 tests |
| Hostile CMS route render | PASS — one `/resolve`, zero ProductCard requests, protected local image, zero hostile/internal/raw markup |
| Product Detail server-only builds | PASS — 2 marker-stripped positive controls and 2 guarded negatives |
| TASK-017 ProductList | PASS — 4 files, 29 tests |
| CMS `/resolve` regression | PASS — 7 files, 156 tests |
| ProductCard regression | PASS — 6 files, 86 tests |
| Full Vitest | PASS — 24 files, 304 tests |
| CMS verifier | PASS — 16 schemas, 2 success, 2 errors |
| ProductCard verifier | PASS — 8 schemas, 3 success, 6 errors |
| ESLint | PASS |
| TypeScript | PASS |
| Production build | PASS |
| Product Detail production smoke | PASS — preview/cms final 404, CMS requests 0 |
| ProductList production smoke | PASS |
| CMS integration production smoke | PASS |

Protected package, lockfile, Transport, Validator, CMS manifest and image
hashes remain identical to the original baseline. Final build retained the
same five-route inventory, `frontend/next-env.d.ts` has zero diff, and no
`.tmp-product-detail-server-only-*` root remains.

## Visual Round 1 CSS revision validation

validated_at: `2026-07-31T06:40:49Z`

| Gate | Result |
|---|---|
| Focused visual CSS RED | EXPECTED FAIL — 1 failed, 7 skipped; missing width-safe card contract |
| Focused visual CSS GREEN | PASS — 1 passed, 7 skipped |
| Product Detail focused | PASS — 5 files, 32 tests |
| ProductList regression | PASS — 4 files, 29 tests |
| CMS `/resolve` regression | PASS — 7 files, 156 tests |
| ProductCard regression | PASS — 6 files, 86 tests |
| Full Vitest | PASS — 24 files, 305 tests |
| CMS verifier | PASS — 16 schemas, 2 success, 2 errors |
| ProductCard verifier | PASS — 8 schemas, 3 success, 6 errors |
| ESLint | PASS |
| TypeScript | PASS |
| Production build | PASS — unchanged five-route inventory |
| Product Detail production smoke | PASS — preview/cms final 404, CMS requests 0 |
| ProductList production smoke | PASS — preview/cms final 404, root 200, integration 404, CMS requests 0 |
| CMS integration production smoke | PASS — disabled 404, enabled 200, root 200, one fixed request |

The first combined generated-file/build command used a frontend-prefixed path
while already inside `frontend/`; it stopped at the read-only `shasum` before
the build ran. The corrected command observed the dev-generated
`next-env.d.ts`, then the successful production build restored the tracked
production reference. Final `git diff -- frontend/next-env.d.ts` is empty.

Protected hashes remain the exact baseline values for package
`958e8c89…2bce`, lockfile `dda25a90…852a`, Transport `1fcbf1b4…0de3`,
Validator `a2efb860…70bd`, CMS manifest `3d3a1379…55c7` and protected image
`9a8ed9fe…4880`. CMS Schema inventory remains `16`; ProductCard snapshot tree
inventory remains `13`.

`git diff --check`, temporary-root/residue scan, DPG project validation,
message validation and strict Lane audit all PASS with zero issues. Browser
visual retesting was intentionally not run by frontend.
