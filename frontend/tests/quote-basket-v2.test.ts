import { describe, expect, test } from "vitest";

import { addPublicDraft, createEmptyQuoteBasket } from "../src/lib/quote-basket";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import { QUOTE_BASKET_STORAGE_KEY } from "../src/lib/quote-basket/storage";
import {
  QUOTE_BASKET_V2_SCHEMA_VERSION,
  QuoteBasketV2DomainError,
  addCatalogAccessory,
  parseQuoteBasketV2,
  removeQuoteBasketV2Item,
  reconcileQuoteBasketV2StorageEvent,
  serializeQuoteBasketV2,
  setQuoteBasketV2ItemQuantity,
} from "../src/lib/quote-basket/v2";

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

const draft = {
  product: { model: product.model, publicPath: product.publicPath },
  selection: {
    type: "standard",
    lengthMeters: 6,
    color: { code: "ivory-white", label: "Ivory White" },
  },
  packaging: {
    basePackaging: { label: "Standard Export Packaging" },
    logoPrinting: false,
    protectionArrangement: null,
  },
  quantityUnit: "piece",
  quantity: 2,
} as const;

const accessory = {
  product: {
    model: "TASK-023 Accessory Beta",
    name: "Accessory Beta",
    image: product.image,
  },
  catalogPath: "/products/accessories/task-023-related-products/",
  quantityUnit: "piece",
  quantity: 3,
} as const;

function v1Basket() {
  return addPublicDraft(
    createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
    product,
    draft,
    new Date("2026-08-05T01:00:00.000Z"),
    ids,
  );
}

describe("Quote Basket 2.0 public union", () => {
  test("reads v1 losslessly and writes v2 only on the next valid mutation", () => {
    const rawV1 = JSON.stringify(v1Basket());
    const migrated = parseQuoteBasketV2(
      rawV1,
      new Date("2026-08-06T00:00:00.000Z"),
    );

    expect(rawV1).toContain('"schemaVersion":"1.0.0"');
    expect(migrated).toMatchObject({
      schemaVersion: "2.0.0",
      revision: 2,
      items: [{ lineKind: "configured_product", quantity: 2 }],
    });
    expect(migrated.updatedAt).toBe("2026-08-05T01:00:00.000Z");
    expect(migrated.expiresAt).toBe("2026-09-04T01:00:00.000Z");

    const changed = addCatalogAccessory(
      migrated,
      accessory,
      new Date("2026-08-06T00:00:00.000Z"),
      nextIds,
    );
    expect(QUOTE_BASKET_V2_SCHEMA_VERSION).toBe("2.0.0");
    expect(changed.items.map((item) => item.lineKind)).toEqual([
      "configured_product",
      "catalog_accessory",
    ]);
    expect(changed.expiresAt).toBe("2026-09-05T00:00:00.000Z");
    expect(serializeQuoteBasketV2(changed)).toContain(
      '"schemaVersion":"2.0.0"',
    );
  });

  test("merges only complete equal accessory identity and never fabricates configuration", () => {
    const base = parseQuoteBasketV2(
      JSON.stringify(v1Basket()),
      new Date("2026-08-06T00:00:00.000Z"),
    );
    const first = addCatalogAccessory(
      base,
      accessory,
      new Date("2026-08-06T00:00:00.000Z"),
      nextIds,
    );
    const merged = addCatalogAccessory(
      first,
      { ...accessory, quantity: 4 },
      new Date("2026-08-07T00:00:00.000Z"),
      thirdIds,
    );
    const line = merged.items[1];

    expect(line).toMatchObject({
      lineKind: "catalog_accessory",
      catalogPath: accessory.catalogPath,
      quantityUnit: "piece",
      quantity: 7,
    });
    expect(line).not.toHaveProperty("selection");
    expect(line).not.toHaveProperty("packaging");
    expect(JSON.stringify(merged)).not.toMatch(
      /articleNumber|wordpress|wp-content|feishu|diagnostic|secret/i,
    );
  });

  test("splits a different accessory identity, sets quantity and removes one line", () => {
    const base = parseQuoteBasketV2(
      JSON.stringify(v1Basket()),
      new Date("2026-08-06T00:00:00.000Z"),
    );
    const first = addCatalogAccessory(
      base,
      accessory,
      new Date("2026-08-06T00:00:00.000Z"),
      nextIds,
    );
    const second = addCatalogAccessory(
      first,
      { ...accessory, product: { ...accessory.product, model: "Accessory Gamma" } },
      new Date("2026-08-07T00:00:00.000Z"),
      thirdIds,
    );
    expect(second.items).toHaveLength(3);
    const changed = setQuoteBasketV2ItemQuantity(
      second,
      nextIds.entryId,
      Number.MAX_SAFE_INTEGER,
      new Date("2026-08-08T00:00:00.000Z"),
      ids,
    );
    expect(changed.items[1]?.quantity).toBe(Number.MAX_SAFE_INTEGER);
    const removed = removeQuoteBasketV2Item(
      changed,
      nextIds.entryId,
      new Date("2026-08-09T00:00:00.000Z"),
      nextIds,
    );
    expect(removed.items).toHaveLength(2);
    expect(removed.items.some((item) => item.entryId === nextIds.entryId)).toBe(false);
  });

  test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects unsafe accessory quantity %s",
    (quantity) => {
      const base = parseQuoteBasketV2(
        JSON.stringify(v1Basket()),
        new Date("2026-08-06T00:00:00.000Z"),
      );
      expect(() =>
        addCatalogAccessory(
          base,
          { ...accessory, quantity },
          new Date("2026-08-06T00:00:00.000Z"),
          nextIds,
        ),
      ).toThrow(QuoteBasketV2DomainError);
    },
  );

  test("does not rewrite v1 on read and persists canonical v2 on the next accessory mutation", () => {
    const values = new Map<string, string>([
      [QUOTE_BASKET_STORAGE_KEY, JSON.stringify(v1Basket())],
    ]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => void values.delete(key),
    };
    const idsToUse = [
      nextIds.writerId,
      nextIds.mutationId,
      nextIds.entryId,
      thirdIds.writerId,
      thirdIds.mutationId,
      thirdIds.entryId,
    ];
    const adapter = createBrowserQuoteBasketAdapter({
      storage,
      now: () => new Date("2026-08-06T00:00:00.000Z"),
      uuid: () => idsToUse.shift()!,
    });
    const rawV1 = values.get(QUOTE_BASKET_STORAGE_KEY);

    expect(adapter.load()?.schemaVersion).toBe("2.0.0");
    expect(values.get(QUOTE_BASKET_STORAGE_KEY)).toBe(rawV1);
    const result = adapter.addAccessory(accessory);
    expect(result.mutation).toBe("added");
    expect(values.get(QUOTE_BASKET_STORAGE_KEY)).toContain(
      '"schemaVersion":"2.0.0"',
    );
    expect(result.basket.items.map((item) => item.lineKind)).toEqual([
      "configured_product",
      "catalog_accessory",
    ]);
    const configured = adapter.add(product, draft);
    expect(configured.mutation).toBe("merged");
    expect(configured.basket.items.map((item) => item.lineKind)).toEqual([
      "configured_product",
      "catalog_accessory",
    ]);
    expect(configured.basket.items[0]?.quantity).toBe(4);
  });

  test("fails closed on hostile item-array reflection without invoking an accessor", () => {
    const migrated = parseQuoteBasketV2(
      JSON.stringify(v1Basket()),
      new Date("2026-08-06T00:00:00.000Z"),
    );
    let reads = 0;
    const items: unknown[] = [];
    Object.defineProperty(items, "0", {
      enumerable: true,
      get() {
        reads += 1;
        return migrated.items[0];
      },
    });
    Object.defineProperty(items, "length", { value: 1 });

    expect(() =>
      serializeQuoteBasketV2({ ...migrated, items } as never),
    ).toThrow(QuoteBasketV2DomainError);
    expect(reads).toBe(0);
  });

  test("keeps same-origin last-writer-wins reconciliation on canonical v1 or v2 bytes", () => {
    const current = parseQuoteBasketV2(
      JSON.stringify(v1Basket()),
      new Date("2026-08-06T00:00:00.000Z"),
    );
    const newer = addCatalogAccessory(
      current,
      accessory,
      new Date("2026-08-06T00:00:00.000Z"),
      nextIds,
    );
    expect(
      reconcileQuoteBasketV2StorageEvent(
        current,
        {
          key: QUOTE_BASKET_STORAGE_KEY,
          newValue: serializeQuoteBasketV2(newer),
        },
        new Date("2026-08-06T01:00:00.000Z"),
      ),
    ).toEqual(newer);
    expect(
      reconcileQuoteBasketV2StorageEvent(
        newer,
        {
          key: QUOTE_BASKET_STORAGE_KEY,
          newValue: JSON.stringify(v1Basket()),
        },
        new Date("2026-08-06T01:00:00.000Z"),
      ),
    ).toEqual(newer);
  });
});
