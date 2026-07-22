# 项目上下文

schema_version: DPG-LANES-1.0.0

## 背景

- 项目为 GDHE 海外企业官网，主要面向英语及其他八种语言的 B2B 客户。
- RapidDirect 是信息架构、页面模板、视觉、响应式、SEO 和询盘转化的参考站。研究快照位于 `docs/reference-site-analysis.md`。
- 该研究文档第 1～11 节仍是参考站证据；第 12～15 节的 WordPress + Elementor 实施路线已被当前 Headless WordPress 决策取代。
- 公开站将使用独立前端框架；框架和 API 协议尚未确认。

## 运行说明

- 项目根目录已初始化 Git，当前无正式提交。
- WordPress 运行根：`cms/`；本地站点：`http://127.0.0.1:8080/`；后台：`/wp-admin/`。
- 已验证基线：WordPress 7.0.2、PHP 8.3.32、MySQL 8.4.10、数据库 `GDHE`。
- `cms/` 是本地 WordPress 运行时，Git 仅跟踪 GDHE 自有 CMS 扩展；`wp-config.php`、WordPress 核心、上传、缓存和第三方插件不入库。
- `.local/` 包含本地路由和数据库备份，已整体忽略。
- 使用 WP-CLI 时显式指定 `--path=cms`。本地站点只在 PHP/MySQL 服务运行时可访问。
- 凭据、WordPress salts、管理员密码和数据库备份不得写入治理 Markdown 或 Git。
