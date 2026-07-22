<!-- BEGIN DURABLE_PROJECT_GOVERNANCE -->
## Durable Project Governance

本项目使用 Durable Project Governance schema `DPG-LANES-1.0.0`。

治理层：

- `PROJECT/`：项目事实；
- `TASKS/`：任务、交付物和 issue；
- `MEMORY/`：长期决策和经验；
- `LANES/`：多会话 Agent Lanes 的 session、message、worklog、resume 和 handoff。

默认 lanes：`planner`、`executor`、`adversarial_reviewer`。`planner` 是默认用户沟通入口。任何 lane、dispatch 或 automation 都不能绕过 `task-accept` 的精确用户验收口令。
<!-- END DURABLE_PROJECT_GOVERNANCE -->
