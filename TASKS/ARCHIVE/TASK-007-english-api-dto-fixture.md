# TASK-007 英语版 API / DTO / Fixture 实施
accepted_at: 2026-07-24T15:16:22Z

task_id: TASK-007
status: CLOSED
owner_lane: planner
assigned_lanes: [wordpress_cms, frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-007
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-24T11:29:16Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 请继续往下一步进行，既然这里这个步骤已经完成了，那么就继续独立站的任务。

> 2026-07-24 修订：RapidDirect 只作为网站代码框架、视觉和处理方式参考；产品目录、网站栏目和产品详细信息改以 Forest Group UK 为主要参考。用户明确确认将 TASK-007 退回修订并重构 CMS 内容模型。

## 结构化理解

- TASK-006 已正式提交、推送任务分支、合并并推送到远端 `main`。
- 已验收的 TASK-005 路线图把下一候选定义为 WordPress/GDHE 插件侧的英语版 API/DTO/Fixture 实施，且必须先于 Next.js 正式 CMS 消费。
- 本任务按已审查建议分成 A1 与 A2 两个执行批次，但保持一个最终消费门：A1 只是可回退中间检查点，只有 A2 完成并通过最终独立审查后，未来 Next.js 接入任务才可正式消费。
- 本任务不是正式页面、Header、Mega Menu、Footer 或视觉开发任务。
- 2026-07-24 的业务参考调整使已完成的 Schema 2.0.0 制造服务模型不再是最终合同；已验证的 REST、安全、UUID、模块、确定性和 cleanup 技术基础保留，但必须迁移到 Forest-aligned Schema 3.0.0 产品模型后重新审查。

## 目标

- A1：冻结英语公开 page/error/reference/collection/navigation/route-manifest 和七类模块的版本化 Schema。
- A1：为模块实例生成并持久化稳定 ID 与 per-module `schemaVersion`，证明重排保持 ID、复制生成新 ID。
- A1：把 `data_table` 从 textarea 占位形状迁移为结构化列、行和单元格模型，交付 inventory、dry-run、歧义处理、幂等、回滚与隔离验证。
- A2：实现经代表页面证明必要的最小 `resolve`、`collection`、`navigation` 和 `route-manifest` REST 端点。
- A2：建立 Home、Service、Case Study、Material 四类可清理、英语、确定性 Fixture。
- A2：完成发布状态、路由、引用、媒体、Schema、错误、安全和兼容性正负契约测试。
- A2：完成 REST-first 基准、Fixture 零残留证明和不可变前端交接包。
- A3：冻结 Forest-aligned 产品、市场、支持、下载、公司与联系目录；RapidDirect 仅保留技术/视觉参考职责。
- A3：将公开内容模型从 `service/industry/material/surface_finish/case_study/testimonial` 迁移为 `product/market/reference/support_article/download`，原生 `page/post` 分别承载 hub/company/contact 与新闻内容。
- A3：把材料和表面处理从独立公开页面类型改为产品结构化规格/选项；增加产品分类、系列、安装类型、支持主题和文档类型。
- A3：更新 SCF 字段、关系、Schema 3.0.0、REST allowlist、Fixture、Golden、benchmark、cleanup、文档和前端只读消费交接。

## 非目标

- 不开发 Next.js CMS client、adapter、route、页面、组件、Header、Mega Menu、Footer、首页或视觉系统。
- 不实现 Preview/Draft Mode、Webhook、生产缓存失效、询盘、上传、邮件/CRM、部署、DNS 或生产配置。
- 不安装或启用 WPML、ACFML、Yoast、WPGraphQL 或新的页面构建器。
- 不实现非英语内容、语言入口、翻译关联、hreflang、RTL 或多语言 SEO。
- 不修改 WordPress Core、SCF 第三方插件、主题或真实业务内容。
- 不因为推测性前端便利新增模板专属端点。
- 不复制 Forest 品牌词、产品名称、型号、文案或图片；其目录只作为信息架构参考。

## 执行批次与门禁

### A1 — Schema 与迁移基础

- 先备份并验证本地数据库、GDHE 插件和相关配置；迁移验证优先使用隔离或可恢复环境。
- 产出当前英语内容与 legacy `data_table` inventory 和无写入 dry-run。
- 冻结 API/page/error/reference 和七模块机器可读 Schema、版本与兼容策略。
- 实现稳定 module instance ID、per-module version 和结构化 `data_table`。
- 证明 apply、重复 apply、回滚、模块重排、复制和歧义值 fail-closed。
- A1 通过 planner 中间验证后才能进入 A2；A1 不授权 frontend 正式消费。

### A2 — 公开 API、Fixture 与交接

- 实现最小公开 REST 端点和一致错误 envelope。
- 创建四类临时 Fixture 与完整正负契约矩阵。
- 生成 golden JSON、JSON Schema 校验、兼容性与安全证据。
- 按既定门槛执行 REST benchmark；触发门槛时停止直接扩展并提出独立 WPGraphQL PoC/ADR，不在本任务直接采用 GraphQL。
- 清理 Fixture、附件、上传、修订、postmeta、term relationship、临时用户和临时进程，证明零残留。
- 生成带固定 contract version、fixture revision、Schema/golden checksums 和实现 commit/branch 占位的不可变交接包。

### A3 — Forest-aligned 产品目录与内容模型修订

- 权威契约为 `TASKS/ARTIFACTS/TASK-007/FOREST_PRODUCT_MODEL_REVISION.md`。
- 内容 Schema 从 `2.0.0` 升级到 `3.0.0`；保留 `/gdhe/v1` 传输端点与既有 UUIDv4、safeHtml、canonical path、错误/header 和 fail-closed 技术边界。
- 先 inventory Schema 2 的真实内容、terms、relations 和 routes；零真实记录时允许 no-content migration，非零时必须 dry-run、歧义报告、快照、幂等 apply 与精确 rollback。
- 以 Home、三条 Product、Market、Reference、Support Article、Download 和发布状态/合同负例替换制造业 Fixture。
- 重新冻结 Schema 3 Golden、跨页 collection total、关系、下载文件、两轮 determinism、benchmark 和零残留。
- A3 CMS checkpoint PASS 后只放行 frontend read-only re-audit；其后必须重新进行独立 adversarial review。

## 交付物

- `cms/wp-content/plugins/gdhe-site/**`：版本化 Schema、迁移、归一化、REST、测试与 Fixture/cleanup 实现。
- `docs/cms/**`：公开 API、Schema、迁移/回滚、运行、测试、benchmark 和交接文档。
- `TASKS/ARTIFACTS/TASK-007/A1_CHECKPOINT.md`。
- `TASKS/ARTIFACTS/TASK-007/CONTRACT_AND_HANDOFF_MANIFEST.md`。
- `TASKS/ARTIFACTS/TASK-007/EXECUTION_REPORT.md`。
- `TASKS/ARTIFACTS/TASK-007/TEST_OR_VALIDATION_LOG.md`。
- `TASKS/ARTIFACTS/TASK-007/DIFF_OR_OUTPUT_SUMMARY.md`。
- `TASKS/ARTIFACTS/TASK-007/ADVERSARIAL_REVIEW_REPORT.md`。
- `TASKS/ARTIFACTS/TASK-007/FOREST_PRODUCT_MODEL_REVISION.md`。
- 必要时更新根 `README.md` 的本地验证和 API 使用方式。

## 验收标准

- A1 的 Schema、module ID/version、structured `data_table`、dry-run、歧义处理、幂等和回滚均有机器可验证证据。
- 四类 Fixture 的匿名 published resolve 均返回 200 并通过冻结 Schema；draft/private/pending/trash/nonexistent 不进入匿名公开输出。
- `resolve` 缺失或未发布路径返回真实 404；非法 locale/path/filter/sort/page/schema 返回稳定 400 类错误。
- collection、navigation 和 route manifest 只含允许的已发布英语公开数据，排序和分页确定。
- 任何匿名响应均不泄漏通用 `acf`、`meta`、内部 settings、用户、凭据、插件配置或编辑备注。
- 模块缺失/重复/非法 ID、未知 type/version、无效引用/媒体和非法表格均 fail closed。
- 兼容、迁移、回滚、安全、PHP/JSON、WordPress/SCF checksum、数据库、benchmark 与治理验证通过。
- Fixture cleanup 后 posts、revisions、postmeta、terms、attachments、uploads、temporary users/processes 均为零残留。
- 最终交接包包含固定 API/Schema/module 版本、Fixture revision、Schema/golden checksums、端点与错误矩阵、benchmark、清理和 review 结论。
- adversarial review 最终为 PASS，P0/P1/P2 均为 0；在此之前不得启动 Next.js 正式消费。
- Schema 3 的 public types、taxonomies、template keys、relationship keys 和 canonical directory 必须与 Forest-aligned revision contract 一致，不得继续输出制造服务类型。
- Product 必须有结构化型号/系列、features、technical specifications、article numbers、finishes/options、installation/control/compatibility、markets、references、downloads 和 CTA authoring contract。
- Market、Reference、Support Article 和 Download 必须有独立、可在 `wp-admin` 编辑的字段与关系，并通过公开 DTO Schema。
- Schema 2 旧内容处理必须可 inventory、dry-run、fail-closed、幂等和精确回滚；不得静默丢失 `material`、`surface_finish` 或 `testimonial`。
- A3 完成后旧 Round 2 PASS 只作为技术回归基线，不能替代新的 final adversarial PASS。

## 允许修改范围

- `cms/wp-content/plugins/gdhe-site/**`
- `docs/cms/**`
- `TASKS/ARTIFACTS/TASK-007/**`
- `LANES/wordpress_cms/**`
- `LANES/frontend/**`，仅限只读消费审计记录和 worklog，不得修改 `frontend/**`
- `.local/backups/TASK-007/**`，仅在 planner 先更新精确 lane scope、完成备份计划并验证路径后
- 当前任务所需的 `PROJECT/**`、`TASKS/**`、`LANES/**` 治理记录
- 根 `README.md`，仅在本任务改变本地 API 使用/验证方式时

## 禁止修改范围

- `frontend/**`
- WordPress Core 文件
- `cms/wp-content/plugins/secure-custom-fields/**`
- WordPress 主题和第三方插件
- 与本任务无关的产品、部署、DNS、邮件和外部系统
- 真实业务内容；Fixture 只能使用带 TASK-007 marker 的合成临时数据
- Git 提交、推送、合并或部署，除非后续收到精确正式交付口令

## 约束

- WordPress `wp-admin` 继续作为唯一最终内容管理后台；GDHE 自有插件是版本化行为事实源。
- 参考权威分工固定为：RapidDirect 负责技术/视觉/交互/SEO/转化参考；Forest Group 负责目录/产品信息组织参考；GDHE 真实资料负责最终内容。
- 公开协议保持 REST-first；前端未来只能消费 GDHE 归一化 DTO，不依赖 Core REST、SCF、post meta 或数据库形状。
- 当前 locale 仅为 `en`；其他 locale 必须显式报错，不得静默回退英语。
- 数据库/内容写入前必须有已验证备份、初始计数、唯一 marker、cleanup 和恢复方案。
- 不得把手工 happy path、单一 endpoint 或 Schema 文档当作任务完成。
- A1 与 A2 均在同一任务内执行；A1 checkpoint 不等于用户验收或前端消费许可。

## 假设和待确认事项

- 默认采用“一个 TASK、两个批次”的方案，避免 A1 完成后误认为可以启动前端；如用户希望 A1/A2 分成两个正式 TASK，需要在需求确认前改卡。
- 默认只在当前本地 WordPress 环境或可恢复副本上创建临时 Fixture，不触碰生产或真实业务内容。
- `wordpress_cms` 当前 lane scope 只含 `.local/backups/TASK-004/**`；正式派发前必须受控扩展为 TASK-007 精确备份路径。

## 验证计划

- 切换/开始前：工作树、branch、remote refs、WordPress/PHP/MySQL/SCF/GDHE 版本和 checksum 复核。
- 备份：SQL、插件/config、版本清单、checksum、恢复可读性和初始对象计数。
- A1：PHP lint、JSON parse/Schema、migration inventory/dry-run/apply/idempotence/rollback、stable ID/reorder/copy 和 table negative matrix。
- A2：真实 WP REST 请求、四 Fixture golden validation、collection/navigation/manifest、HTTP/错误矩阵、匿名泄漏扫描、capability separation。
- Benchmark：四 Fixture 预热后各 200 次、并发 20，记录请求图、origin 请求数、payload、p50/p95 和错误率。
- Cleanup：数据库对象、关系、meta、revision、attachment/upload、user/process 与 marker 全量零残留。
- 最终：WordPress/SCF checksum、数据库 check、项目治理、严格 lane audit、message validation、scope diff、secret scan、`git diff --check`。

## 文档影响

`RESOLVED`：`docs/cms/**`、Schema 3 handoff、P1 修订证据和前端只读消费复核均已同步到 Forest-aligned A3 产品模型。

## README 影响

`UPDATED`：根 `README.md` 的代表 resolve 示例已更新为 `schema=3.0.0`，并明确公开类型与内部 `site_settings` 边界。

## 分支和 Worktree

- 分支：`codex/TASK-007-english-api-dto-fixture`
- Worktree：当前共享项目工作区

## 当前状态

`CLOSED / MERGED`。用户已于 `2026-07-24T15:16:22Z` 使用精确口令验收；正式提交 `8a3e4f26d148e64d301a508e69c1e4a28ad3b9e9` 已推送任务分支、快进集成并推送到远端 `main`，最终本地/远端 divergence 为 `0/0`。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、TASK-005 两份边界 artifact 和架构契约第 14 节。

## 下一步

任务已归档。后续前端消费必须在独立任务中按冻结 Schema 和 handoff checksum 小步实施，不把 TASK-007 的 CMS/API 完成状态误称为可浏览网站完成。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结 A3 Forest-aligned contract、分批门禁、综合验证和用户汇报 | `PROJECT/**`、`TASKS/**`、`LANES/**`、必要时 `README.md` | task state、A3 gate、planner summary | CLOSED / MERGED |
| wordpress_cms | A3 Schema 3 产品模型、迁移、REST/Fixture/Golden/benchmark/cleanup 与 CMS 文档 | GDHE plugin、`docs/cms/**`、TASK-007 artifacts、lane records、受控 backup path | implementation、A3 evidence、refrozen handoff | migration P1 and two P2 revision complete; response acked |
| frontend | A3 后只读审计 Schema 3 是否可作为 server-only consumer contract；不写产品代码 | TASK-007 artifacts、lane records | revised consumer handoff audit | narrow re-audit PASS; P0=0, P1=0, P2=3 deferred |
| adversarial_reviewer | A3 后独立审查迁移/回滚、公开安全、产品合同、benchmark、cleanup 和前端消费门 | review report、reviewer lane records | new PASS/FAIL/BLOCKED review | A3 Round 2 final PASS; P0=0, P1=0, P2=0 |

## Messages

- `MSG-TASK-007-WORDPRESS-A1-SCHEMA-MIGRATION`：已创建、validate/dry-run 通过、发送并由 CMS lane ack 后移动到 `done`。
- `MSG-TASK-007-WORDPRESS-A1-SCHEMA-MIGRATION-RESPONSE`：A1 execution response 已返回、validate 通过并由 Planner ack 移动到 `done`。
- `MSG-TASK-007-WORDPRESS-A2-PUBLIC-API-FIXTURE-HANDOFF`：已发送并由 CMS lane ack。
- `MSG-TASK-007-WORDPRESS-A2-PUBLIC-API-FIXTURE-HANDOFF-RESPONSE`：首版 A2 response 已由 Planner ack；独立 checkpoint 因 Golden checksum 漂移进入窄修订。
- `MSG-TASK-007-FRONTEND-READONLY-CONSUMER-AUDIT-RESPONSE`：已由 Planner ack；verdict `FAIL`，P0=1、P1=5、P2=3。
- `MSG-TASK-007-WORDPRESS-COLLECTION-TOTAL-INVARIANCE-R3-RESPONSE`：已由 Planner ack；跨页 totals `3/3/3`、items `2/1/0`、两轮 13/13 hashes 与 cleanup 通过。
- `MSG-TASK-007-FRONTEND-COLLECTION-TOTAL-READAUDIT-R3-RESPONSE`：已由 Planner ack；最终 consumer audit `PASS`，P0=0、P1=0、P2=1 deferred。
- `MSG-TASK-007-WORDPRESS-COLLECTION-ELIGIBILITY-R4-RESPONSE`：已由 Planner ack；三类 collection 不合格候选排除、resolve parity、两轮 determinism 与零残留均通过。
- `MSG-TASK-007-ADVERSARIAL-REVIEW-R2-RESPONSE-FINAL`：已由 Planner ack；最终 `PASS`，P0=0、P1=0、P2=0。审查中短暂生成的三个 `.pyc` 已由 Planner 精确清理并由 reviewer 复核零残留；早期临时 FAIL response 在 Planner ack 前已标记 superseded 并保留审计历史。
- `MSG-TASK-007-WORDPRESS-FOREST-PRODUCT-MODEL-A3`：已 validate、dry-run、通过 Codex thread bridge 派发至注册的 `wordpress_cms` session；正在等待 ack、备份门和 execution response。
- `MSG-TASK-007-WORDPRESS-FOREST-PRODUCT-MODEL-A3-RESPONSE`：已 validate 并由 Planner ack；A3 execution PASS，独立 checkpoint 也已 PASS。
- `MSG-TASK-007-FRONTEND-FOREST-SCHEMA3-READAUDIT`：已 validate、dry-run 并通过 Codex thread bridge 派发到注册的 frontend session；只读审计进行中。
- `MSG-TASK-007-FRONTEND-FOREST-SCHEMA3-READAUDIT-RESPONSE`：已 validate 并由 Planner ack；verdict `FAIL`，P0=0、P1=2、P2=3。
- `MSG-TASK-007-WORDPRESS-SCHEMA3-CONSUMER-P1-R1`：已 validate、dry-run 并通过 Codex thread bridge 派发；只修两个 CMS P1。
- `MSG-TASK-007-WORDPRESS-SCHEMA3-CONSUMER-P1-R1-RESPONSE`：已 validate 并由 Planner ack；两个 P1 execution PASS，independent checkpoint 也已 PASS。
- `MSG-TASK-007-FRONTEND-SCHEMA3-P1-READAUDIT-R2-RESPONSE`：已 validate 并由 Planner ack；narrow re-audit `PASS`，P0=0、P1=0，三个 P2 保持 deferred。
- `MSG-TASK-007-GOVERNANCE-README-SCHEMA3-SYNC-RESPONSE`：已 validate 并由 Planner ack；根 README Schema 3 示例和公开/内部类型边界同步 `PASS`。
- `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R1`：已 validate、dry-run 并通过 Codex thread bridge 派发到注册 reviewer session；等待独立 verdict。
- `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R1-RESPONSE`：已 validate 并由 Planner ack；verdict `FAIL`，P0=0、P1=1、P2=2。
- `MSG-TASK-007-WORDPRESS-FOREST-SCHEMA3-REVIEW-R1-FIX`：已 validate、dry-run 并通过 Codex thread bridge 派发；仅关闭一个 migration P1 与两个 P2。
- `MSG-TASK-007-WORDPRESS-FOREST-SCHEMA3-REVIEW-R1-FIX-RESPONSE`：已 validate 并由 Planner ack；execution `PASS`，Planner independent checkpoint 也已 `PASS`。
- `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R2`：已 validate、dry-run 并通过 Codex thread bridge 派发；等待 configured final-round verdict。
- `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R2-RESPONSE`：已 validate 并由 Planner ack；final `PASS`，P0=0、P1=0、P2=0。

## 执行记录

- 2026-07-23T08:27:33Z：TASK-006 远端正式交付已复核；创建 TASK-007 intake 与独立任务分支。
- 2026-07-23T08:37:24Z：用户精确确认 TASK-007 需求；状态转为 `READY`，只准备 A1 scope 与 dispatch。
- 2026-07-23T08:39:28Z：A1 message dry-run 命中注册 CMS 会话；live prompt 已发送且目标 thread 为 active，任务转为 `IN_PROGRESS`。
- 2026-07-23T09:10:53Z：停止恢复记录已写入。A1 备份与核心迁移闭环已完成，四份 A1 artifacts 已生成；CMS lane 正在完成 Schema 版本一致性回归和 execution response。A2、frontend audit、review 与 Git 交付均未开始。
- 2026-07-23T09:11:52Z：A1 execution response 返回并获 Planner 确认；执行 lane 报告最终回归通过。恢复后的唯一下一步是 Planner 独立 A1 checkpoint 验证。
- 2026-07-23T09:30:20Z：Planner 完成只读线程交互诊断并记录 stop-hook 恢复入口。消息队列为空，A1 response 与 stop-recovery 均在 `done`，CMS thread 为 `idle`；未修改 TASK-007 产品实现或放行 A2。唯一下一步仍是 Planner 独立 A1 checkpoint 验证。
- 2026-07-23T14:48:53Z：Planner 独立 A1 checkpoint 验证 PASS；备份、静态检查、真实运行时迁移、独立零残留查询、Core/SCF/DB、范围和治理证据全部通过。只放行受控 A2 dispatch，frontend consumer audit 继续阻塞。
- 2026-07-24T02:01:26Z：Planner 接收并确认首版 A2 response；静态、Schema、版本、checksum 和数据库检查 PASS，但第二轮 Fixture 生命周期使 9 份 Golden SHA-256 全部变化。根因是公开 DTO/Schema 暴露 WordPress 自增 database IDs，与 handoff 声明冲突。Planner Fixture 已 cleanup，A2 仅退回确定性 ID/Golden 窄修订。
- 2026-07-24T02:20:17Z：A2 P1 修订 response 已确认。Planner 独立两轮确定性测试使用不同数据库 IDs 但得到完全相同的 9 份 Golden；独立 800 请求 benchmark 零错误；最终 Fixture、进程与数据库零残留。Handoff/plugin/Core/SCF/DB/范围/治理验证 PASS；README 同步完成，只放行 frontend read-only audit。
- 2026-07-24T02:36:14Z：frontend read-only audit response 已确认；UUID、checksum、REST 隔离通过，但 HTML 安全、严格模块子合同、canonical path、error/cache/header 与 collection determinism 不足，verdict FAIL。GraphQL threshold 只转为独立后续 PoC/ADR candidate；本任务先修 CMS 合同并 re-audit。
- 2026-07-24T04:10:09Z：CMS R2 response 已确认；Planner 独立重跑 18 Schema、13 Golden 两轮确定性、safeHtml 恶意样本、10 error、8 module、header/path/collection、checksum、Core/SCF/DB 与零残留并 PASS。只放行 frontend read-only re-audit。
- 2026-07-24T04:44:00Z：frontend re-audit R2 response 已确认；verdict FAIL，P0=0、P1=1、P2=1。唯一阻断是 terminal empty page 的 collection total 从 3 变为 0；转为单 finding CMS 修订。
- 2026-07-24T04:55:24Z：CMS 单项修订与 frontend R3 单项复核均已确认；三页 totals `3/3/3`、items `2/1/0`，runtime invariant 与 46/46 frozen checksums 通过。最终 consumer audit PASS（P0=0、P1=0、P2=1 deferred）；只放行独立 adversarial review。
- 2026-07-24T05:05:29Z：Adversarial review Round 1 response 已确认；verdict FAIL，P0=0、P1=1、P2=1。P1 要求 collection 只计入并返回通过完整公开内容合同的 eligible records；P2 两个当前事实入口已同步。状态恢复为 NEEDS_REVISION，只允许 P1 修订与 Round 2。
- 2026-07-24T05:23:30Z：CMS R4 response 已确认；Planner 独立双生命周期重跑 PASS。unknown template、invalid module、invalid canonical path 三类已发布候选均被排除，totals `3/3/3`、items `2/1/0`、所有 item 可匿名 resolve，13/13 Golden 哈希一致且数据库 ID 改变；冻结证据恢复后 checksum、数据库零残留与治理验证再次 PASS。状态转为 UNDER_REVIEW，只放行 Round 2。
- 2026-07-24T05:36:01Z：Round 2 final response 已确认；canonical verdict `PASS`，P0=0、P1=0、P2=0。Reviewer 生成的三个临时 bytecode 已在同一 review turn 由 Planner 精确清理，当前无 `.pyc`/`__pycache__` 残留；消息与 strict lane audit PASS。Planner Final Summary 已生成，进入 final validation。
- 2026-07-24T07:40:57Z：首次 checked `prepare-awaiting-user` 通过；随后为同步人类可读 task/project/board 视图执行受控 reopen，不改变交付物或 review verdict。
- 2026-07-24T07:41:58Z：当前只进行叙述同步、final validation 与最终 checked `prepare-awaiting-user`；最终成功后保持 `NOT_ACCEPTED` / `DIRTY` 并等待用户。
- 2026-07-24T09:15:22Z：用户明确确认将 TASK-007 退回修订，业务目录参考从 RapidDirect 制造服务模型切换为 Forest Group 产品模型；受控 reopen 将状态从 AWAITING_USER 转为 NEEDS_REVISION。Schema 2 技术 PASS 历史保留，但不再允许正式交付。
- 2026-07-24T09:21:50Z：A3 revision request 已 validate/dry-run 并通过 Codex thread bridge 派发到注册 `wordpress_cms` session；目标 thread 已进入 active，正按先 inventory/backup、后 mutation 的门禁执行。
- 2026-07-24T10:12:34Z：A3 execution response 已确认；Planner 独立重跑两轮 determinism、1,600 请求 benchmark、backup/checksum、PHP/JSON、Core/SCF/DB、inventory、residue、handoff 和治理检查并 PASS。只放行 frontend read-only re-audit。
- 2026-07-24T10:14:36Z：Schema 3 frontend read-only consumer re-audit 已 validate/dry-run 并通过 Codex thread bridge 派发；`frontend/**` 产品代码保持只读。
- 2026-07-24T10:25:54Z：frontend audit response 已确认；两个 P1 经 Planner 只读复核成立。任务保持 NEEDS_REVISION，只允许 type/template fail-closed 与完整 Schema checksum closure 的 CMS 窄修订。
- 2026-07-24T10:28:57Z：两个 P1 的 CMS revision request 已 validate/dry-run 并派发到注册 `wordpress_cms` session；P2、frontend、GraphQL 和 Git 均保持阻塞。
- 2026-07-24T10:38:57Z：P1 revision response 已确认；Planner 独立重跑两轮 determinism、known mismatch 四处排除、19-file Schema closure、handoff、Core/SCF/DB、零残留与治理验证并 PASS。只放行 narrow frontend re-audit。
- 2026-07-24T10:49:23Z：narrow frontend re-audit 与 README sync responses 均已确认；consumer gate `PASS`，文档影响为 `RESOLVED`、README 影响为 `UPDATED`。下一门为 fresh validation 后的新 A3 adversarial review。
- 2026-07-24T10:55:51Z：fresh pre-review validation `PASS`；任务转为 `UNDER_REVIEW`，新的 A3 Round 1 review 已受控派发。未授权前端、GraphQL、验收或 Git 交付。
- 2026-07-24T11:03:37Z：A3 Round 1 response 已确认；verdict `FAIL`，P0=0、P1=1、P2=2。`reopen` helper 因仅接受 `AWAITING_USER` 而在写入前安全拒绝；Planner 将真实状态同步为 `NEEDS_REVISION` 并记录窄恢复入口。
- 2026-07-24T11:05:30Z：Round 1 narrow revision 已派发到 `wordpress_cms`；只允许 migration fail-closed/runtime proof、native Post/非根 Page positive 和 HTTPS video Schema 修订。
- 2026-07-24T11:18:36Z：窄修订 response 已确认；Planner 独立重跑 migration runtime、fresh Fixture/contract/Schema/cleanup，并验证 15/15 Golden 双轮一致、61/61 checksums、Core/SCF/DB 与零残留均 PASS。任务转为 `UNDER_REVIEW`，只放行 A3 Round 2。
- 2026-07-24T11:20:10Z：A3 Round 2 request 已 validate/dry-run 并派发到注册 reviewer session；等待最终结论。
- 2026-07-24T11:26:00Z：A3 Round 2 final response 已确认，canonical `PASS`，P0=0、P1=0、P2=0。Planner final validation 对 61 handoff、15 Golden、19 Schema、migration、Core/SCF/DB、backup、零残留、scope 与治理全部 PASS；Schema 3 Planner Final Summary 已重写。

## Execution Artifacts

- `TASKS/ARTIFACTS/TASK-007/A1_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-007/A1_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-007/A1_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-007/A1_DIFF_OR_OUTPUT_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-007/A3_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-007/A3_FRONTEND_CONSUMER_AUDIT.md`
- `TASKS/ARTIFACTS/TASK-007/A3_P1_REVISION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-007/A3_P1_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-007/A3_FRONTEND_CONSUMER_REAUDIT_R2.md`
- `TASKS/ARTIFACTS/TASK-007/A3_PRE_REVIEW_VALIDATION.md`
- `TASKS/ARTIFACTS/TASK-007/A3_REVIEW_R1_REVISION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-007/A3_REVIEW_R1_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-007/A3_FINAL_VALIDATION.md`

## Adversarial Review

- Round 1：`FAIL`，P0=0、P1=1、P2=1；canonical report 中完整历史保留。
- Round 2 final：`PASS`，P0=0、P1=0、P2=0；仅代表 Schema 2 技术/业务合同，因用户 A3 业务模型修订而降级为回归基线。
- A3：CMS implementation 与 Planner checkpoint 已 PASS；新的 adversarial review 尚未开始。
- A3 frontend consumer audit：首轮 `FAIL`，P0=0、P1=2、P2=3；两个 P1 经 CMS revision、Planner checkpoint 和 narrow re-audit 后关闭。narrow re-audit 为 `PASS`，P0=0、P1=0、P2=3 deferred。
- A3 adversarial Round 1：`FAIL`，P0=0、P1=1、P2=2；主体合同通过，只退回 migration fail-closed/精确验证、native Post/非根 Page 正例和 HTTPS video machine contract。
- A3 Round 1 revision：一个 P1 与两个 P2 已通过 CMS execution 和 Planner independent checkpoint；Round 2 尚未开始。
- A3 adversarial Round 2 final：`PASS`，P0=0、P1=0、P2=0；Planner final validation allowed。

## Validation Evidence

- A1：备份、18 份 Schema、迁移 inventory/dry-run/apply/idempotence/exact rollback、stable module IDs、结构化 data table 与零残留均有独立验证。
- A2：匿名 REST、严格 DTO、UUIDv4、safeHtml、errors/headers、13 Golden、两轮 determinism、collection total、800 请求 benchmark、cleanup、Core/SCF/DB 与 frontend consumer audit 均有运行时或独立只读证据。
- Schema 3 implementation、frontend consumer gate 与文档同步已 PASS；Round 1 指定的 migration runtime、15 Golden 正例和 HTTPS video machine contract 修订已通过 Planner independent checkpoint。
- A3 independent review 已完成 Round 1；一个 P1 与两个 P2已修订，但 final validation 仍须等待 Round 2 `PASS`。
- A3 Round 2 final 与 Planner final validation 均为 PASS；任务可进入 checked `AWAITING_USER` 准备，但尚未用户验收或 Git 交付。

## Planner Final Summary

- `TASKS/ARTIFACTS/TASK-007/PLANNER_SUMMARY.md` 已重写为 Forest-aligned Schema 3 最终摘要。

## User Acceptance

`NOT_ACCEPTED`

## Recovery Entry 2026-07-24T07:41:58Z

- Reason: Synchronize human-readable task, project and board narrative after checked AWAITING_USER transition; no deliverable or verdict change.
- Next step: Synchronize current narrative, rerun final validation, then run checked prepare-awaiting-user again.

## Recovery Entry 2026-07-24T09:15:22Z

- Reason: User changed the authoritative business reference: retain RapidDirect only for technical and visual implementation, and revise CMS directory/content model to Forest Group product logic before acceptance.
- Next step: Freeze the Forest-aligned product, market, support, download, company and contact directory contract; revise TASK-007 scope and dispatch a narrow wordpress_cms schema/API/fixture migration revision.

## Recovery Entry 2026-07-24T11:03:37Z

- Reason: Forest-aligned Schema 3 adversarial Round 1 returned FAIL with P0=0, P1=1 and P2=2.
- Findings: migration apply does not fully validate public path/template/remapped relations or clean an early-failure backup marker; no non-zero A3 apply/idempotence/exact-rollback runtime proof; native Post/non-root Page positive and HTTPS-only video machine Schema are missing.
- Transition: `task_transition.py reopen` was invoked but safely refused before mutation because the helper only accepts `AWAITING_USER`; Planner synchronized the truthful state from `UNDER_REVIEW` to `NEEDS_REVISION`.
- Next step: dispatch only these three narrow corrections to `wordpress_cms`, run fresh validation, then request A3 Round 2 review.

## Recovery Entry 2026-07-24T11:29:16Z

- Reason: Synchronize human-readable TASK/PROJECT/BOARD views and remove the helper-generated trailing whitespace after the checked AWAITING_USER transition; deliverables and final PASS remain unchanged.
- Next step: Apply narrative-only synchronization, rerun governance/diff validation, then run checked prepare-awaiting-user again.
