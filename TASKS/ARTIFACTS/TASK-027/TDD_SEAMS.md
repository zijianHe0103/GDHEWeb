# TASK-027 TDD Seams

status: FROZEN

The user-confirmed task and A0 design freeze these public seams before tests. Each production step begins with one focused failing test against a missing or insufficient seam, then adds only the minimum code needed to make that test pass.

| Order | Public seam | First RED | Minimum GREEN | Checkpoint |
|---:|---|---|---|---|
| 1 | frontend-local v2 contract snapshot and verifier | verifier/snapshot absent | exact 20 JSON bytes, closed manifest, authority-bound verifier | A1 |
| 2 | `validatePublicRfqSubmission` and authentic wrapper | five-Schema runtime absent | strict Ajv closure, Unicode/semantic gates, immutable authentic value | A2 |
| 3 | `canonicalizeRfqValue` and versioned digest/token API | TASK-026 vectors fail | exact JCS/HMAC/comparison/snapshot bytes; lone surrogate rejects | A2 |
| 4 | `resolveAuthoritativeRfqLines` | no batch orchestration | exactly one TASK-025 call, ordered complete binding, zero legacy calls | A3 |
| 5 | `createRfqIntakeRuntime` | no reserve/replay state machine | one lookup, pre-gate, exact reservation, public result | A3 |
| 6 | `StubRfqRepository` | no process-local state | exact live/expired conflict and 30-day behavior without document retention | A4 |
| 7 | `StubRfqSink` | no isolated delivery outcome | accepted/indeterminate/rejected outcomes, no retained document | A4 |
| 8 | POST `/api/rfq/intake/` | route absent | local-only origin/media/stream/UTF-8 gates and runtime call | A5 |
| 9 | production/server-only boundary | production route or client import remains possible | final production fail-closed and public/deep Client build negatives | A5 |
| 10 | documentation/regression | runtime truth undocumented or protected bytes drift | narrow README/architecture sync and full gates | A6 |

## Rules

- Never write the whole test suite before production work. Progress vertically in the table order.
- Test observable request/result/call-count/state behavior, not private implementation structure.
- Tests may inject clock, identifiers, key material, pre-reservation gate, mixed consumer, repository and sink; browser input may not select those dependencies.
- A test-only helper may not become a production authenticity bypass.
- Do not add dependencies, form UI, Basket clear behavior, CMS writes, Feishu or deployment work.
- Stop at each A1–A5 checkpoint for Planner reproduction. These are implementation checkpoints, not independent adversarial reviews.
