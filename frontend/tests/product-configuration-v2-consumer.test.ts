import { describe, expect, test } from "vitest";

import sample from "../src/lib/cms/product-configuration-v2-contract/samples/success/fgd-x15-pvc.json";
import { adaptProductConfigurationV2 } from "../src/lib/cms/server/product-configurations-v2/adapter";
import { validateProductConfigurationV2 } from "../src/lib/cms/server/product-configurations-v2/validation";
import {
  projectTrackLengthChoices,
  projectColorChoices,
  resolveStandardOption,
} from "../src/lib/product-configuration/v2/choices";
import { buildProductConfigurationV2QuoteLine } from "../src/lib/product-configuration/v2/build-quote-line";

describe("Product Configuration 2.0.0 consumer", () => {
  test("accepts exact one-tenth full roots and rejects extra precision", () => {
    for (const lengthMeters of [4.3, 5.8, 6.7]) {
      const candidate = structuredClone(sample);
      candidate.articleNumberOptions[0]!.lengthMeters = lengthMeters;
      expect(() => validateProductConfigurationV2(candidate)).not.toThrow();
    }

    const invalid = structuredClone(sample);
    invalid.articleNumberOptions[0]!.lengthMeters = 6.05;
    expect(() => validateProductConfigurationV2(invalid)).toThrow(
      expect.objectContaining({
        kind: "invalid_success_payload",
      }),
    );
  });

  test("validates and adapts the frozen one-option handoff without Installation", () => {
    const dto = adaptProductConfigurationV2(validateProductConfigurationV2(sample));
    expect(projectTrackLengthChoices(dto)).toEqual([
      { kind: "standard", lengthMeters: 6, label: "6 m" },
      { kind: "custom", label: "Custom Length" },
    ]);
    expect(projectColorChoices(dto, { kind: "standard", lengthMeters: 6 })).toEqual([
      { code: "ivory-white", label: "Ivory White" },
    ]);
    expect(resolveStandardOption(dto, 6, "ivory-white")).toMatchObject({
      articleNumber: "GDHEPRD000172",
    });
    expect(JSON.stringify(dto)).not.toMatch(/installation/i);
    expect(Object.isFrozen(dto.options[0]?.color)).toBe(true);
  });

  test("builds resolved and custom QuoteLine 2.0.0 without Installation", () => {
    const dto = adaptProductConfigurationV2(validateProductConfigurationV2(sample));
    const standard=buildProductConfigurationV2QuoteLine(dto,{lengthChoice:"standard:6",colorCode:"ivory-white",basePackaging:"standard",logoPrinting:false,protectionArrangement:null,quantity:"2"});
    const custom=buildProductConfigurationV2QuoteLine(dto,{lengthChoice:"custom",customLength:"5.8",colorCode:"ivory-white",basePackaging:"carton",logoPrinting:true,protectionArrangement:"paired",quantity:"1"});
    expect(standard).toMatchObject({ok:true,line:{contractVersion:"2.0.0",selection:{type:"article_number",articleNumber:"GDHEPRD000172"}}});
    expect(custom).toMatchObject({ok:true,line:{selection:{type:"custom_length",articleNumber:null,resolution:"sales_follow_up"}}});
    expect(JSON.stringify([standard,custom])).not.toMatch(/installation/i);
  });

  test("fails closed for missing or ambiguous standard combinations and unsafe custom length", () => {
    const dto = adaptProductConfigurationV2(validateProductConfigurationV2(sample));
    const ambiguous={...dto,options:Object.freeze([...dto.options,{...dto.options[0]!,articleNumber:"GDHEPRD000173"}])};
    expect(resolveStandardOption(ambiguous,6,"ivory-white")).toBeUndefined();
    expect(buildProductConfigurationV2QuoteLine(dto,{lengthChoice:"standard:7",colorCode:"ivory-white",basePackaging:"standard",logoPrinting:false,protectionArrangement:null,quantity:"1"})).toMatchObject({ok:false});
    for(const customLength of ["9999999999999999.9",`${"9".repeat(400)}.9`]) expect(buildProductConfigurationV2QuoteLine(dto,{lengthChoice:"custom",customLength,colorCode:"ivory-white",basePackaging:"standard",logoPrinting:false,protectionArrangement:null,quantity:"1"})).toMatchObject({ok:false,errors:expect.arrayContaining([{field:"customLength",code:"invalid"}])});
  });
});
