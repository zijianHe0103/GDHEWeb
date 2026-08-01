import "server-only";

import { validateProductConfigurationSchema } from "./validation-registry";

export type ProductConfigurationContractErrorKind =
  | "unsupported_schema"
  | "invalid_success_payload";

export class ProductConfigurationContractError extends Error {
  readonly category = "contract";

  constructor(readonly kind: ProductConfigurationContractErrorKind) {
    super("Product Configuration payload did not satisfy the supported contract.");
    this.name = "ProductConfigurationContractError";
  }
}

const validatedConfigurationBrand: unique symbol = Symbol(
  "ValidatedProductConfiguration",
);
const authenticConfigurations = new WeakSet<object>();

export type ValidatedProductConfiguration = {
  readonly kind: "success";
  readonly body: unknown;
  readonly [validatedConfigurationBrand]: "success";
};

type ValidationFunction = ((
  input: unknown,
) => ValidatedProductConfiguration) & {
  readonly getValidatedBody: (input: unknown) => unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepFreeze(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    throw new TypeError("Product Configuration snapshot is not JSON data.");
  }
  seen.add(value);
  for (const child of Object.values(value)) {
    deepFreeze(child, seen);
  }
  return Object.freeze(value);
}

function snapshotPayload(input: unknown): unknown {
  try {
    return deepFreeze(structuredClone(input));
  } catch {
    throw new ProductConfigurationContractError("invalid_success_payload");
  }
}

function hasFrozenFgdSemantics(snapshot: Record<string, unknown>): boolean {
  const product = snapshot.product as Record<string, unknown>;
  const options = snapshot.articleNumberOptions as Array<Record<string, unknown>>;
  const policy = snapshot.configurationPolicy as Record<string, unknown>;
  const methods = policy.installationMethods as Array<Record<string, unknown>>;
  const articleNumbers = options.map((option) => option.articleNumber as string);

  return (
    product.model === "FGD X15+PVC" &&
    product.name === "FGD X15+PVC Track" &&
    product.publicPath === "/products/fgd-x15-pvc/" &&
    product.productKind === "curtain_track" &&
    product.quantityUnit === "piece" &&
    new Set(articleNumbers).size === articleNumbers.length &&
    articleNumbers.every(
      (value, index) => index === 0 || articleNumbers[index - 1] < value,
    ) &&
    methods.every((method) => method.optionalAccessory === null)
  );
}

function createValidatedConfiguration(
  body: unknown,
): ValidatedProductConfiguration {
  const wrapper = Object.create(null) as ValidatedProductConfiguration;
  Object.defineProperties(wrapper, {
    kind: { enumerable: true, value: "success" },
    body: { get: () => body },
    toJSON: { value: () => ({ kind: "success" }) },
    [validatedConfigurationBrand]: { value: "success" },
  });
  authenticConfigurations.add(wrapper);
  return Object.freeze(wrapper);
}

function getValidatedBody(input: unknown): unknown {
  if (
    typeof input !== "object" ||
    input === null ||
    !authenticConfigurations.has(input) ||
    (input as ValidatedProductConfiguration).kind !== "success"
  ) {
    throw new ProductConfigurationContractError("invalid_success_payload");
  }
  return (input as ValidatedProductConfiguration).body;
}

function validateProductConfigurationImplementation(
  input: unknown,
): ValidatedProductConfiguration {
  const snapshot = snapshotPayload(input);
  if (
    !isRecord(snapshot) ||
    snapshot.apiVersion !== "1" ||
    snapshot.schemaVersion !== "1.0.0"
  ) {
    throw new ProductConfigurationContractError("unsupported_schema");
  }
  if (
    !validateProductConfigurationSchema(snapshot) ||
    !hasFrozenFgdSemantics(snapshot)
  ) {
    throw new ProductConfigurationContractError("invalid_success_payload");
  }
  return createValidatedConfiguration(snapshot);
}

Object.defineProperty(
  validateProductConfigurationImplementation,
  "getValidatedBody",
  { value: getValidatedBody },
);

export const validateProductConfiguration =
  validateProductConfigurationImplementation as ValidationFunction;
