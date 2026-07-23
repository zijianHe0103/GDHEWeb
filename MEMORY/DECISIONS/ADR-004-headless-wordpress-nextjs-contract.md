# ADR-004：Headless WordPress + Next.js 架构契约

status: accepted
date: 2026-07-22
task: TASK-002
amended_by: ADR-005（等待 TASK-004 用户验收）

## 背景

ADR-001 已确认公开站采用独立前端、WordPress 作为 Headless CMS，`wp-admin` 是唯一最终内容管理后台；ADR-002 已确认英语根路径和另外八种人工译文独立发布；ADR-003 已确认 RapidDirect 只作为公开体验参考并采用小批次验收。

仍需决定前端渲染、WordPress API、内容字段、多语言插件、SEO 输出、预览、缓存、媒体和询盘的实施边界。

## 决策

1. 公开站使用 Next.js App Router + TypeScript；精确稳定补丁版在初始化任务中重新核实并锁定。
2. 已发布内容以 ISR 为主；搜索和草稿预览动态渲染；不使用纯静态导出。
3. API 采用 REST-first：WordPress Core REST、Polylang/Yoast 官方 REST 能力和 GDHE 自有 `/gdhe/v1` 归一化端点。首期不安装 WPGraphQL。
4. CPT、Taxonomy、权限、REST Schema 和发布 Hook 由 `gdhe-site` 自有插件以 PHP 注册；前端组件只消费版本化 DTO。
5. 推荐 ACF Pro 管理有限、结构化模块和重复字段；Field Groups 用 Local JSON 版本化。CPT/Taxonomy 不以数据库 UI 配置为唯一事实源。
6. 推荐 Polylang Pro 管理九种语言的独立实体、REST 译文关系和人工发布流程；不配置机器翻译发布。
7. 推荐 Yoast SEO 作为 `wp-admin` 编辑层；Next.js 是公开 canonical、hreflang、Metadata、Schema、Sitemap 和 robots 的唯一输出权威。
8. WordPress 通过短时 HMAC 预览链接连接 Next.js Draft Mode；草稿只由服务端最小权限身份读取。
9. WordPress 发布事件通过防重放 HMAC Webhook 触发按内容、路径、译文组、集合、导航和 Sitemap 标签失效。
10. WordPress Media Library 只存公开营销媒体；客户 CAD/附件通过受控 intake API、隔离对象存储和扫描流程处理。
11. 译文组使用 GDHE Site Plugin 持久化的受保护 UUID meta，不从 Polylang sibling ID、slug 或 URL 动态计算。
12. 首期保持 Polylang Media module 关闭；每次内容引用保存本地化 `MediaReference`，由当前语言内容实体拥有 attachment ID、alt、caption 与 decorative 状态。

完整、可实施的字段、URL、DTO、端点、错误、缓存和安全契约见 `docs/architecture/headless-wordpress-nextjs-contract.md`。

## 选择 REST-first 的理由

- WordPress REST 是 Core 能力。
- Polylang Pro 官方 REST 直接提供语言筛选和译文 ID 映射。
- Yoast 官方 Headless API 直接提供 REST JSON。
- ACF 官方支持选择性暴露 REST 字段。
- 当前页面关系可通过有限 `/gdhe/v1` 归一化端点解决；引入 WPGraphQL 还需维护 GraphQL、ACF、多语言和 SEO 扩展链，现阶段没有经测量的必要性。

数据访问层保留 adapter 边界。API fixture 任务以首页、Service、Case、Material 四类页面做预热后每类 200 次、并发 20 的同区域基准；至少两类需要超过 2 个串行 origin 请求、任一类 p95 超过 500 ms 或错误率超过 1%、至少两类规范化 JSON 超过 250 KB、或聚合增长到超过 5 个端点/3 个模板专属查询图时，强制启动 WPGraphQL 对照 PoC 与新 ADR。只有同一 fixture 指标显著改善且插件兼容门通过才替换 REST-first。

## 商业许可证边界

- Polylang Pro 与 ACF Pro 都需要单独采购和持续更新授权；密钥不得入库。
- 本 ADR 不构成采购或安装授权。
- 无商业许可证时，可用 Polylang Free + 自有 REST 适配、原生 registered meta/Block Editor 或 ACF Free 实现核心能力，但会增加自定义开发量，必须在初始化前单独确认。
- Yoast Free 可先满足编辑与 REST 读取；Premium 仅在明确功能收益后采购。

## 后果

### 正面

- 内容、译文和 SEO 保持在编辑人员熟悉的 `wp-admin`。
- 公开站不受 WordPress 主题、Elementor DOM 和插件前端资源约束。
- REST 依赖链较短，预览、缓存和多语言发布边界可测试。
- 页面模块结构稳定，适合 RapidDirect 类长页和后续模板复用。

### 成本与风险

- 需要维护 GDHE Site Plugin、REST DTO 和发布 Webhook。
- ACF Flexible Content 必须限制模块数量，否则会形成新的无约束页面生成器。
- Headless Yoast 输出不能直接照搬 WordPress 域名；Next.js 必须负责最终 URL 和 Schema。
- 多实例部署需要共享缓存/标签协调；外部 CDN 需要同步 purge。
- 九语言独立发布会产生持续人工编辑和 QA 成本，这是质量要求而不是可自动消除的成本。
- 每次媒体引用都要维护本地化 alt/caption，编辑字段数量增加；换来的是跨页面、跨语言的上下文正确性，且不依赖翻译 attachment。

## 明确不做

- 不使用 Elementor、WordPress 主题或 RapidDirect 私有主题渲染公开站。
- 不建立第二套内容后台或第二份内容数据库。
- 不把机器翻译直接发布。
- 不把机密 CAD 存入 WordPress Media Library。
- TASK-002 不初始化前端、不安装插件、不修改数据库、不部署。

## 状态门

本 ADR 已随 TASK-002 于 2026-07-22T09:07:14Z 由用户使用项目规定的正式验收口令接受，状态为 `accepted`。任何实现级变更仍需新任务与必要的新 ADR。

## 实施状态更新（2026-07-23）

ADR-005 提议只替代本 ADR 第 5、6 项中的实施建议：当前字段层采用已验证的 WordPress.org SCF，不采购/安装 ACF Pro；当前仅启用英语，WPML Multilingual CMS + ACFML 延后到生产英语站监控稳定三个月后的独立 PoC，不采用 Polylang 作为当前默认。该替代随 TASK-004 等待用户验收。

本 ADR 的 Next.js、WordPress `wp-admin`、REST-first、`gdhe-site`、SEO 单一公开输出、预览、Webhook/缓存、媒体、询盘与 WPGraphQL 量化重评门保持有效。
