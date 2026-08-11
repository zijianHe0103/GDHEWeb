import { describe, expect, test } from "vitest";

import mixedV2 from "../../../frontend/src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import { parseQuoteBasketV3 } from "../../../frontend/src/lib/quote-basket/v3";
import { applyQuoteBasketV3Validation } from "../../../frontend/src/lib/quote-basket/v3/batch";
import { buildMixedQuoteLineValidationRequest } from "../../../frontend/src/lib/cms/server/article-number-batch/query";
import { projectQuoteBasketV3ForValidation } from "../../../frontend/src/lib/quote-basket/v3/batch";

const ids = {
  writerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  mutationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
} as const;

describe("TASK-025 incomplete response attack probe", () => {
  test("records whether the direct application seam accepts an incomplete response", () => {
    const basket = parseQuoteBasketV3(
      JSON.stringify(mixedV2),
      new Date("2026-08-12T00:00:00.000Z"),
    );
    const migrated = basket.items[0];
    if (!migrated || migrated.lineKind !== "configured_product") {
      throw new Error("Missing migrated configured line.");
    }

    const incomplete = {
      lines: [{
        entryId: migrated.entryId,
        lineKind: "configured_product",
        resolution: "resolved_article_number",
        publicPath: migrated.product.publicPath,
        articleNumber: "GDHEPRD000172",
        selection: {
          type: "article_number",
          articleNumber: "GDHEPRD000172",
          lengthMeters: migrated.selection.lengthMeters,
          color: migrated.selection.color,
        },
        packaging: {
          basePackaging: migrated.packaging.basePackaging.key,
          logoPrinting: migrated.packaging.logoPrinting,
          protectionArrangement: migrated.packaging.protectionArrangement?.key ?? null,
        },
        quantityUnit: migrated.quantityUnit,
        quantity: migrated.quantity,
      }],
    };

    const result = applyQuoteBasketV3Validation(
      basket,
      incomplete as never,
      new Date("2026-08-12T00:00:00.000Z"),
      ids,
    );

    expect(result.items[0]).toMatchObject({
      state: "ready",
      articleNumber: "GDHEPRD000172",
    });
  });

  test("records the uppercase legacy entryId cross-contract mismatch", () => {
    const legacy = structuredClone(mixedV2);
    legacy.items[0]!.entryId = "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF";
    const migrated = parseQuoteBasketV3(
      JSON.stringify(legacy),
      new Date("2026-08-12T00:00:00.000Z"),
    );

    expect(migrated.items[0]?.entryId).toBe(legacy.items[0]!.entryId);
    expect(() =>
      buildMixedQuoteLineValidationRequest(
        projectQuoteBasketV3ForValidation(migrated),
      )
    ).toThrowError(expect.objectContaining({
      category: "configuration",
      kind: "invalid_request",
    }));
  });
});
