# TASK-038 实施与验证记录

日期：2026-09-05。实施已完成；独立审阅、用户验收和 Git 交付分别记录，不互相代替。

## 起点与范围

HEAD 为 `603d670b78fbc577d2e8c750e8b3e0206b82f198`，当前工作分支 codex/task-037；TASK-037 已 CLOSED/ACCEPTED，起始 current_task=NONE。按用户要求先读取 AGENTS、Manifest、六个当前权威、TASK-037 三份归档以及 database README/声明/Migration/测试/依赖；未扫描其他历史任务或使用旧 articleNumberOptions 定义 Catalog。

保留开始前的 `.codex/config.toml`、`AGENTS.md`、`frontend/tsconfig.json`、`AGENTS.md.backup-20260905-125627`。无旧站、MySQL RFQ、WordPress、真实业务数据或外部系统操作。

## 交付文件

- `core/`：独立精确依赖/lock/TypeScript 构建，main、App/Catalog Module、配置、一个 Pool/Drizzle 生命周期入口、服务凭据 Guard、错误过滤、受控 HTTP Controllers、事务/搜索/投影 Service、单一 TypeBox + OpenAPI 合同、HTTP 集成测试与 README。
- `database/package.json`、`.gitignore`、`tsconfig.build.json`、`tests/package.test.ts`、README：仅增加 ESM 构建与消费适配。根 exports 指向编译后唯一 schema；`./testing` 指向编译后原 `tests/postgres.ts`。未复制测试容器框架。
- `docs/architecture/CATALOG_API_CONTRACT.md`：实际权限、PATCH 语义、搜索与投影边界及 TASK-039 交接；完整机器字段仍只定义在 Core contract.ts。
- Manifest：保留 `core_database_source=database`，新增 `core_source=core`、`catalog_api_contract=docs/architecture/CATALOG_API_CONTRACT.md`；PROJECT/CONTRACT 与 TARGET_ARCHITECTURE 仅将本次 Catalog REST/OpenAPI 从待选改为已实现方向。

`database/src/schema.ts`、全部 migrations（含 0000/0001 与原生 journal/snapshots）、database/package-lock.json 对起点 Git 无差异。没有业务字段、表、索引或第二套 journal 变更，未运行 generate 或 TASK-036 Probe。

## 精确版本与兼容性

Node 24.18.0 / npm 11.16.0；Nest common/core/platform-express 12.0.1；TypeBox 0.34.52；Ajv 8.20.0；ajv-formats 3.0.1；reflect-metadata 0.2.2；rxjs 7.8.2；TypeScript 5.9.3；tsx 4.23.13；@types/node 24.13.3、@types/pg 8.23.1、@types/express 5.0.6。Drizzle ORM 0.45.2、Kit 0.31.10、pg 8.23.0 沿用 TASK-037。真实 PostgreSQL 18.6。

npm registry 返回 Nest 12.0.1 稳定版本及 Node >=20 要求；官方 [迁移/ESM 文档](https://docs.nestjs.com/migration-guide) 与 Node 24 相容。实际以 TSC 编译后 `node dist/main.js` 启动并访问 PostgreSQL，不只凭依赖声明或 tsx 成功判定。

Core 干净 npm ci 审计 0 vulnerabilities；database 干净 ci 仍有原 Drizzle Kit 开发链的 4 moderate 提示，没有擅自更新旧工具链。详细既有提示见 database README。

## 实际 API 行为

接口全表和字段权威见 Catalog API Contract，下面仅记录实测结果：

| 能力 | 当前结果 |
| --- | --- |
| 维护 POST | 201，服务端生成 UUID；数据库读回一个 Product、一个 Track、三个明确颜色关系 |
| 相同型号再次 POST | 201，生成不同 ID，不合并；分别按 ID 可读 |
| 无/错误凭据、CMS 写入 | 401 / 401 / 403；伪造 x-role 不能提升权限 |
| CMS 读取内部维护路径 | 403，包含大小写变体路由；依据服务端 Controller metadata，不信任路径文本作身份判断 |
| 闭合输入 | 系统字段、Article Number、allowsCustomColor、额外嵌套字段、非法 UUID/枚举/数值、重复 Color ID（含大小写变体）均 400 |
| PATCH | 名称、Track 能力及指定颜色配置更新；未提交中文名/型号/关系保留，created_at 不变、updated_at 更新 |
| 明确颜色停用/不公开 | 原关系仍存在，CMS 英文公开事实不再返回；未提交关系不被隐式停用 |
| 创建时末段 Color FK 失败 | 409 reference_conflict；真实 SQL 插入顺序为 Product → Track → Color 关系；回滚后测试型号 Product 数 0，无孤立 Track |
| 更新时末段第二个 Color FK 失败 | 409；此前 Product/Track/第一个关系更新在同一事务，完整维护视图（含时间）与请求前一致 |
| 搜索 | 型号、中文、英文均可查；SQL 端 limit/offset、稳定 model+ID 排序；重复型号分页不混为一个 Product |
| 查询边界 | 空结果 200/items=[]，不存在产品 404，非法查询 400；百分号/下划线按字面搜索，不变成无限通配 |
| 参考数据 | Category/Color 分页、保留 inactive 状态；标准长度实时读 active 字典，不接受被忽略的分页参数 |
| 公开事实 | 只含限定英文事实；非公开/停用颜色不进入；inactive Product、inactive Category 或缺 Track 返回 null，不伪装有效轨道 |
| 数据库故障 | 撤销应用 SELECT 后健康/搜索/详情均 503，非空数组兜底；缺配置、相同凭据、数据库不存在均启动失败 |
| 原始 HTTP 错误 | malformed JSON 400，超过 100 KiB body 413，不返回输入诊断或堆栈 |
| 重启 | 关闭后应用连接数 0、HTTP 不再接受连接；同库重启后按 ID 读回相同 CMS 产品结果 |
| OpenAPI | 每条收集到的实际操作/状态均能找到对应 Schema，响应通过其校验；允许输入通过、多余敏感字段拒绝 |

请求测试使用专用 `core_test_app`（运行时随机密码，不记录值），非超级用户、非表所有者：只可 SELECT 必要 Catalog 表、INSERT/UPDATE 三张产品表。真实 SQL 负向证明 CREATE、DELETE、修改 Color、增加标准长度、读取 Migration journal 均为 42501。Migration、合成 Site/Category/Color 和角色准备使用独立测试管理员，业务 API 不使用管理员连接。

## TDD 与修正轨迹

1. 包消费测试先 RED：普通 Node 无法 import `@gdhe/database`。增加 build/exports 后 1/1 GREEN，无 Schema 改动。
2. Core 测试先 RED：构建入口尚不存在。最小启动、Guard、创建事务完成后 6/6 GREEN。
3. 完整 HTTP 场景先 RED：新增读取/PATCH/CMS/OpenAPI 尚为 404，23 PASS / 13 FAIL（含父测试）。补齐后 36/36 GREEN。
4. 构建中出现 ajv-formats CommonJS 默认导出在 NodeNext 下不可调用；核对实际模块 exports.default 后最小调整为其明确默认导出入口，编译和运行均通过。
5. 后续两项直接 RED：长度接口接受却忽略 limit，超大 body 错分 500；35 PASS / 3 FAIL（含父测试）。改为空查询合同及具体 body-parser 413 分类后 38/38 GREEN。启动清理异常边界补查也通过，未增加泛化错误框架。

## 干净安装后的最终主实施方验证

在各自目录，PATH 使用固定 Node 24.18.0 并保留本地 Docker：

```text
database: npm ci --ignore-scripts → npm test → npm run typecheck
exit 0；2 个测试文件，34/34 PASS；typecheck PASS。

core: npm ci --ignore-scripts → npm test → npm run typecheck
exit 0；1 个 HTTP 测试文件，38/38 PASS；生产 ESM build 和源代码/测试类型检查 PASS。
```

测试计数包括父测试，不表示 38 个文件。Core HTTP 主链约 8.3 秒；数据库包测试约 4.9 秒。所有数据来自本次随机一次性容器；应用先关闭再由原 helper finally 删除其精确容器 ID。正常、失败清理与数据库连接释放均有实际验证。既有 Docker 容器保留，无任务常驻服务。node_modules/dist 是被忽略的安装/构建产物，保留供本地运行，不称为已删除。

未在旧 frontend/cms 无改动时重跑其全套，不重复兼容性 Probe、不增加 Hash/Baseline/持续 Schema Gate。Git diff --check（含候选树中新文件）和正式 Schema/Migration 无差异检查通过。Manifest 三条 Core/database/API 路由存在、六个包/配置 JSON 可解析、README/合同本地链接可达，DPG structure profile 无 findings。最终唯一独立审阅 PASS 与现有 DPG 候选绑定单独写入 VALIDATION_REPORT。

## TASK-039 交接

用 CMS Bearer 凭据调用 `/v1/cms/products?q=...` 搜索，以 Core Product ID 绑定，再调用 `/v1/cms/products/{id}`。CMS 得到型号、中英文识别、分类、生命周期、当前 Track 能力以及有限英文 publicFacts；不是内部维护整行，也不拥有写入权限。

尚未实现：媒体、截面/完整技术参数、材质/安装的完整结构、allowsCustomColor、系列/兼容关系、Site–Product 分配、完整公开资格/产品版本，以及 WordPress 选择器、预览和发布。定制颜色方向没有被否定，缺字段不等于 false；这些缺口须由对应专项实现，不由 TASK-039 伪造。Publication、RFQ、Spec、重量、布带、ERP/CRM/飞书均未提前实施。

本记录不是用户验收或 Git 交付；当前没有提交、推送、合并、部署或外部业务写入。
