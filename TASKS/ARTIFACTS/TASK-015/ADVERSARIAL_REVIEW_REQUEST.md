# TASK-015 Adversarial Review Request

round: 1
requested_by: `planner`
requested_lane: `adversarial_reviewer`
status: `COMPLETE_PASS`

## Scope

对 TASK-015 的 ProductCard Contract Snapshot 与离线权威校验器做独立只读审查。不得直接修复业务交付物，不得验收、Git 交付、部署或开始后续任务。

## Required Challenges

1. TDD RED 是否真实发生在 verifier/Snapshot 不存在时，而非环境或无关失败。
2. 13-file inventory、精确 8-file `$ref` closure、authority path/hash 和 25-entry handoff parity 是否真正 fail closed。
3. missing、extra、tamper、path traversal、remote/unknown `$ref`、authority substitution 与 source drift mutation 是否只发生在临时副本并稳定失败。
4. 三份 success sample 是否真正证明 0/1/N、四种冻结 action 与合法非空 series/applications。
5. 六份 error sample 是否从 TASK-014 权威容器确定性重建，未发明新语义。
6. 是否存在绝对路径、凭据、内部字段泄漏、运行时 `cms/**`/`TASKS/**` import 或对正式 authority/Snapshot 的 mutation。
7. 是否越权实现 Transport、runtime Validator、DTO Adapter、UI、CMS、数据库、依赖或部署。
8. 既有 TASK-008 `/resolve` Snapshot/verifier、package lock、受保护范围和全量回归是否保持。
9. 两份 README 是否准确表达“只有离线合同基础、尚无可见页面”。
10. 762-line verifier 与测试结构是否包含影响正确性、可维护性或最小范围的 P0/P1/P2 问题。

## Evidence

- `TASKS/ACTIVE/TASK-015-product-card-contract-snapshot.md`
- `TASKS/ARTIFACTS/TASK-015/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-015/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-015/TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-015/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-015/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-015/DIFF_OR_OUTPUT_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-015/PLANNER_CHECKPOINT.md`
- `frontend/src/lib/cms/product-card-contract/**`
- `frontend/scripts/verify-product-card-contract.mjs`
- `frontend/tests/product-card-contract-snapshot.test.ts`
- `frontend/package.json`
- `frontend/README.md`
- `README.md`

## Expected Output

写入 `TASKS/ARTIFACTS/TASK-015/ADVERSARIAL_REVIEW_REPORT.md`，并通过受控消息返回：

- verdict：`PASS`、`FAIL` 或 `BLOCKED`
- `P0`、`P1`、`P2` 数量
- 独立复现的验证证据
- 每个 finding 的精确文件/行为/影响和最小修订范围
- 明确说明是否允许 Planner final validation

`PASS` 只有在 `P0=0 / P1=0 / P2=0` 时才能满足本任务最终验收门。
