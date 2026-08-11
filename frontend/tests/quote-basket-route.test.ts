import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import QuoteBasketPage, {
  dynamic,
  metadata,
} from "../src/app/request-a-quote/page";
import * as QuoteBasketComponents from "../src/components/quote-basket";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import type { QuoteBasketStorage } from "../src/lib/quote-basket";
import {
  addPublicDraft,
  createEmptyQuoteBasket,
} from "../src/lib/quote-basket";

const originalMode = process.env.GDHE_PRODUCT_DETAIL_MODE;

afterEach(() => {
  if (originalMode === undefined) delete process.env.GDHE_PRODUCT_DETAIL_MODE;
  else process.env.GDHE_PRODUCT_DETAIL_MODE = originalMode;
});

const ids = {
  writerId: "11111111-1111-4111-8111-111111111111",
  mutationId: "22222222-2222-4222-8222-222222222222",
  entryId: "33333333-3333-4333-8333-333333333333",
} as const;

const basket = addPublicDraft(
  createEmptyQuoteBasket(new Date("2026-08-05T00:00:00.000Z"), ids),
  {
    model: "FGD X15+PVC",
    name: "FGD X15+PVC Track",
    publicPath: "/products/fgd-x15-pvc/",
    image: {
      url: "/test-candidates/fgd-x15-protected.png",
      width: 800,
      height: 800,
      alt: "Protected FGD X15+PVC curtain track cross-section",
    },
  },
  {
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
      basePackaging: { label: "Standard Packaging" },
      logoPrinting: false,
      protectionArrangement: null,
    },
    quantityUnit: "piece",
    quantity: 2,
  },
  new Date("2026-08-05T00:00:01.000Z"),
  ids,
);

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

describe("local Quote Basket route", () => {
  it("is noindex, force-dynamic and disabled outside local modes", async () => {
    delete process.env.GDHE_PRODUCT_DETAIL_MODE;
    await expect(QuoteBasketPage()).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
    expect(dynamic).toBe("force-dynamic");
    expect(metadata).toMatchObject({
      robots: { index: false, follow: false },
    });
  });

  it.each(["preview", "cms"])(
    "renders a hydration-safe local loading state in %s mode",
    async (mode) => {
      process.env.GDHE_PRODUCT_DETAIL_MODE = mode;
      const html = renderToStaticMarkup(await QuoteBasketPage());

      expect(html).toContain("Quote Basket");
      expect(html).toContain("Loading your saved quote items");
      expect(html).not.toMatch(/price|checkout|payment|order status/i);
    },
  );

  it("renders one protected row with exact public controls and no submission", () => {
    const html = renderToStaticMarkup(
      createElement(QuoteBasketComponents.QuoteBasketRows, {
        basket,
        onQuantity: vi.fn(),
        onRemove: vi.fn(),
      }),
    );

    expect(html).toContain("%2Ftest-candidates%2Ffgd-x15-protected.png");
    expect(html).toContain("FGD X15+PVC Track");
    expect(html).toContain("Standard Length");
    expect(html).toContain("6 m");
    expect(html).toContain("Ivory White");
    expect(html).toContain("Standard Packaging");
    expect(html).toContain("Customer Logo Printing");
    expect(html).toContain("None");
    expect(html).toContain('type="number"');
    expect(html).toContain("Remove");
    expect(html).toContain("Final quote submission is not available yet");
    expect(html).toContain("disabled");
    expect(html).not.toMatch(
      /price|currency|save for later|delivery|checkout|payment|order status|wp-content|GDHEPRD/i,
    );
  });

  it("keeps the exact final-remove announcement in the empty live region", () => {
    const storage = new MemoryStorage();
    const ids = [
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
      "44444444-4444-4444-8444-444444444444",
      "55555555-5555-4555-8555-555555555555",
    ];
    const adapter = createBrowserQuoteBasketAdapter({
      storage,
      now: () => new Date("2026-08-05T00:00:00.000Z"),
      uuid: () => ids.shift()!,
    });
    adapter.add(basket.items[0]!.product, {
      product: {
        model: basket.items[0]!.product.model,
        publicPath: basket.items[0]!.product.publicPath,
      },
      selection: basket.items[0]!.selection,
      packaging: {
        basePackaging: { key: "standard", label: "Standard Packaging" },
        logoPrinting: false,
        protectionArrangement: null,
      },
      articleNumber: "GDHEPRD000172",
      resolution: "standard_ready",
      quantityUnit: "piece",
      quantity: basket.items[0]!.quantity,
    });
    const removed = adapter.remove(adapter.load()!.items[0]!.entryId);
    const announcement = "Item removed from your Quote Basket.";
    const html = renderToStaticMarkup(
      createElement(QuoteBasketComponents.QuoteBasketContent, {
        hydrated: true,
        basket: removed,
        error: null,
        announcement,
        add: vi.fn(),
        setQuantity: vi.fn(),
        remove: vi.fn(),
      }),
    );

    expect(html).toContain("Your Quote Basket is empty");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain(announcement);
  });
});
