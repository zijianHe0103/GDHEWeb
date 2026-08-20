# TASK-004 英语版 WordPress CMS Schema + SCF + GDHE REST API 基础
accepted_at: 2026-07-23T03:26:54Z

task_id: TASK-004
status: CLOSED
owner_lane: planner
assigned_lanes: [wordpress_cms]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-004
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-23T02:36:12Z
git_status: PUSHED
document_impact: RESOLVED
project_type: software

## 原始请求

> 创建 TASK-004：英语版 WordPress CMS Schema + SCF + GDHE REST API 基础

## 结构化理解

- 当前只建设并发布默认英语站，公开路径为 `/`。
- WordPress `wp-admin` 继续作为唯一内容管理后台；Next.js 继续作为独立公开前端。
- 使用 WordPress.org 官方 Secure Custom Fields（SCF）提供结构化字段编辑体验，不采购或安装 ACF Pro。
- 通过 GDHE 自有 `gdhe-site` 插件以 PHP 注册 CPT、Taxonomy、权限、Schema 版本与最小只读 REST 边界；不修改 WordPress Core、第三方插件或主题。
- WPML、ACFML 和其他八种语言推迟到英语站稳定运行三个月后的独立任务；本任务只保留稳定字段、DTO 和语言适配接口，不生成未发布语言的公开链接。
- 安装 SCF 或写入 CMS 前必须完成数据库与插件状态备份，记录恢复步骤，并验证回滚边界。

## 目标

- 核实执行日 SCF 的官方稳定版本、WordPress/PHP 兼容性、来源和 GPL 许可，然后在本地 CMS 安装并固定可重现的版本证据。
- 创建可审查的 `gdhe-site` 插件骨架，所有 GDHE 业务注册逻辑都在自有代码中。
- 注册英语版首期内容类型、分类法和稳定字段键，确保编辑人员可在 `wp-admin` 中管理业务内容。
- 使用 SCF Local JSON 或等效可版本化机制导出 Field Groups，防止只存数据库的字段漂移。
- 为 Core REST 开放必要的公开 CPT/Taxonomy，建立 `/wp-json/gdhe/v1` 命名空间、Schema 版本和最小只读端点。
- 用一个可回滚的英语 Service fixture 验证编辑、草稿、修订、预览、发布、REST 暴露和删除清理链路。
- 更新已接受的架构记录，明确 SCF 取代 ACF Pro 作为当前字段方案，WPML/ACFML 在英语站稳定三个月后再采购、PoC 和启用。

## 非目标

- 不购买、安装或配置 WPML、ACFML、Polylang、ACF/ACF Pro、WPGraphQL 或任何机器翻译服务。
- 不创建法语、德语、西班牙语、简体中文、阿拉伯语、印地语、日语或葡萄牙语内容、URL、语言菜单或 hreflang。
- 不开发正式首页、Header、Mega Menu、Footer、视觉系统、页面模板或动画。
- 不实现完整 `/resolve`、`/collection`、`/navigation`、`/route-manifest`、preview、Webhook、缓存失效或 Next.js 数据消费层；它们属于后续 API/Fixture 任务。
- 不实现询盘、客户文件上传、邮件、CRM、对象存储、部署或域名/CDN。
- 不修改 WordPress Core、第三方 SCF 插件源码、主题、真实业务内容、用户或凭据。
- 不把 SCF 运行时代码、SQL 备份、uploads、cache、logs 或机密配置纳入 Git。

## 交付物

- `cms/wp-content/plugins/gdhe-site/`：GDHE 自有 WordPress 插件、注册逻辑、字段定义/Local JSON 和最小 REST 基础。
- `docs/cms/`：本地安装、CMS 内容模型、字段版本、备份/回滚、编辑和验证说明。
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`：记录 SCF 与英语优先决策，并明确对 ADR-004 中 ACF Pro/Polylang Pro 建议的取代范围。
- `TASKS/ARTIFACTS/TASK-004/`：备份证据、执行报告、验证日志、差异摘要、对抗审查与 planner summary。
- 同步后的 `PROJECT/STATE.md`、`TASKS/BOARD.md`、`PROJECT/ACTIVITY.md`、架构索引与相关 Lane worklog。

## 验收标准

- SCF 来自 WordPress.org/GitHub 官方渠道，执行日版本、包校验值、WordPress/PHP 兼容性和 GPL 证据已记录；不存在 ACF/ACF Pro 并装。
- 任何 CMS 写操作前都已创建可识别、不入库的数据库备份和插件清单快照，并通过只读完整性检查；回滚命令不在非故障现场破坏性运行。
- `gdhe-site` 以代码注册 `service`、`industry`、`material`、`surface_finish`、`case_study`、`testimonial` 与非公开 `site_settings`；原生 `page`/`post` 保留。
- 以代码注册 `service_family`、`manufacturing_process`、`material_family`、`finish_family`；需要公开读取的类型启用 `show_in_rest`，内部类型保持非公开。
- 共享字段键至少覆盖 `schema_version`、`template_key`、summary、Hero、主/次 CTA、媒体引用、关系和首期受控模块；字段组可通过 Local JSON 或等效代码定义在全新环境重建。
- 首期受控模块只包含建立 Schema 和英语 Service fixture 所需的 `hero`、`rich_text`、`card_grid`、`split_media`、`accordion`、`data_table`、`cta_banner`；不把 SCF 变成无限页面生成器。
- `wp-admin` 可创建和编辑上述类型，字段校验、autosave/revision/preview 不破坏字段值，英语 Service fixture 能完成 Draft 到 Publish 链路。
- 公开 REST 只返回 `publish` 内容和明确允许的字段；草稿、内部 `site_settings`、受保护 meta、用户、凭据和插件配置不向匿名请求暴露。
- `/wp-json/gdhe/v1/schema` 或经任务确认的等效最小只读端点返回稳定 `schemaVersion`、公开类型和英语 locale 能力；完整页面 DTO 与 route resolution 留给 TASK-005。
- 本任务不显示其他语言入口、不输出其他语言 URL/hreflang，不安装 WPML/ACFML；只在 Schema 与 API adapter 边界保留未来 locale 扩展点。
- WordPress Core checksum、PHP lint、WP-CLI 注册/权限 smoke、REST 匿名/认证响应、fixture 清理、完整性、governance/registry/messages/lane audit 和 adversarial review 全部通过。
- Git 差异只包含 GDHE 自有插件、文档和治理记录；没有 WordPress Core、SCF vendor、SQL 备份、uploads、cache、logs、真实 `.env*` 或凭据。

## 允许修改范围

- `cms/wp-content/plugins/gdhe-site/**`
- `cms/wp-content/plugins/secure-custom-fields/**`（仅限从已验证的 WordPress 官方包安装/激活 SCF 运行时；不得修改源码或纳入 Git）
- `docs/cms/**`
- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS.md`
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `TASKS/ACTIVE/TASK-004-english-wordpress-cms-scf-rest-foundation.md`
- `TASKS/ARTIFACTS/TASK-004/**`
- `.local/backups/TASK-004/**`（只用于新建本任务备份、状态快照和校验文件，始终保持 Git 忽略）
- `LANES/planner/worklog.md`
- `LANES/wordpress_cms/worklog.md`
- `LANES/adversarial_reviewer/worklog.md`
- `LANES/registry/events.jsonl`
- `LANES/messages/**`
- `.gitignore`（仅在需要收紧 SCF/本地备份产物忽略边界时）

## 禁止修改范围

- WordPress Core、`wp-config.php`、数据库凭据、管理员账号或主题。
- `cms/wp-content/plugins/secure-custom-fields/**` 与任何第三方插件源码。
- `frontend/**`、正式站点页面、多语言路由、SEO 输出、询盘或部署配置。
- `.local/**` 的跟踪状态；本地备份可写入已忽略路径，但不得纳入 Git。
- RapidDirect 的源码、主题、品牌素材、图片、视频或原文。
- GitHub 仓库设置、默认分支、生产环境、域名、CDN 或外部 SaaS。

## 约束

- 正式执行前必须收到精确口令 `确认 TASK-004 需求并开始执行`。
- 本地 WordPress 是可变运行时；任何安装、激活、创建内容或修改选项前都必须先完成备份和回滚门。
- SCF 只能来自 WordPress.org 官方渠道或 WordPress 官方 GitHub；不使用 nulled、镜像或来源不明的插件包。
- ACF、ACF Pro 与 SCF 不得并装；执行前先读取当前插件清单。
- CPT/Taxonomy 和业务权限由 `gdhe-site` 代码注册，不使用 SCF UI 作为唯一事实源。
- 字段键、Schema 版本和 REST 输出一旦被 fixture 消费，后续变更必须有迁移与回滚说明。
- 英语是唯一启用语言；未来语言只保留接口，不创建假链接、假译文或当前页面回首页行为。
- 当前分支只作为 TASK-004 实施与治理记录；未经精确验收口令不生成正式提交，未经单独口令不推送或合并。

## 假设和待确认事项

- 假设本地 WordPress 7.0.2、PHP 8.3.32 和 MySQL 8.4.10 现场仍可用；执行日必须重新验证，不仅依赖历史记录。
- 假设 SCF 可满足 Repeater、Flexible Content、Gallery、Clone、Options Page、REST 和 Local JSON 需求；安装前用官方文档和包内代码重新核实，安装后用 fixture 实测。
- 英语站“稳定三个月”的起算时间为未来生产英语站正式上线并开始监控之日，不是 TASK-004 验收日。
- WPML Multilingual CMS 与 ACFML 的价格、版本和 SCF 兼容性在三个月后的多语言 PoC 任务重新核实；当前不构成采购授权。
- 正式 GDHE 英语品牌文案、产品数据、媒体和 SEO 内容未就绪；本任务只使用明确标记的本地测试 fixture，不伪造正式业务内容。

## 验证计划

- 执行前只读核对 WordPress/PHP/MySQL/SCF 版本、插件清单、Core checksum、Git 边界和当前数据库标识。
- 在 `.local/backups/` 中生成带时间戳的 SQL 备份与插件状态快照，记录校验值、文件大小和只读可解析检查。
- 安装 SCF 并创建 `gdhe-site` 后，运行 WordPress Core checksum、插件 checksum/来源检查、PHP lint 和 WP-CLI 激活状态检查。
- 检查 CPT/Taxonomy/Field Group 注册、capability、rewrite、`show_in_rest`、Schema 版本和 Local JSON 可重建性。
- 用临时英语 Service fixture 执行 `wp-admin`/WP-CLI 等效的 Draft、revision、preview、Publish、匿名 REST、认证 REST 和清理测试。
- 检查 REST 响应的 allowlist，确认草稿、受保护 meta、用户、凭据、内部配置和未启用语言不泄露。
- 在恢复前提下验证开发环境重建路径；不为了“测试回滚”破坏当前现场。
- 运行 governance validate、lane registry validate、lane message validate、lane audit、Git scope/secret 扫描和 `git diff --check`。
- 由 `adversarial_reviewer` 独立审查供应链、备份/回滚、SCF 能力、字段可重建、权限、REST 数据泄露、英语限定和范围边界。

## 文档影响

RESOLVED（需求阶段）：已识别并写入任务范围的文档影响。实施阶段必须创建 ADR-005，更新主架构契约中 ACF Pro/Polylang Pro 的实施建议，并交付 `docs/cms/**` 操作与回滚文档；任一未完成都不得进入最终验收。

## 分支和 Worktree

- 分支：`codex/TASK-004-english-cms-scf-foundation`
- Worktree：当前项目根目录，不创建额外 worktree。

## 当前状态

UNDER_REVIEW

## 恢复入口

先读 `AGENTS.md`、`PROJECT/STATE.md`、`TASKS/BOARD.md`、本任务文件、`docs/architecture/headless-wordpress-nextjs-contract.md` 第 4、5、6、14 节、ADR-004、`.gitignore` 和当前 CMS 只读现场；在任何写操作前先完成备份/回滚门。

## 下一步

Round 2 final adversarial review 已 `PASS`（P0=0、P1=0、P2=0），planner 最终验证与第一次 checked acceptance preparation 已通过；人类可读状态同步后只需最终 checked transition，并等待用户精确验收口令。不提交或推送。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结英语限定、SCF 选型、备份门、REST 边界和文档影响；调度、综合和最终汇报 | `PROJECT/**`、`TASKS/**`、`MEMORY/**`、`LANES/**` | requirement gate、ADR/contract 同步、planner summary | final validation and checked preparation passed; awaiting user after final transition |
| wordpress_cms | 备份本地 CMS，核实/安装 SCF，实现 `gdhe-site`、内容模型、字段和最小 REST，交付执行证据 | `cms/wp-content/plugins/gdhe-site/**`、`docs/cms/**`、`TASKS/ARTIFACTS/TASK-004/**`、`LANES/wordpress_cms/**`；已忽略的本地 CMS/备份只在受控任务内写入 | plugin/schema/REST、backup/rollback evidence、execution report | Round 1 P1 revision complete; response acknowledged |
| adversarial_reviewer | 独立检查 SCF 供应链、数据库安全、字段可重建、REST 暴露、英语限定、回滚和证据 | `TASKS/ARTIFACTS/TASK-004/ADVERSARIAL_REVIEW_REPORT.md`、`LANES/adversarial_reviewer/**` | PASS/FAIL/BLOCKED review | Round 2 final PASS; response acknowledged |

## Messages

- `MSG-TASK-004-WORDPRESS-CMS-SCF-FOUNDATION`：2026-07-23T01:07:30Z 由 planner 排队至 `wordpress_cms`；dry-run 已解析到已注册 session `019f88d0-05f9-7213-abad-e8b1ada660b5`，并于 2026-07-23T01:08:48Z 唤醒该独立会话执行。
- `MSG-TASK-004-WORDPRESS-CMS-SCOPE-BLOCKER`、`...-R2` 与 `...-SCOPE-RESOLUTION-BLOCKED`：执行 lane 在备份门发现并报告 write-scope/隐藏路径匹配问题；planner 已确认所有消息，未发生 CMS 写入。
- `MSG-TASK-004-WORDPRESS-CMS-ABSOLUTE-PATH-CONTINUATION`：planner 将以精确绝对备份路径恢复执行；该路径经当前 hook 的 `path_in_scope` 实测为允许。
- `MSG-TASK-004-WORDPRESS-CMS-SCF-FOUNDATION-RESPONSE`：2026-07-23T01:36:48Z 已由 planner 确认；execution complete，等待 planner 文档同步和独立审查。
- `MSG-TASK-004-WORDPRESS-CMS-STOP-RECOVERY`：2026-07-23T01:38:18Z 已确认，并在本任务与 `PROJECT/STATE.md` 写入 execution-complete 恢复入口。
- `MSG-TASK-004-ADVERSARIAL-REVIEW-R1`：2026-07-23T01:46:14Z dry-run 命中已注册 reviewer session `019f88d0-018d-75e2-8e28-54a904a6bf8c` 并已派发。
- `MSG-TASK-004-ADVERSARIAL-REVIEW-R1-RESPONSE`：2026-07-23T02:00Z 已确认；verdict `FAIL`，P0=0、P1=2、P2=2。
- `MSG-TASK-004-WORDPRESS-CMS-REVISION-R1`：2026-07-23T02:06:43Z dry-run 命中已注册 `wordpress_cms` session `019f88d0-05f9-7213-abad-e8b1ada660b5` 并已派发；消息已由执行 lane 确认，修订处理中。
- `MSG-TASK-004-WORDPRESS-CMS-REVISION-R1-RESPONSE`：2026-07-23T02:21:14Z 已确认；两个 P1 修订及完整回归完成，planner 独立 post-state 复核通过。
- `MSG-TASK-004-ADVERSARIAL-REVIEW-R2`：2026-07-23T02:24:25Z dry-run 命中已注册 reviewer session `019f88d0-018d-75e2-8e28-54a904a6bf8c` 并已派发。
- `MSG-TASK-004-ADVERSARIAL-REVIEW-R2-RESPONSE`：2026-07-23T02:31:20Z 已确认；final verdict `PASS`，P0=0、P1=0、P2=0。
- `MSG-TASK-004-ADVERSARIAL-REVIEW-R2-STOP-RECOVERY`：2026-07-23T02:32:48Z 已处理；PASS 恢复入口与唯一下一步已写入 task/project state。

## 执行记录

- 2026-07-23T00:47:12Z：用户请求创建 TASK-004；planner 只建立需求卡和分支，未安装 SCF、未写入 WordPress/数据库、未开发 REST 或前端。
- 2026-07-23T01:05:33Z：收到精确口令 `确认 TASK-004 需求并开始执行`；需求范围冻结，任务由 `AWAITING_REQUIREMENT_CONFIRMATION` 转为 `READY`。
- 2026-07-23T01:08:48Z：受控 execution request 已派发到已注册的 `wordpress_cms` 独立会话；任务转为 `IN_PROGRESS`。planner 未执行任何 CMS 写操作。
- 2026-07-23T01:14:02Z：执行 lane 的备份写入被注册表门禁拒绝，确认未创建文件。planner 按已确认任务中的备份要求，把 write scope 最小化补充为 `.local/backups/TASK-004/**`；不开放整个 `.local`，也不允许改写既有备份。
- 2026-07-23T01:16:18Z：处理执行 lane 的正式 P1 scope blocker；补充精确 SCF 运行时路径 `cms/wp-content/plugins/secure-custom-fields/**`，仅授权从已验证的官方包安装/激活，不授权源码修改或 Git 跟踪。
- 2026-07-23T01:18:02Z：定位有效钩子的隐藏相对路径规范化缺陷：相对 `.local/...` 被去除前导点后无法匹配，而同一目标的工作区绝对路径可正确规范化并命中 `.local/backups/TASK-004/**`。planner 记录恢复入口并要求执行 lane 仅使用该绝对路径继续；仍未发生 CMS 写入。
- 2026-07-23T01:38:18Z：execution response 与 stop-recovery handoff 均已确认。SCF 6.9.2、`gdhe-site` 0.1.0、英语 Schema 1.0.0、备份与 fixture 清理证据已交付；planner 独立复核 PHP/JSON、Core/SCF checksum、数据库、注册、能力、schema、fixture 零残留、Git 忽略与范围均通过。
- 2026-07-23T01:46:14Z：ADR-005、ADR-004 amendment、架构契约与 planner validation summary 完成；Round 1 adversarial review 已派发，任务转为 `UNDER_REVIEW`。
- 2026-07-23T02:01:07Z：Round 1 FAIL 回执已确认。`task_transition.py reopen` 因 helper 仅允许从 `AWAITING_USER` reopen 而安全拒绝，未改变状态；planner 按 review-fail 语义受控记录恢复入口并把 task/project 从 `UNDER_REVIEW` 同步为 `NEEDS_REVISION`。
- 2026-07-23T02:06:43Z：只含两个 P1 的 revision request 已派发到已注册 `wordpress_cms` 会话；执行 lane 已确认消息并从全新修订前备份门开始。任务保持 `NEEDS_REVISION`，未扩展到 TASK-005 或用户验收范围。
- 2026-07-23T02:24:25Z：revision response 已确认。planner 独立复核插件 0.1.1 active、权限矩阵 28/14、6 CPT/4 taxonomy、Schema 1.0.0/en、Core/SCF/DB、PHP/JSON、备份哈希、零 fixture/postmeta、Git 忽略与治理均通过；Round 2 已派发，任务转为 `UNDER_REVIEW`。
- 2026-07-23T02:32:48Z：Round 2 final PASS 回执已确认，P0/P1/P2 均为 0。planner 记录 PASS recovery entry；任务仍为 `UNDER_REVIEW`，等待最终验证和 checked acceptance preparation，未发生用户验收或 Git 交付动作。
- 2026-07-23T02:36:12Z：第一次 `prepare-awaiting-user` 已通过全部 acceptance artifact 门并成功进入 `AWAITING_USER`；随后用受控 `reopen` 仅为同步 Board、最终交接叙述与活动记录，未改变任何业务交付物或 review verdict。同步后将再次运行最终 checked transition。

## Durable Task Artifacts

- `TASKS/ARTIFACTS/TASK-004/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-004/PLANNER_SYNC_PROPOSAL.md`
- `TASKS/ARTIFACTS/TASK-004/PLANNER_VALIDATION_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-004/REVISION_ROUND1_REPORT.md`

## Adversarial Review

Round 1：`FAIL`，P0=0、P1=2、P2=2。Canonical report：`TASKS/ARTIFACTS/TASK-004/ADVERSARIAL_REVIEW_REPORT.md`。

Round 2：`PASS`，P0=0、P1=0、P2=0；Round 1 审计轨迹已保留在 canonical report。

Round 1 findings（历史记录；修订与 P2 同步已完成，是否闭环由 Round 2 判定）：

- P1：停用 `gdhe-site` 不撤销持久化写入 administrator/editor 的 GDHE capabilities。
- P1：匿名 `gdhe` 投影对 relationship/media ID 未做 publish/public 可见性过滤，也缺少负例 fixture。
- P2：架构契约残留 Polylang capability 当前式叙述。
- P2：`PROJECT/STATE.md` 残留“SCF 尚未安装/仅收到请求”叙述。
- reviewer 确认 module instance ID/version 与 structured `data_table` 可门禁到 TASK-005，不构成本轮 finding。

## Validation Evidence

- intake 前确认 TASK-003 本地/远端提交均为 `65f50093da88dd0b47dca10b836d5aab8818de7d`，divergence `0/0`。
- intake 前工作区干净，无 pending/blocked/failed Lane message，无未完成 issue，非 detached HEAD。
- planner 复跑全部 GDHE PHP lint、全部 JSON parse、WordPress Core checksum、SCF 官方 checksum 与数据库检查，均 PASS。
- planner 运行时检查 7 个 CPT、4 个 taxonomy、管理员/编辑权限矩阵、Schema `1.0.0`、唯一 locale `en`、7 个 module 与 fixture count `0`，均符合任务范围。
- planner 复核备份/SCF 包字节数和 SHA-256 与 execution report 一致；`.local` 与 SCF vendor 均被 Git 忽略且没有 tracked file；`frontend/**` 无本任务时间窗修改。
- Round 2 final review 为 `PASS`，P0=0、P1=0、P2=0；planner 在确认回执后复跑 PHP/JSON、Core/SCF/DB、插件状态、精确 capability 无 extra/missing、6 CPT/4 taxonomy、Schema 1.0.0/en、7 modules、fixture/postmeta/Service 零残留、备份 manifest、消息队列、strict lane audit、Git scope 与 diff check，全部通过。

## Planner Final Summary

TASK-004 已完成英语版 Headless WordPress CMS 基础，并通过两轮独立审查：

- WordPress.org 官方 SCF 6.9.2 已固定、校验并激活；GDHE 自有 `gdhe-site` 0.1.1 已激活。
- `wp-admin` 已具备 7 个业务内容类型、4 个分类法、2 个代码定义 Field Groups、稳定字段键与 7 个受控模块；管理员/编辑权限矩阵为 28/14，停用归零并重启精确恢复。
- `/wp-json/gdhe/v1/schema` 返回 Schema 1.0.0 和唯一 locale `en`；六个公共内容类型只公开六键 `gdhe` 投影，`acf`/`meta` 容器移除，匿名/`view` 对非公开 relationship/media 引用 fail closed。
- 初始与 Round 1 修订备份、回滚说明、供应链证据、正负 fixture、真实 HTTP、revision/autosave/preview/publish、完整清理、checksum、数据库、Git scope 与治理证据均已记录。
- Round 2 final adversarial review 为 `PASS`，P0=0、P1=0、P2=0；文档影响为 `RESOLVED`。
- 当前只启用英语。WPML/ACFML 仍延后到未来生产英语站连续稳定监控三个月后的独立 PoC；未创建其他语言入口或 hreflang。
- 完整 DTO、module instance ID/version、结构化 `data_table`、route resolution、preview bridge、Webhook、SEO、询盘、前端消费与部署均未在本任务伪装完成，继续属于后续任务。

用户验收已由 helper 记录；随后用户分别输入独立精确提交和推送口令。TASK-004 单一正式提交 `8f8ce2121916e4c764af86aaa04e2a9b83da2a28` 已推送到 `origin/codex/TASK-004-english-cms-scf-foundation`；未授权合并或开始 TASK-005。

## User Acceptance

验收 helper 已于 `2026-07-23T03:26:54Z` 记录 TASK-004 为 `ACCEPTED`。用户随后分别输入独立精确提交和推送口令；正式提交 `8f8ce2121916e4c764af86aaa04e2a9b83da2a28` 已推送，local/remote divergence 为 `0/0`。未授权合并或开始后续任务。

## Recovery Entry 2026-07-23T02:01:07Z

- Reason: Round 1 adversarial review FAIL with two P1 security/rollback gaps and two P2 documentation-state inconsistencies.
- Helper note: `task_transition.py reopen` correctly refused because this review failure occurred in `UNDER_REVIEW`, while that helper only reopens an unaccepted `AWAITING_USER` task; no false intermediate state was written.
- Next step: dispatch a narrow `wordpress_cms` revision for capability removal/reapply and fail-closed relationship/media reference filtering with positive/negative fixtures; planner corrects only the two P2 narratives, then requests Round 2.

## Recovery Entry 2026-07-23T02:32:48Z

- Reason: Round 2 final adversarial review PASS with P0=0, P1=0 and P2=0; reviewer response acknowledged and its stop-recovery handoff routed to planner-owned state.
- Next step: complete planner final validation, synchronize the final handoff narrative, then use `task_transition.py prepare-awaiting-user` for the checked transition. Do not commit, push, merge, accept or close without the required exact user instruction.

## Recovery Entry 2026-07-23T02:36:12Z

- Reason: Synchronize the human-readable board, final acceptance narrative, activity record and planner handoff after the first checked prepare-awaiting-user transition; no business deliverable or review verdict changes.
- Next step: Update only planner-owned human-readable acceptance state, rerun final governance checks, then run prepare-awaiting-user again.
