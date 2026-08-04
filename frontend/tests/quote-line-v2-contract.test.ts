import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, test } from "vitest";

import resolvedSample from "../src/lib/quote-contract/v2/samples/resolved.json";
import customSample from "../src/lib/quote-contract/v2/samples/custom.json";
import installationSample from "../src/lib/quote-contract/v2/samples/invalid/installation.json";
import unsafeSample from "../src/lib/quote-contract/v2/samples/invalid/custom-unsafe.json";
import quoteLineSchema from "../src/lib/quote-contract/v2/schemas/quote-line.v2.schema.json";
import type { QuoteLineV2 } from "../src/lib/quote-contract/v2";
// @ts-expect-error The Node-built verifier intentionally has no declaration.
import verifyQuoteLineV2Contract from "../scripts/verify-quote-line-v2-contract.mjs";

const validate = new Ajv2020({ strict: true, multipleOfPrecision: 12 }).compile(quoteLineSchema);

describe("QuoteLine 2.0.0 contract", () => {
  test("accepts a resolved track line without Installation", () => {
    expect(validate(resolvedSample), JSON.stringify(validate.errors)).toBe(true);
    const line = resolvedSample as QuoteLineV2;
    expect(line.contractVersion).toBe("2.0.0");
    expect(line.configuration).toEqual({
      packaging: {
        basePackaging: "standard",
        logoPrinting: false,
        protectionArrangement: null,
      },
    });
    expect(JSON.stringify(line)).not.toMatch(/installation/i);
  });

  test("accepts custom and rejects Installation or unsafe custom precision", async () => {
    expect(validate(customSample), JSON.stringify(validate.errors)).toBe(true);
    expect(validate(installationSample)).toBe(false);
    expect(validate(unsafeSample)).toBe(false);
    await expect(verifyQuoteLineV2Contract()).resolves.toEqual({files:6,version:"2.0.0"});
  });
});
