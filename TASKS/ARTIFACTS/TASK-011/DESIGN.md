# TASK-011 Design — Minimal CMS Adapter and Visible Integration Page

## 1. Decision

TASK-011 implements one deliberately technical English vertical slice:

```text
server-only configuration
  -> TASK-009 resolveCmsPath("/")
  -> TASK-010 success/error runtime validation
  -> TASK-011 minimal Adapter
  -> frontend-owned immutable DTO
  -> /integration/cms Server Component
```

The route is disabled by default and becomes visible only when
`GDHE_ENABLE_CMS_INTEGRATION_PAGE=1`. The public path is read from the
server-only `GDHE_CMS_INTEGRATION_PATH`; the browser cannot supply or override
the path.

This is an integration proof, not the production homepage or a generic CMS
page renderer.

## 2. Authority and protected boundaries

| Concern | Authority | TASK-011 behavior |
|---|---|---|
| CMS response shape | TASK-008 contract snapshot | consume unchanged |
| HTTP/config/error semantics | TASK-009 Transport | consume unchanged |
| runtime trust boundary | TASK-010 Validator | consume unchanged |
| minimal presentation DTO | TASK-011 frontend Adapter | new |
| route availability | TASK-011 server-only config | new, default off |
| live content | current local WordPress public API | read only during E2E |
| fixture lifecycle | existing TASK-007 A3 WP-CLI commands | create/show/cleanup without source edits |

Protected files remain byte-identical unless a later controlled recovery is
explicitly authorized:

- `frontend/src/lib/cms/contracts/**`;
- TASK-009 `config.ts`, `resolve-url.ts`, `transport.ts` and transport errors;
- TASK-010 `validation/**`;
- `frontend/src/app/page.tsx`, root layout and global styles;
- `frontend/package.json` and `frontend/package-lock.json`;
- `cms/wp-content/plugins/gdhe-site/**`;
- `.env.local`.

## 3. Frontend-owned DTO

Create one readonly DTO with exactly the fields the technical page renders:

```ts
type CmsIntegrationPageDto = Readonly<{
  id: string;
  apiVersion: "1";
  schemaVersion: "3.0.0";
  type: string;
  templateKey: string;
  locale: "en";
  publicPath: string;
  title: string;
  excerpt: string | null;
  moduleCount: number;
}>;
```

The Adapter accepts only `ValidatedCmsPayload<"success">`. Its internal
contract view exists only to read fields already proven by TASK-010. The
returned DTO is newly allocated and frozen. It excludes:

- raw module bodies and `safeHtml`;
- relations and details;
- WordPress database IDs, Core REST and SCF/meta fields;
- Transport metadata and CMS origin;
- media, file and video URLs.

The Adapter never validates network input and never fetches.

## 4. Server-only integration configuration

Add a TASK-011 config seam under `src/lib/cms/server/`:

- missing, empty, `0`, `false` and unknown enable values mean disabled;
- only exact string `1` enables the route;
- the integration path is ignored while disabled;
- while enabled, a missing or non-canonical path fails closed with a stable
  configuration error;
- canonical path validation reuses TASK-009 logic inside the server-only
  boundary;
- no `NEXT_PUBLIC_*` variable is introduced.

The checked-in `.env.example` documents:

```dotenv
GDHE_ENABLE_CMS_INTEGRATION_PAGE=0
GDHE_CMS_INTEGRATION_PATH=/
```

`.env.local` remains user-owned and unmodified.

## 5. Orchestration seam

Expose one route-facing server-only function with no caller-controlled path or
Transport options:

```ts
loadCmsIntegrationPage(): Promise<
  | { readonly kind: "disabled" }
  | { readonly kind: "not_found" }
  | { readonly kind: "ready"; readonly page: CmsIntegrationPageDto }
>
```

### Success

1. Read the TASK-011 server-only configuration.
2. If disabled, return `disabled` without reading `WORDPRESS_API_URL` and
   without issuing a request.
3. Call `resolveCmsPath(configuredPath)` exactly once.
4. Pass the unknown body to `validateCmsSuccessPayload()` exactly once.
5. Pass the validated wrapper to the Adapter exactly once.
6. Return a frozen `ready` result.

### HTTP error

1. Catch only `CmsHttpError` for contract error-body handling.
2. Pass `CmsHttpError.body` to `validateCmsErrorPayload()` before reading its
   fields.
3. Return `not_found` only when all of these agree:
   - Transport kind is `not_found`;
   - HTTP status is `404`;
   - validated error body status is `404`;
   - validated error body code is `gdhe_not_found`.
4. Any mismatch is a stable non-404 integration failure.
5. Valid non-404 HTTP errors become stable non-leaking integration errors.

### Other errors

Configuration, Transport, Protocol and Contract errors retain their existing
stable categories or are wrapped without raw payload/origin details. No error
path renders partial CMS data or returns homepage content.

No production dependency-injection seam is added. Tests use environment
isolation, a loopback HTTP server and module reset/mocking only inside test
code.

## 6. Route

Create only:

- `src/app/integration/cms/page.tsx`;
- `src/app/integration/cms/page.module.css`;
- optional route-local `not-found.tsx` only if direct response assertions
  cannot use the existing root not-found response.

The Server Component:

- calls only the public orchestration seam;
- maps `disabled` and validated `not_found` to Next.js `notFound()`;
- renders only the DTO;
- accepts no `searchParams`, form input, cookies or request headers;
- exports `noindex, nofollow` metadata for this technical route;
- contains no Client Component and no browser-side fetch;
- uses route-local CSS with a readable 1440px and 390px layout.

The visible output includes:

- `CMS integration is connected`;
- title;
- content type;
- template key;
- public path;
- API version;
- Schema version;
- module count.

It does not render arbitrary HTML or media.

## 7. Test design

### 7.1 Adapter tests

- canonical home wrapper maps to the exact frozen DTO;
- canonical product wrapper maps without raw modules/relations/details;
- DTO mutation fails or leaves the DTO unchanged;
- TypeScript negative fixture proves `unknown` and a structural ordinary
  object are not valid Adapter inputs;
- Adapter source does not import Transport, contracts JSON, Ajv or React.

### 7.2 Orchestration tests

Using loopback HTTP responses and environment isolation:

- disabled values produce no fetch;
- enabled/missing path fails before fetch;
- success performs one request and renders the expected DTO;
- malformed/unsupported success payload is a contract failure;
- validated `gdhe_not_found` is the only not-found result;
- unvalidated/mismatched 404 remains a non-404 integration failure;
- 400/401/403/409/429/500/502/503 remain non-404;
- timeout/network/protocol errors remain non-404;
- origin, raw JSON and credentials are absent from enumerable properties,
  messages and JSON serialization.

### 7.3 Server-only and route tests

- Client Component imports of public and deep integration modules fail a real
  Next.js build;
- disabled `/integration/cms` returns 404;
- enabled route uses the fixed environment path and contains expected HTML;
- query/path injection does not change the upstream request;
- browser-visible HTML/RSC/build output contains no CMS origin or secret;
- root `/` page stays byte-identical and behaviorally unchanged.

## 8. Live E2E lifecycle

The live window begins only after Planner accepts the frontend loopback
checkpoint.

1. `wordpress_cms` verifies WordPress, plugin, schema and zero pre-existing A3
   residue.
2. It runs the existing `wp gdhe a3-fixtures create` command and records the
   returned manifest.
3. It verifies anonymous `/gdhe/v1/resolve` for `/` returns the expected
   published English Schema 3 fixture.
4. `frontend` starts a real production Next.js server with:
   - the local loopback WordPress REST base;
   - `GDHE_ENABLE_CMS_INTEGRATION_PAGE=1`;
   - `GDHE_CMS_INTEGRATION_PATH=/`.
5. It requests `/integration/cms`, verifies browser-visible HTML and confirms
   the browser does not directly request WordPress.
6. It captures 1440px and 390px screenshots.
7. It stops Next.js and reports completion.
8. `wordpress_cms` immediately runs the existing cleanup command and proves
   zero posts, attachments, terms, options, marker meta, revisions and uploads.

Fixture creation is runtime validation activity, not a source-code change.
Cleanup evidence is required even when an earlier live step fails.

## 9. Failure and recovery

- If frontend loopback tests fail, no CMS Fixture is created.
- If Fixture creation fails, run cleanup and stop before live E2E.
- If live E2E fails, preserve logs/screenshots, stop servers, run cleanup and
  reopen only the failing phase.
- If cleanup cannot prove zero residue, the task is `NEEDS_REVISION` and cannot
  enter review.
- If the Adapter requires TASK-010 Validator changes or a new dependency, stop
  and return to Planner for requirement revision.

## 10. Deferred work

- formal homepage and page templates;
- generic CMS catch-all routing;
- collection/navigation/settings DTOs;
- cache, ISR, retry and deduplication;
- Preview, Webhook and authenticated draft flows;
- images, `safeHtml`, media-domain policy;
- SEO, multilingual routing and language switcher;
- Header, Mega Menu, Footer and formal visual system;
- deployment.
