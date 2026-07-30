# TASK-017 TDD RED Evidence

status: `COMPLETE`
runtime: `Node 24.18.0 / npm 11.16.0`

## Slice 1 — closed local configuration

Test first:

```text
npm test -- tests/product-list-config.test.ts
```

RED: exit `1`; Vitest could not resolve
`../src/lib/product-list/config`. No production configuration module existed.

Minimum GREEN: one server-only `readProductListMode()` accepting only exact
non-production `preview` or `cms`; unset, unknown and every production value
return `disabled`. The focused config plus existing environment gate passed
`8/8` before later source-boundary coverage was added.

## Slice 2 — DTO-only presentation

Test first:

```text
npm test -- tests/product-list-presentation.test.ts
```

RED: exit `1`; Vitest could not resolve
`../src/components/product-card`. No ProductCard presentation existed.

Minimum GREEN: the scoped component family renders 0/1/N DTO collections,
four frozen action/lifecycle cells, link identity, protected media dimensions
and Alt, optional content, discontinued state and closed empty/unavailable
states. One first GREEN attempt contained a test-only text-count assertion
that also counted fixture names; the assertion was narrowed to the rendered
lifecycle element, after which the presentation/config gate passed `11/11`.

## Slice 3 — route and orchestration

Test first:

```text
npm test -- tests/product-list-route.test.ts
```

RED: exit `1`; Vitest could not resolve `../src/app/products/page`. No route
or page-state orchestration existed.

Minimum GREEN added the dynamic noindex route, closed page-state loader,
preview DTO and fixed CMS query. The sandbox run reached `16` passing tests
and stopped only when two loopback cases received `listen EPERM`.

The first unrestricted run exposed a test-fixture contract omission: both CMS
cases rendered the safe unavailable state because their success responses
lacked the TASK-016-required ETag. The test responses were minimally corrected
with ETag headers; no TASK-016 production code changed. Planner then reproduced
the shared-current-byte focused listener suite as PASS.

## IA canonical-path correction

TASK-013 freezes the track-subcategory shape as
`/products/curtain-track-systems/{subcategory-slug}/`, lists
`Manual Curtain Tracks`, and requires lowercase kebab-case slugs. A focused
assertion first produced:

```text
expected /products/curtain-track-systems/manual-curtain-tracks/
received /products/curtain-tracks/manual/
```

The preview DTO and matching presentation fixture were minimally corrected to
`/products/curtain-track-systems/manual-curtain-tracks/`; the targeted test
then passed `1/1`.

## Slice 4 — production fail-closed smoke

Before the smoke harness existed, the required command failed with
`MODULE_NOT_FOUND` for `tests/product-list-production-smoke.mjs`. The
Node-built-in harness was then added.

The first unrestricted built-runtime execution was a strict RED: `/products/`
returned `308` while the smoke required `404`, and later assertions were not
run. Inspection of `.next/routes-manifest.json` proved this was Next.js's
internal trailing-slash redirect from `/:path+/` to `/:path+`, before route
evaluation, not visible ProductCard content. The test alone was minimally
changed to follow that same-origin redirect and still require the final
response to be `404`.

Planner's unrestricted current-byte rerun then passed with:

```text
Product list production smoke passed: preview/cms both 404; root 200;
integration 404; CMS requests 0.
```

No production correction beyond the Slice 1 hard-disable was necessary.

## Environmental distinction

`listen EPERM` inside the lane sandbox is recorded as an executor limitation,
not a product RED or GREEN. Listener-dependent results above come from
Planner's unrestricted commands against the same shared bytes without edits.

## Visual Round 1 narrow CSS revision

Source: `MSG-TASK-017-FRONTEND-VISUAL-R1-REVISION`.

One focused source/style test was added before CSS mutation. It required both:

- `.cardBody { height: auto; }` inside the existing
  `@media (max-width: 64rem)` rules;
- an explicit negative media-link focus outline offset that keeps the
  indicator inside the clipping card.

Command:

```text
npm test -- tests/product-list-route.test.ts -t "two-column card body"
```

RED: exit `1`; the 64rem rules contained only the two-column grid and did not
contain a content-sized card body. The current stylesheet also had no
media-link-specific inside outline rule.

Minimum GREEN:

- moved the existing mobile `height: auto` override from 42rem to the already
  frozen 64rem breakpoint;
- added only `.mediaLink:focus-visible { outline-offset: -0.2rem; }`, matching
  the existing `0.2rem` outline width.

The same targeted command then passed `1/1`. A subsequent `tsc --noEmit`
found that the test's two redundant RegExp `s` flags were unavailable under
the ES2017 target. Removing only those flags preserved the `[^}]*` cross-line
assertions; the targeted test and typecheck both returned PASS.

## Adversarial Round 1 remote-media P1 revision

Source: `MSG-TASK-017-FRONTEND-ADVERSARIAL-P1-R1`.

The first behavior test used the real ProductList page orchestration and real
TASK-016 Transport, Validator and Adapter with a controlled `fetch` response.
The one-item body remained Schema-valid while its image URL was changed to:

```text
https://cms.example.com/wp-content/uploads/protected.webp
```

Command:

```text
npm test -- tests/product-list-route.test.ts \
  -t "fails closed before React when CMS media is not same-origin"
```

RED: exit `1`; one test failed and nine were skipped. The request count and
fixed collection URL assertions passed first. The failure at
`product-list-route.test.ts:140` then showed that the rendered HTML contained
the exact hostile URL in both:

```html
<link rel="preload" as="image"
  href="https://cms.example.com/wp-content/uploads/protected.webp"/>
<img src="https://cms.example.com/wp-content/uploads/protected.webp" .../>
```

This was the required browser-request-surface RED. It did not depend on a
listener and was not a source-text `fetch()` assertion.

A second focused policy test was written before the policy module existed:

```text
npm test -- tests/product-list-media-policy.test.ts
```

RED: exit `1`; Vitest could not resolve
`../src/lib/product-list/media-policy`. No server-owned media-policy seam
existed.

Minimum GREEN added only a server-only ProductList media policy and invoked it
after the authentic collection DTO returned but before React state was
created. The policy accepts only an original value beginning with exactly one
`/` that resolves against a fixed synthetic frontend origin without changing
origin or carrying credentials. It rejects absolute, protocol-relative,
backslash-confused and malformed values without reading configuration.

GREEN:

- policy matrix: `7/7` PASS;
- rendered hostile-media regression: `1/1` PASS;
- no-listener ProductList path: `8` PASS with the two listener cases skipped;
- presentation/config/policy: `19/19` PASS.

The first sandbox listener attempt reached `27` passing cases and only the two
existing listener cases stopped at `listen EPERM 127.0.0.1`; that environment
result was not treated as product evidence. Planner then ran the same current
bytes unrestricted: ProductList `4 files / 29 tests` PASS.

The real listener fixture retains the frozen Schema-valid absolute media
sample. It now proves one collection request, zero `/resolve`, and the
sanitized unavailable state. It does not make the fixture Schema-invalid to
manufacture a CMS ready state. Valid empty CMS remains the distinct empty
state; 1/N visual rendering remains covered by DTO presentation and preview.
