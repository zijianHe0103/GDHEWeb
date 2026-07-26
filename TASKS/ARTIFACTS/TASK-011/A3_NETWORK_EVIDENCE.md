# TASK-011 Phase A3 Network Evidence

- Message: `MSG-TASK-011-FRONTEND-LIVE-WORDPRESS-E2E-A3`
- Captured at: `2026-07-26T03:44:14+08:00` through `2026-07-26T03:49:04+08:00`
- Result: `PASS`
- Next.js origin: local loopback port `3211`
- WordPress runtime: the A2 loopback runtime on port `8080`

## Runtime configuration

The production server used Node.js `24.18.0`, npm `11.16.0` and these
server-only values:

```text
WORDPRESS_API_URL=http://127.0.0.1:8080/wp-json
GDHE_ENABLE_CMS_INTEGRATION_PAGE=1
GDHE_CMS_INTEGRATION_PATH=/
NEXT_TELEMETRY_DISABLED=1
```

No environment file was created or changed.

## WordPress preflight

Before starting Next.js, one anonymous read-only Schema 3 request confirmed
that the A2 Fixture window was still healthy:

| Assertion | Observed |
|---|---|
| HTTP status | `200` |
| payload SHA-256 / ETag | `b6f25b1402e93ae2ef415232469f847aa527abb265a343357c2b728921974edd` |
| API / Schema | `1` / `3.0.0` |
| type / template | `page` / `standard` |
| locale / public path | `en` / `/` |
| title / module count | `TASK-007 A3 Home` / `1` |

Only this selected summary was retained; the raw response was discarded.

## Production route requests

The browser loaded exactly once with deliberately conflicting query input:

```text
/integration/cms?path=%2Fproducts%2Fattacker%2F&schema=999&locale=fr&cmsOrigin=https%3A%2F%2Fevil.invalid
```

A temporary passive Undici diagnostics subscriber observed production
server-side requests without changing `fetch`, the request, the response or
product source. It emitted no headers, body or CMS origin. The browser
navigation produced exactly one upstream request:

```json
{"sequence":1,"method":"GET","path":"/wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0"}
```

An independent status-only request then verified the route response:

```text
status=200 redirects=0 content_type=text/html; charset=utf-8
```

That second Next.js document request independently produced exactly one
upstream request with the same frozen path:

```json
{"sequence":2,"method":"GET","path":"/wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0"}
```

Therefore each controlled route request performed one, and only one,
server-side WordPress resolve. Browser query values did not change the
English locale, root public path, Schema version or endpoint.

## Browser network boundary

The page asset inventory contained eight resources: five scripts, two
stylesheets and one favicon. All eight used the Next.js origin on port `3211`;
zero used WordPress port `8080` or another external origin.

The browser console contained zero warnings or errors. The rendered
HTML/RSC document was `9,036` characters and contained none of these
sentinels:

```text
http://127.0.0.1:8080
WORDPRESS_API_URL
Authorization
X-WP-Nonce
safeHtml
"modules"
"apiVersion"
gdhe/v1/resolve
```

The visible document exposed only the approved technical DTO summary. It had
`lang=en`, title `CMS integration proof` and
`robots=noindex, nofollow`.

## Server logs and cleanup

Next.js output contained only normal startup lines and the two sanitized
diagnostic records above. It contained no CMS origin, credentials, headers,
raw response body or error detail.

After capture:

- the Next.js process exited;
- port `3211` had no listener;
- the temporary diagnostics subscriber was deleted;
- `.next`, `tsconfig.tsbuildinfo` and temporary A3 response files were moved
  to macOS Trash or deleted through their controlled lifecycle;
- no frontend runtime/build residue remained;
- the WordPress runtime remained listening on port `8080` and `/wp-json/`
  still returned `200`.

The WordPress Fixture and runtime were intentionally not cleaned up or
stopped. Phase A4 remains owned by `wordpress_cms`.
