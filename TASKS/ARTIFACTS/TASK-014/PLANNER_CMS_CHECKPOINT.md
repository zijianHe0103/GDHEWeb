# TASK-014 Planner CMS Checkpoint

checkpoint_at: `2026-07-29T18:41:52Z`
result: `PASS_AFTER_P1_R1`
severity: `P0=0 / P1=0 / P2=0`
task_state: `IN_PROGRESS`

## 已确认通过

- WordPress/CMS Lane 已按 TDD 先得到缺少 ProductCard Schema 与 REST route 的有效 RED，再完成最小 GREEN。
- 新增 `GET /wp-json/gdhe/v1/product-cards` 与独立 ProductCard Schema `1.0.0`；既有 Content Schema `3.0.0` 和四个公开 endpoint 未改变。
- 0/1/N、分页、过滤、四格 action、无效候选排除、条件 `304`、两轮不同数据库 ID 的 Golden 稳定性、精确清理和 A3 回归均已通过。
- Planner 已独立重跑 ProductCard determinism、A3 runtime regression、Schema、handoff、PHP、JSON、零残留及治理检查。

## P1 发现

`gdhe_product_card_public_reference()` 当前验证了 source 中的：

- `id` 是 UUID v4；
- `publicPath` 可解析为唯一公开内容；
- 目标可以构造合法的公开 content envelope。

但它没有验证 source 的 `id` 是否等于该 `publicPath` 所解析目标的真实稳定公开 UUID。

当前 Fixture 已实际暴露该缺陷：

- source `primaryCategory.id`：`43000000-0000-4000-8000-000000000001`
- category landing `_gdhe_public_id`：`44000000-0000-4000-8000-000000000001`

因此 API 可以输出“合法 UUID + 合法路径”，但二者并不指向同一公开实体。该行为违背 `PublicTaxonomyRef.id` 作为被链接目标稳定公开身份的语义，并可能让未来前端缓存、去重和关联导航使用错误 identity。

## 窄修订要求

1. 先增加一个会因 reference `id` 与 resolved target public UUID 不一致而失败的回归测试，记录有效 RED。
2. 最小修复 `gdhe_product_card_public_reference()`：只有 source `id` 与唯一公开目标的稳定 public UUID 完全一致时才返回 reference，否则 fail closed。
3. 修正 TASK-014 Fixture，使合法 `primaryCategory.id` 与 category landing `_gdhe_public_id` 一致。
4. 至少增加一个 `mismatched_reference_id` negative candidate；同时证明相同验证覆盖 `primaryCategory`、`series` 和 `applications` 所共用的 reference helper。
5. 重新生成受影响的 Golden、machine evidence、handoff checksums 和 CMS 文档/执行报告。
6. 重新运行 ProductCard Schema/Golden/negative、0/1/N、两轮 determinism、A3 全回归、零残留、PHP/JSON、scope 与治理验证。

## 保持不变

- route、ProductCard Schema 版本和公开字段集合；
- 四格 action、资格先于 filter/total/pagination、一次 collection 请求和零逐卡 `/resolve`；
- Content Schema `3.0.0`、旧 endpoint 与 A3 合同；
- 无前端修改、无 SeoDocument、无真实产品导入、无飞书/RFQ/部署/Git 交付。

## 下一步

受控派发 frontend Lane 做只读 handoff 消费审计；本任务仍不允许修改 `frontend/**`。

## P1 R1 关闭证据

- 有效 RED：在真实 WordPress Fixture 上，可解析 publicPath 与错误 source UUID 的组合只因 identity mismatch 断言失败。
- 最小 GREEN：共享 helper 要求 source UUID 与唯一 resolved target 的稳定公开 UUID 完全一致，否则返回 `null`。
- 合法 Fixture：`primaryCategory.id` 已对齐目标 landing 的 `44000000-0000-4000-8000-000000000001`。
- negative：新增 `mismatched_reference_id`，并证明 `primaryCategory`、`series`、`applications` 共用的 reference 校验均拒绝 mismatch。
- Planner 独立重跑：两轮 ProductCard Fixture 使用不同数据库 ID，7/7 Golden hashes 相同；12/12 invalid/unpublished candidates 排除；A3 15 Golden、19-file graph、6 boundary negatives 和 runtime total `3/3/3` 通过。
- cleanup：TASK-014 与 A3 的 posts/meta/terms/options/marker 六项独立数据库读回均为 `0`。
- handoff：Planner 重跑产生新的运行证据后，已按当前真实字节重新冻结 24/24 SHA-256；复核全部通过。
- docs：根 `README.md` 与架构契约已同步 endpoint、8-file closure、未实现 frontend consumer/SeoDocument/可见页面和测试数据边界。
