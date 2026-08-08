import type { PublicQuoteDraft } from "../../types/product-configurator";
import type {
  PublicQuoteBasketProduct,
} from "../../types/quote-basket";
import type {
  CatalogAccessoryDraft,
  QuoteBasketDocumentV2,
} from "../../types/quote-basket-v2";
import {
  createEmptyQuoteBasket,
} from "./domain";
import {
  type QuoteBasketStorage,
} from "./storage";
import {
  addCatalogAccessory,
  addConfiguredProductV2,
  loadQuoteBasketV2,
  migrateQuoteBasketV1,
  persistQuoteBasketV2,
  removeQuoteBasketV2Item,
  setQuoteBasketV2ItemQuantity,
} from "./v2";

export type QuoteBasketMutation = "added" | "merged";

export type BrowserQuoteBasketAdapter = Readonly<{
  load(): QuoteBasketDocumentV2 | null;
  add(
    product: PublicQuoteBasketProduct,
    draft: PublicQuoteDraft,
  ): Readonly<{ basket: QuoteBasketDocumentV2; mutation: QuoteBasketMutation }>;
  addAccessory(
    draft: CatalogAccessoryDraft,
  ): Readonly<{ basket: QuoteBasketDocumentV2; mutation: QuoteBasketMutation }>;
  setQuantity(entryId: string, quantity: number): QuoteBasketDocumentV2;
  remove(entryId: string): QuoteBasketDocumentV2;
}>;

export function createBrowserQuoteBasketAdapter(dependencies: Readonly<{
  storage: QuoteBasketStorage;
  now?: () => Date;
  uuid?: () => string;
}>): BrowserQuoteBasketAdapter {
  const now = dependencies.now ?? (() => new Date());
  const uuid = dependencies.uuid ?? (() => crypto.randomUUID());

  return Object.freeze({
    load: () => loadQuoteBasketV2(dependencies.storage, now()),
    add: (product, draft) => {
      const operationTime = now();
      const ids = {
        writerId: uuid(),
        mutationId: uuid(),
        entryId: uuid(),
      };
      const base =
        loadQuoteBasketV2(dependencies.storage, operationTime) ??
        migrateQuoteBasketV1(createEmptyQuoteBasket(operationTime, ids));
      const basket = addConfiguredProductV2(
        base,
        product,
        draft,
        operationTime,
        ids,
      );
      persistQuoteBasketV2(dependencies.storage, basket);
      return Object.freeze({
        basket,
        mutation: basket.items.length === base.items.length ? "merged" : "added",
      });
    },
    addAccessory: (draft) => {
      const operationTime = now();
      const ids = {
        writerId: uuid(),
        mutationId: uuid(),
        entryId: uuid(),
      };
      const base =
        loadQuoteBasketV2(dependencies.storage, operationTime) ??
        migrateQuoteBasketV1(createEmptyQuoteBasket(operationTime, ids));
      const basket = addCatalogAccessory(base, draft, operationTime, ids);
      persistQuoteBasketV2(dependencies.storage, basket);
      return Object.freeze({
        basket,
        mutation: basket.items.length === base.items.length ? "merged" : "added",
      });
    },
    setQuantity: (entryId, quantity) => {
      const operationTime = now();
      return persistAndReturn(
        dependencies.storage,
        setQuoteBasketV2ItemQuantity(
          requireBasket(dependencies.storage, operationTime),
          entryId,
          quantity,
          operationTime,
          { writerId: uuid(), mutationId: uuid() },
        ),
      );
    },
    remove: (entryId) => {
      const operationTime = now();
      return persistAndReturn(
        dependencies.storage,
        removeQuoteBasketV2Item(
          requireBasket(dependencies.storage, operationTime),
          entryId,
          operationTime,
          { writerId: uuid(), mutationId: uuid() },
        ),
      );
    },
  });
}

function requireBasket(
  storage: QuoteBasketStorage,
  now: Date,
): QuoteBasketDocumentV2 {
  const basket = loadQuoteBasketV2(storage, now);
  if (!basket) throw new Error("Quote Basket is unavailable.");
  return basket;
}

function persistAndReturn(
  storage: QuoteBasketStorage,
  basket: QuoteBasketDocumentV2,
): QuoteBasketDocumentV2 {
  persistQuoteBasketV2(storage, basket);
  return basket;
}
