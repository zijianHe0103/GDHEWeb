import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

import fourPlus from "../src/lib/cms/related-product-card-contract/samples/success/four-plus.json";
import { adaptRelatedProductCardCollection } from "../src/lib/cms/server/related-product-cards/adapter";
import { validateRelatedProductCardCollection } from "../src/lib/cms/server/related-product-cards/validation";
import {
  RelatedProducts,
  buildCatalogAccessoryDraft,
  nextRelatedProductVisibleCount,
} from "../src/components/related-products";
import { projectPublicRelatedProducts } from "../src/lib/related-products/public-view";
import { previewRelatedProducts } from "../src/lib/related-products/preview";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import { QUOTE_BASKET_STORAGE_KEY } from "../src/lib/quote-basket/storage";

describe("You May Also Need presentation", () => {
  test("omits the whole module for zero items and unapproved CMS media", () => {
    const remote = adaptRelatedProductCardCollection(
      validateRelatedProductCardCollection(fourPlus),
    );
    expect(projectPublicRelatedProducts(remote)).toEqual([]);
    expect(
      renderToStaticMarkup(createElement(RelatedProducts, { items: [] })),
    ).toBe("");
  });

  test.each([
    [1, 1, false],
    [3, 3, false],
    [4, 3, true],
    [7, 3, true],
  ])("renders %s candidates with at most three initially", (total, visible, more) => {
    const html = renderToStaticMarkup(
      createElement(RelatedProducts, {
        items: previewRelatedProducts.slice(0, total),
      }),
    );

    expect((html.match(/<article/g) ?? [])).toHaveLength(visible);
    expect(html.includes("Show More Products")).toBe(more);
    expect(html).toContain("You May Also Need");
    expect(html).toContain("Protected TEST_CANDIDATE");
    expect(html).not.toMatch(
      /60000000-|62000000-|61000000-|view_product|direct_rfq|wp-content|wordpress|feishu|article number|diagnostic/i,
    );
  });

  test("reveals the next at most three without reorder or refresh", () => {
    expect(nextRelatedProductVisibleCount(3, 4)).toBe(4);
    expect(nextRelatedProductVisibleCount(3, 7)).toBe(6);
    expect(nextRelatedProductVisibleCount(6, 7)).toBe(7);
    expect(nextRelatedProductVisibleCount(7, 7)).toBe(7);
  });

  test("uses one equal-height semantic skeleton without accessory quantity UI", async () => {
    const html = renderToStaticMarkup(
      createElement(RelatedProducts, {
        items: previewRelatedProducts.slice(0, 3),
      }),
    );
    const component = await readFile(
      new URL("../src/components/related-products/index.tsx", import.meta.url),
      "utf8",
    );
    const css = await readFile(
      new URL(
        "../src/components/related-products/related-products.module.css",
        import.meta.url,
      ),
      "utf8",
    );

    expect((html.match(/<article/g) ?? [])).toHaveLength(3);
    expect((html.match(/<figure/g) ?? [])).toHaveLength(3);
    expect((html.match(/<footer/g) ?? [])).toHaveLength(3);
    expect(html).toContain("View Product");
    expect(html).toContain("Add to Quote");
    expect(html).not.toMatch(/<label|<input|Quantity \(piece\)|aria-invalid/i);
    expect(component.match(/className=\{styles\.actionControl\}/g)).toHaveLength(2);
    expect(css).toMatch(/\.card\s*\{[\s\S]*?display:\s*grid/);
    expect(css).toMatch(/\.body\s*\{[\s\S]*?display:\s*grid/);
    expect(css).toMatch(/\.actionControl\s*\{[\s\S]*?width:\s*100%/);
  });

  test("builds a quantity-1 accessory and preserves deterministic repeat-add merge", () => {
    const accessory = previewRelatedProducts.find(
      (item) => item.action.kind === "quote",
    );
    expect(accessory).toBeDefined();
    if (!accessory || accessory.action.kind !== "quote") {
      throw new Error("Expected preview catalog accessory.");
    }
    expect(buildCatalogAccessoryDraft(accessory!)).toEqual({
      ok: true,
      draft: {
        product: accessory.product,
        catalogPath: accessory.action.catalogPath,
        quantityUnit: "piece",
        quantity: 1,
      },
    });
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
      now: () => new Date("2026-08-07T00:00:00.000Z"),
      uuid: () => ids.shift()!,
    });
    const result = buildCatalogAccessoryDraft(accessory!);
    if (!result.ok) throw new Error("Expected a quantity-1 accessory draft.");

    expect(adapter.addAccessory(result.draft).mutation).toBe("added");
    const repeated = adapter.addAccessory(result.draft);
    expect(repeated.mutation).toBe("merged");
    expect(repeated.basket.items).toMatchObject([
      { lineKind: "catalog_accessory", quantity: 2 },
    ]);
    expect(values.get(QUOTE_BASKET_STORAGE_KEY)).toContain('"quantity":2');
  });

  test("restores clamped public expansion and scroll state for browser Back", async () => {
    const componentExports = await import("../src/components/related-products") as unknown as {
      RELATED_PRODUCTS_RETURN_STATE_KEY?: unknown;
      serializeRelatedProductsReturnState?: unknown;
      parseRelatedProductsReturnState?: unknown;
    };

    expect(componentExports.RELATED_PRODUCTS_RETURN_STATE_KEY).toBe(
      "gdhe:ui:related-products:/products/fgd-x15-pvc/:v1",
    );
    expect(componentExports.serializeRelatedProductsReturnState).toBeTypeOf("function");
    expect(componentExports.parseRelatedProductsReturnState).toBeTypeOf("function");
    const serialize = componentExports.serializeRelatedProductsReturnState as (
      visibleCount: number,
      scrollY: number,
      itemCount: number,
    ) => string;
    const parse = componentExports.parseRelatedProductsReturnState as (
      serialized: string | null,
      itemCount: number,
    ) => Readonly<{ visibleCount: number; scrollY: number }> | null;
    const serialized = serialize(6, 432.75, 7);

    expect(JSON.parse(serialized)).toEqual({
      version: 1,
      visibleCount: 6,
      scrollY: 432,
    });
    expect(parse(serialized, 7)).toEqual({ visibleCount: 6, scrollY: 432 });
    expect(parse(serialized, 4)).toEqual({ visibleCount: 4, scrollY: 432 });
    expect(parse('{"version":1,"visibleCount":6,"scrollY":432,"productUuid":"private"}', 7)).toBeNull();
    expect(serialized).not.toMatch(
      /uuid|article|wordpress|wp-content|cms|feishu|raw|response|diagnostic/i,
    );

    const component = await readFile(
      new URL("../src/components/related-products/index.tsx", import.meta.url),
      "utf8",
    );
    expect(component).toContain("sessionStorage.setItem");
    expect(component).toContain("sessionStorage.getItem");
    expect(component).toContain("sessionStorage.removeItem");
    expect(component).toContain("window.scrollTo");
  });

  test("rejects a hostile non-string return state without reading or coercing it", async () => {
    const { parseRelatedProductsReturnState } = await import(
      "../src/components/related-products"
    );
    const validState = '{"version":1,"visibleCount":6,"scrollY":432}';
    const reads = {
      get: 0,
      getPrototypeOf: 0,
      ownKeys: 0,
      descriptor: 0,
      coercion: 0,
    };
    const hostile = new Proxy(Object.create(null) as object, {
      get: (_target, key) => {
        reads.get += 1;
        if (key === Symbol.toPrimitive) {
          return () => {
            reads.coercion += 1;
            return validState;
          };
        }
        throw new Error("hostile get trap");
      },
      getPrototypeOf: () => {
        reads.getPrototypeOf += 1;
        throw new Error("hostile prototype trap");
      },
      ownKeys: () => {
        reads.ownKeys += 1;
        throw new Error("hostile ownKeys trap");
      },
      getOwnPropertyDescriptor: () => {
        reads.descriptor += 1;
        throw new Error("hostile descriptor trap");
      },
    });
    const parse = parseRelatedProductsReturnState as (
      serialized: unknown,
      itemCount: number,
    ) => Readonly<{ visibleCount: number; scrollY: number }> | null;

    expect(parse(hostile, 7)).toBeNull();
    expect(reads).toEqual({
      get: 0,
      getPrototypeOf: 0,
      ownKeys: 0,
      descriptor: 0,
      coercion: 0,
    });
  });

  test("accepts a legal 256-character state and rejects 257 before JSON.parse", async () => {
    const { parseRelatedProductsReturnState } = await import(
      "../src/components/related-products"
    );
    const state = '{"version":1,"visibleCount":6,"scrollY":432}';
    const atMaximum = `${" ".repeat(256 - state.length)}${state}`;
    const overMaximum = ` ${atMaximum}`;
    const originalParse = JSON.parse;
    let parseCalls = 0;
    JSON.parse = ((...args: Parameters<typeof JSON.parse>) => {
      parseCalls += 1;
      return originalParse(...args);
    }) as typeof JSON.parse;

    try {
      expect(atMaximum).toHaveLength(256);
      expect(parseRelatedProductsReturnState(atMaximum, 7)).toEqual({
        visibleCount: 6,
        scrollY: 432,
      });
      expect(parseCalls).toBe(1);

      parseCalls = 0;
      expect(overMaximum).toHaveLength(257);
      expect(parseRelatedProductsReturnState(overMaximum, 7)).toBeNull();
      expect(parseCalls).toBe(0);
    } finally {
      JSON.parse = originalParse;
    }
  });

  test("keeps the 3/2/1 grid, 320px safety and interaction accessibility gates", async () => {
    const component = await readFile(
      new URL("../src/components/related-products/index.tsx", import.meta.url),
      "utf8",
    );
    const css = await readFile(
      new URL(
        "../src/components/related-products/related-products.module.css",
        import.meta.url,
      ),
      "utf8",
    );

    expect(component).toContain('aria-live="polite"');
    expect(component).toContain("firstNewAction.current?.focus()");
    expect(component).toContain("Show More Products");
    expect(component).toContain("View Quote Basket");
    expect(component).not.toMatch(/related-quantity|aria-invalid|setQuantities|setErrors/);
    expect(component).not.toMatch(/fetch\s*\(|process\.env|WORDPRESS_API_URL|feishu/i);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(3,/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2,/);
    expect(css).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toMatch(/min-width:\s*0/);
    expect(css).toMatch(/overflow-wrap:\s*break-word/);
  });
});
