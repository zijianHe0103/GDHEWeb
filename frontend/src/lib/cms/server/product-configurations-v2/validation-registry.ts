import "server-only";

import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import optionSchema from "../../product-configuration-v2-contract/schemas/article-number-option.v1.schema.json";
import rootSchema from "../../product-configuration-v2-contract/schemas/product-configuration.v2.schema.json";
import publicPathSchema from "../../product-configuration-v2-contract/schemas/public-path.schema.json";
import uuidSchema from "../../product-configuration-v2-contract/schemas/uuid-v4.schema.json";

const ajv = new Ajv2020({ strict: true, validateFormats: true, coerceTypes: false, useDefaults: false, removeAdditional: false, multipleOfPrecision: 12 });
addFormats(ajv, ["date-time"]);
const base = "https://contracts.gdhe.local/product-configuration-v2/schemas/";
for (const [name, schema] of [
  ["article-number-option.v1.schema.json", optionSchema],
  ["public-path.schema.json", publicPathSchema],
  ["uuid-v4.schema.json", uuidSchema],
  ["product-configuration.v2.schema.json", rootSchema],
] as const) {
  const prepared = structuredClone(schema) as Record<string, unknown>;
  prepared.$id = new URL(name, base).href;
  ajv.addSchema(prepared);
}
export const validateProductConfigurationV2Schema = ajv.getSchema(new URL("product-configuration.v2.schema.json", base).href)!;
