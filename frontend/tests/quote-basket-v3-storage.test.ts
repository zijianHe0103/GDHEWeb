import { describe, expect, test } from "vitest";

import mixedV2 from "../src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import { QUOTE_BASKET_STORAGE_KEY } from "../src/lib/quote-basket/storage";
import {
  QUOTE_BASKET_V3_MAX_ENCODED_BYTES,
  QuoteBasketV3DomainError,
  cloneAndValidateQuoteBasketV3,
  loadQuoteBasketV3,
  parseQuoteBasketV3,
  persistQuoteBasketV3,
  reconcileQuoteBasketV3StorageEvent,
  removeQuoteBasketV3Item,
  serializeQuoteBasketV3,
  setQuoteBasketV3ItemQuantity,
} from "../src/lib/quote-basket/v3";

class MemoryStorage {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
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

describe("Quote Basket 3.0 same-key storage", () => {
  test("reads v2 without rewrite, then persists v3 mutation with exact TTL and newer-wins", () => {
    const storage = new MemoryStorage();
    const rawV2 = JSON.stringify(mixedV2);
    storage.values.set(QUOTE_BASKET_STORAGE_KEY, rawV2);
    const read = loadQuoteBasketV3(storage, new Date("2026-08-12T00:00:00.000Z"));

    expect(read?.schemaVersion).toBe("3.0.0");
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toBe(rawV2);
    expect(QUOTE_BASKET_V3_MAX_ENCODED_BYTES).toBe(262144);
    if (!read) throw new Error("Expected migrated Basket.");

    const changed = setQuoteBasketV3ItemQuantity(
      read,
      read.items[0]!.entryId,
      7,
      new Date("2026-08-12T00:00:00.000Z"),
      ids,
    );
    persistQuoteBasketV3(storage, changed);
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toContain(
      '"schemaVersion":"3.0.0"',
    );
    expect(changed.expiresAt).toBe("2026-09-11T00:00:00.000Z");

    const removed = removeQuoteBasketV3Item(
      changed,
      changed.items[1]!.entryId,
      new Date("2026-08-13T00:00:00.000Z"),
      ids,
    );
    expect(removed.items).toHaveLength(1);
    expect(
      reconcileQuoteBasketV3StorageEvent(
        changed,
        { key: QUOTE_BASKET_STORAGE_KEY, newValue: serializeQuoteBasketV3(removed) },
        new Date("2026-08-13T01:00:00.000Z"),
      ),
    ).toEqual(removed);
  });

  test("fails closed on oversize, corrupt, unknown, duplicate and reflective input", () => {
    const now = new Date("2026-08-12T00:00:00.000Z");
    const migrated = parseQuoteBasketV3(JSON.stringify(mixedV2), now);
    const storage = new MemoryStorage();

    storage.values.set(QUOTE_BASKET_STORAGE_KEY, "{");
    expect(loadQuoteBasketV3(storage, now)).toBeNull();
    expect(storage.values.has(QUOTE_BASKET_STORAGE_KEY)).toBe(false);
    expect(() => parseQuoteBasketV3(`{"padding":"${"x".repeat(QUOTE_BASKET_V3_MAX_ENCODED_BYTES)}"}`, now))
      .toThrow(QuoteBasketV3DomainError);
    expect(() => cloneAndValidateQuoteBasketV3({ ...migrated, unknown: true }))
      .toThrow(QuoteBasketV3DomainError);

    const duplicateEntry = {
      ...structuredClone(migrated),
      items: migrated.items.map((item, index) => index === 1
        ? { ...structuredClone(item), entryId: migrated.items[0]!.entryId }
        : structuredClone(item)),
    };
    expect(() => cloneAndValidateQuoteBasketV3(duplicateEntry))
      .toThrow(QuoteBasketV3DomainError);

    const duplicateIdentity = {
      ...structuredClone(migrated),
      items: [
        ...migrated.items.map((item) => structuredClone(item)),
        {
          ...structuredClone(migrated.items[0]!),
          entryId: "77777777-7777-4777-8777-777777777777",
        },
      ],
    };
    expect(() => cloneAndValidateQuoteBasketV3(duplicateIdentity))
      .toThrow(QuoteBasketV3DomainError);

    let reads = 0;
    const hostileItems: unknown[] = [];
    Object.defineProperty(hostileItems, "0", {
      enumerable: true,
      get() {
        reads += 1;
        return migrated.items[0];
      },
    });
    Object.defineProperty(hostileItems, "length", { value: 1 });
    expect(() => cloneAndValidateQuoteBasketV3({ ...migrated, items: hostileItems }))
      .toThrow(QuoteBasketV3DomainError);
    expect(reads).toBe(0);
  });
});
