import Ajv2020, {
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020";
import addFormats from "ajv-formats";

import commonSchema from "../../rfq-submission-contract/v2/schemas/common.v2.schema.json";

const customerFields = [
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
] as const;
const requiredFields = new Set<RfqCustomerField>([
  "fullName",
  "companyName",
  "countryRegion",
  "city",
]);
const fieldOrder = new Map<RfqCustomerField, number>([
  ...customerFields.map((field, index) => [field, index] as const),
  ["contactMethods", customerFields.length],
]);

export type RfqCustomerField = (typeof customerFields)[number] | "contactMethods";
export type RfqCustomerErrorCode =
  | "required"
  | "invalid"
  | "too_long"
  | "at_least_one_required";
export type RfqCustomerFieldError = Readonly<{
  field: RfqCustomerField;
  code: RfqCustomerErrorCode;
}>;
export type RfqPublicCustomer = Readonly<{
  fullName: string;
  companyName: string;
  whatsApp?: string;
  weChat?: string;
  businessEmail?: string;
  phone?: string;
  countryRegion: string;
  city: string;
  companyWebsite?: string;
  message?: string;
}>;
export type NormalizeRfqCustomerResult =
  | Readonly<{ ok: true; customer: RfqPublicCustomer }>
  | Readonly<{ ok: false; errors: readonly RfqCustomerFieldError[] }>;

const ajv = new Ajv2020({
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
  validateFormats: true,
});
addFormats(ajv, ["email", "uri"]);
ajv.addSchema(commonSchema);
function requirePublicCustomerValidator(): ValidateFunction<unknown> {
  const validator = ajv.getSchema(
    "common.v2.schema.json#/$defs/publicCustomer",
  );
  if (!validator) throw new Error("RFQ publicCustomer Schema failed to compile.");
  return validator;
}
const validatePublicCustomer = requirePublicCustomerValidator();

function invalidCustomer(
  errors: readonly RfqCustomerFieldError[] = [
    { field: "contactMethods", code: "invalid" },
  ],
): NormalizeRfqCustomerResult {
  return Object.freeze({
    ok: false,
    errors: Object.freeze(errors.map((error) => Object.freeze({ ...error }))),
  });
}

function isCustomerField(value: string): value is (typeof customerFields)[number] {
  return (customerFields as readonly string[]).includes(value);
}

function isUnicodeScalarString(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false;
    }
  }
  return true;
}

function fieldFromInstancePath(instancePath: string): RfqCustomerField | undefined {
  if (!instancePath.startsWith("/") || instancePath.includes("/", 1)) {
    return undefined;
  }
  const field = instancePath.slice(1);
  return isCustomerField(field) ? field : undefined;
}

function mapSchemaError(error: ErrorObject): RfqCustomerFieldError | undefined {
  if (error.keyword === "anyOf") {
    return { field: "contactMethods", code: "at_least_one_required" };
  }
  if (error.keyword === "required") {
    if (error.schemaPath.includes("/anyOf/")) return undefined;
    const missing = error.params.missingProperty;
    return typeof missing === "string" && isCustomerField(missing)
      ? { field: missing, code: "required" }
      : { field: "contactMethods", code: "invalid" };
  }
  const field = fieldFromInstancePath(error.instancePath);
  if (!field) return { field: "contactMethods", code: "invalid" };
  if (error.keyword === "maxLength") return { field, code: "too_long" };
  if (error.keyword === "minLength" && requiredFields.has(field)) {
    return { field, code: "required" };
  }
  return { field, code: "invalid" };
}

function stableErrors(
  errors: readonly RfqCustomerFieldError[],
): readonly RfqCustomerFieldError[] {
  const priority: Record<RfqCustomerErrorCode, number> = {
    too_long: 0,
    invalid: 1,
    required: 2,
    at_least_one_required: 3,
  };
  const byField = new Map<RfqCustomerField, RfqCustomerFieldError>();
  for (const error of errors) {
    const current = byField.get(error.field);
    if (!current || priority[error.code] < priority[current.code]) {
      byField.set(error.field, error);
    }
  }
  return [...byField.values()].sort(
    (left, right) =>
      (fieldOrder.get(left.field) ?? Number.MAX_SAFE_INTEGER) -
      (fieldOrder.get(right.field) ?? Number.MAX_SAFE_INTEGER),
  );
}

function snapshotCustomerInput(input: unknown): Readonly<Record<string, unknown>> | undefined {
  try {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return undefined;
    }
    const keys = Reflect.ownKeys(input);
    const snapshot = Object.create(null) as Record<string, unknown>;
    for (const key of keys) {
      if (typeof key !== "string" || !isCustomerField(key)) return undefined;
      const descriptor = Reflect.getOwnPropertyDescriptor(input, key);
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      ) {
        return undefined;
      }
      snapshot[key] = descriptor.value;
    }
    const prototype = Reflect.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) return undefined;

    structuredClone(input);
    return Object.freeze(snapshot);
  } catch {
    return undefined;
  }
}

export function normalizeRfqCustomer(input: unknown): NormalizeRfqCustomerResult {
  const source = snapshotCustomerInput(input);
  if (!source) return invalidCustomer();
  const normalized: Record<string, string> = {};
  const inputErrors: RfqCustomerFieldError[] = [];
  for (const field of customerFields) {
    if (!Object.hasOwn(source, field)) continue;
    const value = source[field];
    if (typeof value !== "string") {
      inputErrors.push({ field, code: "invalid" });
      continue;
    }
    const trimmed = value.trim();
    if (!isUnicodeScalarString(trimmed)) {
      inputErrors.push({ field, code: "invalid" });
      continue;
    }
    if (trimmed === "" && !requiredFields.has(field)) {
      continue;
    }
    normalized[field] = trimmed;
  }

  if (!validatePublicCustomer(normalized)) {
    inputErrors.push(
      ...(validatePublicCustomer.errors ?? [])
        .map(mapSchemaError)
        .filter((error): error is RfqCustomerFieldError => error !== undefined),
    );
  }
  const website = normalized.companyWebsite;
  if (website !== undefined) {
    try {
      const parsed = new URL(website);
      if (
        (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
        parsed.username !== "" ||
        parsed.password !== ""
      ) {
        inputErrors.push({ field: "companyWebsite", code: "invalid" });
      }
    } catch {
      inputErrors.push({ field: "companyWebsite", code: "invalid" });
    }
  }
  if (inputErrors.length > 0) return invalidCustomer(stableErrors(inputErrors));
  const customer = Object.freeze({ ...normalized }) as RfqPublicCustomer;
  return Object.freeze({ ok: true, customer });
}
