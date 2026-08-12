# TASK-028 TDD Seams

status: FROZEN

Each production seam begins with one focused failing test, receives only the minimum GREEN implementation, then stops at the named Planner checkpoint.

| Order | Public seam | First RED | Minimum GREEN | Checkpoint |
|---:|---|---|---|---|
| 1 | `normalizeRfqCustomer` | customer domain absent | exact customer projection, closed errors and Unicode/format gates | A1 |
| 2 | hostile customer boundary | accessor/Proxy/unknown input observed or accepted | primitive data-only snapshot and stable error | A1 |
| 3 | `issueLocalRfqIntent` / `verifyLocalRfqIntent` | no issuer/verifier | 30-minute snapshot/key/origin-bound HMAC token | A2 |
| 4 | POST `/api/rfq/intent/` | route absent | local-only Origin/media/body/no-store issuer | A2 |
| 5 | `projectQuoteBasketV3ToPublicRfqBasket` | no submit projection | exact ready 1..50 line v2 projection, blocked states reject | A2 |
| 6 | `buildPublicRfqSubmission` | no authentic complete request | closed customer/Basket/intent/privacy/honeypot draft | A2 |
| 7 | form presentation | current page has disabled placeholder | accessible ordered customer form below Basket | A3 |
| 8 | submit state machine | repeated click/no status behavior | one intent issue plus one intake POST, stable pending/result states | A3 |
| 9 | response boundary | arbitrary JSON enters UI | closed receipt/error parser and safe code mapping | A3 |
| 10 | `clearIfAcceptedSnapshotMatches` | no clear seam | accepted plus exact six fields/token/storage equality clears | A4 |
| 11 | changed-Basket recovery | in-flight mutation risks loss | retain entire current Basket and show accepted-but-kept state | A4 |
| 12 | retry/replay | uncertain response creates new attempt | reuse same intent/key until explicit invalidation | A4 |
| 13 | real local HTTP | component-only proof | accepted/replay/processing/conflict/field/basket failure loop | A5 |
| 14 | production/server-only | route/client import exposure | final 404/zero calls and public/deep Client build negatives | A5 |
| 15 | responsive/accessibility | missing evidence | 1440/1024/768/390/320, keyboard/focus/live/reduced-motion proof | A5 |
| 16 | docs/regression | stale placeholder truth | truthful README/architecture and full protected/regression gates | A5 |

## Rules

- Do not write the complete test suite before the corresponding production seam.
- Test behavior, byte boundaries, calls, storage and public output rather than private implementation names.
- No test helper may export a production authenticity bypass.
- No new dependency, CMS mutation, Feishu call, deployment or production capability.
- Stop after every checkpoint and send one linked response to Planner.
- After A5 and visual QA, perform only one complete independent review.
