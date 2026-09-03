# TASK-036 PostgreSQL 与 Drizzle 最小兼容性验证报告

date: 2026-09-03
result: PASS

## 结论

在真实 PostgreSQL 18.6 上，精确锁定的 Drizzle ORM 0.45.2、Drizzle Kit 0.31.10 和 `pg` 8.23.0 能表达并执行 TASK-035 要求的代表性数据库能力。两项关键跨表同属关系均由 Drizzle Schema 和 Drizzle Kit 生成的复合外键直接保证；不需要用 Custom SQL 修补 TASK-035 的业务模型。

本验证额外实际执行了一条 Custom SQL Migration，把 Page 当前版本复合外键改为 `DEFERRABLE INITIALLY DEFERRED`，用于证明生成 Migration 后可以按顺序追加清晰、可审查的手写 SQL。延迟约束并非本任务规定关系成立的必要条件，因此最终分类为 `PASS`，不是 `PASS_WITH_CUSTOM_SQL`。

## 精确版本与核查来源

| 组件 | 精确版本 | 核查方式 |
| --- | ---: | --- |
| PostgreSQL | 18.6 | 官方 18.6 发布信息；真实容器内 `SHOW server_version` 与 `SELECT version()` 读回 |
| PostgreSQL 镜像 | `postgres:18.6-alpine` | Repo digest `sha256:d3e1620b530c944afa6e887d22eb899824da68e19c52024bf98f5220c88a65b2` |
| Node.js | 24.18.0 | `/Users/arron/.nvm/versions/node/v24.18.0/bin/node --version` |
| npm | 11.16.0 | 同一 Node 安装下 `npm --version` |
| Drizzle ORM | 0.45.2 | `npm view drizzle-orm version dist-tags --json` 的 stable `latest`；lockfile 精确锁定 |
| Drizzle Kit | 0.31.10 | `npm view drizzle-kit version dist-tags --json` 的 stable `latest`；lockfile 精确锁定 |
| PostgreSQL Driver | `pg` 8.23.0 | `npm view pg version dist-tags --json` 的 stable `latest`；lockfile 精确锁定 |
| TypeScript | 5.9.3 | 与当前项目主版本一致，在隔离验证包中精确锁定 |
| tsx | 4.23.13 | 隔离验证包精确锁定 |

验证容器仅绑定 `127.0.0.1:55436`，使用一次性本地测试凭据和三个可重建测试数据库；未连接或修改项目现有 MySQL、WordPress 数据库或任何外部系统。

## 验证资产

全部资产位于隔离目录 `TASKS/ACTIVE/TASK-036/PROBE/`：

- `package.json`、`package-lock.json`、`tsconfig.json`：独立工具链与精确依赖；
- `drizzle.v1.config.ts`、`drizzle.v2.config.ts`：上一版和当前最小 Schema 的 Drizzle Kit 配置；
- `src/schema-v1.ts`：用于升级测试的上一版最小结构；
- `src/schema-v2.ts`：当前代表性关系；
- `drizzle-v1/0000_baseline.sql`：上一版测试数据库的单独基线；
- `drizzle/0000_baseline.sql`：Drizzle Kit 生成的三 Schema 基线；
- `drizzle/0001_representative-relations.sql`：Drizzle Kit 生成的两项代表性复合关系；
- `drizzle/0002_page-pointer-deferrable.sql`：手写 Custom SQL Migration；
- `drizzle*/meta/**`：Drizzle Kit Migration 元数据；
- `tests/compatibility.test.ts`：真实 PostgreSQL 集成验证。

没有修改 Next.js、WordPress、既有 RFQ 合同或任何长期架构权威。

## TDD 证据

初始 RED 在数据库尚未迁移时直接查询 `publication.pages`：真实 PostgreSQL 返回关系不存在，Node Test 结果为 1 test / 0 pass / 1 fail。

实现后的最终 GREEN：

```text
tests 6
pass 6
fail 0
duration_ms 756.849917
```

最终测试包含一个父测试与五个实际数据库子测试：空库 Migration、约束与 JSONB、事务回滚、并发幂等、上一版升级。

一次中间 GREEN 尝试为 3 pass / 3 fail：数据库错误被 Drizzle 包在 `cause.code` 中，而测试只读取根 `code`；升级种子也误用了 v2 mapping。修正测试读取和 v1 种子映射后通过；未为此改变数据库约束或业务模型。

## 实际生成与执行的 SQL

`drizzle/0000_baseline.sql` 由 Drizzle Kit 生成，关键 SQL 包括：

```sql
CREATE SCHEMA "catalog";
CREATE SCHEMA "publication";
CREATE SCHEMA "rfq";

CREATE TABLE "publication"."page_versions" (... jsonb NOT NULL, ...);
CREATE TABLE "catalog"."product_specs" (...);
CREATE TABLE "rfq"."idempotency_records" (...,
  CONSTRAINT "idempotency_records_scope_key_unique"
  UNIQUE("scope", "idempotency_key")
);
```

`drizzle/0001_representative-relations.sql` 也由 Drizzle Kit 生成，关键 SQL 为：

```sql
ALTER TABLE "catalog"."track_product_specs"
  ADD CONSTRAINT "track_product_specs_same_product_fk"
  FOREIGN KEY ("product_id", "product_spec_id")
  REFERENCES "catalog"."product_specs"("product_id", "id")
  ON DELETE restrict;

ALTER TABLE "publication"."pages"
  ADD CONSTRAINT "pages_current_published_version_same_page_fk"
  FOREIGN KEY ("id", "current_published_version_id")
  REFERENCES "publication"."page_versions"("page_id", "id")
  ON DELETE restrict;
```

`drizzle/0002_page-pointer-deferrable.sql` 是实际执行的 Custom SQL：

```sql
ALTER TABLE "publication"."pages"
  ALTER CONSTRAINT "pages_current_published_version_same_page_fk"
  DEFERRABLE INITIALLY DEFERRED;
```

Migration 文件没有顶层 `DROP`、`TRUNCATE` 或 `DELETE`。重复运行 `drizzle-kit generate` 输出 `No schema changes, nothing to migrate`。

## 能力验证矩阵

| 能力 | 真实结果与读回证据 |
| --- | --- |
| PostgreSQL 多 Schema | `catalog`、`publication`、`rfq` 三个 Schema 均存在 |
| 主键 | 重复显式 Product `id` 被 PostgreSQL 以 SQLSTATE `23505` 拒绝 |
| 唯一约束 | 重复 Product code 和 Page slug 被 `23505` 拒绝 |
| 复合唯一约束 | 重复 `(product_id, spec_code)` 与 `(request_id, line_number)` 被 `23505` 拒绝 |
| 外键 | 不存在的 Product、Request 引用被 `23503` 拒绝 |
| 复合外键 | 两个同属关系的错误交叉引用均被 `23503` 拒绝 |
| CHECK | 非正 Page version、非正 Track length、非正 RFQ quantity 被 `23514` 拒绝 |
| JSONB | 写入对象后 `jsonb_typeof` 读回 `object`，嵌套 `lengthMm` 读回 `6000` |
| Drizzle Kit generate | v1 生成 7 tables；v2 生成 8 tables；最终重复生成无新差异 |
| 人工可审查 Migration | 两份生成 SQL 和一份 Custom SQL 均为短小、顺序明确的文本文件 |
| Custom SQL | 在两份生成 Migration 之后实际执行；`pg_constraint` 读回 `condeferrable=true`、`condeferred=true` |

数据库系统目录最终读回 8 张代表性表和 56 项约束/NOT NULL 条目。

## 两项代表性关系

### Page 当前版本同属 Page

合法的 `(page.id, version.id)` 更新成功。把 Page 1 的当前版本指向 Page 2 的 Page Version 时，真实 PostgreSQL 以 SQLSTATE `23503` 拒绝。

系统目录读回：

```text
FOREIGN KEY (id, current_published_version_id)
REFERENCES publication.page_versions(page_id, id)
ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED
```

### Product Spec 子记录同属 Product

合法的 `(product_id, product_spec_id)` 插入成功。使用 Product 2 搭配属于 Product 1 的 Product Spec 时，真实 PostgreSQL 以 SQLSTATE `23503` 拒绝。

系统目录读回：

```text
FOREIGN KEY (product_id, product_spec_id)
REFERENCES catalog.product_specs(product_id, id)
ON DELETE RESTRICT
```

## 多表事务整体回滚

事务先插入 `rfq.requests`，再向 `rfq.request_lines` 写入 `quantity=0` 触发 CHECK 失败。事务结束后直接读回：

```text
rollback_requests = 0
rollback_lines    = 0
```

第一张表的写入没有残留，证明事务整体回滚。

## RFQ 最小并发幂等

8 个并发调用使用相同 `(scope, idempotency_key, request_hash)`：

```text
created = 1
replay  = 7
idempotency_rows   = 1
concurrent_requests = 1
concurrent_lines    = 1
```

随后使用同 key、不同 hash 返回 `conflict`，`RFQ-MUST-NOT-EXIST` 未被创建。实现只用于验证 PostgreSQL 唯一约束、`ON CONFLICT DO NOTHING` 和事务组合，不是正式 RFQ Repository 或最终状态机。

## 空库从零迁移

对全新 `task036_empty` 数据库按顺序执行 `0000`、`0001`、`0002`：

- 3 个业务 Schema 存在；
- 8 张代表性表存在；
- Drizzle Migration 历史为 3；
- 所有正向写入、负向约束、事务与并发用例通过。

## 上一版测试数据库升级迁移

对全新 `task036_upgrade` 数据库先执行独立 `drizzle-v1/0000_baseline.sql`，写入：

- Product `LEGACY-TRACK`；
- Product Spec `LEGACY-SPEC`；
- Page `legacy-page`；
- Page Version 1，JSONB `{"legacy": true}`。

再执行当前完整 Migration。升级后读回：

- 旧 Product、Product Spec、Page、Page Version 与 JSONB 均保留；
- Page 当前版本指针成功指向旧 Version；
- 新 Track Product Spec 子记录写入，`finished_length_mm=4300`；
- Migration 历史为 3。

## 工具链说明

验证包的 `tsc --noEmit` 通过。`skipLibCheck` 仅用于跳过 Drizzle 包内本任务未安装的其他数据库方言/可选驱动声明；本验证源码仍被 TypeScript 5.9.3 完整检查。真实兼容性结论来自 PostgreSQL 执行，不依赖此设置。

安装时 npm 报告 4 个 moderate 开发工具链审计项；本任务未授权升级依赖，且它们不改变 PostgreSQL 兼容性结论。该事实不被表述为生产依赖安全验收。

## 最终验证命令

```text
npm ls --depth=0                                            PASS
npm run typecheck                                           PASS
npm run generate:v2                                        PASS; no changes
EMPTY_DATABASE_URL=... UPGRADE_DATABASE_URL=... npm test   PASS; 6/6
git diff --check                                            PASS
```

## 本地清理

- 一次性 `gdhe-task036-postgres` 容器已停止并因 `--rm` 被删除，三个测试数据库随容器删除；
- `PROBE/node_modules` 已可恢复地移入 `/Users/arron/.Trash/TASK-036-PROBE-node_modules-2026-09-03`；
- PostgreSQL 镜像仍作为普通 Docker 下载缓存保留，可由后续验证复用；
- `package-lock.json`、Schema、Migration、测试和报告保留为可复现证据；重新执行前运行 `npm install --ignore-scripts` 即可。

## 未实施的正式业务范围

- 未创建完整正式 PostgreSQL Schema、正式表名/字段类型/索引清单；
- 未创建 NestJS 项目或 Catalog、Publication、RFQ 正式模块；
- 未选择 ORM 之外的 Repository、Unit of Work 或 CRUD 抽象；
- 未导入真实 Product、Product Spec、客户或 RFQ 数据；
- 未迁移当前 MySQL RFQ；
- 未修改现有 RFQ 合同、Next.js 产品页面或 WordPress 数据流；
- 未实现 ERP、CRM、飞书、生产、库存或部署能力；
- 未增加 Hash、Baseline 或持续 Schema Gate；
- 未提交、推送、合并或部署。

## 最终判断

`PASS`

Drizzle 能满足 TASK-035 所需的 PostgreSQL 代表性能力，可以作为后续正式设计的 ORM 与 Migration 工具基线。Custom SQL Migration 能与 Drizzle Kit 生成迁移稳定共存，但本次业务约束本身不依赖 Custom SQL。没有发现需要修改 TASK-035 业务模型或 PostgreSQL、TypeScript、NestJS 一级技术方向的问题。

<!-- BEGIN DPG_VALIDATION_FINAL -->
```json
{
  "final_verdict": "PASS",
  "candidate_ref": "git-tree:fe265bd38c9b621a864c71b27cd824196be7fb8d",
  "validation_profile": "MEDIUM",
  "validator_lane": "planner",
  "unresolved_findings": [],
  "validated_at": "2026-09-03T11:26:51Z"
}
```
<!-- END DPG_VALIDATION_FINAL -->
