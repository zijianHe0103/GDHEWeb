import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, test } from "vitest";

import customSample from "../src/lib/quote-contract/samples/custom.json";
import customArticleNumber from "../src/lib/quote-contract/samples/invalid/custom-article-number.json";
import customPrecision from "../src/lib/quote-contract/samples/invalid/custom-precision.json";
import fractionalQuantity from "../src/lib/quote-contract/samples/invalid/fractional-quantity.json";
import invalidPackaging from "../src/lib/quote-contract/samples/invalid/invalid-packaging.json";
import priceLeak from "../src/lib/quote-contract/samples/invalid/price-leak.json";
import zeroQuantity from "../src/lib/quote-contract/samples/invalid/zero-quantity.json";
import resolvedSample from "../src/lib/quote-contract/samples/resolved.json";
import quoteLineSchema from "../src/lib/quote-contract/schemas/quote-line.v1.schema.json";
import {
  mergeQuoteLines,
  quoteLineIdentityEquals,
  type QuoteLine,
} from "../src/lib/quote-contract";

const validate = new Ajv2020({
  allErrors: true,
  strict: true,
  multipleOfPrecision: 12,
}).compile(quoteLineSchema);

function resolved(overrides: Partial<QuoteLine> = {}): QuoteLine {
  return {
    ...(structuredClone(resolvedSample) as QuoteLine),
    ...overrides,
  };
}

function custom(overrides: Partial<QuoteLine> = {}): QuoteLine {
  return {
    ...(structuredClone(customSample) as QuoteLine),
    ...overrides,
  };
}

describe("QuoteLine 1.0.0 contract", () => {
  test("accepts the resolved and unresolved custom samples", () => {
    expect(validate(resolvedSample), JSON.stringify(validate.errors)).toBe(true);
    expect(validate(customSample), JSON.stringify(validate.errors)).toBe(true);
  });

  test("binds Schema quantity to the positive JavaScript safe-integer range", () => {
    expect(validate(resolved({ quantity: Number.MAX_SAFE_INTEGER }))).toBe(true);
    expect(validate(resolved({ quantity: Number.MAX_SAFE_INTEGER + 1 }))).toBe(false);
  });

  test.each([
    ["zero quantity", zeroQuantity],
    ["fractional quantity", fractionalQuantity],
    ["custom Article Number", customArticleNumber],
    ["custom precision", customPrecision],
    ["price leak", priceLeak],
    ["invalid packaging", invalidPackaging],
  ])("rejects %s", (_label, sample) => {
    expect(validate(sample)).toBe(false);
  });

  test("merges an identical resolved line by quantity without mutating input", () => {
    const first = resolved();
    const second = resolved({ quantity: 2 });
    const before = JSON.stringify([first, second]);

    const merged = mergeQuoteLines([first, second]);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.quantity).toBe(3);
    expect(JSON.stringify([first, second])).toBe(before);
    expect(merged[0]).not.toBe(first);
  });

  test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid runtime quantity %s before cloning or merging",
    (quantity) => {
      const line = resolved({ quantity }) as QuoteLine;
      expect(() => mergeQuoteLines([line])).toThrowError(
        /positive safe integer/i,
      );
    },
  );

  test("accepts the exact maximum as a single line", () => {
    expect(mergeQuoteLines([
      resolved({ quantity: Number.MAX_SAFE_INTEGER }),
    ])).toMatchObject([{ quantity: Number.MAX_SAFE_INTEGER }]);
  });

  test("rejects an equal-identity merge whose exact sum exceeds the safe maximum", () => {
    expect(() => mergeQuoteLines([
      resolved({ quantity: Number.MAX_SAFE_INTEGER }),
      resolved({ quantity: 2 }),
    ])).toThrowError(/safe integer maximum/i);
  });

  test("compares semantic fields rather than object insertion order", () => {
    const first = resolved();
    const reordered = {
      quantity: first.quantity,
      quantityUnit: first.quantityUnit,
      configuration: {
        packaging: {
          protectionArrangement:
            first.configuration.packaging.protectionArrangement,
          logoPrinting: first.configuration.packaging.logoPrinting,
          basePackaging: first.configuration.packaging.basePackaging,
        },
        installationMethod: first.configuration.installationMethod,
      },
      selection: {
        color: {
          label: first.selection.color.label,
          code: first.selection.color.code,
        },
        lengthMeters: first.selection.lengthMeters,
        articleNumber: first.selection.type === "article_number"
          ? first.selection.articleNumber
          : null,
        type: first.selection.type,
      },
      product: {
        publicPath: first.product.publicPath,
        model: first.product.model,
        id: first.product.id,
      },
      contractVersion: first.contractVersion,
    } as QuoteLine;

    expect(quoteLineIdentityEquals(first, reordered)).toBe(true);
  });

  test.each([
    ["installation", (line: QuoteLine) => ({
      ...line,
      configuration: { ...line.configuration, installationMethod: "wall" as const },
    })],
    ["base packaging", (line: QuoteLine) => ({
      ...line,
      configuration: {
        ...line.configuration,
        packaging: { ...line.configuration.packaging, basePackaging: "carton" as const },
      },
    })],
    ["Logo printing", (line: QuoteLine) => ({
      ...line,
      configuration: {
        ...line.configuration,
        packaging: { ...line.configuration.packaging, logoPrinting: true },
      },
    })],
    ["protection arrangement", (line: QuoteLine) => ({
      ...line,
      configuration: {
        ...line.configuration,
        packaging: { ...line.configuration.packaging, protectionArrangement: "paired" as const },
      },
    })],
  ])("keeps a different %s on a separate line", (_label, mutate) => {
    const first = resolved();
    expect(mergeQuoteLines([first, mutate(first)])).toHaveLength(2);
  });

  test("merges equal custom lengths and separates different custom lengths", () => {
    const first = custom();
    const equal = custom({ quantity: 3 });
    const different = custom({
      selection: { ...first.selection, lengthMeters: 5.8 },
    } as Partial<QuoteLine>);

    expect(mergeQuoteLines([first, equal])).toMatchObject([{ quantity: 5 }]);
    expect(mergeQuoteLines([first, different])).toHaveLength(2);
  });

  test("never merges resolved and custom branches", () => {
    expect(mergeQuoteLines([resolved(), custom()])).toHaveLength(2);
  });

  test("returns deterministic serializable output", () => {
    const input = [resolved(), resolved({ quantity: 2 }), custom()];
    const first = JSON.stringify(mergeQuoteLines(input));
    const second = JSON.stringify(mergeQuoteLines(structuredClone(input)));
    expect(second).toBe(first);
  });
});
