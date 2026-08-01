# TASK-020 Requirements

status: `REQUIREMENT_CHECKPOINT`
date: `2026-08-01`

## Authority

- Canonical task scope: `TASKS/ACTIVE/TASK-020-fgd-x15-visible-configurator-quote-line-slice.md`.
- Product Configuration authority: TASK-019 `ProductConfigurationDocument 1.0.0` and its exact frontend snapshot.
- Quote line authority: TASK-019 `QuoteLine 1.0.0` Schema and equality/merge semantics.
- Product and RFQ business rules: accepted ADR-006.

This artifact freezes implementation detail only. It does not replace or widen
the active task.

## Required outcome

The existing local-only FGD X15+PVC detail page must gain one visible product
configuration section. A customer can choose one real standard specification or
enter an unresolved custom length, select installation and track packaging,
enter quantity, and press `Add to Quote`.

The click creates exactly one current-page QuoteLine result. It does not create
a persistent basket, submit a request, or contact Feishu.

## Product facts

- model: `FGD X15+PVC`;
- name: `FGD X15+PVC Track`;
- canonical product path: `/products/fgd-x15-pvc/`;
- current standard option: `GDHEPRD000172 / 6 m / Ivory White / piece`;
- supported installation: `ceiling`, `wall`;
- current optional installation accessories: none;
- custom length: positive, at most one decimal place, no Article Number;
- quantity: positive safe integer, unit `piece`.

No other standard length, color, Article Number or accessory may appear unless
it is present in a validated Product Configuration response.

## Visible control contract

The detail page adds a section with stable target `#configure-product` and the
heading `Configure Your Track`.

1. Selection type
   - `Standard Length` is the initial branch.
   - `Custom Length` is the alternative branch.
2. Standard specification
   - one control renders complete options from `articleNumberOptions`;
   - customer label uses length and color, not Article Number as the headline;
   - the selected object is resolved by exact Article Number from the DTO and
     never reconstructed from separate attributes.
3. Custom specification
   - custom length is entered as decimal text and normalized only after strict
     validation;
   - available color values are derived from distinct validated option colors;
   - with the current data, `Ivory White` is the only value and may be displayed
     as read-only text;
   - output uses `articleNumber: null` and `resolution: sales_follow_up`.
4. Installation
   - customer explicitly chooses `Ceiling Mount` or `Wall Mount`;
   - no installation method is initially selected;
   - neither option changes the track Article Number.
5. Base packaging
   - customer explicitly chooses exactly one of `Standard Packaging`, `Carton
     Packaging`, or `Large Shrink Wrap`;
   - no base packaging is initially selected.
6. Additional packaging
   - `Customer Logo Printing` is an independent checkbox, initially false;
   - protection is one optional choice: `None`, `Single-piece Bagging`, or
     `Paired Interlocking`;
   - `None` is initial; bagging and interlocking can never coexist.
7. Quantity
   - initial field is empty;
   - only digit-only positive safe integers are accepted;
   - decimal, exponent, sign, whitespace-only, zero, negative and unsafe values
     are rejected.
8. Action
   - Hero action becomes `Configure & Add to Quote` and points to the section;
   - form submit label is `Add to Quote`.

## Add-to-Quote result

- A valid submit builds one exact `QuoteLine 1.0.0` object.
- The page stores only the latest result in React component memory.
- A later valid submit replaces that result even when identity differs.
- Reloading or navigating away clears it.
- No localStorage, sessionStorage, cookie, IndexedDB or server mutation occurs.
- The UI shows a human-readable summary and an `aria-live` success message, not
  raw JSON or a claim that the request was sent.
- TASK-019 equality and merge behavior remains unchanged for the future Basket;
  TASK-020 does not simulate multi-line merging.

## Runtime modes and page states

The existing `GDHE_PRODUCT_DETAIL_MODE` remains the single mode gate.

| mode/state | product detail | configuration | visible result |
|---|---|---|---|
| production, unset or unknown | disabled | no request | route remains final 404 |
| `preview` | existing local DTO | exact local configuration DTO | configurator ready |
| `cms` ready | one `/resolve` | one `/product-configurations` | configurator ready |
| detail not found | normalized 404 | no configuration request required | route 404 |
| detail unavailable | sanitized failure | no configuration request required | existing unavailable state |
| configuration not found/unavailable | detail remains visible | sanitized failure | no configurator; navigation-only RFQ fallback |

The CMS implementation may be sequential so an unavailable detail does not
cause an unnecessary configuration request. A ready CMS page has exactly one
request to each required endpoint, zero ProductCard calls and zero browser
requests to WordPress.

## Trust and publication boundary

- Transport, Schema validation, semantic validation and Adapter are server-only.
- Client Components receive only a deeply copied public configuration DTO.
- The four TASK-019 local Schemas are the only runtime Product Configuration
  Schema closure; no runtime read from `cms/**`, `TASKS/**` or remote `$ref`.
- Raw CMS payload, validated wrapper, origin, headers, request ID and diagnostics
  cannot cross into React.
- Internal WordPress, SCF, Feishu, supplier, cost, price, inventory, profit and
  note fields fail closed before React.
- Browser-created QuoteLine remains untrusted. Future server submission must
  revalidate it against current product data.
- The route remains local-only, `noindex,nofollow`, and production-disabled.

## Copy boundary

Packaging labels and short explanations are replaceable English test copy. They
must accurately describe the confirmed choices and must not be called final SEO
or approved sales copy. `打字` is expressed as customer logo printing, never as
the literal English word `Typing`.

## Explicit exclusions

- multi-line or global Quote Basket;
- 30-day retention or any browser persistence;
- Basket editing, deletion, merge UI, count badge or drawer;
- contact form, quote API, NestJS, Feishu, email or external submission;
- WordPress/CMS/database changes or real product import;
- accessory selection or invented Article Numbers;
- dependencies, package/lock changes, production media, SEO, multilingual,
  Staging or deployment.

## Acceptance evidence

- directly observed RED then minimum GREEN for every new production seam;
- one-request server contract and hostile/internal-field rejection;
- resolved and custom QuoteLine positive cases plus closed invalid matrix;
- real route markup proves no WordPress/internal leakage;
- preview, CMS, disabled, detail failure and configuration failure states;
- 1440/1024/768/390 screenshots plus 320 CSS-pixel reflow;
- keyboard, focus, labels, field errors and live-result accessibility;
- full existing regression, three verifiers, lint, typecheck, build, production
  smokes, protected hashes and DPG gates;
- independent visual QA and adversarial review PASS before user acceptance.
