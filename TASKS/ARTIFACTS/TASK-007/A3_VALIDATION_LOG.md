# TASK-007 A3 validation log

Validated on: `2026-07-24`

## Static validation

- all changed plugin PHP files: `php -l` PASS
- all plugin JSON files: parse PASS
- `config/schema.v3.json`, `field-groups.v3.json` and Draft 2020-12 schemas: parse PASS
- no frontend, root README, Core, SCF source, theme or third-party plugin file was changed by A3
- secret-pattern scan over plugin, CMS docs and TASK-007 artifacts: no match

## Migration inventory

`wp --path=cms gdhe a3-migrate inventory`:

```json
[
  {
    "postId": 833,
    "legacyType": "service",
    "status": "auto-draft",
    "classification": "ignored_ephemeral",
    "targetType": "",
    "reason": "auto_draft_is_not_business_content",
    "wouldWrite": false
  }
]
```

No real-content migration apply was required or executed. The disposable runtime suite passed non-zero inventory, dry-run, apply, repeated apply, exact rollback, repeated rollback, ambiguity refusal, early post-update failure and path/template/relation read-back failures. All injected failures restored the complete snapshot and removed marker/backup meta.

## Runtime contract

- positive Golden responses: 15/15 PASS
- Draft 2020-12 Golden schema validation: 15/15 PASS
- UUIDv4, relation maximum, required product code, database-ID additional-property, Product HTTP video and Support non-HTTPS video negatives: PASS
- native Post and non-root Page resolve/route-manifest coverage: PASS
- Product collection totals across page 1/page 2/terminal page: `3/3/3`
- Product collection items across those pages: `2/1/0`
- unknown template, known Product/Market-template mismatch, invalid module and invalid canonical path: fail-closed PASS
- known mismatch resolve rejection plus collection/navigation/route-manifest exclusion: PASS
- transitive Draft 2020-12 authority: 19/19 Schema files loaded and individually hashed
- draft/private/pending/trash/nonexistent: `gdhe_not_found` PASS
- invalid locale/path/schema/type/filter/sort/page: stable 400 envelope PASS
- ETag, cache policy, request ID and resolve 304: PASS
- safe HTML removal of script/event attributes: PASS
- public file DTO UUID/URL/filename/MIME/byte count and no WordPress ID: PASS
- bidirectional Product/Market/Reference/Support/Download relations: PASS

## Determinism

Two complete `create → contract → schema → hash → cleanup` lifecycles:

| Round | Post IDs | Attachment ID | Golden match | Residue |
|---|---|---:|---|---|
| 1 | 1193–1210 | 1212 | baseline | zero |
| 2 | 1213–1230 | 1232 | 15/15 identical | zero |

`A3_DETERMINISTIC_GOLDEN.json` reports `publicContractUsesDatabaseIds: false`.

## Benchmark

- warmed: yes
- fixtures: 8
- measured requests per fixture: 200
- concurrency: 20
- origin requests: 1,600
- aggregate p50: `991.973 ms`
- Planner independent aggregate p95 trigger: `2001.839 ms`
- error rate: `0`
- payload range: 1,559–2,168 bytes

## Final cleanup and integrity

- cleanup command: 18 posts, 1 attachment, 5 terms removed
- task posts: 0
- marker postmeta: 0
- fixture terms: 0
- fixture options: 0
- uploads: 0
- WordPress Core checksum: PASS
- Secure Custom Fields checksum: PASS
- database: 12/12 tables PASS
- `gdhe-site`: active `0.4.2`
- SCF: active `6.9.2`
- DPG project, lane and message validation: PASS

The backup is immutable and Git ignored. No destructive restore was performed on the healthy database.
