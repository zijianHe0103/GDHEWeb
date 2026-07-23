# Test Or Validation Log

## Commands

- Inspected active plugin manifest, source Git HEAD/status, cache manifest, and recursive source/cache diff.
- Ran `python3 -B -m unittest discover` against the active plugin tests.
- Compiled all plugin script and test Python sources in memory.
- Ran project `upgrade` dry-run, `validate`, `audit`, strict lane audit, and message validation.
- Compared project files with active plugin templates before editing.
- Scanned current templates for combined and legacy delivery commands.
- Ran scoped whitespace checks, `.codex/**` unchanged check, zero product diff check, and TASK-005 record hash checks.

## Results

- plugin version: `0.2.0+codex.20260723061157`
- source HEAD: `16226639ddff4fd205ecde32de2ca674e97e7073`
- source worktree: clean
- source/cache parity: PASS
- plugin tests: PASS, 70 tests in 14.584 seconds
- in-memory compile: PASS, 26 files
- upgrade dry-run: PASS, current and target schema both `DPG-LANES-1.0.0`, `actions: []`
- project validate: PASS
- project audit: expected dirty-governance and two existing runtime-log observations only
- strict lane audit: PASS, zero issues
- lane-message validation: PASS
- scoped `git diff --check`: PASS after normalizing task-template placeholder bullets
- `.codex/**` diff: empty
- `frontend/**` and `cms/**` Git diff: empty
- TASK-005 stationary post-push record hashes: unchanged during the governance_maintainer execution window; the moved TASK-005 task record is validated separately by path/content/event-chain evidence
- combined delivery command and `readme_impact`: present in the intended current templates
- legacy command scan: PASS after Recovery R2, zero stale delivery-command lines

## Evidence

- Same-schema `upgrade --dry-run` derives its empty action list only from the schema marker and does not compare current managed template contents.
- The source plugin and active cache are byte-identical after excluding source Git metadata and Python bytecode caches.
- The active plugin `.codex` delivery templates match the project copies, so no `.codex/**` file was rewritten.
- The original five-record set is now stated precisely. Four stationary records had execution-window hash checks. The fifth record moved from the TASK-005 active path to its archive path and changed status to `CLOSED`; no pre-intake dirty-file hash was retained, so exact pre/post identity is not claimed.
- Three `apply_patch` attempts targeting the AGENTS legacy block were denied by the pre-tool hook because the old angle-bracket placeholder was parsed as a write target; denied attempts made no file change.

## Not Verified

- Independent adversarial review was not requested; planner explicitly owns that next gate.
- During this execution lane, local/remote `main`, commits, pushes, merges and GitHub default-branch changes were not performed. Planner later established local `main`, and the user later created matching `origin/main` and changed the GitHub default branch; Round 2 must verify that refreshed live state.
- The planner-owned trailing-space observation in `PROJECT/ACTIVITY.md` was subsequently corrected; fresh global `git diff --check` is required before Round 2.

## Recovery R1 Fresh Validation

- revision request ack: PASS
- AGENTS pre-recovery SHA-256: `52bd3c20a2c02be8b33ddd81f50c8b0fd2e0bdf3792348a31fdb9a485de1e6dd`
- prescribed complete-file delete/add patch: denied before execution by false write-target extraction
- AGENTS post-attempt SHA-256: unchanged
- begin managed marker count: 1
- end managed marker count: 1
- unified delivery command count: 1
- legacy three-command scan: FAIL, only the stale merge-command line at `AGENTS.md:88`
- scoped `git diff --check`: PASS
- project validate: PASS
- strict lane audit: coordination pending, only `QUEUE_MESSAGES_PENDING`
- message validation: PASS
- `.codex/**` diff: empty
- `frontend/**` and `cms/**` Git diff: empty
- shell writes or alternate reconstruction: not used
- review request: not sent
- Git, remote, GitHub, plugin, product, runtime, PROJECT, or active-task edit: not performed

Three planner-owned governance files changed after the original preservation baseline as part of planner recovery coordination; this lane did not modify them. `TASKS/ARCHIVE/INDEX.md` and `TASKS/BOARD.md` retain their recorded hashes.

## Recovery R2 Fresh Validation

- revision request ack: PASS
- first module load: failed before API execution because the plugin scripts directory was not on the import path
- retry: same active module loaded after adding only its scripts directory to the import path
- bootstrap: not called
- managed-block helper result: `updated`
- API write target: project `AGENTS.md` only
- before SHA-256: `52bd3c20a2c02be8b33ddd81f50c8b0fd2e0bdf3792348a31fdb9a485de1e6dd`
- after SHA-256: `d3cc6920c2dbd541f262506c49129defb13ad16dd7ea6c3307e2113a6b8b93c5`
- rendered plugin template exact match: PASS
- begin managed marker count: 1
- end managed marker count: 1
- unified delivery command count: 1
- legacy three-command scan: PASS, zero matches
- README and task-template consistency: PASS
- active plugin version: `0.2.0+codex.20260723061157`
- plugin source HEAD: `16226639ddff4fd205ecde32de2ca674e97e7073`
- plugin source worktree and source/cache parity: PASS
- plugin tests: PASS, 70 tests in 14.324 seconds
- in-memory compile: PASS, 26 files
- project validate: PASS
- strict lane audit: PASS, zero issues
- message validation: PASS
- scoped `git diff --check`: PASS
- global `git diff --check`: one pre-existing planner-owned trailing-space line in `PROJECT/ACTIVITY.md`
- `.codex/**` diff: empty
- `frontend/**` and `cms/**` Git diff: empty
- stationary archive-index and board hashes: preserved during Recovery R2; archive index is not used as a substitute for the migrated TASK-005 task record
- planner-owned state/worklog/activity changes: outside this lane and not written by the R2 API
- review request: not sent
- Git, remote, GitHub, plugin mutation, product/runtime, PROJECT, or active-task edit: not performed

## Round 1 Evidence Correction Validation

- pre-intake five paths: planner worklog; project activity; project state; TASK-005 active task; task board
- migrated record mapping: `TASKS/ACTIVE/TASK-005-roadmap-api-integration-boundaries.md` to `TASKS/ARCHIVE/TASK-005-roadmap-api-integration-boundaries.md`
- intentional metadata transition: task status to `CLOSED`; acceptance, formal commit and push history retained
- Git baseline active-task SHA-256: `2acaa1bf9fdf983fb9e5accde946ec1f4dae4a421bc7e3adcf73c6f858f4463c`
- current archived-task SHA-256: `b763bf1003cd7e270df22ad5a5081e0bbb13a33e66295ede8dc885de595f5afd`
- pre-intake dirty active-task exact SHA-256: not retained; exact equality is not claimed
- preservation method for migrated record: path mapping plus acceptance/commit/push content and project activity/event-chain validation
- refreshed remote state: local `main` and `origin/main` both `c9cbf1306d8a142eed43f5cfd24fcb7ec21d25a9`; remote HEAD/default branch `main`
