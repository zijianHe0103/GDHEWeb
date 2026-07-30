import "server-only";

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import cardActionSchema from "../../product-card-contract/schemas/card-action.v1.schema.json";
import cardAttributeSchema from "../../product-card-contract/schemas/card-attribute.v1.schema.json";
import collectionSchema from "../../product-card-contract/schemas/product-card-collection.v1.schema.json";
import productCardSchema from "../../product-card-contract/schemas/product-card.v1.schema.json";
import publicPathSchema from "../../product-card-contract/schemas/public-path.schema.json";
import publicMediaSchema from "../../product-card-contract/schemas/public-protected-media.v1.schema.json";
import taxonomyRefSchema from "../../product-card-contract/schemas/public-taxonomy-ref.v1.schema.json";
import uuidSchema from "../../product-card-contract/schemas/uuid-v4.schema.json";

const INTERNAL_SCHEMA_BASE =
  "https://contracts.gdhe.local/product-card/schemas/";

const schemas = [
  ["card-action.v1.schema.json", cardActionSchema],
  ["card-attribute.v1.schema.json", cardAttributeSchema],
  ["product-card-collection.v1.schema.json", collectionSchema],
  ["product-card.v1.schema.json", productCardSchema],
  ["public-path.schema.json", publicPathSchema],
  ["public-protected-media.v1.schema.json", publicMediaSchema],
  ["public-taxonomy-ref.v1.schema.json", taxonomyRefSchema],
  ["uuid-v4.schema.json", uuidSchema],
] as const;

const ajv = new Ajv2020({
  strict: true,
  validateFormats: true,
  coerceTypes: false,
  useDefaults: false,
  removeAdditional: false,
});

addFormats(ajv, ["date-time", "uri"]);

function prepareSchema(
  snapshotPath: string,
  schema: object,
): Record<string, unknown> {
  const prepared = structuredClone(schema) as Record<string, unknown>;
  prepared.$id = new URL(snapshotPath, INTERNAL_SCHEMA_BASE).href;

  if (snapshotPath === "product-card.v1.schema.json") {
    const rules = prepared.allOf;
    if (!Array.isArray(rules)) {
      throw new Error("ProductCard Schema has invalid allOf.");
    }
    for (const rule of rules) {
      const action = (
        (
          (rule as Record<string, unknown>).then as Record<string, unknown>
        ).properties as Record<string, unknown>
      ).action as Record<string, unknown>;
      action.type = "object";
    }
  }

  return prepared;
}

for (const [snapshotPath, schema] of schemas) {
  ajv.addSchema(prepareSchema(snapshotPath, schema));
}

function requireValidator(snapshotPath: string): ValidateFunction<unknown> {
  const validator = ajv.getSchema(
    new URL(snapshotPath, INTERNAL_SCHEMA_BASE).href,
  );
  if (!validator) {
    throw new Error(`ProductCard contract root failed to compile: ${snapshotPath}`);
  }
  return validator;
}

export const validateProductCardCollectionSchema = requireValidator(
  "product-card-collection.v1.schema.json",
);
