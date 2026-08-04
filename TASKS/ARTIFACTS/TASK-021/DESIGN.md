# TASK-021 Design

## Version boundary

TASK-021 introduces two independent breaking authorities:

- Product Configuration Document `2.0.0`;
- QuoteLine `2.0.0`.

The existing v1 paths, schemas, samples, hashes, verifiers and runtime compatibility tests are immutable. V2 uses separate directories, manifest/checksum entries, DTOs and tests. It must not overwrite v1 identifiers or silently reinterpret a v1 payload.

## Product Configuration 2.0.0

The root remains a closed Draft 2020-12 document with:

- `apiVersion: "1"`;
- `schemaVersion: "2.0.0"`;
- `locale: "en"`;
- `type: "product_configuration"`;
- stable public Product identity;
- `articleNumberOptions` using complete real Article Number records;
- `configurationPolicy.packaging`;
- `configurationPolicy.customLength`;
- `modifiedAt`.

`configurationPolicy.installationMethods` and its accessory reference are absent. Installation accessories belong to the later model-level related-product contract, not the track configuration document.

The endpoint remains `/wp-json/gdhe/v1/product-configurations` and accepts exact `schema=2.0.0` for v2. Existing exact `schema=1.0.0` behavior remains unchanged.

## Candidate invariants

Before a v2 product is emitted:

- every option is complete and website-eligible;
- Article Number remains globally unique;
- stable Product UUID binds to one model/name/path/kind/unit identity;
- within one Product UUID, `(lengthMeters, normalized color code)` maps to exactly one Article Number;
- length is positive, finite and one-decimal exact;
- color code/label are valid and consistent;
- no internal/private fields are projected;
- any invalid, duplicate or ambiguous candidate excludes the whole product document.

The current Fixture contains only the confirmed `GDHEPRD000172 / 6 m / Ivory White / piece` option. It does not add 4.3 m or 7 m.

## Frontend public DTO

The v2 server-only Adapter produces a deeply readonly public DTO containing:

- public product identity;
- complete standard options;
- packaging policy;
- custom-length policy.

It excludes response metadata, internal source identity and Article Number from presentation props. The browser-side draft builder receives only this public projection and primitive customer choices; the visible summary never receives or renders Article Number or the stable internal Product UUID.

## Choice projection

The pure projection layer performs one immutable pass over the validated DTO:

1. group options by exact numeric length;
2. output ascending unique Track Length choices;
3. append the separate `Custom Length` choice;
4. for a selected standard length, output unique colors from that group;
5. for Custom Length, output the unique color union;
6. resolve standard selection only when one exact length/color option exists.

No string coercion, approximate comparison, Cartesian product or default Article Number is allowed.

## Public quote draft and future QuoteLine 2.0.0

The visible Add to Quote path creates one latest browser-memory `PublicQuoteDraft`. It is a presentation-safe temporary configuration record and is not validated as QuoteLine 2.0.0. It contains customer-readable model, standard/custom length, color, packaging labels and quantity only; it excludes Article Number, stable internal Product UUID and internal `sales_follow_up` enum. Refresh clears it and no request is sent.

QuoteLine 2.0.0 remains an isolated future server-side conversion authority. A separately authorized final Request a Quote submission will re-resolve the eligible option on the server and construct the complete line without sending internal identity to the browser.

The closed root contains product, selection, configuration, quantityUnit and quantity. Selection retains resolved Article Number or custom-length variants. Configuration contains only packaging:

```json
{
  "configuration": {
    "packaging": {
      "basePackaging": "standard",
      "logoPrinting": false,
      "protectionArrangement": null
    }
  }
}
```

Future server-side identity/equality and any future QuoteLine merge rules use the v2 fields and never import a hidden installation default. V1 equality/merge remains unchanged. TASK-021 does not apply those rules to its browser-memory public draft.

## UI state

- No length is silently invented. The current single real standard length may be presented as one radio choice; user selection is explicit.
- Custom Length is the final sibling radio in the same fieldset. Selecting it reveals the input and clears any resolved Article Number choice.
- Color is a following fieldset. When a standard length changes, an unavailable prior color is cleared.
- Packaging and quantity preserve TASK-020 labels, validation and state behavior.
- `LatestPublicQuoteDraftSummary` removes Installation and preserves all other customer-readable values without claiming that a QuoteLine has been created.
- Errors use stable inline IDs and sanitized customer messages; no raw option or internal identity is serialized into markup.

## Failure behavior

- Missing/invalid v2 document: preserve Product Detail and render the existing sanitized RFQ navigation fallback.
- Empty or ambiguous option projection: configuration unavailable, no public quote draft.
- Invalid custom length, missing color, packaging or quantity: field-level sanitized error.
- No network submission, storage or Feishu mutation.

## Rollback

V2 additions are isolated. Rollback removes v2 route handling, schemas/samples/snapshots/runtime and v2 UI wiring, then restores the TASK-020 v1 consumer. No v1 byte is rewritten, so rollback does not reconstruct historical authority.
