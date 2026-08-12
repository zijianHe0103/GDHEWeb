# Decisions

schema_version: DPG-LANES-1.0.0

## 已接受

- [ADR-001：独立前端 + Headless WordPress](DECISIONS/ADR-001-headless-wordpress.md)
- [ADR-002：九语言人工翻译与独立发布契约](DECISIONS/ADR-002-multilingual-publishing.md)
- [ADR-003：RapidDirect 参考边界与小批次验收](DECISIONS/ADR-003-reference-and-delivery.md)
- [ADR-004：Headless WordPress + Next.js 架构契约](DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md)
- [ADR-005：英语优先、SCF 字段层与 WPML 延后](DECISIONS/ADR-005-english-first-scf-wpml-deferral.md)
- [ADR-006：真实产品优先路线与多语言成熟度门](DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md)

## 待决策

- 包管理器、草稿预览、Webhook/缓存失效与媒体实施细节。
- RFQ 的 v1 receipt/error、安全、幂等和 30 天保留规则已在 TASK-024 冻结；TASK-025 已建立 Article Number 可进入浏览器的不可信 Quote Basket `3.0.0` 与 `1..50` 行混合批量重新校验合同；TASK-026 已新增 additive RFQ Submission `2.0.0` 的五份闭合 Schema、Basket v3 投影和新的 RFC 8785/HMAC/comparison/snapshot 固定向量。仍待独立任务的是 Next.js intake、持久幂等/恢复存储、challenge 供应商、可见英语表单/回执、真实飞书字段映射与受控写入、生产来源拓扑和可观测供应商。服务端形态仍为 Next.js-only，不引入 NestJS。
