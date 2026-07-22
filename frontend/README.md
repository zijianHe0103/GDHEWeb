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
- `WORDPRESS_API_URL`: server-side WordPress REST API base URL reserved for later data-access work.

This task does not consume either variable at runtime.

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
