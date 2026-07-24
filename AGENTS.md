<!-- BEGIN DURABLE_PROJECT_GOVERNANCE -->
# Durable Project Governance

schema_version: DPG-LANES-1.0.0
项目类型: software

## 必需读取顺序

1. `AGENTS.md`（本文件）
2. `PROJECT/MANIFEST.md`
3. `PROJECT/STATE.md`
4. `TASKS/BOARD.md`
5. 当前主任务对应的 `TASKS/ACTIVE/*.md`
6. 任务明确引用的约束、决策和经验

## 信息权威顺序

1. 当前已确认的用户明确指令
2. 当前任务中已确认的目标、非目标和验收标准
3. `PROJECT/CONSTRAINTS.md`
4. `PROJECT/CHARTER.md`
5. `PROJECT/MANIFEST.md` 中的权威来源映射
6. 当前实际代码、内容、数据和交付物
7. `MEMORY/DECISIONS/` 中仍有效的决策
8. `MEMORY/LESSONS.md` 中的建议性经验

发现冲突时停止相关修改，并向用户说明冲突，不自行选择方便的解释。

## 任务分类

轻量机械任务必须是单文件、低风险、易回退，且不改变含义、行为、数据、流程、项目状态、依赖或外部副作用。

其他工作均为实质性任务。实质性任务必须创建 `TASKS/ACTIVE/TASK-XXX-*.md`，并在实施前等待明确需求确认。

## Multi-Session Agent Lanes Protocol

本项目使用 `DPG-LANES-1.0.0`。Agent lane 注册表：

- 人类可读视图：`PROJECT/AGENT_LANES.md`
- 机器可读事实源：`LANES/registry/lanes.json`
- 多会话策略事实源：`LANES/registry/policy.json`
- 事件事实源：`LANES/registry/events.jsonl`

默认核心 lane：

- `planner`：顶层规划、需求澄清、任务拆解、调度、最终汇报；
- `executor`：实际执行、产出成果、写执行日志和交付物；
- `adversarial_reviewer`：对抗式审核、挑战假设、检查遗漏、风险和证据。

`planner` 是默认用户沟通入口。未注册 session 不能假定自己属于某个 lane。新 session 必须先注册或恢复 lane。每个 lane 必须维护自己的 `worklog.md`。

实质性执行流：

用户 -> planner -> task-intake -> lane message -> executor 或动态执行 lane -> execution report -> adversarial_reviewer -> review report -> planner -> AWAITING_USER -> task-accept

`adversarial_reviewer` 对业务交付物只读，不直接修复；只可写 `ADVERSARIAL_REVIEW_REPORT.md`、自身 lane 记录，并通过 `lane_message.py` 发送受控消息。动态 lane 必须有 `LANE.md`、`worklog.md`、`workspace/`、`sessions/`、`inbox/`、`outbox/` 和明确 `write_scope`。

## Lane 恢复顺序

1. `PROJECT/STATE.md`
2. `PROJECT/COORDINATION.md`
3. `PROJECT/AGENT_LANES.md`
4. `LANES/registry/lanes.json`
5. `LANES/registry/policy.json`
6. 当前 lane 的 `LANE.md`
7. 当前 lane 最近 `worklog.md`
8. `PROJECT/ACTIVITY.md` 最近片段
9. `TASKS/BOARD.md`
10. 当前 lane 相关 active task / issue

## 状态门禁

任务状态：`DRAFT`, `AWAITING_REQUIREMENT_CONFIRMATION`, `READY`, `IN_PROGRESS`, `UNDER_REVIEW`, `NEEDS_REVISION`, `AWAITING_USER`, `ACCEPTED`, `PAUSED`, `CLOSED`.

Git 状态：`NO_GIT`, `DIRTY`, `WIP_CHECKPOINTED`, `FORMAL_COMMIT`, `PUSHED`, `MERGED`.

任务语义状态和 Git 交付状态必须分开记录。

`AWAITING_REQUIREMENT_CONFIRMATION`、合法 `AWAITING_USER`、`PAUSED` 是 `human-required` 状态：应正常结束 turn，不能用 Stop block 模拟等待。聊天精确口令不等于真实系统 `PermissionRequest`；系统审批必须走系统审批通道。

## 用户验收和 Git 命令

不要把 casual approval 当作最终验收。正式交付使用精确口令：

- `确认 TASK-XXX 完成并提交到远端`

收到正式交付口令后，使用中文完整记录本次任务的任务内容、主要变更、验证结果和文档更新。完成本地正式提交后，立即将当前任务分支推送到 GitHub 远端；推送成功后将任务分支合并到 `main`，并立即推送 `main`。

禁止 force push、删除分支或 worktree、`reset --hard`、rebase 未知历史，或在 detached HEAD 上提交。

dispatch、planner、executor、dynamic lane 或 automation 都不得自动调用或绕过 `task-accept`。任务进入正式提交前必须有 execution report、adversarial review PASS、validation evidence、文档影响已处理，且用户输入精确口令。

任务不得手工写成 `AWAITING_USER`。先运行 `task_transition.py prepare-awaiting-user` 验证 artifacts 后再推进；若需修订，运行 `task_transition.py reopen` 退回 `NEEDS_REVISION` 并记录恢复入口。

## 话题切换

修改另一个任务的文件前，先检查当前任务状态、未提交修改、WIP commit、分支/worktree，以及上一任务是否已暂停或等待用户验收。

## 文档同步

每个实质性任务必须记录文档影响：`NONE`、`RESOLVED` 或 `NOT_APPLICABLE`。只要行为、数据、流程、研究结论、业务规则或使用方法改变，文档影响不能是 `NONE`，并且必须在正式验收前处理完成。

任务影响使用方式、功能或流程时，更新项目根目录 `README.md`，并将 `readme_impact` 置为 `UPDATED`；其他任务使用 `NOT_APPLICABLE`。

## 会话交接

仅在显式暂停任务、切换任务、替换 lane session 或准备跨会话 handoff 时，更新当前 lane `worklog.md`、相关活动任务、`PROJECT/ACTIVITY.md` 和 `PROJECT/STATE.md`：当前状态、已完成工作、剩余工作、验证结果、受影响文件、未解决问题、Git 状态和唯一下一步。正常 turn 结束不要求改写治理文件；若事实状态没有变化，不得仅为结束 turn 写 recovery 或 handoff。

## 禁止行为

- 不覆盖 managed block 之外的用户文件。
- 不为了结构整齐复制已有权威文档。
- 不把未经验证的猜测或原始聊天摘要写入长期记忆。
- 不声称测试、审查、commit 或 Codex 判断等于用户验收。
<!-- END DURABLE_PROJECT_GOVERNANCE -->
