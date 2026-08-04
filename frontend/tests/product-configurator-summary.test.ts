import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as productConfigurator from "../src/components/product-configurator";
import { LatestPublicQuoteDraftSummary } from "../src/components/product-configurator";
import { buildPublicProductConfiguratorDraft } from "../src/lib/product-configuration/v2/build-public-draft";
import { previewProductConfigurationV2 } from "../src/lib/product-configuration/v2/preview";
import { projectPublicProductConfigurator } from "../src/lib/product-configuration/v2/public-configurator";

const publicConfiguration = projectPublicProductConfigurator(
  previewProductConfigurationV2,
);

describe("ProductConfigurator latest customer summary", () => {
  it("exposes only truthful public-draft production names", () => {
    const exports = productConfigurator as Record<string, unknown>;
    const state = productConfigurator.createProductConfiguratorResultState() as
      Record<string, unknown>;

    expect(exports.LatestPublicQuoteDraftSummary).toBeTypeOf("function");
    expect(exports.LatestQuoteLineSummary).toBeUndefined();
    expect(state).toHaveProperty("latestDraft", null);
    expect(state).not.toHaveProperty("latestLine");
  });

  it("renders every public standard draft field with customer labels", () => {
    const result = buildPublicProductConfiguratorDraft(
      publicConfiguration,
      {
        lengthChoice: "standard:6",
        colorCode: "ivory-white",
        basePackaging: "standard-packaging",
        logoPrinting: false,
        protectionArrangement: null,
        quantity: "2",
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const html = renderToStaticMarkup(
      createElement(LatestPublicQuoteDraftSummary, { draft: result.draft }),
    );

    expect(html).toContain("FGD X15+PVC");
    expect(html).toContain("Standard Length");
    expect(html).toContain("6 m");
    expect(html).toContain("Ivory White");
    expect(html).not.toContain("Installation");
    expect(html).toContain("Standard Packaging");
    expect(html).toContain("Customer Logo Printing");
    expect(html).toContain("No");
    expect(html).toContain("Protection Arrangement");
    expect(html).toContain("None");
    expect(html).toContain("2 piece");
    expect(html).not.toMatch(/GDHEPRD|articleNumber|raw|payload|saved|sent/i);
  });

  it("renders the frozen custom and packaging labels without raw values", () => {
    const result = buildPublicProductConfiguratorDraft(
      publicConfiguration,
      {
        lengthChoice: "custom",
        customLength: "5.8",
        colorCode: "ivory-white",
        basePackaging: "large-shrink-wrap",
        logoPrinting: true,
        protectionArrangement: "paired-interlocking",
        quantity: "1",
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const html = renderToStaticMarkup(
      createElement(LatestPublicQuoteDraftSummary, { draft: result.draft }),
    );

    expect(html).toContain("Custom Length");
    expect(html).toContain("5.8 m");
    expect(html).not.toContain("Installation");
    expect(html).toContain("Large Shrink Wrap");
    expect(html).toContain("Yes");
    expect(html).toContain("Paired Interlocking");
    expect(html).not.toMatch(
      /custom_length|large_shrink_wrap|sales_follow_up|>paired</,
    );
  });
});
