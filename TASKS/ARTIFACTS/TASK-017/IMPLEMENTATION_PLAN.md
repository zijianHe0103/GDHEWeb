# TASK-017 Implementation Plan

status: `READY_FOR_FRONTEND_TDD`

## Baseline

- Git baseline: `5b448c5c169db7aba1b6c69b3b4baa216493f4d3`.
- Node/npm: `24.18.0` / `11.16.0`.
- ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- Existing CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- Full Vitest: `15 files / 244 tests` PASS.
- ESLint, TypeScript and Next production build PASS.
- Baseline build routes: `/`, `/_not-found`, `/integration/cms`.
- `frontend/**`, root `README.md` and `cms/**` have no pre-existing task diff.

## TDD slices

### Slice 1 — closed local configuration

1. Add focused tests for unset/unknown, `preview`, `cms`, and production hard-disable.
2. Capture missing-module RED.
3. Add one server-only config module and minimum closed parser.
4. Re-run focused tests and existing environment/server-only regressions.

### Slice 2 — DTO-only ProductCard presentation

1. Add server-render tests for 0/1/N, all four frozen action cells, optional summary/attributes, lifecycle badge, image Alt and link identity.
2. Capture missing-component RED.
3. Add the minimum scoped ProductCard component family and CSS module.
4. Prove no CMS/contract/runtime imports exist in presentation components.

### Slice 3 — `/products/` orchestration

1. Add route/orchestration tests for disabled 404, preview zero network, CMS one collection/zero resolve, empty and sanitized unavailable states, fixed metadata and force-dynamic behavior.
2. Capture missing-route RED.
3. Add the App Router page plus a server-only loader returning a closed page-state union.
4. Add the single FGD X15 preview DTO and copy the protected image with the frozen SHA-256.
5. Re-run ProductCard runtime regressions and verify no raw or internal data reaches rendered HTML.

### Slice 4 — production fail-closed smoke

1. Add a built-server smoke test that sets both `preview` and `cms` in production and expects `/products/` to remain 404 with zero CMS requests.
2. Capture failing exposure RED if the route is reachable.
3. Apply only the minimum config/build correction required for production 404.
4. Preserve the existing root and `/integration/cms` behavior.

## Documentation and visual checkpoint

1. Update `frontend/README.md` with exact `GDHE_PRODUCT_LIST_MODE=preview|cms` local commands, `WORDPRESS_API_URL` requirement for CMS mode, and production/noindex boundary.
2. Update root `README.md` from “no visible ProductCard page” to the truthful local-only slice state.
3. Start `next dev` in preview mode and capture the exact local URL and process evidence.
4. Hand off to `visual_qa` for 1440/1024/768/390 screenshots, 320 reflow, focus/keyboard and difference classification.

## Final validation

- ProductCard page/component focused tests.
- Existing TASK-016 focused tests and server-only negatives.
- `npm run verify:product-card-contract`.
- `npm run verify:cms-contract`.
- Full `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Production start smoke for disabled route and existing routes.
- Exact protected image hash.
- `frontend/package-lock.json`, TASK-014/015/016 protected hashes and CMS zero diff.
- Secret, absolute-path, internal-field, browser WordPress request and forbidden import scans.
- DPG project/registry/messages/strict lane and `git diff --check`.

## Rollback

Remove only TASK-017-created `/products/` files, ProductCard presentation files, preview loader/config, focused tests, protected test asset, package script if added, documentation sections and TASK-017 QA/artifacts. TASK-014～016 contracts and runtime consumer remain untouched.
