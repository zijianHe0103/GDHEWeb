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
- RFQ 的公开/权威/回执/错误 Schema、RFC 8785 + versioned-secret HMAC、固定向量、Basket 快照清除 token、重放优先级和 30 天保留锚点已冻结；仍待后续决策/实施的是无详情配件 opaque public quote key、additive Basket/submission 版本、1～50 行混合批量重新解析接口、持久幂等/恢复存储、challenge 供应商、真实飞书字段映射、生产来源拓扑和可观测供应商。服务端形态已冻结为 Next.js-only，不再把 NestJS 作为默认候选。
