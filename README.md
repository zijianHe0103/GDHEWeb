<!-- BEGIN DURABLE_PROJECT_GOVERNANCE -->
## Durable Project Governance

本项目使用 Durable Project Governance schema `DPG-LANES-1.0.0`。

治理层：

- `PROJECT/`：项目事实；
- `TASKS/`：任务、交付物和 issue；
- `MEMORY/`：长期决策和经验；
- `LANES/`：多会话 Agent Lanes 的 session、message、worklog、resume 和 handoff。

默认 lanes：`planner`、`executor`、`adversarial_reviewer`。`planner` 是默认用户沟通入口。任何 lane、dispatch 或 automation 都不能绕过 `task-accept` 的精确用户验收口令。

正式交付使用精确口令 `确认 TASK-XXX 完成并提交到远端`。收到口令后，完成本地正式提交，立即推送当前任务分支，再合并到 `main` 并推送 `main`；远端 `main` 包含该任务提交后，正式交付才算完成。

任务影响使用方式、功能或流程时，更新本文件并将任务字段 `readme_impact` 置为 `UPDATED`；其他任务使用 `NOT_APPLICABLE`。
<!-- END DURABLE_PROJECT_GOVERNANCE -->
