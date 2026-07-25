# GDHE frontend foundation

Minimal Next.js App Router and TypeScript foundation for GDHE. The root page is a runtime placeholder, not the production homepage or global site shell.

## Toolchain

- Node.js 24.18.0 (`.nvmrc`; supported Node.js 24 LTS line)
- npm 11.16.0 from the official Node.js 24.18.0 distribution
- `package-lock.json` as the only package manager lockfile
- Next.js 16.2.11, React 19.2.8, and TypeScript 5.9.3

The versions were checked on 2026-07-22 against the [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation), [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16), [Next.js 16.2 release notes](https://nextjs.org/blog/next-16-2), [Node.js release status](https://nodejs.org/en/about/previous-releases), and npm registry metadata for the selected packages.

The machine's default NVM runtime, Node.js 20.20.2, now has EOL status even though it satisfies Next.js 16's declared minimum. The project requires Node.js 24.x and was validated with the official Node.js 24.18.0 macOS arm64 distribution. The validation runtime stayed outside the repository and was not installed globally.

## Local setup

```sh
nvm install 24.18.0
nvm use
node --version
npm --version
npm ci
cp .env.example .env.local
npm run dev
```

The two version commands must print `v24.18.0` and `11.16.0`. A normal fresh NVM installation of Node.js 24.18.0 uses the npm bundled by that official Node.js release. If either value differs, stop and repair the local runtime selection before installing dependencies; `packageManager` records the required npm version but a bare npm command does not switch versions automatically.

Open `http://localhost:3000`. The example values are deliberately non-production placeholders. Replace them locally only when a later task introduces CMS data access. Never commit a real CMS URL, credential, token, or preview secret.

## Environment contract

- `NEXT_PUBLIC_SITE_URL`: public canonical site origin. Only this variable is exposed to browser code.
- `WORDPRESS_API_URL`: server-only WordPress REST API base consumed by the CMS Transport. Use a REST base ending exactly in `/wp-json`, such as `http://127.0.0.1:8080/wp-json` locally or `https://cms.example.com/wp-json` in production.

Cleartext HTTP is accepted only for `localhost`, `127.0.0.1`, and IPv6 loopback with an explicit port, such as `:8080`. Non-loopback CMS origins require HTTPS. Credentials, query strings, fragments, non-HTTP protocols, and non-REST base paths fail closed before a request is sent.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:image-optimizer
npm audit --audit-level=high
```

`test:image-optimizer` requires a completed production build. It creates a temporary 64x64 PNG outside the production UI, starts `next start`, calls `/_next/image`, and requires HTTP 200 plus a transformed 32x32 image response. It removes the source fixture and its Next Image cache before exiting.

## Temporary Sharp override

Next.js 16.2.11 declares optional Sharp range `^0.34.5`, while this project temporarily overrides Sharp to 0.35.3 because registry advisories affect versions below 0.35.0. Sharp 0.35 introduced breaking changes, so ordinary build and root-page checks are insufficient. Sources checked on 2026-07-22: [Next.js registry metadata](https://registry.npmjs.org/next/16.2.11) and the [Sharp 0.35.0 changelog](https://sharp.pixelplumbing.com/changelog/v0.35.0/).

Current runtime matrix:

| Platform | Architecture | Runtime | Next / Sharp | Image optimizer result |
|---|---|---|---|---|
| macOS | arm64 | Node.js 24.18.0, npm 11.16.0 | 16.2.11 / 0.35.3 | PASS: HTTP 200, WebP, 32x32, cache MISS |
| macOS | x64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |
| Linux glibc | x64 or arm64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |
| Linux musl | x64 or arm64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |
| Windows | x64 or arm64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |

No deployment platform is selected in this foundation task. Before selecting one, run the full validation suite and `test:image-optimizer` on that exact platform and architecture.

Recheck the upstream range on every Next.js upgrade and before deployment:

```sh
GDHE_NEXT_VERSION=$(node -p "require('./package.json').dependencies.next")
npm view "next@$GDHE_NEXT_VERSION" optionalDependencies.sharp
npm ls next sharp
npm audit --audit-level=high
```

Remove the Sharp override only when the selected Next.js release declares a range containing an advisory-free Sharp version. Delete the override, regenerate the lockfile with the pinned Node/npm pair, then require fresh `npm ci`, lint, typecheck, tests, build, audit, root HTTP smoke, and image optimizer fixture on every intended deployment platform. Until that gate passes, the override remains temporary and untested platforms remain blocked.

## CMS contract snapshot

TASK-008 freezes the smallest frontend-owned copy of the TASK-007 `/resolve` contract under `src/lib/cms/contracts/`. The CMS Schema files, TASK-007 Golden files, and TASK-007 error fixtures remain authoritative; `manifest.json` records their repository-relative paths and SHA-256 values.

Run the offline parity check with the pinned Node.js runtime:

```sh
npm run verify:cms-contract
```

The verifier uses only Node.js built-ins. It fails closed for missing, extra or tampered snapshot files, unsafe paths, unknown or remote Schema references, incomplete local `$ref` closure, source drift, and error-bundle reconstruction drift.

This snapshot does not connect to WordPress, read environment variables, add a runtime Schema validator or DTO adapter, or create a visible page. Future runtime code must consume the local normalized contract without importing `cms/` or `TASKS/`.

## Server-only CMS Transport

`src/lib/cms/server/` provides the server-only network boundary for the fixed English Schema 3 `/gdhe/v1/resolve` endpoint. Its public entry accepts only a canonical public path and an optional caller `AbortSignal`; origin, endpoint, locale and schema cannot be overridden.

Each call performs one anonymous `GET` with `Accept: application/json`, `no-store`, redirect refusal, a 5000 ms timeout and no retry. JSON is parsed once and remains `unknown`. Only status, content type, request ID, ETag, Last-Modified and Retry-After metadata cross the boundary.

Configuration, timeout, caller abort, network, protocol and HTTP status failures use typed errors without exposing the CMS origin or raw response body through messages or serialization. A 404 is classified as `not_found`, but this layer does not call Next.js `notFound()`.

This Transport is not a runtime Schema Validator, DTO Adapter, cache, Preview path, visible CMS page or live WordPress E2E. Run its isolated loopback test and the normal gates with:

```sh
npm test -- tests/cms-transport.test.ts
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
```

## Server-only CMS Runtime Validator

`src/lib/cms/server/validation/` is the runtime contract gate between unknown network JSON and a future DTO Adapter. It statically imports the TASK-008 16-Schema snapshot closure and compiles the Page Schema 3 success root plus the common error root once with Draft 2020-12 strict validation. `ajv@8.20.0` and `ajv-formats@3.0.1` are exact production dependencies; date, date-time and URI formats are enabled.

Server code must explicitly choose `validateCmsSuccessPayload(input)` or `validateCmsErrorPayload(input)`. A successful call creates a caller-isolated, deeply immutable payload snapshot and returns it in an opaque, frozen `ValidatedCmsPayload` wrapper. The wrapper has no mutable shared prototype: its fixed kind remains enumerable, its private body getter cannot be replaced, and its fixed kind-only JSON serialization cannot be overridden through prototype pollution. The body is omitted from enumeration, object spread and JSON serialization. Unsupported versions, invalid bodies and inputs that cannot form a safe snapshot throw `CmsContractError` with stable `category` and `kind` fields; raw payloads, clone exceptions and Ajv diagnostics are not exposed.

The Validator consumes only the local contract snapshot. It does not read WordPress, the filesystem, environment variables or remote Schema references, and it does not call the Transport. It is not a DTO Adapter, React prop, route, visible page, cache, Preview path or live WordPress E2E.

Run its focused and normal gates with:

```sh
npm test -- tests/cms-runtime-validator.test.ts
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
```
