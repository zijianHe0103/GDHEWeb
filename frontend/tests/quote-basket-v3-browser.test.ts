import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { QuoteBasketRows } from "../src/components/quote-basket";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import { QUOTE_BASKET_STORAGE_KEY } from "../src/lib/quote-basket/storage";
import mixedV2 from "../src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import { parseQuoteBasketV3 } from "../src/lib/quote-basket/v3";

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

describe("Quote Basket 3.0 browser adapter", () => {
  test("persists ready standard and accessory Article Numbers but never renders them", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => void values.delete(key),
    };
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
      now: () => new Date("2026-08-11T00:00:00.000Z"),
      uuid: () => ids.shift()!,
    });
    const configured = adapter.add(product, {
      product: { model: product.model, publicPath: product.publicPath },
      selection: {
        type: "standard",
        lengthMeters: 6,
        color: { code: "ivory-white", label: "Ivory White" },
      },
      packaging: {
        basePackaging: { key: "standard", label: "Standard Packaging" },
        logoPrinting: false,
        protectionArrangement: null,
      },
      articleNumber: "GDHEPRD000172",
      resolution: "standard_ready",
      quantityUnit: "piece",
      quantity: 1,
    });
    const accessory = adapter.addAccessory({
      product: {
        model: "TASK-025 ACCESSORY",
        name: "TASK-025 Synthetic Accessory",
        image: product.image,
      },
      catalogPath: "/products/accessories/test-candidates/",
      articleNumber: "GDHEPRD000901",
      quantityUnit: "piece",
      quantity: 1,
    });
    const markup = renderToStaticMarkup(createElement(QuoteBasketRows, {
      basket: accessory.basket,
      onQuantity: () => undefined,
      onRemove: () => undefined,
    }));

    expect(configured.basket).toMatchObject({
      schemaVersion: "3.0.0",
      items: [{ state: "ready", articleNumber: "GDHEPRD000172" }],
    });
    expect(accessory.basket.items[1]).toMatchObject({
      state: "ready",
      articleNumber: "GDHEPRD000901",
    });
    expect(values.get(QUOTE_BASKET_STORAGE_KEY)).toMatch(
      /GDHEPRD000172.*GDHEPRD000901/,
    );
    expect(markup).not.toMatch(/GDHEPRD000172|GDHEPRD000901|Article Number/i);
  });

  test("renders customer recovery copy without raw states or internal identity", () => {
    const basket = parseQuoteBasketV3(
      JSON.stringify(mixedV2),
      new Date("2026-08-12T00:00:00.000Z"),
    );
    const markup = renderToStaticMarkup(createElement(QuoteBasketRows, {
      basket,
      onQuantity: () => undefined,
      onRemove: () => undefined,
    }));

    expect(markup).toContain("refresh this saved configuration");
    expect(markup).toContain("remove this saved accessory and add it again");
    expect(markup).not.toMatch(
      /requires_validation|requires_readd|refresh_from_selection|GDHEPRD|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|wordpress|wp-content|feishu|diagnostic/i,
    );
  });
});
