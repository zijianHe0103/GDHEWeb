# TASK-010 Runtime Schema Validator 设计

status: FROZEN_FOR_EXECUTION
task_id: TASK-010
frozen_at: 2026-07-25T17:43:44Z

## 1. 设计目标

在 TASK-009 Transport 返回的 `unknown` 与未来 DTO Adapter 之间建立唯一的运行时合同门：

```text
unknown network JSON
  -> public runtime validator
  -> opaque validated wrapper
  -> future Adapter
```

本任务不接线 Transport、不建立 Adapter，也不渲染页面。

## 2. 依赖冻结

直接 production dependencies 只允许：

- `ajv@8.20.0`
  - npm registry integrity：`sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==`
- `ajv-formats@3.0.1`
  - npm registry integrity：`sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==`
  - declared Ajv compatibility：`^8.0.0`

两者使用 `--save-exact` 固定。不得新增代码生成、错误美化或其他 Schema 依赖。

## 3. 权威输入

唯一 Schema 权威为：

`frontend/src/lib/cms/contracts/manifest.json`

运行时实现只静态导入其声明的 16 份 snapshot Schema：

- 根：`page.v3.schema.json`、`error.schema.json`
- 共用引用：UUID、public path、media、file、link、safe HTML、content reference
- 模块：hero、rich text、card grid、split media、accordion、data table、CTA banner

canonical samples：

- success：`resolve-home.json`、`resolve-product-alpha.json`
- error：`resolve-errors.json` 中的 `gdhe_invalid_schema`、`gdhe_not_found`

运行时不得读取 manifest source paths、`cms/**`、`TASKS/**` 或文件系统。

## 4. Schema registry 与 URI 重基

snapshot 使用相对 `$ref`，但历史 `$id` 同时包含 `/v2/` 与 `/v3/`。直接依赖原 `$id` 解析会让 `page.v3` 的相对引用错误寻找 `/v3/` 版本的历史 `/v2/` 共用 Schema。

因此 registry 必须：

1. 静态导入 16 份只读 Schema；
2. 为编译器创建内存副本，不修改 snapshot 文件或 import 对象；
3. 按 snapshot 相对路径把每份副本的 `$id` 重基到内部固定 URI：
   `https://contracts.gdhe.local/schemas/<snapshot-relative-path>`；
4. 保持所有相对 `$ref` 原样，使解析严格对应 TASK-008 snapshot 文件图；
5. 禁止 async/remote loader，未知 `$ref` 必须在模块初始化编译时失败。

registry 必须显式列出 16 份 Schema。不得用运行时目录扫描或隐式 glob 掩盖新增/缺失文件。

## 5. Ajv 配置

使用 Draft 2020-12 entry，并冻结：

- `strict: true`
- `validateFormats: true`
- `coerceTypes: false`
- `useDefaults: false`
- `removeAdditional: false`
- 不提供 `loadSchema`
- 使用 `ajv-formats` 启用 `date`、`date-time`、`uri`

根 validator 在模块初始化时编译并复用；请求调用不得重复编译。

## 6. 公开 seam

公开模块位于：

`frontend/src/lib/cms/server/validation/index.ts`

只公开：

```ts
validateCmsSuccessPayload(input: unknown): ValidatedCmsPayload<"success">
validateCmsErrorPayload(input: unknown): ValidatedCmsPayload<"error">
CmsContractError
CmsContractErrorKind
ValidatedCmsPayload
```

成功与错误入口由未来 orchestration 根据 HTTP 语义显式选择，不通过 payload 猜测入口。

`ValidatedCmsPayload`：

- 由模块私有 `unique symbol` 或等强度不可命名 brand 标记；
- 普通结构对象不能通过 TypeScript 结构类型构造；
- 内部 raw body 使用 private field；
- `body` 只通过 prototype getter 返回 `unknown`；
- 默认 enumerable keys 与 `JSON.stringify()` 不包含 raw body；
- wrapper 不等于 DTO，不能直接传给 React。

## 7. 错误语义

```ts
type CmsContractErrorKind =
  | "unsupported_schema"
  | "invalid_success_payload"
  | "invalid_error_payload";
```

- success 的 `apiVersion !== "1"` 或 `schemaVersion !== "3.0.0"`：`unsupported_schema`
- error 的 `apiVersion !== "1"`：`unsupported_schema`
- 版本匹配但 success Schema 失败：`invalid_success_payload`
- 版本匹配但 error Schema 失败：`invalid_error_payload`

`CmsContractError`：

- `category = "contract"`
- 固定通用 message
- 不保存或回显 raw payload
- 不公开 Ajv `schemaPath`、params、完整 error array 或 Schema 内部 URI
- enumerable keys/JSON serialization 只允许稳定 category/kind，不含输入值、CMS origin 或凭据

Schema 编译失败属于构建/开发错误，不映射为上述运行时 payload error，也不降级接受原始 JSON。

## 8. 测试 seam

所有行为测试只通过 `validation/index.ts` 公开接口：

1. canonical success/error samples；
2. 独立 mutation inputs；
3. wrapper brand、enumerability、serialization；
4. stable contract error；
5. public/deep Client Component import production-build negatives。

允许直接检查 production 文件 inventory、依赖树和 source marker 作为交付边界检查；不得 mock Ajv、测试 compile call count或断言私有函数。

## 9. Mutation matrix

至少永久覆盖：

- wrong/missing API version；
- wrong/missing content Schema version；
- missing required root field；
- invalid content type/template pair；
- unknown module type；
- wrong module schema version；
- invalid module UUID；
- invalid media/file URL、date、date-time、dimensions；
- invalid data-table rows/cells；
- invalid relationship；
- forbidden additional property；
- malformed error code/status/request ID/details。

每个 mutation 从 canonical sample 深拷贝后只改变一个独立行为。预期来自冻结 Schema，不在测试中重新实现 Schema 算法。

## 10. 安全与构建边界

- validation production modules 首行保留 `import "server-only"`。
- public index 与最深可导入 registry/validator 都必须被真实 Client Component production build 拒绝。
- production bundle 不包含 CMS origin、credential、cookie、nonce 或 canonical raw samples。
- 测试临时 Next 项目必须使用随机临时目录并在 `finally` 清理。

## 11. 明确不做

- 不修改或调用 TASK-009 Transport；
- 不实现 DTO/Adapter；
- 不修改 `src/app/**`；
- 不创建可见页面；
- 不执行 live WordPress E2E；
- 不实现 cache/retry/Preview/Webhook；
- 不修改 CMS、数据库、合同 snapshot 或环境文件。
