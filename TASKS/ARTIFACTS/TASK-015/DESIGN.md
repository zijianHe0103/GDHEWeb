# TASK-015 Design

## 1. Decision

建立一套与 TASK-008 `/resolve` Snapshot 完全隔离的前端 ProductCard 合同快照：

```text
TASK-014 CMS authority
  -> frontend ProductCard manifest
  -> exact 8-file Schema snapshot
  -> 3 representative success samples
  -> selected normalized error snapshot
  -> offline authority-bound verifier
```

目录固定为：

```text
frontend/src/lib/cms/product-card-contract/
  manifest.json
  schemas/
  samples/success/
  samples/errors/
```

不向 `frontend/src/lib/cms/contracts/**` 加入文件，不修改 `verify-cms-contract.mjs`。

## 2. Authority

直接权威：

- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_MANIFEST.json`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256`

稳定身份：

- source task：`TASK-014`
- handoff：`TASK-014-PRODUCT-CARD-1`
- REST API：`1`
- Content Schema：`3.0.0`
- ProductCard Schema：`1.0.0`
- endpoint：`/wp-json/gdhe/v1/product-cards`
- root Schema：`product-card-collection.v1.schema.json`

Snapshot manifest 必须记录两个权威文件的 canonical repo-relative path 和 SHA-256，verifier 必须验证：

1. 路径没有被替换；
2. 权威文件字节未漂移；
3. 权威 manifest 的版本、endpoint、8-file closure 和 checksum 与前端 manifest 一致；
4. 每个 Snapshot 文件与其 canonical source exact-byte parity。

## 3. Exact Schema Closure

从 TASK-014 manifest 取得且只允许以下 8 个文件：

1. `card-action.v1.schema.json`
2. `card-attribute.v1.schema.json`
3. `product-card-collection.v1.schema.json`
4. `product-card.v1.schema.json`
5. `public-path.schema.json`
6. `public-protected-media.v1.schema.json`
7. `public-taxonomy-ref.v1.schema.json`
8. `uuid-v4.schema.json`

`product-card-collection.v1.schema.json` 是唯一 root。所有非 fragment `$ref` 必须是留在 `schemas/` 内的本地引用；remote URI、protocol-relative URI、反斜杠、未知目标和 traversal 全部拒绝。

## 4. Representative Samples

Success Snapshot 固定为三份 exact-byte copies：

| identity | TASK-014 source | proof |
|---|---|---|
| `empty` | `golden-product-card/filtered-empty.json` | 0 items |
| `one` | `golden-product-card/one-item.json` | 1 item、total/totalPages、非空 series/applications |
| `all` | `golden-product-card/all.json` | N items、四种冻结 action |

三份已足以证明任务要求，不复制其他分页/排序 Golden。

Error Snapshot 从 `PRODUCT_CARD_ERROR_FIXTURES.json` 按以下排序 selectors 确定性重建：

1. `filter-taxonomy`
2. `locale`
3. `page-native-overflow`
4. `schema`
5. `sort`
6. `unknown-parameter`

它们覆盖 `gdhe_invalid_filter`、`gdhe_invalid_locale`、`gdhe_invalid_pagination`、`gdhe_invalid_schema`、`gdhe_invalid_sort` 和 `gdhe_invalid_parameter`。不发明新错误。

## 5. Manifest Shape

顶层只包含：

- `manifestVersion`
- `sourceAuthority`
- `restApiVersion`
- `contentSchemaVersion`
- `productCardSchemaVersion`
- `endpoint`
- `roots`
- `schemas`
- `samples`

每个 direct-copy entry 包含 canonical `sourcePath`、Snapshot 内 `snapshotPath` 和 lowercase SHA-256。Error entry另外包含 source-container SHA-256、selectors、expected code/status 和 rebuilt Snapshot SHA-256。

所有数组确定性排序、所有路径为仓库相对 POSIX 路径、禁止重复。

## 6. Verifier

`frontend/scripts/verify-product-card-contract.mjs` 只使用 Node.js built-ins，并导出可供 Vitest 调用的函数，同时支持 CLI。

验证顺序：

1. 定位 repository root 和固定 Snapshot root；
2. 解析并封闭校验 manifest；
3. 验证 canonical authority 路径、SHA-256 和稳定版本身份；
4. 核对 Snapshot exact inventory；
5. 对 8 个 Schema 和 3 个 success sample 做 source/snapshot exact-byte parity；
6. 从 error authority container 按 selectors 确定性重建 error Snapshot；
7. 计算 root 可达 `$ref` closure 并与 8 个 declared files 精确相等；
8. 校验 success 的 `apiVersion/schemaVersion/type`、0/1/N、四种 action 和非空 relation；
9. 校验 error code/status 与冻结 expected matrix；
10. 返回固定计数，CLI 输出单行 PASS。

任何失败抛出不含 absolute path、CMS origin、凭据或原始内容的稳定错误。

## 7. TDD And Mutation Matrix

必须先新增 focused test 并运行，观察因 verifier/Snapshot 不存在而产生的真实 RED。

GREEN 后 tests 只在临时 repository 副本中 mutation：

- canonical PASS；
- Schema source authority path substitution；
- authority manifest/checksum path substitution；
- authority manifest source drift；
- missing Snapshot；
- extra Snapshot；
- Snapshot byte tamper；
- manifest traversal；
- local `$ref` traversal；
- remote `$ref`；
- unknown local `$ref`。

不得修改正式 Snapshot 或 TASK-014 权威文件。

## 8. Runtime And Dependency Boundary

- Node.js `24.18.0`、npm `11.16.0`。
- 不新增依赖，不修改 `package-lock.json`。
- Next.js runtime 不从 `cms/**` 或 `TASKS/**` import。
- 本任务不建立 Transport、runtime Validator、Adapter、UI、Metadata 或页面。
- 生产 media origin/Next Image allowlist 继续是未来可见页面 gate。

## 9. Rollback

回滚只需删除 TASK-015 新增目录、verifier、focused test，撤销 `frontend/package.json` 的一个 script 和 README 段落。既有 TASK-008 `/resolve` Snapshot 与产品代码不受影响。
