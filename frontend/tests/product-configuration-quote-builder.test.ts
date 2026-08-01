import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

import sample from "../src/lib/cms/product-configuration-contract/samples/success/fgd-x15-pvc.json";
import { adaptProductConfiguration } from "../src/lib/cms/server/product-configurations/adapter";
import { validateProductConfiguration } from "../src/lib/cms/server/product-configurations/validation";
import quoteLineSchema from "../src/lib/quote-contract/schemas/quote-line.v1.schema.json";
import { buildProductConfigurationQuoteLine } from "../src/lib/product-configuration/build-quote-line";

const configuration = adaptProductConfiguration(validateProductConfiguration(sample));
const validateQuoteLine = new Ajv2020({ strict: true, multipleOfPrecision: 12 }).compile(quoteLineSchema);

const common = {
  installationMethod: "ceiling",
  basePackaging: "standard",
  logoPrinting: false,
  protectionArrangement: null,
  quantity: "2",
} as const;

describe("Product Configuration QuoteLine builder", () => {
  it("copies a selected standard option into a frozen Schema-valid line", () => {
    const result = buildProductConfigurationQuoteLine(configuration, {
      ...common,
      mode: "standard",
      articleNumber: "GDHEPRD000172",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.line).toMatchObject({
      contractVersion: "1.0.0",
      product: { model: "FGD X15+PVC" },
      selection: {
        type: "article_number",
        articleNumber: "GDHEPRD000172",
        lengthMeters: 6,
        color: { code: "ivory-white", label: "Ivory White" },
      },
      quantity: 2,
    });
    expect(validateQuoteLine(result.line), JSON.stringify(validateQuoteLine.errors)).toBe(true);
    expect(Object.isFrozen(result.line)).toBe(true);
    expect(Object.isFrozen(result.line.selection.color)).toBe(true);
  });

  it("builds a canonical custom length with a real DTO color and no Article Number", () => {
    const result = buildProductConfigurationQuoteLine(configuration, {
      ...common,
      mode: "custom",
      customLength: "5.8",
      colorCode: "ivory-white",
      installationMethod: "wall",
      basePackaging: "carton",
      logoPrinting: true,
      protectionArrangement: "paired",
      quantity: "1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.line.selection).toEqual({
      type: "custom_length",
      articleNumber: null,
      lengthMeters: 5.8,
      color: { code: "ivory-white", label: "Ivory White" },
      resolution: "sales_follow_up",
    });
    expect(validateQuoteLine(result.line), JSON.stringify(validateQuoteLine.errors)).toBe(true);
  });

  it.each([
    "9999999999999999.9",
    `${"9".repeat(400)}.9`,
  ])("rejects precision-losing custom length %s", (customLength) => {
    const result = buildProductConfigurationQuoteLine(configuration, {
      ...common,
      mode: "custom",
      customLength,
      colorCode: "ivory-white",
    });

    expect(result).toEqual({
      ok: false,
      errors: [{ field: "customLength", code: "invalid" }],
    });
  });

  it.each([
    ["unknown standard option", { ...common, mode: "standard", articleNumber: "GDHEPRD999999" }, "selection"],
    ["noncanonical custom", { ...common, mode: "custom", customLength: "05.8", colorCode: "ivory-white" }, "customLength"],
    ["custom precision", { ...common, mode: "custom", customLength: "5.88", colorCode: "ivory-white" }, "customLength"],
    ["unknown custom color", { ...common, mode: "custom", customLength: "5.8", colorCode: "black" }, "color"],
    ["missing installation", { ...common, mode: "standard", articleNumber: "GDHEPRD000172", installationMethod: "" }, "installationMethod"],
    ["unknown packaging", { ...common, mode: "standard", articleNumber: "GDHEPRD000172", basePackaging: "crate" }, "basePackaging"],
    ["unknown protection", { ...common, mode: "standard", articleNumber: "GDHEPRD000172", protectionArrangement: "both" }, "protectionArrangement"],
    ["fractional quantity", { ...common, mode: "standard", articleNumber: "GDHEPRD000172", quantity: "1.5" }, "quantity"],
    ["unsafe quantity", { ...common, mode: "standard", articleNumber: "GDHEPRD000172", quantity: "9007199254740992" }, "quantity"],
  ])("rejects %s with a closed field error", (_name, input, field) => {
    const result = buildProductConfigurationQuoteLine(configuration, input);
    expect(result).toMatchObject({ ok: false, errors: [{ field }] });
    expect(JSON.stringify(result)).not.toMatch(/payload|schema|wordpress|endpoint/i);
  });
});
