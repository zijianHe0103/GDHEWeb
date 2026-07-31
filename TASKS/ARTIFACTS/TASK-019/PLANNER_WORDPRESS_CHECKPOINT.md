# TASK-019 Planner WordPress Checkpoints

status: `PASS`
current_verdict: `P0=0 / P1=0 / P2=0`
checked_at: `2026-07-31T10:50:23Z`

## Round 2 — PASS

- 受控回执
  `MSG-TASK-019-WORDPRESS-STABLE-IDENTITY-P1-R1-CONTINUATION-RESPONSE`
  已 validate、ACK 并进入 done。
- 独立两轮 Fixture 生命周期重新执行成功：两个生命周期使用不同 WordPress
  ID，唯一 Golden 的 SHA-256 均为
  `3dba921d26bbab9e586bd8bb8479ab11be9420fc134bac03de255c08fc910fdf`，
  每轮精确清理 `13 posts / 0 terms / 0 uploads`。
- Round 1 的两个 P1 均由真实运行时回归关闭：
  - 不同稳定 UUID、不同 Article Number 的两个产品共享
    `6 m / Ivory White` 时，两条配置均保留且两个 canonical 均可解析；
  - 同一稳定 UUID 映射到不同
    `model/name/publicPath/productKind/quantityUnit` 时，该 UUID 的所有候选与
    两个路径都 fail closed。
- 全局重复 Article Number 与同一产品重复公开选择仍 fail closed；FGD
  X15+PVC 仍只公开 `GDHEPRD000172 / 6 m / Ivory White / piece`。
- Product Configuration Schema `4 files / 1 positive / 8 negative / 1 Golden`、
  请求错误 `6`、候选排除 `12`、`17/17` handoff checksum 均通过；POST
  独立返回 `404 rest_no_route`。
- 在 Planner 创建并已精确删除的 `/private/tmp` 隔离副本中，A3 两轮
  `15/15` Golden 与 ProductCard 两轮 `8/8` Golden 均保持确定；受保护
  Content Schema、ProductCard、frontend runtime/page、package/lock 和
  TASK-014 authority 与基线无差异。
- WordPress Core、SCF、12 表数据库、PHP、JSON、Python AST、最终
  TASK-019/A3/TASK-014 零残留、`git diff --check`、project/registry/message
  与 strict lane audit 全部通过。
- 结论：WordPress Product Configuration checkpoint 通过，frontend
  snapshot 与 QuoteLine 合同阶段可以按已确认范围受控派发。此 PASS 不代表
  TASK-019 验收、Git 交付、可见配置器、购物车、询价提交或部署授权。

## Round 1 History — FAIL

round_1_verdict: `P0=0 / P1=2 / P2=0`
round_1_checked_at: `2026-07-31T10:16:58Z`

## Passing evidence

- WordPress `7.0.2`、PHP `8.3.32`、SCF `6.9.2`、GDHE Site `0.6.0`；12 张数据库表健康。
- Product Configuration Draft 2020-12 递归闭包严格为 4 个文件；1 个正例、8 个 Schema 负例和 1 个运行时 Golden 通过。
- `/gdhe/v1/product-configurations` 仅注册 GET；POST 返回 `404 / rest_no_route`。
- 当前 FGD X15+PVC 公开结果严格只有 `GDHEPRD000172 / 6 m / Ivory White / piece`；顶装、墙装不改变轨道 Article Number，配件为 `null`，包装和定制长度政策符合冻结输入。
- TASK-019 两轮真实 Fixture 生命周期使用不同 WordPress ID，1/1 Golden SHA-256 均为 `3dba921d26bbab9e586bd8bb8479ab11be9420fc134bac03de255c08fc910fdf`；每轮精确清理 13 posts / 0 terms / 0 uploads，最终 TASK-019、A3、TASK-014 残留均为 0。
- 临时 CMS 文件副本中，A3 两轮 15/15 Golden、6 个边界负例和迁移回滚通过；ProductCard 两轮 8/8 Golden、请求/候选边界和精确清理通过。第一次 A3 尝试只因临时环境子进程命中不含 `jsonschema` 的系统 Python 而停止；确认零残留后，固定 `/opt/homebrew/anaconda3/bin/python3` 的继承 PATH 重跑通过。
- Core 与 SCF 官方 checksum、全插件 PHP lint、JSON parse、17 项 handoff checksum 和数据库检查通过。

## P1 — 公开选择唯一性错误地跨产品计算

当前 `gdhe_product_configuration_documents()` 的全局 `choice_counts` 只使用：

```text
lengthMeters | color.code
```

它没有包含产品稳定身份。独立可清理诊断创建了两个不同产品：各自的稳定 UUID、型号、canonical 与 Article Number 都不同，但都合法拥有 `6 m / Ivory White`。单独验证时两个配置均合法；聚合时实际返回 `0`，应返回 `2`：

```json
{
  "firstIndividuallyValid": true,
  "secondIndividuallyValid": true,
  "aggregateCount": 0,
  "expectedAggregateCount": 2
}
```

这会使未来任意两个型号共享相同长度和颜色时相互下线，违背产品稳定身份边界，也无法扩展到飞书多产品同步。

## P1-2 — 同一稳定 UUID 可以映射到互相冲突的产品身份

在第一个 P1 的最小修复后，Planner 继续按已冻结验收标准复核“不一致稳定身份 fail closed”。独立可清理诊断创建两个来源：两者复用同一产品 UUID，但型号、名称、canonical、Article Number 和长度不同。两个来源单独验证均合法，聚合实际返回 `2`，正确结果应为 `0`：

```json
{
  "firstIndividuallyValid": true,
  "secondIndividuallyValid": true,
  "aggregateCount": 2,
  "expectedAggregateCount": 0
}
```

这会让同一个公开 UUID 在不同 URL 指向两套产品事实，破坏稳定身份和未来 QuoteLine 复验。

## Required narrow revision

1. Article Number 继续保持全站唯一。
2. 规范化公开选择只在同一产品稳定身份内唯一；不同产品允许拥有相同的长度/颜色选择。
3. 一个稳定产品 UUID 只能映射到一套规范化产品身份（至少包含 model、name、publicPath、productKind、quantityUnit）；同 UUID 出现冲突身份时，所有冲突候选都 fail closed。
4. 增加一个短生命周期正向回归：两个不同产品、不同 Article Number、相同 `6 m / Ivory White` 时，两者都保留；同时保留同一产品选择映射多个 Article Number、全局重复 Article Number 与同 UUID 冲突身份的 fail-closed 证据。
5. 重新运行 TASK-019 两轮确定性、旧 A3/ProductCard 隔离回归、handoff/checksum、零残留与静态/治理门。

Frontend snapshot 与 QuoteLine 阶段继续阻塞，直到 Round 2 Planner WordPress checkpoint 明确通过。

## Cleanup

两组诊断 Fixture 均通过 `finally` 精确删除；每次复核后 TASK-019 posts/meta/option 为 `0/0/0`。Planner 临时 PHP 探针和 `/private/tmp/gdhe-task019-planner-regression.yJNFLU` 临时副本均已精确删除，不可恢复。
