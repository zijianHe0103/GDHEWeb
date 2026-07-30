# TASK-015 Baseline Validation

captured_at: 2026-07-30T05:58:53Z

## Versions

- required/validated Node：`v24.18.0`
- required/validated npm：`11.16.0`
- default shell Node：`v20.11.1`，不满足项目 Node 24 gate
- default shell npm：`10.2.4`

必须把本机 Node `v24.18.0` 的 binary directory 置于执行 PATH 首位运行前端验证。只用绝对路径启动 npm 仍会让 child scripts 解析到默认 Node 20，因此不能作为有效 Node 24 baseline。

## Frozen Hashes

| file | SHA-256 |
|---|---|
| `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_MANIFEST.json` | `aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb` |
| `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256` | `c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883` |
| `frontend/package.json` | `c97170388756910fc13ba8642a5044ffd2d30a307cb603449f465d8b79d2dab9` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| `frontend/src/lib/cms/contracts/manifest.json` | `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7` |
| `frontend/scripts/verify-cms-contract.mjs` | `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528` |

TASK-008 `/resolve` Snapshot inventory：20 files。

TASK-015 product-card Snapshot/verifier/focused test 在 baseline 时均不存在。

## Commands And Results

在 Node `24.18.0` / npm `11.16.0` 下：

| command | result |
|---|---|
| `npm run verify:cms-contract` | PASS：16 schemas、2 success、2 errors |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS；现有 `/`、`/_not-found`、`/integration/cms` |
| sandboxed `npm test` | environment failure：41 tests failed from shared `listen EPERM 127.0.0.1` |
| approved non-sandbox `npm test` | PASS：9 files、158 tests |

Sandbox `EPERM` 由现有 HTTP tests 创建临时 listener 触发；相同代码在获批的非沙箱执行中全部通过，因此 baseline 没有产品测试失败。

## Scope

- 尚未出现 `frontend/src/lib/cms/product-card-contract/**`。
- 尚未出现 `frontend/scripts/verify-product-card-contract.mjs`。
- 尚未出现 `frontend/tests/product-card-contract-snapshot.test.ts`。
- TASK-015 尚未修改 `frontend/**`、`cms/**`、数据库或外部系统。
- `.codex/config.toml` 与已有 resume packets 是任务外既存 dirty/untracked 内容，必须持续排除。
