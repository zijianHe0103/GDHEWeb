import type {
  CatalogAccessoryBasketItemV2,
  CatalogAccessoryDraft,
  QuoteBasketDocumentV2,
  QuoteBasketItemV2,
} from "../../../types/quote-basket-v2";
import type {
  PublicQuoteBasketProduct,
  QuoteBasketDocument,
  QuoteBasketEntryIds,
} from "../../../types/quote-basket";
import type { PublicQuoteDraft } from "../../../types/product-configurator";
import {
  QUOTE_BASKET_TTL_MS,
  addPublicDraft,
  cloneAndValidateQuoteBasket,
} from "../domain";
import { QUOTE_BASKET_MAX_ENCODED_BYTES } from "../storage";
import {
  QUOTE_BASKET_STORAGE_KEY,
  type QuoteBasketStorage,
} from "../storage";

export const QUOTE_BASKET_V2_SCHEMA_VERSION = "2.0.0" as const;

export class QuoteBasketV2DomainError extends Error {
  readonly code = "invalid_basket" as const;

  constructor() {
    super("The quote basket could not be updated.");
    this.name = "QuoteBasketV2DomainError";
  }
}

export function parseQuoteBasketV2(
  serialized: string,
  now: Date,
): QuoteBasketDocumentV2 {
  return boundary(() => {
    if (typeof serialized !== "string") fail();
    assertSize(serialized);
    const parsed = JSON.parse(serialized) as unknown;
    const version = readDataProperty(parsed, "schemaVersion");
    const basket = version === "1.0.0"
      ? migrateQuoteBasketV1(parsed)
      : cloneAndValidateQuoteBasketV2(parsed);
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) fail();
    if (Date.parse(basket.expiresAt) <= now.getTime()) fail();
    return basket;
  });
}

export function migrateQuoteBasketV1(value: unknown): QuoteBasketDocumentV2 {
  return boundary(() => {
    const source = cloneAndValidateQuoteBasket(value);
    return cloneAndValidateQuoteBasketV2({
      ...source,
      schemaVersion: QUOTE_BASKET_V2_SCHEMA_VERSION,
      items: source.items.map((item) => ({
        lineKind: "configured_product",
        ...item,
      })),
    });
  });
}

export function cloneAndValidateQuoteBasketV2(
  value: unknown,
): QuoteBasketDocumentV2 {
  return boundary(() => {
    const document = requireRecord(value, [
      "schemaVersion",
      "revision",
      "writerId",
      "mutationId",
      "updatedAt",
      "expiresAt",
      "items",
    ]);
    if (document.schemaVersion !== QUOTE_BASKET_V2_SCHEMA_VERSION) fail();
    assertSafePositive(document.revision);
    assertUuid(document.writerId);
    assertUuid(document.mutationId);
    assertCanonicalDate(document.updatedAt);
    assertCanonicalDate(document.expiresAt);
    if (
      Date.parse(document.expiresAt as string) !==
      Date.parse(document.updatedAt as string) + QUOTE_BASKET_TTL_MS
    ) fail();
    const rawItems = cloneItemsArray(document.items);
    const items = rawItems.map((item) =>
      cloneAndValidateItem(item, document),
    );
    if (new Set(items.map((item) => item.entryId)).size !== items.length) fail();
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (
        item?.lineKind === "catalog_accessory" &&
        items.slice(index + 1).some((candidate) =>
          candidate.lineKind === "catalog_accessory" &&
          sameAccessoryIdentity(item, candidate),
        )
      ) fail();
    }
    const configuredItems = items
      .filter((item) => item.lineKind === "configured_product")
      .map(({ lineKind, ...item }) => {
        void lineKind;
        return item;
      });
    cloneAndValidateQuoteBasket({
      schemaVersion: "1.0.0",
      revision: document.revision,
      writerId: document.writerId,
      mutationId: document.mutationId,
      updatedAt: document.updatedAt,
      expiresAt: document.expiresAt,
      items: configuredItems,
    });
    return deepFreeze({
      schemaVersion: QUOTE_BASKET_V2_SCHEMA_VERSION,
      revision: document.revision as number,
      writerId: document.writerId as string,
      mutationId: document.mutationId as string,
      updatedAt: document.updatedAt as string,
      expiresAt: document.expiresAt as string,
      items,
    });
  });
}

export function addCatalogAccessory(
  basket: QuoteBasketDocumentV2,
  draft: CatalogAccessoryDraft,
  now: Date,
  ids: QuoteBasketEntryIds,
): QuoteBasketDocumentV2 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV2(basket);
    const accessory = cloneAccessoryDraft(draft);
    assertUuid(ids.writerId);
    assertUuid(ids.mutationId);
    assertUuid(ids.entryId);
    const items = [...current.items];
    const index = items.findIndex((item) =>
      item.lineKind === "catalog_accessory" &&
      sameAccessoryIdentity(item, accessory),
    );
    if (index >= 0) {
      const existing = items[index] as CatalogAccessoryBasketItemV2;
      const quantity = existing.quantity + accessory.quantity;
      assertSafePositive(quantity);
      items[index] = { ...existing, product: accessory.product, quantity };
    } else {
      items.push({
        lineKind: "catalog_accessory",
        entryId: ids.entryId,
        createdAt: canonicalNow(now),
        ...accessory,
      });
    }
    return finalizeMutation(current, items, now, ids);
  });
}

export function addConfiguredProductV2(
  basket: QuoteBasketDocumentV2,
  product: PublicQuoteBasketProduct,
  draft: PublicQuoteDraft,
  now: Date,
  ids: QuoteBasketEntryIds,
): QuoteBasketDocumentV2 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV2(basket);
    const configured = current.items.filter(
      (item) => item.lineKind === "configured_product",
    );
    const legacyBase: QuoteBasketDocument = cloneAndValidateQuoteBasket({
      schemaVersion: "1.0.0",
      revision: current.revision,
      writerId: current.writerId,
      mutationId: current.mutationId,
      updatedAt: current.updatedAt,
      expiresAt: current.expiresAt,
      items: configured.map(({ lineKind, ...item }) => {
        void lineKind;
        return item;
      }),
    });
    const updated = addPublicDraft(legacyBase, product, draft, now, ids);
    const updatedById = new Map(updated.items.map((item) => [item.entryId, item]));
    const items = current.items.map((item) => {
      if (item.lineKind === "catalog_accessory") return item;
      const replacement = updatedById.get(item.entryId);
      if (!replacement) fail();
      updatedById.delete(item.entryId);
      return { lineKind: "configured_product" as const, ...replacement };
    });
    for (const item of updatedById.values()) {
      items.push({ lineKind: "configured_product" as const, ...item });
    }
    return cloneAndValidateQuoteBasketV2({
      schemaVersion: QUOTE_BASKET_V2_SCHEMA_VERSION,
      revision: updated.revision,
      writerId: updated.writerId,
      mutationId: updated.mutationId,
      updatedAt: updated.updatedAt,
      expiresAt: updated.expiresAt,
      items,
    });
  });
}

export function setQuoteBasketV2ItemQuantity(
  basket: QuoteBasketDocumentV2,
  entryId: string,
  quantity: number,
  now: Date,
  ids: Pick<QuoteBasketEntryIds, "writerId" | "mutationId">,
): QuoteBasketDocumentV2 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV2(basket);
    assertUuid(entryId);
    assertSafePositive(quantity);
    if (!current.items.some((item) => item.entryId === entryId)) fail();
    return finalizeMutation(
      current,
      current.items.map((item) =>
        item.entryId === entryId ? { ...item, quantity } : item,
      ),
      now,
      ids,
    );
  });
}

export function removeQuoteBasketV2Item(
  basket: QuoteBasketDocumentV2,
  entryId: string,
  now: Date,
  ids: Pick<QuoteBasketEntryIds, "writerId" | "mutationId">,
): QuoteBasketDocumentV2 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV2(basket);
    assertUuid(entryId);
    if (!current.items.some((item) => item.entryId === entryId)) fail();
    return finalizeMutation(
      current,
      current.items.filter((item) => item.entryId !== entryId),
      now,
      ids,
    );
  });
}

export function loadQuoteBasketV2(
  storage: QuoteBasketStorage,
  now: Date,
): QuoteBasketDocumentV2 | null {
  let raw: string | null;
  try {
    raw = storage.getItem(QUOTE_BASKET_STORAGE_KEY);
  } catch {
    fail();
  }
  if (raw === null) return null;
  try {
    return parseQuoteBasketV2(raw, now);
  } catch {
    try {
      storage.removeItem(QUOTE_BASKET_STORAGE_KEY);
    } catch {
      // Invalid bytes are already rejected; cleanup is best-effort.
    }
    return null;
  }
}

export function persistQuoteBasketV2(
  storage: QuoteBasketStorage,
  basket: QuoteBasketDocumentV2,
): void {
  const raw = serializeQuoteBasketV2(basket);
  try {
    storage.setItem(QUOTE_BASKET_STORAGE_KEY, raw);
  } catch {
    fail();
  }
}

export function reconcileQuoteBasketV2StorageEvent(
  current: QuoteBasketDocumentV2,
  event: Readonly<{ key: string | null; newValue: string | null }>,
  now: Date,
): QuoteBasketDocumentV2 {
  const legalCurrent = cloneAndValidateQuoteBasketV2(current);
  if (event.key !== QUOTE_BASKET_STORAGE_KEY || event.newValue === null) {
    return legalCurrent;
  }
  try {
    const incoming = parseQuoteBasketV2(event.newValue, now);
    return compareRevision(legalCurrent, incoming) < 0 ? incoming : legalCurrent;
  } catch {
    return legalCurrent;
  }
}

export function serializeQuoteBasketV2(basket: QuoteBasketDocumentV2): string {
  return boundary(() => {
    const serialized = JSON.stringify(cloneAndValidateQuoteBasketV2(basket));
    assertSize(serialized);
    return serialized;
  });
}

function cloneAndValidateItem(
  value: unknown,
  document: Record<string, unknown>,
): QuoteBasketItemV2 {
  const lineKind = readDataProperty(value, "lineKind");
  if (lineKind === "configured_product") {
    const item = requireRecord(value, [
      "lineKind",
      "entryId",
      "createdAt",
      "product",
      "selection",
      "packaging",
      "quantityUnit",
      "quantity",
    ]);
    const legacy = cloneAndValidateQuoteBasket({
      schemaVersion: "1.0.0",
      revision: document.revision,
      writerId: document.writerId,
      mutationId: document.mutationId,
      updatedAt: document.updatedAt,
      expiresAt: document.expiresAt,
      items: [{
        entryId: item.entryId,
        createdAt: item.createdAt,
        product: item.product,
        selection: item.selection,
        packaging: item.packaging,
        quantityUnit: item.quantityUnit,
        quantity: item.quantity,
      }],
    });
    return { lineKind, ...legacy.items[0]! };
  }
  if (lineKind === "catalog_accessory") {
    const item = requireRecord(value, [
      "lineKind",
      "entryId",
      "createdAt",
      "product",
      "catalogPath",
      "quantityUnit",
      "quantity",
    ]);
    assertUuid(item.entryId);
    assertCanonicalDate(item.createdAt);
    return {
      lineKind,
      entryId: item.entryId as string,
      createdAt: item.createdAt as string,
      ...cloneAccessoryDraft({
        product: item.product,
        catalogPath: item.catalogPath,
        quantityUnit: item.quantityUnit,
        quantity: item.quantity,
      } as never),
    };
  }
  fail();
}

function cloneAccessoryDraft(value: unknown): CatalogAccessoryDraft {
  const draft = requireRecord(value, [
    "product",
    "catalogPath",
    "quantityUnit",
    "quantity",
  ]);
  const product = requireRecord(draft.product, ["model", "name", "image"]);
  assertText(product.model);
  assertText(product.name);
  const image = requireRecord(product.image, ["url", "width", "height", "alt"]);
  if (
    typeof image.url !== "string" ||
    !/^\/test-candidates\/[a-z0-9][a-z0-9._-]*$/i.test(image.url)
  ) fail();
  assertSafePositive(image.width);
  assertSafePositive(image.height);
  assertText(image.alt);
  assertPublicPath(draft.catalogPath);
  assertText(draft.quantityUnit);
  assertSafePositive(draft.quantity);
  return deepFreeze({
    product: {
      model: product.model as string,
      name: product.name as string,
      image: {
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt,
      } as CatalogAccessoryDraft["product"]["image"],
    },
    catalogPath: draft.catalogPath as string,
    quantityUnit: draft.quantityUnit as string,
    quantity: draft.quantity as number,
  });
}

function sameAccessoryIdentity(
  left: CatalogAccessoryDraft,
  right: CatalogAccessoryDraft,
): boolean {
  return left.product.model === right.product.model &&
    left.product.name === right.product.name &&
    left.product.image.url === right.product.image.url &&
    left.product.image.width === right.product.image.width &&
    left.product.image.height === right.product.image.height &&
    left.product.image.alt === right.product.image.alt &&
    left.catalogPath === right.catalogPath &&
    left.quantityUnit === right.quantityUnit;
}

function finalizeMutation(
  current: QuoteBasketDocumentV2,
  items: readonly QuoteBasketItemV2[],
  now: Date,
  ids: Pick<QuoteBasketEntryIds, "writerId" | "mutationId">,
): QuoteBasketDocumentV2 {
  assertUuid(ids.writerId);
  assertUuid(ids.mutationId);
  const updatedAt = canonicalNow(now);
  if (Date.parse(updatedAt) < Date.parse(current.updatedAt)) fail();
  return cloneAndValidateQuoteBasketV2({
    schemaVersion: QUOTE_BASKET_V2_SCHEMA_VERSION,
    revision: current.revision + 1,
    writerId: ids.writerId,
    mutationId: ids.mutationId,
    updatedAt,
    expiresAt: new Date(Date.parse(updatedAt) + QUOTE_BASKET_TTL_MS).toISOString(),
    items,
  });
}

function compareRevision(
  left: QuoteBasketDocumentV2,
  right: QuoteBasketDocumentV2,
): number {
  const pairs: readonly [number | string, number | string][] = [
    [left.revision, right.revision],
    [left.updatedAt, right.updatedAt],
    [left.writerId, right.writerId],
    [left.mutationId, right.mutationId],
  ];
  for (const [leftValue, rightValue] of pairs) {
    if (leftValue < rightValue) return -1;
    if (leftValue > rightValue) return 1;
  }
  return 0;
}

function requireRecord(value: unknown, keys: readonly string[]): Record<string, unknown> {
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype
    ) fail();
    const ownKeys = Reflect.ownKeys(value);
    if (
      ownKeys.some((key) => typeof key !== "string") ||
      ownKeys.length !== keys.length ||
      keys.some((key) => !ownKeys.includes(key))
    ) fail();
    const snapshot: Record<string, unknown> = {};
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) fail();
      snapshot[key] = descriptor.value;
    }
    return snapshot;
  } catch {
    fail();
  }
}

function cloneItemsArray(value: unknown): unknown[] {
  try {
    if (!Array.isArray(value)) fail();
    const keys = Reflect.ownKeys(value);
    const length = Object.getOwnPropertyDescriptor(value, "length");
    if (
      !length ||
      !("value" in length) ||
      length.enumerable ||
      !Number.isSafeInteger(length.value) ||
      length.value < 0 ||
      keys.length !== length.value + 1 ||
      keys.some((key) => typeof key !== "string")
    ) fail();
    const items: unknown[] = [];
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) fail();
      items.push(descriptor.value);
    }
    if (!keys.includes("length")) fail();
    return items;
  } catch {
    fail();
  }
}

function readDataProperty(value: unknown, key: string): unknown {
  try {
    if (value === null || typeof value !== "object") fail();
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) fail();
    return descriptor.value;
  } catch {
    fail();
  }
}

function assertCanonicalDate(value: unknown): void {
  if (
    typeof value !== "string" ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) fail();
}

function canonicalNow(now: Date): string {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) fail();
  return now.toISOString();
}

function assertUuid(value: unknown): void {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) fail();
}

function assertSafePositive(value: unknown): void {
  if (!Number.isSafeInteger(value) || (value as number) < 1) fail();
}

function assertText(value: unknown): void {
  if (typeof value !== "string" || value.length < 1 || value.length > 500) fail();
}

function assertPublicPath(value: unknown): void {
  if (
    typeof value !== "string" ||
    !/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*\/$/.test(value)
  ) fail();
}

function assertSize(serialized: string): void {
  if (new TextEncoder().encode(serialized).byteLength > QUOTE_BASKET_MAX_ENCODED_BYTES) fail();
}

function boundary<T>(operation: () => T): T {
  try {
    return operation();
  } catch {
    fail();
  }
}

function fail(): never {
  throw new QuoteBasketV2DomainError();
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

export type {
  CatalogAccessoryDraft,
  QuoteBasketDocumentV2,
  QuoteBasketItemV2,
} from "../../../types/quote-basket-v2";
export type { QuoteBasketDocument } from "../../../types/quote-basket";
