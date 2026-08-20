# TASK-010 Adversarial Review Report

status: FAIL
task_id: TASK-010
review_round: 1
review_request: MSG-TASK-010-ADVERSARIAL-REVIEW-R1
reviewed_at: 2026-07-26
reviewer_lane: adversarial_reviewer
p0_count: 0
p1_count: 1
p2_count: 1
planner_final_validation_allowed: false

## Verdict

FAIL。固定 Node.js 24.18.0 与 npm 11.16.0 下，focused Validator 38/38、full suite 107/107、16-Schema parity、lint、typecheck、production build、依赖树和 production audit 均 fresh PASS。静态闭包、内存 `$id` 重基、两处 strictTypes 注解、Ajv strict/formats/compile-once、public/deep server-only、错误分类与非泄漏、lockfile 和保护范围大体符合冻结合同。

但当前 validated wrapper 保留调用者传入对象的原始引用，且 wrapper 自身的 `kind` 是可写、可配置的普通属性。独立公开 seam 复现表明：校验成功后，调用者可把 wrapper 内的 body 改成再次校验会失败的数据，并把 `kind` 从 `success` 改为 `error`。因此该对象不能持续证明“body 已通过指定根 Schema”，违反验收标准与后续 Adapter 信任边界，构成一个 P1。

此外，active task 的当前 Validation Evidence 仍声称没有修改 frontend 或依赖，与同文件 UNDER_REVIEW 状态、execution artifacts 和当前实际 diff 冲突，构成一个 P2。Planner 不得进入 final validation。

## Findings

### P0

- 无。

### P1

1. **Validated wrapper 和其被验证内容在返回后仍可被调用者改写，信任令牌会与已验证事实脱钩。**
   - 活动任务要求只有通过 runtime validation 的 `unknown` 才能获得 wrapper，且 wrapper 表示“通过指定根 Schema 的运行时验证”；冻结设计把它定义为 Transport 与未来 Adapter 之间的唯一合同门。见 `TASKS/ACTIVE/TASK-010-cms-runtime-schema-validator.md:34-40,86-88,121-126` 与 `TASKS/ARCHIVE/TASK-010/OUTPUTS/DESIGN.md` 第 1、6 节。
   - `frontend/src/lib/cms/server/validation/index.ts:24-38,57,70` 将传入的 `input` 原样保存在 private field，getter 返回同一个对象，没有 clone、freeze 或重新验证。现有 canonical tests 在 `frontend/tests/cms-runtime-validator.test.ts:191-203` 还明确断言 `validated.body` 与输入是同一引用。
   - 同一实现的 `kind` 来自 constructor parameter property；运行时 descriptor 是 `writable: true, enumerable: true, configurable: true`，class instance 也未冻结。private brand 只阻止普通 TypeScript object literal，不保护一个真实 wrapper 在返回后的完整性。
   - 独立复现通过 Vite SSR 加载真实 public `validation/index.ts`：home payload 先成功返回，`wrapped.body === payload` 为 true；随后把原输入 `title` 改为空字符串并把 `wrapped.kind` 改为 `error`，wrapper 立即报告新 kind 和空 title，而对同一 `wrapped.body` 再次调用 public success validator 得到 `invalid_success_payload`。`Object.isFrozen(wrapped)` 为 false。
   - 这不是 DTO 的深只读偏好问题，而是 validated capability 的真实性问题：未来 Adapter 若按合同接受 wrapper，无从知道 body 已在校验后失效；序列化仍只显示改写后的 `kind`，会进一步制造错误分类。

   最窄修订建议：在成功验证之后创建与调用者隔离的 payload snapshot，并保证其从返回到消费期间不可发生会改变 Schema 结果的突变；同时固定 wrapper 的 `kind` 与实例完整性。增加 public-seam regression：修改原输入及尝试改写 wrapper 后，wrapper 内的 validated snapshot、kind 和再次验证结果必须保持原成功事实；错误 wrapper 同样覆盖。不得借此实现 DTO、Adapter 或 Transport 接线。

### P2

1. **Active task 的 current Validation Evidence 保留了 intake 前叙述。**
   - `TASKS/ACTIVE/TASK-010-cms-runtime-schema-validator.md:155-186` 已正确记录 UNDER_REVIEW、frontend execution complete、依赖/Validator artifacts 和已派发 review。
   - 但同文件 `:188-193` 仍声称“当前未修改 frontend、CMS、数据库、依赖或外部状态”。实际当前任务新增三个 production validation modules、聚焦测试、Ajv 两个 direct dependencies 与 lockfile closure，并修改 frontend/root README；execution report、diff summary 和当前 Git 状态也都记录这些变化。

   最窄修订建议：只把该 current-state evidence 更新为已实施后的真实范围与通过门禁，保留 intake baseline 和全部历史，不改动产品实现。

## Acceptance Revalidation

| Area | Result | Independent evidence |
|---|---|---|
| 16-Schema registry and authority | PASS | registry 明确静态导入 16 个 manifest snapshot Schema；`verify:cms-contract` fresh PASS 为 16 Schemas、2 success、2 error；production 无 runtime filesystem、fetch 或 remote loader。 |
| `$id` rebasing | PASS | 每份 structured clone 按 snapshot 相对路径重基到固定内部 base，relative `$ref` 原样保留；目录层级与 TASK-008 snapshot graph 一致，未知根在模块初始化失败。合同 snapshot 本身无 diff。 |
| strictTypes annotations | PASS | Page `details.type=object` 已由根 `properties.details.type=object` 约束；Link pattern branch 的 `type=string` 已由父 `url.type=string` 约束。独立用 raw-clone relaxed compile 与 production-style strict annotated compile 比较 canonical 和两个注解点的 16 个正负输入，mismatch 为 0。 |
| Ajv configuration | PASS | Draft 2020-12、`strict: true`、真实 date/date-time/uri formats、无 coercion/default/removal；16 schemas 在模块初始化 add/compile，两个 validator module-level 复用。 |
| Canonical and mutation matrix | PASS except integrity gap | 两 success、两 error canonical 与 required/type-template/module/UUID/media/date/dimension/table/relation/additional/error mutations fresh 38/38 PASS；unsupported 和 invalid 三类错误稳定。缺少校验后 input/wrapper mutation regression，与 P1 对应。 |
| Public/deep server-only | PASS | 三个 production modules 均首行 `import "server-only"`；focused tests 对 public 与 deepest registry 执行真实 Next Client Component guarded negative，并保留 marker-stripped positive control。 |
| Wrapper structure and serialization | FAIL | ordinary TypeScript object literal 被 private unique-symbol type brand 拒绝，body 不进入 keys/spread/JSON；但真实 wrapper 的 body 引用和 kind 可变，不能持续充当 validated token。 |
| Error leakage | PASS | public error 只暴露稳定 category/kind，message/name 非枚举；不保存 Ajv errors 或 raw input。sentinel、schemaPath、internal URI 未从 error string/keys/JSON 暴露，production build scan无 canonical sample、credential 或 CMS origin命中。 |
| Dependencies and lockfile | PASS | direct exact `ajv@8.20.0` 与 `ajv-formats@3.0.1`，peer deduped；lockfile integrity匹配冻结值，无新增 script/第三 direct dependency；production audit 0 vulnerabilities。 |
| Protected scope | PASS | 相对 TASK-009 baseline，contract snapshot、TASK-009 config/errors/index/resolve-url/transport、`src/app`、CMS 与 environment product diff为空；未发现临时 Client build residue，`git diff --check` PASS。 |
| Documentation and governance | PASS except P2 | root/frontend README准确说明 Validator 与非目标；task/project/board为 UNDER_REVIEW/NOT_ACCEPTED。active task 的单一 current evidence 叙述失真，单列 P2。 |

## Independent Validation

- 恢复 registered reviewer lane，读取正式 request 并在审查前通过 `lane_message.py` ACK。
- 读取 active task、冻结 DESIGN/IMPLEMENTATION_PLAN、全部 execution evidence、Planner checkpoint、TASK-008 manifest/schemas、实现、focused tests、package/lock 与文档。
- 逐行审查 registry、public wrapper、error class 和 mutation/build-boundary tests，未采信 frontend 或 Planner 的 PASS 声称。
- 使用固定 Node.js 24.18.0/npm 11.16.0 fresh 运行 focused 38/38、full 107/107、contract parity、lint、typecheck、production build、dependency tree 与 production audit。
- 用真实 public validation seam 独立复现 raw-reference 与 wrapper-kind mutation；用独立 Ajv 双 registry 脚本核对重基和 strictTypes 两个注解点的语义一致性。
- 复核 package-lock diff、approved integrity、protected-scope diff、server-only/import/loader/leakage/residue scans 和 `git diff --check`。

## Boundaries

Reviewer 未修改 frontend 产品代码、测试、依赖、README、合同快照、TASK-009、CMS、数据库、环境或 Planner-owned task/project/board state。未修复 finding，未执行 acceptance、commit、push、merge、deploy 或 TASK-011。

## Planner Gate

planner_final_validation_allowed: false

Planner 应 ACK 本 FAIL response，记录 `NEEDS_REVISION` recovery，只派发一个 wrapper integrity P1 与一个 active-task current evidence P2 的最窄修订。修订后 fresh 运行 focused/full tests、parity、lint、typecheck、build、依赖/范围/泄漏/治理门，并请求 Round 2。不得启动 Adapter、页面、Transport 接线、CMS、Git delivery、部署或 TASK-011。

---

## Round 2 Review

status: FAIL
review_request: MSG-TASK-010-ADVERSARIAL-REVIEW-R2
p0_count: 0
p1_count: 1
p2_count: 0
planner_final_validation_allowed: false

### Round 2 Verdict

FAIL。Round 1 P2 已关闭，P1 的 caller-input isolation、recursive body freeze、own `kind`/brand descriptors、instance non-extensibility、success/error revalidation、ordinary/revoked Proxy stable errors 与默认 keys/spread/JSON surface 均已实现并 fresh 通过。

但 Round 1 P1 尚未完整关闭：`ValidatedPayload` 实例被冻结，保存 `body` private field 的 prototype 却仍可修改，prototype 上的 `body` getter 仍为 configurable。通过真实 public seam 获得合法 wrapper 后，调用者可重定义该 getter，使已冻结 wrapper 返回任意未验证、未冻结的 body；也可给同一 prototype 添加 `toJSON()`，把默认不序列化的完整 body 输出。该结果直接违反本轮要求的 fixed instance、持续有效 body 和 JSON 不泄漏，仍计一个 P1。

### Round 1 Closure

| Finding | Round 2 result | Independent evidence |
|---|---|---|
| P1 caller reference and writable wrapper | PARTIAL / FAIL | `structuredClone` 已隔离 caller input，`deepFreeze` 递归冻结 snapshot，`Object.freeze(this)` 固定实例 own `kind`、brand 与扩展性；但 class prototype 未冻结，body getter 可重定义，wrapper 的读取与序列化语义仍可被调用者改写。 |
| P2 active task current evidence | PASS | active task Validation Evidence 现在准确记录三个 production modules、聚焦测试、Ajv direct dependencies、lockfile closure、frontend/root README 变化，以及 contract、Transport、src/app、CMS、数据库和环境保护范围。UNDER_REVIEW、44/44、113/113 与 Round 2 gate 叙述一致。 |

### Round 2 Findings

#### P0

- 无。

#### P1

1. **冻结实例仍依赖可变 prototype，body 与序列化合同可在返回后被改写。**
   - `frontend/src/lib/cms/server/validation/index.ts:21-40` 的 `body` 是 class prototype getter；constructor 只在 `:33` 冻结每个实例，没有冻结 `ValidatedPayload.prototype` 或把不可配置 getter固定到实例。
   - 独立 public-seam 复现：合法 success wrapper 的 `Object.isFrozen(wrapper)` 为 true，但 `Object.isFrozen(Object.getPrototypeOf(wrapper))` 为 false；prototype 的 `body` descriptor 为 `configurable: true`。
   - 对该 prototype 执行 `Object.defineProperty(proto, "body", { get() { return attacker; } })` 成功。随后同一 frozen wrapper 的 `body` 返回 caller-controlled `{ apiVersion: "1", schemaVersion: "3.0.0", title: "forged" }`，且该 body 未冻结。原 private snapshot 仍存在，但 public contract 已无法访问它。
   - 另一独立复现给 prototype 添加 `toJSON() { return this.body; }`。同一 wrapper 在修改前序列化为 `{"kind":"success"}`，修改后 JSON 长度为 1759 且包含 canonical title，直接推翻“JSON 不泄漏 body”的持续保证。
   - 现有 44 tests 只检查未受 prototype 改写时的实例 own descriptors、body freeze 与 serialization，未覆盖 getter/prototype 完整性，因此全部 PASS 没有捕获该缺口。

   最窄修订建议：固定承载 private getter 的 prototype 行为，使调用者无法重定义 `body`、添加 `toJSON` 或以等价 prototype mutation 改变合法 wrapper 的读取与序列化语义；保留现有 public exports、private body、kind-only 默认序列化与 server-only 边界。增加 public-seam regression，先取得真实 wrapper，再尝试 prototype getter/toJSON mutation，必须失败且 body revalidation、keys/spread/JSON 仍保持原合同。不得扩展到 Adapter、页面或新依赖。

#### P2

- 无。Round 1 P2 已关闭。

### Direct Regression Revalidation

| Area | Result | Evidence |
|---|---|---|
| Caller isolation and deep body freeze | PASS | success/error body 与输入 deep-equal 但非同一引用；修改原输入不影响 snapshot；root、nested object 和 array 均递归冻结，Reflect writes失败。 |
| Own kind, brand and instance | PASS with prototype P1 | wrapper instance frozen且不可扩展；own kind与私有 symbol brand均 non-writable/non-configurable；prototype行为仍可改写。 |
| Revalidation | PASS before prototype mutation | untouched success/error wrapper body 分别再次通过 public validator；prototype getter改写后此保证失效，归入P1。 |
| Ordinary and revoked Proxy | PASS | 独立 public-seam 运行普通/revoked success/error Proxy，四者均返回 `CmsContractError`、category `contract`、对应既有 invalid kind与固定 message；JSON只含category/kind，无DataCloneError、DOMException或Ajv诊断。 |
| Default keys/spread/JSON | PASS before prototype mutation | 默认 Object.keys/spread/JSON只含kind；prototype toJSON可新增并泄漏body，归入P1。 |
| Active current evidence | PASS | current Validation Evidence与实际R2状态、范围和门禁同步，Round 1 P2关闭。 |
| Registry and errors | PASS | SHA-256仍为Round 1的 registry `8c44250c...49ce`、errors `03b258c9...b72`；实现与公开error kind无回归。 |
| Package and lock | PASS | SHA-256仍为Round 1的 package `c9717038...ab9`、lock `dda25a90...52a7`；direct exact Ajv 8.20.0与ajv-formats 3.0.1，peer deduped；production audit 0 vulnerabilities。 |
| Contract, Transport, app and CMS scope | PASS | 相对TASK-009 baseline，contract snapshot、TASK-009 config/errors/index/resolve-url/transport、src/app、environment与CMS product diff为空。 |
| Server-only and leakage | PASS except prototype serialization P1 | 三个 production validation modules保留server-only；public/deep Client build negatives在focused suite通过；production build无canonical payload、credential sentinel或CMS origin命中。Prototype toJSON能够在runtime显式泄漏body，单列P1。 |
| Tests and build | PASS | 固定Node.js 24.18.0/npm 11.16.0下focused 44/44、full 113/113、16-Schema parity、lint、typecheck、Next production build、dependency tree与production audit fresh PASS。 |
| Residue and diff | PASS | 临时Client build目录为空，`git diff --check` PASS。 |

### Round 2 Boundaries

Reviewer 只读取业务实现、测试、依赖、文档与治理状态；只写本 canonical report、reviewer worklog 和受控消息。未修改 frontend、Planner state、contract、Transport、CMS、数据库或环境，未执行验收、commit、push、merge、部署或 TASK-011。

### Round 2 Planner Gate

planner_final_validation_allowed: false

Planner 应 ACK Round 2 FAIL response，记录受控 recovery，并只修订同一 P1 中的 prototype/getter/serialization 完整性及其 public-seam regression。Round 1 P2 已关闭，不应重新打开或扩展其他设计。完成最窄修订后，需要 fresh focused/full tests、parity、lint、typecheck、build、scope、server-only、leakage和治理验证；是否允许额外 closure review 由 Planner 按 review policy 与用户授权处理。

---

## User-Authorized Closure Review

status: PASS
review_request: MSG-TASK-010-ADVERSARIAL-CLOSURE-REVIEW-R3
p0_count: 0
p1_count: 0
p2_count: 0
planner_final_validation_allowed: true

### Closure Verdict

PASS。用户授权的额外 closure review 只复核 Round 2 prototype-integrity P1、Round 1 P2 持续关闭与直接回归。R3 已把 wrapper 改为 frozen null-prototype object，并以 fixed own properties 承载 closure-backed `body` getter、kind-only `toJSON`、`kind` 和 private brand。独立 public-seam 复现证明 success/error wrapper 均无法被重定义、替换 prototype，或通过 `Object.prototype`/共享 prototype pollution 改变 body、revalidation 与 serialization。Round 2 P1 关闭。

Round 1 P2 仍关闭。审查恢复早期读到的 `PAUSED / waiting authorization` 是 Planner 同步前快照；在 verdict 前重新读取 current sources 后，active task、PROJECT/STATE 与 BOARD 已一致为 `UNDER_REVIEW`，准确记录用户授权、closure request 已派发和当前等待 verdict。最终 P0=0、P1=0、P2=0，Planner final validation allowed。

### Closure Findings

#### P0

- 无。

#### P1

- 无。Round 2 prototype-integrity P1 已关闭。

#### P2

- 无。Round 1 current-evidence P2 保持关闭。

### Prototype Integrity Closure

| Check | Result | Independent evidence |
|---|---|---|
| Wrapper shape | PASS | success/error wrapper 的 prototype 均为 `null`，实例 frozen 且不可扩展；不存在可污染的 shared class prototype。 |
| Own `body` getter | PASS | own descriptor non-enumerable、non-configurable、无 setter；closure 返回已验证 snapshot。`Reflect.defineProperty` 替换 body 对两种 wrapper 均返回 false。 |
| Own kind-only `toJSON` | PASS | own descriptor non-enumerable、non-configurable、non-writable；`Reflect.defineProperty` 覆盖返回 false；JSON 始终精确为对应 kind-only object。 |
| `kind` and brand | PASS | own `kind` enumerable、non-writable、non-configurable；module-private symbol brand non-enumerable、non-writable、non-configurable；两者重定义均失败。 |
| Prototype replacement | PASS | frozen null-prototype instance 的 `Reflect.setPrototypeOf` 返回 false，prototype 保持 null。 |
| Object/shared prototype pollution | PASS | 独立给 `Object.prototype.body` 和 `Object.prototype.toJSON` 注入攻击 getter/function，success/error wrapper 仍读取原 body、重新验证成功并保持 kind-only JSON；污染在独立进程中清理。 |
| Caller isolation | PASS | caller input 修改后 wrapper body 保持原值；success/error body 与 input 非同一引用。 |
| Deep immutability | PASS | body root 与 nested module/error-detail object 均 frozen，写入失败。 |
| Revalidation | PASS | untouched body 分别再次通过 `validateCmsSuccessPayload` 与 `validateCmsErrorPayload`。 |
| Keys/spread/JSON | PASS | `Object.keys` 仅 `kind`，spread 仅 kind，JSON 仅 kind且不包含 body。 |

### Direct Regression Revalidation

| Area | Result | Evidence |
|---|---|---|
| Ordinary/revoked Proxy errors | PASS | 独立运行 ordinary与revoked success/error Proxy；四者均为既有 `CmsContractError`、category `contract`、对应 invalid kind和固定JSON surface，无native clone/Ajv detail。 |
| Server-only | PASS | 三个 production validation modules 保留 framework `server-only`；focused suite 的 public/deep真实 Client Component build negatives通过。 |
| Leakage | PASS | contract errors不暴露raw payload、clone exception或Ajv path；production build扫描无canonical title、credential sentinel、cookie或CMS origin命中。 |
| Dependencies | PASS | package/lock、registry和errors hashes保持冻结值；exact direct Ajv 8.20.0和ajv-formats 3.0.1，peer deduped；production audit 0 vulnerabilities。 |
| Protected scope | PASS | 相对TASK-009 baseline，contract snapshot、TASK-009 Transport/config/errors/public entry、src/app、environment与CMS product diff为空。 |
| Focused/full gates | PASS | 固定Node.js 24.18.0/npm 11.16.0下focused 48/48、full 117/117、16-Schema parity、lint、typecheck、Next production build、dependency tree与production audit fresh PASS。 |
| Residue and governance | PASS | 临时Client build目录为空；`git diff --check`、project validation、message validation和strict lane audit均PASS。 |
| Current facts | PASS | active task、PROJECT/STATE、BOARD与done closure request一致记录用户授权、UNDER_REVIEW和等待verdict；Round 1 P2保持关闭。 |

### Closure Boundaries

Reviewer 未修改 frontend、测试、依赖、README、contract、Transport、CMS、数据库、环境或 Planner-owned state；只追加本 canonical review、更新 reviewer worklog 并发送关联受控 response。未执行验收、commit、push、merge、部署、Adapter、页面、Transport wiring或 TASK-011。

### Closure Planner Gate

planner_final_validation_allowed: true

Planner 可 ACK 本 closure PASS，记录 review recovery并执行最终验证。PASS 不是用户验收，也不授权 Git delivery、部署、Adapter、页面、Transport wiring、CMS或 TASK-011。
