# 项目清单

schema_version: DPG-LANES-1.0.0
project_type: software
git_mode: DIRTY
created_at: 2026-07-22T03:58:17Z

## 治理标记

本项目由 Durable Project Governance 管理。

## 权威来源映射

本节指向已有权威文档，避免重复复制。

- 长期目标与边界：[Project Charter](CHARTER.md)。
- 当前实际状态与开放问题：[Project State](STATE.md)。
- 硬约束与验收底线：[Constraints](CONSTRAINTS.md) 和 [Quality](QUALITY.md)。
- 架构、语言和开发流程决策：[Decisions](../MEMORY/DECISIONS.md) 及其链接的 ADR。
- 任务状态与验收：[Task Board](../TASKS/BOARD.md) 和当前活动任务文件。
- Agent Lane 事实源：[lanes.json](../LANES/registry/lanes.json)；[Agent Lanes](AGENT_LANES.md) 仅是渲染视图。
- RapidDirect 公开站研究：[reference-site-analysis.md](../docs/reference-site-analysis.md)。它是参考站证据快照，不是当前架构事实源；其 Elementor 实施章节已被 ADR 取代。
- 实际运行环境：本地 CMS 中的 WordPress 现场和 WP-CLI/数据库实测结果；任何版本号在实施前重新验证。

## 交付物边界

- 未来的 frontend 目录：独立 TypeScript 前端，当前尚未初始化。
- 本地 CMS 目录：WordPress 运行时；Git 只跟踪经确认的 GDHE 自有插件或 MU Plugin。
- 文档目录：参考研究和将来的技术契约。
- 未来的 QA 目录：四视口截图、差异报告和质量证据。
- 本地运行时与备份目录不是 Git 交付物。

## 受管理文件

- `AGENTS.md`
- `PROJECT/CHARTER.md`
- `PROJECT/CONTEXT.md`
- `PROJECT/CONSTRAINTS.md`
- `PROJECT/STATE.md`
- `PROJECT/COORDINATION.md`
- `PROJECT/AGENT_LANES.md`
- `PROJECT/SHARED.md`
- `PROJECT/ACTIVITY.md`
- `PROJECT/QUALITY.md`
- `PROJECT/MANIFEST.md`
- `TASKS/BOARD.md`
- `TASKS/ACTIVE/`
- `TASKS/ARTIFACTS/`
- `TASKS/ISSUES/`
- `TASKS/ARCHIVE/INDEX.md`
- `MEMORY/DECISIONS.md`
- `MEMORY/DECISIONS/`
- `MEMORY/LESSONS.md`
- `LANES/registry/lanes.json`
- `LANES/registry/policy.json`
- `LANES/registry/events.jsonl`
- `LANES/messages/`
- `LANES/planner/`
- `LANES/executor/`
- `LANES/frontend/`
- `LANES/wordpress_cms/`
- `LANES/localization_seo/`
- `LANES/visual_qa/`
- `LANES/adversarial_reviewer/`
- `.codex/config.toml`
- `.codex/agents/PLANNER.toml`
- `.codex/agents/EXECUTOR.toml`
- `.codex/agents/ADVERSARIAL_REVIEWER.toml`
- `.codex/agents/DYNAMIC_AGENT.toml`
- `.codex/rules/GIT_GOVERNANCE.rules`
- `.gitignore`
