# GDHE Target Architecture

status: CURRENT
authority_level: TARGET_ARCHITECTURE
project_contract: `PROJECT/CONTRACT.md`

## Purpose

本文档是 Manifest 当前 `architecture_contract` 的语义入口，只描述 GDHE 企业数字平台已经确认的目标架构边界，不是数据库、API、目录、部署或迁移实施设计。

完整长期治理边界和一级技术基线以 `PROJECT/CONTRACT.md` 为准；产品主数据逻辑模型以 `docs/architecture/PRODUCT_MASTER_LOGICAL_MODEL.md` 为准；首条公开产品纵向链路以 `docs/architecture/PUBLIC_PRODUCT_FLOW_CONTRACT.md` 为准。

## Confirmed Target Boundary

```text
GDHE 公开官网 / 未来网站 / WordPress 内容运营 / 内部后台 / CRM / 飞书协作
                              ↓
              统一 Core Application（NestJS / TypeScript）
                              ↓
               核心业务数据权威（PostgreSQL）
```

- 正式业务数据由统一核心数据层权威管理；WordPress、飞书和各前端不是同一业务字段的第二权威。
- 正式业务读写经过 Core Application；前端、WordPress 和飞书不直接修改 PostgreSQL。
- 第一阶段采用模块化单体，不自动拆分微服务。
- Next.js 用于公开网站及未来独立业务前端，但不承载所有系统共享的核心业务规则。
- WordPress 与 Gutenberg 保留为内容运营、页面编辑、草稿、修订和发布入口，不是产品、RFQ、CRM、生产或库存的核心后端。
- 飞书承担协作、通知和流程交互，不是核心业务数据库。
- 产品页面长期由 Core Application 组合 Publication 与 Catalog 后提供给 Next.js；正式 Next.js 页面不直接读取 WordPress 或内部数据库。
- 现有 WordPress、Next.js、RFQ 和本地 MySQL 能力采用渐进迁移；替代能力验收前不得删除。

## Open Implementation Decisions

第一阶段数据库逻辑骨架已在 `core_database_architecture` 确认；Drizzle ORM / Drizzle Kit 已通过 TASK-036 验证并验收。TASK-037 的正式 Site / Manual Track Catalog 七表源码与 Migration 通过 Manifest 的 `core_database_source` 发现。

TASK-038 建立本地 NestJS Core 与 Catalog 受控读写，当前采用 REST + OpenAPI。正式入口和本次接口合同分别由 Manifest 的 `core_source`、`catalog_api_contract` 路由；CMS 读取身份与维护身份分离，但这不是完整平台 IAM 或生产启用。

七表之外的物理设计、其他领域 API、完整身份认证/权限、WordPress 发布实现机制、飞书同步、CRM 工作流、消息队列、文件存储、部署和迁移顺序仍需专项确认。已确认的系统职责不表示具体机制已经实现；本文档不扩大任何实施授权。

## Historical Contract

`docs/architecture/headless-wordpress-nextjs-contract.md` 保留为 `SUPERSEDED / HISTORICAL` 的旧 Headless WordPress 实现与迁移背景，不再是 Manifest 当前架构权威。
