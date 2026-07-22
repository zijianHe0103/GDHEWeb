# TASK-002 WordPress CMS / API 架构证据

- lane: `wordpress_cms`
- message: `MSG-TASK-002-WORDPRESS-CMS-ARCHITECTURE`
- evidence_date: 2026-07-22
- scope: 只形成架构证据；未安装插件，未修改 WordPress、数据库、主题、用户或前端。

## 1. 明确结论

推荐采用**受控组合**：

1. **WPGraphQL 作为公开站主内容读取平面。** Next.js 服务端通过命名查询和稳定 fragment 读取页面、CPT、分类、关联、媒体及规范化译文关系。GDHE 页面存在较多跨实体关系，GraphQL 的类型 schema 和字段选择比多次 REST 拼装更适合作为前端数据契约。
2. **WordPress REST 只保留后台和窄用途能力。** Gutenberg、ACF、媒体与 WordPress 自身继续使用核心 REST；公开前端仅在有明确官方优势时读取 REST，例如未来若选择 Yoast SEO，可读取官方 `yoast_head_json`。自有命令型端点统一使用 `gdhe/v1`。
3. **禁止同一业务资源长期双轨。** Services、Industries、Materials、Surface Finishes、Cases、Blog、Pages、Testimonials 的页面内容以 GraphQL 为唯一前端内容契约，不再维护一套等价 REST 页面 payload。
4. **前端不写 WordPress 内容。** 内容、媒体、审核与发布只在 `wp-admin` 完成；公开站询盘默认由 Next.js BFF/独立接收服务处理，不开放 GraphQL 写 mutation。
5. **插件能力均为候选，不是现场事实。** WPGraphQL、ACF、WPGraphQL for ACF、SEO 和多语言插件必须在后续任务完成版本、许可证、兼容性及预览 PoC 后才能安装。

最小候选依赖是 WPGraphQL；确定采用 ACF 字段后才增加 ACF 与 WPGraphQL for ACF。WPGraphQL Smart Cache、SEO、多语言和表单插件均不是本契约的默认强制依赖。

## 2. 本地 WordPress 只读基线

2026-07-22 通过文件、WP-CLI 与只读数据库查询核验：

| 项目 | 现场结果 | 架构影响 |
|---|---|---|
| WordPress | `7.0.2` | WPGraphQL 官方插件页标注已测试至 7.0.2，但仍需本站 PoC。 |
| PHP CLI | `8.3.32` | 满足当前 WPGraphQL / ACF 公布的最低 PHP 要求。 |
| MySQL server | `8.4.10` | 只读查询确认；本任务未改变数据库。 |
| Active theme | Twenty Twenty-Five `1.5` | Headless 前端不依赖主题；保留仅为 WordPress 运行完整性。 |
| Plugins | Akismet `5.7`、Hello Dolly `1.7.2` 均 inactive | 未发现 WPGraphQL、ACF、SEO 或多语言插件。 |
| MU plugins | 目录不存在 | 尚无 GDHE 自有 MU Plugin。 |

本地 `mysql --version` 显示 5.7.24 客户端；server 版本由 `SELECT VERSION()` 只读查询确认为 8.4.10，两者不可混写。

## 3. 责任边界

| 责任 | `wp-admin` / GDHE 自有插件 | API | Next.js |
|---|---|---|---|
| 内容与媒体 | 唯一事实源；草稿、审核、发布、回滚 | 只暴露获准字段与状态 | 不提供第二套 CMS |
| 内容 schema | PHP 注册 CPT、taxonomy、meta；可选 ACF | 形成版本化 schema | 生成类型并消费契约 |
| 公开读取 | 不负责页面渲染 | GraphQL 主读取平面 | 服务端读取、渲染、缓存 |
| 草稿预览 | 生成受控入口并检查权限 | 仅认证请求可读草稿/修订 | 短期会话，`no-store`、`noindex` |
| SEO | 编辑 SEO 输入 | 可选官方 SEO REST 或批准的 adapter | 输出最终 metadata 与 Schema |
| 缓存失效 | 保存后发出签名事件 | API cache 不是唯一失效机制 | 按实体、模板、语言 tag 失效 |
| 询盘/上传 | 默认不存公开询盘 | 不开放通用写接口 | BFF 验证、限流、扫描并转邮件/CRM/对象存储 |

## 4. REST 与 WPGraphQL 比较

| 方案 | 优点 | 代价/风险 | 结论 |
|---|---|---|---|
| 仅 REST | 核心内置；CPT/taxonomy 设置 `show_in_rest` 即有标准 controller；认证、媒体、修订有官方能力 | 关系型页面常需多次请求或自定义聚合端点；字段契约易分散；展示页面形状可能写进 PHP endpoint | 不作公开站主契约 |
| 仅 WPGraphQL | 强类型、字段按需、跨实体连接、cursor pagination；继承 WordPress capability | 增加插件依赖；ACF、SEO、多语言常需扩展；GraphQL `errors` 可能随 HTTP 200 返回 | 不让 GraphQL 包办所有命令 |
| 受控组合 | GraphQL 处理内容图；核心/厂商 REST 处理后台或窄官方接口 | 必须禁止同资源双轨，并维护兼容矩阵 | **推荐** |

### 4.1 GraphQL 规则

- 生产查询必须有操作名、变量和复用 fragment；禁止字符串拼接查询。
- 匿名请求只读取 `publish` 内容；预览请求另走认证通道。
- CPT 显式声明 `show_in_graphql`、唯一的 single/plural GraphQL name；同时设置 `show_in_rest` 只为编辑器与受控后台能力。
- 前端优先从 Next.js 服务端访问 WordPress；浏览器不持有 Application Password，也不直接获得草稿数据。
- 列表使用 cursor pagination 和明确上限；不一次抓取全站内容，不做无边界深层嵌套。
- 生产关闭公开 introspection，调试信息仅在隔离环境启用；验证阶段保存 schema snapshot。
- 客户端同时判断 HTTP 状态、`errors` 和必需 `data`；HTTP 200 不等于业务成功。
- schema 变更以新增字段为主；删除或改名先 deprecated，再经过迁移窗口移除。

### 4.2 REST 规则

- 自有端点只注册在 `gdhe/v1`，声明参数 schema、sanitize/validate callback、`permission_callback` 和稳定错误码。
- 不再创建一套 `gdhe/v1/page-payload` 与 GraphQL 并行维护。
- Cookie + nonce 只用于同源 `wp-admin`；跨系统服务账户在 HTTPS 下使用可单独撤销的 Application Password。
- 自有写端点默认拒绝匿名访问，并按对象能力调用 `current_user_can()`，不能只检查角色名。
- 若采用 Yoast SEO，优先使用厂商官方只读 REST 输出，不默认增加社区 GraphQL SEO adapter。

## 5. 内容模型

| 编辑概念 | WordPress 模型 | 公共路由 | 主要关系 |
|---|---|---|---|
| Services | CPT `gdhe_service` | 有详情页 | industries/materials/finishes/cases |
| Industries | CPT `gdhe_industry` | 有详情页 | services/cases |
| Materials | CPT `gdhe_material` | 有详情页 | services/finishes/cases |
| Surface Finishes | CPT `gdhe_finish` | 有详情页 | materials/services/cases |
| Case Studies | CPT `gdhe_case` | 有详情页和列表 | service/industry/material/finish references |
| Blog | core `post` | 有详情页和归档 | core category/tag；必要时引用业务实体 |
| Generic Pages | core `page` | 有层级页面 | template key、可选业务实体 |
| Testimonials | CPT `gdhe_testimonial` | 默认无独立详情页 | source、quote、company、case/service |

Industry、Material 与 Finish 需要可发布落地页、正文、SEO、媒体和译文，因此先建 CPT，而不是只有 term description 的 taxonomy。Cases 通过显式关系字段引用它们。只有未来真实需求证明需要大规模分面过滤时才增加索引型 taxonomy；不得先复制一份同名 CPT + taxonomy 让编辑双重维护。

### 5.1 字段边界

优先用 WordPress 原生字段：

- `post_title`、`post_name`、`post_status`、`post_content`、`post_excerpt`；
- featured image、author、dates、revisions；
- parent 与 menu order 只对确有层级/排序需要的类型启用。

taxonomy 只保存真正可复用的分类。CTA、Hero、指标和一对一页面配置不得塞入 taxonomy。

自定义字段用于模板特有结构：Hero 补充、CTA、业务属性、案例指标、实体引用、白名单 template key。关系保存对象 ID/GraphQL node，不保存可漂移标题或完整 URL。若 SEO 插件负责 SEO，不在 GDHE 字段组维护第二份 title、description 或 canonical。

每个共享字段必须定义类型、必填性、默认值、可见性、清理规则、权限和修订策略。禁止把任意 ACF object 原样公开为无约束 JSON。

### 5.2 译文接口边界

多语言插件/模型由 `localization_seo` 与 planner 定稿；CMS 必须提供稳定的抽象：

- 每种语言是独立内容实体，拥有独立状态、slug、正文、SEO 和媒体选择；
- 用稳定 translation group 关联译文；公开 API 返回规范化 `translations { locale, uri, status }`；
- 公共 resolver 只返回已发布译文；草稿不得进入 language switch、hreflang 或 Sitemap；
- 多语言 adapter 放在 GDHE 自有插件，前端不依赖第三方插件内部 meta key。

## 6. ACF、ACF Pro 与字段版本化

### 6.1 推荐边界

- CPT、taxonomy、capability 和关键 meta schema 必须由 GDHE 自有插件 PHP 注册，不能只存在生产数据库 UI。
- ACF 只提升 `wp-admin` 编辑体验，不拥有发布流程，也不替代 WordPress capability。
- ACF Free 能满足时不采购 Pro。Repeater、Flexible Content、Gallery、Clone、Options Pages 等 Pro 能力只有在固定字段组/原生 blocks 无法表达已确认用例时才进入采购门。
- 不采用无限 Flexible Content 页面搭建器；Next.js 模板和 CMS 字段保持有限、可测试的模块集合。
- 若采用 ACF + WPGraphQL，优先评估第一方 WPGraphQL for ACF，但仍须做版本与预览 PoC。

### 6.2 版本化方案

1. 在 GDHE 自有插件中保留 `acf-json/`，通过 ACF save/load filters 指向插件目录，而不是主题。
2. 字段组使用稳定 machine key；JSON 与 PHP 注册代码进入版本控制，数据库只是运行实例。
3. schema 变更先在开发/预发布生成 diff、备份和迁移计划，再同步生产。
4. API schema snapshot、代表 GraphQL query fixtures 与 ACF JSON 一起验证。
5. 破坏性变更遵循“新增字段、回填、双读迁移窗口、移除旧字段”，并记录回滚入口。
6. ACF Local JSON sync 会修改数据库；后续必须有明确任务、备份和 dry-run。本任务没有执行。

### 6.3 预览与修订风险

WordPress core revisions/autosaves 可由 REST 读取，registered meta 可声明 revisions 支持。但复杂 ACF 字段能否在当前 ACF、WPGraphQL for ACF 与编辑器组合中准确读取指定 revision，必须 PoC，不能仅靠文档推断。ACF Pro 6.8.1+ datastore 是 opt-in 且官方仍在收集反馈，不作为默认契约。

PoC 至少覆盖标量、关系、图片、Group；若采购 Pro，再覆盖 Repeater。验证 autosave、revision restore、未发布译文、预览关闭后的权限和旧 revision 字段值。

## 7. 权限与预览

### 7.1 Capability 模型

- 每个 GDHE CPT 使用独立 capability type、`map_meta_cap` 与对象级检查。
- 权限拆分为 edit own、edit others、publish、delete、manage taxonomy、manage schema；角色只是能力集合，API 不硬编码角色名。
- 日常编辑不拥有插件安装、主题编辑、用户管理或 schema 修改能力。
- 发布者可发布指定类型；翻译编辑的语言级限制须由多语言 adapter/插件 PoC 验证。
- Next.js 预览服务账户只获得读取草稿/修订所需最小能力；使用独立 Application Password，可审计、轮换、撤销。

### 7.2 预览流程

1. 获准编辑者在 `wp-admin` 点击预览。
2. GDHE 自有插件生成短期签名 URL，包含 entity、revision、locale、expiry、nonce，不含 WordPress 密码。
3. Next.js 校验签名和有效期，并建立服务端 preview cookie。
4. Next.js 服务端使用 secret store 中的 Application Password 查询目标草稿/修订。
5. 响应强制 `Cache-Control: private, no-store` 与 `X-Robots-Tag: noindex, nofollow`，不得写入共享 CDN/ISR cache。
6. 权限失败、token 过期或 WordPress 不可用时 fail closed，不回退到泄露草稿的响应。

Cookie + nonce 只适合同源 WordPress 会话；不得把 `wp-admin` cookie 转发给公开前端域。Application Password 仅存在服务端并要求 HTTPS。

## 8. 媒体

- Media Library 是编辑媒体事实源；API 暴露 attachment ID、URL、width/height、mime、alt、caption 与 sizes。
- 关系保存 attachment ID。Next.js 根据 media contract 选择尺寸并保留 width/height，避免布局偏移。
- 内容图必须填写可翻译 alt；装饰图显式空 alt。按素材治理需要增加 caption、credit、license。
- SVG 默认不开放；若确认需要，必须单独增加清理、白名单和响应头策略。大视频优先对象存储/视频平台。
- CMS 媒体与询盘附件使用隔离的存储、权限和生命周期；询盘附件不进入公开 Media Library。
- 以后接入 CDN/对象存储不得改变 GraphQL media shape，由 media adapter 处理域名、签名 URL 和变体。

## 9. Webhook 与缓存失效

`wp_after_insert_post` 在 post、terms 与 meta 保存后触发，可作为内容事件入口；还须覆盖 term、attachment、delete/trash/untrash、菜单/站点设置与译文关系变化。`transition_post_status` 在状态未变化的普通更新也可能触发，不能直接等同首次发布。

建议签名事件最小 payload：

```json
{
  "eventId": "uuid",
  "event": "content.changed",
  "entityType": "gdhe_service",
  "databaseId": 123,
  "locale": "fr",
  "translationGroup": "uuid",
  "oldStatus": "draft",
  "newStatus": "publish",
  "tags": ["entity:123", "type:gdhe_service", "locale:fr"],
  "occurredAt": "2026-07-22T00:00:00Z"
}
```

- 固定 HTTPS 目标使用 `wp_remote_post()`；header 携带 timestamp、event ID、HMAC 和 key ID，密钥不进仓库。
- Next.js 校验时间窗、签名和 event ID，按 tag 幂等失效；发布、更新、撤稿、删除和译文关系变化都须覆盖。
- 内容保存与 webhook 投递分开记录；投递失败指数退避重试，支持受权限控制的人工重放和告警。
- ISR/tag cache 是公开页面缓存权威。Smart Cache 只有在主机支持 tag purge 且 PoC 证明收益后采用，不能替代前端失效事件。
- API 故障时可服务最后一次成功的已发布缓存；撤稿事件须高优先级，并支持人工全量 purge。

## 10. SEO 暴露

SEO 输入在 `wp-admin` 管理，Next.js 输出最终 title、description、canonical、robots、Open Graph、Twitter 和 JSON-LD。WordPress 主题与 Next.js 不得同时渲染公开 head。

- 若选择 Yoast SEO，使用官方只读 REST API 的 `yoast_head_json`/URL endpoint，并与 GraphQL 页面数据一起缓存。SEO 更新仍在 `wp-admin` 完成。
- 优先消费结构化 JSON，建立字段 allowlist、canonical 域名重写和重复标签测试；prefabricated HTML 不得无审查注入。
- GraphQL 只暴露页面身份、规范化 frontend URI 和必要自有 Schema 扩展；不默认依赖社区 Yoast GraphQL extension。
- 若不选择 SEO 插件，则由 GDHE 自有字段与前端模板实现，但不得同时维护两套 SEO 值。
- hreflang、canonical 和缺失译文规则由 localization/SEO 契约定稿；CMS 只提供已发布译文闭包和每语言 SEO 输入。

## 11. 询盘、上传与外部系统

默认链路为：浏览器 → Next.js BFF/受控接收服务 → 邮件/CRM/对象存储。WordPress 不是公开询盘的默认接收器或 CRM。

- 不开放 GraphQL `createInquiry`，浏览器不使用 WordPress Application Password。
- BFF 做服务端 schema validation、CSRF/Origin 策略、bot challenge、rate limit、幂等键和审计日志。
- 上传校验扩展名与真实 MIME、大小/数量、恶意内容扫描、隔离存储、随机对象名、短期签名访问和过期删除；浏览器提供的 MIME 不可信。
- 邮件/CRM 失败进入重试队列，用户只获得 tracking ID；日志不记录完整附件、密码或敏感个人信息。
- 若以后要求在 `wp-admin` 查看询盘，须新任务决定保留期、权限、隐私、导出/删除、加密、备份与 CRM 同步，再设计私有 CPT 或专用表。

## 12. 错误、恢复与验证门

### 12.1 运行时错误

- GraphQL 区分 transport、validation、authorization、partial data 与 resolver 错误；必需数据失败时显式报错或使用最后已知已发布缓存。
- REST 使用 `WP_Error` 和稳定状态：400 输入、401 未认证、403 无能力、404 不存在、409 状态冲突、422 语义校验、429 限流、5xx 故障。
- Webhook 保存成功与投递成功分开记录，重试必须幂等。
- 字段删除、类型改变、nullable 改 non-null 均为破坏性 schema 变更，需要迁移和回滚。
- 预览认证失败不得回退为匿名草稿读取。

### 12.2 下一实施任务必须验证

1. 隔离环境安装候选插件，记录精确版本、许可证、依赖和更新策略。
2. 每类一个 fixture，覆盖公开、草稿、待审、私有、撤稿及九语言独立状态。
3. service、case、blog、page 的代表 GraphQL query，覆盖关系、媒体、空字段、分页和 schema snapshot。
4. ACF 标量、关系、图片与复杂字段的 autosave、revision、preview；失败则改用 native registered meta 或调整模型。
5. 匿名、编辑、发布、预览服务账户的 capability matrix。
6. GraphQL HTTP 200 + `errors`、WordPress 5xx、超时、partial data、schema mismatch 的前端行为。
7. webhook publish、update、unpublish、delete、term、media、translation-link 的签名、重放、乱序和重试。
8. 媒体 alt、尺寸、变体缺失、SVG 拒绝及询盘附件隔离。
9. 若采用 Yoast，验证各语言 canonical、robots、OG、Schema、404 和 indexables 未就绪场景。
10. Git diff 不得包含 WordPress core、第三方插件、`wp-config.php`、数据库、uploads 或凭据。

## 13. 风险与待 planner 决策

- WPGraphQL 主读取平面仍需 frontend lane 确认类型生成、查询和缓存契约。
- 多语言插件及 normalized translation adapter 由 localization/SEO 证据合并后决定；当前不预选 WPML、Polylang 或自研关系表。
- ACF Free/Pro 是否采购取决于最终字段清单；复杂字段 revision fidelity 是实施阻断 PoC。
- SEO 插件未选择；Yoast 官方 REST 是可行候选，不表示已批准安装。
- Smart Cache 依赖主机能力且官方提示可能有 breaking changes；默认先使用 Next.js tag cache + 签名 webhook。
- Testimonial 无独立公开 URI、但需公开读取的注册方式，须在最小 CPT PoC 验证 capability 与 resolver。

## 14. 官方一手来源

以下资料均于 **2026-07-22** 访问：

1. WordPress REST custom content types：https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-rest-api-support-for-custom-content-types/
2. WordPress REST routes/endpoints：https://developer.wordpress.org/rest-api/extending-the-rest-api/routes-and-endpoints/
3. WordPress REST authentication：https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
4. WordPress Application Passwords：https://developer.wordpress.org/advanced-administration/security/application-passwords/
5. WordPress `register_meta()`：https://developer.wordpress.org/reference/functions/register_meta/
6. WordPress REST revisions/autosaves：https://developer.wordpress.org/rest-api/reference/post-revisions/
7. WordPress REST media：https://developer.wordpress.org/rest-api/reference/media/
8. WordPress roles/capabilities：https://developer.wordpress.org/plugins/users/roles-and-capabilities/
9. WordPress `wp_after_insert_post`：https://developer.wordpress.org/reference/hooks/wp_after_insert_post/
10. WordPress `transition_post_status`：https://developer.wordpress.org/reference/hooks/transition_post_status/
11. WordPress `wp_remote_post()`：https://developer.wordpress.org/reference/functions/wp_remote_post/
12. WordPress `wp_check_filetype_and_ext()`：https://developer.wordpress.org/reference/functions/wp_check_filetype_and_ext/
13. WPGraphQL custom post types：https://www.wpgraphql.com/docs/custom-post-types
14. WPGraphQL authentication/authorization：https://www.wpgraphql.com/docs/authentication-and-authorization
15. WPGraphQL security：https://www.wpgraphql.com/docs/security
16. WPGraphQL performance：https://www.wpgraphql.com/docs/performance
17. WPGraphQL known limitations：https://www.wpgraphql.com/docs/known-limitations
18. WPGraphQL official plugin page：https://wordpress.org/plugins/wp-graphql/
19. WPGraphQL for ACF first-party extension：https://www.wpgraphql.com/extensions/wp-graphql-acf
20. WPGraphQL Smart Cache official plugin page：https://wordpress.org/plugins/wpgraphql-smart-cache/
21. ACF Local JSON：https://www.advancedcustomfields.com/resources/local-json/
22. ACF WP REST integration：https://www.advancedcustomfields.com/resources/wp-rest-api-integration/
23. ACF Pro features：https://www.advancedcustomfields.com/pro/
24. ACF datastore：https://www.advancedcustomfields.com/resources/using-the-acf-datastore/
25. ACF official plugin page：https://wordpress.org/plugins/advanced-custom-fields/
26. Yoast SEO official REST API：https://developer.yoast.com/customization/apis/rest-api/

## 15. 完成状态

- 已完成：本地只读基线、API 决策、内容模型、字段/ACF 边界、权限、预览、媒体、缓存、SEO、询盘和恢复证据。
- 未执行：插件安装，以及 WordPress、CMS、数据库、主题、用户、前端修改。
- 供 planner 合并的结论：**WPGraphQL 主内容读取 + 核心/厂商 REST 窄用途的受控组合；所有插件和复杂预览能力进入后续 PoC 门。**
