import type { QuoteLine } from "../quote-contract";
import type { ProductConfigurationDto } from "../../types/product-configuration";

export type ProductConfigurationFormValues = Readonly<{
  mode: string;
  articleNumber?: string;
  customLength?: string;
  colorCode?: string;
  installationMethod: string;
  basePackaging: string;
  logoPrinting: boolean;
  protectionArrangement: string | null;
  quantity: string;
}>;

export type ProductConfigurationField =
  | "selection"
  | "customLength"
  | "color"
  | "installationMethod"
  | "basePackaging"
  | "logoPrinting"
  | "protectionArrangement"
  | "quantity";

export type ProductConfigurationBuildResult =
  | Readonly<{ ok: true; line: QuoteLine }>
  | Readonly<{
      ok: false;
      errors: readonly Readonly<{
        field: ProductConfigurationField;
        code: "invalid";
      }>[];
    }>;

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

function parseCustomLength(value: unknown): number | undefined {
  if (
    typeof value !== "string" ||
    !/^(?:[1-9]\d*)(?:\.\d)?$|^0\.[1-9]$/.test(value)
  ) {
    return undefined;
  }
  const [whole, fraction = "0"] = value.split(".");
  const tenths = Number(`${whole}${fraction}`);
  if (!Number.isSafeInteger(tenths) || tenths < 1) {
    return undefined;
  }
  const length = tenths / 10;
  return Number.isFinite(length) && length * 10 === tenths
    ? length
    : undefined;
}

export function buildProductConfigurationQuoteLine(
  configuration: ProductConfigurationDto,
  values: ProductConfigurationFormValues,
): ProductConfigurationBuildResult {
  const errors: Array<Readonly<{ field: ProductConfigurationField; code: "invalid" }>> = [];
  const addError = (field: ProductConfigurationField) => {
    errors.push(Object.freeze({ field, code: "invalid" }));
  };

  const standardOption = values.mode === "standard"
    ? configuration.options.find(
        (option) => option.articleNumber === values.articleNumber,
      )
    : undefined;
  const customLength = values.mode === "custom"
    ? parseCustomLength(values.customLength)
    : undefined;
  const customColor = values.mode === "custom"
    ? configuration.options.find(
        (option) => option.color.code === values.colorCode,
      )?.color
    : undefined;

  if (values.mode === "standard" && !standardOption) addError("selection");
  if (values.mode === "custom" && customLength === undefined) addError("customLength");
  if (values.mode === "custom" && !customColor) addError("color");
  if (values.mode !== "standard" && values.mode !== "custom") addError("selection");

  const installation = configuration.installationMethods.find(
    (candidate) => candidate.method === values.installationMethod,
  );
  if (!installation) addError("installationMethod");

  const basePackaging = configuration.packaging.baseOptions.find(
    (candidate) => candidate === values.basePackaging,
  );
  if (!basePackaging) addError("basePackaging");
  if (typeof values.logoPrinting !== "boolean") addError("logoPrinting");

  const protection = values.protectionArrangement === null
    ? null
    : configuration.packaging.protectionOptions.find(
        (candidate) => candidate === values.protectionArrangement,
      );
  if (protection === undefined) addError("protectionArrangement");

  const quantity = /^\d+$/.test(values.quantity) ? Number(values.quantity) : NaN;
  if (!Number.isSafeInteger(quantity) || quantity < 1) addError("quantity");

  if (errors.length > 0 || !installation || !basePackaging || protection === undefined) {
    return Object.freeze({ ok: false, errors: Object.freeze(errors) });
  }

  const selection: QuoteLine["selection"] = standardOption
    ? {
        type: "article_number",
        articleNumber: standardOption.articleNumber,
        lengthMeters: standardOption.lengthMeters,
        color: { ...standardOption.color },
      }
    : {
        type: "custom_length",
        articleNumber: null,
        lengthMeters: customLength as number,
        color: { ...(customColor as NonNullable<typeof customColor>) },
        resolution: configuration.customLength.resolution,
      };

  const line: QuoteLine = deepFreeze({
      contractVersion: "1.0.0",
      product: {
        id: configuration.product.id,
        model: configuration.product.model,
        publicPath: configuration.product.publicPath,
      },
      selection,
      configuration: {
        installationMethod: installation.method,
        packaging: {
          basePackaging,
          logoPrinting: values.logoPrinting,
          protectionArrangement: protection,
        },
      },
      quantityUnit: configuration.product.quantityUnit,
      quantity,
    });
  return Object.freeze({ ok: true, line });
}
