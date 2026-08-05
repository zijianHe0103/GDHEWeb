import type { PublicQuoteDraft } from "../../types/product-configurator";
import type {
  PublicQuoteBasketItem,
  PublicQuoteBasketProduct,
  QuoteBasketDocument,
  QuoteBasketEntryIds,
  QuoteBasketRevisionIds,
} from "../../types/quote-basket";

export const QUOTE_BASKET_SCHEMA_VERSION = "1.0.0" as const;
export const QUOTE_BASKET_TTL_MS = 2_592_000_000;

export class QuoteBasketDomainError extends Error {
  readonly code = "invalid_basket" as const;

  constructor() {
    super("The quote basket could not be updated.");
    this.name = "QuoteBasketDomainError";
  }
}

export function createEmptyQuoteBasket(
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocument {
  return domainBoundary(() => {
    const updatedAt = canonicalNow(now);
    assertUuid(ids.writerId);
    assertUuid(ids.mutationId);
    return deepFreeze({
      schemaVersion: QUOTE_BASKET_SCHEMA_VERSION,
      revision: 1,
      writerId: ids.writerId,
      mutationId: ids.mutationId,
      updatedAt,
      expiresAt: expiryFromUpdatedAt(updatedAt),
      items: [],
    });
  });
}

export function addPublicDraft(
  basket: QuoteBasketDocument,
  product: PublicQuoteBasketProduct,
  draft: PublicQuoteDraft,
  now: Date,
  ids: QuoteBasketEntryIds,
): QuoteBasketDocument {
  return domainBoundary(() => {
    const current = cloneAndValidateQuoteBasket(basket);
    const publicProduct = cloneAndValidateProduct(product);
    const publicDraft = cloneAndValidateDraft(draft);
    assertUuid(ids.entryId);
    assertSameProduct(publicProduct, publicDraft);

    const matchingIndex = current.items.findIndex((item) =>
      hasSamePublicIdentity(item, publicDraft),
    );
    const items = [...current.items];
    if (matchingIndex >= 0) {
      const existing = items[matchingIndex];
      if (!existing) fail();
      const quantity = existing.quantity + publicDraft.quantity;
      assertQuantity(quantity);
      items[matchingIndex] = {
        ...existing,
        product: publicProduct,
        quantity,
      };
    } else {
      items.push({
        entryId: ids.entryId,
        createdAt: canonicalNow(now),
        product: publicProduct,
        selection: publicDraft.selection,
        packaging: publicDraft.packaging,
        quantityUnit: publicDraft.quantityUnit,
        quantity: publicDraft.quantity,
      });
    }

    return finalizeMutation(current, items, now, ids);
  });
}

export function setQuoteBasketItemQuantity(
  basket: QuoteBasketDocument,
  entryId: string,
  quantity: number,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocument {
  return domainBoundary(() => {
    const current = cloneAndValidateQuoteBasket(basket);
    assertUuid(entryId);
    assertQuantity(quantity);
    const index = current.items.findIndex((item) => item.entryId === entryId);
    if (index < 0) fail();
    const items = current.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, quantity } : item,
    );
    return finalizeMutation(current, items, now, ids);
  });
}

export function removeQuoteBasketItem(
  basket: QuoteBasketDocument,
  entryId: string,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocument {
  return domainBoundary(() => {
    const current = cloneAndValidateQuoteBasket(basket);
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

export function summarizeQuoteBasket(
  basket: QuoteBasketDocument,
): Readonly<{ lineCount: number }> {
  return domainBoundary(() => {
    const current = cloneAndValidateQuoteBasket(basket);
    return Object.freeze({ lineCount: current.items.length });
  });
}

export function cloneAndValidateQuoteBasket(
  value: unknown,
): QuoteBasketDocument {
  return domainBoundary(() => {
    const document = requireRecord(value, [
      "schemaVersion",
      "revision",
      "writerId",
      "mutationId",
      "updatedAt",
      "expiresAt",
      "items",
    ]);
    if (document.schemaVersion !== QUOTE_BASKET_SCHEMA_VERSION) fail();
    assertRevision(document.revision);
    assertUuid(document.writerId);
    assertUuid(document.mutationId);
    assertCanonicalDate(document.updatedAt);
    assertCanonicalDate(document.expiresAt);
    if (
      Date.parse(document.expiresAt as string) !==
      Date.parse(document.updatedAt as string) + QUOTE_BASKET_TTL_MS
    ) {
      fail();
    }
    const items = cloneAndValidateItems(document.items);
    if (new Set(items.map((item) => item.entryId)).size !== items.length) fail();
    if (
      items.some((item, index) =>
        items.slice(index + 1).some((candidate) =>
          hasSamePublicIdentity(item, {
            product: {
              model: candidate.product.model,
              publicPath: candidate.product.publicPath,
            },
            selection: candidate.selection,
            packaging: candidate.packaging,
            quantityUnit: candidate.quantityUnit,
            quantity: candidate.quantity,
          }),
        ),
      )
    ) {
      fail();
    }
    return deepFreeze({
      schemaVersion: QUOTE_BASKET_SCHEMA_VERSION,
      revision: document.revision as number,
      writerId: document.writerId as string,
      mutationId: document.mutationId as string,
      updatedAt: document.updatedAt as string,
      expiresAt: document.expiresAt as string,
      items,
    });
  });
}

function cloneAndValidateItems(value: unknown): PublicQuoteBasketItem[] {
  try {
    if (!Array.isArray(value)) fail();
    const keys = Reflect.ownKeys(value);
    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
    if (
      !lengthDescriptor ||
      !("value" in lengthDescriptor) ||
      lengthDescriptor.enumerable ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0 ||
      keys.length !== lengthDescriptor.value + 1 ||
      keys.some((key) => typeof key !== "string")
    ) {
      fail();
    }

    const items: PublicQuoteBasketItem[] = [];
    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      const key = String(index);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        !descriptor ||
        !("value" in descriptor) ||
        !descriptor.enumerable
      ) {
        fail();
      }
      items.push(cloneAndValidateItem(descriptor.value));
    }
    if (!keys.includes("length")) fail();

    structuredClone(value);
    return items;
  } catch {
    fail();
  }
}

function cloneAndValidateItem(value: unknown): PublicQuoteBasketItem {
  const item = requireRecord(value, [
    "entryId",
    "createdAt",
    "product",
    "selection",
    "packaging",
    "quantityUnit",
    "quantity",
  ]);
  assertUuid(item.entryId);
  assertCanonicalDate(item.createdAt);
  const product = cloneAndValidateProduct(item.product);
  const draft = cloneAndValidateDraft({
    product: { model: product.model, publicPath: product.publicPath },
    selection: item.selection,
    packaging: item.packaging,
    quantityUnit: item.quantityUnit,
    quantity: item.quantity,
  });
  return {
    entryId: item.entryId as string,
    createdAt: item.createdAt as string,
    product,
    selection: draft.selection,
    packaging: draft.packaging,
    quantityUnit: draft.quantityUnit,
    quantity: draft.quantity,
  };
}

function cloneAndValidateProduct(value: unknown): PublicQuoteBasketProduct {
  const product = requireRecord(value, ["model", "name", "publicPath", "image"]);
  assertPublicText(product.model);
  assertPublicText(product.name);
  assertPublicPath(product.publicPath);
  const image = requireRecord(product.image, ["url", "width", "height", "alt"]);
  if (
    typeof image.url !== "string" ||
    !/^\/test-candidates\/[a-z0-9][a-z0-9._-]*$/i.test(image.url)
  ) {
    fail();
  }
  assertDimension(image.width);
  assertDimension(image.height);
  assertPublicText(image.alt);
  return {
    model: product.model as string,
    name: product.name as string,
    publicPath: product.publicPath as string,
    image: {
      url: image.url,
      width: image.width,
      height: image.height,
      alt: image.alt,
    } as PublicQuoteBasketProduct["image"],
  };
}

function cloneAndValidateDraft(value: unknown): PublicQuoteDraft {
  const draft = requireRecord(value, [
    "product",
    "selection",
    "packaging",
    "quantityUnit",
    "quantity",
  ]);
  const product = requireRecord(draft.product, ["model", "publicPath"]);
  assertPublicText(product.model);
  assertPublicPath(product.publicPath);
  const selection = requireRecord(draft.selection, [
    "type",
    "lengthMeters",
    "color",
  ]);
  if (selection.type !== "standard" && selection.type !== "custom") fail();
  assertLength(selection.lengthMeters);
  const color = requireRecord(selection.color, ["code", "label"]);
  assertPublicText(color.code);
  assertPublicText(color.label);
  const packaging = requireRecord(draft.packaging, [
    "basePackaging",
    "logoPrinting",
    "protectionArrangement",
  ]);
  const basePackaging = requireRecord(packaging.basePackaging, ["label"]);
  assertPublicText(basePackaging.label);
  if (typeof packaging.logoPrinting !== "boolean") fail();
  let protectionArrangement: Readonly<{ label: string }> | null = null;
  if (packaging.protectionArrangement !== null) {
    const protection = requireRecord(packaging.protectionArrangement, ["label"]);
    assertPublicText(protection.label);
    protectionArrangement = { label: protection.label as string };
  }
  assertPublicText(draft.quantityUnit);
  assertQuantity(draft.quantity);
  return deepFreeze({
    product: {
      model: product.model as string,
      publicPath: product.publicPath as string,
    },
    selection: {
      type: selection.type,
      lengthMeters: selection.lengthMeters as number,
      color: { code: color.code as string, label: color.label as string },
    },
    packaging: {
      basePackaging: { label: basePackaging.label as string },
      logoPrinting: packaging.logoPrinting,
      protectionArrangement,
    },
    quantityUnit: draft.quantityUnit as string,
    quantity: draft.quantity as number,
  });
}

function hasSamePublicIdentity(
  item: PublicQuoteBasketItem,
  draft: PublicQuoteDraft,
): boolean {
  return (
    item.product.publicPath === draft.product.publicPath &&
    item.selection.type === draft.selection.type &&
    item.selection.lengthMeters === draft.selection.lengthMeters &&
    item.selection.color.code === draft.selection.color.code &&
    item.selection.color.label === draft.selection.color.label &&
    item.packaging.basePackaging.label ===
      draft.packaging.basePackaging.label &&
    item.packaging.logoPrinting === draft.packaging.logoPrinting &&
    item.packaging.protectionArrangement?.label ===
      draft.packaging.protectionArrangement?.label &&
    item.quantityUnit === draft.quantityUnit
  );
}

function assertSameProduct(
  product: PublicQuoteBasketProduct,
  draft: PublicQuoteDraft,
): void {
  if (
    product.model !== draft.product.model ||
    product.publicPath !== draft.product.publicPath
  ) {
    fail();
  }
}

function finalizeMutation(
  current: QuoteBasketDocument,
  items: readonly PublicQuoteBasketItem[],
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocument {
  assertUuid(ids.writerId);
  assertUuid(ids.mutationId);
  const revision = current.revision + 1;
  assertRevision(revision);
  const updatedAt = canonicalNow(now);
  if (Date.parse(updatedAt) < Date.parse(current.updatedAt)) fail();
  return cloneAndValidateQuoteBasket({
    schemaVersion: QUOTE_BASKET_SCHEMA_VERSION,
    revision,
    writerId: ids.writerId,
    mutationId: ids.mutationId,
    updatedAt,
    expiresAt: expiryFromUpdatedAt(updatedAt),
    items,
  });
}

function requireRecord(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype
    ) {
      fail();
    }
    const actual = Reflect.ownKeys(value);
    if (
      actual.some((key) => typeof key !== "string") ||
      actual.length !== keys.length ||
      keys.some((key) => !actual.includes(key))
    ) {
      fail();
    }
    const snapshot: Record<string, unknown> = {};
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        fail();
      }
      snapshot[key] = descriptor.value;
    }
    return snapshot;
  } catch {
    fail();
  }
}

function canonicalNow(now: Date): string {
  try {
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) fail();
    return now.toISOString();
  } catch {
    fail();
  }
}

function expiryFromUpdatedAt(updatedAt: string): string {
  const expiresAt = Date.parse(updatedAt) + QUOTE_BASKET_TTL_MS;
  if (!Number.isFinite(expiresAt) || expiresAt > 8_640_000_000_000_000) fail();
  try {
    return new Date(expiresAt).toISOString();
  } catch {
    fail();
  }
}

function domainBoundary<Value>(operation: () => Value): Value {
  try {
    return operation();
  } catch {
    fail();
  }
}

function assertCanonicalDate(value: unknown): void {
  if (
    typeof value !== "string" ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    fail();
  }
}

function assertUuid(value: unknown): void {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    fail();
  }
}

function assertRevision(value: unknown): void {
  if (!Number.isSafeInteger(value) || (value as number) < 1) fail();
}

function assertQuantity(value: unknown): void {
  if (!Number.isSafeInteger(value) || (value as number) < 1) fail();
}

function assertDimension(value: unknown): void {
  if (!Number.isSafeInteger(value) || (value as number) < 1) fail();
}

function assertLength(value: unknown): void {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0 ||
    !Number.isSafeInteger(value * 10)
  ) {
    fail();
  }
}

function assertPublicText(value: unknown): void {
  if (typeof value !== "string" || value.length < 1 || value.length > 500) fail();
}

function assertPublicPath(value: unknown): void {
  if (
    typeof value !== "string" ||
    !/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*\/$/.test(value)
  ) {
    fail();
  }
}

function fail(): never {
  throw new QuoteBasketDomainError();
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}
