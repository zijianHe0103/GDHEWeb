import "server-only";

import type { ProductConfigurationV2Dto } from "../../../../types/product-configuration-v2";
import { validateProductConfigurationV2, type ValidatedProductConfigurationV2 } from "./validation";

function freeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value); for (const child of Object.values(value)) freeze(child, seen); return Object.freeze(value);
}

export function adaptProductConfigurationV2(validated: ValidatedProductConfigurationV2): ProductConfigurationV2Dto {
  const body = validateProductConfigurationV2.getValidatedBody(validated) as {
    product: ProductConfigurationV2Dto["product"];
    articleNumberOptions: ProductConfigurationV2Dto["options"];
    configurationPolicy: {
      packaging: {
        basePackaging: { options: ProductConfigurationV2Dto["packaging"]["baseOptions"] };
        logoPrinting: { available: true };
        protectionArrangement: { options: ProductConfigurationV2Dto["packaging"]["protectionOptions"] };
      };
    };
  };
  return freeze({
    product: structuredClone(body.product),
    options: structuredClone(body.articleNumberOptions),
    packaging: { baseOptions: structuredClone(body.configurationPolicy.packaging.basePackaging.options), logoPrintingAvailable: body.configurationPolicy.packaging.logoPrinting.available, protectionOptions: structuredClone(body.configurationPolicy.packaging.protectionArrangement.options) },
    customLength: { enabled: true, minimumExclusive: 0, maximum: null, decimalPlaces: 1, resolution: "sales_follow_up" },
  });
}
