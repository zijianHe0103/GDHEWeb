import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import commonSchema from "../../rfq-submission-contract/v2/schemas/common.v2.schema.json";
import errorSchema from "../../rfq-submission-contract/v2/schemas/public-rfq-error.v2.schema.json";
import receiptSchema from "../../rfq-submission-contract/v2/schemas/public-rfq-receipt.v2.schema.json";

export type PublicRfqErrorCode =
  | "invalid_request"
  | "invalid_submission_intent"
  | "request_not_allowed"
  | "challenge_required_or_invalid"
  | "rate_limited"
  | "unsupported_media_type"
  | "payload_too_large"
  | "basket_too_large_to_submit"
  | "invalid_customer_fields"
  | "invalid_line_count"
  | "invalid_quantity"
  | "basket_refresh_required"
  | "product_unavailable"
  | "configuration_changed"
  | "idempotency_conflict"
  | "service_temporarily_unavailable";

export type PublicRfqFieldError = Readonly<{
  field: string;
  code: string;
}>;

export type PublicRfqResponseDto =
  | Readonly<{
      kind: "receipt";
      status: "accepted" | "processing";
      publicReference: string;
      lineCount: number;
      retryAfterSeconds?: number;
    }>
  | Readonly<{
      kind: "error";
      code: PublicRfqErrorCode;
      fieldErrors?: readonly PublicRfqFieldError[];
      retryAfterSeconds?: number;
    }>;

type ReceiptSnapshot = Readonly<{
  schemaVersion: "3.0.0";
  revision: number;
  writerId: string;
  mutationId: string;
  updatedAt: string;
  expiresAt: string;
}>;

type ReceiptMaterial = Readonly<{
  status: "accepted" | "processing";
  snapshot: ReceiptSnapshot;
  token: string;
}>;

export class RfqPublicResponseError extends Error {
  readonly category = "public_response" as const;
  readonly kind = "invalid_response" as const;

  constructor() {
    super("The RFQ response could not be used.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqPublicResponseError",
    });
  }
}

const ajv = new Ajv2020({
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
  validateFormats: true,
});
addFormats(ajv, ["date-time"]);
ajv.addSchema(commonSchema);
ajv.addSchema(receiptSchema);
ajv.addSchema(errorSchema);

function requireValidator(name: string): ValidateFunction<unknown> {
  const validator = ajv.getSchema(name);
  if (!validator) throw new Error("RFQ public response Schema failed to compile.");
  return validator;
}

const validateReceipt = requireValidator("public-rfq-receipt.v2.schema.json");
const validateError = requireValidator("public-rfq-error.v2.schema.json");
const receiptMaterials = new WeakMap<object, ReceiptMaterial>();
const snapshotKeys = [
  "schemaVersion",
  "revision",
  "writerId",
  "mutationId",
  "updatedAt",
  "expiresAt",
] as const;

const errorStatuses: Readonly<Record<PublicRfqErrorCode, number>> = Object.freeze({
  invalid_request: 400,
  invalid_submission_intent: 403,
  request_not_allowed: 403,
  challenge_required_or_invalid: 403,
  rate_limited: 429,
  unsupported_media_type: 415,
  payload_too_large: 413,
  basket_too_large_to_submit: 422,
  invalid_customer_fields: 422,
  invalid_line_count: 422,
  invalid_quantity: 422,
  basket_refresh_required: 409,
  product_unavailable: 409,
  configuration_changed: 409,
  idempotency_conflict: 409,
  service_temporarily_unavailable: 503,
});

const allowedFields: Readonly<Record<string, ReadonlySet<string>>> = Object.freeze({
  invalid_customer_fields: new Set([
    "fullName",
    "companyName",
    "whatsApp",
    "weChat",
    "businessEmail",
    "phone",
    "countryRegion",
    "city",
    "companyWebsite",
    "message",
    "contactMethods",
    "privacyNotice",
  ]),
  invalid_line_count: new Set(["lineCount"]),
  invalid_quantity: new Set(["quantity"]),
  basket_refresh_required: new Set(["basket"]),
  product_unavailable: new Set(["selection"]),
  configuration_changed: new Set(["selection", "packaging"]),
});

const allowedCodes: Readonly<Record<string, ReadonlySet<string>>> = Object.freeze({
  invalid_line_count: new Set(["invalid"]),
  invalid_quantity: new Set(["invalid"]),
  basket_refresh_required: new Set(["expired", "changed", "unavailable"]),
  product_unavailable: new Set(["unavailable"]),
  configuration_changed: new Set(["changed", "unavailable"]),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function receiptSnapshot(value: unknown): ReceiptSnapshot | null {
  try {
    if (!isRecord(value)) return null;
    const keys = Reflect.ownKeys(value);
    if (
      keys.some((key) => typeof key !== "string") ||
      keys.length !== snapshotKeys.length ||
      snapshotKeys.some((key) => !keys.includes(key))
    ) return null;
    const snapshot = Object.create(null) as Record<string, unknown>;
    for (const key of snapshotKeys) {
      const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) return null;
      snapshot[key] = descriptor.value;
    }
    if (
      snapshot.schemaVersion !== "3.0.0" ||
      !Number.isSafeInteger(snapshot.revision) ||
      (snapshot.revision as number) < 1 ||
      typeof snapshot.writerId !== "string" ||
      typeof snapshot.mutationId !== "string" ||
      typeof snapshot.updatedAt !== "string" ||
      typeof snapshot.expiresAt !== "string"
    ) return null;
    return Object.freeze({
      schemaVersion: "3.0.0",
      revision: snapshot.revision as number,
      writerId: snapshot.writerId,
      mutationId: snapshot.mutationId,
      updatedAt: snapshot.updatedAt,
      expiresAt: snapshot.expiresAt,
    });
  } catch {
    return null;
  }
}

function assertErrorSemantics(document: Record<string, unknown>): void {
  if (!isRecord(document.error)) throw new TypeError("invalid error");
  const { code, messageKey, fieldErrors, retryAfterSeconds } = document.error;
  if (typeof code !== "string" || messageKey !== `rfq.error.${code}`) {
    throw new TypeError("invalid error semantics");
  }
  if ((code === "rate_limited") !== (retryAfterSeconds !== undefined)) {
    throw new TypeError("invalid retry semantics");
  }
  const fields = allowedFields[code];
  if (!fields) {
    if (fieldErrors !== undefined) throw new TypeError("unexpected field errors");
    return;
  }
  if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
    throw new TypeError("missing field errors");
  }
  for (const item of fieldErrors) {
    if (!isRecord(item) || !fields.has(String(item.field))) {
      throw new TypeError("invalid field error");
    }
    const codes = allowedCodes[code];
    if (codes && !codes.has(String(item.code))) {
      throw new TypeError("invalid field error code");
    }
  }
}

function receiptDto(document: Record<string, unknown>): PublicRfqResponseDto {
  const status = document.status as "accepted" | "processing";
  const snapshot = receiptSnapshot(document.submittedBasketSnapshot);
  const token = document.submittedBasketToken;
  if (!snapshot || typeof token !== "string") {
    throw new TypeError("invalid receipt material");
  }
  const result = Object.freeze({
    kind: "receipt" as const,
    status,
    publicReference: document.publicReference as string,
    lineCount: document.lineCount as number,
    ...(status === "processing"
      ? { retryAfterSeconds: document.retryAfterSeconds as number }
      : {}),
  });
  receiptMaterials.set(result, Object.freeze({ status, snapshot, token }));
  return result;
}

function errorDto(document: Record<string, unknown>): PublicRfqResponseDto {
  const error = document.error as Record<string, unknown>;
  const fieldErrors = Array.isArray(error.fieldErrors)
    ? Object.freeze(error.fieldErrors.map((item) => {
        const fieldError = item as Record<string, unknown>;
        return Object.freeze({
          field: fieldError.field as string,
          code: fieldError.code as string,
        });
      }))
    : undefined;
  return Object.freeze({
    kind: "error" as const,
    code: error.code as PublicRfqErrorCode,
    ...(fieldErrors ? { fieldErrors } : {}),
    ...(error.retryAfterSeconds !== undefined
      ? { retryAfterSeconds: error.retryAfterSeconds as number }
      : {}),
  });
}

export function parsePublicRfqResponse(
  status: unknown,
  contentType: unknown,
  bodyText: unknown,
): PublicRfqResponseDto {
  try {
    if (
      typeof status !== "number" ||
      !Number.isInteger(status) ||
      typeof contentType !== "string" ||
      !/^application\/json(?:;\s*charset=utf-8)?$/i.test(contentType) ||
      typeof bodyText !== "string" ||
      new TextEncoder().encode(bodyText).byteLength > 262_144
    ) throw new TypeError("invalid response boundary");
    const document: unknown = JSON.parse(bodyText);
    if (!isRecord(document) || document.contractVersion !== "2.0.0") {
      throw new TypeError("invalid response body");
    }
    if (status === 200 || status === 201 || status === 202) {
      if (!validateReceipt(document)) throw new TypeError("invalid receipt");
      if (
        (document.status === "accepted" && status !== 200 && status !== 201) ||
        (document.status === "processing" && status !== 202)
      ) throw new TypeError("receipt status mismatch");
      return receiptDto(document);
    }
    if (!validateError(document)) throw new TypeError("invalid public error");
    assertErrorSemantics(document);
    const code = (document.error as Record<string, unknown>).code as PublicRfqErrorCode;
    if (errorStatuses[code] !== status) throw new TypeError("error status mismatch");
    return errorDto(document);
  } catch {
    throw new RfqPublicResponseError();
  }
}

export function matchesValidatedAcceptedRfqReceipt(
  response: unknown,
  submittedSnapshot: unknown,
  computedToken: unknown,
): boolean {
  try {
    if (typeof response !== "object" || response === null) return false;
    const material = receiptMaterials.get(response);
    if (
      !material ||
      material.status !== "accepted" ||
      typeof computedToken !== "string" ||
      material.token !== computedToken
    ) return false;
    const submitted = receiptSnapshot(submittedSnapshot);
    return submitted !== null && snapshotKeys.every(
      (key) => submitted[key] === material.snapshot[key],
    );
  } catch {
    return false;
  }
}
