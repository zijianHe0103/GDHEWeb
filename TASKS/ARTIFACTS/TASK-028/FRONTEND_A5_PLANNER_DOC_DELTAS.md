# TASK-028 Frontend A5 Planner-owned Documentation Deltas

status: `UNAPPLIED_FOR_PLANNER`

The frontend lane did not edit `README.md` or
`docs/architecture/headless-wordpress-nextjs-contract.md`. Apply the following
exact minimal truth updates in Planner scope.

## Root README

### Replace the TASK-027-only paragraph under `产品配置与 QuoteLine 离线合同`

Replace the paragraph beginning `TASK-020/021 已将这些合同接入本地可见配置器`
with:

> TASK-020/021 已将这些合同接入本地可见配置器；TASK-022 建立了不含付款语义、同一浏览器保存 30 天的公开 Quote Basket；TASK-025/026 又交付 Quote Basket `3.0.0`、一次混合行校验与 RFQ Submission `2.0.0`。TASK-027 建立仅限本地开发、进程内非持久的 server-only `POST /api/rfq/intake/` Stub。TASK-028 现已在本地 `/request-a-quote/` 接入十字段客户表单、30 分钟本地 intent、一次同源 intake、客户安全回执以及仅在完整 Basket 快照和 token 精确匹配时的 accepted 清除；变化 Basket、processing 和全部失败都整篮保留，重试仅由客户显式触发且不自动轮询。该闭环仍是 `noindex,nofollow` 的本地测试切片；production、未配置和禁用模式下页面、intent 与 intake 均最终 404。它没有持久数据库、生产 secret/限流/challenge/trusted-proxy、安全供应商、飞书/CRM/邮件、队列、部署或公开发布能力。精确配置与验证命令见 [`frontend/README.md`](frontend/README.md#local-only-customer-rfq-form-and-submission-loop)。

### Replace the stale Product Detail sentence

Replace:

> 本地 `/request-a-quote/` 可查看、修改和删除条目，但客户可见最终提交仍未接入；TASK-027 仅建立隔离的本地 Stub intake 证明，生产持久化与飞书写入仍未建立。

with:

> 本地 `/request-a-quote/` 可查看、修改和删除条目；TASK-028 已接入十字段客户表单、仅本地进程内 Stub 提交和精确 accepted 快照清除。该能力在 production、未配置和禁用模式下最终 404，仍没有生产持久化、安全供应商、飞书/CRM/邮件或部署。

## Architecture contract

### Section 11 opening

Replace:

> 当前已实现浏览器本地 Quote Basket，以及 TASK-027 的本地、非生产 Next.js intake 纵向证明；客户可见提交、生产持久化/安全门和飞书写入仍未实现：

with:

> 当前已实现浏览器本地 Quote Basket、TASK-027 的本地非生产 Next.js intake，以及 TASK-028 的客户可见本地提交闭环；生产持久化/安全门、飞书/CRM/邮件和部署仍未实现：

### Add immediately after the TASK-027 bullet in section 11

> - TASK-028 在同一 `/request-a-quote/` 本地切片加入 Full Name、Company Name、Country/Region、City、WhatsApp、WeChat、Business Email、Phone、Company Website 和 Additional Requirements 十字段表单。新提交先取得绑定精确 Basket 快照、loopback Origin 和 30 分钟窗口的本地 intent，再执行一次同源 intake；公开响应必须通过 RFQ Submission `2.0.0` 闭合验证。只有 authentic accepted 回执、提交快照、当前存储快照和 snapshot token 全部匹配时才删除唯一 Quote Basket key；变化 Basket、processing 和全部错误整篮保留。客户只能显式重试，未引入自动重试、轮询或 attempt 持久化。该能力仍依赖进程内 Stub，重启丢失服务端状态；production、未配置和禁用模式下页面、intent 和 intake 均最终 404 且零业务调用。

### Replace section 11 item 4 final sentence

Replace:

> 当前仍未实现客户表单、生产幂等持久状态或飞书写入；TASK-027 仅实现本地 fail-closed Route Handler 和进程内非持久重放证明。

with:

> TASK-028 已实现仅本地客户表单、30 分钟 intent、客户安全回执、进程内重放和完整快照 accepted 清除；生产幂等持久状态、生产安全门、飞书/CRM/邮件和部署仍未实现。

### Section 14.4 stage 8 current-delivery sentence

Replace the sentence ending `但不代表客户表单、生产持久状态或飞书连接已经实现。`
with:

> TASK-027 已将该合同接入本地、非生产、进程内 Stub intake；TASK-028 又完成本地客户表单、intent、公开回执和精确 Basket 清除，但两者都不代表生产持久状态、安全供应商、飞书/CRM/邮件连接或部署已经实现。

## Required truth boundary

These deltas must not describe the local process-only Stub as durable or
production-ready. They must retain production final 404, zero external writes,
no durable storage, no Feishu/CRM/email, no production security supplier and no
deployment/public-release claim.
