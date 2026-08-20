# TASK-002 前端架构证据

status: completed
lane: frontend
message_id: MSG-TASK-002-FRONTEND-ARCHITECTURE
access_date: 2026-07-22
scope: architecture evidence only; no frontend initialization or dependency installation

## 1. 结论摘要

1. 公开站采用 **Next.js App Router 与 TypeScript**，作为与 WordPress 分离部署的独立应用。页面和布局默认使用 Server Components；只有菜单交互、筛选、表单状态等确需浏览器状态或 API 的小范围组件进入 Client Component 边界。
2. WordPress 数据只经 `server-only` 数据访问层进入前端。页面 Server Components 直接调用该层，不绕行本应用 Route Handler；组件只消费规范化、运行时校验后的 DTO，不直接依赖 REST 或 WPGraphQL 响应形状。
3. 从前端查询效率和类型契约角度，建议 **WPGraphQL 作为公开渲染查询的主协议，WordPress REST API 作为受控补充**。该建议须由 CMS lane 对插件维护、字段暴露、预览鉴权和许可边界复核；无论最终协议如何，均不得穿透 DTO 边界影响路由和组件。
4. 英语保持无前缀 `/`；其余八种语言使用固定前缀。用“英语根路由薄包装与 `[locale]` 非英语薄包装”共享同一模板模块，不通过全站重写伪造 `/en/`，也不复制九套业务组件。
5. 已发布营销内容默认采用可缓存的服务端预渲染或 ISR，并以 CMS Webhook 触发精确标签失效；搜索、预览和请求相关内容动态渲染。草稿预览使用 Draft Mode，必须绕过公开缓存并禁止索引。
6. 部署必须提供 Next.js Node.js 运行时、Route Handlers、Draft Mode cookie、按需重验证及图片优化能力；因此禁止 `output: 'export'`。多实例部署必须共享缓存并协调标签失效。

本证据不锁定 Next.js 具体版本、包管理器或托管平台。正式初始化任务应重新读取当时稳定版文档并锁定版本。2026-07-22 访问的 Next.js 官方文档页面显示 latest version 为 `16.2.10`，仅作为本次调研快照，不是安装授权。

## 2. 应用与责任边界

| 边界 | 前端负责 | 前端不负责 |
|---|---|---|
| 路由与渲染 | App Router、语言 URL、页面模板、Server/Client Component 边界、loading/error/not-found | WordPress permalink 作为公开站路由、由主题或 Elementor 渲染页面 |
| 数据读取 | server-only client、查询或端点适配、DTO、运行时校验、超时与错误映射 | 定义 CPT 或字段、改变 CMS 权限、在浏览器持有 CMS 凭据 |
| 缓存 | 为读取结果分配标签、接收并校验失效 Webhook、执行精确重验证 | 由前端猜测内容关系、跳过 CMS 事件版本或签名校验 |
| 预览 | Draft Mode 入口或退出、预览横幅、无缓存与无索引、服务端草稿读取 | 公开未发布内容、把 Application Password 或 JWT 发给浏览器 |
| 媒体 | `next/image`、尺寸或比例、响应式 `sizes`、远程来源白名单、fallback | 修改 WordPress uploads、允许任意远程图片源 |
| 写操作 | 未来询盘或 RFQ 的 BFF 接口边界与客户端状态 | 在 TASK-002 实现表单、上传、邮件或 CRM；把 Next.js 当完整业务后台 |

### 2.1 TypeScript 契约

- 开启严格类型检查；路由参数、locale、模板类型、API DTO 和错误类型不得使用无约束 `any`。
- GraphQL 路线使用按 operation 生成的类型；REST 路线使用显式响应 schema。两者都在边界执行运行时校验，避免“TypeScript 类型等于外部数据已可信”的错误假设。
- WordPress 原始数据先规范化为稳定 DTO。DTO 至少包含稳定 ID、内容类型、locale、slug、URI、修改时间、SEO、已发布译文链接和模板 body。
- `translations` 只包含已审核且已发布的公开目标；前端不从源文自动合成译文 URL。
- 若 CMS 返回自由 HTML，必须在服务端边界做允许列表清理；优先使用结构化区块或字段映射到受控 React 组件，不能无条件把 CMS 字符串传给 `dangerouslySetInnerHTML`。

## 3. App Router 与九语言路由

### 3.1 URL 契约

| locale | 公开前缀 |
|---|---|
| `en` | `/` |
| `fr` | `/fr/` |
| `de` | `/de/` |
| `es` | `/es/` |
| `zh-CN` | `/zh-CN/` |
| `ar` | `/ar/` |
| `hi` | `/hi/` |
| `ja` | `/ja/` |
| `pt` | `/pt/` |

Next.js 官方国际化指南证明 App Router 可把语言作为动态 segment 并传入 layout/page；但官方示例为所有语言加前缀，不能直接满足本项目英语无前缀要求。因此建议保留两组**薄路由入口**，共享同一模板实现：

```text
src/app/(site)/layout.tsx
src/app/(site)/page.tsx
src/app/(site)/services/[slug]/page.tsx
src/app/(site)/industries/[slug]/page.tsx
src/app/(site)/materials/[slug]/page.tsx
src/app/(site)/surface-finishes/[slug]/page.tsx
src/app/(site)/case-studies/[slug]/page.tsx
src/app/(site)/blog/[slug]/page.tsx

src/app/(site)/[locale]/page.tsx
src/app/(site)/[locale]/services/[slug]/page.tsx
src/app/(site)/[locale]/industries/[slug]/page.tsx
src/app/(site)/[locale]/materials/[slug]/page.tsx
src/app/(site)/[locale]/surface-finishes/[slug]/page.tsx
src/app/(site)/[locale]/case-studies/[slug]/page.tsx
src/app/(site)/[locale]/blog/[slug]/page.tsx
```

- `[locale]` 只接受八个非英语值；其他值立即 `notFound()`。静态同级 segment（如 `services`）由 App Router 优先匹配。
- 英语与非英语 route file 仅解析参数并调用共享业务模板模块；不得复制数据查询和 JSX。
- 页面语言切换读取当前实体的 CMS translation map。目标未发布时不生成链接；直接访问未发布译文 URL 返回 404，不回退到英语正文。
- `generateStaticParams` 至少枚举八个非英语 locale；CMS slug 不要求在每次构建时全量枚举，可由缓存预渲染或 ISR 按访问生成，以免构建与 CMS 可用性和内容规模强耦合。
- locale negotiation 仅用于首次入口体验；不得把已有明确路径重定向到其他语言。`x-default` 和语言选择 UI 由 localization/SEO 契约最终决定。

## 4. 按页面类型的渲染建议

| 页面或能力 | 建议 | 原因与失效条件 |
|---|---|---|
| 首页、普通 Pages、About | 缓存预渲染与 ISR | 发布频率低；页面、导航、站点设置或 SEO 更新时按标签失效 |
| Services、Industries、Materials、Surface Finishes 列表 | 缓存预渲染与 ISR | 聚合读取；实体新增、删除、排序、翻译发布时失效对应 locale 列表 |
| 上述详情、Case Study、Blog 详情 | 缓存预渲染与 ISR | 以实体 ID、locale、route 标签精确失效；slug 变化同时失效旧路径和新路径 |
| Case 或 Blog 列表分页 | 首屏和常用页缓存；深分页按需生成 | 避免构建时穷举；列表变更失效 locale 列表标签 |
| 搜索结果 | 请求时动态渲染或客户端增强 | 依赖 query，不能污染公共页面缓存；空结果是正常状态 |
| Contact 或 RFQ 页面外壳 | 缓存预渲染 | 表单说明可缓存；未来提交 Route Handler 独立动态处理 |
| Draft Preview | 动态、Draft Mode、no-store、noindex | 每次读取当前草稿，绝不读写公开 ISR 缓存 |
| `sitemap.xml`、robots、metadata 或 OG | 从已发布 DTO 生成并缓存 | 发布状态、slug、SEO 或译文关联变化时失效 |
| 404、invalid locale、unpublished | `notFound()` | Next.js 会渲染 not-found UI 并注入 `noindex` |

这里的“ISR”表示 Next.js 服务端缓存加按需重验证能力，不要求使用旧 Pages Router 的 `getStaticProps`。是否启用 Cache Components 及其具体配置必须在初始化任务按锁定版本验证。

## 5. WordPress 数据访问边界

- `src/lib/wordpress/**` 标记为 `server-only`，集中管理 endpoint、认证、超时、响应校验、错误分类和观测字段。
- Server Components 直接调用 domain query。Next.js 官方 BFF 指南明确指出，Server Components 绕行本应用 Route Handler 会增加 HTTP 往返，并在构建时没有监听服务器，因此不采用本应用内部内容代理链。
- Client Components 只接收最小可序列化 props；不得直接访问 WordPress、WPGraphQL 或携带预览凭据。
- REST 或 WPGraphQL 的原始字段名、分页和错误结构不得出现在 UI 组件。协议切换最多影响 adapter 与生成类型，不影响 route 或 template。

### 5.1 协议建议与决策门

**前端建议：WPGraphQL primary，REST supplement。** 营销详情页通常一次需要主实体、分类、关联内容、媒体、SEO 与译文链接；GraphQL operation 可声明精确字段并生成 TypeScript 类型，减少 REST 多端点拼装。WPGraphQL 官方文档也说明 CPT 只有显式 `show_in_graphql` 后才进入 schema，且公共或私有读取遵循 WordPress 权限。

REST 保留给 WordPress 核心已有且更直接的只读端点、运维健康检查、仅提供 REST 的插件能力，以及 CMS lane 证明无法稳定进入 GraphQL schema 的字段。进入实施前，planner 与 CMS lane 必须关闭 WPGraphQL 与 ACF、SEO、多语言扩展版本和许可、草稿鉴权、query complexity、分页、schema 变更检查以及 REST fallback 字段等价性。门未关闭前，本结论是“前端推荐”，不是已安装插件事实。

## 6. Draft Preview 契约

1. `wp-admin` 生成指向前端 `/api/draft` 的预览 URL，携带短时效、一次性或可轮换的签名令牌以及不可信内容标识。
2. Route Handler 校验签名、过期时间、允许来源或 nonce（按最终 CMS 方案）并在服务端向 WordPress 查询目标；绝不能只比较前端传来的 slug。
3. 重定向必须使用 CMS 返回并经过 locale、host、path allowlist 验证的公开形态路径，不能直接重定向到 query string 中的任意 URL，以防 open redirect。
4. 启用 `draftMode()` 后，从独立 preview adapter 以最小权限服务端凭据读取草稿；凭据只存在于非 `NEXT_PUBLIC_` 环境变量。
5. 所有预览响应 `private, no-cache, no-store` 且 `noindex`，显示清晰 Preview Banner；退出使用 POST Server Action 或 POST Route Handler 清除 cookie。
6. 预览失败不得回退到公开内容伪装成功：无效令牌返回 401 或 403，不存在或无权内容返回 404，WordPress 不可用返回可诊断的 503 页面。

Next.js 官方 Draft Mode 指南确认该模式会绕过 fetch cache、`use cache`、`unstable_cache` 和 ISR response cache；同时建议在重定向前验证 CMS 中实际存在的 slug，并从 CMS 结果重定向以避免开放重定向。

## 7. 缓存、Webhook 与失效标签

### 7.1 标签命名

标签长度保持简短、稳定并由服务端构造，不接受 Webhook 直接提交任意标签：

```text
wp:entity:{type}:{id}:{locale}
wp:list:{type}:{locale}
wp:route:{locale}:{route-id}
wp:nav:{locale}
wp:settings
wp:seo:{locale}
```

- 每个 domain query 同时挂实体、列表或关系、全局依赖标签。
- Webhook payload 使用 `event_id`、实体 ID、type、locale、old slug、new slug、old status、new status 和修改版本；前端以 allowlist 映射到标签。
- 一般正文更新使用 `revalidateTag(tag, 'max')`，允许 stale-while-revalidate。
- 发布、撤回、删除、权限改变和 slug 改名不能继续公开旧内容；使用 `revalidateTag(tag, { expire: 0 })` 使下一请求阻塞获取新状态，并同时失效旧 route、新 route、实体、列表、导航、Sitemap 和 SEO 标签。
- `revalidatePath` 仅作无法定位数据标签时的补充；正常情况优先标签，避免过度失效。

### 7.2 Webhook 安全与可靠性

- 仅接受 POST；签名覆盖原始 body、时间戳和 event ID，比较采用 constant-time；拒绝过期、重放、未知事件和超限 body。
- endpoint 是公开 HTTP 面，必须有速率限制、结构校验、超时、最小错误响应和审计日志；日志不得记录令牌、Application Password 或草稿正文。
- 返回幂等结果；同一 `event_id` 重试不重复产生不可控副作用。
- 若缓存失效失败，记录可重试事件并报警。公开页面可在普通更新时保留最后一次已知良好缓存，但撤回或权限事件必须 fail closed，不得长期继续公开。
- 多实例部署必须共享缓存并协调 tag invalidation；只在单个实例执行失效会造成节点间陈旧内容。

Next.js 当前官方文档推荐 CMS 内容使用较长缓存并依赖 tag revalidation；`revalidateTag` 的 `max` profile 提供 stale-while-revalidate，而 `expire: 0` 可用于要求下一次读取立即更新的事件。具体 API 签名在初始化任务再次核对锁定版本。

## 8. 媒体契约

- WordPress DTO 必须提供原始 URL、宽、高、MIME、alt、caption 和可用衍生尺寸；远程图像缺少宽高时不得猜测布局比例。
- 使用 `next/image`，`remotePatterns` 精确限制为 HTTPS、明确 CMS 或 CDN hostname 和 uploads 路径；不得使用无边界主机通配或允许任意 query。
- 根据实际布局提供 `sizes`；首屏唯一 LCP 图才考虑 `preload`，其余默认 lazy。不要为所有 hero 候选同时 preload。
- Next.js 16 文档要求图片 quality allowlist；初始化时显式配置有限 qualities，并核实所选版本的当前属性名称。
- 默认不开放 SVG 优化与本地 IP；若业务必须支持 SVG，优先在 CMS 上传链路清理并作为受控静态资源，另行评审 CSP 和 content-disposition。
- 默认 Image Optimization loader 不转发源站认证 header。草稿中的私有媒体需由 CMS 提供短时受控 URL 或单独方案；不得把 WordPress 凭据交给浏览器或图片优化 URL。

## 9. 错误、降级和观测

| 情况 | 前端行为 |
|---|---|
| CMS 返回不存在、未发布或 locale 不匹配 | `notFound()`；不回退到英语正文 |
| 无效 locale | 路由边界立即 `notFound()` |
| 公开查询 401 或 403 | 视为配置或权限异常，fail closed；服务端记录 correlation ID，不向用户泄露细节 |
| CMS 429、超时或 5xx | 有缓存的普通公开内容可服务最后已知良好版本并报警；无安全缓存时返回 503 或 segment error，不伪造空正文 |
| DTO schema 不匹配 | 视为契约破坏；记录 operation 或 endpoint、content ID、schema version，进入 `error.tsx`，不得带原始敏感 payload |
| 草稿查询失败 | 明确预览失败；不回退到公开内容 |
| 图片失败 | 保持尺寸占位和可访问 alt，使用 GDHE 自有 fallback，不循环请求源图 |

- 为关键 route segment 设置 `loading.tsx`、`error.tsx`、`not-found.tsx`，根级保留 `global-error.tsx`；错误恢复按钮只能重试可恢复查询。
- 预期错误（404、验证失败、限流）用显式状态表示；未知异常交给错误边界和服务端观测。
- 记录 request 或 correlation ID、route、locale、content ID、upstream status、cache hit 或 miss、revalidation event；不得记录密钥、授权 header、表单隐私或完整草稿。

## 10. 建议模块目录（仅契约，不创建）

```text
frontend/
  src/
    app/
      (site)/
        layout.tsx
        page.tsx
        [locale]/...
        services/[slug]/...
        industries/[slug]/...
        materials/[slug]/...
        surface-finishes/[slug]/...
        case-studies/[slug]/...
        blog/[slug]/...
      api/
        draft/route.ts
        draft/exit/route.ts
        revalidate/route.ts
      error.tsx
      global-error.tsx
      not-found.tsx
      robots.ts
      sitemap.ts
    features/
      home/
      services/
      industries/
      materials/
      surface-finishes/
      case-studies/
      blog/
      contact/
    components/
      layout/
      ui/
      content-blocks/
    lib/
      wordpress/
        client.server.ts
        graphql.server.ts
        rest.server.ts
        queries.server.ts
        normalize.ts
        schemas.ts
        errors.ts
      cache/
        tags.ts
        revalidate.server.ts
      i18n/
        locales.ts
        routing.ts
      security/
        webhook.server.ts
        preview.server.ts
      observability/
    types/
```

目录按业务能力组织，route file 保持薄；不创建单一巨大 `components`，也不把 WordPress raw query 分散到各页面。

## 11. 部署责任与进入下一任务的门

### 11.1 平台能力门

- Node.js server runtime，支持 Server Components、Route Handlers、streaming、Draft Mode cookie、ISR 或 tag revalidation 和 Image Optimization。
- Preview、Staging、Production 域名、密钥、缓存与 WordPress endpoint 隔离；Staging 必须 noindex。
- 多实例具有共享持久缓存、标签协调、统一 Server Function encryption key 和 deployment ID 或 version-skew 策略。
- CDN 必须正确处理动态响应的 private 或 no-store 与静态或 ISR 缓存；不能覆盖 Draft Mode 缓存头。
- WordPress 与前端均使用 TLS；生产凭据由 secret manager 注入。只有真正公开值才使用 `NEXT_PUBLIC_`。
- 具备构建、运行时错误、CMS latency、cache revalidation、Webhook failure 与 Core Web Vitals 的观测和报警。

### 11.2 初始化前必须确认

1. 当时稳定 Next.js 版本、Node 支持范围、包管理器和托管平台。
2. `cacheComponents` 或缓存 API 在锁定版本中的稳定状态；本文件不把 2026-07 文档快照当永久 API。
3. WPGraphQL primary 决策门及 REST fallback 对应字段契约。
4. Preview 最小权限身份、令牌格式、cookie 域、草稿媒体方案。
5. Webhook 事件 schema、签名、重放窗口、旧 slug、新 slug 与 publish 或 unpublish 事件。
6. CMS 或 CDN 图片 hostname 和 path、最大响应体、允许 MIME 与 SVG 策略。
7. 生产是单实例还是多实例；如多实例，先落实共享缓存和 tag coordination 再启用 ISR。

## 12. 官方一手资料

以下资料均访问于 **2026-07-22**：

| 主题 | 官方来源 | 本文件使用点 |
|---|---|---|
| App Router | https://nextjs.org/docs/app | App Router、Server Components、文件路由基础 |
| Server 与 Client Components | https://nextjs.org/docs/app/getting-started/server-and-client-components | 默认服务端组件、最小 client boundary、`server-only` |
| 国际化 | https://nextjs.org/docs/app/guides/internationalization | 动态 locale segment 与 layout 或 page 参数传递 |
| Draft Mode | https://nextjs.org/docs/app/guides/draft-mode | 缓存绕过、cookie、secret 或 slug 校验、open redirect 防护 |
| 缓存与重验证 | https://nextjs.org/docs/app/getting-started/revalidating | `cacheTag`、`revalidateTag`、`updateTag`、`revalidatePath` 选择 |
| `revalidateTag` API | https://nextjs.org/docs/app/api-reference/functions/revalidateTag | `max` 与 `expire: 0` 行为、Route Handler 可调用范围 |
| Error Handling | https://nextjs.org/docs/app/getting-started/error-handling | 预期错误、segment 和 global error boundary |
| `notFound()` | https://nextjs.org/docs/app/api-reference/functions/not-found | 404 终止与自动 `noindex` |
| Image | https://nextjs.org/docs/app/api-reference/components/image | remotePatterns、宽高、qualities、认证源限制 |
| Backend for Frontend | https://nextjs.org/docs/app/guides/backend-for-frontend | Route Handler 公共端点、安全、Webhook、Server Components 直读源站 |
| Environment Variables | https://nextjs.org/docs/app/guides/environment-variables | server-only 默认与 `NEXT_PUBLIC_` 构建期公开行为 |
| Self-hosting | https://nextjs.org/docs/app/guides/self-hosting | 多实例共享缓存、标签协调、deployment ID、加密 key |
| Deploying to Platforms | https://nextjs.org/docs/app/guides/deploying-to-platforms | Node runtime 与平台能力要求 |
| WordPress REST API | https://developer.wordpress.org/rest-api/ | 公共或私有内容和鉴权边界 |
| WordPress REST Authentication | https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/ | Cookie 或 nonce 与 Application Password 的服务端用途 |
| WPGraphQL CPT | https://www.wpgraphql.com/docs/custom-post-types | `show_in_graphql`、schema 名称与 public 或 private 暴露 |
| WPGraphQL Security | https://www.wpgraphql.com/docs/security | WordPress capability、draft 或 private 与字段级权限 |
| WPGraphQL Authentication | https://www.wpgraphql.com/docs/authentication-and-authorization | 远程服务端鉴权与草稿查询要求 |

## 13. 风险与交给 planner 的冲突提示

- 已接受 ADR-001 明确独立前端与 Headless WordPress，故历史 `docs/reference-site-analysis.md` 的 Elementor 实施章节不再是权威来源。
- 英语无前缀与 Next.js 官方“所有语言统一 `[lang]`”示例不完全相同；本文件选择薄双入口共享模板，代价是 route wrappers 数量增加，但公开 URL、缓存键和 metadata 更显式。
- WPGraphQL primary 需要插件和扩展能力，不能由 frontend lane 单独宣布安装；planner 必须与 CMS evidence 合并后形成最终协议决策。
- `revalidateTag` API 在近期版本已有签名演进；必须封装在 `lib/cache`，并在初始化任务按锁定版本写测试，不在业务查询中散落调用。
- 本次未初始化 `frontend/`、未安装依赖、未修改 WordPress 或 CMS，也未验证任何尚不存在的构建或运行时行为。
