import { readFile } from "node:fs/promises";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ProductConfigurator,
  ProductConfiguratorUnavailable,
} from "../src/components/product-configurator";
import { previewProductConfigurationV2 } from "../src/lib/product-configuration/v2/preview";
import { projectPublicProductConfigurator } from "../src/lib/product-configuration/v2/public-configurator";
import { projectQuoteBasketProduct } from "../src/lib/product-detail/quote-basket-product";
import { previewProductDetail } from "../src/lib/product-detail/preview";

const publicConfiguration = projectPublicProductConfigurator(
  previewProductConfigurationV2,
);

describe("ProductConfigurator presentation", () => {
  it("renders the closed accessible initial form with one real standard choice", () => {
    const html = renderToStaticMarkup(
      createElement(ProductConfigurator, {
        configuration: publicConfiguration,
        product: projectQuoteBasketProduct(previewProductDetail),
      }),
    );

    expect(html).toContain('id="configure-product"');
    expect(html).toContain("<form");
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend>Track Length</legend>");
    expect(html).toContain("<legend>Color</legend>");
    expect(html).not.toContain("<legend>Installation</legend>");
    expect(html).toContain("6 m");
    expect(html).toContain("Custom Length");
    expect(html).not.toContain("4.3 m");
    expect(html).not.toContain("5.8 m");
    expect(html).not.toContain("6.7 m");
    expect(html).toContain('type="submit"');
    expect(html).toContain("Add to Quote");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Saved in this browser for 30 days");
    expect(html).toContain('href="/request-a-quote/"');
    expect(html).toContain("View Quote Basket");
    expect(html).not.toContain("Latest temporary quote item");
    expect(html).not.toContain(" Ceiling Mount</label>");
    expect(html).not.toContain(" Wall Mount</label>");
    expect(html).toContain(">Standard Packaging<");
    expect(html).toContain(">Carton Packaging<");
    expect(html).toContain(">Large Shrink Wrap<");
    expect(html).toContain("Customer Logo Printing");
    expect(html).toContain(">None<");
    expect(html).toContain(">Single-piece Bagging<");
    expect(html).toContain(">Paired Interlocking<");
    expect(html).not.toMatch(
      / Ceiling<\/label>| Wall<\/label>|>standard<|>carton<|>large shrink wrap<| Logo printing<\/label>|>single bag<|>paired</,
    );
  });

  it("renders the unavailable state with navigation-only RFQ and no form", () => {
    const html = renderToStaticMarkup(
      createElement(ProductConfiguratorUnavailable),
    );
    expect(html).toContain("Online configuration is temporarily unavailable");
    expect(html).toContain('href="/request-a-quote/"');
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Add to Quote");
  });

  it("uses only the public Basket client seam and no network implementation", async () => {
    const source = await readFile(
      new URL("../src/components/product-configurator/index.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain("useQuoteBasket");
    expect(source).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/);
  });

  it("uses width-safe local CSS with a single-column narrow breakpoint", async () => {
    const css = await readFile(
      new URL(
        "../src/components/product-configurator/product-configurator.module.css",
        import.meta.url,
      ),
      "utf8",
    );
    expect(css).toMatch(/box-sizing:\s*border-box/);
    expect(css).toMatch(/width:\s*min\(100%,/);
    expect(css).toMatch(/min-width:\s*0/);
    expect(css).toMatch(/@media\s*\(max-width:\s*48rem\)/);
    expect(css).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });
});
