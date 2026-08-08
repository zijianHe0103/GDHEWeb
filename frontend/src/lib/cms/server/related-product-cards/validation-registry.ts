import "server-only";

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import cardActionSchema from "../../related-product-card-contract/schemas/card-action.v1.schema.json";
import cardAttributeSchema from "../../related-product-card-contract/schemas/card-attribute.v1.schema.json";
import productCardSchema from "../../related-product-card-contract/schemas/product-card.v1.schema.json";
import publicPathSchema from "../../related-product-card-contract/schemas/public-path.schema.json";
import publicMediaSchema from "../../related-product-card-contract/schemas/public-protected-media.v1.schema.json";
import taxonomyRefSchema from "../../related-product-card-contract/schemas/public-taxonomy-ref.v1.schema.json";
import collectionSchema from "../../related-product-card-contract/schemas/related-product-card-collection.v1.schema.json";
import itemSchema from "../../related-product-card-contract/schemas/related-product-card-item.v1.schema.json";
import uuidSchema from "../../related-product-card-contract/schemas/uuid-v4.schema.json";

const INTERNAL_BASE = "https://contracts.gdhe.local/related-product-card/";

const schemas = [
  ["card-action.v1.schema.json", cardActionSchema],
  ["card-attribute.v1.schema.json", cardAttributeSchema],
  ["product-card.v1.schema.json", productCardSchema],
  ["public-path.schema.json", publicPathSchema],
  ["public-protected-media.v1.schema.json", publicMediaSchema],
  ["public-taxonomy-ref.v1.schema.json", taxonomyRefSchema],
  ["related-product-card-collection.v1.schema.json", collectionSchema],
  ["related-product-card-item.v1.schema.json", itemSchema],
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

function rebaseRefs(value: unknown): void {
  if (Array.isArray(value)) {
    for (const child of value) rebaseRefs(child);
    return;
  }
  if (typeof value !== "object" || value === null) return;
  const record = value as Record<string, unknown>;
  if (record.properties && record.type === undefined) {
    record.type = "object";
  }
  if (typeof record.$ref === "string") {
    const filename = record.$ref.split("/").at(-1);
    if (filename) record.$ref = new URL(filename, INTERNAL_BASE).href;
  }
  for (const child of Object.values(record)) rebaseRefs(child);
}

for (const [filename, schema] of schemas) {
  const prepared = structuredClone(schema) as Record<string, unknown>;
  prepared.$id = new URL(filename, INTERNAL_BASE).href;
  rebaseRefs(prepared);
  if (filename === "product-card.v1.schema.json") {
    const rules = prepared.allOf as Record<string, unknown>[];
    for (const rule of rules) {
      const then = rule.then as Record<string, unknown>;
      const properties = then.properties as Record<string, unknown>;
      const action = properties.action as Record<string, unknown>;
      action.type = "object";
    }
  }
  ajv.addSchema(prepared);
}

const root = ajv.getSchema(
  new URL("related-product-card-collection.v1.schema.json", INTERNAL_BASE).href,
);
if (!root) {
  throw new Error("RelatedProductCard contract root failed to compile.");
}

export const validateRelatedProductCardCollectionSchema =
  root as ValidateFunction<unknown>;
