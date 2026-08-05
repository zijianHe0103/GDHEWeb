import type {
  PublicQuoteBasketProduct,
  QuoteBasketDocument,
  QuoteBasketEntryIds,
  QuoteBasketRevisionIds,
} from "../../types/quote-basket";
import type { PublicQuoteDraft } from "../../types/product-configurator";
import {
  addPublicDraft,
  cloneAndValidateQuoteBasket,
  createEmptyQuoteBasket,
  removeQuoteBasketItem,
  setQuoteBasketItemQuantity,
} from "./domain";

export const QUOTE_BASKET_STORAGE_KEY = "gdhe.quote-basket.v1" as const;
export const QUOTE_BASKET_MAX_ENCODED_BYTES = 256 * 1024;

export type QuoteBasketStorage = Readonly<{
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}>;

export type QuoteBasketStorageErrorCode =
  | "invalid_storage"
  | "payload_too_large"
  | "storage_full"
  | "storage_unavailable";

export class QuoteBasketStorageError extends Error {
  constructor(readonly code: QuoteBasketStorageErrorCode) {
    super("The quote basket could not be saved.");
    this.name = "QuoteBasketStorageError";
  }
}

const readDomExceptionName = Object.getOwnPropertyDescriptor(
  DOMException.prototype,
  "name",
)?.get;

export function serializeQuoteBasket(basket: QuoteBasketDocument): string {
  let serialized: string;
  try {
    serialized = JSON.stringify(cloneAndValidateQuoteBasket(basket));
  } catch {
    throw new QuoteBasketStorageError("invalid_storage");
  }
  assertEncodedSize(serialized);
  return serialized;
}

export function parseQuoteBasket(
  serialized: string,
  now: Date,
): QuoteBasketDocument {
  if (typeof serialized !== "string") {
    throw new QuoteBasketStorageError("invalid_storage");
  }
  assertEncodedSize(serialized);
  try {
    const basket = cloneAndValidateQuoteBasket(JSON.parse(serialized));
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
      throw new Error();
    }
    if (Date.parse(basket.expiresAt) <= now.getTime()) {
      throw new Error();
    }
    return basket;
  } catch {
    throw new QuoteBasketStorageError("invalid_storage");
  }
}

export function persistQuoteBasket(
  storage: QuoteBasketStorage,
  basket: QuoteBasketDocument,
): void {
  const serialized = serializeQuoteBasket(basket);
  try {
    storage.setItem(QUOTE_BASKET_STORAGE_KEY, serialized);
  } catch (error) {
    if (isQuotaError(error)) throw new QuoteBasketStorageError("storage_full");
    throw new QuoteBasketStorageError("storage_unavailable");
  }
}

export function loadQuoteBasket(
  storage: QuoteBasketStorage,
  now: Date,
): QuoteBasketDocument | null {
  let serialized: string | null;
  try {
    serialized = storage.getItem(QUOTE_BASKET_STORAGE_KEY);
  } catch {
    throw new QuoteBasketStorageError("storage_unavailable");
  }
  if (serialized === null) return null;
  try {
    return parseQuoteBasket(serialized, now);
  } catch {
    try {
      storage.removeItem(QUOTE_BASKET_STORAGE_KEY);
    } catch {
      // Recovery is best-effort; never expose the rejected stored bytes.
    }
    return null;
  }
}

export function addStoredPublicDraft(
  storage: QuoteBasketStorage,
  product: PublicQuoteBasketProduct,
  draft: PublicQuoteDraft,
  now: Date,
  ids: QuoteBasketEntryIds,
): QuoteBasketDocument {
  const base =
    loadQuoteBasket(storage, now) ?? createEmptyQuoteBasket(now, ids);
  return persistMutation(
    storage,
    addPublicDraft(base, product, draft, now, ids),
  );
}

export function setStoredQuoteBasketItemQuantity(
  storage: QuoteBasketStorage,
  entryId: string,
  quantity: number,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocument {
  const base = loadQuoteBasket(storage, now);
  if (!base) throw new QuoteBasketStorageError("invalid_storage");
  return persistMutation(
    storage,
    setQuoteBasketItemQuantity(base, entryId, quantity, now, ids),
  );
}

export function removeStoredQuoteBasketItem(
  storage: QuoteBasketStorage,
  entryId: string,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocument {
  const base = loadQuoteBasket(storage, now);
  if (!base) throw new QuoteBasketStorageError("invalid_storage");
  return persistMutation(
    storage,
    removeQuoteBasketItem(base, entryId, now, ids),
  );
}

export function compareQuoteBasketRevision(
  left: QuoteBasketDocument,
  right: QuoteBasketDocument,
): number {
  const first = cloneAndValidateQuoteBasket(left);
  const second = cloneAndValidateQuoteBasket(right);
  const parts: readonly [number | string, number | string][] = [
    [first.revision, second.revision],
    [first.updatedAt, second.updatedAt],
    [first.writerId, second.writerId],
    [first.mutationId, second.mutationId],
  ];
  for (const [leftPart, rightPart] of parts) {
    if (leftPart < rightPart) return -1;
    if (leftPart > rightPart) return 1;
  }
  return 0;
}

export function reconcileQuoteBasketStorageEvent(
  current: QuoteBasketDocument,
  event: Readonly<{ key: string | null; newValue: string | null }>,
  now: Date,
): QuoteBasketDocument {
  const legalCurrent = cloneAndValidateQuoteBasket(current);
  if (event.key !== QUOTE_BASKET_STORAGE_KEY || event.newValue === null) {
    return legalCurrent;
  }
  try {
    const incoming = parseQuoteBasket(event.newValue, now);
    return compareQuoteBasketRevision(legalCurrent, incoming) < 0
      ? incoming
      : legalCurrent;
  } catch {
    return legalCurrent;
  }
}

function persistMutation(
  storage: QuoteBasketStorage,
  basket: QuoteBasketDocument,
): QuoteBasketDocument {
  persistQuoteBasket(storage, basket);
  return basket;
}

function assertEncodedSize(serialized: string): void {
  if (new TextEncoder().encode(serialized).byteLength > QUOTE_BASKET_MAX_ENCODED_BYTES) {
    throw new QuoteBasketStorageError("payload_too_large");
  }
}

function isQuotaError(error: unknown): boolean {
  if (!readDomExceptionName) return false;
  try {
    const name = readDomExceptionName.call(error);
    return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED";
  } catch {
    return false;
  }
}
