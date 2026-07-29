# TASK-012 Round 1 P1 窄修订报告

revised_at: 2026-07-26T05:23:50Z
source_review: MSG-TASK-012-ADVERSARIAL-REVIEW-R1-RESPONSE
result: PASS_FOR_ROUND2

## 修订范围

只关闭 Round 1 的两项 P1；没有改变其他已通过边界。

### P1-1：当前 REST 端点事实

架构契约第 5.2 节现明确：

- TASK-007 已交付 REST API `1`、Content Schema `3.0.0`、Module Schema `1.0.0`。
- `/schema`、`/resolve`、`/collection/{type}`、`/navigation`、`/route-manifest` 已实现。
- 公开类型、Core REST allowlist 与内部字段边界同步到已接受 Schema 3 事实。
- 只有 Preview endpoint、签名入口和认证草稿/修订读取仍未实现，未来形状由阶段 3 独立任务冻结。

未修改 endpoint、Schema、CMS、frontend 或 REST-first 决策。

### P1-2：多语言 PoC 循环门

架构契约第 14.6 节拆为两级：

1. `14.6.1` 最小隔离 PoC 进入门：独立任务、合法许可路径、受控 Fixture、隔离/身份保护/`noindex`、稳定的试验输入、清理与回滚计划。
2. `14.6.2` 生产采购、公开发布与完整建设成熟度门：必须包含第 14.6.1 PoC 产出的 SCF + WPML/ACFML 兼容性 PASS 和清理证据。

兼容性因此是 PoC 输出与生产前置，不再是循环的 PoC 前置。ADR-006 同步记录两级门。TASK-012 仍不授权 PoC、安装、采购、生产 DNS、公开路由或多语言建设。

## Fresh 验证

- endpoint 状态冲突扫描：PASS；四个 TASK-007 endpoint 只标为已交付，Preview 只标为未实现。
- PoC/兼容性循环扫描：PASS；PoC-entry 与 production/public gate 分离。
- Schema 独立复算：CMS `19`、frontend `16`、精确三份 CMS-only、frontend-only `0`。
- TASK-007 A3 file/hash 与 frontend source/snapshot/manifest parity：PASS。
- 15 个相关 Markdown 文件本地链接：PASS，零断链。
- 权威文档 `/Users/`、`file://`、`vscode://`：零命中。
- `frontend/**`、`cms/**`、`.local/**`、package/lockfile：零变化。
- governance project、registry、messages、strict lane audit、`git diff --check`：PASS。

## 未执行

未修改产品代码、CMS、数据库、依赖、运行环境或外部系统；未执行 PoC、采购、安装、翻译、页面、SEO、Preview、cache、Webhook、部署、Git 交付、验收或关闭。

## 下一步

只允许发起窄 Round 2，复核这两项 P1 及直接回归。Reviewer PASS 前不允许 final Planner validation。
