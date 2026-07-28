# Agent Lanes

schema: DPG-LANES-1.0.0

This Markdown file is a rendered view. The machine-readable source of truth is `LANES/registry/lanes.json`.

| lane | lane_type | purpose | current_session | status | write_scope | worklog | workspace |
|---|---|---|---|---|---|---|---|
| adversarial_reviewer | adversarial_reviewer | Challenge assumptions, inspect omissions and risk, verify evidence, and return PASS/FAIL/P0/P1/P2 findings. | task001-adversarial-review-20260728 | registered | `TASKS/ARTIFACTS/*/ADVERSARIAL_REVIEW_REPORT.md`<br>`LANES/adversarial_reviewer/**` | `LANES/adversarial_reviewer/worklog.md` | `LANES/adversarial_reviewer/workspace` |
| executor | executor | Execute assigned work, produce deliverables, write execution reports, and request adversarial review. |  | unregistered | `TASKS/ARTIFACTS/**`<br>`LANES/executor/**` | `LANES/executor/worklog.md` | `LANES/executor/workspace` |
| planner | planner | Top-level planning, requirement clarification, task decomposition, lane dispatch, and final user reporting. | 019fa467-07fb-79f2-9743-a9d95ceed614 | registered | `PROJECT/**`<br>`TASKS/**`<br>`MEMORY/**`<br>`LANES/**` | `LANES/planner/worklog.md` | `LANES/planner/workspace` |
