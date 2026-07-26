# TASK-011 Adversarial Review Report

review_round: 2
reviewed_at: 2026-07-26T01:06:43Z
review_lane: adversarial_reviewer
request: MSG-TASK-011-ADVERSARIAL-REVIEW-R2
verdict: PASS
p0_count: 0
p1_count: 0
p2_count: 0
planner_final_validation_allowed: true

## Outcome

TASK-011 Round 2 final verdict is PASS. The Round 1 runtime Adapter-forgery P1
is independently closed, all direct regression gates pass, and final counts
are P0=0, P1=0 and P2=0. Planner final validation is allowed.

The complete Round 1 FAIL findings and Round 2 closure evidence remain below
as the preserved review audit trail.

## Findings

### P1 — A forged ordinary object bypasses the validated-wrapper boundary

The active acceptance criterion requires unknown, raw Transport bodies and
ordinary forged objects to be unable to enter the production Adapter. The
Adapter is an exported production function and directly reads
`validated.body` without a runtime authenticity check:

- `frontend/src/lib/cms/server/adapter/cms-integration-page.ts:19-34`
- `frontend/src/lib/cms/server/validation/index.ts:9-41`

The only negative in
`frontend/tests/cms-integration-adapter.test.ts:66-78` is inside
`if (false)` and uses `@ts-expect-error`; it proves a compile-time nominal
type barrier, not the required runtime production boundary.

Independent reproduction imported the actual Adapter module under Node
24.18.0 and passed an ordinary object with no private Validator brand:

```text
input.kind = success
input.body.title = FORGED WITHOUT VALIDATOR
result.accepted = true
result.dto.title = FORGED WITHOUT VALIDATOR
```

The full observed result was:

```json
{"accepted":true,"dto":{"id":"forged-id","apiVersion":"1","schemaVersion":"3.0.0","type":"page","templateKey":"standard","locale":"en","publicPath":"/","title":"FORGED WITHOUT VALIDATOR","excerpt":null,"moduleCount":0}}
```

The ordinary route currently calls success validation before this function at
`frontend/src/lib/cms/server/integration/load.ts:29-35`, but that does not make
the separately exported production Adapter enforce or authenticate the
wrapper contract. A future or deep server import can call it directly, and
`server-only` prevents client bundling rather than server-side forgery.

Narrowest revision: make the runtime authenticity decision inside the module
that owns the private Validator brand, then expose only a brand-checked body
access or brand-checked adaptation seam. Add an executable negative that calls
the real production seam with raw unknown and an ordinary structural object
and requires a stable non-leaking failure. Because TASK-010 Validator files
are protected by the active task, Planner must explicitly authorize any
necessary narrow change instead of silently editing that scope.

## Independently Passed Boundaries

- The ordinary success path contains one `resolveCmsPath`, one success
  validation and one Adapter call; the loopback and production smoke each
  observed one fixed anonymous GET.
- HTTP error body validation occurs before body-field reads. A page 404
  requires Transport `not_found`, HTTP 404, validated body status 404 and
  `gdhe_not_found`; invalid bodies and non-404 classes remain non-404 errors.
- Only exact enable value `1` activates the dynamic route. The canonical path
  comes from server-only environment configuration; route/query input is not
  accepted and malicious query values did not change the upstream URL.
- DTO and rendered output omit raw modules, HTML, Transport metadata and CMS
  origin. Public and deep Client Component build negatives, HTML/RSC scans and
  real-browser network evidence support the server-only boundary.
- The real A3 evidence is internally consistent: anonymous WordPress Schema 3
  root resolve, real `next start`, one upstream request per document request,
  browser assets only from Next.js, no console errors, and matching 1440 by
  1064 and 390 by 876 screenshot hashes. Both screenshots were independently
  inspected and are readable without mobile horizontal overflow.
- Current A3 cleanup checks independently returned an empty fixture manifest,
  zero fixture posts, revisions, attachments, terms, relationships, marker
  metadata, manifest option and uploads. WordPress database check passed and
  no listeners were present on ports 3211 or 8080.
- Protected diff from baseline is empty for package and lock files, root app,
  contract snapshot, TASK-009 Transport, TASK-010 Validator and CMS. No new
  dependency, CMS source change, database structure change, formal page,
  deployment or Git operation was found.
- Root and frontend README descriptions match the implemented default-off
  technical route and local configuration.

## Independent Validation

Runtime: Node.js 24.18.0 and npm 11.16.0.

| Gate | Result |
|---|---|
| Focused integration tests | PASS, 5 files and 39 tests |
| Complete Vitest suite | PASS, 9 files and 155 tests |
| CMS contract parity | PASS, 16 Schemas, 2 success and 2 error samples |
| ESLint | PASS |
| TypeScript no-emit | PASS |
| Production build | PASS, root static and integration route dynamic |
| Production smoke | PASS, disabled 404, enabled 200, root 200, one fixed request |
| Runtime forged-wrapper reproduction | FAIL boundary reproduced |
| Protected source diff | PASS, empty |
| WordPress fixture and database residue | PASS, zero |
| Port residue | PASS, ports 3211 and 8080 closed |
| Git whitespace check | PASS |

The review build generated ignored `.next` and TypeScript build cache output.
The reviewer attempted exact cleanup, but the governance hook rejected the
entire cleanup command as outside reviewer write scope. No workaround was
used. Planner must remove only those reviewer-generated build artifacts during
controlled review-failure recovery before fresh validation.

## Decision

FAIL. P0=0, P1=1, P2=0. Planner final validation is not allowed. Planner owns
NEEDS_REVISION recovery, exact cleanup of reviewer-generated build artifacts,
authorization of the narrow runtime brand-check revision, fresh validation
and any Round 2 request. This report is not acceptance or Git authorization.

## Round 2 Final Review

reviewed_at: 2026-07-26T01:06:43Z
request: MSG-TASK-011-ADVERSARIAL-REVIEW-R2
verdict: PASS
p0_count: 0
p1_count: 0
p2_count: 0
planner_final_validation_allowed: true

### Scope

This final configured round preserved the Round 1 audit trail and reviewed
only the single runtime Adapter-authenticity P1 and its direct regressions.
No WordPress Fixture was recreated, no CMS or database state was changed, and
no unrelated TASK-011 design area was reopened.

### P1 Closure

The Round 1 bypass is closed.

- `validation/index.ts:10` owns a module-private `WeakSet`.
- `validation/index.ts:22-43` is the only wrapper factory and the only source
  occurrence that registers an identity.
- `validation/index.ts:64-75` accepts `unknown`, requires WeakSet identity and
  authentic success kind, then returns the already validated frozen body.
- `adapter/cms-integration-page.ts:22-26` can obtain its input body only
  through that authenticity accessor.
- The accessor contains no Schema validator call. The single
  `validatePageSchema` invocation remains in the success validator, while
  orchestration still contains one request, one success validation and one
  Adapter call.

The accessor is a fixed own property on the existing success-validator
function: independently observed descriptor values were
`writable=false`, `configurable=false`, `enumerable=false`. Attempts to set,
redefine or delete it all returned false. Attempting to replace the exported
validator binding through the ESM module namespace also returned false, and
the Adapter retained the original accessor identity.

The Validator's top-level runtime exports remain exactly:

```text
CmsContractError
validateCmsErrorPayload
validateCmsSuccessPayload
```

There is no exported caller-registration seam.

### Independent Runtime Attack Matrix

The real production Adapter seam was called with all requested adversarial
inputs:

| Input | Result |
|---|---|
| raw canonical success payload | stable `invalid_success_payload` |
| ordinary structural success object | stable `invalid_success_payload` |
| authentic error wrapper | stable `invalid_success_payload` |
| Proxy around ordinary forged object | stable `invalid_success_payload` |
| Proxy around authentic success wrapper | stable `invalid_success_payload` |
| null-prototype imitation copying every visible key, descriptor and symbol from an authentic wrapper | stable `invalid_success_payload` |

Every rejection was `CmsContractError`, category `contract`, kind
`invalid_success_payload`, with the existing stable message. Error string and
JSON output contained none of the forged title, diagnostics, body or input
sentinels.

A genuine success wrapper still produced the exact canonical ten-field DTO
before and after all replacement attempts. The DTO remained frozen. The
wrapper remained frozen with null prototype, a deeply frozen body, only
`kind` in enumerable keys and `{"kind":"success"}` JSON output.

### Direct Regression Gates

Runtime: Node.js 24.18.0 and npm 11.16.0.

| Gate | Result |
|---|---|
| Focused Adapter, Validator, orchestration and server-only tests | PASS, 4 files and 85 tests |
| Complete Vitest suite | PASS, 9 files and 158 tests |
| CMS contract parity | PASS, 16 Schemas, 2 success and 2 error samples |
| ESLint | PASS |
| TypeScript no-emit | PASS |
| Production build | PASS, integration route remains dynamic |
| Production smoke | PASS, disabled 404, enabled 200, root 200, one fixed request |
| Dependency inventory | PASS, unchanged |
| Production dependency audit | PASS, zero vulnerabilities |
| Protected scope | PASS; package, lock, registry, validation errors, Transport, root app, contracts and CMS unchanged |
| Client and build leakage scan | PASS, no environment, CMS-origin, forged-input or raw-content sentinel |
| Temporary listeners | PASS, ports 3211 and 8080 closed |
| Project and controlled-message validation | PASS |
| Strict lane audit before response | PASS, zero issues |
| Git whitespace check | PASS |

The required review build regenerated ignored `.next` and
`tsconfig.tsbuildinfo`. Exact removal was again rejected before execution by
the reviewer write-scope hook. This is reviewer-generated validation output,
not a product or P2 defect; Planner must remove only those two generated
artifacts during controlled PASS recovery before its final validation. No
cleanup workaround was used.

### Final Decision

PASS. P0=0, P1=0, P2=0. The Round 1 P1 is independently closed and direct
regressions pass. Planner may proceed to final validation after controlled
cleanup of the reviewer-generated build output. This verdict is not user
acceptance and does not authorize commit, push, merge, deployment or later
task work.
