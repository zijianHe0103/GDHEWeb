import "server-only";

import type { ProductConfigurationV2Dto } from "../../../types/product-configuration-v2";
import type { PublicProductConfiguratorViewModel } from "../../../types/product-configurator";
import { resolveStandardOption } from "./choices";

const basePackagingLabels = {
  standard: "Standard Packaging",
  carton: "Carton Packaging",
  large_shrink_wrap: "Large Shrink Wrap",
} as const;

const basePackagingKeys = {
  standard: "standard-packaging",
  carton: "carton-packaging",
  large_shrink_wrap: "large-shrink-wrap",
} as const;

const protectionLabels = {
  single_bag: "Single-piece Bagging",
  paired: "Paired Interlocking",
} as const;

const protectionKeys = {
  single_bag: "single-piece-bagging",
  paired: "paired-interlocking",
} as const;

export function projectPublicProductConfigurator(
  configuration: ProductConfigurationV2Dto,
): PublicProductConfiguratorViewModel {
  const standardOptions = configuration.options.map((option) => {
    if (
      resolveStandardOption(
        configuration,
        option.lengthMeters,
        option.color.code,
      ) !== option
    ) {
      throw new Error("Product configuration option identity is ambiguous.");
    }
    return Object.freeze({
      articleNumber: option.articleNumber,
      lengthMeters: option.lengthMeters,
      color: Object.freeze({ ...option.color }),
    });
  });

  return Object.freeze({
    product: Object.freeze({
      model: configuration.product.model,
      publicPath: configuration.product.publicPath,
      quantityUnit: configuration.product.quantityUnit,
    }),
    standardOptions: Object.freeze(standardOptions),
    packaging: Object.freeze({
      baseOptions: Object.freeze(
        configuration.packaging.baseOptions.map((option) =>
          Object.freeze({
            key: basePackagingKeys[option],
            label: basePackagingLabels[option],
          }),
        ),
      ),
      logoPrintingAvailable: configuration.packaging.logoPrintingAvailable,
      protectionOptions: Object.freeze(
        configuration.packaging.protectionOptions.map((option) =>
          Object.freeze({
            key: protectionKeys[option],
            label: protectionLabels[option],
          }),
        ),
      ),
    }),
    customLength: Object.freeze({
      enabled: configuration.customLength.enabled,
      minimumExclusive: configuration.customLength.minimumExclusive,
      maximum: configuration.customLength.maximum,
      decimalPlaces: configuration.customLength.decimalPlaces,
    }),
  });
}
