# TASK-011 Phase A2 Fixture Window Report

- Message: `MSG-TASK-011-WORDPRESS-A3-FIXTURE-A2`
- Lane: `wordpress_cms`
- Executed at: `2026-07-25T19:41:24Z`
- Branch: `codex/TASK-011-minimal-cms-integration-page`
- Result: `PASS — fixture window open`

## Authorization and scope

The request was acknowledged only after its message record showed formal
Planner dispatch at `2026-07-25T19:39:25Z` to the registered
`wordpress_cms` session. This phase used the existing A3 WP-CLI lifecycle
only. No CMS source, Schema, plugin, database structure, permanent content,
user or configuration was changed.

## Pre-create gate

| Check | Result |
|---|---|
| WordPress Core | `7.0.2` |
| PHP | `8.3.32` |
| GDHE Site | active, `0.4.2` |
| Secure Custom Fields | active, `6.9.2` |
| Database check | PASS |
| Existing A3 manifest | `[]` |
| `task-007-a3-*` post slugs | `0` |
| A3 fixture marker/meta values | `0` |
| A3 fixture terms | `0` |
| `gdhe_a3_fixture_manifest` option | `0` |
| `task-007-a3-*` uploads | `0` |

## Fixture create/show

Command:

```bash
wp gdhe a3-fixtures create --path=cms --allow-root
wp gdhe a3-fixtures show --path=cms --allow-root
```

The `create` and immediate `show` manifests matched exactly. The current
`show` output has SHA-256
`d07b743d5a05e8d9c6a1cc8220d729f47415af5fb9b883b157685b9b31c9b71d`.

```json
{
  "fixtureVersion": "TASK-007-A3-REVIEW-R1",
  "posts": {
    "home": 1263,
    "company": 1264,
    "news": 1265,
    "product_alpha": 1266,
    "product_beta": 1267,
    "product_gamma": 1268,
    "market": 1269,
    "reference": 1270,
    "support": 1271,
    "download": 1272,
    "draft": 1273,
    "private": 1274,
    "pending": 1275,
    "trash": 1276,
    "invalid_template": 1277,
    "mismatched_template": 1278,
    "invalid_module": 1279,
    "invalid_path": 1280
  },
  "attachments": {
    "download": 1282
  },
  "terms": {
    "category": 215,
    "series": 216,
    "installation": 217,
    "support": 218,
    "document": 219
  }
}
```

The open fixture window currently contains 18 fixture post records, one
fixture attachment, five fixture terms, 19 marker-meta rows, one manifest
option and one fixture upload. These are temporary cleanup handles, not public
DTO identifiers.

## Anonymous Schema 3 resolve

- Runtime base: `http://127.0.0.1:8080`
- Public path: `/`
- Request:
  `GET /wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0`
- Authentication: none; no cookie, nonce or Authorization header
- Status: `200`
- Content type: `application/json; charset=UTF-8`

Selected response assertions:

```json
{
  "apiVersion": "1",
  "schemaVersion": "3.0.0",
  "id": "31000000-0000-4000-8000-000000000001",
  "type": "page",
  "templateKey": "standard",
  "locale": "en",
  "publicPath": "/",
  "title": "TASK-007 A3 Home",
  "moduleCount": 1
}
```

A temporary WP-CLI PHP runtime is listening on loopback port `8080` for the
controlled frontend Phase A3 handoff.

## Cleanup responsibility

The fixture and loopback runtime are intentionally left open for Phase A3.
`wordpress_cms` owns mandatory Phase A4 cleanup after the frontend returns its
controlled A3 response, including failure paths. Cleanup must use the existing
command:

```bash
wp gdhe a3-fixtures cleanup --path=cms --allow-root
```

Phase A4 must also stop the temporary WordPress runtime and prove zero fixture
posts/revisions, attachment/upload, terms, marker meta and manifest option.
This A2 report is not cleanup evidence and does not authorize review,
acceptance, Git delivery or deployment.
