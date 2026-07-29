# TASK-013 A2 Checkpoint

checkpoint_status: `PASS_WITH_USER_AND_FOLLOW_UP_GATES`

## Received audits

- Frontend: `PASS_WITH_BLOCKING_FOLLOW_UPS`，P0=0、P1=7、P2=1。
- WordPress/CMS: `PASS_WITH_REQUIRED_FOLLOW_UP_CONTRACTS`。
- Localization/SEO: `FEASIBLE_WITH_ENTRY_GATES`。

三份响应均已通过真实 Codex thread bridge 回传，并由 Planner ACK。

## Common conclusion

三条 Lane 没有架构冲突，共同确认：

1. 现有 server-only `/resolve`、Validator、opaque wrapper 和 Adapter 可以直接承载一个已知 canonical path 的英语产品详情纵切。
2. 当前 collection item 只有 `id/type/title/publicPath`，不足以渲染真实产品卡片；逐卡 `/resolve` 会形成被禁止的 N+1。
3. 产品卡片必须由单次 collection 响应返回 closed normalized projection；0/1/N 项都保持一次 collection 请求、零次 per-card resolve。
4. 当前 CTA 只是 generic link，不能证明 active/discontinued/replacement/quoteability/configuration 状态。
5. 当前 Schema 3 有 title/excerpt/publicPath/media 基础，但没有 normalized `SeoDocument`、indexability、停产/替代或 redirect 生命周期。
6. TASK-014 可以实现已冻结域合同的本地技术纵切，但 `TEST_CANDIDATE`、Local、Preview 和 Staging 必须 `noindex`，不得进入公开 route aggregation。
7. 10～20 个最终生产产品门、正式英语内容、公开保护图权利、生产 origin 和真实生命周期样本仍未通过。

## Required follow-up contracts before authentic list/card UI

- CMS/API：versioned normalized ProductCard collection projection。
- Frontend：Collection snapshot/Validator/Transport/Adapter 和 one-request/zero-resolve 证明。
- CMS/API + frontend：normalized `SeoDocument` 和 typed page-state contract。
- CMS/API：typed CTA/lifecycle/replacement/quoteability，或另一份明确验收的归一化来源合同。

这些缺口必须由后续独立任务实施；TASK-013 只冻结目标合同和任务边界。

## Planner result

技术证据足以进入 A3，但公开 IA、路由命名、CTA 目标和 TASK-014 测试候选会改变业务含义，必须由用户逐项确认。TASK-013 在第一个问题上进入 `PAUSED`，不自行猜测。
