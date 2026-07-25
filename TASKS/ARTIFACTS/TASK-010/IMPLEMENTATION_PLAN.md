# TASK-010 Runtime Schema Validator 实施计划

status: FROZEN_FOR_EXECUTION
task_id: TASK-010
method: RED -> GREEN vertical slices

## 0. 前置快照

实施前记录：

- Node/npm/Next.js/TypeScript/Vitest 版本；
- `package.json`、lockfile SHA-256；
- TASK-008 contract tree inventory/checksums；
- TASK-009 server source checksum；
- `src/app/**`、CMS、environment 的零差异基线。

运行现有 parity、lint、typecheck、69 tests 和 production build，确认不是在已有失败上实施。

## 1. 精确依赖

执行：

```text
npm install --save-exact ajv@8.20.0 ajv-formats@3.0.1
```

然后验证：

- direct dependency 精确版本；
- lockfile 只增加所需闭包；
- `npm ls ajv ajv-formats` 无 invalid/peer error；
- 不新增 package script 或其他 direct dependency。

依赖安装是环境准备，不允许同时写 production Validator。

## 2. Slice A：success canonical sample

RED：

- 创建聚焦测试，从公开 `validation/index.ts` 导入 `validateCmsSuccessPayload`；
- `resolve-home.json` 应返回 kind=`success` 的 validated wrapper；
- 初始失败必须因为公开 Validator 尚不存在。

GREEN：

- 添加最小 server-only public surface；
- 静态注册并重基 16 份 Schema；
- strict Draft 2020-12 编译 Page root；
- 仅让 canonical home sample 通过。

保留 RED/GREEN 命令、退出码与关键输出。

## 3. Slice B：第二 success 与 error roots

逐个循环：

1. product canonical sample RED -> GREEN；
2. `gdhe_invalid_schema` error RED -> GREEN；
3. `gdhe_not_found` error RED -> GREEN。

新增独立 `validateCmsErrorPayload`，不建立自动猜测入口。

## 4. Slice C：版本门

依次加入：

- success wrong API version；
- success wrong Schema version；
- error wrong API version。

每个先 RED，最小实现统一映射 `unsupported_schema`。版本门只读 discriminant，不读业务字段。

## 5. Slice D：结构 mutation matrix

按行为小组逐个 RED/GREEN，不批量预写全部测试：

1. required root / type-template；
2. module type/version/UUID；
3. media/file format、date/date-time、dimensions；
4. data-table rows/cells；
5. relations/additional property；
6. error body code/status/request ID/details。

实现只调整 registry/validator/error mapping；不得出现 Adapter 或 UI 逻辑。

## 6. Slice E：opaque wrapper 与 leakage

RED：

- 普通对象不能通过 TypeScript fixture 赋值为 `ValidatedCmsPayload`；
- `Object.keys()`、object spread 和 `JSON.stringify()` 不包含 raw body；
- contract error message/keys/serialization 不含 mutation value、完整 raw payload、Schema URI 或 `schemaPath`。

GREEN：

- 使用 module-private brand 与 private field 的最小 wrapper；
- error 只保留 stable category/kind。

## 7. Slice F：server-only 真实构建负例

分别创建临时 Next.js Client Component：

1. 导入 public `validation/index.ts`；
2. 深导入最内层 registry/validator module。

RED 证明移除 marker 时 build 会意外成功；恢复 marker 后两个 production build 均因 server-only boundary 失败。临时目录必须清理。

## 8. 文档

更新 `frontend/README.md`：

- exact dependencies；
- public Validator seams；
- strict/format 与 snapshot ownership；
- wrapper/contract error 边界；
- 验证命令；
- 明确不含 Adapter、页面和 live E2E。

根 README 只增加一个最小 Runtime Validator 指针，不复制完整说明。

完成后：

- `document_impact: RESOLVED`
- `readme_impact: UPDATED`

## 9. 最终执行验证

必须 fresh PASS：

```text
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test -- tests/cms-runtime-validator.test.ts
npm test
npm run build
npm ls ajv ajv-formats
```

额外检查：

- 16-Schema registry inventory；
- exact direct dependency 与 registry integrity/lockfile；
- package scripts 零变化；
- TASK-008 snapshot、TASK-009 Transport、`src/app/**`、CMS、environment 零差异；
- production `server-only` markers；
- 无 runtime fs/remote schema loader；
- 无 raw payload/origin/credential leakage；
- 无临时 build residue；
- `git diff --check`；
- DPG project/message/strict lane validation。

## 10. 交付 artifacts

frontend Lane 必须更新：

- `EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- frontend worklog
- 与 execution request 关联的 `execution_response`

不得自行发起验收、commit、push、merge、部署或 TASK-011。
