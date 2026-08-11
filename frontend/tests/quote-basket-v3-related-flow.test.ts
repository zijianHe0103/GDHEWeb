import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { RelatedProducts, buildCatalogAccessoryDraftV3 } from "../src/components/related-products";
import relatedV2 from "../src/lib/cms/article-number-batch-contract/samples/success/related-product-card-v2.json";
import { projectPublicRelatedProductsV2 } from "../src/lib/related-products/public-view";
import type { RelatedProductCardCollectionDtoV2 } from "../src/types/related-product-card";

describe("Quote Basket 3.0 related accessory browser flow", () => {
  test("carries the v2 direct-quote Article Number into quantity-one data without rendering it", () => {
    const source = structuredClone(relatedV2);
    source.items[0]!.card.image.url = "/test-candidates/fgd-x15-protected.png";
    const items = projectPublicRelatedProductsV2(
      source as unknown as RelatedProductCardCollectionDtoV2,
    );
    const result = buildCatalogAccessoryDraftV3(items[0]!);
    const markup = renderToStaticMarkup(createElement(RelatedProducts, { items }));

    expect(result).toMatchObject({
      ok: true,
      draft: {
        articleNumber: "GDHEPRD000901",
        quantityUnit: "piece",
        quantity: 1,
      },
    });
    expect(JSON.stringify(items)).toContain("GDHEPRD000901");
    expect(markup).toContain("Add to Quote");
    expect(markup).not.toMatch(/GDHEPRD000901|Article Number/i);
  });
});
