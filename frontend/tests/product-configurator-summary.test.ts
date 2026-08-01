import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LatestQuoteLineSummary } from "../src/components/product-configurator";
import { buildProductConfigurationQuoteLine } from "../src/lib/product-configuration/build-quote-line";
import { previewProductConfiguration } from "../src/lib/product-configuration/preview";

describe("ProductConfigurator latest customer summary", () => {
  it("renders every frozen standard QuoteLine field with customer labels", () => {
    const result = buildProductConfigurationQuoteLine(
      previewProductConfiguration,
      {
        mode: "standard",
        articleNumber: "GDHEPRD000172",
        installationMethod: "ceiling",
        basePackaging: "standard",
        logoPrinting: false,
        protectionArrangement: null,
        quantity: "2",
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const html = renderToStaticMarkup(
      createElement(LatestQuoteLineSummary, { line: result.line }),
    );

    expect(html).toContain("FGD X15+PVC");
    expect(html).toContain("Standard Length");
    expect(html).toContain("6 m");
    expect(html).toContain("Ivory White");
    expect(html).toContain("Ceiling Mount");
    expect(html).toContain("Standard Packaging");
    expect(html).toContain("Customer Logo Printing");
    expect(html).toContain("No");
    expect(html).toContain("Protection Arrangement");
    expect(html).toContain("None");
    expect(html).toContain("2 piece");
    expect(html).not.toMatch(/GDHEPRD|articleNumber|raw|payload|saved|sent/i);
  });

  it("renders the frozen custom and packaging labels without raw values", () => {
    const result = buildProductConfigurationQuoteLine(
      previewProductConfiguration,
      {
        mode: "custom",
        customLength: "5.8",
        colorCode: "ivory-white",
        installationMethod: "wall",
        basePackaging: "large_shrink_wrap",
        logoPrinting: true,
        protectionArrangement: "paired",
        quantity: "1",
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const html = renderToStaticMarkup(
      createElement(LatestQuoteLineSummary, { line: result.line }),
    );

    expect(html).toContain("Custom Length");
    expect(html).toContain("5.8 m");
    expect(html).toContain("Wall Mount");
    expect(html).toContain("Large Shrink Wrap");
    expect(html).toContain("Yes");
    expect(html).toContain("Paired Interlocking");
    expect(html).not.toMatch(
      /custom_length|large_shrink_wrap|sales_follow_up|>paired</,
    );
  });
});
