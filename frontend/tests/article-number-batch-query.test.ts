import { describe, expect, it } from "vitest";

import {
  buildMixedQuoteLineValidationRequest,
  MixedQuoteLineConfigurationError,
} from "../src/lib/cms/server/article-number-batch/query";

const standardLine = {
  entryId: "25000000-0000-4000-8000-000000000101",
  lineKind: "configured_product",
  canonicalPath: "/products/fgd-x15-pvc/",
  selection: {
    type: "article_number",
    articleNumber: "GDHEPRD000172",
    lengthMeters: 6,
    color: { code: "ivory-white", label: "Ivory White" },
    resolution: "standard_ready",
  },
  packaging: {
    basePackaging: "standard",
    logoPrinting: false,
    protectionArrangement: null,
  },
  quantityUnit: "piece",
  quantity: 2,
} as const;

describe("TASK-025 mixed validation request query", () => {
  it("builds one exact deeply frozen English 1.0.0 request snapshot", () => {
    const request = buildMixedQuoteLineValidationRequest([standardLine]);

    expect(request).toEqual({
      apiVersion: "1",
      schemaVersion: "1.0.0",
      locale: "en",
      lines: [standardLine],
    });
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.lines)).toBe(true);
    expect(Object.isFrozen(request.lines[0])).toBe(true);
    const line = request.lines[0];
    if (line.lineKind !== "configured_product") throw new Error("expected configured line");
    expect(Object.isFrozen(line.selection)).toBe(true);
  });

  it("fails closed before transport for count, unknown-key and duplicate identity violations", () => {
    expect(() => buildMixedQuoteLineValidationRequest([])).toThrowError(
      expect.objectContaining({
        category: "configuration",
        kind: "invalid_request",
      }),
    );
    expect(() => buildMixedQuoteLineValidationRequest(
      Array.from({ length: 51 }, (_, index) => ({
        ...standardLine,
        entryId: `25000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      })),
    )).toThrowError(MixedQuoteLineConfigurationError);
    expect(() => buildMixedQuoteLineValidationRequest([
      { ...standardLine, unknown: true },
    ])).toThrowError(MixedQuoteLineConfigurationError);
    expect(() => buildMixedQuoteLineValidationRequest([
      standardLine,
      { ...standardLine, entryId: "25000000-0000-4000-8000-000000000102" },
    ])).toThrowError(MixedQuoteLineConfigurationError);
  });
});
