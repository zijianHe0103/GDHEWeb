# Task: Update project governance rules and long-term architecture boundary

task_id: TASK-030
status: CLOSED
risk_level: MEDIUM
assigned_lanes: ["planner"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: No further action; current work continues under TASK-035.
contract_refs: ["project_contract"]
delivery_state: NOT_REQUESTED
closed_at: 2026-08-25T09:17:10Z

## 用户原始请求

将用户提供的 Agent Operating Rules 写入根目录 `AGENTS.md`，把新的企业数字平台长期目标与边界写入 Manifest 路由的 `PROJECT/CONTRACT.md`，并追加用户确认的一级技术选型基线。

## 结构化理解

使用正常 Markdown 语法写入用户给定内容；把目标架构方向与专项实施设计分离。一级技术基线只冻结 TypeScript、Next.js、Node.js + NestJS、模块化单体、PostgreSQL、WordPress + Gutenberg 及其硬边界，不补充实施细节。

## 目标与非目标

目标：让根目录 `AGENTS.md` 与用户批准的规则一致，并把项目长期目标从 Headless WordPress 官网调整为具有统一核心业务能力和数据权威的企业数字平台。

非目标：不确定 ORM、API、身份与权限、数据模型、发布与同步机制、队列、缓存、文件存储、部署或目录迁移；不修改业务代码、数据库、插件实现、外部系统或现有有效能力。

## 允许与禁止范围

允许修改 `AGENTS.md`、`PROJECT/CONTRACT.md` 和本任务包。禁止修改业务代码、依赖、数据库、外部系统、实施架构文档或 Git 历史。

## 验收标准

`AGENTS.md` 包含用户批准的完整托管区块；`PROJECT/CONTRACT.md` 明确企业数字平台长期目标、唯一数据权威、核心应用服务、多前端、WordPress/CRM/飞书边界、一级技术选型、未确定事项、当前冲突和渐进迁移约束；聚焦差异检查无业务代码改动。

## 收口记录

- 用户于 2026-08-25 明确要求关闭旧 TASK-030。
- 本任务形成的 Agent 运行规则、长期架构边界与一级技术选型基线已保存在当前项目权威文件中。
- TASK-030 仅作本地治理收口；未请求 Git 提交、推送、合并、部署或外部系统写入。
- 当前任务仍为 TASK-035；关闭 TASK-030 不改变 TASK-035 的范围或状态。
