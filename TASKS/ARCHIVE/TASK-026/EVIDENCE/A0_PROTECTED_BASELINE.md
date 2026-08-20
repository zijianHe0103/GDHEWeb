# TASK-026 A0 Protected Baseline

captured_at: 2026-08-12T02:41:20Z
baseline_commit: c642166c20b57735fe500608176de109163caf9a
protected_file_count: 67

`A0_PROTECTED_CHECKSUMS.sha256` freezes the current delivered bytes needed by TASK-026:

- TASK-024 v1 customer/security/idempotency contract, all five Schemas, fixed vectors and verifier;
- TASK-025 requirements/design and final WordPress handoff authority;
- Quote Basket `3.0.0` Schema/sample/manifest and runtime seams;
- the TASK-025 frontend mixed-batch snapshot/server-only consumer;
- the WordPress mixed request/response Schemas and batch runtime;
- frontend package and lock files.

All 67 paths are tracked, regular files, byte-identical to `HEAD` at capture time and have no current diff. TASK-026 may read them but must not modify them.

The following pre-existing dirty or untracked paths are deliberately outside the TASK-026 delivery and must be preserved without staging:

- `.codex/config.toml`;
- `frontend/tsconfig.json`;
- TASK-021 through TASK-025 post-delivery closure narration;
- historical lane resume packets.

The only implementation write scope is `TASKS/ARTIFACTS/TASK-026/**`. Planner alone may later apply the exact approved architecture/ADR and governance deltas.
