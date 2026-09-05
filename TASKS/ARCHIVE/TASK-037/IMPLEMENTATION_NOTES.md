# TASK-037 实施与验证记录

日期：2026-09-05。当前为实施证据，非用户验收、Git 交付或生产部署。

## 交付范围

正式独立 `database/` 包：七表声明、结构 SQL、标准长度 Custom SQL、Drizzle 原生 metadata、精确依赖及 lock、migrate CLI、真实 PostgreSQL 测试和 README。未改造 TASK-036 Probe，未建立 NestJS/API。

Manifest 新增 `core_database_source: database`，从该目录 README 路由到声明、Migration、测试。Core Database Architecture 第 20 节说明当前七表选择；其余当前架构文档仅校正已验证工具、已确认逻辑与未实现机制的区别，未重审历史归档。

## 版本与生成 SQL

- Node.js 24.18.0；npm 11.16.0。
- Drizzle ORM 0.45.2；Drizzle Kit 0.31.10；pg 8.23.0。
- TypeScript 5.9.3；tsx 4.23.13；@types/node 24.13.3；@types/pg 8.23.1。
- 测试镜像 postgres:18.6-alpine；真实 `SHOW server_version` 返回 18.6。
- `database/migrations/0000_site_manual_track.sql`：2 个业务 Schema，7 张表，7 个主键，3 个 UNIQUE，5 个即时外键，16 个 CHECK。ID 无生成默认值、型号无 UNIQUE、无延迟外键、无级联、无删除 SQL。外键均 RESTRICT/NO ACTION。
- `database/migrations/0001_manual_track_lengths.sql`：只写入 4300/5800/6000/6300/6700 mm、排序 0..4、active；不包含测试产品或真实业务记录。

结构 SQL 由 `npm run generate -- --name=site_manual_track` 生成后逐项审查。字典通过 `npm run generate -- --custom --name=manual_track_lengths` 建立原生 Migration，再写入已确认值。Custom SQL 不是为弥补本次七表约束支持缺陷，不复制 Probe 延迟外键。

## 测试先行与实际修正

1. 在七表实现之前，真实空库执行空 Migration journal，表查询实际返回 `[]`，与七表期望不符；测试 exit 1，1 PASS / 2 FAIL（一个子测试加父测试失败）。失败路径容器清理通过。
2. 补齐 Schema/Migration 后，数据库行为已正确，但三项 RESTRICT 删除测试错误地预期 SQLSTATE 23503。真实 PostgreSQL 返回 23001，完整首次结果为 29 PASS / 4 FAIL（含父测试）。依据数据库错误与 PostgreSQL 官方错误码，只修改三个测试预期，不放宽约束。
3. 当前 `npm test` exit 0：33/33 PASS，0 skipped，约 3.75 秒。计数包含父测试和异常清理测试；不是 33 个独立文件。

## 证据 A：真实运行数据库

测试连接仅由自身新建容器产生；经真实 migrate CLI 执行，不使用 SQLite/Mock。

读回业务表恰好为：

```text
catalog.categories
catalog.colors
catalog.product_colors
catalog.products
catalog.track_products
catalog.track_standard_lengths
site.sites
```

通过 pg_constraint + pg_get_constraintdef 读回 31 个约束：7 个 PK、3 个 UNIQUE、5 个 FK、16 个 CHECK；全部 FK 的 condeferrable=false、confdeltype=r。典型读回：

```sql
PRIMARY KEY (product_id, color_id)
FOREIGN KEY (product_id) REFERENCES catalog.products(id) ON DELETE RESTRICT
FOREIGN KEY (primary_category_id) REFERENCES catalog.categories(id) ON DELETE RESTRICT
CHECK ((length_mm > 0))
CHECK ((quantity_unit = 'piece'::text))
```

information_schema.columns 读回 46 列，ID 为无默认值 uuid，时间为 timestamptz，长度与排序为 integer，没有 JSONB。完整约束和列结果由测试 diagnostic 输出，不以声明文本替代数据库查询。

| 行为 | 真实结果 |
| --- | --- |
| 5 条外键指向不存在记录 | 均拒绝，23503 |
| Product–Color / Track 扩展 / Site key / Category code / Color code / 标准长度重复 | 均拒绝，23505 |
| 零/负长度、负排序、错误状态、错误 family、错误单位、自指分类、空格型号 | 均拒绝，23514 |
| 小数毫米文本 | 拒绝，22P02 |
| 非空单位写 NULL | 拒绝，23502 |
| 删除被引用 Product、Color、Category | 均拒绝，23001；无级联 |
| 两个不同 Product 使用相同型号 | 成功；未误加型号唯一性 |
| 关系停用/不公开 | 关系保留 |
| 多表事务末次 Track 单位非法 | 整体拒绝；该事务 Product=0、Product–Color=0、Track=0 |
| 标准长度初始读回 | 五项及顺序精确、均 active |
| 再次 migrate | 工具账本仍 2 条，已有字典状态修改未被重新覆盖 |
| 主测试正常清理与注入异常清理 | 自有容器均删除，原有 Docker 容器清单保留 |

Drizzle 的 `drizzle.__drizzle_migrations` 是单独的工具元数据表，不是额外业务表。当前第一版正式基础没有上一版正式业务库，不伪称完成旧库升级或 MySQL 迁移。

## 证据 B：声明与 Migration 快照

完成上述数据库测试后，独立执行 `npm run generate`，exit 0：

```text
7 tables
No schema changes, nothing to migrate
```

目录仍为两个 SQL 文件与对应原生 snapshot/journal；没有未解释的新 Migration。此命令比较 Drizzle 声明和原生迁移快照，不连接运行数据库，不能替代证据 A。

## 其他验证与限制

- `npm run typecheck` exit 0。
- npm 安装全依赖 audit 保留 4 项 moderate；`npm audit --omit=dev --json` exit 0、漏洞数 0。开发链提示来源为 Drizzle Kit → esm-loader/core-utils → esbuild；未启用其开发服务器、未自动降级。公告与限制见 database README。
- 无 frontend/cms/MySQL RFQ 调用、迁移或业务代码改动。开始前 `.codex/config.toml`、`AGENTS.md`、`frontend/tsconfig.json` 的无关修改保留，不纳入本任务交付范围。
- 未运行旧站全量测试或重复 TASK-036 实验：新增包无旧应用接入，风险面是七表 SQL 与测试生命周期。
- 定向文档验证：Manifest JSON 与六个 package/migration JSON 解析成功；五条当前架构/源码权威路由均存在；DPG structure profile 无 findings；git diff --check exit 0。旧应用 Git diff 仅保留开始前已有的 frontend/tsconfig.json，cms 无差异；没有访问旧站数据库或运行其健康检查，故不宣称已重跑旧站验收。
- 独立最终审阅及治理检查结果由 `VALIDATION_REPORT.md` 记录。

当前仍未实施：Publication、RFQ、Product Spec、重量、布带、正式 Site/产品数据、Core 服务、权限部署、ERP/CRM/飞书及任何旧系统迁移。
