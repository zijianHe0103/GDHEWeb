import { describe, expect, it, vi } from "vitest";

import {
  submitPublicQuoteDraftToBasket,
  submitPublicQuoteDraftToBasketV3,
} from "../src/components/product-configurator";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import {
  addStoredPublicDraft,
  QUOTE_BASKET_STORAGE_KEY,
} from "../src/lib/quote-basket";
import { projectQuoteBasketProduct } from "../src/lib/product-detail/quote-basket-product";
import { previewProductConfigurationV2 } from "../src/lib/product-configuration/v2/preview";
import { projectPublicProductConfigurator } from "../src/lib/product-configuration/v2/public-configurator";
import { previewProductDetail } from "../src/lib/product-detail/preview";
import type { QuoteBasketStorage } from "../src/lib/quote-basket";

class MemoryStorage implements QuoteBasketStorage {
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

const configuration = projectPublicProductConfigurator(
  previewProductConfigurationV2,
);

const validValues = {
  lengthChoice: "standard:6",
  colorCode: "ivory-white",
  basePackaging: "standard-packaging",
  logoPrinting: false,
  protectionArrangement: null,
  quantity: "2",
} as const;

describe("Quote Basket product integration", () => {
  it("projects only the approved public FGD X15+PVC product facts", () => {
    const product = projectQuoteBasketProduct(previewProductDetail);

    expect(product).toEqual({
      model: "FGD X15+PVC",
      name: "FGD X15+PVC Track",
      publicPath: "/products/fgd-x15-pvc/",
      image: {
        url: "/test-candidates/fgd-x15-protected.png",
        width: 800,
        height: 800,
        alt: "Protected FGD X15+PVC curtain track cross-section",
      },
    });
    expect(JSON.stringify(product)).not.toMatch(
      /article|productId|mediaId|wordpress|wp-content|GDHEPRD/i,
    );
  });

  it("writes exactly once only after the existing form builder succeeds", () => {
    const add = vi.fn(() => ({ mutation: "added" as const }));
    const invalid = submitPublicQuoteDraftToBasket(
      configuration,
      { ...validValues, quantity: "0" },
      add,
    );
    const valid = submitPublicQuoteDraftToBasket(
      configuration,
      validValues,
      add,
    );

    expect(invalid).toEqual({ ok: false, errors: ["quantity"] });
    expect(valid).toMatchObject({ ok: true });
    expect(add).toHaveBeenCalledTimes(1);
  });

  it("hydrates, adds then merges with browser UUIDs and no network", () => {
    const storage = new MemoryStorage();
    const fetchSpy = vi.fn();
    const ids = [
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
      "44444444-4444-4444-8444-444444444444",
      "55555555-5555-4555-8555-555555555555",
      "66666666-6666-4666-8666-666666666666",
    ];
    const adapter = createBrowserQuoteBasketAdapter({
      storage,
      now: () => new Date("2026-08-05T00:00:00.000Z"),
      uuid: () => ids.shift()!,
    });
    const product = projectQuoteBasketProduct(previewProductDetail);
    const add = (draft: Parameters<typeof adapter.add>[1]) =>
      adapter.add(product, draft);
    const firstDraft = submitPublicQuoteDraftToBasketV3(
      configuration,
      validValues,
      add,
    );
    const secondDraft = submitPublicQuoteDraftToBasketV3(
      configuration,
      validValues,
      add,
    );

    expect(firstDraft).toMatchObject({ ok: true, mutation: "added" });
    expect(secondDraft).toMatchObject({ ok: true, mutation: "merged" });
    expect(adapter.load()?.items).toHaveLength(1);
    expect(adapter.load()?.items[0]?.quantity).toBe(4);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses one operation time and classifies from the exact mutation base", () => {
    const storage = new MemoryStorage();
    const product = projectQuoteBasketProduct(previewProductDetail);
    addStoredPublicDraft(
      storage,
      product,
      {
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
      },
      new Date("2026-08-05T00:00:00.000Z"),
      {
        writerId: "11111111-1111-4111-8111-111111111111",
        mutationId: "22222222-2222-4222-8222-222222222222",
        entryId: "33333333-3333-4333-8333-333333333333",
      },
    );
    const now = vi
      .fn()
      .mockReturnValueOnce(new Date("2026-09-03T23:59:59.999Z"))
      .mockReturnValueOnce(new Date("2026-09-04T00:00:00.000Z"));
    const nextIds = [
      "44444444-4444-4444-8444-444444444444",
      "55555555-5555-4555-8555-555555555555",
      "66666666-6666-4666-8666-666666666666",
    ];
    const adapter = createBrowserQuoteBasketAdapter({
      storage,
      now,
      uuid: () => nextIds.shift()!,
    });

    const result = adapter.add(product, {
      product: { model: product.model, publicPath: product.publicPath },
      selection: {
        type: "standard",
        lengthMeters: 6,
        color: { code: "ivory-white", label: "Ivory White" },
      },
      packaging: {
        basePackaging: { key: "standard", label: "Standard Export Packaging" },
        logoPrinting: false,
        protectionArrangement: null,
      },
      articleNumber: "GDHEPRD000172",
      resolution: "standard_ready",
      quantityUnit: "piece",
      quantity: 2,
    });

    expect(now).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ mutation: "added" });
    expect(result.basket.items).toHaveLength(2);
    expect(result.basket.items[0]).toMatchObject({ state: "requires_validation" });
    expect(result.basket.items[1]).toMatchObject({
      state: "ready",
      articleNumber: "GDHEPRD000172",
      quantity: 2,
    });
    expect(storage.values.get(QUOTE_BASKET_STORAGE_KEY)).toContain('"schemaVersion":"3.0.0"');
  });

  it("routes storage events through the frozen newer-snapshot reconciliation", async () => {
    const source = await readFile(
      new URL("../src/lib/quote-basket/use-quote-basket.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain("reconcileQuoteBasketStorageEvent");
    expect(source).not.toContain('event.newValue === null) {\n        setBasket(null)');
  });
});
import { readFile } from "node:fs/promises";
