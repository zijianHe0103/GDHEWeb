import "server-only";

import { types as nodeTypes } from "node:util";

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import authoritativeSchema from "../../../rfq-submission-contract/v2/schemas/authoritative-rfq-document.v2.schema.json";
import commonSchema from "../../../rfq-submission-contract/v2/schemas/common.v2.schema.json";
import errorSchema from "../../../rfq-submission-contract/v2/schemas/public-rfq-error.v2.schema.json";
import receiptSchema from "../../../rfq-submission-contract/v2/schemas/public-rfq-receipt.v2.schema.json";
import submissionSchema from "../../../rfq-submission-contract/v2/schemas/public-rfq-submission-draft.v2.schema.json";
import { RfqContractError, type RfqContractErrorKind } from "./errors";

const schemaEntries = [
  ["common.v2.schema.json", commonSchema],
  ["public-rfq-submission-draft.v2.schema.json", submissionSchema],
  ["authoritative-rfq-document.v2.schema.json", authoritativeSchema],
  ["public-rfq-receipt.v2.schema.json", receiptSchema],
  ["public-rfq-error.v2.schema.json", errorSchema],
] as const;

const ajv = new Ajv2020({
  strict: true,
  validateFormats: true,
  coerceTypes: false,
  useDefaults: false,
  removeAdditional: false,
});

addFormats(ajv, ["date-time", "email", "uri"]);
for (const [, schema] of schemaEntries) ajv.addSchema(schema);

function requireValidator(name: string): ValidateFunction<unknown> {
  const validator = ajv.getSchema(name);
  if (!validator) throw new Error(`RFQ contract root failed to compile: ${name}`);
  return validator;
}

const validateSubmissionSchema = requireValidator(
  "public-rfq-submission-draft.v2.schema.json",
);
const validateAuthoritativeSchema = requireValidator(
  "authoritative-rfq-document.v2.schema.json",
);
const validateReceiptSchema = requireValidator(
  "public-rfq-receipt.v2.schema.json",
);
const validateErrorSchema = requireValidator(
  "public-rfq-error.v2.schema.json",
);

const validatedRfqBrand: unique symbol = Symbol("ValidatedRfqDocument");
const authenticDocuments = new WeakMap<object, {
  kind: ValidatedRfqKind;
  body: unknown;
}>();

export type ValidatedRfqKind =
  | "public_submission"
  | "authoritative_document"
  | "public_receipt"
  | "public_error";

export type ValidatedRfqDocument<
  Kind extends ValidatedRfqKind = ValidatedRfqKind,
> = {
  readonly kind: Kind;
  readonly [validatedRfqBrand]: Kind;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertUnicodeScalarString(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError("invalid JSON string");
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError("invalid JSON string");
    }
  }
}

export function snapshotRfqJsonValue(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") {
    assertUnicodeScalarString(value);
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("invalid JSON number");
    return value;
  }
  if (typeof value !== "object" || nodeTypes.isProxy(value)) {
    throw new TypeError("unsupported JSON value");
  }
  if (seen.has(value)) throw new TypeError("cyclic JSON value");
  seen.add(value);

  try {
    if (Array.isArray(value)) {
      const keys = Reflect.ownKeys(value);
      if (keys.some((key) => typeof key === "symbol")) throw new TypeError("symbol key");
      const descriptors = Object.getOwnPropertyDescriptors(value);
      if (
        keys.length !== value.length + 1 ||
        !Object.hasOwn(descriptors, "length")
      ) {
        throw new TypeError("invalid JSON array");
      }
      const result: unknown[] = [];
      for (let index = 0; index < value.length; index += 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
          throw new TypeError("invalid JSON array property");
        }
        result.push(snapshotRfqJsonValue(descriptor.value, seen));
      }
      return Object.freeze(result);
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("non-JSON object");
    }
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key === "symbol")) throw new TypeError("symbol key");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const result = Object.create(null) as JsonRecord;
    for (const key of keys as string[]) {
      assertUnicodeScalarString(key);
      const descriptor = descriptors[key];
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        throw new TypeError("invalid JSON object property");
      }
      Object.defineProperty(result, key, {
        configurable: false,
        enumerable: true,
        value: snapshotRfqJsonValue(descriptor.value, seen),
        writable: false,
      });
    }
    return Object.freeze(result);
  } finally {
    seen.delete(value);
  }
}

function snapshotInput(input: unknown, errorKind: RfqContractErrorKind): unknown {
  try {
    return snapshotRfqJsonValue(input);
  } catch {
    throw new RfqContractError(errorKind);
  }
}

function createValidatedDocument<Kind extends ValidatedRfqKind>(
  kind: Kind,
  body: unknown,
): ValidatedRfqDocument<Kind> {
  const wrapper = Object.create(null) as ValidatedRfqDocument<Kind>;
  Object.defineProperties(wrapper, {
    kind: { enumerable: true, value: kind },
    toJSON: { value: () => ({ kind }) },
    [validatedRfqBrand]: { value: kind },
  });
  authenticDocuments.set(wrapper, { kind, body });
  return Object.freeze(wrapper);
}

export function getValidatedRfqBody<Kind extends ValidatedRfqKind>(
  document: ValidatedRfqDocument<Kind>,
  expectedKind: Kind,
): unknown {
  if (typeof document !== "object" || document === null) {
    throw new RfqContractError("invalid_public_submission");
  }
  const authentic = authenticDocuments.get(document);
  if (!authentic || authentic.kind !== expectedKind || document.kind !== expectedKind) {
    throw new RfqContractError("invalid_public_submission");
  }
  return authentic.body;
}

function stableIdentity(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableIdentity).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableIdentity(value[key])}`)
      .join(",")}}`;
  }
  throw new TypeError("invalid merge identity");
}

function assertUnique(values: unknown[], key: (value: JsonRecord) => string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (!isRecord(value)) throw new TypeError("invalid line");
    const identity = key(value);
    if (seen.has(identity)) throw new TypeError("duplicate identity");
    seen.add(identity);
  }
}

function publicMergeIdentity(line: JsonRecord): string {
  return line.lineKind === "configured_product"
    ? stableIdentity({
        lineKind: line.lineKind,
        canonicalPath: line.canonicalPath,
        selection: line.selection,
        packaging: line.packaging,
        quantityUnit: line.quantityUnit,
      })
    : stableIdentity({
        lineKind: line.lineKind,
        articleNumber: line.articleNumber,
        quantityUnit: line.quantityUnit,
      });
}

function assertPublicSemantics(document: JsonRecord): void {
  const basket = document.basket;
  if (!isRecord(basket) || !Array.isArray(basket.items) || !isRecord(basket.sourceBasket)) {
    throw new TypeError("invalid public basket");
  }
  assertUnique(basket.items, (line) => String(line.entryId).toLowerCase());
  assertUnique(basket.items, publicMergeIdentity);
  if (Buffer.byteLength(JSON.stringify(basket), "utf8") > 163840) {
    throw new TypeError("public basket too large");
  }
  const updatedAt = Date.parse(String(basket.sourceBasket.updatedAt));
  const expiresAt = Date.parse(String(basket.sourceBasket.expiresAt));
  if (expiresAt - updatedAt !== 2592000000) throw new TypeError("invalid basket ttl");
}

function assertAuthoritativeSemantics(
  document: JsonRecord,
  digestContext: { readonly keyVersion: string; readonly value: string },
): void {
  if (!Array.isArray(document.lines) || !isRecord(document.idempotency) || !isRecord(document.payloadDigest)) {
    throw new TypeError("invalid authoritative document");
  }
  assertUnique(document.lines, (line) => String(line.entryId).toLowerCase());
  for (const value of document.lines) {
    if (!isRecord(value)) throw new TypeError("invalid authoritative line");
    if (
      value.lineKind === "configured_product" &&
      value.resolution === "resolved_article_number" &&
      isRecord(value.selection) &&
      value.articleNumber !== value.selection.articleNumber
    ) {
      throw new TypeError("authoritative Article Number mismatch");
    }
  }
  const createdAt = Date.parse(String(document.idempotency.createdAt));
  const expiresAt = Date.parse(String(document.idempotency.expiresAt));
  if (expiresAt - createdAt !== 2592000000) throw new TypeError("invalid idempotency ttl");
  if (
    document.payloadDigest.keyVersion !== digestContext.keyVersion ||
    document.payloadDigest.value !== digestContext.value
  ) {
    throw new TypeError("authoritative digest mismatch");
  }
}

const allowedErrorFields: Record<string, ReadonlySet<string>> = {
  invalid_customer_fields: new Set(["fullName", "companyName", "whatsApp", "weChat", "businessEmail", "phone", "countryRegion", "city", "companyWebsite", "message", "contactMethods", "privacyNotice"]),
  invalid_line_count: new Set(["lineCount"]),
  invalid_quantity: new Set(["quantity"]),
  basket_refresh_required: new Set(["basket"]),
  product_unavailable: new Set(["selection"]),
  configuration_changed: new Set(["selection", "packaging"]),
};
const allowedErrorCodes: Record<string, ReadonlySet<string>> = {
  invalid_line_count: new Set(["invalid"]),
  invalid_quantity: new Set(["invalid"]),
  basket_refresh_required: new Set(["expired", "changed", "unavailable"]),
  product_unavailable: new Set(["unavailable"]),
  configuration_changed: new Set(["changed", "unavailable"]),
};

function assertErrorSemantics(document: JsonRecord): void {
  if (!isRecord(document.error)) throw new TypeError("invalid public error");
  const { code, messageKey, fieldErrors, retryAfterSeconds } = document.error;
  if (messageKey !== `rfq.error.${String(code)}`) throw new TypeError("message key mismatch");
  if ((code === "rate_limited") !== (retryAfterSeconds !== undefined)) {
    throw new TypeError("retry pairing mismatch");
  }
  const allowed = allowedErrorFields[String(code)];
  if (allowed) {
    if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
      throw new TypeError("field errors required");
    }
    for (const item of fieldErrors) {
      const codes = allowedErrorCodes[String(code)];
      if (
        !isRecord(item) ||
        !allowed.has(String(item.field)) ||
        (codes !== undefined && !codes.has(String(item.code)))
      ) {
        throw new TypeError("cross-domain field error");
      }
    }
  } else if (fieldErrors !== undefined) {
    throw new TypeError("field errors forbidden");
  }
}

function validateDocument<Kind extends ValidatedRfqKind>(
  input: unknown,
  kind: Kind,
  validator: ValidateFunction<unknown>,
  errorKind: RfqContractErrorKind,
  semantics?: (document: JsonRecord) => void,
): ValidatedRfqDocument<Kind> {
  const snapshot = snapshotInput(input, errorKind);
  if (!isRecord(snapshot) || snapshot.contractVersion !== "2.0.0") {
    throw new RfqContractError("unsupported_contract_version");
  }
  if (!validator(snapshot)) throw new RfqContractError(errorKind);
  try {
    semantics?.(snapshot);
  } catch {
    throw new RfqContractError(errorKind);
  }
  return createValidatedDocument(kind, snapshot);
}

function validatePublicRfqSubmissionImplementation(
  input: unknown,
): ValidatedRfqDocument<"public_submission"> {
  return validateDocument(
    input,
    "public_submission",
    validateSubmissionSchema,
    "invalid_public_submission",
    assertPublicSemantics,
  );
}

function getValidatedPublicSubmissionBody(
  document: ValidatedRfqDocument<"public_submission">,
): unknown {
  return getValidatedRfqBody(document, "public_submission");
}

Object.defineProperty(validatePublicRfqSubmissionImplementation, "getValidatedBody", {
  value: getValidatedPublicSubmissionBody,
});

export const validatePublicRfqSubmission =
  validatePublicRfqSubmissionImplementation as typeof validatePublicRfqSubmissionImplementation & {
    readonly getValidatedBody: typeof getValidatedPublicSubmissionBody;
  };

export function validateAuthoritativeRfqDocument(
  input: unknown,
  digestContext: { readonly keyVersion: string; readonly value: string },
): ValidatedRfqDocument<"authoritative_document"> {
  return validateDocument(
    input,
    "authoritative_document",
    validateAuthoritativeSchema,
    "invalid_authoritative_document",
    (document) => assertAuthoritativeSemantics(document, digestContext),
  );
}

export function validatePublicRfqReceipt(
  input: unknown,
): ValidatedRfqDocument<"public_receipt"> {
  return validateDocument(
    input,
    "public_receipt",
    validateReceiptSchema,
    "invalid_public_receipt",
  );
}

export function validatePublicRfqError(
  input: unknown,
): ValidatedRfqDocument<"public_error"> {
  return validateDocument(
    input,
    "public_error",
    validateErrorSchema,
    "invalid_public_error",
    assertErrorSemantics,
  );
}
