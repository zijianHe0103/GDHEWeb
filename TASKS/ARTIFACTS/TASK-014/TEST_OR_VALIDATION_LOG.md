# TASK-014 Test and Validation Log

status: PASS
scope: `PASS_FOR_LANE_EXECUTION`

| Gate | Result | Evidence |
|---|---|---|
| Test-first RED | PASS | Prior REDs plus wrong route-role acceptance and native pagination overflow observed before their corresponding minimum changes |
| ProductCard Draft 2020-12 closure | PASS | 8 exact transitive files |
| Inline Schema positive/negative | PASS | 1 positive; 6 negative mutations |
| Runtime Golden Schema | PASS | 8/8, including real one-item anonymous response |
| Anonymous ProductCard route | PASS | GET; empty pre/post-Fixture response `200` |
| Valid Fixture cards | PASS | 4/4 eligible |
| Invalid candidate exclusions | PASS | 12/12 excluded, including `mismatched_reference_id` |
| Reference identity binding | PASS | source UUID equals resolved target stable UUID; mismatch rejected for primaryCategory/series/applications shared helper |
| Reference route-role binding | PASS | category limited to frozen curtain-track/accessory families; series `/series/`; applications `/applications/`; three wrong-role cases rejected |
| Old-namespace byte scan | PASS | active production/Fixture/contract+Schema tests/Goldens/runtime+Schema evidence contain no `/products/category/` or `/products/series/` |
| Positive relation projection | PASS | one valid card emits one identity-bound series and one identity-bound application |
| Request negatives | PASS | 11/11 normalized error cases, including native-integer and offset overflow |
| Pagination/total | PASS | items `2/2/0`; totals `4/4/4` |
| Pagination overflow | PASS | 100-digit page and `PHP_INT_MAX × 100` offset fail before slicing as normalized `400 no-store` |
| Real one-item request | PASS | `200`; items `1`; total `4`; totalPages `4`; ETag/cache/request-id; server-derived action; one collection request and zero per-card resolve |
| Filters | PASS | category filter `4`; absent category `0` |
| Action matrix | PASS | all four kind/lifecycle cells |
| Leakage scan | PASS | no database/media IDs, meta/ACF/SCF, Feishu, Article Number, supplier or price internals |
| Cache/error headers | PASS | ETag, public max-age 60, request ID; errors no-store; conditional `304` |
| Two-lifecycle determinism | PASS | different database IDs; identical 8/8 Golden hashes |
| A3 runtime regression | PASS | 15 Golden; totals `3/3/3`; items `2/1/0`; negative matrix |
| A3 Schema regression | PASS | 19/19 graph; 15/15 Golden; 6/6 boundary negatives |
| Exact TASK-014 cleanup | PASS | posts/meta/terms/termmeta/options/uploads all zero |
| A3 cleanup | PASS | Fixture/migration meta and option zero |
| Plugin PHP lint | PASS | all GDHE Site PHP files |
| Plugin JSON parse | PASS | all GDHE Site JSON files |
| WordPress Core checksum | PASS | WordPress `7.0.2` |
| SCF checksum | PASS | official Secure Custom Fields `6.9.2` |
| Database check | PASS | 12/12 WordPress tables |
| GDHE Site version/status | PASS | `0.5.0`, active |
| Handoff checksums | PASS | 25/25 exact file checksums |
| Reviewer bytecode cleanup | PASS | two disclosed hashes matched; exact files removed; no plugin-test `.pyc` or `__pycache__` remains |
| Forbidden path status | PASS | frontend, root README, architecture docs, Core, SCF, themes and wp-config unchanged by this lane |
| `git diff --check` | PASS | no whitespace errors |

## Machine evidence

- `PRODUCT_CARD_RUNTIME_VALIDATION.json`
- `PRODUCT_CARD_SCHEMA_VALIDATION.json`
- `PRODUCT_CARD_ERROR_FIXTURES.json`
- `PRODUCT_CARD_DETERMINISM.json`
- `PRODUCT_CARD_HANDOFF_MANIFEST.json`
- `PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256`
- `golden-product-card/*.json`

## Cleanup proof

Each final determinism round removed exactly 19 posts and 3 task terms. The final read-back returned zero for TASK-014 posts, source/marker postmeta, terms, termmeta, manifest option and uploads, plus zero for A3 Fixture/migration meta and A3 manifest option.

No temporary user or WordPress HTTP listener was created. The local MySQL service was used only as the existing test runtime.
