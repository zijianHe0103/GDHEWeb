# TASK-029 Implementation Plan

Each checkpoint must pass independently before the next one is dispatched.

1. **A0 — Planner design and read-only baseline**
   - Freeze environment, table/state/permission/migration/crash semantics.
   - Verify WordPress protection and record exact hashes.
   - No database or product mutation.
2. **A1 — frontend Repository contract and migration**
   - Strict RED/GREEN for common Repository interface, explicit MySQL
     migration/verifier, runtime account and retained Stub regression.
   - Stop for Planner validation.
3. **A2 — frontend MySQL implementation**
   - Strict RED/GREEN for lookup, atomic reserve, CAS transition, expiry,
     malformed/error paths and real MySQL integration.
   - Stop for Planner validation.
4. **A3 — frontend local `persistent_stub` vertical slice**
   - Wire the real Route/runtime to the MySQL Repository and isolated Stub Sink.
   - Prove replay/conflict/new-intent and production 404.
   - Stop for Planner validation.
5. **A4 — restart/concurrency/failure proof**
   - Two instances, two Next processes, twenty concurrent requests, restart and
     all frozen crash windows.
   - Stop for Planner validation.
6. **A5 — consolidation**
   - Full regressions, permission/security/leakage/residue, docs and final
     evidence.
7. **One complete independent review**
   - Only after A1-A5 converge. Any finding receives same-reviewer bounded
     closure only.

No stage authorizes Git delivery, deployment or external-system integration.
