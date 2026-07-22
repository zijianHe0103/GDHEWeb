# TASK-002 证据综合与架构裁决

status: completed
owner_lane: planner
date: 2026-07-22
scope: architecture synthesis only; no installation or runtime mutation

## 1. 输入证据

- `FRONTEND_ARCHITECTURE_EVIDENCE.md`：Next.js 路由、Server/Client 边界、缓存、预览、媒体和部署约束。
- `WORDPRESS_CMS_API_EVIDENCE.md`：WordPress API、内容模型、ACF、权限、预览、媒体、Webhook 和询盘边界。
- `LOCALIZATION_SEO_EVIDENCE.md`：九语言发布、hreflang、RTL、SEO、Schema 和多语言插件比较。
- planner 对 Next.js、WordPress、ACF、Polylang、WPML、Yoast、Google Search、W3C 与 OWASP 官方资料的复核。
- 2026-07-22 本地只读基线：WordPress 7.0.2、PHP 8.3.32、MySQL Server 8.4.10、无活动插件、Twenty Twenty-Five 活动主题。

## 2. 一致结论

三个专业 Lane 与 planner 对以下边界没有分歧：

1. 公开站使用独立 Next.js App Router + TypeScript，WordPress `wp-admin` 是唯一最终内容后台。
2. 公开前端不依赖 WordPress 主题、Elementor DOM 或第二套 CMS。
3. WordPress 原始响应必须先经过 server-only adapter 和运行时校验，再形成稳定 DTO；组件不能绑定插件字段。
4. 九语言是九个独立内容实体和独立发布状态；缺失或未发布译文不公开、不回退、不进入切换器、hreflang 或 Sitemap。
5. 已发布营销页面以 ISR/缓存预渲染为主；草稿预览和搜索动态、`no-store`。
6. 预览与缓存失效必须使用服务端凭据、短时签名、防重放和最小权限。
7. Next.js 是公开 canonical、hreflang、Sitemap、robots、Open Graph 和 JSON-LD 的唯一输出权威。
8. 客户 CAD/询盘附件不得进入公开 WordPress Media Library。
9. 本任务只形成契约；所有插件、版本、许可证和复杂字段能力进入后续 PoC 与采购门。

## 3. 分歧一：REST 还是 WPGraphQL

frontend 与 wordpress_cms Lane 推荐“WPGraphQL 主读取 + REST 窄用途”；planner 草案选择“REST-first + 受控自有端点”。两边的核心目标其实相同：避免页面组件拼装第三方原始响应，并避免同一资源长期双轨。

| 决策因子 | REST-first | WPGraphQL-first | 本项目当前证据 |
|---|---|---|---|
| WordPress 基础能力 | Core 内建 | 需要 WPGraphQL 插件 | REST 的基础依赖更少 |
| 多语言 | Polylang Pro 官方 REST 暴露 `lang`、`translations` 和语言端点 | 需要选择 WPML GraphQL 或额外桥接 | 两条路线都可行，但绑定不同插件栈 |
| ACF | ACF 官方支持选择性 REST 暴露 | 需要 WPGraphQL for ACF | 两者都有第一方路径，均须预览/修订 PoC |
| SEO | Yoast 官方直接提供 REST JSON | 通常仍需 REST 或额外 GraphQL 适配 | REST 路径更直接 |
| 深层关系 | 需要 `_embed`、批量读取或有限 `/gdhe/v1` 聚合 | GraphQL 擅长一次声明跨实体关系 | 当前尚无 fixture 或性能数据证明必须使用 GraphQL |
| 类型契约 | JSON Schema + DTO + runtime validation | GraphQL schema + codegen + runtime business checks | 两者都能形成强边界，GraphQL 类型不替代业务校验 |
| 运维/升级面 | Core + 选定插件 + GDHE Site Plugin | 还要维护 GraphQL 核心及 ACF/多语言扩展兼容 | 首期 REST 升级面更小 |
| 迁移能力 | adapter 隔离后可迁移 | adapter 隔离后也可迁移 | 前端不能依赖任何一方的 raw shape |

### 裁决

首期采用 **REST-first 受控组合**：

- 标准资源用 WordPress Core REST；
- 多语言与 SEO 分别使用选定厂商的官方 REST 能力；
- 只为路径解析、导航、route manifest、集合和预览建立有限、版本化的 `/gdhe/v1` 端点；
- 不同时维护一套等价 GraphQL 页面契约；
- Next.js 只消费规范化 DTO。

此裁决不是判断 GraphQL 技术上较弱，而是当前没有经代表页面 fixture 证明其新增插件链具有净收益。后续出现以下任一证据时，必须新建 ADR 重新比较，而不是在业务组件中偷偷增加 GraphQL：

1. Service、Case 或 Material 代表页面在合理批量与聚合后仍需要多次不稳定的上游往返，并超过既定延迟/错误预算；
2. `/gdhe/v1` 开始复制多个模板专属查询图，无法保持资源/领域语义；
3. 已确认的编辑工作流必须依赖 WPML GraphQL，且其插件/许可/预览兼容 PoC 通过；
4. schema snapshot、分页或关系查询的维护成本由实际数据证明 GraphQL 更低。

Round 1 review 后将该门改为可执行基准：首页、Service、Case、Material 四个 fixture 在 CMS 同区域、WordPress 正常 object cache、Next.js 数据缓存旁路条件下，每类预热后 200 次、并发 20。至少两类超过 2 个串行 origin 请求、任一类 p95 超过 500 ms/错误率超过 1%、至少两类 JSON 超过 250 KB，或聚合增长到超过 5 个端点/3 个模板专属查询图时，强制启动 GraphQL PoC 与新 ADR。

## 4. 分歧二：Polylang Pro 还是 WPML

localization_seo Lane 推荐 WPML Multilingual CMS + WPML GraphQL，并把 Polylang Pro 作为 REST-only 备选。planner 依据上一节已经选择的 REST-first 边界，反向比较编辑链：

| 方案 | 优势 | 成本/风险 | 与最终 API 决策的匹配 |
|---|---|---|---|
| Polylang Pro | 官方 REST 语言/译文能力；独立 post；语言权限；与 ACF Pro 有厂商集成；依赖链较短 | 商业许可；复杂团队翻译编排不如 WPML 套件完整；必须验证九语言发布和字段复制规则 | **直接匹配 REST-first** |
| WPML Multilingual CMS + WPML GraphQL | 完整翻译面板、语言对、角色与官方 GraphQL 扩展；适合 GraphQL 主读取 | 商业套件和多个 glue add-on；兼容矩阵、升级与预览 PoC 面更大 | 更匹配 WPGraphQL-first |
| 自研关系模型 | 完全控制数据形状 | 自建编辑 UI、权限、关系完整性和迁移，当前没有必要 | 不选 |
| MultilingualPress | 每语言站点隔离 | 要求 Multisite，九站运维与聚合复杂 | 不选 |

### 裁决

首期推荐 **Polylang Pro**，但仍是待采购、待 PoC 的候选，不是已安装事实。后续 CMS 基础任务至少用 English/French/Arabic 的 Service fixture 验证：独立 draft/pending/publish、译文关联、slug、ACF 字段复制/翻译、语言权限、撤回、REST 响应和当前页面切换。

如果业务后来确认需要 WPML 的翻译任务编排、语言对或外部译者流程，并且愿意采用相应商业插件栈，则以新 ADR 同时复核 API 方向；不得把 Polylang 与 WPML 并装。

## 5. ACF / ACF Pro 与字段事实源

- `gdhe-site` 自有插件中的 PHP 注册是 CPT、Taxonomy、capability、REST schema 和 Hook 的代码事实源。
- ACF 是 `wp-admin` 编辑体验，不是新的后台或发布引擎。
- 目标方案推荐 ACF Pro，是因为已确认页面模块需要 Repeater/Flexible Content/Gallery/Clone 类能力；但正式采购/安装前必须用最小字段矩阵证明至少一项 Pro 能力确实被使用，并通过 autosave、revision、preview 和 Local JSON 同步 PoC。
- Flexible Content 只允许契约列出的有限模块，不成为任意页面生成器。
- ACF Local JSON 未来进入 GDHE Site Plugin 并版本化；数据库 UI 不能成为唯一 schema 来源。
- 没有商业许可证时可用原生 registered meta/Block Editor/ACF Free 实现核心能力，但编辑体验和自定义开发成本不同，不声称等价。

## 6. SEO 裁决

推荐 Yoast SEO 作为 `wp-admin` 编辑层；首期以 Free 能力为候选，Premium 只有明确收益和采购授权后才采用。Next.js 只消费 allowlist 后的结构化字段，并覆盖所有公共域名/路由技术值。Yoast/WordPress 的公开 Sitemap、canonical、hreflang 或主题 head 不作为生产权威。

## 6.1 Round 1 审查后的媒体与译文组闭环

- 唯一媒体本地化模型选择 **reference-level override**：Polylang Media module 首期保持关闭，并在任何媒体导入前冻结。
- attachment 只保存二进制和授权事实；当前语言内容的每个 `MediaReference` 保存 attachment ID、alt、caption、decorative。attachment ID 可 Copy Once，alt/caption Translate Once。
- 非装饰图缺少当前语言 alt 时阻止发布；异常数据 API fail closed，禁止回退英语、文件名或 attachment 全局 alt。
- `translationGroupId` 的事实源是 GDHE Site Plugin 受保护 meta `_gdhe_translation_group_uuid`；首次创建 UUID v4，关联 sibling 时复制。拆组/合组/重连必须显式迁移并失效相关缓存与 SEO 闭包。

## 7. 固化决策与后续门

| 项目 | TASK-002 固化 | 后续实施门 |
|---|---|---|
| 前端 | Next.js App Router + TypeScript | 初始化当天锁定稳定补丁版、Node 与包管理器 |
| API | REST-first；不安装 WPGraphQL | 实现 fixture 与 contract tests 后测量；满足重评触发条件才新建 ADR |
| 多语言 | Polylang Pro 推荐 | 采购授权、兼容性、English/French/Arabic PoC |
| 字段 | ACF Pro 推荐 + Local JSON | 字段矩阵、许可证、revision/preview PoC |
| SEO | Yoast Free 候选编辑层；Next.js 唯一输出 | 插件版本、每语言字段、CMS host 归一化测试 |
| 预览/缓存 | Draft Mode + HMAC Webhook + tag/path invalidation | 锁定版本 API、安全测试、多实例部署策略 |
| 询盘 | Next.js BFF + 隔离存储 | 文件规则、保留期、CRM/邮件、隐私与扫描供应商确认 |

## 8. 范围验证

本次综合没有创建 `frontend/`，没有运行包管理器，没有安装/配置 WordPress 插件，没有修改 WordPress、数据库、主题、用户或 uploads，也没有执行 commit、push 或部署。
