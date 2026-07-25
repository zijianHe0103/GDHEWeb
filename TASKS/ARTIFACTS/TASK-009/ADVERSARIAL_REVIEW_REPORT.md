# TASK-009 Adversarial Review Report

verdict: PASS
reviewed_by: adversarial_reviewer
reviewed_at: 2026-07-25T16:40:06Z
review_message: MSG-TASK-009-ADVERSARIAL-REVIEW-R2
round: 2-final
p0_count: 0
p1_count: 0
p2_count: 0
planner_final_validation_allowed: true

## Current Verdict

PASS。当前权威结论是文末 `Round 2 Final Review`：Round 1 的一个 P1 与一个 P2 均已独立确认关闭，P0=0、P1=0、P2=0，Planner 可以进入 final validation。Round 1 FAIL 的完整证据、findings、通过项和边界保留如下，不被覆盖。

## Round 1 Verdict

FAIL。固定 Node.js 24.18.0 与 npm 11.16.0 下，focused Transport 58/58、full suite 67/67、TASK-008 contract parity、lint、typecheck 和 production build 全部 fresh PASS。REST base/path allowlists、R2 explicit-port correction、单次匿名 no-store GET、redirect refusal、timeout through body read、一次 JSON parse、typed errors、metadata allowlist、泄漏控制、真实 loopback server、Client Component build negative、清理和禁止范围也大体通过独立复核。

但生产 `transport.ts` 仍导出一个可深导入的入口，正式 server-side 调用方可以绕过唯一 public entry，自行注入 CMS origin 和 timeout。现有测试直接使用了这条生产深导入，因此这不是纯理论可达性。它违反 frozen design 对 public surface、origin authority 和固定 5000 ms timeout 的约束，构成一个 P1。

另外，active task 的多个 current-state section 仍保留 Hook blocker 阶段的叙述，与同一文件 metadata、lane plan、execution history、当前 artifacts 和已 ACK review request 冲突，构成一个 P2。Planner 不得进入 final validation。

## Findings

### P0

- 无。

### P1

1. **生产 deep import 暴露了任意 CMS base 与任意 timeout 注入，绕过唯一 public entry。**
   - Frozen design 将 `index.ts` 定义为“唯一文档化的公共入口”，规定调用方只提供 canonical path，不能覆盖 origin，并冻结默认 timeout 为 5000 ms；测试依赖可以使用显式 base/短 timeout，但不得向正式调用方暴露 origin 注入。见 `TASKS/ARTIFACTS/TASK-009/DESIGN.md:21-33,54-86`。
   - `frontend/src/lib/cms/server/index.ts:20-29` 的 public entry 符合该合同，只接受 `publicPath` 与 caller `AbortSignal`。
   - 但 `frontend/src/lib/cms/server/transport.ts:15-19,121-133` 将 `requestResolvedPath()` 作为生产 export，并让其 options 接受 `baseUrl`、`timeoutMs` 和 signal。`InternalTransportOptions` 没有 export 不能形成封装；TypeScript 调用者仍可从函数签名推断并传入结构化对象。
   - `frontend/tests/cms-transport.test.ts:15-25,151-154` 直接从生产深路径导入该函数，并成功传入 loopback base 与 500 ms timeout。其余 HTTP、timeout 和 network tests 也复用同一通道，fresh typecheck 与 58/58 focused PASS 反而证明该 bypass 可编译、可运行。
   - `server-only` marker 只阻止 Client Component/browser bundle；它不阻止项目内 Server Component、Route Handler、Server Action 或其他 server code 深导入 `transport.ts`。调用者由此可选择任意符合 parser 的 HTTPS origin，并把冻结的 5000 ms timeout 改为任意数值。endpoint/locale/schema 仍固定，凭据仍拒绝，但 CMS authority 和 timeout ownership 已被绕过。

   窄修订要求：生产可导入表面只能暴露 path 与可选 caller signal；base 必须继续来自 `WORDPRESS_API_URL`，timeout 必须保持冻结值。测试注入不得作为可被应用生产代码深导入的 export。增加一个 regression，证明项目内 production caller 无法通过公共入口或任何生产 deep import 覆盖 base/timeout，同时保留真实 Client Component 对 public 与 deep modules 的 server-only build rejection。

### P2

1. **Active task 的 current-state、next、artifact 和 message 叙述仍停留在早期阻塞阶段。**
   - 文件头已是 `UNDER_REVIEW`，Lane Plan 也写明 frontend complete、R2 acknowledged、review ready；execution history `TASKS/ACTIVE/TASK-009-server-only-resolve-transport.md:178-179` 记录 58/58、67/67、完整门禁与 review transition。
   - 但当前状态 `:140-142` 仍写 `IN_PROGRESS`、只有四个部分文件、实施未完成；当前下一步 `:148-150` 仍要求发送 R1 continuation。
   - Messages `:160-166` 仍把 R1 continuation、R2 和本 review request 写为待发送；实际两次 frontend response 已 ACK，review request 也已派发并由 reviewer ACK。
   - Execution Artifacts `:181-185` 仍称三份标准 artifacts 尚未生成，尽管三份文件均存在且已被 Planner 使用；Adversarial Review `:187-189` 和 Validation Evidence `:191-200` 也仍否认当前 review/完整实施证据。

   窄修订要求：只同步这些承担 current-state 语义的段落，保留所有带时间戳的 blocker、repair、RED、R1/R2 历史和 NOT_ACCEPTED 边界，不改写审计历史。

## Acceptance Revalidation

| Area | Result | Independent evidence |
|---|---|---|
| Client/server isolation | PASS with server-side deep-import P1 | 五个 production modules 首行均为 `import "server-only"`；fresh real Next.js temporary Client Component build negative PASS，正常 production build PASS。Client bundle 隔离有效，但 server-side deep import 仍绕过 public call surface。 |
| REST base allowlist | PASS | 缺失、relative、non-HTTP(S)、credentials、query/hash、wrong base、non-loopback HTTP、localhost subdomain 和三种无显式端口 HTTP loopback 均拒绝；HTTPS 与带端口 localhost/IPv4/IPv6 loopback 接受。 |
| Explicit loopback port R2 | PASS | `config.ts:24-26` 对 cleartext loopback 要求 `url.port !== ""`；三个无端口 RED 已永久化，fresh focused 58/58 PASS。拒绝显式 default `:80` 是 WHATWG URL normalization 下的更窄 fail-closed 行为，不构成本轮安全 finding。 |
| Canonical path and URL | PASS | regex 与 TASK-008 frozen public-path Schema 相同；root/multisegment positives 和 case、slash、dot、query、fragment、backslash、encoded separator、segment/total length negatives通过。URL 只生成 `/wp-json/gdhe/v1/resolve`、`locale=en`、encoded path、`schema=3.0.0`。 |
| Request shape and retries | PASS | 生产代码只有一个 `fetch()`；method GET、Accept JSON、`cache: no-store`、`redirect: error`、combined abort signal。真实 server 观测一次请求，无 Authorization/Cookie/nonce，未发现 retry path。 |
| Timeout and cleanup | PASS | timeout 在 fetch 与 `response.text()` 全程有效，delayed-header/delayed-body tests通过；timer finally clear。loopback servers 使用随机 IPv4 port、`closeAllConnections()` 和 `server.close()`；delayed timers unref；temporary Next project finally 删除，fresh residue scan为空。 |
| JSON and metadata | PASS | `response.text()` 一次、`JSON.parse()` 一次，返回 `unknown`；metadata 只复制 status、request ID、ETag、Last-Modified、Retry-After、Content-Type，未复制内部测试 header。 |
| Protocol and HTTP errors | PASS | redirect、204/206/304、non-JSON、empty/malformed JSON 均稳定 protocol error；400/401/403/404/409/429/500/502/503/418 mapping通过，404 独立为 `not_found`，429 保留 Retry-After。 |
| Transport errors | PASS with race limitation | delayed timeout、pre-aborted caller 和 closed-port network 分别映射 timeout/aborted/network，且错误不含 origin。近同时 caller abort 与 timeout 的先后竞争未有独立测试；当前代码按 catch 时 caller signal 优先，本轮未观察到验收失败，但后续若扩大并发/取消语义应加 first-cause regression。 |
| Leakage controls | PASS | configuration/transport/protocol messages不回显输入或 origin；HTTP body位于 private field和prototype getter，不进入 enumerable keys/JSON serialization。生产 secret/raw-detail scan无命中，未发送凭据。 |
| Package and protected scope | PASS | package与lock current/HEAD hashes分别一致为 `cd35b063...eb10`、`fa5938d...26a0`；package/lock、`src/app`、contract snapshot、CMS、env、TASK-008 authority diff为空。 |
| Documentation | PASS except active-task P2 | Root/frontend README准确说明 server-only Transport、显式 loopback port、HTTPS production、unknown JSON和非目标；没有声称存在 Validator、Adapter或可见页面。Active task current sections不一致，单列 P2。 |
| Governance mechanics | PASS | Request先 ACK；Project/task/board metadata为 UNDER_REVIEW/NOT_ACCEPTED。Project validation、message validation、strict lane audit与 `git diff --check` fresh PASS；语义一致性缺口未被结构校验捕获。 |

## Independent Validation

- 按 reviewer resume chain 读取 current project/lane/task、frozen design/plan、全部 execution artifacts、实现、测试、root/frontend docs 和受控 request，并在审查前 ACK request。
- 逐行追踪 config、path builder、errors、transport、public index 和 Vitest alias；未采信 frontend 或 Planner 的完成声称。
- 用固定 Node.js 24.18.0/npm 11.16.0 fresh 运行 focused Transport 58 tests、contract parity、lint、typecheck、full 67 tests 和 production build。
- Fresh focused test实际运行随机 loopback servers、redirect/status/timeout/abort/network矩阵和真实 Next.js Client Component build negative；无 temporary fixture residue。
- 独立复核 package/lock current/HEAD hashes、禁止范围 diff、server-only markers、fetch/retry surface、生产泄漏扫描和 README。
- 运行 DPG project validation、controlled-message validation、strict lane audit和 global diff check。

## Boundaries and Limitations

Reviewer 没有修改 frontend、task/project/board、CMS、environment、contract snapshot、package/lock、测试或文档，也没有启动真实 WordPress、数据库、外部网络或部署。测试只运行其既有 loopback 与 temporary-build fixtures，并由测试自身清理。

Reviewer 没有执行 commit、push、merge、accept、close、deploy 或后续任务，也没有把 tests/build PASS 当作用户验收。

## Planner Gate

planner_final_validation_allowed: false

Planner 应 ACK 本 FAIL response，受控恢复 TASK-009 至 `NEEDS_REVISION`，只派发一个 P1 production deep-import surface 修订和一个 P2 current-state 同步。修订后需要 fresh focused/full tests、public/deep Client Component build negatives、base/timeout non-overridability regression、scope与治理验证，再请求 Round 2。不得启动 Validator、Adapter、页面、CMS、部署、Git delivery 或 TASK-010。

---

## Round 2 Final Review

### Verdict

PASS。Round 1 P1 与 P2 均已关闭，未发现直接回归。生产 public entry 与 deep transport module 的唯一请求函数是同一个 `resolveCmsPath(publicPath, callerSignal?)`；旧 `requestResolvedPath`、caller-controlled `baseUrl`、`timeoutMs`、`InternalTransportOptions` 和等价 fetch injection seam 均已从 production source 消失。CMS authority 只来自 `process.env.WORDPRESS_API_URL`，5000 ms timeout 是 transport module 私有常量。

测试不再调用 production injection seam。真实 loopback/status/protocol/timeout/abort/network 矩阵全部经 public `resolveCmsPath` 运行；测试只在调用前临时设置同一受控环境变量，并在 `finally` 恢复。public entry 与 deep transport 两种 Client Component imports 均由真实 Next.js production build 拒绝。

Active task 的 current status、next step、messages、artifacts、review 和 validation sections 现在一致描述 `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`、R3 closure 和 Round 2 gate；早期 blocker、repair、R1 FAIL 与 recovery 仍保留在时间戳历史中。最终 P0=0、P1=0、P2=0，Planner final validation allowed。

### Findings

#### P0

- 无。

#### P1

- 无。

#### P2

- 无。

### Round 1 Closure

| Round 1 finding | Round 2 result | Independent evidence |
|---|---|---|
| P1 production deep-import base/timeout injection | PASS | `transport.ts:115-123` 只导出 `resolveCmsPath(path, signal?)`，base 直接读取 `process.env.WORDPRESS_API_URL`，timeout 使用 private `DEFAULT_TIMEOUT_MS=5000`。Production scan 对 `requestResolvedPath`、`baseUrl`、`timeoutMs`、`InternalTransportOptions` 为零；runtime namespace keys 精确为 `resolveCmsPath`，public re-export 与 deep export 是同一函数。 |
| P2 active-task current-state drift | PASS | `TASKS/ACTIVE/TASK-009-server-only-resolve-transport.md:140-168,185-217` 已同步 UNDER_REVIEW、R3 checkpoint、Round 2 gate、完整 artifacts、Round 1 history 和 fresh validation；`:170-183,209-234` 保留 blocker、repair、R1 FAIL/recovery 等历史。 |

### Direct Regression Revalidation

| Area | Result | Independent evidence |
|---|---|---|
| Public and deep runtime surface | PASS | Public index re-exports `resolveCmsPath`; deep transport exports the same function and only the response type otherwise。No production callable accepts base, timeout, endpoint or fetch dependency。 |
| Environment-only CMS authority | PASS | All real loopback tests set `WORDPRESS_API_URL` through a scoped helper, call public `resolveCmsPath`, then restore the prior env in `finally`。Production base read has one source。 |
| Fixed timeout | PASS | Production constant is private 5000 ms; delayed headers and delayed body each use 5500 ms and independently produce `timeout` through the public surface。No test or production timeout override remains。 |
| Client Component negatives | PASS | Focused suite runs two real temporary Next builds: public index import and deep transport import。Both fail for `server-only`/Client Component boundary and both temporary roots are removed。 |
| Focused and full tests | PASS | Fixed Node.js 24.18.0/npm 11.16.0 fresh focused 60/60 and full 69/69 PASS。 |
| Contract and production build | PASS | TASK-008 parity, lint, typecheck and normal Next.js production build PASS; only `/` and `/_not-found` remain。 |
| Protected scope | PASS | Package/lock current and HEAD hashes match; package/lock、`src/app`、contract snapshot、CMS、env and TASK-008 authority diffs are empty。 |
| Leakage and retry surface | PASS | Production sensitive/raw-detail scan is empty; one `fetch()` remains, with no retry or credential path。 |
| Residue and governance | PASS | No `.tmp-server-only-negative-*` remains。Project/message validations, strict lane audit and `git diff --check` fresh PASS before response。 |

### Independent Validation

- ACKed `MSG-TASK-009-ADVERSARIAL-REVIEW-R2` before review and limited scope to the two Round 1 findings plus direct regressions。
- Re-read canonical Round 1 report, R3 execution/validation/diff evidence, current active task, project state, production transport/index and focused tests。
- Independently inspected all production exports and searched production source for the removed symbols and equivalent explicit injection identifiers。
- Fresh ran focused 60 tests, full 69 tests, contract parity, lint, typecheck and production build with the pinned runtime。
- Recomputed package/lock current-versus-HEAD hashes, protected-scope diff, marker/leakage/fetch scans and temporary-residue check。
- Ran project validation, controlled-message validation, strict lane audit and global diff check。

### Boundaries and Planner Gate

Reviewer did not repair frontend or Planner-owned files, alter tests, environment, CMS, database, package/lock, contract snapshot or task state, and did not perform Git, remote, acceptance, deployment or later-task work。

planner_final_validation_allowed: true

Planner may acknowledge this final PASS, record review recovery, run final validation and perform checked acceptance preparation。PASS is not user acceptance and does not authorize commit、push、merge、deploy、Validator、Adapter、page、CMS work or TASK-010。
