import "server-only";

import { CmsContractError } from "./errors";
import { validateErrorSchema, validatePageSchema } from "./registry";

export { CmsContractError } from "./errors";
export type { CmsContractErrorKind } from "./errors";

const validatedPayloadBrand: unique symbol = Symbol("ValidatedCmsPayload");

type ValidatedCmsPayloadKind = "success" | "error";

export type ValidatedCmsPayload<
  Kind extends ValidatedCmsPayloadKind = ValidatedCmsPayloadKind,
> = {
  readonly kind: Kind;
  readonly body: unknown;
  readonly [validatedPayloadBrand]: Kind;
};

function createValidatedPayload<Kind extends ValidatedCmsPayloadKind>(
  kind: Kind,
  body: unknown,
): ValidatedCmsPayload<Kind> {
  const wrapper = Object.create(null) as ValidatedCmsPayload<Kind>;
  Object.defineProperties(wrapper, {
    kind: {
      enumerable: true,
      value: kind,
    },
    body: {
      get: () => body,
    },
    toJSON: {
      value: () => ({ kind }),
    },
    [validatedPayloadBrand]: {
      value: kind,
    },
  });
  return Object.freeze(wrapper);
}

export function validateCmsSuccessPayload(
  input: unknown,
): ValidatedCmsPayload<"success"> {
  const snapshot = snapshotPayload(input, "invalid_success_payload");
  if (
    !isRecord(snapshot) ||
    snapshot.apiVersion !== "1" ||
    snapshot.schemaVersion !== "3.0.0"
  ) {
    throw new CmsContractError("unsupported_schema");
  }
  if (!validatePageSchema(snapshot)) {
    throw new CmsContractError("invalid_success_payload");
  }

  return createValidatedPayload("success", snapshot);
}

export function validateCmsErrorPayload(
  input: unknown,
): ValidatedCmsPayload<"error"> {
  const snapshot = snapshotPayload(input, "invalid_error_payload");
  if (!isRecord(snapshot) || snapshot.apiVersion !== "1") {
    throw new CmsContractError("unsupported_schema");
  }
  if (!validateErrorSchema(snapshot)) {
    throw new CmsContractError("invalid_error_payload");
  }

  return createValidatedPayload("error", snapshot);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function snapshotPayload(
  input: unknown,
  errorKind: "invalid_success_payload" | "invalid_error_payload",
): unknown {
  try {
    return deepFreeze(structuredClone(input));
  } catch {
    throw new CmsContractError(errorKind);
  }
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
    throw new TypeError("CMS payload snapshot contains a non-JSON object.");
  }

  seen.add(value);
  for (const child of Object.values(value)) {
    deepFreeze(child, seen);
  }
  return Object.freeze(value);
}
