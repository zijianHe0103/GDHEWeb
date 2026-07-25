# TASK-009 Frontend Execution Report

status: COMPLETE_WITH_PLANNER_DOC_SYNC
task_id: TASK-009
lane: frontend
message: MSG-TASK-009-FRONTEND-RESOLVE-TRANSPORT-R1
completed_at: 2026-07-26T00:08:44+08:00
document_impact: RESOLVED_IN_FRONTEND
readme_impact: PLANNER_ROOT_POINTER_REQUIRED

## Outcome

Implemented the minimal Next.js server-only Transport for the fixed English Content Schema 3 `/gdhe/v1/resolve` endpoint. The public entry accepts only a canonical public path and optional caller `AbortSignal`; JSON remains `unknown`, and no Validator, DTO Adapter, page or cache behavior was added.

## Test-driven sequence

1. Restored natural Vitest callback tests after the DPG patch parser repair. An initial `@/` import attempt exposed a Vitest path-resolution problem, so the production files were removed before correcting the test to relative imports.
2. Valid configuration/path RED: focused Vitest exited 1 because `config.ts` did not exist. Minimal `config.ts` and `resolve-url.ts` then reached 30/30 GREEN.
3. HTTP success/protocol RED: focused Vitest exited 1 because `transport.ts` did not exist. Anonymous single-fetch behavior, fixed metadata allowlist and protocol errors then reached 37/37 GREEN.
4. Error semantics RED: 14 new cases failed against the placeholder HTTP/network behavior while the previous 37 remained green. Typed HTTP, timeout, caller-abort and network errors then reached 51/51 GREEN.
5. Public-entry RED: focused Vitest exited 1 because `index.ts` did not exist. The environment-backed public entry then reached 52/52 GREEN.
6. Real bundler RED-GREEN: with the `server-only` markers deliberately removed, the temporary Client Component production build unexpectedly succeeded and the regression test failed. Restoring the marker in every production module made the same build fail for the server-only boundary and the test pass.
7. Slow-body timeout RED: a response that flushed headers and delayed JSON resolved after the timeout because the timer was cleared too early. Extending the timeout through the single body read produced 55/55 focused GREEN.

All source, test and documentation edits were made with `apply_patch`. No encoded, shell, heredoc or Python file-write workaround remains.

## Delivered implementation

- `frontend/src/lib/cms/server/config.ts`: fail-closed `WORDPRESS_API_URL` parsing; HTTPS for non-loopback and explicit loopback-only HTTP.
- `frontend/src/lib/cms/server/resolve-url.ts`: frozen canonical path validation and deterministic English Schema 3 resolve URL.
- `frontend/src/lib/cms/server/transport.ts`: one anonymous GET, JSON Accept header, `no-store`, redirect refusal, 5000 ms default timeout, zero retry, one body read and one JSON parse.
- `frontend/src/lib/cms/server/errors.ts`: stable configuration, transport, protocol and HTTP error classes; non-enumerable HTTP `unknown` body.
- `frontend/src/lib/cms/server/index.ts`: documented public server-only entry that does not expose base URL or timeout injection.
- `frontend/tests/cms-transport.test.ts`: real loopback random-port matrix plus a real temporary Next.js Client Component build negative.
- `frontend/vitest.config.ts` and `frontend/tests/server-only-stub.ts`: exact test-only alias for the bare `server-only` marker.
- `frontend/README.md`: runtime environment, security boundary, capabilities, non-goals and validation commands.

## Contract and error behavior

- Only `/wp-json/gdhe/v1/resolve` with `locale=en`, canonical `path` and `schema=3.0.0` can be generated.
- 200 JSON returns `unknown` body and only status, request ID, ETag, Last-Modified, Retry-After and Content-Type metadata.
- Redirects, unexpected success/304 statuses, non-JSON, empty and malformed JSON become protocol errors.
- 400, 401, 403, 404, 409, 429, 500, 502, 503 and other statuses map to stable HTTP kinds; 404 remains `not_found` without calling `notFound()`.
- Timeout remains active through body consumption. Timeout, caller abort and network failure are distinct and do not expose the CMS origin.
- Raw HTTP error JSON is available only through the `unknown` body getter and is absent from enumerable properties and JSON serialization.

## Scope and boundaries

No dependency, package script, lockfile, environment file, `frontend/src/app/**`, contract snapshot, CMS file, WordPress state, database or root README changed. No Validator, Adapter, route, page, cache, retry, Preview, multilingual or later-task work was started.

The project root README rule requires a minimal TASK-009 pointer, but the registered frontend lane write scope excludes `README.md`; the DPG Hook correctly denied that patch. Planner must add the minimal pointer before resolving the task-level `readme_impact`.

No review, commit, push, merge, acceptance, closure or deployment was performed.

## Remaining governed work

Planner must add the root README pointer, independently validate this response and decide whether to dispatch the adversarial reviewer. This frontend report is execution evidence, not review or user acceptance.

## Explicit loopback port revision R2

Planner identified one P1: cleartext loopback bases without an explicit port were accepted. Three focused regressions were added first for:

- `http://localhost/wp-json`
- `http://127.0.0.1/wp-json`
- `http://[::1]/wp-json`

The focused RED was exact: 3 new tests failed because no error was thrown while the previous 55 tests remained green. The minimal production change adds only `url.port !== ""` to the existing HTTP-loopback branch; HTTPS behavior and all Transport, status, timeout and server-only logic remain unchanged.

`frontend/README.md` now states that cleartext loopback HTTP requires an explicit port. Fresh validation passed: focused 58/58, full 67/67, contract parity, lint, typecheck and production build. Protected scope, package/lock checksums, temporary-residue scan, production leakage scan and DPG validations also passed.

## Deep-import production surface revision R3

Round 1 review found that `transport.ts` exported `requestResolvedPath(path, { baseUrl, timeoutMs, signal })`, so server code could override CMS authority and the frozen timeout through a production deep import.

The regression was added before production changes. Focused RED was exact: 1 new failure and 58 previous passes; the runtime transport module exposed `requestResolvedPath`.

The production surface now has one callable function only:

```ts
resolveCmsPath(publicPath: string, callerSignal?: AbortSignal)
```

`transport.ts` owns this function and `index.ts` only re-exports it. The base always comes from `process.env.WORDPRESS_API_URL`; the timeout always uses the private `DEFAULT_TIMEOUT_MS = 5000`. There is no exported factory, options object, internal request function, conditional export or test-only production flag.

All real HTTP tests now set and restore a temporary `WORDPRESS_API_URL` and call the public `resolveCmsPath` surface. The two timeout tests use the real 5000 ms timeout. Runtime export assertions require `transport.ts` to expose only `resolveCmsPath`, and a compile-time assertion freezes the path-plus-signal signature. Real Next.js Client Component negative builds cover both the public index and the deep transport module.

Fresh validation passed: focused 60/60, full 69/69, contract parity, lint, typecheck and production build. Export-surface, removed-seam, frozen-timeout, protected-scope, checksum, residue, leakage and DPG checks passed. Planner's pre-existing root README synchronization was preserved without edit.
