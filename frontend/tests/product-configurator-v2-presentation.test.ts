import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ProductConfigurator } from "../src/components/product-configurator";
import { previewProductConfigurationV2 } from "../src/lib/product-configuration/v2/preview";
import { projectPublicProductConfigurator } from "../src/lib/product-configuration/v2/public-configurator";
import { projectQuoteBasketProduct } from "../src/lib/product-detail/quote-basket-product";
import { previewProductDetail } from "../src/lib/product-detail/preview";

const publicConfiguration = projectPublicProductConfigurator(
  previewProductConfigurationV2,
);

describe("ProductConfigurator 2.0.0 presentation", () => {
  test("renders Track Length then Color with only current truth and no Installation", () => {
    const markup = renderToStaticMarkup(createElement(ProductConfigurator, {
      configuration: publicConfiguration,
      product: projectQuoteBasketProduct(previewProductDetail),
    }));
    expect(markup.indexOf("Track Length")).toBeLessThan(markup.indexOf("Color"));
    expect(markup).toContain("6 m");
    expect(markup).toContain("Custom Length");
    expect(markup).toContain("Choose a track length first.");
    expect(publicConfiguration.standardOptions.map(({color}) => color.label)).toEqual(["Ivory White"]);
    expect(publicConfiguration.standardOptions[0]?.articleNumber).toBe(
      "GDHEPRD000172",
    );
    expect(JSON.stringify(publicConfiguration)).not.toMatch(
      /21000000-0000-4000-8000-000000000001|sales_follow_up/,
    );
    expect(markup).not.toMatch(/GDHEPRD000172|Article Number/i);
    expect(markup).not.toMatch(/4\.3 m|7 m|Installation/);
  });
});
