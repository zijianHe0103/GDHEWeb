import { describe, expect, it } from "vitest";

import {
  QuoteBasketDomainError,
  addPublicDraft,
  cloneAndValidateQuoteBasket,
  createEmptyQuoteBasket,
  removeQuoteBasketItem,
  setQuoteBasketItemQuantity,
  summarizeQuoteBasket,
} from "../src/lib/quote-basket";
import type {
  PublicQuoteBasketProduct,
  QuoteBasketDocument,
} from "../src/lib/quote-basket";
import type { PublicQuoteDraft } from "../src/types/product-configurator";

type Mutable<T> = T extends object
  ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
  : T;

const ids = {
  writerId: "11111111-1111-4111-8111-111111111111",
  mutationId: "22222222-2222-4222-8222-222222222222",
  entryId: "33333333-3333-4333-8333-333333333333",
} as const;

const product = {
  model: "FGD X15+PVC",
  name: "FGD X15+PVC Curtain Track",
  publicPath: "/products/fgd-x15-pvc/",
  image: {
    url: "/test-candidates/fgd-x15-protected.png",
    width: 800,
    height: 800,
    alt: "FGD X15+PVC curtain track",
  },
} as const;

const draft = {
  product: {
    model: "FGD X15+PVC",
    publicPath: "/products/fgd-x15-pvc/",
  },
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

const secondIds = {
  writerId: "44444444-4444-4444-8444-444444444444",
  mutationId: "55555555-5555-4555-8555-555555555555",
  entryId: "66666666-6666-4666-8666-666666666666",
} as const;

function add(
  draftOverride: PublicQuoteDraft = draft,
  productOverride: PublicQuoteBasketProduct = product,
): QuoteBasketDocument {
  return addPublicDraft(
    createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
    productOverride,
    draftOverride,
    new Date("2026-08-05T01:00:00.000Z"),
    ids,
  );
}

describe("Quote Basket public domain", () => {
  it("creates an immutable public-only basket and adds one draft", () => {
    const empty = createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids);
    const basket = addPublicDraft(
      empty,
      product,
      draft,
      new Date("2026-08-05T01:00:00.000Z"),
      ids,
    );

    expect(summarizeQuoteBasket(basket)).toEqual({ lineCount: 1 });
    expect(basket.items[0]?.quantity).toBe(2);
    expect(Object.isFrozen(basket)).toBe(true);
    expect(Object.isFrozen(basket.items[0]?.product.image)).toBe(true);
    expect(JSON.stringify(basket)).not.toMatch(
      /articleNumber|productId|mediaId|price|email/i,
    );
  });

  it("merges complete equal public identity and refreshes display fields", () => {
    const first = add();
    const refreshedProduct = {
      ...product,
      name: "Refreshed public display name",
      image: { ...product.image, alt: "Refreshed public alt" },
    } as const;
    const merged = addPublicDraft(
      first,
      refreshedProduct,
      { ...draft, quantity: 3 },
      new Date("2026-08-06T00:00:00.000Z"),
      secondIds,
    );

    expect(merged.items).toHaveLength(1);
    expect(merged.items[0]).toMatchObject({
      entryId: ids.entryId,
      createdAt: "2026-08-05T01:00:00.000Z",
      product: refreshedProduct,
      quantity: 5,
    });
    expect(first.items[0]?.quantity).toBe(2);
    expect(merged.revision).toBe(first.revision + 1);
    expect(merged.expiresAt).toBe("2026-09-05T00:00:00.000Z");
  });

  it.each<[
    string,
    (source: PublicQuoteDraft) => PublicQuoteDraft,
  ]>([
    ["public path", (source) => ({ ...source, product: { ...source.product, publicPath: "/products/other/" } })],
    ["selection type", (source) => ({ ...source, selection: { ...source.selection, type: "custom" } })],
    ["length", (source) => ({ ...source, selection: { ...source.selection, lengthMeters: 5.8 } })],
    [
      "color code",
      (source) => ({ ...source, selection: { ...source.selection, color: { ...source.selection.color, code: "black" } } }),
    ],
    [
      "color label",
      (source) => ({ ...source, selection: { ...source.selection, color: { ...source.selection.color, label: "White" } } }),
    ],
    [
      "base packaging",
      (source) => ({ ...source, packaging: { ...source.packaging, basePackaging: { label: "Retail Box" } } }),
    ],
    ["logo", (source) => ({ ...source, packaging: { ...source.packaging, logoPrinting: true } })],
    [
      "protection",
      (source) => ({ ...source, packaging: { ...source.packaging, protectionArrangement: { label: "Sleeve" } } }),
    ],
    ["unit", (source) => ({ ...source, quantityUnit: "roll" })],
  ])("keeps a separate line when %s differs", (_label, change) => {
    const first = add();
    const differentDraft = change(draft);
    const differentProduct = {
      ...product,
      publicPath: differentDraft.product.publicPath,
    } as typeof product;
    const result = addPublicDraft(
      first,
      differentProduct,
      differentDraft,
      new Date("2026-08-06T00:00:00.000Z"),
      secondIds,
    );

    expect(result.items).toHaveLength(2);
  });

  it("sets quantity, removes exactly one line and summarizes line count only", () => {
    const first = add();
    const changed = setQuoteBasketItemQuantity(
      first,
      ids.entryId,
      Number.MAX_SAFE_INTEGER,
      new Date("2026-08-06T00:00:00.000Z"),
      secondIds,
    );
    expect(changed.items[0]?.quantity).toBe(Number.MAX_SAFE_INTEGER);
    expect(summarizeQuoteBasket(changed)).toEqual({ lineCount: 1 });

    const removed = removeQuoteBasketItem(
      changed,
      ids.entryId,
      new Date("2026-08-07T00:00:00.000Z"),
      ids,
    );
    expect(removed.items).toEqual([]);
    expect(changed.items).toHaveLength(1);
  });

  it("rejects unsafe quantities and merge overflow atomically", () => {
    const first = add({ ...draft, quantity: Number.MAX_SAFE_INTEGER });
    expect(() =>
      addPublicDraft(
        first,
        product,
        { ...draft, quantity: 1 },
        new Date("2026-08-06T00:00:00.000Z"),
        secondIds,
      ),
    ).toThrow(QuoteBasketDomainError);
    expect(first.items[0]?.quantity).toBe(Number.MAX_SAFE_INTEGER);
    expect(() =>
      setQuoteBasketItemQuantity(
        first,
        ids.entryId,
        1.5,
        new Date("2026-08-06T00:00:00.000Z"),
        secondIds,
      ),
    ).toThrow(QuoteBasketDomainError);
  });

  it("rejects unknown, internal, commercial, PII and hostile-media fields", () => {
    const basket = add();
    const forbidden = [
      { articleNumber: "GDHEPRD000172" },
      { productId: "internal" },
      { wordpressId: 172 },
      { feishuRecordId: "record" },
      { resolution: "sales_follow_up" },
      { supplier: "private" },
      { cost: 1 },
      { price: 100 },
      { stock: 10 },
      { margin: 0.5 },
      { email: "customer@example.com" },
      { phone: "+1 555 0100" },
      { secret: "private" },
      { diagnostic: "private" },
      { rawCms: {} },
    ];
    for (const extra of forbidden) {
      expect(() =>
        cloneAndValidateQuoteBasket({ ...basket, ...extra }),
      ).toThrow(QuoteBasketDomainError);
    }
    expect(() =>
      addPublicDraft(
        createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
        {
          ...product,
          image: {
            ...product.image,
            url: "https://wordpress.example/wp-content/product.png",
          },
        },
        draft,
        new Date("2026-08-05T01:00:00.000Z"),
        ids,
      ),
    ).toThrow(QuoteBasketDomainError);
    expect(() =>
      addPublicDraft(
        createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
        {
          ...product,
          image: {
            ...product.image,
            url: "/test-candidates/../private/product.png",
          },
        },
        draft,
        new Date("2026-08-05T01:00:00.000Z"),
        ids,
      ),
    ).toThrow(QuoteBasketDomainError);
    const draftWithInternalField = {
      ...draft,
      articleNumber: "GDHEPRD000172",
    };
    expect(() =>
      addPublicDraft(
        createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
        product,
        draftWithInternalField,
        new Date("2026-08-05T01:00:00.000Z"),
        ids,
      ),
    ).toThrow(QuoteBasketDomainError);
  });

  it("normalizes reflection failures without exposing caller diagnostics", () => {
    const proxy = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error("private reflection diagnostic");
        },
      },
    );
    expect(() => cloneAndValidateQuoteBasket(proxy)).toThrowError(
      QuoteBasketDomainError,
    );
  });

  it("sanitizes secondary thrown proxies and unrepresentable 30-day expiries", () => {
    const privateDiagnostic = "private secondary proxy diagnostic";
    const secondaryThrown = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error(privateDiagnostic);
        },
      },
    );
    const hostileBasket = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw secondaryThrown;
        },
      },
    );

    for (const operation of [
      () => cloneAndValidateQuoteBasket(hostileBasket),
      () => addPublicDraft(hostileBasket as QuoteBasketDocument, product, draft, new Date("2026-08-06T00:00:00.000Z"), secondIds),
      () => setQuoteBasketItemQuantity(hostileBasket as QuoteBasketDocument, ids.entryId, 1, new Date("2026-08-06T00:00:00.000Z"), secondIds),
      () => removeQuoteBasketItem(hostileBasket as QuoteBasketDocument, ids.entryId, new Date("2026-08-06T00:00:00.000Z"), secondIds),
    ]) {
      let thrown: unknown;
      try {
        operation();
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(QuoteBasketDomainError);
      expect(String(thrown)).not.toContain(privateDiagnostic);
      expect(JSON.stringify(thrown)).not.toContain(privateDiagnostic);
    }

    let dateFailure: unknown;
    try {
      createEmptyQuoteBasket(new Date(8_640_000_000_000_000 - 1_000), ids);
    } catch (error) {
      dateFailure = error;
    }
    expect(dateFailure).toBeInstanceOf(QuoteBasketDomainError);
    expect(String(dateFailure)).not.toContain("Invalid time value");
  });

  it("requires expiresAt to be exactly 30 days after updatedAt", () => {
    const basket = add();
    const exactExpiry = new Date(
      Date.parse(basket.updatedAt) + 2_592_000_000,
    ).toISOString();

    expect(
      cloneAndValidateQuoteBasket({ ...basket, expiresAt: exactExpiry }),
    ).toEqual(basket);
    for (const expiresAt of [
      "2099-01-01T00:00:00.000Z",
      new Date(Date.parse(exactExpiry) - 1).toISOString(),
      new Date(Date.parse(exactExpiry) + 1).toISOString(),
    ]) {
      expect(() =>
        cloneAndValidateQuoteBasket({ ...basket, expiresAt }),
      ).toThrowError(QuoteBasketDomainError);
    }
  });

  it("rejects hostile items reflection without invoking accessors or leaking diagnostics", () => {
    const basket = add();
    let mapAccesses = 0;
    const proxyItems = new Proxy([...basket.items], {
      get(target, key, receiver) {
        if (key === "map") {
          mapAccesses += 1;
          throw new Error("private items map trap");
        }
        return Reflect.get(target, key, receiver);
      },
    });
    let thrown: unknown;
    try {
      cloneAndValidateQuoteBasket({ ...basket, items: proxyItems });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(QuoteBasketDomainError);
    expect(String(thrown)).not.toContain("private items map trap");
    expect(JSON.stringify(thrown)).not.toContain("private items map trap");
    expect(mapAccesses).toBe(0);

    let indexAccesses = 0;
    const accessorItems: unknown[] = [];
    Object.defineProperty(accessorItems, "0", {
      enumerable: true,
      get() {
        indexAccesses += 1;
        throw new Error("private item accessor");
      },
    });
    expect(() =>
      cloneAndValidateQuoteBasket({ ...basket, items: accessorItems }),
    ).toThrowError(QuoteBasketDomainError);
    expect(indexAccesses).toBe(0);
  });

  it("rejects sparse, symbol, non-enumerable and failing-reflection items arrays", () => {
    const basket = add();
    const sparseItems = new Array(1);
    const symbolItems = [...basket.items];
    Object.defineProperty(symbolItems, Symbol("private"), {
      enumerable: true,
      value: basket.items[0],
    });
    const hiddenItems = [...basket.items];
    Object.defineProperty(hiddenItems, "private", {
      enumerable: false,
      value: "private array diagnostic",
    });
    const reflectionItems = new Proxy([...basket.items], {
      ownKeys() {
        throw new Error("private items ownKeys trap");
      },
    });

    for (const items of [
      sparseItems,
      symbolItems,
      hiddenItems,
      reflectionItems,
    ]) {
      let thrown: unknown;
      try {
        cloneAndValidateQuoteBasket({ ...basket, items });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(QuoteBasketDomainError);
      expect(String(thrown)).not.toContain("private items");
      expect(JSON.stringify(thrown)).not.toContain("private items");
    }
  });

  it("rejects duplicate public identities in a stored document", () => {
    const basket = add();
    expect(() =>
      cloneAndValidateQuoteBasket({
        ...basket,
        items: [
          basket.items[0],
          { ...basket.items[0]!, entryId: secondIds.entryId },
        ],
      }),
    ).toThrow(QuoteBasketDomainError);
  });

  it("isolates and deeply freezes caller-owned inputs", () => {
    const mutableProduct: Mutable<PublicQuoteBasketProduct> = {
      ...product,
      image: { ...product.image },
    };
    const mutableDraft: Mutable<PublicQuoteDraft> = {
      ...draft,
      product: { ...draft.product },
      selection: { ...draft.selection, color: { ...draft.selection.color } },
      packaging: {
        ...draft.packaging,
        basePackaging: { ...draft.packaging.basePackaging },
      },
    };
    const basket = addPublicDraft(
      createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
      mutableProduct,
      mutableDraft,
      new Date("2026-08-05T01:00:00.000Z"),
      ids,
    );
    mutableProduct.name = "Caller mutation";
    mutableDraft.selection.color.label = "Caller mutation";

    expect(basket.items[0]?.product.name).toBe(product.name);
    expect(basket.items[0]?.selection.color.label).toBe("Ivory White");
    expect(Object.isFrozen(basket.items[0]?.selection.color)).toBe(true);
  });
});
