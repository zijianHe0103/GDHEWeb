import type {
  PublicProductConfiguratorField,
  PublicProductConfiguratorFormValues,
  PublicProductConfiguratorViewModel,
  PublicQuoteDraft,
} from "../../../types/product-configurator";

export type PublicProductConfiguratorBuildResult =
  | Readonly<{ ok: true; draft: PublicQuoteDraft }>
  | Readonly<{
      ok: false;
      errors: readonly Readonly<{
        field: PublicProductConfiguratorField;
        code: "invalid";
      }>[];
    }>;

export type PublicTrackLengthChoice =
  | Readonly<{ kind: "standard"; lengthMeters: number; label: string }>
  | Readonly<{ kind: "custom"; label: "Custom Length" }>;

export type PublicTrackLengthSelection =
  | Readonly<{ kind: "standard"; lengthMeters: number }>
  | Readonly<{ kind: "custom" }>;

export function projectPublicTrackLengthChoices(
  configuration: PublicProductConfiguratorViewModel,
): readonly PublicTrackLengthChoice[] {
  const lengths = [
    ...new Set(
      configuration.standardOptions.map(({ lengthMeters }) => lengthMeters),
    ),
  ].sort((left, right) => left - right);
  return Object.freeze([
    ...lengths.map((lengthMeters) =>
      Object.freeze({
        kind: "standard" as const,
        lengthMeters,
        label: `${lengthMeters} m`,
      }),
    ),
    Object.freeze({ kind: "custom" as const, label: "Custom Length" as const }),
  ]);
}

export function projectPublicColorChoices(
  configuration: PublicProductConfiguratorViewModel,
  selection: PublicTrackLengthSelection,
): readonly Readonly<{ code: string; label: string }>[] {
  const options =
    selection.kind === "custom"
      ? configuration.standardOptions
      : configuration.standardOptions.filter(
          ({ lengthMeters }) => lengthMeters === selection.lengthMeters,
        );
  const colors = new Map(options.map(({ color }) => [color.code, color]));
  return Object.freeze(
    [...colors.values()]
      .sort(
        (left, right) =>
          left.label.localeCompare(right.label) ||
          left.code.localeCompare(right.code),
      )
      .map((color) => Object.freeze({ ...color })),
  );
}

export function buildPublicProductConfiguratorDraft(
  configuration: PublicProductConfiguratorViewModel,
  values: PublicProductConfiguratorFormValues,
): PublicProductConfiguratorBuildResult {
  const errors: Array<
    Readonly<{ field: PublicProductConfiguratorField; code: "invalid" }>
  > = [];
  const add = (field: PublicProductConfiguratorField) =>
    errors.push(Object.freeze({ field, code: "invalid" }));
  const custom = values.lengthChoice === "custom";
  const standardMatch = /^standard:(\d+(?:\.\d)?)$/.exec(values.lengthChoice);
  const length = custom
    ? parseCustomLength(values.customLength)
    : standardMatch
      ? Number(standardMatch[1])
      : undefined;

  if (!custom && !standardMatch) add("selection");
  if (custom && length === undefined) add("customLength");

  const colors =
    length === undefined
      ? []
      : projectPublicColorChoices(
          configuration,
          custom ? { kind: "custom" } : { kind: "standard", lengthMeters: length },
        );
  const color = colors.find((candidate) => candidate.code === values.colorCode);
  if (!color) add("color");

  const standardOption =
    !custom && length !== undefined && color
      ? configuration.standardOptions.find(
          (option) =>
            option.lengthMeters === length && option.color.code === color.code,
        )
      : undefined;
  if (!custom && standardMatch && !standardOption) add("selection");

  const basePackaging = configuration.packaging.baseOptions.find(
    (candidate) => candidate.key === values.basePackaging,
  );
  if (!basePackaging) add("basePackaging");

  const protectionArrangement =
    values.protectionArrangement === null
      ? null
      : configuration.packaging.protectionOptions.find(
          (candidate) => candidate.key === values.protectionArrangement,
        );
  if (protectionArrangement === undefined) add("protectionArrangement");

  const quantity = /^[1-9]\d*$/.test(values.quantity)
    ? Number(values.quantity)
    : Number.NaN;
  if (!Number.isSafeInteger(quantity) || quantity < 1) add("quantity");

  if (
    errors.length ||
    length === undefined ||
    !color ||
    !basePackaging ||
    protectionArrangement === undefined
  ) {
    return deepFreeze({ ok: false, errors });
  }

  return deepFreeze({
    ok: true,
    draft: {
      product: {
        model: configuration.product.model,
        publicPath: configuration.product.publicPath,
      },
      selection: {
        type: custom ? "custom" : "standard",
        lengthMeters: length,
        color: { ...color },
      },
      packaging: {
        basePackaging: { label: basePackaging.label },
        logoPrinting: values.logoPrinting,
        protectionArrangement:
          protectionArrangement === null
            ? null
            : { label: protectionArrangement.label },
      },
      quantityUnit: configuration.product.quantityUnit,
      quantity,
    },
  });
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
  if (!Number.isSafeInteger(tenths) || tenths < 1) return undefined;
  const result = tenths / 10;
  return Number.isFinite(result) && result * 10 === tenths ? result : undefined;
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}
