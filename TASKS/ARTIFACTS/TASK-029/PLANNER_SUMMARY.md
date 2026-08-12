# TASK-029 Planner Summary

TASK-029 replaces only the local RFQ intake's process-memory idempotency
Repository with a durable Repository stored in an independent `gdhe_rfq` MySQL
Schema. The existing isolated Stub Sink remains process-local. The customer can
legitimately submit a new RFQ with a new intent, while technical replay of the
same intent returns the stored result without repeating mixed validation or the
Sink attempt.

The implementation includes explicit versioned migration tooling, a runtime
account limited to `SELECT/INSERT/UPDATE`, atomic reservation, state/version CAS,
fixed 30-day expiry, two-instance/two-Next/20-request contention proof, restart
replay and conservative crash recovery without automatic resend.

The unique complete review found two persistence defects and two stale current
narratives. Exact state/row-version binding and non-transactional DDL half-state
recovery were added; narration was synchronized. The same reviewer then returned
bounded closure `PASS / P0=0 / P1=0 / P2=0` without a second complete review.

Fresh validation passed `92 files / 740 tests`, ten verifiers, lint, typecheck,
production build, seven HTTP smokes, real MySQL recovery/constraint checks,
WordPress protection, hashes, cleanup and governance gates. The task is ready
only for user acceptance. No commit, push, merge, deployment or external-system
integration has been performed.
