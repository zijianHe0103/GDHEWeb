# TASK-026 Adversarial P1 Round 1 Planner Checkpoint

validated_at: 2026-08-12T03:38:00Z
result: PASS_FOR_NARROW_FINDING_CLOSURE

## Controlled response

- `MSG-TASK-026-ADVERSARIAL-P1-R1-REVISION-RESPONSE` is validated and ACKed/done.
- The response is linked to the two-finding revision request and changes only TASK-026 artifacts plus executor worklog.
- The unique complete review remains historical `FAIL / P0=0 / P1=2 / P2=0`.

## Independent reproduction

- `node TASKS/ARTIFACTS/TASK-026/verify-machine-contract.cjs`: `94/94` PASS, `47` positive, `47` negative, zero failures.
- Exactly five strict Draft 2020-12 Schemas and `63` closed local references remain.
- All `20` JSON artifacts parse; TASK-026 contains `37` regular files and zero symlinks.
- All `67/67` protected hashes pass with no protected runtime/CMS/frontend/TASK-024/TASK-025 drift.
- An independent Node crypto calculation reproduces HMAC `0510704e9ab00f2297ee7a4525e37714229f2fb6076457735b79eae2c060c84d` and confirms the authoritative sample binds that digest and key version.
- Independent replay assertions confirm five cases, the exact `2592000000 ms` first-reservation anchor, zero pre-reservation business state, and no expired-indeterminate resend or expiry extension.
- `git diff --check`, project, registry, message and strict-lane validation pass.

## Finding closure evidence

- P1-1: real Basket 3.0 ready standard/custom/accessory projection and valid non-ready rejection are executable; TASK-025 request/response binds count, order, identity, kind, unit, quantity, path, selection, packaging, resolution, model and all Article Number positions; mismatched root/nested Article Number rejects.
- P1-2: isolated surrogate input is constructed in memory from an interoperable JSON code-unit description and rejects before canonicalization; authoritative digest, altered digest, bad HMAC, bad comparison token and all five replay tuples/effects are executable gates.

## Scope and next gate

No form, Route Handler, persistence, frontend/CMS runtime, Feishu, Git or deployment work occurred. The only next gate is a same-reviewer check limited to closing the two original findings. This is not a second complete review and is not acceptance.
