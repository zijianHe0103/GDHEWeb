import "server-only";

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import optionSchema from "../../product-configuration-contract/schemas/article-number-option.v1.schema.json";
import configurationSchema from "../../product-configuration-contract/schemas/product-configuration.v1.schema.json";
import publicPathSchema from "../../product-configuration-contract/schemas/public-path.schema.json";
import uuidSchema from "../../product-configuration-contract/schemas/uuid-v4.schema.json";

const INTERNAL_SCHEMA_BASE =
  "https://contracts.gdhe.local/product-configuration/schemas/";

const schemas = [
  ["article-number-option.v1.schema.json", optionSchema],
  ["product-configuration.v1.schema.json", configurationSchema],
  ["public-path.schema.json", publicPathSchema],
  ["uuid-v4.schema.json", uuidSchema],
] as const;

const ajv = new Ajv2020({
  strict: true,
  validateFormats: true,
  coerceTypes: false,
  useDefaults: false,
  removeAdditional: false,
});

addFormats(ajv, ["date-time"]);

for (const [snapshotPath, schema] of schemas) {
  const prepared = structuredClone(schema) as Record<string, unknown>;
  prepared.$id = new URL(snapshotPath, INTERNAL_SCHEMA_BASE).href;
  if (snapshotPath === "product-configuration.v1.schema.json") {
    const properties = prepared.properties as Record<string, unknown>;
    const policy = (properties.configurationPolicy as Record<string, unknown>)
      .properties as Record<string, unknown>;
    const methods = policy.installationMethods as Record<string, unknown>;
    for (const item of methods.prefixItems as Array<Record<string, unknown>>) {
      item.type = "object";
    }
  }
  ajv.addSchema(prepared);
}

function requireValidator(snapshotPath: string): ValidateFunction<unknown> {
  const validator = ajv.getSchema(
    new URL(snapshotPath, INTERNAL_SCHEMA_BASE).href,
  );
  if (!validator) {
    throw new Error(
      `Product Configuration contract root failed to compile: ${snapshotPath}`,
    );
  }
  return validator;
}

export const validateProductConfigurationSchema = requireValidator(
  "product-configuration.v1.schema.json",
);
