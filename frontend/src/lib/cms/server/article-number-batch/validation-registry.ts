import "server-only";

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import publicPathSchema from "../../article-number-batch-contract/schemas/public-path.schema.json";
import requestSchema from "../../article-number-batch-contract/schemas/mixed-quote-line-validation-request.v1.schema.json";
import responseSchema from "../../article-number-batch-contract/schemas/mixed-quote-line-validation-response.v1.schema.json";

const PUBLIC_PATH_ID = "https://gdhe.example/schemas/product-card/v1/public-path.schema.json";

const ajv = new Ajv2020({
  strict: true,
  allowUnionTypes: true,
  multipleOfPrecision: 10,
  validateFormats: true,
  coerceTypes: false,
  useDefaults: false,
  removeAdditional: false,
});
addFormats(ajv, ["uuid"]);

function prepareSchema(input: unknown): Record<string, unknown> {
  const value = structuredClone(input) as Record<string, unknown>;
  function visit(node: unknown): void {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (typeof node !== "object" || node === null) return;
    const record = node as Record<string, unknown>;
    if (record.properties && record.type === undefined) record.type = "object";
    for (const child of Object.values(record)) visit(child);
  }
  visit(value);
  return value;
}

const preparedPublicPath = structuredClone(publicPathSchema) as Record<string, unknown>;
preparedPublicPath.$id = PUBLIC_PATH_ID;
ajv.addSchema(preparedPublicPath);
ajv.addSchema(prepareSchema(requestSchema));
ajv.addSchema(prepareSchema(responseSchema));

const requestRoot = ajv.getSchema(requestSchema.$id);
const responseRoot = ajv.getSchema(responseSchema.$id);

if (!requestRoot || !responseRoot) {
  throw new Error("TASK-025 mixed quote-line contract roots failed to compile.");
}

export const validateMixedQuoteLineRequestSchema =
  requestRoot as ValidateFunction<unknown>;
export const validateMixedQuoteLineResponseSchema =
  responseRoot as ValidateFunction<unknown>;
