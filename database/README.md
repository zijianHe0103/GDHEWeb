# GDHE Database Foundation

正式数据库包，当前只包含 Site 与 Manual Track Catalog 七表。它不运行 API，不替代 `frontend/`、`cms/` 或 MySQL RFQ。长期边界见 [Core Database Architecture](../docs/architecture/CORE_DATABASE_ARCHITECTURE.md)。

## 文件与版本

- [src/schema.ts](src/schema.ts)：七表 Drizzle 声明。
- [migrations/0000_site_manual_track.sql](migrations/0000_site_manual_track.sql)：Drizzle Kit 生成并审查的结构 SQL。
- [migrations/0001_manual_track_lengths.sql](migrations/0001_manual_track_lengths.sql)：Custom SQL，仅初始化五个已确认标准长度。
- `migrations/meta/`：Drizzle Kit 原生声明快照和 Migration journal，必须与 SQL 一起保存；不是自建 Hash/Baseline/Gate。
- [scripts/migrate.ts](scripts/migrate.ts)：显式执行已提交 Migration，不承担删除或自动恢复环境。
- [tests/database.test.ts](tests/database.test.ts)：真实数据库行为测试；[tests/postgres.ts](tests/postgres.ts) 只创建和销毁自身一次性容器。

当前精确版本：Node.js 24.18.0、Drizzle ORM 0.45.2、Drizzle Kit 0.31.10、pg 8.23.0、TypeScript 5.9.3、tsx 4.23.13。集成测试镜像 `postgres:18.6-alpine`，服务端读回 18.6。其余开发类型依赖见 package.json；完整依赖图由 package-lock.json 锁定。

## 本地验证

需要 Node.js 24 和可运行 Linux 容器的 Docker。首次测试会在镜像缺失时拉取指定版本。进入本目录后：

```sh
npm ci
npm run typecheck
npm test
```

`npm test` 不读取外部 `DATABASE_URL` 作为数据库目标。它创建随机命名的 PostgreSQL 容器、随机密码、仅绑定 127.0.0.1 的随机端口及专用 `gdhe_test` 数据库。数据库位于容器 tmpfs；正常结束或测试抛错都在 finally 中按 Docker 返回的精确容器 ID 销毁，不删除本机或任意外部连接中的业务 Schema。异常清理行为本身有测试。

强制结束整个宿主进程或 Docker 不可用时，finally 不能保证运行。若出现残留，先用 `docker ps -a` 确认本次测试实际创建的容器，再按该精确 ID 清理；不要按名称通配符、数据库连接串或固定 Schema 批量删除。

测试从空库运行正式 migrate 命令，读回表、列和约束；执行合法关系、非法外键/重复关系/非法数值、禁止级联删除及事务整体回滚。输出的数据库查询结果是运行数据库证据。

## 声明生成与数据库执行是两件事

```sh
# 修改声明后生成候选 SQL；审查后才可执行。
npm run generate -- --name=describe_change

# 声明不变时，应报告 No schema changes；不连接或检查实际数据库。
npm run generate

# 需要数据迁移时，生成独立 Custom SQL 文件，再人工编写和审查。
npm run generate -- --custom --name=describe_data_change

# DATABASE_URL 由操作者在受控环境注入，目标必须先确认。
# 本命令需要 Migration Role，不会创建数据库或清理环境。
npm run migrate
```

`migrate` 使用 Drizzle 原生 Migration runner，另有 `drizzle.__drizzle_migrations` 工具元数据表；它不是第八张业务表。只允许运维/部署阶段显式执行，不接到应用启动中；不提供 `drizzle-kit push` 工作流。不要修改已经进入共享环境的历史 Migration，后续变更必须追加。当前是首版正式基础，尚无上一版正式业务库；空库执行与再次执行已验证，不把 Probe 升级实验宣称为本包的数据迁移证据。

## 当前模型选择

| 表 | 最小职责与约束 |
| --- | --- |
| `site.sites` | 调用方提供 uuid；稳定 key 唯一；生命周期状态和时间 |
| `catalog.categories` | uuid；稳定 code 唯一；中英文名称；可空 parent 外键；禁止直接自指 |
| `catalog.products` | uuid；当前 family 为 track；型号不强制唯一；名称；一个 Primary Category；状态和时间 |
| `catalog.colors` | uuid；稳定 code 唯一；中英文名称；状态和时间 |
| `catalog.product_colors` | Product/Color 复合主键及外键；is_public；状态；非负排序 |
| `catalog.track_products` | product_id 为主键兼外键；显式 allows_custom_length；数量单位仅 piece |
| `catalog.track_standard_lengths` | 正整数 length_mm 主键；非负排序；状态；初始化 4300/5800/6000/6300/6700 mm |

外键均即时检查，删除 RESTRICT，更新 NO ACTION，无延迟外键、CASCADE 或自动 ID 生成。只有主键和稳定 code/key 唯一性所需的索引，不预设业务查询索引。`active/inactive` 是领域生命周期，不代表页面发布；默认 inactive，公开关系另默认为 false。标准长度 Migration 中五项显式 active。

稳定 code/key 区分大小写；写入方负责统一规范化。数据库检查必要的非空/非纯空格，不承担全部输入规范化。时间为 timestamptz；created_at/updated_at 创建默认 now，后续写入方显式维护 updated_at。

Category 任意深度循环、发布完整性（如 Product 是否已具有轨道扩展）、公开配置的组合判断属于后续业务操作，本任务不引入递归触发器或 API。第一阶段仅支持 track；其他产品族需演进约束及专属结构。未确认的截面技术字段不设占位 JSONB。

没有预置真实 Site、Category、Product 或 Color 记录；测试内均为合成数据。没有 Product Spec、Article Number、重量、布带、Publication、RFQ、ERP、CRM、NestJS 应用或生产数据库。

## 已知工具链提示

当前 npm audit 全依赖报告 4 项 moderate，均由 Drizzle Kit 的开发依赖链引入；`npm audit --omit=dev` 为 0。对应 [esbuild 开发服务器 CORS 公告](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)。本包不启动 esbuild serve 或 Drizzle Studio，未执行 npm 建议的破坏性降级。该记录不是零漏洞声明；未来变更工具使用方式时应重新判断。
