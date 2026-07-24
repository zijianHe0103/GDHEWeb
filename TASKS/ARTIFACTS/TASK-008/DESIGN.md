# TASK-008 前端 CMS Contract Snapshot 设计

status: FROZEN
task_id: TASK-008
confirmed_at: 2026-07-24T16:57:40Z
owner_lane: planner
implementation_lane: frontend

## 1. 目的

TASK-008 只在 `frontend/` 内建立一份可独立消费、可离线验证、可追溯到 TASK-007 的 `/resolve` 合同快照。它不建立网络访问能力，也不生成可见页面。

完成后，开发者可以用一个本地命令确认：

1. 快照文件集合与 manifest 完全一致；
2. Schema 集合恰好是 `page.v3.schema.json` 和 `error.schema.json` 的本地传递 `$ref` 闭包；
3. 快照内容和 TASK-007 权威来源 checksum 一致；
4. 缺失、额外、篡改、未知引用或路径逃逸都会失败。

## 2. 权威来源和所有权

- CMS Schema 权威源：`cms/wp-content/plugins/gdhe-site/config/schemas/**`
- 成功样例权威源：`TASKS/ARTIFACTS/TASK-007/golden-a3/**`
- 错误样例权威源：`TASKS/ARTIFACTS/TASK-007/ERROR_CONTRACT_FIXTURES.json`
- 前端快照：`frontend/src/lib/cms/contracts/**`
- 机器可读索引：`frontend/src/lib/cms/contracts/manifest.json`

manifest 是前端快照的事实源，但不取代 CMS/TASK-007 的权威源。前端运行时不得导入 `cms/` 或 `TASKS/`。

## 3. 冻结集合

### 3.1 Schema 根

- `page.v3.schema.json`
- `error.schema.json`

### 3.2 完整本地 `$ref` 闭包

共 16 个文件：

1. `content-reference.schema.json`
2. `error.schema.json`
3. `file-reference.schema.json`
4. `link.schema.json`
5. `media-reference.schema.json`
6. `modules/accordion.schema.json`
7. `modules/card-grid.schema.json`
8. `modules/cta-banner.schema.json`
9. `modules/data-table.schema.json`
10. `modules/hero.schema.json`
11. `modules/rich-text.schema.json`
12. `modules/split-media.schema.json`
13. `page.v3.schema.json`
14. `public-path.schema.json`
15. `safe-html.schema.json`
16. `uuid-v4.schema.json`

不得加入 `collection.v3.schema.json`、`navigation.schema.json`、`route-manifest.schema.json` 或其独占依赖。

### 3.3 成功样例

- Product：`TASKS/ARTIFACTS/TASK-007/golden-a3/resolve-product-alpha.json`
- Page：`TASKS/ARTIFACTS/TASK-007/golden-a3/resolve-home.json`

两份文件必须按字节复制，manifest 记录源路径、快照路径和 SHA-256。

### 3.4 错误样例

只冻结以下两个错误对象：

- `gdhe_not_found`
- `gdhe_invalid_schema`

快照使用一个确定性 JSON bundle，内容从 `ERROR_CONTRACT_FIXTURES.json` 的两个同名顶层字段选择生成。manifest 同时记录权威源文件 SHA-256、选择器、快照路径和快照 SHA-256。校验器必须从权威源重新选择并以相同规则序列化，再和快照逐字节比较；不得手工维护第二份错误文案。

## 4. Manifest 合同

`manifest.json` 至少包含：

- `manifestVersion`
- `sourceTask: "TASK-007"`
- `apiVersion: "1"`
- `contentSchemaVersion: "3.0.0"`
- `roots`
- `schemas`
- `samples`

每个直接复制条目包含：

- 仓库相对 `sourcePath`
- `snapshotPath`，相对于合同快照根
- 小写十六进制 `sha256`

错误 bundle 另包含：

- 权威容器 `sourceSha256`
- 固定 `selectors`
- 派生快照 `sha256`

数组按路径排序。不得写绝对路径、平台相关分隔符、数据库 ID、凭据或运行时环境值。

## 5. 校验器

`frontend/scripts/verify-cms-contract.mjs` 只使用 Node.js 内置模块，并同时提供：

- CLI：从仓库根解析权威源和前端快照；
- 可测试函数：允许测试传入临时仓库根，不修改正式快照。

校验器按以下顺序 fail closed：

1. 解析和验证 manifest 基本字段、版本和条目唯一性；
2. 拒绝绝对路径、反斜线、`..`、空路径、重复目标和任何根目录逃逸；
3. 比较合同目录实际文件集合与 manifest 声明集合，发现缺失或额外文件即失败；
4. 验证所有声明文件 SHA-256；
5. 验证权威来源文件 SHA-256 和直接复制 parity；
6. 递归扫描两个根 Schema 的非 fragment 本地 `$ref`，拒绝远程、未知或逃逸引用；
7. 比较计算出的闭包和 manifest Schema 集合；
8. 从 TASK-007 错误容器重建两个错误样例并比较确定性字节；
9. 验证样例的 `apiVersion`，成功样例的 `schemaVersion`、`type` 和错误样例的 `code/status`。

成功输出简短 PASS 摘要；失败以非零退出码和可定位错误结束。

## 6. 测试策略

先写失败测试，再实现最少代码。测试在临时目录中复制必要来源和快照，至少覆盖：

- 完整快照 PASS；
- 缺失文件 FAIL；
- 未声明额外文件 FAIL；
- 单字节篡改 FAIL；
- manifest 路径逃逸 FAIL；
- 未知本地 `$ref` FAIL。

测试结束必须自动删除临时目录，且不得修改正式快照。

## 7. 文档和命令

`frontend/package.json` 只新增一个 parity script，不增删依赖。推荐命令名：

```sh
npm run verify:cms-contract
```

`frontend/README.md` 记录快照职责、权威来源、验证命令和非目标；明确 TASK-008 不会连接 WordPress，也不会产生页面。

## 8. 明确非目标

- HTTP transport、`WORDPRESS_API_URL`、URL builder、超时、重试；
- Ajv 或其他运行时 Schema validator；
- DTO、adapter、TypeScript 判别联合；
- `/integration/cms` 或任何 `src/app/**` 修改；
- CMS、Fixture、数据库、依赖和 lockfile 修改；
- collection、navigation、route manifest、多语言、SEO 或部署；
- TASK-009 的创建、设计或实施。
