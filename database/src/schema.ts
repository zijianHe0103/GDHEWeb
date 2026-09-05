import { sql } from "drizzle-orm";
import { boolean, check, foreignKey, integer, pgSchema, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const site = pgSchema("site");
export const catalog = pgSchema("catalog");

export const sites = site.table("sites", {
  id: uuid("id").primaryKey(),
  key: text("key").notNull(),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("sites_key_unique").on(t.key),
  check("sites_key_nonblank", sql`btrim(${t.key}) <> ''`),
  check("sites_status_valid", sql`${t.status} IN ('active', 'inactive')`),
]);

export const categories = catalog.table("categories", {
  id: uuid("id").primaryKey(),
  parentId: uuid("parent_id"),
  code: text("code").notNull(),
  nameZh: text("name_zh").notNull(),
  nameEn: text("name_en").notNull(),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("categories_code_unique").on(t.code),
  foreignKey({ name: "categories_parent_fk", columns: [t.parentId], foreignColumns: [t.id] }).onDelete("restrict"),
  check("categories_not_own_parent", sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`),
  check("categories_names_nonblank", sql`btrim(${t.code}) <> '' AND btrim(${t.nameZh}) <> '' AND btrim(${t.nameEn}) <> ''`),
  check("categories_status_valid", sql`${t.status} IN ('active', 'inactive')`),
]);

export const products = catalog.table("products", {
  id: uuid("id").primaryKey(),
  familyCode: text("family_code").notNull(),
  model: text("model").notNull(),
  nameZh: text("name_zh").notNull(),
  nameEn: text("name_en").notNull(),
  primaryCategoryId: uuid("primary_category_id").notNull(),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  foreignKey({ name: "products_category_fk", columns: [t.primaryCategoryId], foreignColumns: [categories.id] }).onDelete("restrict"),
  check("products_family_valid", sql`${t.familyCode} = 'track'`),
  check("products_names_nonblank", sql`btrim(${t.model}) <> '' AND btrim(${t.nameZh}) <> '' AND btrim(${t.nameEn}) <> ''`),
  check("products_status_valid", sql`${t.status} IN ('active', 'inactive')`),
]);

export const colors = catalog.table("colors", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull(),
  nameZh: text("name_zh").notNull(),
  nameEn: text("name_en").notNull(),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("colors_code_unique").on(t.code),
  check("colors_names_nonblank", sql`btrim(${t.code}) <> '' AND btrim(${t.nameZh}) <> '' AND btrim(${t.nameEn}) <> ''`),
  check("colors_status_valid", sql`${t.status} IN ('active', 'inactive')`),
]);

export const productColors = catalog.table("product_colors", {
  productId: uuid("product_id").notNull(),
  colorId: uuid("color_id").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  status: text("status").notNull().default("inactive"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ name: "product_colors_pk", columns: [t.productId, t.colorId] }),
  foreignKey({ name: "product_colors_product_fk", columns: [t.productId], foreignColumns: [products.id] }).onDelete("restrict"),
  foreignKey({ name: "product_colors_color_fk", columns: [t.colorId], foreignColumns: [colors.id] }).onDelete("restrict"),
  check("product_colors_status_valid", sql`${t.status} IN ('active', 'inactive')`),
  check("product_colors_order_nonnegative", sql`${t.sortOrder} >= 0`),
]);

export const trackProducts = catalog.table("track_products", {
  productId: uuid("product_id").primaryKey(),
  allowsCustomLength: boolean("allows_custom_length").notNull(),
  quantityUnit: text("quantity_unit").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  foreignKey({ name: "track_products_product_fk", columns: [t.productId], foreignColumns: [products.id] }).onDelete("restrict"),
  check("track_products_unit_valid", sql`${t.quantityUnit} = 'piece'`),
]);

export const trackStandardLengths = catalog.table("track_standard_lengths", {
  lengthMm: integer("length_mm").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("track_standard_lengths_positive", sql`${t.lengthMm} > 0`),
  check("track_standard_lengths_order_nonnegative", sql`${t.sortOrder} >= 0`),
  check("track_standard_lengths_status_valid", sql`${t.status} IN ('active', 'inactive')`),
]);
