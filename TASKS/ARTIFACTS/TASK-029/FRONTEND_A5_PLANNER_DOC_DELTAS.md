# TASK-029 Frontend A5 Planner-owned Documentation Deltas

These deltas are exact recommendations for Planner-owned files. They are not
applied by the frontend lane.

## Root `README.md`

Replace the paragraph beginning with `TASK-020/021 已将这些合同接入本地可见配置器` with:

```markdown
TASK-020/021 已将这些合同接入本地可见配置器；TASK-022 建立了不含付款语义、同一浏览器保存 30 天的公开 Quote Basket；TASK-025/026 又交付 Quote Basket `3.0.0`、一次混合行校验与 RFQ Submission `2.0.0`。TASK-027 建立仅限本地开发的 server-only `POST /api/rfq/intake/` Stub；TASK-028 在本地 `/request-a-quote/` 接入十字段客户表单、30 分钟 intent、一次同源 intake、客户安全回执与精确 accepted 清除。TASK-029 又在本地 `persistent_stub` 模式下将进程内 Repository 替换为独立 `gdhe_rfq` MySQL Schema，并验证两个 Repository、两个 Next 进程、20 个同 Key 并发请求、跨重启重放与冻结崩溃窗口；只有 MySQL Repository 持久，隔离 Stub Sink 仍为进程内，pending/indeterminate 不会自动重发。这些仍是 `noindex,nofollow` 的本地测试切片；production、未配置和禁用模式下页面、intent 与 intake 均最终 404。生产 TLS、备份/恢复、高可用、托管密钥、限流/challenge/trusted-proxy、受控对账、真实 Sink、飞书/CRM/邮件、部署和公开发布仍未实现。精确 migration、启动、重启验证与清理命令见 [`frontend/README.md`](frontend/README.md#local-persistent-rfq-replay)。
```

No other root README paragraph needs to claim production persistence or an
external delivery system.

## `docs/architecture/headless-wordpress-nextjs-contract.md`

Apply these three hunks.

### Hunk 1 — Section 11 implementation-status introduction

Replace:

```markdown
当前已实现浏览器本地 Quote Basket、TASK-027 的本地非生产 Next.js intake，以及 TASK-028 的客户可见本地提交闭环；生产持久化/安全门、飞书/CRM/邮件和部署仍未实现：
```

with:

```markdown
当前已实现浏览器本地 Quote Basket、TASK-027 的本地非生产 Next.js intake、TASK-028 的客户可见本地提交闭环，以及 TASK-029 的本地 `persistent_stub` MySQL 幂等 Repository 与跨重启恢复证据；生产 TLS、备份/恢复、高可用、托管密钥、完整安全门、真实 Sink/对账、飞书/CRM/邮件和部署仍未实现：
```

### Hunk 2 — Section 11 implementation bullets

Insert immediately after the TASK-028 bullet:

```markdown
   - TASK-029 在当前本地 MySQL `8.4.10` 上建立与 WordPress `GDHE` 逻辑隔离的 `gdhe_rfq` Schema、显式版本化 migration、仅有 `SELECT/INSERT/UPDATE` 的运行账号，以及 server-only MySQL Repository。本地 `persistent_stub` 模式已证明两个 Repository、两个 Next 进程、20 个同 Key 并发请求、跨重启原结果重放与冻结崩溃窗口；同 Key/同内容零重复 mixed batch/Sink，同 Key/不同内容稳定冲突，新 Key 仍是新合法 RFQ。隔离 Stub Sink 仍是进程内；`delivery_pending` 和 `delivery_indeterminate` 不自动重发、删除或伪造成功，只保留未来受控对账入口。production、未配置和禁用模式仍在读取 Request、Repository、WordPress 或 Sink 前最终 404。该证据不代表生产数据库、TLS、备份/恢复、高可用、托管密钥、限流/challenge/trusted-proxy、后台 Worker、真实 Sink、飞书/CRM/邮件、部署或公开发布已完成。
```

### Hunk 3 — Section 14 stage 8 status

Replace the two bullets beginning with `TASK-024 的 v1 历史边界` and
`已完成顺序为` with:

```markdown
   - 主业务动作是 B2B quotation request，不引入购物结算、在线订单或支付。TASK-024 的 v1 历史边界保持不改；TASK-026 已完成基于 Quote Basket `3.0.0` 与 Article Number 的 additive RFQ Submission `2.0.0`，TASK-027/028 已建立本地 intake/客户表单闭环，TASK-029 已建立本地 `persistent_stub` MySQL Repository、并发与跨重启证据。它们仍不代表生产安全门、托管密钥、真实 Sink、飞书/CRM/邮件或部署已完成。
   - 已完成顺序为：TASK-025 关闭 Article Number/目录配件身份与最多 50 行 mixed batch 缺口，TASK-026 关闭 additive v2 submission/receipt/error/向量缺口，TASK-027 建立 Next.js local-only intake + 进程内 Stub Repository/Sink，TASK-028 建立本地英语客户表单、回执和精确 accepted 清除，TASK-029 建立本地持久幂等、崩溃保守恢复与跨进程/跨重启证据。后续仍按独立任务和停止门推进：生产数据库/TLS/备份/高可用/托管密钥与完整安全门 → 真实飞书映射只读核查 → 受控飞书 connector/对账 → HTTPS Staging、安全、隐私和运维验收。
```

These architecture deltas deliberately keep production fail closed and do not
authorize TLS, backup/restore, HA, managed secrets, rate limiting/challenge,
automatic reconciliation, a real Sink, Feishu/CRM/email, deployment or public
release.
