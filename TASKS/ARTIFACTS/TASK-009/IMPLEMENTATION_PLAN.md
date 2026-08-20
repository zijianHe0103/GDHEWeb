# TASK-009 实施计划

status: FROZEN
task_id: TASK-009
method: TDD

## 目标

按 RED → GREEN → REFACTOR 小循环实现 server-only `/resolve` Transport。任何生产代码都必须由先失败的聚焦测试驱动；不得一次写完实现后补测试。

## Step 1：测试环境与配置/path RED

修改：

- `frontend/vitest.config.ts`
- `frontend/tests/server-only-stub.ts`
- `frontend/tests/cms-transport.test.ts`

动作：

1. 只建立 `server-only` test alias，不改变其他 Vitest 默认行为。
2. 为缺失/非法 base、loopback/HTTPS allowlist、canonical path 和固定 URL 写最小测试。
3. 运行 focused test，记录因生产模块不存在而产生的预期 RED。

门：

- RED 必须由缺失 Transport 行为导致，不是 TypeScript、alias 或测试语法错误。
- 未观察到有效 RED 前不得写生产模块。

## Step 2：配置和 URL builder GREEN

修改：

- `frontend/src/lib/cms/server/config.ts`
- `frontend/src/lib/cms/server/resolve-url.ts`
- 必要的最小 `errors.ts`

动作：

1. 每个生产模块先导入 `server-only` marker。
2. 实现 REST base fail-closed 解析。
3. 实现 frozen public-path 规则和固定 `/gdhe/v1/resolve` URL。
4. 运行 focused test 至 GREEN；只做消除重复的最小 refactor。

验证：

- 非法输入零请求；
- origin/endpoint/locale/schema 不可由调用方覆盖；
- 错误不回显配置值。

## Step 3：真实 HTTP 请求与 200/协议 RED-GREEN

修改：

- `frontend/tests/cms-transport.test.ts`
- `frontend/src/lib/cms/server/transport.ts`
- `frontend/src/lib/cms/server/index.ts`
- `frontend/src/lib/cms/server/errors.ts`

动作：

1. 启动 loopback 随机端口 HTTP server。
2. 先写 method/header/单请求、200 JSON、metadata、redirect、非 JSON、空/畸形 JSON和意外 success status 测试并观察 RED。
3. 实现匿名单次 GET、`no-store`、redirect refusal、一次 text read/JSON parse 和 allowlisted metadata。
4. 逐项 GREEN，不加入 retry、cache tag、Validator 或 Adapter。

验证：

- 请求数精确为一；
- 没有 Cookie/Authorization/nonce；
- body 静态类型和运行时交接均为 `unknown`。

## Step 4：状态、timeout、abort 和泄漏 RED-GREEN

修改：

- `frontend/tests/cms-transport.test.ts`
- `frontend/src/lib/cms/server/errors.ts`
- `frontend/src/lib/cms/server/transport.ts`

动作：

1. 先为 400/401/403/404/409/429/500/502/503/其他状态、timeout、caller abort、connection failure、无重试和无敏感信息写失败测试。
2. 实现最小 typed error mapping。
3. HTTP JSON error body 只通过非枚举只读访问器暴露为 `unknown`；message 和序列化保持安全。
4. 运行 focused test 至 GREEN，确认 server/socket/timer 清理。

门：

- 404 必须独立但不调用 `notFound()`；
- 非 404 不得伪装为 404；
- 429 保留 `Retry-After`；
- timeout、abort、network 三者可区分。

## Step 5：server-only 真实构建负例

修改：

- `frontend/tests/cms-transport.test.ts` 或本任务允许的单一最小 helper

动作：

1. 在临时目录或受控临时文件中创建 Client Component 导入受保护 Transport 的负例。
2. 使用真实 Next.js build 证明该导入因 `server-only` 被拒绝。
3. 清理临时文件/目录，再运行正式 production build 证明正常工程通过。

门：

- 不保留 `src/app/**` 修改；
- 负例失败原因必须是 server-only 边界，不是缺文件或语法错误；
- 正常 build 仍 PASS。

## Step 6：文档和完整验证

修改：

- `frontend/README.md`
- 必要时根 `README.md`
- `TASKS/ARTIFACTS/TASK-009/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-009/DIFF_OR_OUTPUT_SUMMARY.md`
- `LANES/frontend/worklog.md`

验证命令：

```sh
cd frontend
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
```

补充检查：

- focused Transport test；
- `frontend/package.json` 和 lockfile checksum 与基线一致；
- `frontend/src/app/**`、`frontend/src/lib/cms/contracts/**`、`cms/**` 与基线零差异；
- secret/origin/internal response leakage scan；
- 无临时 server、socket、目录或后台进程；
- DPG project/message/strict lane 校验；
- `git diff --check`。

## Execution 交付

frontend Lane 完成后必须：

1. 更新三份标准 execution artifacts；
2. 在 worklog 逐轮记录 RED 与对应 GREEN；
3. ack 原 execution request；
4. 发送关联 `execution_response`；
5. 不自行请求 review、验收、commit、push、merge或后续任务。

Planner 收到 response 后独立重跑关键矩阵并决定是否允许 adversarial review。
