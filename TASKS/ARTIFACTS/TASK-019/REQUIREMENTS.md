# TASK-019 Requirements

status: `CONFIRMED`
confirmed_at: `2026-07-31T08:57:09Z`

## 1. Authority

需求事实按以下顺序读取，不在本文件复制完整历史：

1. `TASKS/ACTIVE/TASK-019-product-configuration-quote-line-contract.md`
   的“已确认业务输入”“目标”“非目标”和“验收标准”；
2. `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md`
   中关于飞书/WordPress 权威、公开字段、轨道包装、数量、Article Number、
   多产品询价和 QuoteLine 身份的已接受决策；
3. `TASKS/ARCHIVE/TASK-018-fgd-x15-product-detail-slice.md`
   中已接受的公开型号、canonical 和本地测试候选边界；
4. 当前 GDHE Site、TASK-014 ProductCard authority 和 TASK-015 frontend
   snapshot 的真实代码与校验证据。

发生冲突时停止实施并交回 Planner，不使用 Fixture 或实现便利覆盖业务权威。

## 2. Required outcome

TASK-019 必须交付两个相互分离的版本化合同：

1. WordPress-owned `ProductConfigurationDocument 1.0.0`
   - 只读输出真实可配置产品事实；
   - 标准选择只来自真实 Article Number source rows；
   - 当前 Fixture 只允许 `FGD X15+PVC / GDHEPRD000172 / 6 m`；
   - 支持明确的无 Article Number 定制长度政策；
   - 不接收或保存询价行。
2. Next.js inquiry-domain `QuoteLine 1.0.0`
   - 表达已解析 Article Number 行与未解析定制长度行；
   - 使用完整规范化公开配置判断相等；
   - 数量不属于行身份；
   - 不包含价格、内部主数据或客户端可信标记。

WordPress authority 完成并经 Planner checkpoint 前，不得建立 frontend
snapshot 或 QuoteLine 实施。

## 3. Frozen business sample

- product stable identity: existing FGD X15+PVC public UUID from the Fixture;
- model: `FGD X15+PVC`;
- name: `FGD X15+PVC Track`;
- canonical: `/products/fgd-x15-pvc/`;
- single standard Article Number: `GDHEPRD000172`;
- standard length: `6 m`;
- color: `Ivory White`;
- quantity unit: `piece`;
- quantity: positive integer;
- installation: `ceiling|wall`, without changing the rail Article Number;
- custom length: positive decimal with at most one fractional digit and no
  Article Number;
- no other standard length, bracket Article Number or accessory may be invented.

## 4. Track packaging policy

- base packaging is required and exactly one of:
  `standard`, `carton`, `large_shrink_wrap`;
- Logo printing is an independent boolean;
- protection/arrangement is optional and one of:
  `single_bag`, `paired`, or absent;
- `single_bag` and `paired` are mutually exclusive by shape;
- the policy is track-specific and must not be generalized to other categories.

## 5. Explicit exclusions

- no visible configurator or Product Detail change;
- no Quote Basket or 30-day persistence;
- no submission endpoint, contact form or Feishu write;
- no live Feishu read, schema audit or sync;
- no WordPress QuoteLine storage or write route;
- no new dependency;
- no production product import, publication, deployment or Git delivery.

## 6. Stop conditions

Stop and return to Planner if implementation requires:

- a second editable Article Number authority in WordPress;
- a guessed standard option or accessory Article Number;
- a breaking change to Content Schema 3, ProductCard 1.0.0 or existing routes;
- a WordPress QuoteLine write model;
- live Feishu credentials or data;
- frontend runtime consumer or visible UI;
- a dependency or package-lock change.
