# TASK-014 Implementation Plan

status: `PLANNED_TDD_EXECUTION`

## Success criteria

1. 新 ProductCard collection route/Schema 是 additive、closed、versioned。
2. 一次请求返回 0、1 或 N 个完整卡片，`total` 只计算合法项。
3. 四格 action、媒体/分类/路径资格和内部字段排除均有正反证据。
4. 既有 Schema 3 19-file graph、15 份 Golden、`/resolve` 与 `collection.v3` 无回归。
5. Fixture 精确清理，数据库和 marker 零残留。
6. frontend 只读确认后续消费者不需要逐卡 `/resolve`。

## A1 — Baseline and design gate

- 记录 WordPress、SCF、GDHE Site、API 和 Schema 版本。
- 运行既有 Draft 2020-12 Schema/Golden 校验。
- 确认本地数据库可连接且 A3 Fixture option/marker 为零。
- 冻结 additive route、Schema closure、source mapping、资格矩阵和回滚边界。

Gate：`DESIGN.md`、本计划、治理验证和 `git diff --check` 全部通过后，才允许修改插件实现。

## A2 — TDD RED

wordpress_cms lane 先新增测试，不先新增生产实现：

1. Python Schema test：
   - 期望新 closure 存在且可递归解析；
   - 正向 Golden 有效；
   - extra property、内部 ID、错误 path/action、未保护媒体、空 Alt、超过 3 attributes 等负例无效。
2. PHP runtime contract test：
   - 期望 route 已注册；
   - 期望 0/1/N、分页、排序、筛选和四格 action；
   - 期望 invalid item 不进入 total；
   - 期望响应无 `postId/databaseId/attachmentId/meta/acf/scf/feishu` 等内部字段。
3. 既有 A3 regression test 保持不变。

必须实际运行并记录预期 RED 原因；测试因语法错误、环境故障或错误断言失败不算有效 RED。

## A3 — Minimal GREEN implementation

- 新增独立 ProductCard Schema closure。
- 在 manifest 中新增 ProductCard contract/endpoint 键，不改变 Content Schema 3.0.0。
- 注册只读 `/gdhe/v1/product-cards`。
- 实现严格 query validation、资格投影、四格 action、过滤、稳定排序和验证后分页。
- 增加独立 TASK-014 Fixture command/source support，只实现测试所需的最小写入与精确 cleanup。
- 如需要 wp-admin 长期 SCF 字段，停止，不实施。

Gate：新测试 GREEN；旧 Schema/Golden/PHP syntax 回归 GREEN。

## A4 — Real local WordPress validation

1. 在 `.local/backups/TASK-014/<timestamp>/` 创建不可变数据库备份和 checksum；该目录保持 Git ignored。
2. 确认运行前 A3/TASK-014 Fixture 与迁移 marker 为零。
3. 创建 TASK-014 Fixture。
4. 通过 WordPress REST runtime 执行：
   - 0/1/N；
   - `modified_desc` 与 `title_asc`；
   - category filter；
   - 四格 action；
   - invalid exclusion；
   - cache/error envelope；
   - one endpoint request carries complete card data。
5. 运行 Schema/Golden/negative validation。
6. cleanup 后重复检查 option、postmeta、termmeta、uploads/temporary files 和迁移 marker 为零。

若任何 cleanup/read-back 失败，停止并按备份计划恢复；不得用宽泛删除修复。

## A5 — Handoff and documentation

- 生成 Schema graph、ProductCard closure 清单和 SHA-256。
- 写 `EXECUTION_REPORT.md`、`DIFF_OR_OUTPUT_SUMMARY.md`、`TEST_OR_VALIDATION_LOG.md` 与前端 handoff。
- 最小更新根 README、`docs/cms/README.md` 和架构契约，内容必须与真实 route/version/命令一致。
- frontend lane 做只读 handoff/N+1 审计，保持 `frontend/**` 零修改。

## A6 — Independent review

- Planner fresh validation：
  - PHP syntax；
  - JSON parse；
  - Schema/Golden/negative；
  - local REST runtime；
  - legacy regressions；
  - protected scope；
  - Markdown/local links；
  - project/registry/messages/strict lane；
  - `git diff --check`。
- adversarial_reviewer 检查 breaking change、N+1、内部字段泄漏、错误 action、假生产资格、Fixture 残留和越权前端实现。
- 只有 `PASS / P0=0 / P1=0 / P2=0` 后，Planner 才可 fresh validate 并使用 checked helper 准备用户验收。

## Rollback

- 源码回退仅限 TASK-014 新增/修改文件，不触碰已有 A3 Fixture 或生产数据。
- 数据回退优先使用 TASK-014 精确 manifest cleanup；只有 cleanup 失败且经确认才使用本任务不可变数据库备份。
- 不执行 `reset --hard`、force push、宽泛 SQL 删除或清空 uploads。

## Explicit non-authorization

本计划不授权 frontend 实现、可见页面、SeoDocument、飞书连接、生产导入、部署、依赖安装、Git commit/push/merge 或任务验收。
