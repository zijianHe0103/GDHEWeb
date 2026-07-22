# ADR-001：独立前端 + Headless WordPress

status: accepted
date: 2026-07-22

## 背景

项目曾评估 WordPress + Elementor 和 RapidDirect 定制主题路线。随后确认需要更灵活、高性能、易于实现复杂响应式与交互的公开站，同时保留 WordPress 的成熟编辑体验。

## 决策

- 公开站使用独立前端框架，不由 WordPress 主题或 Elementor 渲染。
- WordPress 作为 Headless CMS，负责内容、媒体、SEO、译文、发布状态和受控 API。
- `wp-admin` 是最终内容管理后台；原“第二阶段再开发一套独立后台”路线废止。
- WordPress 自有服务端功能放在独立站点插件/MU Plugin，不绑定展示主题。

## 影响

- `docs/reference-site-analysis.md` 中的 WordPress + Elementor 实施章节仅保留为历史分析，不再是实施权威来源。
- 前端框架和 API 协议需通过后续任务单独决策，本 ADR 不预选 Next.js、Nuxt、REST 或 WPGraphQL。
- 自有代码、CMS 数据契约和展示模板必须分层，避免内容与主题绑定。
