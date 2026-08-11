import { describe, expect, test } from "vitest";

import mixedV2 from "../src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import {
  QUOTE_BASKET_V3_SCHEMA_VERSION,
  QuoteBasketV3DomainError,
  addCatalogAccessoryV3,
  addConfiguredProductV3,
  createEmptyQuoteBasketV3,
  parseQuoteBasketV3,
} from "../src/lib/quote-basket/v3";

function configuredV1(selectionType: "standard" | "custom") {
  const configured = structuredClone(mixedV2.items[0]);
  if (
    configured.lineKind !== "configured_product" ||
    configured.selection === undefined
  ) throw new Error("fixture mismatch");
  const selection = configured.selection;
  selection.type = selectionType;
  if (selectionType === "custom") selection.lengthMeters = 5.8;
  const { lineKind: _lineKind, ...item } = configured;
  void _lineKind;
  return {
    schemaVersion: "1.0.0",
    revision: mixedV2.revision,
    writerId: mixedV2.writerId,
    mutationId: mixedV2.mutationId,
    updatedAt: mixedV2.updatedAt,
    expiresAt: mixedV2.expiresAt,
    items: [item],
  };
}

describe("Quote Basket 3.0 migration", () => {
  test("migrates v1/v2 standard, custom and accessory states without guessing identity", () => {
    const now = new Date("2026-08-12T00:00:00.000Z");
    const standard = parseQuoteBasketV3(JSON.stringify(configuredV1("standard")), now);
    const custom = parseQuoteBasketV3(JSON.stringify(configuredV1("custom")), now);
    const mixed = parseQuoteBasketV3(JSON.stringify(mixedV2), now);

    expect(QUOTE_BASKET_V3_SCHEMA_VERSION).toBe("3.0.0");
    expect(standard.items[0]).toMatchObject({
      lineKind: "configured_product",
      state: "requires_validation",
      articleNumber: null,
      resolution: "refresh_from_selection",
    });
    expect(custom.items[0]).toMatchObject({
      lineKind: "configured_product",
      state: "ready",
      articleNumber: null,
      resolution: "sales_follow_up",
      selection: { type: "custom", lengthMeters: 5.8 },
    });
    expect(mixed.items[1]).toMatchObject({
      lineKind: "catalog_accessory",
      state: "requires_readd",
      articleNumber: null,
    });
    expect(mixed).toMatchObject({
      revision: mixedV2.revision,
      writerId: mixedV2.writerId,
      mutationId: mixedV2.mutationId,
      updatedAt: mixedV2.updatedAt,
      expiresAt: mixedV2.expiresAt,
    });
    expect(Object.isFrozen(mixed.items[1])).toBe(true);
  });

  test("adds and merges only legal ready standard, custom and accessory identities", () => {
    const configuredProduct = mixedV2.items[0];
    const catalogAccessory = mixedV2.items[1];
    if (
      configuredProduct.lineKind !== "configured_product" ||
      catalogAccessory.lineKind !== "catalog_accessory"
    ) throw new Error("fixture mismatch");
    const product = {
      model: "FGD X15+PVC",
      name: "FGD X15+PVC Track",
      publicPath: "/products/fgd-x15-pvc/",
      image: {
        url: "/test-candidates/fgd-x15-protected.png",
        width: 800,
        height: 800,
        alt: "Protected test candidate",
      },
    } as const;
    const packaging = {
      basePackaging: { key: "standard", label: "Standard Packaging" },
      logoPrinting: false,
      protectionArrangement: null,
    } as const;
    const ids = {
      writerId: "11111111-1111-4111-8111-111111111111",
      mutationId: "22222222-2222-4222-8222-222222222222",
      entryId: "33333333-3333-4333-8333-333333333333",
    } as const;
    const nextIds = {
      writerId: "44444444-4444-4444-8444-444444444444",
      mutationId: "55555555-5555-4555-8555-555555555555",
      entryId: "66666666-6666-4666-8666-666666666666",
    } as const;
    const thirdIds = {
      writerId: "77777777-7777-4777-8777-777777777777",
      mutationId: "88888888-8888-4888-8888-888888888888",
      entryId: "99999999-9999-4999-8999-999999999999",
    } as const;
    const fourthIds = {
      writerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      mutationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      entryId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    } as const;
    const now = new Date("2026-08-11T00:00:00.000Z");
    const standard = {
      product: { model: product.model, publicPath: product.publicPath },
      selection: {
        type: "standard",
        lengthMeters: 6,
        color: { code: "ivory-white", label: "Ivory White" },
      },
      packaging,
      articleNumber: "GDHEPRD000172",
      resolution: "standard_ready",
      quantityUnit: "piece",
      quantity: 2,
    } as const;
    const empty = createEmptyQuoteBasketV3(now, ids);
    const first = addConfiguredProductV3(empty, product, standard, now, ids);
    const merged = addConfiguredProductV3(
      first,
      product,
      { ...standard, quantity: 3 },
      new Date("2026-08-12T00:00:00.000Z"),
      nextIds,
    );
    const split = addConfiguredProductV3(
      merged,
      product,
      { ...standard, articleNumber: "GDHEPRD000173", quantity: 1 },
      new Date("2026-08-13T00:00:00.000Z"),
      thirdIds,
    );
    const custom = addConfiguredProductV3(
      split,
      product,
      {
        ...standard,
        selection: { ...standard.selection, type: "custom", lengthMeters: 5.8 },
        articleNumber: null,
        resolution: "sales_follow_up",
        quantity: 1,
      },
      new Date("2026-08-14T00:00:00.000Z"),
      fourthIds,
    );
    const accessory = addCatalogAccessoryV3(
      custom,
      {
        product: catalogAccessory.product,
        catalogPath: catalogAccessory.catalogPath!,
        articleNumber: "GDHEPRD000901",
        quantityUnit: "piece",
        quantity: 1,
      },
      new Date("2026-08-15T00:00:00.000Z"),
      nextIds,
    );

    expect(merged.items[0]).toMatchObject({ quantity: 5, articleNumber: "GDHEPRD000172" });
    expect(split.items).toHaveLength(2);
    expect(custom.items[2]).toMatchObject({
      state: "ready",
      articleNumber: null,
      resolution: "sales_follow_up",
    });
    expect(accessory.items[3]).toMatchObject({
      lineKind: "catalog_accessory",
      state: "ready",
      articleNumber: "GDHEPRD000901",
      quantity: 1,
    });
    expect(() =>
      addConfiguredProductV3(
        empty,
        product,
        { ...standard, articleNumber: null } as never,
        now,
        ids,
      ),
    ).toThrow(QuoteBasketV3DomainError);
  });
});
