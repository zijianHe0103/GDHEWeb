# ADR-005：英语优先、SCF 字段层与 WPML 延后

status: proposed-for-TASK-004-acceptance
date: 2026-07-23
task: TASK-004
supersedes_in_part: ADR-004 decisions 5 and 6

## 背景

ADR-004 已接受 Headless WordPress + Next.js、REST-first、`gdhe-site` 自有插件和单一公开 SEO 渲染权威。其字段层推荐 ACF Pro，多语言层推荐 Polylang Pro，但两者都只是待采购和 PoC 的实施建议。

用户随后确认：先把英语站建设并稳定运行；当前字段层使用 WordPress.org 官方 Secure Custom Fields（SCF）；WPML Multilingual CMS 与 ACFML 在未来生产英语站连续监控稳定三个月后再采购、PoC 和启用。TASK-004 已对该英语 CMS 基础做本地实现与运行时验证。

## 决策

1. 当前结构化字段运行时采用 WordPress.org 官方 SCF。TASK-004 核验、安装并激活版本为 `6.9.2`。
2. `gdhe-site` 自有插件是 GDHE 内容类型、Taxonomy、capability、字段键、Schema 版本和公开 REST 投影的代码事实源；SCF UI 和数据库状态不作为唯一事实源。
3. 字段组以版本化 `config/field-groups.v1.json` 注册。当前 Schema 为 `1.0.0`，仅允许七种首期模块：`hero`、`rich_text`、`card_grid`、`split_media`、`accordion`、`data_table`、`cta_banner`。
4. 当前唯一启用 locale 是英语 `en`，公开前缀为 `/`。不创建其他语言内容、URL、切换入口、Sitemap alternate 或 hreflang。
5. ADR-002 的九语言人工翻译范围仍是长期目标，但不代表当前已启用。WPML Multilingual CMS 与 ACFML 的采购、SCF 兼容性、字段翻译规则、REST 译文关联、RTL 和独立发布必须由未来独立 PoC 任务确认。
6. “稳定三个月”从未来生产英语站正式上线并开始连续监控之日计算，不从 TASK-004 验收或本地安装日计算。
7. REST-first 决策保持不变。TASK-004 只实现匿名只读 `/wp-json/gdhe/v1/schema` 和六种公开 CPT 的 allowlisted `gdhe` 投影；完整 DTO、resolve、collection、navigation、preview、Webhook 和缓存失效继续延后。
8. SCF 的安装或升级继续执行官方来源核验、固定包 checksum、数据库/插件状态备份和非破坏性回滚门；不得修改第三方插件源码或将其运行时纳入 Git。

## 实施证据

- 官方插件 API、ZIP 包名和主插件头均报告 SCF `6.9.2`；要求 WordPress 6.2+、PHP 7.4+，官方元数据标注测试到 WordPress 7.0.2。
- 固定安装包 SHA-256：`40f72fa0d1829c8be89e5f8902b4d5625a40ede91884e55c4e8c5b72fd1ed799`；ZIP 完整性和 WordPress.org 插件 checksum 验证通过。
- 包内 `readme.txt` 仍写 `Stable tag: 6.9.1`。这是已记录的上游元数据不一致，不被静默改写。
- TASK-004 临时英语 Service fixture 验证了 Draft 拒绝、认证读取、revision、autosave、preview、publish、匿名 REST allowlist 和完整清理。
- 数据库备份、供应链和命令级证据见 `TASKS/ARTIFACTS/TASK-004/` 与 `docs/cms/`。

## 对 ADR-004 的影响

- 替代 ADR-004 中“ACF Pro 为当前目标字段层”的建议；当前选择为已验证的 SCF，不采购或安装 ACF/ACF Pro。
- 替代 ADR-004 中“Polylang Pro 为当前首选多语言插件”的建议；当前不安装多语言插件，未来候选固定为 WPML Multilingual CMS + ACFML，并须重新 PoC。
- 保留 ADR-004 的 Next.js、WordPress `wp-admin`、REST-first、GDHE 自有插件、预览/缓存/媒体/询盘安全边界和 WPGraphQL 量化重评门。

## 后果与限制

- 编辑人员现在可在 `wp-admin` 管理英语结构化内容，字段定义可由 Git 中的 GDHE 自有代码重建。
- 当前不会产生未审核译文、假语言链接或不完整 hreflang，但九语言发布能力仍未实现。
- 当前模块 layout 名称和顶层 Schema 已冻结；前端正式消费模块前，后续 DTO 任务仍需补齐稳定 module instance ID/version、数据表结构验证和契约测试。
- 隔离环境的破坏性数据库恢复演练未执行；健康现场只验证了备份完整性和书面回滚步骤。

## 状态门

本 ADR 随 TASK-004 提交用户验收；在收到项目规定的正式验收口令前保持 `proposed-for-TASK-004-acceptance`，不等同于用户已接受、正式提交或推送。
