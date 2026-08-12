# TASK-027 Frontend A1 Validation Log

result: PASS
runtime: Node 24.18.0

## Reproduced gates

| Gate | Result |
|---|---|
| Focused snapshot/mutation suite | PASS — `1 file / 5 tests` |
| New offline verifier | PASS — `20 JSON / 5 Schema / 63 refs / 94/94` |
| Source-to-snapshot byte parity | PASS — `20/20` |
| Existing contract verifiers | PASS — all `9` |
| ESLint | PASS |
| TypeScript `tsc --noEmit` | PASS |
| Non-document A0 protected checksums | PASS — `46/46` |
| `frontend/next-env.d.ts` | PASS — `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651` |
| package / lock / pre-existing tsconfig | PASS — exact A0 hashes |
| Generated output | PASS — no `.next`, `tsconfig.tsbuildinfo`, temporary root or listener |

The nine existing verifier results were:

- CMS: `16 / 2 / 2`;
- ProductCard: `8 / 3 / 6`;
- Product Configuration v1: `4 / 1 / 6`;
- Product Configuration v2: PASS;
- QuoteLine v2: PASS;
- Quote Basket v2: `1 / 1 / 3`;
- Quote Basket v3: `1 / 1 / 6`;
- RelatedProductCard: `9 / 4 / 9`;
- Article Number batch: `11 / 5 / 5`.

## Supported-runtime commands

All Node/npm gates put
`/Users/arron/.nvm/versions/node/v24.18.0/bin` first in `PATH`. The new verifier
also executes the hash-bound TASK-026 verifier with the same `process.execPath`
and requires its exact final summary:

```json
{"schemas":5,"localReferences":63,"positiveChecks":47,"negativeChecks":47,"checks":94,"failures":0}
```

## Deliberately omitted gate

No production build was run. `FRONTEND_A1_DISPATCH.md` explicitly says not to
run one unless a focused test requires it; no focused test did. This avoids
starting A2+ behavior or generating unnecessary build output.

## Final governance

Final `git diff --check`, JSON/Markdown, DPG project/message/strict-lane and
response-delivery results are recorded after evidence finalization in the
frontend worklog.
