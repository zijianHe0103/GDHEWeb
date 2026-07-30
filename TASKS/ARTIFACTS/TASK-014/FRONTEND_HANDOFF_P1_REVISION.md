# TASK-014 Frontend Handoff P1 Revision

revision_at: `2026-07-29T18:54:15Z`
source_audit: `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_READONLY_AUDIT.md`
verdict: `FAIL / P0=0 / P1=2 / P2=1`
task_state: `IN_PROGRESS`

## 已通过且必须保持

- 8-file ProductCard transitive Schema closure；
- 当前 handoff manifest/checksum parity；
- closed DTO、内部字段排除和 shared Schema byte parity；
- 四格 kind/lifecycle/action/path；
- 一次 ProductCard collection 请求、零逐卡 `/resolve`；
- request normalization、ETag、`public, max-age=60`、error `no-store` 与 bodyless `304`；
- server-only 可行性；
- source UUID 与 resolved target stable UUID 的 fail-closed 绑定。

## P1-1：缺少真实 one-item HTTP 证据

当前 runtime Golden item counts 为：

```text
4, 0, 4, 2, 2, 0, 4
```

inline Schema positive 的 1 item 只证明 Schema 可接受，不证明真实 route、header、total/totalPages、action、资格顺序和单次请求。

### 最小关闭要求

1. 新增一个真实匿名 `/product-cards` 请求，例如确定性的 `per_page=1&page=1`。
2. 验证 `200`、恰好 1 item、`total=4`、`totalPages=4`、既有 ETag/cache/request-id header。
3. 证明仍是一次 collection request，且 ProductCard 内部和未来 frontend 均无需逐卡 `/resolve`。
4. 将该真实响应纳入正式 Golden 或等价的不可变 handoff 成功样本；前端后续不得自行构造权威 1-item 样本。
5. 两轮 determinism 均包含该样本，更新成功样本数量断言和文档。

## P1-2：缺少合法非空 series/applications 正向证据

当前所有 runtime Golden 和 inline positive 的 `series`、`applications` 都为空。mismatch negative 证明错误引用会被拒绝，但不能证明合法非空引用能被发布。

### 最小关闭要求

1. 只在隔离 TASK-014 Fixture 中增加公开、唯一且可构造合法 envelope 的 series landing 与 application landing。
2. 为至少一张合法卡片输出：
   - 一个非空 `series` reference；
   - 一个非空 `applications` reference。
3. 每个 reference 的 source UUID 必须等于其 resolved target stable public UUID；label/path 合法且目标公开可链接。
4. 在 runtime test 和 Golden 中断言非空正向形状；保留三个位置的 mismatch negative。
5. 精确清理新增 landing，更新 manifest post count/cleanup count，并证明无 post/meta/term/option/upload 残留。

## 证据重新冻结

- ProductCard Golden、runtime、Schema、error、determinism；
- handoff manifest 与 checksum；
- CMS README/REST/operations 及 TASK-014 execution/validation/diff evidence；
- 既有 A3 19-file / 15 Golden / 6 boundary / runtime 回归；
- PHP、JSON、Core、SCF、DB、scope、governance 和 `git diff --check`。

## P2 保留

生产 HTTPS media origin 与 Next Image allowlist 继续作为未来可见页面/部署 gate。本轮不得选择域名、修改 Next.js image config 或实施 UI。

## 严格边界

本轮只补 Fixture/Golden/runtime/handoff 证据，不改变：

- route、ProductCard Schema `1.0.0`、公开字段和四格 action；
- Content Schema `3.0.0` 与既有公开 endpoint；
- `frontend/**`、SeoDocument、真实产品、飞书、RFQ、部署或 Git 交付。
