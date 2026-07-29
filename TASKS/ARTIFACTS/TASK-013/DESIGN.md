# TASK-013 Design

## Outcome

冻结一套足以直接进入 TASK-014 的英语产品页面公共合同，同时维持以下边界：

- 路由、CTA、产品卡片和 SEO 的结构可以冻结；
- 未经最终生产资料确认的产品值、目录成员和文案不能冻结；
- 当前 CMS/API 不可表达的内容只进入缺口报告；
- 本任务不通过修改 Schema、API 或页面代码“顺手解决”缺口。

## Authority

1. 用户在 TASK-012 中逐项确认的 GDHE 产品、询价、同步、媒体和发布规则。
2. ADR-006 与架构契约第 14 节的产品优先阶段顺序。
3. 当前 CMS/API/Schema 与 frontend consumer 的实际只读证据。
4. RapidDirect 的页面节奏/转化参考和 Forest 类产品目录参考，均不得覆盖 GDHE 事实。

## Contract Layers

### 1. IA and page identity

- 区分产品分类、系列、应用场景、产品 canonical 详情、配件目录和独立复杂规格产品页。
- 多入口只建立发现路径，不复制产品身份或 Article Number。
- 导航只是 IA 的受控公开子集，不等于自动展开全部 taxonomy。

### 2. URL and canonical

- 先冻结 path pattern、slug source、canonical ownership 和状态行为。
- 公开 origin 未确认时使用明确占位责任，不虚构域名。
- 停产保留 URL；替代关系不改变原产品身份。

### 3. CTA

- 正常在售：`Request a Quote`，加入多产品 quotation request 清单。
- 停产：`Contact Us for Replacement`。
- 未发布、无公开可报价规格或数据无效：不生成误导 CTA 或无效链接。

### 4. Product card projection

- collection 端批量返回卡片所需字段。
- 字段逐项声明来源权威、公开资格、必填/可空和缺失行为。
- 禁止逐卡 `/resolve`、客户端直连 WordPress 或读取原始 SCF。

### 5. SEO minimum

- 为首个正式英语模板冻结 title、description、canonical path、robots、OG、Alt、Breadcrumb 和允许的 JSON-LD 输入。
- 只输出已发布且可索引页面；当前不生成非英语 URL/hreflang。

## Evidence Status

- `CONFIRMED_RULE`：用户已确认、可进入合同。
- `CURRENT_TECHNICAL_FACT`：当前代码/CMS 只读验证成立。
- `TEST_CANDIDATE`：可用于 TASK-014 本地纵切，但不是生产发布授权。
- `USER_CONFIRMATION_REQUIRED`：会改变公开 IA、URL、CTA 或产品身份，必须询问用户。
- `FOLLOW_UP_TASK_REQUIRED`：需要 Schema/API/代码/外部系统变更。
- `PRODUCTION_DATA_GATE`：必须等待 10～20 个最终生产产品资料门。

## Execution Shape

1. Planner 建立追踪基线，不提前写最终答案。
2. WordPress、frontend、localization/SEO 并行进行只读审计。
3. Planner 合并审计结果，遇到业务分叉逐项询问用户。
4. Planner 写七份合同/缺口交付物并窄更新架构权威。
5. 完整验证后交给 adversarial reviewer。

## Protected Boundary

本任务不得修改 `frontend/**`、`cms/**`、数据库、飞书、Schema、API、依赖、运行环境、产品数据、媒体或部署。
