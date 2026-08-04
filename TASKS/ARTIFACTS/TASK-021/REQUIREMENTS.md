# TASK-021 Requirements

## Confirmed outcome

The FGD X15+PVC configurator must present customer choices in this order:

1. Track Length;
2. Color;
3. Packaging;
4. Quantity and Add to Quote.

Installation is not a track configuration choice. The product detail may state that ceiling and wall mounting are supported, but the track QuoteLine does not ask the customer to choose either method.

## Standard Track Length

- Each standard option originates from one complete, eligible Article Number record mirrored from Feishu into WordPress.
- The frontend derives a unique numeric list of `lengthMeters` from the validated public options and sorts it ascending.
- `4.3 m`, `6 m` and `7 m` are examples of the desired presentation, not hardcoded business truth.
- Current confirmed FGD X15+PVC truth remains only `GDHEPRD000172 / 6 m / Ivory White / piece`.
- No other standard length may be shown until its real Article Number record is eligible and returned by WordPress.

## Custom Length

- `Custom Length` is a sibling choice in the Track Length group, not a separate first-stage mode selector.
- Its input is visible only while Custom Length is selected.
- It accepts a positive decimal with at most one decimal place and must survive exact safe numeric conversion.
- The browser-side custom draft contains only the customer-readable custom length and color. It does not contain Article Number or an internal resolution enum.
- A future server-side QuoteLine conversion must represent the custom selection as `articleNumber: null` and `resolution: sales_follow_up` after revalidation.

## Color

- Color follows Track Length.
- For a standard length, Color contains only colors belonging to eligible options with the selected length.
- For Custom Length, Color contains the unique public color set of the eligible model options.
- Color order is deterministic by customer-facing label, then stable code.
- A standard `lengthMeters + color.code` pair must identify exactly one eligible public option. Zero or multiple matches fail closed and cannot create a public quote draft.

## Packaging and quantity

TASK-020 behavior remains authoritative:

- base packaging is one of Standard Packaging, Carton Packaging or Large Shrink Wrap;
- Customer Logo Printing is an independent boolean;
- protection is None, Single-piece Bagging or Paired Interlocking;
- Single-piece Bagging and Paired Interlocking remain mutually exclusive by single selection;
- quantity is a positive safe integer in `piece`;
- Add to Quote replaces one latest browser-memory `PublicQuoteDraft` and performs no network submission or persistence.
- The draft is a customer-facing temporary configuration record, not QuoteLine 2.0.0. It excludes Article Number, internal Product UUID and internal resolution values.

## Contract versioning

- Product Configuration `1.0.0` and QuoteLine `1.0.0` are immutable historical authorities.
- The breaking removal of installation uses Product Configuration `2.0.0` and QuoteLine `2.0.0`.
- Product Configuration 2.0.0 keeps Article Number options, packaging and custom-length policy, and removes installation methods/accessories from this configuration document.
- QuoteLine 2.0.0 keeps product, selection, packaging and quantity, and removes `installationMethod` from `configuration`.
- QuoteLine 2.0.0 is retained as the future server-side conversion authority for final Request a Quote submission. TASK-021 does not create a QuoteLine from the visible Add to Quote action.

## Runtime and security

- Browser -> Next.js only. Next.js server-only code -> WordPress only. No browser or Next.js direct Feishu read is introduced.
- One page load may perform one `/resolve` and one `/product-configurations` request; no per-length, per-color or ProductCard request.
- Raw CMS payload, Article Number, internal IDs and business-private fields never enter visible markup, client errors or browser logs.
- The public draft may remain in browser memory only; any future Basket persistence stores only a separately authorized public representation and re-resolves the complete QuoteLine on the server.
- Preview/CMS remain local non-production modes, noindex/nofollow and production 404.

## Deferred related products

The horizontal related-product recommendation list is intentionally excluded from TASK-021. It needs a separate model-level relationship and ProductCard consumption boundary. The later slice will keep recommendations optional, never auto-bundle them, and show only real eligible relations synchronized through WordPress.
