# TASK-027 Frontend A6 Planner-owned Documentation Deltas

owner: planner
status: APPLIED_BY_PLANNER_AFTER_CHECKPOINT

Planner applied and independently inspected the scoped root `README.md` and
architecture-contract deltas after receiving the A6 lane response. The
historical proposal below is preserved as the exact handoff record.

The frontend lane did not edit either protected document below. These minimal
truthful deltas were subsequently applied by Planner during the independent A6
checkpoint.

## Root `README.md`

Replace the sentence in the Product Configuration and QuoteLine paragraph that
currently says final submission and server-side resolution are not implemented
with:

> TASK-027 now adds a local-development-only, server-only
> `POST /api/rfq/intake/` proof: it validates RFQ Submission `2.0.0`, performs
> one complete TASK-025 mixed-line request for a new intent, and uses a
> process-local non-durable Stub Repository/Sink. It does not connect the
> customer-visible `/request-a-quote/` page, clear the Basket, provide
> production persistence/security gates, or write Feishu. Missing/disabled and
> production configurations remain final 404. Exact local configuration and
> verification commands are in
> [`frontend/README.md`](frontend/README.md#local-only-rfq-intake-runtime).

In the later Product Detail paragraph, replace only “最终提交与飞书写入仍未建立”
with “客户可见最终提交仍未接入；TASK-027 仅建立隔离的本地 Stub intake 证明，生产持久化与飞书写入仍未建立”.

## `docs/architecture/headless-wordpress-nextjs-contract.md`

In section 11, replace “当前只实现了浏览器本地的 Quote Basket 集合层；最终询盘提交、联系信息和飞书写入仍只冻结边界” with:

> 当前已实现浏览器本地 Quote Basket，以及 TASK-027 的本地、非生产
> Next.js intake 纵向证明；客户可见提交、生产持久化/安全门和飞书写入仍未实现。

Append this bullet after the TASK-025 mixed-batch bullet:

> - TASK-027 在 `frontend/` 建立了独立 RFQ Submission `2.0.0` 快照与
>   server-only 本地 `POST /api/rfq/intake/`。端点仅在非生产 exact stub
>   配置和显式 loopback Origin 下启用，执行 raw Origin/media/262144-byte/
>   fatal-UTF-8/one-parse 门、一次完整 TASK-025 mixed batch、进程内
>   Repository 和隔离 Stub Sink，并返回闭合公开 receipt/error。相同 intent
>   可本地重放，冲突 fail closed；production、disabled 和未配置均最终 404。
>   该状态不持久，重启即丢失，也不等于客户表单、30 分钟 intent issuer、
>   rate limiter/challenge、trusted proxy、生产 secret、飞书/邮件/queue、
>   外部交付或部署。

In item 4, replace only “当前仍未实现客户表单、Route Handler、幂等持久状态或飞书写入” with:

> 当前仍未实现客户表单、生产幂等持久状态或飞书写入；TASK-027 仅实现
> 本地 fail-closed Route Handler 和进程内非持久重放证明。

In item 11, replace only “当前未创建运行时 endpoint、持久幂等状态或飞书连接” with:

> TASK-027 已创建仅本地启用且 production 404 的运行时 endpoint；持久幂等
> 状态、客户表单和飞书连接仍未创建。

The delta must preserve the A3 and A5 initial FAIL/recovery histories in TASK
artifacts. It must not describe the Stub as durable, production-ready or
externally integrated.
