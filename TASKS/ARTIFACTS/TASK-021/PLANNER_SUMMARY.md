# TASK-021 Planner Summary

status: `READY_FOR_USER_ACCEPTANCE`
date: `2026-08-05`

## 完成内容

TASK-021 将 FGD X15+PVC 本地产品配置器按已确认业务逻辑调整为：

1. `Track Length` 首先显示真实 Article Number 派生的标准长度；
2. `Custom Length` 与标准长度处于同一级；
3. `Color` 紧随长度，只显示真实可用组合；
4. 客户不再选择 Installation；
5. Packaging 和 Quantity 保留；
6. `Add to Quote` 只生成并替换一条浏览器内存中的公开询价草稿。

当前测试数据仍只有 `6 m / Ivory White / GDHEPRD000172`。网站没有虚构
4.3 m 或 7 m 的可选规格；这些长度只有在未来飞书主数据同步出真实、完整、可发布
Article Number 后才会显示。

## 数据与安全边界

- WordPress 通过 Product Configuration `2.0.0` 提供只读配置权威；
- Next.js 只在 server-only 边界接收并校验 CMS 数据；
- 浏览器只拿到公开配置，不含 Article Number、内部 UUID、WordPress/飞书 ID、
  内部解析状态或诊断信息；
- 当前 `Add to Quote` 不产生完整 QuoteLine，不发送网络请求，也不写入存储；
- QuoteLine `2.0.0` 仅保留为未来最终 Request a Quote 时的服务端转换合同。

## 修订与质量结果

- Visual Round 1 的同源 hydration 和浏览器身份泄漏问题已修复；
- Visual Round 2：`PASS / severe 0 / obvious 0 / detail 0`；
- Adversarial Round 1 发现的一位小数误拒、PublicQuoteDraft/QuoteLine 权威冲突、
  handoff 19/20 均已关闭；
- Adversarial Round 2 final：`PASS / P0=0 / P1=0 / P2=0`；
- 历史 FAIL 与修订证据没有被覆盖。

## 最终验证

- CMS/frontend 一位小数完整文档：4.3/5.8/6.7 通过，6.05 拒绝；
- final CMS handoff 20/20，v1 handoff 17/17；
- frontend 40 files / 422 tests；
- 五套合同校验、lint、typecheck、build、三项 production smoke；
- WordPress Core/SCF、12-table DB、23/23 visual evidence 与治理门；
- 全部 PASS。

## 当前未包含

TASK-021 不包含相关产品横向滑动列表、多行 Quote Basket、30 天保存、合并/编辑/
删除、购物篮入口、询价表单、提交 API、服务端重新校验、反滥用、飞书写入、真实
产品批量导入、生产公开或部署。它们仍需后续独立小任务。

## 当前交付状态

功能与证据已准备好等待用户验收；尚未 commit、push、merge 或 deploy。
正式交付只接受精确口令：

`确认 TASK-021 完成并提交到远端`
