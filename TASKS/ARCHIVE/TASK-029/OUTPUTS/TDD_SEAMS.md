# TASK-029 TDD Seams

Every seam must record a real failing RED against current bytes before minimum
GREEN. Tests use Node 24.18.0 and do not rely on the machine's default Node 20.

## A1 — contract, migration and permissions

1. Missing repository interface and authentic result wrapper.
2. Missing migration plan/verify command from an empty Schema.
3. Repeat migration and checksum drift.
4. Runtime account can perform required DML but every DDL/cross-`GDHE` probe
   rejects.
5. Stub Repository remains green behind the common interface.

## A2 — MySQL repository

1. Miss, reservation and exact same-payload replay.
2. Same key/different payload conflict with zero mutation.
3. New key/same payload creates a distinct RFQ.
4. Exact 30-day anchor and no replay extension.
5. All six state cells and only the allowed CAS transitions.
6. Duplicate-key race re-read, stale `row_version`, deadlock/timeout,
   disconnect, ambiguous commit and malformed-row fail-closed behavior.
7. Unknown JSON/state/version and invalid UTF-8/length/UUID/reference rejects.

## A3 — `persistent_stub` runtime

1. Closed configuration, server-only credential path and production 404.
2. Exactly one mixed validation and one Sink attempt for a new request.
3. Same key/same payload returns stored 200/202/409 after reconstructing the
   runtime; counts remain unchanged.
4. Same key/different payload returns 409 with zero downstream calls.
5. Customer changes produce a new intent/key and therefore a new RFQ.
6. Stored public documents stay customer-safe; Article Number is not
   deliberately rendered.

## A4 — concurrency, restart and crash windows

1. Twenty concurrent same-key requests across two Repository instances.
2. Two controlled Next.js processes using the same Schema.
3. Stop/restart Next.js between first response and replay.
4. Every crash point in `STATE_MACHINE.md`, including ambiguous DB outcomes.
5. Pending/indeterminate is never auto-resent, including after expiry.
6. Accepted response loss replays the exact reference and receipt.

## A5 — regression and documentation

1. TASK-025 mixed validation, RFQ Submission 2.0, TASK-027 Intake and TASK-028
   customer form/clear rules.
2. Full resource-safe frontend test inventory, ten existing verifiers, lint,
   typecheck, production build and production smokes.
3. Secret/client/log/SQL diagnostic leakage scans.
4. Core/SCF/WordPress database protection and exact `gdhe_rfq` residue.
5. README/architecture truth, generated/listener cleanup, diff and DPG gates.
