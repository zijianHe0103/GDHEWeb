# TASK-025 WordPress Validation Log

| Gate | Result |
|---|---|
| Strict TDD | PASS: original 10 REDs preserved; RED 11 covers root-bound refs and RED 12 covers injected post-create cleanup before minimum GREEN |
| PHP syntax | PASS for TASK-025 runtime, Fixture, MU bootstrap and PHP tests |
| JSON syntax | PASS for all four new Schema roots/dependencies and generated JSON evidence |
| Draft 2020-12 | PASS: 3 roots, 7 runtime Goldens, 6 request negatives, 2 response negatives; both mixed roots pass offline under `jsonschema 4.17.3` and `4.21.1` with 17 internal refs root-bound |
| RelatedProductCard | PASS: v1 exact shape and v2 accessory Article Number; inconsistent global source/index omits affected v2 actions |
| Mixed validation | PASS: standard, refresh, custom, accessory, mixed ordering, 1 and 50 lines |
| Atomic negatives | PASS: malformed/size/media/query/unknown/count/duplicate, unpublished, source/index/global, role/unit/path/config, overflow and sanitized unexpected failure |
| Query graph | PASS: maximum observed product-domain candidate queries `2`; public subrequests `0` |
| Determinism | PASS: final lifecycle IDs `3685..3688` and `3691..3694`; all 10 frozen evidence hashes equal |
| Failure cleanup | PASS: injected post-create failure exits `1` with its original sanitized marker only after cleanup; immediate residue `0/0/0/0` |
| Cleanup | PASS each normal lifecycle: 4 posts, 3 terms, 1 option; final TASK-025 residue `0/0/0/0` |
| Real HTTP | PASS on `127.0.0.1:8080`: anonymous POST 1/50 lines, HTTP 200, `no-store`, no ETag, request ID present; server stopped |
| Product Configuration 2.0 regression | PASS frozen root/Golden plus exact-decimal `4.3/5.8/6.7` positives and `6.05` negative; TASK-025 runtime reconfirmed standard/refresh/custom authority |
| RelatedProductCard 1.0 regression | PASS frozen root against the TASK-025 v1 Golden and exact v1 runtime projection in both final lifecycles |
| Protected baseline | PASS: all 12 frozen rows and 13 unaffected shared-seam rows match; only declared `related-product-cards.php` seam changed |
| Platform | PASS all GDHE PHP lint, TASK-025 JSON, Python compile with exact cache cleanup, WordPress Core checksum, SCF checksum and database check |

Final machine evidence is under this directory. Fixture content and the
temporary loopback server are absent after validation.
