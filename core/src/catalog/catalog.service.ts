import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { eq, ilike, or } from "drizzle-orm";
import { products, categories, colors, productColors, trackProducts, trackStandardLengths } from "@gdhe/database";
import { DatabaseConnection } from "../database.js";
import { failure } from "../errors.js";
import type { CreateProductInput, PatchProductInput, SearchInput } from "./contract.js";

type Reader = Pick<DatabaseConnection["db"], "select">;
const categoryView = (c: typeof categories.$inferSelect) => ({ id: c.id, parentId: c.parentId, code: c.code, nameZh: c.nameZh, nameEn: c.nameEn, status: c.status });
const colorView = (c: typeof colors.$inferSelect) => ({ id: c.id, code: c.code, nameZh: c.nameZh, nameEn: c.nameEn, status: c.status });
const pagination = (query: SearchInput) => ({ limit: Number(query.limit ?? 20), offset: Number(query.offset ?? 0) });
const page = <T>(rows: T[], limit: number, offset: number) => ({ items: rows.slice(0, limit), limit, offset, hasMore: rows.length > limit });
const uniqueColors = (input: CreateProductInput["colors"]) => {
  if (new Set(input.map(c => c.colorId.toLowerCase())).size !== input.length) throw failure(400, "invalid_request");
};

async function readProduct(db: Reader, id: string) {
  const [row] = await db.select({ product: products, category: categories, track: trackProducts }).from(products)
    .innerJoin(categories, eq(products.primaryCategoryId, categories.id))
    .leftJoin(trackProducts, eq(products.id, trackProducts.productId)).where(eq(products.id, id));
  if (!row) throw failure(404, "product_not_found");
  const relations = await db.select({ relation: productColors, color: colors }).from(productColors)
    .innerJoin(colors, eq(productColors.colorId, colors.id)).where(eq(productColors.productId, id))
    .orderBy(productColors.sortOrder, productColors.colorId);
  const { product: p, category: c, track: tr } = row;
  return {
    id: p.id, familyCode: p.familyCode, model: p.model, nameZh: p.nameZh, nameEn: p.nameEn,
    primaryCategory: categoryView(c),
    status: p.status, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
    track: tr ? { allowsCustomLength: tr.allowsCustomLength, quantityUnit: tr.quantityUnit, createdAt: tr.createdAt.toISOString(), updatedAt: tr.updatedAt.toISOString() } : null,
    colors: relations.map(({ relation: r, color: c }) => ({
      color: colorView(c),
      status: r.status, isPublic: r.isPublic, sortOrder: r.sortOrder, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
    })),
  };
}

type ProductDetail = Awaited<ReturnType<typeof readProduct>>;
function publicFacts(p: ProductDetail, lengths: { lengthMm: number }[]) {
  if (p.status !== "active" || p.primaryCategory.status !== "active" || !p.track) return null;
  return {
    id: p.id, model: p.model, nameEn: p.nameEn,
    primaryCategory: { id: p.primaryCategory.id, code: p.primaryCategory.code, nameEn: p.primaryCategory.nameEn },
    colors: p.colors.filter(c => c.status === "active" && c.isPublic && c.color.status === "active")
      .map(c => ({ id: c.color.id, code: c.color.code, nameEn: c.color.nameEn })),
    standardLengthsMm: lengths.map(l => l.lengthMm),
    allowsCustomLength: p.track.allowsCustomLength, quantityUnit: p.track.quantityUnit,
  };
}

function cmsSummary(p: Pick<ProductDetail, "id" | "familyCode" | "model" | "nameZh" | "nameEn" | "primaryCategory" | "status" | "track">) {
  return {
    id: p.id, familyCode: p.familyCode, model: p.model, nameZh: p.nameZh, nameEn: p.nameEn,
    primaryCategory: p.primaryCategory, status: p.status,
    track: p.track ? { allowsCustomLength: p.track.allowsCustomLength, quantityUnit: p.track.quantityUnit } : null,
  };
}

@Injectable()
export class CatalogService {
  constructor(private readonly connection: DatabaseConnection) {}

  async create(input: CreateProductInput) {
    uniqueColors(input.colors);
    const id = randomUUID();
    return this.connection.db.transaction(async (tx) => {
      await tx.insert(products).values({ id, familyCode: "track", model: input.model.trim(), nameZh: input.nameZh.trim(), nameEn: input.nameEn.trim(), primaryCategoryId: input.primaryCategoryId, status: input.status });
      await tx.insert(trackProducts).values({ productId: id, allowsCustomLength: input.allowsCustomLength, quantityUnit: input.quantityUnit });
      if (input.colors.length) await tx.insert(productColors).values(input.colors.map(c => ({ ...c, productId: id })));
      return readProduct(tx, id);
    });
  }

  async update(id: string, input: PatchProductInput) {
    if (input.colors) uniqueColors(input.colors);
    return this.connection.db.transaction(async (tx) => {
      const now = new Date();
      // This update also serializes concurrent saves to this Product.
      const saved = await tx.update(products).set({ model: input.model?.trim(), nameZh: input.nameZh?.trim(), nameEn: input.nameEn?.trim(),
        primaryCategoryId: input.primaryCategoryId, status: input.status, updatedAt: now }).where(eq(products.id, id)).returning({ id: products.id });
      if (!saved.length) throw failure(404, "product_not_found");
      const [track] = await tx.select({ productId: trackProducts.productId }).from(trackProducts).where(eq(trackProducts.productId, id));
      if (!track) throw failure(409, "product_incomplete");
      if (input.allowsCustomLength !== undefined || input.quantityUnit !== undefined) {
        await tx.update(trackProducts).set({ allowsCustomLength: input.allowsCustomLength, quantityUnit: input.quantityUnit, updatedAt: now }).where(eq(trackProducts.productId, id));
      }
      for (const c of input.colors ?? []) {
        await tx.insert(productColors).values({ ...c, productId: id, updatedAt: now }).onConflictDoUpdate({
          target: [productColors.productId, productColors.colorId], set: { status: c.status, isPublic: c.isPublic, sortOrder: c.sortOrder, updatedAt: now },
        });
      }
      return readProduct(tx, id);
    });
  }

  get(id: string) { return this.connection.db.transaction(tx => readProduct(tx, id), { isolationLevel: "repeatable read", accessMode: "read only" }); }

  private readFacts(id: string) {
    return this.connection.db.transaction(async (tx) => ({
      product: await readProduct(tx, id),
      lengths: await tx.select({ lengthMm: trackStandardLengths.lengthMm }).from(trackStandardLengths).where(eq(trackStandardLengths.status, "active")).orderBy(trackStandardLengths.sortOrder, trackStandardLengths.lengthMm),
    }), { isolationLevel: "repeatable read", accessMode: "read only" });
  }

  async getPublicFacts(id: string) {
    const { product, lengths } = await this.readFacts(id);
    return publicFacts(product, lengths);
  }

  async cmsGet(id: string) {
    const { product, lengths } = await this.readFacts(id);
    return { ...cmsSummary(product), publicFacts: publicFacts(product, lengths) };
  }

  async search(query: SearchInput) {
    const { limit, offset } = pagination(query);
    const q = query.q?.trim();
    const pattern = `%${q?.replace(/[\\%_]/g, "\\$&") ?? ""}%`;
    const rows = await this.connection.db.select({ product: products, category: categories, track: trackProducts }).from(products)
      .innerJoin(categories, eq(products.primaryCategoryId, categories.id)).leftJoin(trackProducts, eq(products.id, trackProducts.productId))
      .where(q ? or(ilike(products.model, pattern), ilike(products.nameZh, pattern), ilike(products.nameEn, pattern)) : undefined)
      .orderBy(products.model, products.id).limit(limit + 1).offset(offset);
    return page(rows.map(({ product, category, track }) => cmsSummary({ ...product, primaryCategory: categoryView(category),
      track: track ? { ...track, createdAt: track.createdAt.toISOString(), updatedAt: track.updatedAt.toISOString() } : null })), limit, offset);
  }

  async categoryReferences(query: SearchInput) {
    const { limit, offset } = pagination(query);
    const rows = await this.connection.db.select().from(categories).orderBy(categories.code, categories.id).limit(limit + 1).offset(offset);
    return page(rows.map(categoryView), limit, offset);
  }

  async colorReferences(query: SearchInput) {
    const { limit, offset } = pagination(query);
    const rows = await this.connection.db.select().from(colors).orderBy(colors.code, colors.id).limit(limit + 1).offset(offset);
    return page(rows.map(colorView), limit, offset);
  }

  async standardLengths() {
    return { items: await this.connection.db.select({ lengthMm: trackStandardLengths.lengthMm, sortOrder: trackStandardLengths.sortOrder })
      .from(trackStandardLengths).where(eq(trackStandardLengths.status, "active")).orderBy(trackStandardLengths.sortOrder, trackStandardLengths.lengthMm) };
  }
}
