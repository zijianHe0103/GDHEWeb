# TASK-011 Phase A3 Live WordPress E2E Report

- Message: `MSG-TASK-011-FRONTEND-LIVE-WORDPRESS-E2E-A3`
- Lane: `frontend`
- Completed at: `2026-07-26T03:49:04+08:00`
- Branch: `codex/TASK-011-minimal-cms-integration-page`
- Baseline: `a89bb4de91e63dce2f9960e31b1cd39cae58f335`
- Result: `PASS`

## Scope

This phase exercised the already accepted A1 product against the live A2
WordPress Fixture. It did not modify frontend product code, dependencies,
configuration files, CMS source, WordPress data or Planner-owned state.

## Production build and runtime

| Gate | Result |
|---|---|
| Node.js / npm | `24.18.0` / `11.16.0` |
| fresh `npm run build` | PASS |
| Next.js | `16.2.11` |
| route classification | `/integration/cms` dynamic SSR |
| production server | real `next start`, loopback port `3211` |
| live route status | `200`, zero redirects, `text/html; charset=utf-8` |

The server used the requested A3 values without writing `.env.local` or any
other environment file.

## Visible live result

The real browser rendered:

- `CMS integration is connected`;
- `TASK-007 A3 Home`;
- content type `page`;
- template key `standard`;
- public path `/`;
- API version `1`;
- Schema version `3.0.0`;
- module count `1`.

The document metadata remained `noindex, nofollow`.

## Fixed server-side resolve

The browser loaded the page once with conflicting `path`, `schema`, `locale`
and `cmsOrigin` query values. That render made exactly one server-side
WordPress GET, and the observed request remained:

```text
/wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0
```

The independent status-only request also made exactly one GET with that same
fixed path. No request used the attacker-controlled values. Full request and
leakage evidence is in
`TASKS/ARTIFACTS/TASK-011/A3_NETWORK_EVIDENCE.md`.

## Browser isolation and leakage

| Assertion | Result |
|---|---|
| browser directly requested WordPress | PASS; zero requests |
| browser assets stayed on Next.js origin | PASS; 8/8 |
| HTML/RSC contains CMS origin | PASS; absent |
| HTML/RSC contains credentials or auth headers | PASS; absent |
| HTML/RSC contains raw CMS modules, `safeHtml` or response JSON | PASS; absent |
| browser console warning/error | PASS; zero |
| Next.js log contains CMS origin, credential or raw JSON | PASS; absent |

## Screenshots

| Artifact | Dimensions | SHA-256 |
|---|---:|---|
| `A3_DESKTOP_1440.png` | `1440 × 1064` | `53b15cefeab7d2e3688828b3a75317d2ee735e30405de429fa5e887c48dd11e4` |
| `A3_MOBILE_390.png` | `390 × 876` | `4a6a8a96d45cf38577d8d4f180accdc4120d4a7da73a5bae1e75e9e72010b2a2` |

Both files are valid RGB PNGs. The mobile page had a `390px` viewport,
`390px` document width and no horizontal overflow. Visual inspection
confirmed that all approved fields are visible and legible in both captures.

## Protected scope

The A1 protected hashes still match:

- `frontend/package.json`:
  `c97170388756910fc13ba8642a5044ffd2d30a307cb603449f465d8b79d2dab9`;
- `frontend/package-lock.json`:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- root page/layout/global CSS:
  `b86ff25...`, `3a930277...`, `3faa680f...`;
- TASK-009 Transport:
  `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3`;
- TASK-010 Validator public entry:
  `e54a5479ceb5f3af98fa7e3b3a0f9f8029e53a6864233eee6d1528d69ce953ba`;
- `.env.local`:
  `61ae67a762df4e4947ea3e8934aabcf6c5307805edef0b10d0f91cac91f6c4ca`.

No A3 product defect was exposed, so no product edit was made.

## Frontend cleanup and handoff

All Next.js processes were stopped and port `3211` was closed. Generated
frontend runtime/build residue and the temporary passive network subscriber
were removed. The WordPress process was deliberately left running and was
rechecked at HTTP `200`.

Phase A3 is complete. The only next step is Planner-controlled dispatch of
Phase A4 to `wordpress_cms` for mandatory Fixture and WordPress runtime
cleanup. This report is not A4 cleanup evidence, review, acceptance, Git
delivery or deployment.
