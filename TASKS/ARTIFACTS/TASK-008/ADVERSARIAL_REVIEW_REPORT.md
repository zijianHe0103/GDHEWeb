# TASK-008 Adversarial Review Report

verdict: PASS
reviewed_by: adversarial_reviewer
reviewed_at: 2026-07-24T17:25:35Z
review_message: MSG-TASK-008-ADVERSARIAL-REVIEW-R1
round: 1
p0_count: 0
p1_count: 0
p2_count: 0
planner_final_validation_allowed: true

## Verdict

PASS。独立复核未发现 P0、P1 或 P2。TASK-008 当前交付精确冻结两个 roots 的 16-file local `$ref` closure、两个成功样例和两个错误样例；来源、快照、checksum 与身份均受约束。初始 authority-binding P1 已真实关闭：manifest 不能把同字节文件替换为另一来源路径，也不能改写 Page、Product、error bundle、root 或 selector 身份后继续通过。

Planner 可以进入 final validation。该结论不等于用户验收，也不授权 commit、push、merge、accept、close、deploy、Transport、Validator、DTO、页面、TASK-009 或任何 CMS/数据库修改。

## Findings

### P0

- 无。

### P1

- 无。

### P2

- 无。

## Authority-Binding P1 Regression

初始问题是 verifier 只校验安全相对路径、checksum 和字节相等，导致 manifest 可将 canonical Schema authority 换成同字节 `.rogue` 文件。当前实现已把身份验证前置到任何文件读取之前：

- `frontend/scripts/verify-cms-contract.mjs:87-96` 固定 `sourceTask=TASK-007`、API `1`、Schema `3.0.0` 与 ordered roots `error.schema.json`、`page.v3.schema.json`。
- `frontend/scripts/verify-cms-contract.mjs:98-112` 要求恰好 16 个 Schema，并将每个 `schemas/**` snapshot path 一一映射到唯一 canonical CMS source path；source 和 snapshot 两组路径还必须排序且唯一。
- `frontend/scripts/verify-cms-contract.mjs:114-152` 固定 ordered Page/Product 的 name、type、TASK-007 source 和 snapshot identity。
- `frontend/scripts/verify-cms-contract.mjs:153-178` 固定错误 source、snapshot、两个 ordered selectors 与 code/status。
- `frontend/scripts/verify-cms-contract.mjs:203-210` 随后才对每个直接项同时要求 source hash、snapshot hash 和 byte parity。

因此，单独篡改 manifest 不能重定向 authority 或弱化 frozen identities。即使攻击者同时更新 manifest checksum 与 snapshot，当前 canonical source hash 或 byte parity 仍会失败；若连 TASK-007/CMS authority 也同时修改，那已不是 manifest-only 攻击，并会违反本任务禁止范围。当前 `git diff` 对全部 TASK-007 artifacts 与 `cms/**` 均为空。

永久回归测试使用同字节 `.rogue` Schema source substitution，并明确要求 rejection。Reviewer 使用固定 Node 24.18.0/npm 11.16.0 fresh 重跑 focused/full suite；该回归和此前 missing、extra、byte tamper、traversal、unknown-local-ref cases 全部通过。

## Acceptance Revalidation

| Area | Result | Independent evidence |
|---|---|---|
| Exact two-root closure | PASS | Reviewer 用独立只读 traversal 从 frozen roots 重新计算 closure：visited=16、declared=16、filesystem Schema files=16，三者集合相同。 |
| Excluded contracts | PASS | 16-file closure 中没有 collection、navigation 或 route-manifest 文件；contract tree 只有 manifest、16 Schema、2 success 与 1 error bundle，共 20 files。 |
| Schema byte/checksum/source parity | PASS | 独立复算 16 Schema 与两个 success entries，18/18 source/snapshot bytes 相等且 SHA-256 等于 manifest。CLI verifier再次输出 `16 schemas, 2 success samples, 2 error samples`。 |
| Page/Product identity | PASS | Page 固定为 TASK-007 `resolve-home.json`，Product 固定为 `resolve-product-alpha.json`；两份 snapshot 与 source byte-identical，hash 分别为 `380c48ae...e4df0` 与 `d304c769...375f`。 |
| Error identity | PASS | source 固定为 TASK-007 `ERROR_CONTRACT_FIXTURES.json`；ordered selectors 精确为 `gdhe_invalid_schema` 和 `gdhe_not_found`，状态为 400/404。独立重建 bytes 与 snapshot 相等，source/snapshot hashes 分别为 `d7f35521...cfd58`、`c13c4fd...29de3`。 |
| Manifest path, sorting and uniqueness | PASS | 根、Schema source/snapshot 与 success source/snapshot 均验证排序/唯一；all snapshot paths 全局唯一；manifest 不可自声明；inventory exact missing/extra check 在 closure 前执行。 |
| Missing, extra and byte tamper | PASS | 永久 temporary-repository tests 分别删除 declared file、添加 undeclared file、修改一个 snapshot byte，均要求 verifier reject；fresh full suite 9/9 PASS。 |
| Traversal and escaping refs | PASS | Manifest paths 拒绝 absolute、backslash、empty segment、`.` 与 `..`；local `$ref` normalize 后拒绝 schema-root escape。永久 traversal test fresh PASS。 |
| Remote and unknown refs | PASS | Verifier 对 URI scheme 与 protocol-relative reference 明确 fail closed，对不在 declared set 的 local target 明确 fail closed；unknown-local-ref permanent test fresh PASS。 |
| Runtime isolation | PASS | `src` 没有从 `cms/` 或 `TASKS/` import。authority paths 只存在于 snapshot manifest 和 offline verifier identity assertions；没有 HTTP、env read、runtime validator、DTO 或 page consumption。 |
| Secrets and internal IDs | PASS | Snapshot、verifier与测试扫描未发现 credential/private-key pattern 或 numeric database/post/term ID field。公开样例沿用 TASK-007 UUID contract。 |
| Dependency and forbidden scope | PASS | `frontend/package.json` 只新增 `verify:cms-contract` script；dependencies/overrides/devDependencies 未变。lockfile current 与 HEAD SHA-256 均为 `fa5938d...26a0`。`frontend/src/app/**`、CMS、env/config、TASK-007 authority diff 均为空。 |
| README | PASS | README 准确说明 TASK-007/CMS 仍是 authority、本地 snapshot ownership、offline command、fail-closed categories 与 Transport/Validator/DTO/page 非目标；未把快照描述成可浏览网站或 runtime CMS integration。 |
| Toolchain and build | PASS | Fixed Node `v24.18.0`、npm `11.16.0` 下 parity、lint、typecheck、Vitest 3 files/9 tests 与 production build 全部 fresh PASS；build 仍只有 `/`、`/_not-found`。 |
| Governance | PASS | Request 先 ACK；TASK/PROJECT/BOARD 均为 `UNDER_REVIEW`，acceptance 为 `NOT_ACCEPTED`。Project validation、controlled-message validation、strict lane audit 和 `git diff --check` fresh PASS。 |

## Independent Validation

- 读取 reviewer resume chain、TASK-008 active task、frozen design/plan、全部 execution evidence、Planner checkpoint、manifest/verifier/tests/README，以及 TASK-007 handoff/error/Golden/Schema authority。
- 未采信 frontend 或 Planner 的完成声称；分别从 roots 重算 closure、从 source/snapshot 重算 byte/hash parity、从 TASK-007 error container 重建 error bundle。
- 逐行追踪 verifier 的 manifest identity、safe path、inventory、direct parity、closure 与 sample invariant 控制流。
- 使用任务指定的固定 Node/npm 运行 parity、lint、typecheck、9 tests 和 production build。
- 检查 current/HEAD lockfile hash、产品依赖 diff、app/CMS/env/config/TASK-007 authority diff、secret/internal-ID 与 runtime cross-directory import。
- 运行 DPG project validation、message validation、strict lane audit 与 global diff check。

## Limitations and Boundary

Reviewer 曾尝试运行额外的全来源替换及 remote/traversal temporary-repository matrix，但 write-scope hook 无法证明 inline script 的写入只发生于系统临时目录，因此在执行前阻止了命令。Reviewer 没有绕过治理，也没有把该矩阵记为已执行证据。相关结论来自 fresh permanent tests、独立只读复算和 verifier 明确的通用控制流。

Reviewer 没有修改业务交付物、Planner state、TASK-007 authority、CMS、数据库、environment、dependencies、lockfile 或页面；没有执行 Git/远端/部署/验收操作，也没有开始 Transport、DTO、Validator、页面或 TASK-009。

## Planner Gate

planner_final_validation_allowed: true

Planner 可以 ACK 本 PASS response，记录 review recovery，并执行 final validation 与 checked acceptance preparation。若后续 source authority、snapshot、manifest 或 verifier 任一发生变化，必须重跑 parity、全量测试、范围与治理检查；当前 PASS 不可跨变更沿用。
