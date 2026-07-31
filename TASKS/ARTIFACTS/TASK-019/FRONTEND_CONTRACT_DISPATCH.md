# TASK-019 Frontend Contract Dispatch

status: `AUTHORIZED_AFTER_MESSAGE_ACK`
owner: `frontend`

## Objective

建立两个彼此独立、可离线验证的前端合同基础：

1. WordPress `ProductConfigurationDocument 1.0.0` 的精确字节本地 snapshot
   与权威绑定 verifier；
2. Next.js 询价域独立 `QuoteLine 1.0.0` Schema、样本和确定性相等/合并语义。

本阶段只建立数据合同，不接入运行时、页面、浏览器状态或外部提交。

## Required delivery

### A. Product Configuration snapshot

在 `frontend/src/lib/cms/product-configuration-contract/**` 中建立：

- 一个闭合 manifest，硬绑定
  `TASKS/ARTIFACTS/TASK-019/PRODUCT_CONFIGURATION_HANDOFF_MANIFEST.json`
  与
  `TASKS/ARTIFACTS/TASK-019/PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256`
  的 canonical 路径和当前 SHA-256；
- WordPress 权威的精确四文件递归 Schema 闭包；
- FGD X15+PVC 唯一成功 Golden 的精确字节副本；
- 从权威错误容器按固定 selector 确定性重建的六个规范化错误样本；
- 仅使用 Node 内置模块的离线 verifier，验证权威路径/hash、17 项权威
  checksum 一致性、snapshot 精确 inventory/hash、闭合本地 `$ref`、版本、
  endpoint、query、成功样本与错误样本语义。

Verifier 必须在以下 mutation 中稳定 fail closed：权威替换或 source drift、
缺失/额外/篡改文件、manifest/path traversal、远程或未知 `$ref`、第二个标准
长度、重复 Article Number、同产品重复公开选择、猜测配件、内部字段、非法
包装或错误 endpoint/version/query。

### B. QuoteLine 1.0.0

在 `frontend/src/lib/quote-contract/**` 中建立闭合 Draft 2020-12 Schema、
TypeScript readonly 类型/最小语义函数、合法样本、非法样本与聚焦测试。

公共字段严格为：

- `contractVersion: "1.0.0"`；
- `product`: 稳定公开 UUID、model、canonical；
- `selection`: `article_number` 或 `custom_length` 两个互斥分支之一；
- `configuration`: `installationMethod` 与完整轨道包装选择；
- `quantityUnit: "piece"`；
- `quantity`: 大于零整数。

标准分支只允许真实 `articleNumber`、规范化 `lengthMeters` 与颜色；当前合法
样本只使用 `GDHEPRD000172 / 6 m / Ivory White`。定制分支必须是正数、最多
一位小数、`articleNumber: null`、`resolution: "sales_follow_up"`，不得生成
临时编号。

配置严格包含：

- `installationMethod: ceiling|wall`；
- `packaging.basePackaging: standard|carton|large_shrink_wrap`；
- `packaging.logoPrinting: boolean`；
- `packaging.protectionArrangement: single_bag|paired|null`。

相等/合并规则必须以真实测试证明：

- 数量不属于行身份；相同产品、标准 Article Number、选择与完整配置时累加
  数量；
- 安装方式、基础包装、Logo 或保护方式任一不同都保持独立行；
- 定制分支还比较精确规范化长度；不同定制长度不合并；
- 标准分支与定制分支永不合并；
- 输入行不得因比较/合并被原地修改；输出保持确定且可序列化。

合同不得包含 `lineKey`、客户端可信标记、价格、折扣、总价、换算系数、包装
件数、成本、供应商、库存、内部产品代码、WordPress ID、飞书 record ID、
内部备注、审核记录、凭据或诊断。

## TDD requirement

在写生产合同前分别观察并记录两个有效 RED：

1. Product Configuration verifier/snapshot 缺失；
2. QuoteLine Schema/语义能力缺失。

然后只做最小 GREEN。测试必须验证真实文件字节、Schema 实例和相等/合并
行为，不得只用源码字符串搜索代替行为证据。

## Allowed paths

- `frontend/src/lib/cms/product-configuration-contract/**`
- `frontend/src/lib/quote-contract/**`
- TASK-019-only `frontend/scripts/**`
- TASK-019-only `frontend/tests/**`
- `frontend/README.md`
- `docs/frontend/**`
- `TASKS/ARTIFACTS/TASK-019/**`
- `LANES/frontend/**`

根 `README.md` 由 Planner 所有；frontend 只在 execution report 中记录精确
建议增量，不直接修改。

## Protected paths

不得修改：

- `cms/**`、WordPress 数据库或真实内容；
- `README.md` 根文件；
- `frontend/package.json`、`frontend/package-lock.json` 或任何依赖；
- 现有 CMS/ProductCard snapshot、manifest、verifier 与其 authority；
- `frontend/src/lib/cms/server/**` 的 Transport、Validator、Adapter、consumer
  或错误语义；
- `frontend/src/app/**`、`frontend/src/components/**`、现有列表/详情页、
  `frontend/src/types/**`；
- TASK-001～018 artifacts；
- Planner-owned active task、Project State、Board、registry 或验收状态。

如果实现需要修改任一受保护路径、猜测新标准长度/配件，或需要运行时、UI、
存储/提交能力，停止并发送 linked blocker，不得选择方便的绕行。

## Validation

使用 Node `24.18.0` / npm `11.16.0`，报告精确计数：

- 新 Product Configuration verifier 与完整 mutation matrix；
- QuoteLine Schema 正/负例和相等/合并矩阵；
- 既有 CMS verifier `16/2/2` 与 ProductCard verifier `8/3/6`；
- 聚焦与完整 Vitest、lint、typecheck、production build；
- WordPress 17 项 authority parity、四 Schema/一 Golden/六错误样本；
- protected runtime/page、package/lock、旧 snapshot/verifier 与 CMS 的零差异；
- 无 runtime `cms/**` / `TASKS/**` import、无绝对路径/secret/internal-field
  泄漏；
- `git diff --check` 与 DPG project/registry/messages/strict lane gates。

若任何需要监听端口的测试只因沙箱 `listen EPERM` 失败，必须如实报告并请求
Planner 在当前共享字节上运行，不得制造 PASS。

## Expected artifacts

- `TASKS/ARTIFACTS/TASK-019/FRONTEND_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-019/FRONTEND_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-019/FRONTEND_TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-019/FRONTEND_DIFF_OR_OUTPUT_SUMMARY.md`

## Stop boundary

完成后只发送一份与派发消息关联的受控 `execution_response`，等待 Planner
独立 checkpoint。不得自行进行 adversarial review、用户验收、commit、push、
merge、部署、可见配置器、Add to Quote、Quote Basket、30 天持久化、联系表单、
Next.js submit endpoint、限流/验证码、飞书写入、邮件或 Webhook。
