import { Type, type Static, type TSchema } from "@sinclair/typebox";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";
import { failure, messages } from "../errors.js";

const closed = { additionalProperties: false };
export const Uuid = Type.String({ format: "uuid" });
export const Status = Type.Union([Type.Literal("active"), Type.Literal("inactive")]);
const text = (maxLength: number) => Type.String({ minLength: 1, maxLength, pattern: "\\S" });
const DateTime = Type.String({ format: "date-time" });
export const ColorConfiguration = Type.Object({ colorId: Uuid, status: Status, isPublic: Type.Boolean(), sortOrder: Type.Integer({ minimum: 0, maximum: 2147483647 }) }, closed);
const fields = {
  model: text(120), nameZh: text(240), nameEn: text(240), primaryCategoryId: Uuid,
  status: Status, allowsCustomLength: Type.Boolean(), quantityUnit: Type.Literal("piece"),
  colors: Type.Array(ColorConfiguration, { maxItems: 100 }),
};
export const CreateProduct = Type.Object(fields, closed);
export type CreateProductInput = Static<typeof CreateProduct>;
export const PatchProduct = Type.Partial(CreateProduct, { ...closed, minProperties: 1 });
export type PatchProductInput = Static<typeof PatchProduct>;
export const SearchQuery = Type.Object({
  q: Type.Optional(Type.String({ maxLength: 100 })),
  limit: Type.Optional(Type.String({ pattern: "^(?:[1-9]|[1-4][0-9]|50)$", description: "1..50; default 20" })),
  offset: Type.Optional(Type.String({ pattern: "^(?:0|[1-9][0-9]{0,3}|10000)$", description: "0..10000; default 0" })),
}, closed);
export type SearchInput = Static<typeof SearchQuery>;
export const ReferenceQuery = Type.Omit(SearchQuery, ["q"]);
export const NoQuery = Type.Object({}, closed);
export const Category = Type.Object({ id: Uuid, parentId: Type.Union([Uuid, Type.Null()]), code: Type.String(), nameZh: Type.String(), nameEn: Type.String(), status: Status }, closed);
export const Color = Type.Object({ id: Uuid, code: Type.String(), nameZh: Type.String(), nameEn: Type.String(), status: Status }, closed);
export const Track = Type.Object({ allowsCustomLength: Type.Boolean(), quantityUnit: Type.Literal("piece"), createdAt: DateTime, updatedAt: DateTime }, closed);
export const InternalProduct = Type.Object({
  id: Uuid, familyCode: Type.Literal("track"), model: Type.String(), nameZh: Type.String(), nameEn: Type.String(),
  primaryCategory: Category, status: Status, createdAt: DateTime, updatedAt: DateTime,
  track: Type.Union([Track, Type.Null()]),
  colors: Type.Array(Type.Object({ color: Color, status: Status, isPublic: Type.Boolean(), sortOrder: Type.Integer(), createdAt: DateTime, updatedAt: DateTime }, closed)),
}, closed);

export const CmsSummary = Type.Object({
  id: Uuid, familyCode: Type.Literal("track"), model: Type.String(), nameZh: Type.String(), nameEn: Type.String(),
  primaryCategory: Category, status: Status,
  track: Type.Union([Type.Pick(Track, ["allowsCustomLength", "quantityUnit"]), Type.Null()]),
}, closed);
export const PublicFacts = Type.Object({
  id: Uuid, model: Type.String(), nameEn: Type.String(),
  primaryCategory: Type.Pick(Category, ["id", "code", "nameEn"]),
  colors: Type.Array(Type.Pick(Color, ["id", "code", "nameEn"])),
  standardLengthsMm: Type.Array(Type.Integer({ minimum: 1 })),
  allowsCustomLength: Type.Boolean(), quantityUnit: Type.Literal("piece"),
}, closed);
export const CmsProduct = Type.Object({ ...CmsSummary.properties, publicFacts: Type.Union([PublicFacts, Type.Null()]) }, closed);
const page = <T extends TSchema>(item: T) => Type.Object({ items: Type.Array(item, { maxItems: 50 }), limit: Type.Integer({ minimum: 1, maximum: 50 }), offset: Type.Integer({ minimum: 0, maximum: 10000 }), hasMore: Type.Boolean() }, closed);
export const ProductPage = page(CmsSummary);
export const CategoryPage = page(Category);
export const ColorPage = page(Color);
export const StandardLengths = Type.Object({ items: Type.Array(Type.Object({ lengthMm: Type.Integer({ minimum: 1 }), sortOrder: Type.Integer({ minimum: 0 }) }, closed)) }, closed);
export const ErrorResponse = Type.Object({ statusCode: Type.Integer({ minimum: 400, maximum: 599 }), code: Type.String({ enum: Object.keys(messages) }), message: Type.String() }, closed);
export const Ready = Type.Object({ status: Type.Literal("ready") }, closed);

export const paths = {
  maintenance: "v1/catalog/manual-track-products", cms: "v1/cms/products", references: "v1/catalog/references",
} as const;
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const jsonResponse = (name: string, description: string) => ({ description, content: { "application/json": { schema: ref(name) } } });
const queryParameters = (schema: typeof SearchQuery | typeof ReferenceQuery) => Object.entries(schema.properties).map(([name, schema]) => ({ name, in: "query", required: false, schema }));
const idParameter = [{ name: "id", in: "path", required: true, schema: Uuid }];
function operation(summary: string, response: string, options: { status?: number; body?: string; parameters?: unknown[]; maintenance?: boolean } = {}) {
  return {
    summary, description: options.maintenance ? "Maintenance credential required; CMS credential returns 403." : "CMS read credential or maintenance credential. Does not assert website publication eligibility.",
    parameters: options.parameters ?? [],
    ...(options.body ? { requestBody: { required: true, content: { "application/json": { schema: ref(options.body) } } } } : {}),
    responses: {
      [options.status ?? 200]: jsonResponse(response, "Success"),
      ...Object.fromEntries([400, 401, 403, 404, 409, 413, 500, 503].map(status => [status, jsonResponse("ErrorResponse", "Controlled error; no SQL, credentials or stack")]))
    },
  };
}
export const openapi = {
  openapi: "3.1.0", info: { title: "GDHE Local Catalog API", version: "1.0.0", description: "Local Manual Track Catalog only. No Publication, RFQ, media or full configurator contract." },
  security: [{ bearerAuth: [] }],
  paths: {
    [`/${paths.maintenance}`]: {
      post: operation("Create Product, Track and explicit color relations atomically", "InternalProduct", { status: 201, body: "CreateProduct", maintenance: true }),
      get: operation("Search maintenance product identities by literal model/Chinese/English substring", "ProductPage", { parameters: queryParameters(SearchQuery), maintenance: true }),
    },
    [`/${paths.maintenance}/{id}`]: {
      get: operation("Read internal maintenance view", "InternalProduct", { parameters: idParameter, maintenance: true }),
      patch: operation("Patch supplied fields and upsert only supplied color relations; omissions unchanged", "InternalProduct", { parameters: idParameter, body: "PatchProduct", maintenance: true }),
    },
    [`/${paths.cms}`]: { get: operation("Search CMS identities including inactive/incomplete records; order model then ID", "ProductPage", { parameters: queryParameters(SearchQuery) }) },
    [`/${paths.cms}/{id}`]: { get: operation("Read CMS identity and limited current English facts or null", "CmsProduct", { parameters: idParameter }) },
    [`/${paths.references}/categories`]: { get: operation("Read category references including inactive; order code then ID", "CategoryPage", { parameters: queryParameters(ReferenceQuery) }) },
    [`/${paths.references}/colors`]: { get: operation("Read color references including inactive; order code then ID", "ColorPage", { parameters: queryParameters(ReferenceQuery) }) },
    [`/${paths.references}/standard-lengths`]: { get: operation("Read all active standard lengths ordered by sort order then millimetres", "StandardLengths") },
    "/health/ready": { get: operation("Check database-backed service readiness", "Ready") },
    "/openapi.json": { get: operation("Read this API document", "OpenApiDocument") },
  },
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", description: "Separate local maintenance and CMS service credentials. No credentials in this document." } },
    schemas: { CreateProduct, PatchProduct, InternalProduct, CmsSummary, CmsProduct, PublicFacts, ProductPage, CategoryPage, ColorPage, StandardLengths, ErrorResponse, Ready, OpenApiDocument: Type.Object({ openapi: Type.Literal("3.1.0"), info: Type.Object({}), paths: Type.Object({}), components: Type.Object({}) }) },
  },
};

const ajv = new Ajv({ strict: true, allErrors: false });
addFormats.default(ajv);
export function inputPipe<T extends TSchema>(schema: T) {
  const validate = ajv.compile<Static<T>>(schema);
  return { transform(value: unknown): Static<T> {
    if (!validate(value)) throw failure(400, "invalid_request");
    return value;
  } };
}
