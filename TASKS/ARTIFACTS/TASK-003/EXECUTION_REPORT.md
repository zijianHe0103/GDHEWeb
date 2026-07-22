# TASK-003 frontend execution report

status: implementation-complete-review-pass-awaiting-user-acceptance
executor_lane: frontend
date: 2026-07-22

## Outcome

Created a minimal, independently runnable Next.js App Router and TypeScript project in `frontend/`. It uses `src/app`, npm with one lockfile, ESLint, explicit type checking, a real Vitest environment-contract test, a production build, safe environment examples, and a clearly non-production GDHE foundation page.

No homepage, global shell, localization, SEO, CMS access, preview, webhook, forms, deployment, WordPress, database, plugin, or theme work was performed.

## Version decision

- Node.js: 24.18.0, pinned by `.nvmrc`; Node.js 24 is an officially supported LTS line.
- npm: 11.16.0, bundled by the official Node.js 24.18.0 distribution and recorded in `packageManager`.
- Next.js: 16.2.11, exact dependency version.
- React and React DOM: 19.2.8, exact dependency versions.
- TypeScript: 5.9.3, exact development dependency version.
- Package manager: npm only; `package-lock.json` is the only lockfile.

Next.js 16.2.11 was the live npm registry `latest` value during execution and declares Node.js 20.9.0 or newer. Round 1 review found that the earlier 24.14.0 pin preceded published security fixes. The project now pins official Node.js 24.18.0 with its bundled npm 11.16.0, and all revision validation uses that exact pair from the planner-verified read-only runtime path.

## Official primary sources

Accessed 2026-07-22:

- Next.js installation and App Router setup: https://nextjs.org/docs/app/getting-started/installation
- Next.js 16 Node.js requirement: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js 16.2 release notes: https://nextjs.org/blog/next-16-2
- Node.js release and LTS status: https://nodejs.org/en/about/previous-releases
- Node.js EOL meaning and risk: https://nodejs.org/en/about/eol
- npm registry package metadata: https://registry.npmjs.org/next/16.2.11
- npm registry dependency metadata: https://registry.npmjs.org/postcss/8.5.22 and https://registry.npmjs.org/sharp/0.35.3

## Implementation notes

The first official `create-next-app` command could not write its user preferences directory under the sandbox and stopped before creating `frontend/`. The project was therefore assembled using the official manual-installation path and the same requested App Router, TypeScript, `src/`, and ESLint choices. No partial scaffold needed removal.

The first install reported the current Next.js transitive `postcss` 8.4.31 advisory and optional `sharp` 0.34.5 advisory. npm's suggested Next.js 9.3.3 downgrade was rejected. Exact npm overrides select `postcss` 8.5.22 and `sharp` 0.35.3; `npm ls`, fresh test, typecheck, build, HTTP smoke test, and audit prove the resulting graph is usable for this foundation.

A frontend-working-directory subprocess initially resolved `/usr/local/bin/node` 20.11.1 and npm 10.2.4 even though the governed login-shell baseline resolved an NVM installation. That historical discrepancy is not final evidence. Revision commands put `/tmp/gdhe-node-24.18.0.CMUEIu/node-v24.18.0-darwin-arm64/bin` first in PATH and returned Node.js 24.18.0 plus npm 11.16.0.

The official Node.js 24.18.0 distribution was downloaded and checksum-verified by planner outside the repository. The frontend lane used it in place and did not install a global runtime or copy it into the project. README setup instructions reproduce the selected Node/npm pair through a normal fresh NVM installation and require explicit version checks before `npm ci`.

## Round 1 narrow revision

Round 1 verdict was `FAIL` with P0=0, P1=2, P2=2. This revision changed only the four reviewed toolchain/documentation areas:

1. P1 Node baseline: `.nvmrc` moved from 24.14.0 to 24.18.0; `packageManager` moved from npm 10.8.2 to the official bundle's npm 11.16.0; package and lock engines remain coherent at `24.x`; `@types/node` remains the current Node 24 line at 24.13.3.
2. P1 Sharp evidence: added repeatable test-only `npm run test:image-optimizer`. It generates a temporary 64x64 PNG, starts the built Next server, calls `/_next/image`, and requires HTTP 200 plus a transformed 32x32 image. On macOS arm64 it returned WebP through Next.js 16.2.11 with Sharp 0.35.3. Source fixture and `.next/cache/images` output are removed in `finally`.
3. P2 npm reproduction: README now gives `nvm install 24.18.0`, version checks, and `npm ci`, and explains that `packageManager` records but does not switch npm automatically.
4. P2 document impact: planner had already synchronized the task header and body to `RESOLVED` before this dispatch. This lane records that closure without editing TASKS/ACTIVE or PROJECT files.

## Sharp compatibility boundary

Next.js 16.2.11 declares optional Sharp `^0.34.5`; the root override selects Sharp 0.35.3, outside that range, because versions below 0.35.0 are affected by the registry advisory. Sharp 0.35 also declares breaking changes, so the override remains explicitly temporary.

Tested matrix: macOS arm64, Node.js 24.18.0, npm 11.16.0, Next.js 16.2.11, Sharp 0.35.3: PASS through the real optimizer endpoint. macOS x64, Linux glibc, Linux musl, and Windows architectures remain untested and blocked for deployment until the same fixture and full suite pass there. No deployment target is selected by TASK-003.

Removal gate: on every Next.js upgrade and before deployment, recheck `optionalDependencies.sharp`. Remove the override only after the selected Next release declares a range containing an advisory-free Sharp version, regenerate the lockfile with the pinned Node/npm pair, and pass fresh install, lint, typecheck, tests, build, audit, root smoke, and image optimizer fixture on every intended target platform.

## Boundaries and documentation

`frontend/README.md` documents setup, versions, environment variables, validation, and override maintenance. `.env.example` contains only non-secret example origins and is not consumed yet. The page labels itself as foundation-only and not the production homepage.

Document impact for the frontend deliverable is resolved by the README and these execution artifacts. Project-level state transitions remain planner-owned.

## Final review and governance boundary

Round 2 independent review returned `PASS` with P0=0, P1=0, and P2=0 after a separate clean-copy toolchain and real image-optimizer validation. Planner then reran the complete frontend quality gate and final governance, scope, secret, message, and Git boundary checks; all passed.

The implementation is ready only for the controlled user-acceptance gate. It has not been accepted, committed, pushed, merged, deployed, or expanded into production site, CMS, localization, or SEO work.
