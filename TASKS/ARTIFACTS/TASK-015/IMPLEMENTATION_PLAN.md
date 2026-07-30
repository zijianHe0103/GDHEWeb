# TASK-015 Implementation Plan

## A1 Planner Design Gate

1. 冻结 DESIGN、样例选择、manifest 结构、authority mapping 和 mutation matrix。
2. 记录 Node/npm、TASK-014 authority hashes、TASK-008 protected hashes 和当前前端 baseline。
3. 运行 DPG project/registry/messages/strict lane 与 diff validation。
4. 通过后任务从 `READY` 转为 `IN_PROGRESS`，创建并 dispatch 唯一 frontend implementation request。

Exit：

- DESIGN 与本计划存在；
- baseline 事实真实；
- frontend/CMS 尚未因 TASK-015 修改；
- DPG gate PASS。

## A2 Frontend TDD RED

1. ACK 受控消息。
2. 只新增 `frontend/tests/product-card-contract-snapshot.test.ts` 的首个 canonical test。
3. 运行 focused test，确认因为 verifier/Snapshot 缺失而失败。
4. 把命令、exit code 和关键错误写入 `TDD_RED_EVIDENCE.md`。

Exit：

- RED 是功能缺失，不是拼写、Node 版本、权限或测试基础设施错误；
- 尚无生产 verifier/Snapshot。

## A3 Minimum GREEN

1. 新建独立 `product-card-contract` Snapshot tree。
2. exact-byte 复制 8 Schema、3 success sources。
3. 从 frozen error source 确定性生成 selected error Snapshot。
4. 写 closed manifest 和 built-in-only verifier。
5. `package.json` 只增加 `verify:product-card-contract`。
6. 扩展 focused test 覆盖完整 mutation matrix。
7. 更新 frontend README 和根 README。

Exit：

- focused tests 和 CLI verifier PASS；
- mutation cases 全部 fail closed；
- lockfile/dependencies/旧 Snapshot 未变化。

## A4 Frontend Full Validation And Handoff

运行 Node `24.18.0` / npm `11.16.0`：

1. `npm run verify:product-card-contract`
2. focused Vitest
3. `npm run verify:cms-contract`
4. `npm run lint`
5. `npm run typecheck`
6. `npm test`
7. `npm run build`

完整测试需要监听临时 `127.0.0.1`；若沙箱返回 `EPERM`，按系统审批通道在沙箱外重跑，不能把环境拒绝记为实现失败。

另行验证：

- TASK-014 authority hashes；
- `package-lock.json`、旧 `/resolve` manifest/verifier hashes；
- exact file inventory；
- no `cms/**`/`TASKS/**` runtime imports；
- no secret/absolute path/internal-field leakage；
- Markdown/links、scope、DPG 和 `git diff --check`。

Frontend lane 输出：

- `TDD_RED_EVIDENCE.md`
- `EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- execution response

## A5 Planner Checkpoint

Planner 不信任 lane 自报，重新检查 diff 并 fresh rerun：

- verifier；
- focused/full tests；
- old verifier；
- lint/typecheck/build；
- hashes/inventory/scope；
- governance gates。

如发现 P0/P1，任务进入窄修订；否则生成 review request 并转 `UNDER_REVIEW`。

## A6 Independent Adversarial Review

Reviewer 只读复核：

- authority substitution/source drift 是否真 fail closed；
- exact 8-file closure；
- 0/1/N、四种 action、非空 relation；
- error selection 未制造新语义；
- mutation 不触碰正式权威；
- 无 runtime cross-directory dependency；
- 无依赖、旧 Snapshot、CMS、UI 或外部范围扩张。

只有最终 `PASS / P0=0 / P1=0 / P2=0` 才允许 Planner final validation。

## A7 Acceptance Preparation

Planner fresh 验证、完成 `PLANNER_SUMMARY.md`、将文档影响改为 `RESOLVED`、README 影响改为 `UPDATED`，再运行 checked：

```bash
task_transition.py prepare-awaiting-user --root "$PWD" --task TASK-015
```

随后等待用户精确正式交付口令；不自动 commit、push、merge 或开始下一任务。
