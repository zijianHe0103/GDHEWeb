import "server-only";

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import contentReferenceSchema from "../../contracts/schemas/content-reference.schema.json";
import errorSchema from "../../contracts/schemas/error.schema.json";
import fileReferenceSchema from "../../contracts/schemas/file-reference.schema.json";
import linkSchema from "../../contracts/schemas/link.schema.json";
import mediaReferenceSchema from "../../contracts/schemas/media-reference.schema.json";
import accordionSchema from "../../contracts/schemas/modules/accordion.schema.json";
import cardGridSchema from "../../contracts/schemas/modules/card-grid.schema.json";
import ctaBannerSchema from "../../contracts/schemas/modules/cta-banner.schema.json";
import dataTableSchema from "../../contracts/schemas/modules/data-table.schema.json";
import heroSchema from "../../contracts/schemas/modules/hero.schema.json";
import richTextSchema from "../../contracts/schemas/modules/rich-text.schema.json";
import splitMediaSchema from "../../contracts/schemas/modules/split-media.schema.json";
import pageSchema from "../../contracts/schemas/page.v3.schema.json";
import publicPathSchema from "../../contracts/schemas/public-path.schema.json";
import safeHtmlSchema from "../../contracts/schemas/safe-html.schema.json";
import uuidSchema from "../../contracts/schemas/uuid-v4.schema.json";

const INTERNAL_SCHEMA_BASE = "https://contracts.gdhe.local/schemas/";

const schemas = [
  ["content-reference.schema.json", contentReferenceSchema],
  ["error.schema.json", errorSchema],
  ["file-reference.schema.json", fileReferenceSchema],
  ["link.schema.json", linkSchema],
  ["media-reference.schema.json", mediaReferenceSchema],
  ["modules/accordion.schema.json", accordionSchema],
  ["modules/card-grid.schema.json", cardGridSchema],
  ["modules/cta-banner.schema.json", ctaBannerSchema],
  ["modules/data-table.schema.json", dataTableSchema],
  ["modules/hero.schema.json", heroSchema],
  ["modules/rich-text.schema.json", richTextSchema],
  ["modules/split-media.schema.json", splitMediaSchema],
  ["page.v3.schema.json", pageSchema],
  ["public-path.schema.json", publicPathSchema],
  ["safe-html.schema.json", safeHtmlSchema],
  ["uuid-v4.schema.json", uuidSchema],
] as const;

type MutableSchema = Record<string, unknown>;

function objectProperty(
  value: MutableSchema,
  property: string,
): MutableSchema {
  const child = value[property];
  if (typeof child !== "object" || child === null || Array.isArray(child)) {
    throw new Error(`CMS contract Schema has invalid ${property}.`);
  }
  return child as MutableSchema;
}

function arrayProperty(
  value: MutableSchema,
  property: string,
): unknown[] {
  const child = value[property];
  if (!Array.isArray(child)) {
    throw new Error(`CMS contract Schema has invalid ${property}.`);
  }
  return child;
}

function prepareSchema(
  snapshotPath: string,
  schema: object,
): MutableSchema {
  const copy = structuredClone(schema) as MutableSchema;
  copy.$id = new URL(snapshotPath, INTERNAL_SCHEMA_BASE).href;

  // These redundant types preserve the frozen validation semantics while
  // satisfying Ajv strictTypes for constraints inherited from parent schemas.
  if (snapshotPath === "page.v3.schema.json") {
    const firstCondition = arrayProperty(copy, "allOf")[0];
    const condition = objectProperty(
      objectProperty(
        objectProperty(firstCondition as MutableSchema, "then"),
        "properties",
      ),
      "details",
    );
    condition.type = "object";
  }
  if (snapshotPath === "link.schema.json") {
    const url = objectProperty(objectProperty(copy, "properties"), "url");
    const patternBranch = arrayProperty(url, "oneOf")[1] as MutableSchema;
    patternBranch.type = "string";
  }

  return copy;
}

const ajv = new Ajv2020({
  strict: true,
  validateFormats: true,
  coerceTypes: false,
  useDefaults: false,
  removeAdditional: false,
});

addFormats(ajv, ["date", "date-time", "uri"]);

for (const [snapshotPath, schema] of schemas) {
  ajv.addSchema(prepareSchema(snapshotPath, schema));
}

function requireValidator(snapshotPath: string): ValidateFunction<unknown> {
  const validator = ajv.getSchema(
    new URL(snapshotPath, INTERNAL_SCHEMA_BASE).href,
  );

  if (!validator) {
    throw new Error(`CMS contract root failed to compile: ${snapshotPath}`);
  }

  return validator;
}

export const validatePageSchema = requireValidator("page.v3.schema.json");
export const validateErrorSchema = requireValidator("error.schema.json");
