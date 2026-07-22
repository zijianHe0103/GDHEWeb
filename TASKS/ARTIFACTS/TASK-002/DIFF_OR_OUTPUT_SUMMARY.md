# TASK-002 差异与输出摘要

status: accepted-formal-commit-authorized
date: 2026-07-22

## 1. TASK-002 业务交付变化

- 新增主架构契约：Headless WordPress + Next.js 的系统、数据、内容、多语言、SEO、预览、缓存、媒体、询盘、安全与部署边界。
- 新增 proposed ADR-004：记录 REST-first、Polylang Pro、ACF Pro、Yoast 和重评门。
- 新增三个专业 Lane 证据与一个 planner 证据综合。
- 新增执行报告、验证日志和本摘要。
- 同步 TASK-002、PROJECT/STATE、BOARD、ACTIVITY、planner/specialist worklog、Lane messages 与 events。

## 2. 同一未提交 Worktree 中的先前授权变化

当前 diff 还包含在 TASK-002 开始前、由用户明确授权的内容：

- TASK-001 归档与 TASK-002 intake/分支切换；
- 创建并注册 6 个独立持久化 Agent Lane 会话；
- 对应 session、handoff、registry、manifest、Agent Lane 视图和 worklog 更新。

这些变化不是本次架构裁决扩展出的功能；它们均来自此前用户授权的治理操作，并已在 TASK-002 差异摘要中披露。用户现已用精确口令授权 TASK-002 正式提交，因此它们将与本任务契约和证据一起纳入同一个 formal commit；本任务没有回退或覆盖它们。

## 3. 明确无变化

- `frontend/**`：不存在，未初始化。
- `cms/**`：无 Git 变化；未安装或配置插件、主题、CPT、ACF 或用户。
- package/lockfile：无变化。
- WordPress 数据库和 uploads：未写入。
- Git remote refs、GitHub 设置、部署、域名/CDN：无变化。
- `docs/reference-site-analysis.md`：历史正文未修改。
- formal commit：当前 turn 已授权并将在本摘要所在提交中完成；push/merge 未执行、未授权。

## 4. 风险可见性

- REST-first 与 Polylang Pro 是当前裁决，不是已验证的运行时事实；有明确 PoC 和新 ADR 重评门。
- ACF Pro、Polylang Pro 的商业许可证没有采购；Yoast Premium 也没有被默认选用。
- project audit 的 `GIT_DIRTY` 是任务等待审查/验收期间的预期状态；WordPress Core 文件名中的 `wp-debug-data` 被审计器识别为低优先级临时文件提示，但 checksum 验证证明它是官方 Core 文件。

## 5. Round 1 审查后的窄修订

- 媒体模型唯一化为 reference-level `MediaReference`；首期冻结 Polylang Media module 为关闭，公开 alt/caption 由当前语言内容引用拥有。
- 新增受保护 `_gdhe_translation_group_uuid` 的 UUID v4 创建、sibling 复制、一致性校验、删除稳定性和显式拆组/合组/重连迁移规则。
- GraphQL 重评门改为 Home/Service/Case/Material 四类固定 fixture、每类预热后 200 次/并发 20，并给出串行请求、p95、错误率、JSON 大小和聚合复杂度阈值。
- Webhook payload 与 cache tag 示例统一改用同一个有效 UUID。
- 修订后 fresh validation 全部通过；没有扩大到前端、WordPress、数据库、依赖或部署。
