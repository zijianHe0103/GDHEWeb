# TASK-012 实施计划

## A1 — Planner 设计门

1. 冻结保留/替代矩阵、事实源和后续阶段。
2. 冻结多语言新触发门，但保持采购和 PoC 为独立授权。
3. 验证任务状态、保护范围和消息目标。

完成门：TASK-012 为 `READY`，DESIGN 和本计划通过治理与 diff 校验。

## A2 — 并行专业只读核查

- `wordpress_cms`：核查 10～20 个真实产品压力验证、内容模型、Preview/Webhook、Schema 19/16 和编辑工作流。
- `frontend`：核查真实产品纵切、技术 SEO、缓存/降级、Staging、可访问性和产品优先顺序。
- `localization_seo`：核查技术 SEO 前置、多语言成熟度门、最小 PoC 与完整发布边界。

三条 Lane 只写各自审计 artifact 和 worklog，不改权威路线图或产品代码。

## A3 — Executor 权威文档修订

1. 基于 DESIGN 和三份专业审计，窄改架构契约第 14 节及必要相关段落。
2. 必要时新增窄 ADR 并更新决策索引。
3. 生成执行报告、差异摘要和 Schema 统计证据。
4. 不修改历史任务结论、产品代码或运行环境。

## A4 — Planner 独立检查

- 核对权威路线图不存在旧顺序冲突。
- 机器复算 Schema 19/16。
- 检查绝对路径、外部事实、Markdown 链接、保护范围、Git diff 和 DPG 状态。
- 汇总 execution evidence。

通过后任务进入 `UNDER_REVIEW`。

## A5 — 独立对抗审查

Reviewer 只读挑战：

- 新顺序是否真正由业务风险驱动。
- 是否把候选任务误写成已实施。
- 是否暗中授权采购、部署、真实产品导入或多语言公开。
- SEO/Preview/cache/Staging 的依赖是否自洽。
- 状态事实源与 Schema 19/16 是否有证据。
- 产品代码和运行环境是否保持不变。

PASS 后 Planner 才运行最终验证和 checked `prepare-awaiting-user`。
