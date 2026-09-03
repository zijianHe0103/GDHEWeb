import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  foreignKey,
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  unique,
} from "drizzle-orm/pg-core";

export const publication = pgSchema("publication");
export const catalog = pgSchema("catalog");
export const rfq = pgSchema("rfq");

export const pageVersions = publication.table(
  "page_versions",
  {
    id: serial("id").primaryKey(),
    pageId: integer("page_id")
      .notNull()
      .references((): AnyPgColumn => pages.id, { onDelete: "restrict" }),
    versionNumber: integer("version_number").notNull(),
    publishedDocument: jsonb("published_document").notNull(),
  },
  (table) => [
    unique("page_versions_page_version_unique").on(
      table.pageId,
      table.versionNumber,
    ),
    unique("page_versions_page_id_id_unique").on(table.pageId, table.id),
    check("page_versions_version_positive", sql`${table.versionNumber} > 0`),
  ],
);

export const pages = publication.table(
  "pages",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique("pages_slug_unique"),
    currentPublishedVersionId: integer("current_published_version_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.id, table.currentPublishedVersionId],
      foreignColumns: [pageVersions.pageId, pageVersions.id],
      name: "pages_current_published_version_same_page_fk",
    }).onDelete("restrict"),
  ],
);

export const products = catalog.table("products", {
  id: serial("id").primaryKey(),
  productCode: text("product_code")
    .notNull()
    .unique("products_product_code_unique"),
});

export const productSpecs = catalog.table(
  "product_specs",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    specCode: text("spec_code").notNull(),
  },
  (table) => [
    unique("product_specs_product_spec_code_unique").on(
      table.productId,
      table.specCode,
    ),
    unique("product_specs_product_id_id_unique").on(table.productId, table.id),
  ],
);

export const trackProductSpecs = catalog.table(
  "track_product_specs",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productSpecId: integer("product_spec_id").notNull(),
    finishedLengthMm: integer("finished_length_mm").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId, table.productSpecId],
      foreignColumns: [productSpecs.productId, productSpecs.id],
      name: "track_product_specs_same_product_fk",
    }).onDelete("restrict"),
    unique("track_product_specs_product_spec_unique").on(table.productSpecId),
    check(
      "track_product_specs_length_positive",
      sql`${table.finishedLengthMm} > 0`,
    ),
  ],
);

export const requests = rfq.table("requests", {
  id: serial("id").primaryKey(),
  publicReference: text("public_reference")
    .notNull()
    .unique("requests_public_reference_unique"),
});

export const requestLines = rfq.table(
  "request_lines",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "restrict" }),
    lineNumber: integer("line_number").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    lineSnapshot: jsonb("line_snapshot").notNull(),
  },
  (table) => [
    unique("request_lines_request_line_unique").on(
      table.requestId,
      table.lineNumber,
    ),
    check("request_lines_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const idempotencyRecords = rfq.table(
  "idempotency_records",
  {
    id: serial("id").primaryKey(),
    scope: text("scope").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    requestHash: text("request_hash").notNull(),
    requestId: integer("request_id").references(() => requests.id, {
      onDelete: "restrict",
    }),
    responseDocument: jsonb("response_document"),
  },
  (table) => [
    unique("idempotency_records_scope_key_unique").on(
      table.scope,
      table.idempotencyKey,
    ),
  ],
);
