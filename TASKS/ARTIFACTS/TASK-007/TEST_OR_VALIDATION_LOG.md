# TASK-007 A2 Collection Eligibility R5 Test and Validation Log

Validated on `2026-07-24` in the local WordPress environment.

| Check | Result |
|---|---|
| PHP syntax for all 12 `gdhe-site` PHP files | PASS |
| Python test compilation | PASS, 3 scripts |
| Draft 2020-12 schema self-check | PASS, 18 schemas |
| Anonymous successful DTO suite | PASS, 13 Golden responses |
| Stable application and exclusion matrix | PASS, 24 runtime negatives/exclusions / 10 canonical error bodies |
| Error Schema validation | PASS, 10/10 |
| Module machine fixtures | PASS, 4 valid accepted / 4 invalid rejected |
| Malicious HTML tags, event attributes and dangerous protocol | PASS, absent from public DTO |
| Canonical public path positive/negative matrix | PASS |
| Template/link/CTA/module fail-closed behavior | PASS |
| Four endpoints 200/304/error header matrix | PASS |
| Multi-item collection filters, sorts, tie-break and pages | PASS, three published filtered Services |
| Cross-page collection total invariant | PASS, totals `[3, 3, 3]` with item lengths `[2, 1, 0]` |
| Published ineligible collection candidates | PASS, unknown template / invalid module / invalid canonical path excluded from both items and total |
| Collection item resolve parity | PASS, all three eligible filtered items resolve anonymously with matching public UUID |
| `per_page` valid 1/100 and invalid 0/101 | PASS |
| UUIDv4 and navigation/route/relation/collection bounds | PASS |
| Two final create/contract/schema/hash/cleanup lifecycles | PASS |
| Golden equality across final lifecycles | PASS, 13/13 identical |
| WordPress IDs changed while public hashes remained stable | PASS |
| Existing warmed HTTP benchmark | Unchanged R3 evidence, 800 measured requests / 0 errors |
| Existing benchmark aggregate | p50 `647.517 ms`, p95 `699.596 ms` |
| Final Fixture cleanup and baseline restoration | PASS |
| TASK posts/revisions/meta/relationships/terms/uploads/users/options/processes/listeners | PASS, all zero |
| `wp db check` | PASS, 12 tables |

Primary reproducible commands:

```sh
find cms/wp-content/plugins/gdhe-site -name '*.php' -print0 | xargs -0 -n1 php -l
python3 cms/wp-content/plugins/gdhe-site/tests/a2-determinism-test.py
wp db check --path=cms --allow-root
```

The R4 revision did not rerun or change the benchmark because the dispatch required contract, Schema, Golden/checksum, two-lifecycle determinism, cleanup, PHP lint and scope validation. Existing R3 p95 values retain a separate future GraphQL PoC/ADR trigger; no GraphQL work was performed.
