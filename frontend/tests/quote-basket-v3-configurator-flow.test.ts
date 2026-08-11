import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ProductConfigurator } from "../src/components/product-configurator";
import {
  buildPublicProductConfiguratorDraftV3,
} from "../src/lib/product-configuration/v2/build-public-draft";
import { previewProductConfigurationV2 } from "../src/lib/product-configuration/v2/preview";
import { projectPublicProductConfigurator } from "../src/lib/product-configuration/v2/public-configurator";
import { projectQuoteBasketProduct } from "../src/lib/product-detail/quote-basket-product";
import { previewProductDetail } from "../src/lib/product-detail/preview";

const configuration = projectPublicProductConfigurator(previewProductConfigurationV2);
const common = {
  colorCode: "ivory-white",
  basePackaging: "standard-packaging",
  logoPrinting: false,
  protectionArrangement: null,
  quantity: "2",
} as const;

describe("Quote Basket 3.0 configured-product browser flow", () => {
  test("carries standard Article Number and custom null without rendering it", () => {
    const standard = buildPublicProductConfiguratorDraftV3(configuration, {
      ...common,
      lengthChoice: "standard:6",
    });
    const custom = buildPublicProductConfiguratorDraftV3(configuration, {
      ...common,
      lengthChoice: "custom",
      customLength: "5.8",
    });
    const markup = renderToStaticMarkup(createElement(ProductConfigurator, {
      configuration,
      product: projectQuoteBasketProduct(previewProductDetail),
    }));

    expect(configuration.standardOptions[0]).toMatchObject({
      articleNumber: "GDHEPRD000172",
      lengthMeters: 6,
      color: { label: "Ivory White" },
    });
    expect(standard).toMatchObject({
      ok: true,
      draft: {
        articleNumber: "GDHEPRD000172",
        resolution: "standard_ready",
        packaging: { basePackaging: { key: "standard" } },
      },
    });
    expect(custom).toMatchObject({
      ok: true,
      draft: {
        articleNumber: null,
        resolution: "sales_follow_up",
        selection: { type: "custom", lengthMeters: 5.8 },
      },
    });
    expect(markup).not.toMatch(/GDHEPRD000172|Article Number/i);
  });
});
