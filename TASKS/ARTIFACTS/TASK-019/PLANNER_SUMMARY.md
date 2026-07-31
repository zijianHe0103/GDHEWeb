# TASK-019 Planner Summary

Date: 2026-07-31
Task: `TASK-019`
Planner result: `PASS`
Acceptance: `ACCEPTED`
Git delivery: `FORMAL_COMMIT_PENDING`

## 本次完成了什么

TASK-019 完成的是“产品规格与询价行的数据地基”，不是新的可见页面。

```text
飞书产品主数据（未来同步权威）
  -> WordPress Product Configuration 只读镜像/API
  -> 前端本地权威快照与离线校验器
  -> QuoteLine 1.0.0 询价行合同
  -> 后续可见配置器、询价清单和服务端提交共同消费
```

具体包括：

- 新增独立、匿名、只读的 WordPress Product Configuration 合同入口；
- 保持现有 `/resolve`、ProductCard 和 Content Schema 3 行为不变；
- 为 `FGD X15+PVC` 建立一个最小真实测试合同；
- 只允许已确认的 `GDHEPRD000172 / 6 m / Ivory White / piece`；
- 顶装与墙装不改变该 Article Number；
- 未取得真实 Article Number 的安装码不会被伪造为可选配件；
- 支持“自定义长度、尚无 Article Number”的明确询价分支；
- 冻结轨道包装的基础包装、Logo 印刷和保护方式组合规则；
- 建立前端 7 文件 Product Configuration snapshot 与独立 verifier；
- 建立独立 10 文件 QuoteLine 1.0.0 合同；
- 同一 Article Number 和完整配置重复加入时可合并数量；
- 安装、包装、Logo 或保护方式不同的行不会错误合并；
- 数量使用安全整数上限，越界和溢出会在返回结果前拒绝；
- WordPress ID、飞书 record ID、供应商、成本、价格、库存、利润和内部
  备注等字段不进入浏览器合同。

## 为什么这一步有意义

详情页后续不应该根据“长度、颜色、包装”等选项自行排列组合并猜测
Article Number。TASK-019 把这一条变成了可验证的技术规则：

- 标准选项只能来自真实存在并可公开的 Article Number；
- Article Number 全局唯一；
- 同一产品内，一个公开规格只能解析到一个 Article Number；
- 不同产品可以合法拥有相同的长度和颜色；
- 同一稳定产品身份如果对应冲突的型号、名称或路径，整组数据会 fail
  closed，不向前端输出半合法结果；
- 客户浏览器中的 QuoteLine 将来提交时仍必须由服务端重新验证，不能被
  当作可信数据。

这使后续配置器、30 天询价清单和飞书写入可以建立在同一套明确合同上，
避免页面先做完后再返工产品边界。

## 当前 FGD X15+PVC 合同

| 项目 | 当前值 |
| --- | --- |
| 公开型号 | `FGD X15+PVC` |
| 英语名称 | `FGD X15+PVC Track` |
| 产品路径 | `/products/fgd-x15-pvc/` |
| Article Number | `GDHEPRD000172` |
| 标准长度 | `6 m` |
| 颜色 | `Ivory White` |
| 网页数量单位 | `piece`（支） |
| 安装方式 | Ceiling / Wall |
| 自定义长度 | 允许，一位小数，无 Article Number |
| 安装配件 | 当前无真实编号，因此不输出假选项 |

本任务没有把示例中的 `4.3 m`、`5.8 m`、`6.7 m` 写成可选规格；这些
长度只能在飞书产品主数据中出现真实 Article Number 后再同步进入
WordPress。

## 验证结果

- WordPress 两次独立 Fixture 生命周期：不同数据库 ID、相同公开 Golden；
- 每轮精确清理 13 个测试产品，最终数据库和上传零残留；
- Product Configuration：`25/25`；
- QuoteLine：`23/23`；
- 联合聚焦测试：`48/48`；
- 完整前端测试：`26 files / 353 tests`；
- 三套离线 verifier、lint、TypeScript、生产构建：PASS；
- Product Configuration handoff：`17/17`；
- 四份 Schema 与一份 Golden 的 WordPress/前端字节一致：PASS；
- WordPress Core、SCF、12 张数据库表、PHP/JSON/Python 静态检查：PASS；
- 旧 CMS、ProductCard、TASK-016～018 页面/运行时、依赖和保护图片：无漂移；
- 最终独立审查 Round 2：`PASS / P0=0 / P1=0 / P2=0`。

Round 1 的 `FAIL / P0=0 / P1=2 / P2=1` 保留在历史中；其中权威文件
symlink 替换、超大数量静默错算和状态叙述过期三个问题均已修复并由
Round 2 独立复核关闭。

## 这一步暂时看不到什么

TASK-019 明确没有实现：

- 详情页中的规格选择器；
- 数量输入框；
- `Configure & Add to Quote`；
- Quote Basket 抽屉或完整页面；
- 30 天浏览器保存；
- 联系信息表单；
- Next.js 服务端询价提交入口；
- 飞书多维表格写入、限流、人机验证、幂等或熔断；
- 真实产品批量同步；
- 部署或公开发布。

因此本任务验收时应检查“合同是否正确、边界是否安全、后续是否可以稳定
消费”，而不是检查最终页面样式。

## 建议的下一小任务

TASK-019 正式验收并合并后，下一项建议只做：

`FGD X15+PVC 可见配置器 + 单条 QuoteLine 组合 + Add to Quote 本地交互`

它应消费本任务已经冻结的数据合同，在现有详情页显示真实规格、安装、包装
和数量选择，并生成一条合法 QuoteLine。完整 Quote Basket、30 天持久化和
飞书提交继续拆成后续独立任务，避免一次改动过大。

## 当前交付状态

TASK-019 已通过技术、审查与用户正式验收门，当前为
`ACCEPTED / FORMAL_COMMIT_PENDING`。

用户已输入精确正式交付口令。下一步只允许创建正式提交、推送任务分支、
fast-forward 合并并推送 `main`；不执行部署或 TASK-020。
