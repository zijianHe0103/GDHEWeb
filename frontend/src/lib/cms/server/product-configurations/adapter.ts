import "server-only";

import type { ProductConfigurationDto } from "../../../../types/product-configuration";
import {
  validateProductConfiguration,
  type ValidatedProductConfiguration,
} from "./validation";

type ProductConfigurationView = {
  product: ProductConfigurationDto["product"];
  articleNumberOptions: ProductConfigurationDto["options"];
  configurationPolicy: {
    installationMethods: readonly Readonly<{
      method: "ceiling" | "wall";
      changesTrackArticleNumber: false;
    }>[];
    packaging: {
      basePackaging: { options: ProductConfigurationDto["packaging"]["baseOptions"] };
      logoPrinting: { available: true };
      protectionArrangement: {
        options: ProductConfigurationDto["packaging"]["protectionOptions"];
      };
    };
    customLength: {
      enabled: true;
      minimumExclusive: 0;
      maximum: null;
      decimalPlaces: 1;
      articleNumberResolution: "sales_follow_up";
    };
  };
};

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const child of Object.values(value)) {
    deepFreeze(child, seen);
  }
  return Object.freeze(value);
}

export function adaptProductConfiguration(
  validated: ValidatedProductConfiguration,
): ProductConfigurationDto {
  const body = validateProductConfiguration.getValidatedBody(
    validated,
  ) as ProductConfigurationView;

  return deepFreeze({
    product: structuredClone(body.product),
    options: structuredClone(body.articleNumberOptions),
    installationMethods: body.configurationPolicy.installationMethods.map(
      ({ method, changesTrackArticleNumber }) => ({
        method,
        changesTrackArticleNumber,
      }),
    ),
    packaging: {
      baseOptions: structuredClone(
        body.configurationPolicy.packaging.basePackaging.options,
      ),
      logoPrintingAvailable:
        body.configurationPolicy.packaging.logoPrinting.available,
      protectionOptions: structuredClone(
        body.configurationPolicy.packaging.protectionArrangement.options,
      ),
    },
    customLength: {
      enabled: body.configurationPolicy.customLength.enabled,
      minimumExclusive:
        body.configurationPolicy.customLength.minimumExclusive,
      maximum: body.configurationPolicy.customLength.maximum,
      decimalPlaces: body.configurationPolicy.customLength.decimalPlaces,
      resolution:
        body.configurationPolicy.customLength.articleNumberResolution,
    },
  });
}
