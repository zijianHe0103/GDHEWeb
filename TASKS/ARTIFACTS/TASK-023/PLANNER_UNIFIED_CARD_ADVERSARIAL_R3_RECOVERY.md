# TASK-023 统一卡片 Adversarial Round 3 Recovery

时间：2026-08-07T16:47:22Z
结论：`FAIL / P0=0 / P1=1 / P2=0`

## 唯一 finding

正常 exact-key 返回状态、clamp、一次性消费、canonical 导航和浏览器 Back 均通过，但 `parseRelatedProductsReturnState` 在 `JSON.parse` 前缺少两个门：

1. 一个合法的 `1,000,044` 字符状态被接受，没有小型固定上限；
2. 一个 null-prototype hostile Proxy 被隐式转换为字符串并读取一次 `Symbol.toPrimitive`，没有在任何反射或强制转换前拒绝非 primitive string。

Malformed JSON 和额外 `productUuid` 仍正确拒绝。统一卡片视觉、quantity `1`、Basket-owned 数量修改、一次集合/零逐卡 resolve、保护媒体、server-only、production fail closed 与 Visual R4 `31/31` 均通过。

## 受控恢复

- linked response 已 validate 并 ACK/done。
- 按 `task-switch` 先运行 checked `task_transition.py reopen`；helper 因当前真实状态为 `UNDER_REVIEW`、只接受 `AWAITING_USER` 而安全拒绝，零 mutation。
- Planner 记录等价 `NEEDS_REVISION / NOT_ACCEPTED / DIRTY` 恢复，不伪造验收状态。

## 仅允许的最窄修订

- 在任何反射、转换或 `JSON.parse` 前要求输入为 primitive string；攻击值必须零 getter/trap/coercion 读取。
- 采用一个小型固定最大长度并在 `JSON.parse` 前拒绝超限输入；正常当前状态必须远低于上限。
- 增加 hostile non-string zero-trap 与 oversized-but-valid JSON 直接回归。
- 保持 exact keys、visibleCount clamp、一次性消费、native canonical navigation、sessionStorage unavailable 降级和所有 UI/Basket/CMS 行为不变。

修订完成后需要 fresh Planner checkpoint 和一次窄独立 closure review。当前不允许 final validation、验收、Git 或部署。
