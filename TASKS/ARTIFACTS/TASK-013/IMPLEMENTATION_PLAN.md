# TASK-013 Implementation Plan

## A1 — Planner baseline

- 核对 TASK-012 已确认业务规则和当前架构合同。
- 固定 evidence status 和 specialist 审计问题。
- 验证：任务状态、文档链接、允许范围和治理检查通过。

## A2 — Read-only specialist audits

### WordPress/CMS

- 核对 page type、collection projection、route manifest、navigation 和当前 Schema/API 的可表达性。
- 输出可直接使用、需要合同补充、需要后续 Schema/API 任务三类结果。

### Frontend

- 核对 TASK-014 消费所需路由、卡片、CTA、状态和 SEO 输入。
- 证明不会产生逐卡 `/resolve` N+1，也不泄漏 WordPress/SCF 原始结构。

### Localization/SEO

- 核对英语 canonical、robots、Breadcrumb、OG、Alt、JSON-LD 和非英语隔离。
- 区分当前模板技术 SEO 与未来多语言/内容 SEO。

## A3 — Planner synthesis

- 合并三个审计，向用户逐项确认会改变业务含义的开放问题。
- 产出 IA、URL/canonical、CTA、card projection、SEO、纵切候选和 gap report。
- 只把已确认且证据充分的结论同步到架构契约。

## A4 — Validation and review

- 运行 protected-scope、Schema count/hash、Markdown/local-link/absolute-path、project、registry、messages、strict lane audit 和 `git diff --check`。
- 派发独立 adversarial review。
- P0/P1/P2 全零后由 Planner fresh validate，并使用 checked helper 准备用户验收。

## Stop Conditions

- 需要访问或修改飞书、WordPress 数据库、CMS/API/Schema 或 frontend 代码。
- 需要猜测最终生产目录、域名、产品内容或 SEO 文案。
- 多个 specialist 结论冲突且会改变公开产品身份、URL 或 CTA。
