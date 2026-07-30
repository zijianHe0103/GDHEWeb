import "server-only";

import { ProductCardContractError } from "./errors";
import { validateProductCardCollectionSchema } from "./validation-registry";

const validatedProductCardBrand: unique symbol = Symbol(
  "ValidatedProductCardCollection",
);
const authenticCollections = new WeakSet<object>();

export type ValidatedProductCardCollection = {
  readonly kind: "success";
  readonly body: unknown;
  readonly [validatedProductCardBrand]: "success";
};

type ValidationFunction = ((
  input: unknown,
) => ValidatedProductCardCollection) & {
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
    throw new TypeError("ProductCard snapshot contains a non-JSON object.");
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
    throw new ProductCardContractError("invalid_success_payload");
  }
}

function createValidatedCollection(
  body: unknown,
): ValidatedProductCardCollection {
  const wrapper = Object.create(null) as ValidatedProductCardCollection;
  Object.defineProperties(wrapper, {
    kind: {
      enumerable: true,
      value: "success",
    },
    body: {
      get: () => body,
    },
    toJSON: {
      value: () => ({ kind: "success" }),
    },
    [validatedProductCardBrand]: {
      value: "success",
    },
  });
  authenticCollections.add(wrapper);
  return Object.freeze(wrapper);
}

function hasValidDetailActionTargets(snapshot: Record<string, unknown>): boolean {
  const items = snapshot.items as readonly Record<string, unknown>[];
  return items.every((item) => {
    if (item.kind !== "detail_product") {
      return true;
    }
    const action = item.action as Record<string, unknown>;
    return action.targetPath === item.publicPath;
  });
}

function getValidatedBody(input: unknown): unknown {
  if (
    typeof input !== "object" ||
    input === null ||
    !authenticCollections.has(input) ||
    (input as ValidatedProductCardCollection).kind !== "success"
  ) {
    throw new ProductCardContractError("invalid_success_payload");
  }
  return (input as ValidatedProductCardCollection).body;
}

function validateProductCardCollectionImplementation(
  input: unknown,
): ValidatedProductCardCollection {
  const snapshot = snapshotPayload(input);
  if (
    !isRecord(snapshot) ||
    snapshot.apiVersion !== "1" ||
    snapshot.schemaVersion !== "1.0.0"
  ) {
    throw new ProductCardContractError("unsupported_schema");
  }
  if (!validateProductCardCollectionSchema(snapshot)) {
    throw new ProductCardContractError("invalid_success_payload");
  }
  if (!hasValidDetailActionTargets(snapshot)) {
    throw new ProductCardContractError("invalid_success_payload");
  }
  return createValidatedCollection(snapshot);
}

Object.defineProperty(
  validateProductCardCollectionImplementation,
  "getValidatedBody",
  { value: getValidatedBody },
);

export const validateProductCardCollection =
  validateProductCardCollectionImplementation as ValidationFunction;
