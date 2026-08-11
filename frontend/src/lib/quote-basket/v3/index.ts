import type {
  ReadyCatalogAccessoryDraftV3,
  ReadyConfiguredDraftV3,
  QuoteBasketConfiguredPackagingV3,
  QuoteBasketConfiguredSelectionV3,
  QuoteBasketDocumentV3,
  QuoteBasketItemV3,
} from "../../../types/quote-basket-v3";
import type { QuoteBasketDocumentV2 } from "../../../types/quote-basket-v2";
import type { QuoteBasketDocument } from "../../../types/quote-basket";
import type {
  PublicQuoteBasketProduct,
  QuoteBasketEntryIds,
  QuoteBasketRevisionIds,
} from "../../../types/quote-basket";
import { QUOTE_BASKET_TTL_MS, cloneAndValidateQuoteBasket } from "../domain";
import {
  QUOTE_BASKET_MAX_ENCODED_BYTES,
  QUOTE_BASKET_STORAGE_KEY,
  type QuoteBasketStorage,
} from "../storage";
import { cloneAndValidateQuoteBasketV2 } from "../v2";

export const QUOTE_BASKET_V3_SCHEMA_VERSION = "3.0.0" as const;
export const QUOTE_BASKET_V3_MAX_ENCODED_BYTES = QUOTE_BASKET_MAX_ENCODED_BYTES;

export class QuoteBasketV3DomainError extends Error {
  readonly code = "invalid_basket" as const;

  constructor() {
    super("The quote basket could not be updated.");
    this.name = "QuoteBasketV3DomainError";
  }
}

export function createEmptyQuoteBasketV3(
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    const updatedAt = canonicalNow(now);
    assertUuid(ids.writerId);
    assertUuid(ids.mutationId);
    return cloneAndValidateQuoteBasketV3({
      schemaVersion: QUOTE_BASKET_V3_SCHEMA_VERSION,
      revision: 1,
      writerId: ids.writerId,
      mutationId: ids.mutationId,
      updatedAt,
      expiresAt: expiryFromUpdatedAt(updatedAt),
      items: [],
    });
  });
}

export function addConfiguredProductV3(
  basket: QuoteBasketDocumentV3,
  product: PublicQuoteBasketProduct,
  draft: ReadyConfiguredDraftV3,
  now: Date,
  ids: QuoteBasketEntryIds,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV3(basket);
    assertUuid(ids.entryId);
    const candidate = cloneConfiguredItem({
      lineKind: "configured_product",
      state: "ready",
      entryId: ids.entryId,
      createdAt: canonicalNow(now),
      product,
      selection: draft.selection,
      packaging: draft.packaging,
      articleNumber: draft.articleNumber,
      resolution: draft.resolution,
      quantityUnit: draft.quantityUnit,
      quantity: draft.quantity,
    });
    if (
      candidate.product.model !== draft.product.model ||
      candidate.product.publicPath !== draft.product.publicPath
    ) fail();
    return mergeOrAppend(current, candidate, now, ids);
  });
}

export function addCatalogAccessoryV3(
  basket: QuoteBasketDocumentV3,
  draft: ReadyCatalogAccessoryDraftV3,
  now: Date,
  ids: QuoteBasketEntryIds,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV3(basket);
    assertUuid(ids.entryId);
    const candidate = cloneAccessoryItem({
      lineKind: "catalog_accessory",
      state: "ready",
      entryId: ids.entryId,
      createdAt: canonicalNow(now),
      product: draft.product,
      catalogPath: draft.catalogPath,
      articleNumber: draft.articleNumber,
      quantityUnit: draft.quantityUnit,
      quantity: draft.quantity,
    });
    return mergeOrAppend(current, candidate, now, ids);
  });
}

export function setQuoteBasketV3ItemQuantity(
  basket: QuoteBasketDocumentV3,
  entryId: string,
  quantity: number,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV3(basket);
    const canonicalEntryId = canonicalUuid(entryId);
    assertSafePositive(quantity);
    if (!current.items.some((item) => item.entryId === canonicalEntryId)) fail();
    return finalizeMutation(
      current,
      current.items.map((item) => item.entryId === canonicalEntryId ? { ...item, quantity } : item),
      now,
      ids,
    );
  });
}

export function removeQuoteBasketV3Item(
  basket: QuoteBasketDocumentV3,
  entryId: string,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV3(basket);
    const canonicalEntryId = canonicalUuid(entryId);
    if (!current.items.some((item) => item.entryId === canonicalEntryId)) fail();
    return finalizeMutation(
      current,
      current.items.filter((item) => item.entryId !== canonicalEntryId),
      now,
      ids,
    );
  });
}

export function serializeQuoteBasketV3(basket: QuoteBasketDocumentV3): string {
  return boundary(() => {
    const serialized = JSON.stringify(cloneAndValidateQuoteBasketV3(basket));
    assertSerializedSize(serialized);
    return serialized;
  });
}

export function loadQuoteBasketV3(
  storage: QuoteBasketStorage,
  now: Date,
): QuoteBasketDocumentV3 | null {
  let raw: string | null;
  try {
    raw = storage.getItem(QUOTE_BASKET_STORAGE_KEY);
  } catch {
    fail();
  }
  if (raw === null) return null;
  try {
    return parseQuoteBasketV3(raw, now);
  } catch {
    try {
      storage.removeItem(QUOTE_BASKET_STORAGE_KEY);
    } catch {
      // Rejected bytes are never exposed; cleanup remains best-effort.
    }
    return null;
  }
}

export function persistQuoteBasketV3(
  storage: QuoteBasketStorage,
  basket: QuoteBasketDocumentV3,
): void {
  const raw = serializeQuoteBasketV3(basket);
  try {
    storage.setItem(QUOTE_BASKET_STORAGE_KEY, raw);
  } catch {
    fail();
  }
}

export function reconcileQuoteBasketV3StorageEvent(
  current: QuoteBasketDocumentV3,
  event: Readonly<{ key: string | null; newValue: string | null }>,
  now: Date,
): QuoteBasketDocumentV3 {
  const legalCurrent = cloneAndValidateQuoteBasketV3(current);
  if (event.key !== QUOTE_BASKET_STORAGE_KEY || event.newValue === null) return legalCurrent;
  try {
    const incoming = parseQuoteBasketV3(event.newValue, now);
    return compareRevision(legalCurrent, incoming) < 0 ? incoming : legalCurrent;
  } catch {
    return legalCurrent;
  }
}

export function parseQuoteBasketV3(
  serialized: string,
  now: Date,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    if (typeof serialized !== "string") fail();
    if (new TextEncoder().encode(serialized).byteLength > QUOTE_BASKET_MAX_ENCODED_BYTES) fail();
    const parsed = JSON.parse(serialized) as unknown;
    const version = readDataProperty(parsed, "schemaVersion");
    const basket = version === "1.0.0"
      ? migrateQuoteBasketV1ToV3(parsed)
      : version === "2.0.0"
        ? migrateQuoteBasketV2ToV3(parsed)
        : cloneAndValidateQuoteBasketV3(parsed);
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) fail();
    if (Date.parse(basket.expiresAt) <= now.getTime()) fail();
    return basket;
  });
}

export function migrateQuoteBasketV1ToV3(value: unknown): QuoteBasketDocumentV3 {
  return boundary(() => migrateConfiguredDocument(cloneAndValidateQuoteBasket(value)));
}

export function migrateQuoteBasketV2ToV3(value: unknown): QuoteBasketDocumentV3 {
  return boundary(() => {
    const source = cloneAndValidateQuoteBasketV2(value);
    return cloneAndValidateQuoteBasketV3({
      ...documentHeader(source),
      schemaVersion: QUOTE_BASKET_V3_SCHEMA_VERSION,
      items: source.items.map((item) => {
        if (item.lineKind === "catalog_accessory") {
          return {
            ...item,
            state: "requires_readd",
            articleNumber: null,
          };
        }
        return migrateConfiguredItem(item);
      }),
    });
  });
}

export function cloneAndValidateQuoteBasketV3(value: unknown): QuoteBasketDocumentV3 {
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
    if (document.schemaVersion !== QUOTE_BASKET_V3_SCHEMA_VERSION) fail();
    assertSafePositive(document.revision);
    const writerId = canonicalUuid(document.writerId);
    const mutationId = canonicalUuid(document.mutationId);
    assertCanonicalDate(document.updatedAt);
    assertCanonicalDate(document.expiresAt);
    if (
      Date.parse(document.expiresAt as string) !==
      Date.parse(document.updatedAt as string) + QUOTE_BASKET_TTL_MS
    ) fail();
    const items = cloneItemsArray(document.items).map(cloneItem);
    if (new Set(items.map(({ entryId }) => entryId)).size !== items.length) fail();
    for (let index = 0; index < items.length; index += 1) {
      if (items.slice(index + 1).some((candidate) => sameMergeIdentity(items[index]!, candidate))) fail();
    }
    return deepFreeze({
      schemaVersion: QUOTE_BASKET_V3_SCHEMA_VERSION,
      revision: document.revision as number,
      writerId,
      mutationId,
      updatedAt: document.updatedAt as string,
      expiresAt: document.expiresAt as string,
      items,
    });
  });
}

function migrateConfiguredDocument(source: QuoteBasketDocument): QuoteBasketDocumentV3 {
  return cloneAndValidateQuoteBasketV3({
    ...documentHeader(source),
    schemaVersion: QUOTE_BASKET_V3_SCHEMA_VERSION,
    items: source.items.map(migrateConfiguredItem),
  });
}

function mergeOrAppend(
  current: QuoteBasketDocumentV3,
  candidate: QuoteBasketItemV3,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocumentV3 {
  const items = [...current.items];
  const index = items.findIndex((item) => sameMergeIdentity(item, candidate));
  if (index >= 0) {
    const existing = items[index];
    if (!existing || existing.lineKind !== candidate.lineKind) fail();
    const quantity = existing.quantity + candidate.quantity;
    assertSafePositive(quantity);
    items[index] = {
      ...candidate,
      entryId: existing.entryId,
      createdAt: existing.createdAt,
      quantity,
    } as QuoteBasketItemV3;
  } else {
    items.push(candidate);
  }
  return finalizeMutation(current, items, now, ids);
}

function finalizeMutation(
  current: QuoteBasketDocumentV3,
  items: readonly QuoteBasketItemV3[],
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocumentV3 {
  assertUuid(ids.writerId);
  assertUuid(ids.mutationId);
  const updatedAt = canonicalNow(now);
  if (Date.parse(updatedAt) < Date.parse(current.updatedAt)) fail();
  return cloneAndValidateQuoteBasketV3({
    schemaVersion: QUOTE_BASKET_V3_SCHEMA_VERSION,
    revision: current.revision + 1,
    writerId: ids.writerId,
    mutationId: ids.mutationId,
    updatedAt,
    expiresAt: expiryFromUpdatedAt(updatedAt),
    items,
  });
}

function migrateConfiguredItem(
  item: QuoteBasketDocument["items"][number] | Extract<QuoteBasketDocumentV2["items"][number], { lineKind: "configured_product" }>,
): QuoteBasketItemV3 {
  const configured = "lineKind" in item
    ? (() => {
        const { lineKind: _lineKind, ...legacy } = item;
        void _lineKind;
        return legacy;
      })()
    : item;
  const common = {
    ...configured,
    lineKind: "configured_product" as const,
    quantityUnit: "piece" as const,
    packaging: migratePackaging(configured.packaging),
  };
  return configured.selection.type === "custom"
    ? {
        ...common,
        state: "ready",
        selection: { ...configured.selection, type: "custom" },
        articleNumber: null,
        resolution: "sales_follow_up",
      }
    : {
        ...common,
        state: "requires_validation",
        selection: { ...configured.selection, type: "standard" },
        articleNumber: null,
        resolution: "refresh_from_selection",
      };
}

function migratePackaging(
  packaging: QuoteBasketDocument["items"][number]["packaging"],
): QuoteBasketConfiguredPackagingV3 {
  const baseLabels: Readonly<Record<string, "standard" | "carton" | "large_shrink_wrap">> = {
    "Standard Packaging": "standard",
    "Standard Export Packaging": "standard",
    "Carton Packaging": "carton",
    "Large Shrink Wrap": "large_shrink_wrap",
  };
  const base = baseLabels[packaging.basePackaging.label];
  if (!base) fail();
  const protection = packaging.protectionArrangement === null
    ? null
    : (() => {
        const protectionLabels: Readonly<Record<string, "single_bag" | "paired">> = {
          "Single-piece Bagging": "single_bag",
          "Paired Interlocking": "paired",
        };
        const key = protectionLabels[packaging.protectionArrangement.label];
        if (!key) fail();
        return { key, label: packaging.protectionArrangement.label };
      })();
  return deepFreeze({
    basePackaging: { key: base, label: packaging.basePackaging.label },
    logoPrinting: packaging.logoPrinting,
    protectionArrangement: protection,
  });
}

function cloneItem(value: unknown): QuoteBasketItemV3 {
  const lineKind = readDataProperty(value, "lineKind");
  if (lineKind === "configured_product") return cloneConfiguredItem(value);
  if (lineKind === "catalog_accessory") return cloneAccessoryItem(value);
  fail();
}

function cloneConfiguredItem(value: unknown): Extract<QuoteBasketItemV3, { lineKind: "configured_product" }> {
  const item = requireRecord(value, [
    "lineKind", "state", "entryId", "createdAt", "product", "selection",
    "packaging", "articleNumber", "resolution", "quantityUnit", "quantity",
  ]);
  if (item.lineKind !== "configured_product") fail();
  const entryId = canonicalUuid(item.entryId);
  assertCanonicalDate(item.createdAt);
  const product = cloneConfiguredProduct(item.product);
  const selection = cloneSelection(item.selection);
  const packaging = clonePackaging(item.packaging);
  if (item.quantityUnit !== "piece") fail();
  assertSafePositive(item.quantity);
  const common = {
    lineKind: "configured_product" as const,
    entryId,
    createdAt: item.createdAt as string,
    product,
    selection,
    packaging,
    quantityUnit: "piece" as const,
    quantity: item.quantity as number,
  };
  if (
    item.state === "ready" && selection.type === "standard" &&
    isArticleNumber(item.articleNumber) && item.resolution === "standard_ready"
  ) return { ...common, state: "ready", selection: { ...selection, type: "standard" }, articleNumber: item.articleNumber, resolution: "standard_ready" };
  if (
    item.state === "ready" && selection.type === "custom" &&
    item.articleNumber === null && item.resolution === "sales_follow_up"
  ) return { ...common, state: "ready", selection: { ...selection, type: "custom" }, articleNumber: null, resolution: "sales_follow_up" };
  if (
    item.state === "requires_validation" && selection.type === "standard" &&
    item.articleNumber === null && item.resolution === "refresh_from_selection"
  ) return { ...common, state: "requires_validation", selection: { ...selection, type: "standard" }, articleNumber: null, resolution: "refresh_from_selection" };
  fail();
}

function cloneAccessoryItem(value: unknown): Extract<QuoteBasketItemV3, { lineKind: "catalog_accessory" }> {
  const item = requireRecord(value, [
    "lineKind", "state", "entryId", "createdAt", "product", "catalogPath",
    "articleNumber", "quantityUnit", "quantity",
  ]);
  if (item.lineKind !== "catalog_accessory") fail();
  const entryId = canonicalUuid(item.entryId);
  assertCanonicalDate(item.createdAt);
  const product = cloneAccessoryProduct(item.product);
  assertPublicPath(item.catalogPath);
  if (item.quantityUnit !== "piece") fail();
  assertSafePositive(item.quantity);
  const common = {
    lineKind: "catalog_accessory" as const,
    entryId,
    createdAt: item.createdAt as string,
    product,
    catalogPath: item.catalogPath as string,
    quantityUnit: "piece" as const,
    quantity: item.quantity as number,
  };
  if (item.state === "ready" && isArticleNumber(item.articleNumber)) {
    return { ...common, state: "ready", articleNumber: item.articleNumber };
  }
  if (item.state === "requires_readd" && item.articleNumber === null) {
    return { ...common, state: "requires_readd", articleNumber: null };
  }
  fail();
}

function cloneConfiguredProduct(value: unknown) {
  const product = requireRecord(value, ["model", "name", "publicPath", "image"]);
  assertText(product.model);
  assertText(product.name);
  assertPublicPath(product.publicPath);
  return deepFreeze({
    model: product.model as string,
    name: product.name as string,
    publicPath: product.publicPath as string,
    image: cloneImage(product.image),
  });
}

function cloneAccessoryProduct(value: unknown) {
  const product = requireRecord(value, ["model", "name", "image"]);
  assertText(product.model);
  assertText(product.name);
  return deepFreeze({
    model: product.model as string,
    name: product.name as string,
    image: cloneImage(product.image),
  });
}

function cloneImage(value: unknown) {
  const image = requireRecord(value, ["url", "width", "height", "alt"]);
  if (typeof image.url !== "string" || !/^\/test-candidates\/[a-z0-9][a-z0-9._-]*$/i.test(image.url)) fail();
  assertSafePositive(image.width);
  assertSafePositive(image.height);
  assertText(image.alt);
  return deepFreeze({ url: image.url, width: image.width as number, height: image.height as number, alt: image.alt as string });
}

function cloneSelection(value: unknown): QuoteBasketConfiguredSelectionV3 {
  const selection = requireRecord(value, ["type", "lengthMeters", "color"]);
  if (selection.type !== "standard" && selection.type !== "custom") fail();
  assertLength(selection.lengthMeters);
  const color = requireRecord(selection.color, ["code", "label"]);
  assertText(color.code);
  assertText(color.label);
  return deepFreeze({
    type: selection.type,
    lengthMeters: selection.lengthMeters as number,
    color: { code: color.code as string, label: color.label as string },
  });
}

function clonePackaging(value: unknown): QuoteBasketConfiguredPackagingV3 {
  const packaging = requireRecord(value, ["basePackaging", "logoPrinting", "protectionArrangement"]);
  const base = cloneChoice(packaging.basePackaging, ["standard", "carton", "large_shrink_wrap"] as const);
  if (typeof packaging.logoPrinting !== "boolean") fail();
  const protection = packaging.protectionArrangement === null
    ? null
    : cloneChoice(packaging.protectionArrangement, ["single_bag", "paired"] as const);
  return deepFreeze({ basePackaging: base, logoPrinting: packaging.logoPrinting, protectionArrangement: protection });
}

function cloneChoice<const Choice extends string>(value: unknown, allowed: readonly Choice[]) {
  const choice = requireRecord(value, ["key", "label"]);
  if (typeof choice.key !== "string" || !allowed.includes(choice.key as Choice)) fail();
  assertText(choice.label);
  return deepFreeze({ key: choice.key as Choice, label: choice.label as string });
}

function sameMergeIdentity(left: QuoteBasketItemV3, right: QuoteBasketItemV3): boolean {
  if (left.lineKind !== right.lineKind || left.state !== right.state) return false;
  if (left.lineKind === "catalog_accessory" && right.lineKind === "catalog_accessory") {
    return left.articleNumber === right.articleNumber && left.catalogPath === right.catalogPath && left.quantityUnit === right.quantityUnit;
  }
  if (left.lineKind !== "configured_product" || right.lineKind !== "configured_product") return false;
  return left.articleNumber === right.articleNumber &&
    left.resolution === right.resolution &&
    left.product.publicPath === right.product.publicPath &&
    JSON.stringify(left.selection) === JSON.stringify(right.selection) &&
    JSON.stringify(left.packaging) === JSON.stringify(right.packaging) &&
    left.quantityUnit === right.quantityUnit;
}

function documentHeader(value: QuoteBasketDocument | QuoteBasketDocumentV2) {
  return {
    revision: value.revision,
    writerId: value.writerId,
    mutationId: value.mutationId,
    updatedAt: value.updatedAt,
    expiresAt: value.expiresAt,
  };
}

function compareRevision(
  left: QuoteBasketDocumentV3,
  right: QuoteBasketDocumentV3,
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
    if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) fail();
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string") || ownKeys.length !== keys.length || keys.some((key) => !ownKeys.includes(key))) fail();
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
    if (!length || !("value" in length) || length.enumerable || !Number.isSafeInteger(length.value) || length.value < 0 || keys.length !== length.value + 1) fail();
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
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail();
}

function canonicalNow(now: Date): string {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) fail();
  return now.toISOString();
}

function expiryFromUpdatedAt(updatedAt: string): string {
  const expiresAt = Date.parse(updatedAt) + QUOTE_BASKET_TTL_MS;
  if (!Number.isFinite(expiresAt) || expiresAt > 8_640_000_000_000_000) fail();
  return new Date(expiresAt).toISOString();
}

function assertUuid(value: unknown): void {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) fail();
}

function canonicalUuid(value: unknown): string {
  assertUuid(value);
  return (value as string).toLowerCase();
}

function isArticleNumber(value: unknown): value is string {
  return typeof value === "string" && /^GDHEPRD[0-9]{6}$/.test(value);
}

function assertSafePositive(value: unknown): void {
  if (!Number.isSafeInteger(value) || (value as number) < 1) fail();
}

function assertLength(value: unknown): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(value * 10)) fail();
}

function assertText(value: unknown): void {
  if (typeof value !== "string" || value.length < 1 || value.length > 500) fail();
}

function assertPublicPath(value: unknown): void {
  if (typeof value !== "string" || !/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*\/$/.test(value)) fail();
}

function assertSerializedSize(serialized: string): void {
  if (new TextEncoder().encode(serialized).byteLength > QUOTE_BASKET_V3_MAX_ENCODED_BYTES) fail();
}

function boundary<T>(operation: () => T): T {
  try {
    return operation();
  } catch {
    fail();
  }
}

function fail(): never {
  throw new QuoteBasketV3DomainError();
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

export type {
  QuoteBasketDocumentV3,
  QuoteBasketItemV3,
  ReadyCatalogAccessoryDraftV3,
  ReadyConfiguredDraftV3,
} from "../../../types/quote-basket-v3";
