# TASK-XXX 简短标题

task_id: TASK-XXX
status: DRAFT
owner_lane: planner
assigned_lanes: []
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-XXX
acceptance_state: NOT_ACCEPTED
recovery_recorded_at:
git_status: DIRTY
document_impact: NOT_APPLICABLE
project_type: software

## 原始请求

粘贴或尽量保留用户原始请求。

## 结构化理解

记录 Codex 在实施前对请求的理解。

## 目标

- TODO

## 非目标

- TODO

## 交付物

- TODO

## 验收标准

- TODO

## 允许修改范围

- TODO

## 禁止修改范围

- TODO

## 约束

- TODO

## 假设和待确认事项

- TODO

## 验证计划

- TODO

## 文档影响

使用 `NONE`、`RESOLVED` 或 `NOT_APPLICABLE`。需要修改文档时，先完成文档影响处理，再把本字段置为 `RESOLVED`。

## 分支和 Worktree

- 分支：
- Worktree：

## 当前状态

DRAFT

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md` 和 `TASKS/BOARD.md`。

## 下一步

等待需求确认：

```text
确认 TASK-XXX 需求并开始执行
```

这是 `human-required` 聊天等待点：正常结束 turn，不用 Stop block 续跑。此口令不是系统 `PermissionRequest`，不能代替工具权限审批。

审查和验证完成后，使用 `task_transition.py prepare-awaiting-user` 进入验收等待；需要修订时使用 `task_transition.py reopen`。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|

## Messages

## 执行记录

## Execution Artifacts

## Adversarial Review

## Validation Evidence

## Planner Final Summary

## User Acceptance
