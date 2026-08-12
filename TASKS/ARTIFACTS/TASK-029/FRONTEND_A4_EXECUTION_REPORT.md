# TASK-029 Frontend A4 Execution Report

Date: `2026-08-13`

Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Scope executed

Only the frozen A4 restart, concurrency and crash-window proof was executed.
A5 documentation consolidation, complete review, UI, external systems,
production enablement, Git delivery and deployment were not started.

The existing A3 production implementation already expressed the conservative
state machine. A4 therefore added only:

- `frontend/tests/rfq-persistent-stub-a4.test.ts`;
- `frontend/tests/rfq-persistent-stub-a4-http-smoke.mjs`.

No frontend production source, package, lockfile, Schema, migration or runtime
configuration byte changed in A4.

## Two-Repository and twenty-request proof

Twenty simultaneous same-key/same-payload calls were alternated across two
independent `MySqlRfqRepository` instances using the same `gdhe_rfq` database.
They produced:

- one initial `201` and only closed `200/201/202` receipt statuses;
- one Public Reference;
- one stored row;
- one mixed validation;
- one Stub Sink call;
- durable state `accepted`, attempt `1`, row version `4`.

## Frozen crash-window proof

| Frozen window | Durable observation | Fresh-runtime behavior |
| --- | --- | --- |
| before reservation commit | no row | a clean retry may create the first reservation |
| after reservation commit | `idempotency_reserved`, attempt 0 | stored processing, no downstream work |
| before resolving CAS | `idempotency_reserved`, attempt 0 | stored processing |
| after resolving CAS / before mixed | `resolving_lines`, attempt 0 | stored processing |
| during mixed validation | `resolving_lines`, attempt 0 | stored processing; no auto-resume |
| after mixed success / before pending CAS | `resolving_lines`, attempt 0 | stored processing |
| after pending CAS / before Sink | `delivery_pending`, attempt 1 | stored processing; zero Sink call |
| during/after Sink before outcome persistence | `delivery_pending`, attempt 1 | stored processing; no second Sink call |
| after indeterminate persistence | `delivery_indeterminate`, attempt 1 | stored processing; no second Sink call |
| after accepted persistence / before response | `accepted`, attempt 1 | exact stored receipt and reference as HTTP 200 |

Committed-but-caller-ambiguous failures expose only the existing closed Intake
error. The injected private failure text never appears in the returned error or
replay, and the next request consults the durable row before downstream work.

At the exact expiry boundary, both `delivery_pending` and
`delivery_indeterminate` return the closed recovery-required public error. The
row is not deleted or transitioned, and mixed/Sink counts do not increase.

## Two Next processes and restart

The HTTP proof created two isolated temporary frontend roots, sharing only the
installed dependency tree and the same local `gdhe_rfq` Schema. Both Next.js
development processes used one canonical configured Origin while listening on
separate loopback ports.

- Twenty concurrent HTTP requests were split across both processes.
- Exactly one database row, Public Reference, mixed request and durable attempt
  resulted.
- Each live process replayed the same accepted receipt as HTTP 200.
- Both processes were stopped; one was restarted; the same request again
  returned the exact stored receipt/reference as HTTP 200.
- Mixed and legacy endpoint counts remained `1` and `0` respectively.

This is local non-production proof only. It does not establish production HA,
TLS, backups, a real Sink or reconciliation.

## Safety and cleanup

- Only the isolated Stub Sink and loopback fixtures were used.
- Test setup rotated `gdhe_rfq_app` to a transient process-only password and
  rotated it again to a fresh unknown random password in `finally`.
- No `.env*`, Keychain entry, durable credential or password log was created.
- Exact test fingerprints were deleted through migration authority.
- Final database truth is two tables and zero business rows.
- Temporary Next roots, generated workspace output and test listeners are
  absent.
- WordPress `GDHE`, Core, SCF, GDHE Site and all external systems remained
  read-only and unmodified.

## Documentation impact

Still `PENDING` for A5 as explicitly frozen. A4 did not edit README or
architecture documentation and does not claim final task completion.
