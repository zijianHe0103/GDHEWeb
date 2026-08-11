# TASK-025 WordPress Evidence for Planner Checkpoint Round 2

status: READY_FOR_PLANNER_CHECKPOINT

This is execution evidence, not a Planner verdict, review, acceptance or Git
delivery.

## P1-1 closure

- RED: the new static/cross-validator gate found 8 Request and 9 Response
  fragment-only internal references; both installed validators exited `1`.
- GREEN: all 17 internal references use their exact mixed-root `$id` plus
  fragment. Full positive and negative documents pass under Anaconda
  `jsonschema 4.17.3` and system `jsonschema 4.21.1`.
- Offline proof: HTTP and HTTPS resolver handlers fail immediately; the closed
  local store satisfies every exercised reference. No business field, route,
  version, success document or error behavior changed.

## P1-2 closure

- RED: injected failure immediately after Fixture creation exited `1` and left
  `4` posts, `1` option, `3` terms and `3` private-meta rows; controlled cleanup
  then restored `0/0/0/0` before the GREEN edit.
- GREEN: every post-create path runs exact cleanup and residue validation in a
  `finally` block. The same injected failure is re-raised with its original
  sanitized marker only after cleanup, and immediate residue is `0/0/0/0`.
- Normal proof: two complete lifecycles used different WordPress IDs
  (`3685..3688`, `3691..3694`), retained equal 10/10 evidence hashes and each
  removed exactly 4 posts, 3 terms and 1 option.

## P2-1 closure

`WORDPRESS_TDD_RED_EVIDENCE.md` now declares `RED/GREEN complete`; the original
ten RED records are unchanged and the two new focused RED/GREEN records follow
them.

## Preserved gates

- anonymous real HTTP 1-line and 50-line responses: `200`, `no-store`, no ETag;
- Product Configuration `2.0.0` exact-decimal and RelatedProductCard `1.0.0`
  Schema/runtime authority;
- all 25 protected exact rows outside the declared RelatedProductCard v2 seam;
- WordPress Core, SCF, 12-table database, PHP, JSON, Python-cache cleanup and
  final TASK-025 `0/0/0/0` residue.

The refrozen 52/52 handoff hashes are recorded after final generation below.

- manifest SHA-256: `9bfb794e6dace0e4a15aef5f2d5a755b333482d297d1a071f74bbbb1277bce5f`
- checksum stream SHA-256: `512b27a4b6d42b94cc73f45943b11a4b20ce4d08bd7305382f556e9a0c41e25a`

Frontend remains blocked pending independent Planner Round 2 validation.
