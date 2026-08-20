# TASK-016 Adversarial Review Report

review_round: `2`
reviewed_at: `2026-07-30T14:26:30Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-016-ADVERSARIAL-REVIEW-R2`
mode: `INDEPENDENT_READ_ONLY_REVIEW`
verdict: `PASS`
status: PASS
p0: `0`
p1: `0`
p2: `0`
planner_final_validation_allowed: `YES_AFTER_CONTROLLED_REVIEW_RECOVERY`

## Outcome

TASK-016 final configured Round 2 verdict is PASS with P0=0, P1=0 and P2=0.

The Round 1 query-boundary P1 is independently closed. All six required
hostile JavaScript shapes now fail with the stable query error before
coercion, accessor execution or Proxy reflection. Accepted input becomes a
distinct frozen primitive snapshot, and the filter placed into the fixed URL
is exactly the primitive value that passed validation once.

The Round 1 narration P2 is also closed under the requested current-fact
criteria: both revision messages are acknowledged and done, the task remains
`UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, the Round 1 FAIL history is retained,
and Round 2 is the only active review step before Planner final validation.

All directly regressed Round 1 passing boundaries remain intact. Planner final
validation is allowed only after acknowledging the linked controlled response
and recording normal review recovery. PASS is not user acceptance and does
not authorize Git delivery, deployment, UI, cache, CMS or later work.

## Round 1 History — Preserved FAIL / P0=0 / P1=1 / P2=1

## Round 1 Findings (Preserved)

### P1 — The closed query boundary accepts and transmits an unvalidated mutable `filter`

Production evidence:

- `transport.ts` line 63 checks only enumerable string keys with
  `Object.keys`.
- Lines 70 and 79 pass the caller-controlled value directly to
  `RegExp.test`, which coerces non-string inputs.
- Lines 84 to 89 preserve the original caller value rather than a validated
  primitive snapshot.
- Lines 102 to 104 read and coerce that value again while constructing the
  request URL.

An independent no-network probe against the real production module passed a
plain query object whose `filter` value had a stateful `toString`. The first
coercion returned the valid string `product_category:track`; validation
accepted it and returned the original object. The second coercion returned
`product_category:track&meta_key=private`, and that different value became the
transmitted `filter` parameter. The probe observed exactly two coercions and
the validated result still contained `typeof filter === "object"`.

The same production validator independently accepted:

- an unknown non-enumerable own `meta_key`;
- an unknown symbol own key;
- a plain-object Proxy that hid an enumerable unknown key from `ownKeys`.

An enumerable unknown string key was rejected as the control case. Pagination
itself correctly rejects unsafe integers and values outside the required
ranges, but that does not close the separate filter trust-boundary defect.

Impact: caller-controlled JavaScript can cause the actual request to contain a
filter value that was never checked by the frozen allowlist. URL encoding
prevents this particular payload from becoming a second URL parameter, but
the contract requires the transmitted filter itself to be exactly the
validated `product_category:<slug>` value. The implementation and design also
claim unknown JavaScript properties are rejected rather than ignored.

Narrow revision:

1. Fail closed unless `filter` is a primitive string before applying the
   pattern.
2. Snapshot and canonicalize the query once, reject all non-enumerable,
   symbol, accessor and Proxy inputs or reflective failures, and build the URL
   only from copied primitive values.
3. Add regression tests using stateful `toString` or `Symbol.toPrimitive`,
   non-enumerable and symbol extras, and a Proxy-hidden extra; prove the value
   placed in `URLSearchParams` is byte-for-byte the value that passed
   validation.

### P2 — Current review narration still says ACK is pending after ACK

The controlled request records `status: done` and
`done_at: 2026-07-30T13:53:38Z`. The active task still states:

- next step: create and dispatch the Round 1 request;
- reviewer lane status: `DISPATCHED; ACK_REQUIRED`;
- message status: waiting for ACK and verdict;
- Adversarial Review: waiting for ACK and verdict.

`PROJECT/STATE.md` also retains “等待 reviewer ACK” in the current dispatch
entry. The semantic task state itself is correctly
`UNDER_REVIEW / NOT_ACCEPTED / DIRTY`; this finding is limited to the
human-readable current narration.

Narrow revision: after Planner acknowledges the linked FAIL response, update
the current task and project narration to say Round 1 was ACKed and returned
FAIL, preserve this report and all implementation evidence, and recover the
task to the governed revision state. Reviewer does not make that Planner-owned
state change.

## Independent Evidence

### 1. TDD and implementation shape

- The ten vertical RED records are target-specific. Filesystem ordering
  independently shows each focused test preceded its corresponding production
  module: Transport, Validator, Adapter and consumer.
- The production surface contains seven small server-only modules plus one
  explicit deeply readonly DTO type file. The public index exports only
  `loadProductCardCollection` and the closed query type.
- Every public and deep runtime module imports the framework-supported
  `server-only` guard. Four real Next Client Component build negatives passed
  for public and deep imports.

### 2. Fixed request and Transport protocol

Independent source inspection and a no-listener fetch probe confirmed:

- origin comes only from the existing controlled
  `WORDPRESS_API_URL` parser;
- endpoint, locale and Schema version are fixed to
  `gdhe/v1/product-cards`, `en` and `1.0.0`;
- one anonymous `GET`, one `Accept: application/json` header, redirect
  refusal, `cache: no-store`, zero retry and no credential header;
- fixed private timeout observed at 5002 ms and caller abort maps separately;
- response body is read once with `response.text()` and parsed once with
  `JSON.parse`;
- success requires status 200, non-empty ETag and exact
  `public, max-age=60`;
- a bodyless 304 becomes `not_modified_without_cache` rather than an empty,
  stale or successful DTO;
- non-200 responses require `no-store`, valid JSON and normalized status;
  network, timeout, caller abort, redirect and protocol failures remain stable
  and omit origin, credentials and raw body.

The query P1 above is the only reproduced Transport correctness failure.

### 3. Static Schema closure, validation and wrapper

- `npm run verify:product-card-contract` returned
  `PASS: 8 schemas, 3 success samples, 6 error samples`.
- The registry imports exactly the eight frozen TASK-015 Schemas into Ajv
  2020 with strict mode, formats, no remote loader and compile-once validators.
- API version `1`, Schema version `1.0.0`, strict static Schema validation and
  detail action target equality are enforced before wrapper creation.
- Reviewer mutation probes confirmed raw objects, forged brands, copied
  descriptors, ordinary Proxies and error wrappers cannot enter the Adapter.
  The null-prototype frozen wrapper resisted property redefinition, prototype
  replacement and kind mutation.
- The body is caller-isolated through `structuredClone`, deeply frozen and
  remains valid after caller mutation. Serialization, keys and spread expose
  only the public `kind`, not the payload or private brand.

### 4. DTO, error and request-count boundaries

- The DTO type is explicitly and recursively readonly. Adapter code copies
  only allowlisted public fields and deep-freezes all arrays and nested
  objects.
- Zero, one and N fixtures, four kind/lifecycle/action cells, non-empty
  relations, pagination and action/path identity pass.
- Invalid normalized errors and status mismatches fail closed. A valid
  normalized error is rethrown without the raw body; reviewer probes found no
  CMS origin, credential, private field or database identifier leakage.
- The consumer performs exactly one ProductCard collection request. It has no
  `/resolve`, React, browser WordPress, filesystem, `cms` or `TASKS` runtime
  import and cannot create a per-card fetch.

### 5. Protected authority and documentation

- TASK-014 handoff checksums independently passed all 25 entries.
- TASK-015 Snapshot inventory remains exactly 13 files and the old resolve
  Snapshot inventory remains exactly 20 files.
- Current protected hashes reproduce:
  - package lock:
    `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
  - ProductCard manifest:
    `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254`;
  - ProductCard verifier:
    `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e`;
  - resolve manifest:
    `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`;
  - resolve verifier:
    `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528`.
- Protected package, lockfile, TASK-014, TASK-015, old resolve, app and CMS
  diffs are empty from baseline `54917bdedcdb710830021c6397adc217252a8423`.
- Root and frontend READMEs accurately describe the server-only runtime
  consumer, one collection request, zero per-card resolve, no UI, no
  last-known-good cache and no visible page.

### 6. Independent regression commands and environment limitation

Using Node `v24.18.0` and npm `11.16.0`:

| Check | Result |
|---|---|
| ProductCard verifier | PASS, 8 Schema / 3 success / 6 errors |
| Existing resolve verifier | PASS, 16 Schema / 2 success / 2 errors |
| Validator plus Adapter focused tests | PASS, 2 files / 23 tests |
| Server-only build-negative tests | PASS, 1 file / 4 tests |
| Transport non-listener query tests | PASS, 13 tests before reviewer mutations |
| ESLint | PASS |
| TypeScript typecheck | PASS |
| TASK-014 checksums | PASS, 25 / 25 |
| Git whitespace check | PASS |

The sandboxed full suite reached 170 passing tests. Exactly 67
listener-dependent tests across five files failed only because the sandbox
refused `listen 127.0.0.1` with `EPERM`; no system privilege was requested, as
the review request required. Planner's fresh system-approved checkpoint after
the final implementation reports all 15 files and 237 tests PASS, plus a PASS
production build. The reviewer did not claim an independent privileged rerun
or independent production build. The query P1 was reproduced without a
listener and is not an environment failure.

All reviewer-only cache and probe files were removed. No ProductCard temporary
server directory, Vite cache, Python bytecode or mutation residue remains in
the repository.

## Boundary And Decision

- Business deliverables remained read-only throughout this review.
- Unrelated `.codex/config.toml`, prior resume packets and other lane work were
  preserved.
- No implementation, test, README, task state, project state, CMS, database,
  package, dependency, environment, external system or Git state was modified.
- The only durable reviewer writes are this canonical report, reviewer lane
  records and controlled messages.
- Final decision: `FAIL / P0=0 / P1=1 / P2=1`.
- Planner final validation: not allowed. Planner should acknowledge the linked
  response, record controlled FAIL recovery and dispatch only a narrow,
  independently reviewable revision under the configured round limit.

## Round 2 Final Review

### Verdict

`PASS / P0=0 / P1=0 / P2=0`

No residual P0, P1 or P2 finding was reproduced within the strictly limited
Round 2 scope.

### P1 closure — closed query and one-time snapshot

Production source now:

- rejects null, arrays, non-objects and every Proxy through the Node runtime
  proxy detector before invoking caller reflection;
- requires the same-realm plain object prototype;
- inspects `Reflect.ownKeys` and each own descriptor once;
- rejects every unknown, symbol, non-enumerable or accessor property;
- catches reflection failures and exposes only
  `ProductCardConfigurationError("invalid_query")`;
- requires primitive numbers, an allowlisted primitive sort and a primitive
  filter that passes the frozen pattern;
- returns a new frozen object containing only copied primitive values;
- constructs `URLSearchParams` only from that validated snapshot.

No unchecked production assertion was added. The only `as` expression in the
Transport remains `JSON.parse(text) as unknown`, which does not narrow
untrusted data. Sort and filter template-literal types are obtained from
runtime-backed type predicates.

An independent reviewer-only no-network probe loaded the real production
module and reproduced:

| Attack or invariant | Independent result |
|---|---|
| Stateful coercible non-string filter | rejected; coercion count `0` |
| Unknown non-enumerable own key | rejected |
| Symbol own key | rejected |
| Accessor on allowed `page` | rejected; getter reads `0` |
| Proxy hiding or trapping own keys | rejected before trap |
| Throwing prototype reflection Proxy | stable error; trap calls `0`; private detail absent |
| Accepted query identity | distinct from caller input and frozen |
| Accepted values | only primitive number/string values |
| Validated versus transmitted filter | exact `product_category:track` equality |
| Fixed request identity | ProductCard endpoint, `locale=en`, `schema=1.0.0` |
| Pagination/sort/filter negative matrix | PASS |

The checked-in no-listener focused matrix independently passed 20 of 20 tests,
including the six Round 1 attacks and the frozen byte-for-byte URL snapshot
case.

### P2 closure — current facts

- `MSG-TASK-016-FRONTEND-QUERY-BOUNDARY-P1-R1` is acknowledged and in `done`.
- Its linked revision response is acknowledged and in `done`.
- Active task frontmatter, current-state paragraph, project state and board
  consistently show `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`.
- Current state preserves Round 1 `FAIL / P0=0 / P1=1 / P2=1`, records the
  narrow revision and Planner checkpoint, and permits only the Round 2 verdict
  before Planner final validation.
- The Round 2 request itself was read and acknowledged before review. Its
  dispatch-era lane row still describes the pre-ACK handoff, while the
  authoritative message store and current-state/next-step paragraphs
  correctly show an active review awaiting this response; this does not
  recreate the Round 1 stale-current-state contradiction.

### Direct regression evidence

Independent safe checks:

| Check | Result |
|---|---|
| ProductCard offline verifier | PASS, 8 Schema / 3 success / 6 errors |
| Existing resolve verifier | PASS, 16 Schema / 2 success / 2 errors |
| Query and fixed URL tests | PASS, 20 / 20 |
| Validator, Adapter and server-only tests | PASS, 3 files / 27 tests |
| ESLint | PASS |
| Clean TypeScript typecheck | PASS |
| TASK-014 handoff checksums | PASS, 25 / 25 |
| TASK-015 ProductCard inventory | exact 13 files |
| Existing resolve inventory | exact 20 files |
| Protected baseline diff and status | empty |
| Reviewer cache, server-temp and bytecode residue | empty |

The reviewer's first Vitest invocation used the shell-default Node 20.11.1 and
failed before test discovery because current Rolldown requires the newer
`node:util.styleText`; this was an invocation mismatch, not a product result.
The reviewer reran the safe suite directly with bundled Node 24.14.0 and
obtained the PASS results above. Planner's fresh current-byte checkpoint used
the task-frozen Node 24.18.0 and npm 11.16.0 and reports ProductCard 8/3/6,
resolve 16/2/2, focused 73/73, full 244/244, lint, typecheck and production
build all PASS. The reviewer did not claim an independent privileged listener
suite or independent production build.

Protected hashes remain:

- package:
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- package lock:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- ProductCard manifest:
  `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254`;
- ProductCard verifier:
  `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e`;
- resolve manifest:
  `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`;
- resolve verifier:
  `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528`.

The revision did not regress the static eight-Schema registry, API/Schema and
action/path gates, one anonymous GET, zero retry, private 5000 ms timeout,
caller abort, redirect refusal, one JSON parse, bodyless 304 fail-closed
behavior, authentic wrapper, DTO deep isolation, normalized-error validation
and sanitization, one collection request, zero per-card resolve, browser/CMS
isolation or public/deep server-only boundaries. No product runtime imports
React, filesystem, repository `cms` or `TASKS` authority.

### Final boundary

- Business deliverables remained read-only during Round 2.
- No implementation, test, evidence, README or Planner-owned task/project
  state was changed.
- No CMS, database, package, dependency, environment, external system, Git,
  deployment, UI, cache or later-task action occurred.
- Reviewer-only probe and cache files were removed.
- Round 1 FAIL history remains above in the canonical report.
- Final decision: `PASS / P0=0 / P1=0 / P2=0`.
- Planner final validation: allowed only after controlled response
  acknowledgement and normal review recovery.
