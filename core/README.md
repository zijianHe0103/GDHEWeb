# GDHE Core — Local Catalog

可运行的 NestJS Manual Track Catalog 服务，使用 [正式 database 包](../database/README.md)。实际接口、PATCH 语义、权限和 TASK-039 缺口见 [Catalog API Contract](../docs/architecture/CATALOG_API_CONTRACT.md)；字段级 OpenAPI 来自 [catalog/contract.ts](src/catalog/contract.ts) 并由 `GET /openapi.json` 返回。

## 安装、构建与运行

需要 Node.js 24、npm；集成测试另需 Docker。保持现有 frontend/cms 不动：

```sh
cd database
npm ci
npm run build
cd ../core
npm ci
npm run build
npm run typecheck
```

`@gdhe/database` 通过 `file:../database` 本地依赖引用。根导出只加载编译后的 schema；`@gdhe/database/testing` 只供测试复用原一次性 PostgreSQL 辅助。没有第二份 Schema、Migration 或 journal。Core 使用 TSC 输出 ESM，启动是普通 Node，不依赖 tsx 转译 Nest 装饰器。

准备一个明确授权的本地 PostgreSQL 数据库后，由 **Migration 账户** 显式运行：

```sh
cd database
# DATABASE_URL 由安全环境注入，使用 Migration 账户而不是应用账户。
npm run migrate
```

本任务没有创建长期保留的业务数据库或真实参考数据。测试会自行初始化合成 Site、Category、Color；实际本地编辑库需由操作者使用授权的参考数据初始化流程准备，不能靠 API 自动创建 Category/Color。

以下仅为本地应用权限配置示例，由数据库管理员执行；账号密码用交互式 `\password gdhe_core_app` 设置，不写入 SQL 文件、仓库或日志：

```sql
CREATE ROLE gdhe_core_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
GRANT USAGE ON SCHEMA catalog TO gdhe_core_app;
GRANT SELECT ON catalog.categories, catalog.colors, catalog.track_standard_lengths TO gdhe_core_app;
GRANT SELECT, INSERT, UPDATE ON catalog.products, catalog.track_products, catalog.product_colors TO gdhe_core_app;
```

该账号不得是表所有者，不授予 CREATE/DELETE/Migration journal 读取或参考字典修改权限；也应确保目标库没有通过 PUBLIC 向其授予额外 DDL 权限。生产角色与权限平台仍未设计。

Core 启动时由安全环境提供：

| 变量 | 要求 |
| --- | --- |
| `CORE_DATABASE_URL` | 使用应用账户的本地 PostgreSQL URL，显式数据库名；不使用 Migration 账户 |
| `CATALOG_MAINTENANCE_TOKEN` | 随机 32..256 个字母/数字/下划线/短横线字符 |
| `CATALOG_CMS_TOKEN` | 同上，必须与维护凭据不同 |
| `CORE_PORT` | 可省略，默认 3100；测试用 0 获取系统分配端口 |

不要将变量值复制到任务报告、OpenAPI 或聊天日志。进程默认不加载 .env 文件，可在本地安全 shell 中注入或使用 Node `--env-file` 指向受保护且被 Git 忽略的文件。

```sh
cd core
npm start
# 等价于 node dist/main.js；始终监听 127.0.0.1。
```

启动检查配置与数据库产品表读取；缺失配置或数据库不可用则失败退出，不自动迁移、建表或 seed。整个应用只有一个 Pool，SIGTERM/SIGINT 关闭 HTTP 并释放数据库连接。更新 TS 后重新 build/start；本包不引入额外热加载/编排平台。

示例调用只引用环境变量，不包含真实凭据：

```sh
curl --fail-with-body -H "Authorization: Bearer $CATALOG_CMS_TOKEN" \
  'http://127.0.0.1:3100/v1/cms/products?q=track&limit=20&offset=0'
curl --fail-with-body -H "Authorization: Bearer $CATALOG_CMS_TOKEN" \
  'http://127.0.0.1:3100/openapi.json'
```

## 验证与清理

```sh
cd core
npm test
cd ../database
npm test
npm run typecheck
```

Core 测试从正式包导入原 `withPostgres`，创建自己的随机容器/数据库，显式执行正式 Migration，管理员准备合成参考记录和受限应用账户，然后以该应用账户运行构建后的 `node dist/main.js`。主要产品创建/更新走真实 HTTP；管理员 SQL 只用于初始化、独立读回和受控失败构造。

测试覆盖鉴权、关闭输入、三表创建/PATCH、数据库后续外键失败回滚、搜索、三种投影、OpenAPI、数据库故障、关闭重启及权限负向。只有自建容器 ID 会在 finally 中删除，正常/异常测试及连接池关闭均验证；不接收外部 DATABASE_URL 作为清理目标。不复制测试环境框架、不触碰旧 WordPress/MySQL 数据库。

若宿主进程被强杀而 finally 未执行，先用 `docker ps -a` 核实本次实际容器，再按精确 ID 清理；不按通配符删除。没有独立常驻测试服务或正式 seed 命令。无需重复 TASK-036，也不需在 Schema 未改动时反复 generate。

## 当前版本与限制

NestJS common/core/platform-express 12.0.1，TypeBox 0.34.52，Ajv 8.20.0，ajv-formats 3.0.1，reflect-metadata 0.2.2，rxjs 7.8.2；沿用 Drizzle ORM 0.45.2、pg 8.23.0。完整精确依赖见 package.json/lock。测试 PostgreSQL 为 18.6；Node 为 24.18.0。

Nest 12 的 [ESM/Node 要求](https://docs.nestjs.com/migration-guide) 与当前 Node 24 匹配；[生命周期说明](https://docs.nestjs.com/fundamentals/lifecycle-events) 支持本包 Pool/HTTP 关闭方式。未引入 Nest CLI、通用 Repository、生产日志/监控、缓存、队列或部署配置。

本服务不是完整公开产品合同：无媒体、完整技术参数、allowsCustomColor、兼容关系、Site 分配或发布资格；也未实施 WordPress、Publication、RFQ、Product Spec、重量、ERP/CRM/飞书。定制颜色的业务方向仍保留，不能将缺字段解释为 false。
