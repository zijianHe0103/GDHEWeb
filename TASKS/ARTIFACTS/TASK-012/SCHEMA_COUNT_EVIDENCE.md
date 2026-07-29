# TASK-012 Schema 19/16 统计证据

verified_at: 2026-07-26T05:01:01Z
result: PASS

## 统计对象

两个数字统计不同消费闭包：

- **CMS 19-file graph**：TASK-007 CMS 权威合同，以 `page.v3.schema.json`、`collection.v3.schema.json`、`navigation.schema.json`、`route-manifest.schema.json` 和 `error.schema.json` 为根，递归跟随所有非 fragment 的本地 `$ref`。
- **Frontend 16-Schema closure**：TASK-008 固定、TASK-010 编译、TASK-011 消费的前端本地 `/resolve` 合同，以 `page.v3.schema.json` 和 `error.schema.json` 为根。

## 机器复算结果

```json
{
  "cmsCount": 19,
  "frontendCount": 16,
  "cmsOnly": [
    "collection.v3.schema.json",
    "navigation.schema.json",
    "route-manifest.schema.json"
  ],
  "frontendOnly": [],
  "frontendManifestAndByteParity": true,
  "a3FileListParity": true,
  "a3HashParity": true
}
```

复算读取当前 CMS Schema 源、`TASKS/ARTIFACTS/TASK-007/A3_SCHEMA_VALIDATION.json` 和 `frontend/src/lib/cms/contracts/manifest.json`：

1. 对五个 CMS 根递归解析本地 `$ref`，路径相对 `cms/wp-content/plugins/gdhe-site/config/schemas/` 规范化并排序。
2. 将 19 个当前文件的 SHA-256 与 TASK-007 `schemaGraphSha256` 比较。
3. 将前端 manifest 的 16 个 `sourcePath` 与对应 snapshot 逐字节比较，并验证 manifest SHA-256。
4. 比较两个集合的差集。

## CMS 19-file transitive graph

```text
collection.v3.schema.json
content-reference.schema.json
error.schema.json
file-reference.schema.json
link.schema.json
media-reference.schema.json
modules/accordion.schema.json
modules/card-grid.schema.json
modules/cta-banner.schema.json
modules/data-table.schema.json
modules/hero.schema.json
modules/rich-text.schema.json
modules/split-media.schema.json
navigation.schema.json
page.v3.schema.json
public-path.schema.json
route-manifest.schema.json
safe-html.schema.json
uuid-v4.schema.json
```

## Frontend 16-Schema `/resolve` closure

```text
content-reference.schema.json
error.schema.json
file-reference.schema.json
link.schema.json
media-reference.schema.json
modules/accordion.schema.json
modules/card-grid.schema.json
modules/cta-banner.schema.json
modules/data-table.schema.json
modules/hero.schema.json
modules/rich-text.schema.json
modules/split-media.schema.json
page.v3.schema.json
public-path.schema.json
safe-html.schema.json
uuid-v4.schema.json
```

## 结论

前端 16 文件全部属于 CMS 19 文件。CMS 独有的三份文件是 collection、navigation 和 route manifest 根 Schema；它们不属于 TASK-008～011 已冻结的 `/resolve` Page/error 消费闭包。差异表示消费范围不同，不是合同丢失，也不构成扩张前端当前消费者的授权。

本验证只读；未修改 CMS Schema、前端 snapshot、manifest、Validator 或运行环境。
