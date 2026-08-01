import { describe, expect, it } from "vitest";

import sample from "../src/lib/cms/product-configuration-contract/samples/success/fgd-x15-pvc.json";
import { adaptProductConfiguration } from "../src/lib/cms/server/product-configurations/adapter";
import {
  ProductConfigurationContractError,
  validateProductConfiguration,
} from "../src/lib/cms/server/product-configurations/validation";

describe("Product Configuration Adapter", () => {
  it("copies only the public configurator fields into a deeply frozen DTO", () => {
    const dto = adaptProductConfiguration(validateProductConfiguration(sample));

    expect(dto).toEqual({
      product: sample.product,
      options: sample.articleNumberOptions,
      installationMethods: sample.configurationPolicy.installationMethods.map(
        ({ method, changesTrackArticleNumber }) => ({
          method,
          changesTrackArticleNumber,
        }),
      ),
      packaging: {
        baseOptions: sample.configurationPolicy.packaging.basePackaging.options,
        logoPrintingAvailable:
          sample.configurationPolicy.packaging.logoPrinting.available,
        protectionOptions:
          sample.configurationPolicy.packaging.protectionArrangement.options,
      },
      customLength: {
        enabled: sample.configurationPolicy.customLength.enabled,
        minimumExclusive:
          sample.configurationPolicy.customLength.minimumExclusive,
        maximum: sample.configurationPolicy.customLength.maximum,
        decimalPlaces: sample.configurationPolicy.customLength.decimalPlaces,
        resolution:
          sample.configurationPolicy.customLength.articleNumberResolution,
      },
    });
    expect(JSON.stringify(dto)).not.toContain("modifiedAt");
    expect(JSON.stringify(dto)).not.toContain("optionalAccessory");
    expect(Object.isFrozen(dto)).toBe(true);
    expect(Object.isFrozen(dto.options)).toBe(true);
    expect(Object.isFrozen(dto.options[0].color)).toBe(true);
    expect(Object.isFrozen(dto.packaging.baseOptions)).toBe(true);
  });

  it("rejects raw, forged and copied wrappers", () => {
    const runtimeAdapter = adaptProductConfiguration as (input: unknown) => unknown;
    const authentic = validateProductConfiguration(sample);

    for (const input of [sample, { kind: "success", body: sample }, { ...authentic }]) {
      expect(() => runtimeAdapter(input)).toThrowError(
        ProductConfigurationContractError,
      );
    }
  });
});
