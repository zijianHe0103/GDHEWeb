# TASK-022 Final Test Or Validation Log

Date: 2026-08-05
Runtime: Node `24.18.0`, npm `11.16.0`
Status: `PASS`

## Fresh Planner final validation

| Gate | Final result |
| --- | --- |
| Direct Basket regressions | PASS, 4 files / 40 tests |
| Full Vitest | PASS, 44 files / 463 tests |
| Five contract verifiers | PASS: CMS 16/2/2; ProductCard 8/3/6; Product Configuration v1 4/1/6; Product Configuration v2; QuoteLine v2 |
| ESLint / TypeScript | PASS |
| Next.js 16.2.11 production build | PASS; `/request-a-quote` remains dynamic |
| Four production smokes | PASS; Basket preview/cms final 404, CMS 0, submission 0 |
| Visual evidence | PASS, hash/magic/dimensions 15/15 |
| Immutable protected files | PASS, 13/13; two product seams are explicit authorized changes |
| CMS diff and runtime forbidden scan | PASS, zero task-owned CMS diff and zero forbidden source match |
| Generated cleanup | PASS; `.next` and TypeScript cache moved recoverably to `/Users/arron/.Trash/gdhe-task022-final-iPv2Tb`; port 3000 clear |
| `next-env.d.ts` | PASS, `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651` |
| DPG project/messages/strict lane/diff | PASS, zero issues |

## Historical Round 1 revision evidence

| Gate | Current-byte result |
| --- | --- |
| Direct RED | PASS as evidence: exit 1, 4 new failures / 36 prior passes |
| Direct GREEN | PASS, 4 files / 40 tests |
| Full Vitest | PASS, 44 files / 463 tests |
| CMS contract verifier | PASS, 16 schemas / 2 success / 2 errors |
| ProductCard verifier | PASS, 8 schemas / 3 success / 6 errors |
| Product Configuration v1 verifier | PASS, 4 schemas / 1 success / 6 errors |
| Product Configuration v2 verifier | PASS |
| QuoteLine v2 verifier | PASS |
| ESLint | PASS |
| TypeScript | PASS |
| Production build | PASS; `/request-a-quote` remains dynamic |
| CMS integration smoke | PASS, disabled 404 / enabled 200 / one fixed request |
| ProductList smoke | PASS, preview/cms final 404 / CMS 0 |
| Product Detail smoke | PASS, preview/cms final 404 / CMS 0 |
| Quote Basket smoke | PASS, preview/cms final 404 / CMS 0 / submission 0 |
| Visual evidence inventory | PASS, exact 15/15 SHA-256 |
| Package/lock and frozen authorities | PASS, exact protected hashes |
| Runtime leakage scan | PASS, zero forbidden marker matches |
| Generated residue | PASS, `.next` absent and no task listener remains |
| `next-env.d.ts` | PASS, exact protected SHA-256 |
| `git diff --check` | PASS |
| DPG project/messages/strict lane | PASS, zero lane issues before response |

## Protected integrity

Package, lock, PublicQuoteDraft, Product Configuration v2 builder/manifest,
QuoteLine v1/v2 schemas and entrypoints, Product Configurator CSS, Product
Detail CSS, protected image and `next-env.d.ts` retain the hashes in
`PROTECTED_BASELINE.md`. Quote Basket CSS retains its reviewed current hash
`a10f02f43d683d2ffbc678193dff5aec931ca9b48faed4caabb066a80999823b`.
The 15 Visual Round 1 evidence files all match
`QA/TASK-022/EVIDENCE_INVENTORY.sha256`.

The production build generated `.next`; it was removed after all four smokes.
This generated cache is reproducible by the recorded build command. The build
restored `next-env.d.ts` to protected hash
`7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
