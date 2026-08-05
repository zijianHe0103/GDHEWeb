import { describe, expect, it } from "vitest";

import {
  QUOTE_BASKET_MAX_ENCODED_BYTES,
  QUOTE_BASKET_STORAGE_KEY,
  QUOTE_BASKET_TTL_MS,
  QuoteBasketStorageError,
  addStoredPublicDraft,
  compareQuoteBasketRevision,
  loadQuoteBasket,
  parseQuoteBasket,
  persistQuoteBasket,
  reconcileQuoteBasketStorageEvent,
  removeStoredQuoteBasketItem,
  serializeQuoteBasket,
  setStoredQuoteBasketItemQuantity,
} from "../src/lib/quote-basket";
import { createEmptyQuoteBasket } from "../src/lib/quote-basket";

class MemoryStorage {
  readonly values = new Map<string, string>();
  getError: unknown;
  setError: unknown;

  getItem(key: string): string | null {
    if (this.getError) throw this.getError;
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.setError) throw this.setError;
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const ids = {
  writerId: "11111111-1111-4111-8111-111111111111",
  mutationId: "22222222-2222-4222-8222-222222222222",
} as const;

const mutationIds = {
  writerId: "33333333-3333-4333-8333-333333333333",
  mutationId: "44444444-4444-4444-8444-444444444444",
  entryId: "55555555-5555-4555-8555-555555555555",
} as const;

const nextIds = {
  writerId: "66666666-6666-4666-8666-666666666666",
  mutationId: "77777777-7777-4777-8777-777777777777",
  entryId: "88888888-8888-4888-8888-888888888888",
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
  product: { model: "FGD X15+PVC", publicPath: "/products/fgd-x15-pvc/" },
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

describe("Quote Basket storage", () => {
  it("persists and restores the exact unexpired 30-day public document", () => {
    const storage = new MemoryStorage();
    const now = new Date("2026-08-05T00:00:00.000Z");
    const basket = createEmptyQuoteBasket(now, ids);

    persistQuoteBasket(storage, basket);
    const restored = loadQuoteBasket(storage, now);

    expect(QUOTE_BASKET_STORAGE_KEY).toBe("gdhe.quote-basket.v1");
    expect(QUOTE_BASKET_TTL_MS).toBe(2_592_000_000);
    expect(QUOTE_BASKET_MAX_ENCODED_BYTES).toBe(256 * 1024);
    expect(restored).toEqual(basket);
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toBeDefined();
  });

  it("does not extend TTL on read and refreshes it on every successful mutation", () => {
    const storage = new MemoryStorage();
    const firstNow = new Date("2026-08-05T00:00:00.000Z");
    const first = addStoredPublicDraft(
      storage,
      product,
      draft,
      firstNow,
      mutationIds,
    );
    const rawBeforeRead = storage.values.get(QUOTE_BASKET_STORAGE_KEY);
    const read = loadQuoteBasket(storage, new Date("2026-08-06T00:00:00.000Z"));

    expect(read?.expiresAt).toBe(first.expiresAt);
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toBe(rawBeforeRead);

    const edited = setStoredQuoteBasketItemQuantity(
      storage,
      mutationIds.entryId,
      7,
      new Date("2026-08-06T00:00:00.000Z"),
      nextIds,
    );
    expect(edited.expiresAt).toBe("2026-09-05T00:00:00.000Z");
    expect(edited.revision).toBe(first.revision + 1);

    const removed = removeStoredQuoteBasketItem(
      storage,
      mutationIds.entryId,
      new Date("2026-08-07T00:00:00.000Z"),
      mutationIds,
    );
    expect(removed.items).toEqual([]);
    expect(removed.expiresAt).toBe("2026-09-06T00:00:00.000Z");
  });

  it("reloads the latest persisted revision before a mutation", () => {
    const storage = new MemoryStorage();
    const first = addStoredPublicDraft(
      storage,
      product,
      draft,
      new Date("2026-08-05T00:00:00.000Z"),
      mutationIds,
    );
    const externallyEdited = {
      ...first,
      revision: first.revision + 4,
      writerId: nextIds.writerId,
      mutationId: nextIds.mutationId,
      updatedAt: "2026-08-06T00:00:00.000Z",
      expiresAt: "2026-09-05T00:00:00.000Z",
      items: [{ ...first.items[0]!, quantity: 10 }],
    };
    persistQuoteBasket(storage, externallyEdited);

    const merged = addStoredPublicDraft(
      storage,
      product,
      { ...draft, quantity: 2 },
      new Date("2026-08-07T00:00:00.000Z"),
      mutationIds,
    );
    expect(merged.revision).toBe(externallyEdited.revision + 1);
    expect(merged.items[0]?.quantity).toBe(12);
  });

  it("fails closed and cleans corrupt, extra, unsupported, expired and oversized bytes", () => {
    const valid = createEmptyQuoteBasket(
      new Date("2026-08-05T00:00:00.000Z"),
      ids,
    );
    const invalidValues = [
      "{",
      JSON.stringify({ ...valid, extra: true }),
      JSON.stringify({ ...valid, schemaVersion: "2.0.0" }),
      serializeQuoteBasket(valid),
      "x".repeat(QUOTE_BASKET_MAX_ENCODED_BYTES + 1),
    ];
    const readTimes = [
      new Date("2026-08-05T00:00:00.000Z"),
      new Date("2026-08-05T00:00:00.000Z"),
      new Date("2026-08-05T00:00:00.000Z"),
      new Date("2026-09-04T00:00:00.000Z"),
      new Date("2026-08-05T00:00:00.000Z"),
    ];

    invalidValues.forEach((raw, index) => {
      const storage = new MemoryStorage();
      storage.values.set(QUOTE_BASKET_STORAGE_KEY, raw);
      expect(loadQuoteBasket(storage, readTimes[index]!)).toBeNull();
      expect(storage.values.has(QUOTE_BASKET_STORAGE_KEY)).toBe(false);
    });
  });

  it("rejects invalid serialization and oversized payloads with sanitized errors", () => {
    const hostile = "Article Number GDHEPRD000172 customer@example.com";
    expect(() =>
      parseQuoteBasket(
        "界".repeat(Math.ceil(QUOTE_BASKET_MAX_ENCODED_BYTES / 3) + 1),
        new Date("2026-08-05T00:00:00.000Z"),
      ),
    ).toThrowError(QuoteBasketStorageError);
    try {
      parseQuoteBasket(hostile, new Date("2026-08-05T00:00:00.000Z"));
    } catch (error) {
      expect(error).toMatchObject({ code: "invalid_storage" });
      expect(JSON.stringify(error)).not.toContain(hostile);
      expect(String(error)).not.toContain(hostile);
    }
  });

  it("rejects an oversized legal document without evicting existing bytes", () => {
    const storage = new MemoryStorage();
    const existing = createEmptyQuoteBasket(
      new Date("2026-08-05T00:00:00.000Z"),
      ids,
    );
    persistQuoteBasket(storage, existing);
    const raw = storage.values.get(QUOTE_BASKET_STORAGE_KEY);
    const publicText = "M".repeat(500);
    const oversized = {
      ...existing,
      items: Array.from({ length: 120 }, (_value, index) => ({
        entryId: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        createdAt: existing.updatedAt,
        product: {
          model: publicText,
          name: publicText,
          publicPath: `/products/item-${index}/`,
          image: {
            url: "/test-candidates/fgd-x15-protected.png",
            width: 800,
            height: 800,
            alt: publicText,
          },
        },
        selection: {
          type: "standard" as const,
          lengthMeters: 6,
          color: { code: `color-${index}`, label: publicText },
        },
        packaging: {
          basePackaging: { label: publicText },
          logoPrinting: false,
          protectionArrangement: { label: publicText },
        },
        quantityUnit: `piece-${index}`,
        quantity: 1,
      })),
    };

    expect(() => persistQuoteBasket(storage, oversized)).toThrowError(
      expect.objectContaining({ code: "payload_too_large" }),
    );
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toBe(raw);
  });

  it("classifies quota/security failures and preserves existing bytes", () => {
    const storage = new MemoryStorage();
    const initial = addStoredPublicDraft(
      storage,
      product,
      draft,
      new Date("2026-08-05T00:00:00.000Z"),
      mutationIds,
    );
    const raw = storage.values.get(QUOTE_BASKET_STORAGE_KEY);
    storage.setError = new DOMException("private detail", "QuotaExceededError");
    expect(() =>
      setStoredQuoteBasketItemQuantity(
        storage,
        mutationIds.entryId,
        9,
        new Date("2026-08-06T00:00:00.000Z"),
        nextIds,
      ),
    ).toThrowError(expect.objectContaining({ code: "storage_full" }));
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toBe(raw);
    expect(initial.items[0]?.quantity).toBe(2);

    storage.setError = undefined;
    storage.getError = new DOMException("private detail", "SecurityError");
    expect(() =>
      loadQuoteBasket(storage, new Date("2026-08-06T00:00:00.000Z")),
    ).toThrowError(expect.objectContaining({ code: "storage_unavailable" }));
  });

  it("sanitizes hostile quota lookalikes without reading attacker diagnostics", () => {
    const storage = new MemoryStorage();
    const basket = createEmptyQuoteBasket(
      new Date("2026-08-05T00:00:00.000Z"),
      ids,
    );
    persistQuoteBasket(storage, basket);
    const original = storage.values.get(QUOTE_BASKET_STORAGE_KEY);
    const privateDiagnostic = "private quota reflection diagnostic";
    let unsafeNameReads = 0;
    const hostileThrown = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error(privateDiagnostic);
        },
      },
    );
    const wrappedDomException = new Proxy(
      new DOMException(privateDiagnostic, "QuotaExceededError"),
      {},
    );
    const unsafeName = Object.create(DOMException.prototype);
    Object.defineProperty(unsafeName, "name", {
      get() {
        unsafeNameReads += 1;
        throw new Error(privateDiagnostic);
      },
    });

    for (const failure of [hostileThrown, wrappedDomException, unsafeName]) {
      storage.setError = failure;
      let thrown: unknown;
      try {
        persistQuoteBasket(storage, basket);
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(QuoteBasketStorageError);
      expect(thrown).toMatchObject({ code: "storage_unavailable" });
      expect(String(thrown)).not.toContain(privateDiagnostic);
      expect(JSON.stringify(thrown)).not.toContain(privateDiagnostic);
      expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toBe(original);
    }
    expect(unsafeNameReads).toBe(0);
  });

  it("orders revisions deterministically and adopts only a newer valid event", () => {
    const current = createEmptyQuoteBasket(
      new Date("2026-08-05T00:00:00.000Z"),
      ids,
    );
    const newer = {
      ...current,
      revision: current.revision + 1,
      writerId: mutationIds.writerId,
      mutationId: mutationIds.mutationId,
      updatedAt: "2026-08-06T00:00:00.000Z",
      expiresAt: "2026-09-05T00:00:00.000Z",
    };
    expect(compareQuoteBasketRevision(current, newer)).toBe(-1);
    const laterTime = {
      ...current,
      updatedAt: "2026-08-05T00:00:01.000Z",
      expiresAt: "2026-09-04T00:00:01.000Z",
    };
    const laterWriter = { ...current, writerId: mutationIds.writerId };
    const laterMutation = { ...current, mutationId: mutationIds.mutationId };
    expect(compareQuoteBasketRevision(current, laterTime)).toBe(-1);
    expect(compareQuoteBasketRevision(current, laterWriter)).toBe(-1);
    expect(compareQuoteBasketRevision(current, laterMutation)).toBe(-1);
    expect(
      reconcileQuoteBasketStorageEvent(
        current,
        { key: QUOTE_BASKET_STORAGE_KEY, newValue: serializeQuoteBasket(newer) },
        new Date("2026-08-06T00:00:00.000Z"),
      ),
    ).toEqual(newer);
    expect(
      reconcileQuoteBasketStorageEvent(
        newer,
        { key: QUOTE_BASKET_STORAGE_KEY, newValue: serializeQuoteBasket(current) },
        new Date("2026-08-06T00:00:00.000Z"),
      ),
    ).toEqual(newer);
    expect(
      reconcileQuoteBasketStorageEvent(
        newer,
        { key: QUOTE_BASKET_STORAGE_KEY, newValue: "hostile raw bytes" },
        new Date("2026-08-06T00:00:00.000Z"),
      ),
    ).toEqual(newer);
    expect(
      reconcileQuoteBasketStorageEvent(
        newer,
        { key: "unrelated", newValue: serializeQuoteBasket(current) },
        new Date("2026-08-06T00:00:00.000Z"),
      ),
    ).toEqual(newer);
  });
});
