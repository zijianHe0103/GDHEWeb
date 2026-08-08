import "server-only";

import { RelatedProductCardContractError } from "./errors";
import { validateRelatedProductCardCollectionSchema } from "./validation-registry";

const brand: unique symbol = Symbol("ValidatedRelatedProductCardCollection");
const authentic = new WeakSet<object>();

export type ValidatedRelatedProductCardCollection = {
  readonly kind: "success";
  readonly body: unknown;
  readonly [brand]: "success";
};

type Validator = ((input: unknown) => ValidatedRelatedProductCardCollection) & {
  readonly getValidatedBody: (input: unknown) => unknown;
};

function deepFreeze(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    throw new TypeError("RelatedProductCard snapshot contains a non-JSON object.");
  }
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function snapshotPayload(input: unknown): unknown {
  try {
    return deepFreeze(structuredClone(input));
  } catch {
    throw new RelatedProductCardContractError("invalid_success_payload");
  }
}

function createWrapper(body: unknown): ValidatedRelatedProductCardCollection {
  const wrapper = Object.create(null) as ValidatedRelatedProductCardCollection;
  Object.defineProperties(wrapper, {
    kind: { enumerable: true, value: "success" },
    body: { get: () => body },
    toJSON: { value: () => ({ kind: "success" }) },
    [brand]: { value: "success" },
  });
  authentic.add(wrapper);
  return Object.freeze(wrapper);
}

function getValidatedBody(input: unknown): unknown {
  if (
    typeof input !== "object" ||
    input === null ||
    !authentic.has(input) ||
    (input as ValidatedRelatedProductCardCollection).kind !== "success"
  ) {
    throw new RelatedProductCardContractError("invalid_success_payload");
  }
  return (input as ValidatedRelatedProductCardCollection).body;
}

function validateImplementation(
  input: unknown,
): ValidatedRelatedProductCardCollection {
  const snapshot = snapshotPayload(input);
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    (snapshot as Record<string, unknown>).apiVersion !== "1" ||
    (snapshot as Record<string, unknown>).schemaVersion !== "1.0.0"
  ) {
    throw new RelatedProductCardContractError("unsupported_schema");
  }
  if (!validateRelatedProductCardCollectionSchema(snapshot)) {
    throw new RelatedProductCardContractError("invalid_success_payload");
  }
  if (!hasSemanticIntegrity(snapshot as Record<string, unknown>)) {
    throw new RelatedProductCardContractError("invalid_success_payload");
  }
  return createWrapper(snapshot);
}

function hasSemanticIntegrity(snapshot: Record<string, unknown>): boolean {
  const items = snapshot.items as readonly Record<string, unknown>[];
  const ids = new Set<string>();
  for (const item of items) {
    const card = item.card as Record<string, unknown>;
    const id = card.id as string;
    if (ids.has(id)) return false;
    ids.add(id);
    if (card.kind === "detail_product") {
      const action = card.action as Record<string, unknown>;
      if (action.targetPath !== card.publicPath || item.directQuote !== null) {
        return false;
      }
    }
  }
  return true;
}

Object.defineProperty(validateImplementation, "getValidatedBody", {
  value: getValidatedBody,
});

export const validateRelatedProductCardCollection =
  validateImplementation as Validator;
