# TASK-012 差异与输出摘要

## 权威文档

| 文件 | 变更 |
|---|---|
| `docs/architecture/headless-wordpress-nextjs-contract.md` | 将第 14 节改为真实产品优先的十阶段单一权威路线；补充 TASK-001～011 保留边界、参考职责、19/16 口径、进入门、非授权和多语言成熟度门；同步摘要、第 5/6/15/17 节相关触发表述 |
| `TASKS/ARTIFACTS/TASK-012/REAL_PRODUCT_VALIDATION_GATE.md` | 将当前记录明确为测试数据；冻结关系新增/删除/失败保留/发布资格门和公开保护图边界；把 10～20 个最终生产产品验收保留为正式导入与模板/Schema 业务冻结前的强制门 |
| `TASKS/ARTIFACTS/TASK-012/REAL_PRODUCT_SCOPE_REVISION_REPORT.md` | 汇总 2026-07-29 用户确认的 TASK-012 收口范围、同步合同、媒体合同、保留门和非授权边界 |
| `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md` | 新增 proposed 窄 ADR，只记录后续顺序和 ADR-005 固定日历触发条件的拟议替代关系 |
| `MEMORY/DECISIONS.md` | 在待决策区登记 proposed ADR-006 |

## TASK-012 证据

| 文件 | 内容 |
|---|---|
| `TASKS/ARTIFACTS/TASK-012/SCHEMA_COUNT_EVIDENCE.md` | 机器复算 19-file CMS graph 与 16-Schema `/resolve` closure、精确差集和 byte/hash parity |
| `TASKS/ARTIFACTS/TASK-012/EXECUTION_REPORT.md` | 执行、范围、专业审计吸收、验证和剩余 Planner 门 |
| `TASKS/ARTIFACTS/TASK-012/DIFF_OR_OUTPUT_SUMMARY.md` | 本摘要 |

## 吸收的专业审计结论

- WordPress/CMS：真实产品映射先于 Schema 修改；变体、配件角色、文档版本生命周期和编辑/公开限制是后续进入门；Preview/Webhook 当前未实现。
- Frontend：阶段 2 是 2～3 个代表产品纵切，阶段 5 是完整产品系统；产品卡片和 normalized SEO 合同必须先冻结；阶段 3 内部顺序为 Staging → Preview → cache → Webhook → 联合演练。
- Localization/SEO：技术 SEO 从首个正式模板开始，内容 SEO 持续迭代；多语言 PoC 保持隔离、非公开、非采购授权，当前 SCF + ACFML 兼容性必须实证。

## 明确保留与未授权

- TASK-001 至 TASK-011 的已接受交付、ADR-003 小批次门、ADR-004 核心架构和 ADR-005 英语优先/SCF/WPML+ACFML 候选边界均保留。
- 未修改 `frontend/**`、`cms/**`、WordPress 数据库、依赖、lockfile、运行环境、`PROJECT/STATE.md`、`TASKS/BOARD.md` 或活动任务。
- 未导入产品、采购/安装插件、实现页面/SEO/Preview/cache/Webhook/询盘/分析/多语言、创建后续活动任务、部署、提交、推送、合并、验收或关闭。

## 权限门记录

第一次权威文档补丁被 DPG Hook 正确拦截，因为 executor 注册表仍只有基础 write scope；未产生文件变更。Planner ACK `MSG-TASK-012-EXECUTOR-WRITE-SCOPE-REQUEST` 后，只临时增加架构契约、决策索引和 `ADR-006-*` 三个精确路径，补丁才执行。临时 scope 由 Planner 在 executor 阶段结束后收回。

## Round 1 P1 窄修订

- 第 5.2 节同步 TASK-007 已交付 `/resolve`、`/collection/{type}`、`/navigation`、`/route-manifest` 的当前事实；Preview 保持未来未实现。
- 第 14.6 节拆分为 PoC 进入门与生产采购/公开发布成熟度门；兼容性 PASS 是 PoC 输出。
- proposed ADR-006 同步两级门语义。
- 修订只涉及权威文档和 TASK-012 证据，不涉及产品代码、CMS、数据库、依赖或运行环境。
