import type {
  PublicQuoteBasketProduct,
} from "../../types/quote-basket";
import type {
  QuoteBasketDocumentV3,
  ReadyCatalogAccessoryDraftV3,
  ReadyConfiguredDraftV3,
} from "../../types/quote-basket-v3";
import {
  type QuoteBasketStorage,
} from "./storage";
import {
  addCatalogAccessoryV3,
  addConfiguredProductV3,
  createEmptyQuoteBasketV3,
  loadQuoteBasketV3,
  persistQuoteBasketV3,
  removeQuoteBasketV3Item,
  setQuoteBasketV3ItemQuantity,
} from "./v3";

export type QuoteBasketMutation = "added" | "merged";

export type BrowserQuoteBasketAdapter = Readonly<{
  load(): QuoteBasketDocumentV3 | null;
  add(
    product: PublicQuoteBasketProduct,
    draft: ReadyConfiguredDraftV3,
  ): Readonly<{ basket: QuoteBasketDocumentV3; mutation: QuoteBasketMutation }>;
  addAccessory(
    draft: ReadyCatalogAccessoryDraftV3,
  ): Readonly<{ basket: QuoteBasketDocumentV3; mutation: QuoteBasketMutation }>;
  setQuantity(entryId: string, quantity: number): QuoteBasketDocumentV3;
  remove(entryId: string): QuoteBasketDocumentV3;
}>;

export function createBrowserQuoteBasketAdapter(dependencies: Readonly<{
  storage: QuoteBasketStorage;
  now?: () => Date;
  uuid?: () => string;
}>): BrowserQuoteBasketAdapter {
  const now = dependencies.now ?? (() => new Date());
  const uuid = dependencies.uuid ?? (() => crypto.randomUUID());

  return Object.freeze({
    load: () => loadQuoteBasketV3(dependencies.storage, now()),
    add: (product, draft) => {
      const operationTime = now();
      const ids = {
        writerId: uuid(),
        mutationId: uuid(),
        entryId: uuid(),
      };
      const base =
        loadQuoteBasketV3(dependencies.storage, operationTime) ??
        createEmptyQuoteBasketV3(operationTime, ids);
      const basket = addConfiguredProductV3(
        base,
        product,
        draft,
        operationTime,
        ids,
      );
      persistQuoteBasketV3(dependencies.storage, basket);
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
        loadQuoteBasketV3(dependencies.storage, operationTime) ??
        createEmptyQuoteBasketV3(operationTime, ids);
      const basket = addCatalogAccessoryV3(base, draft, operationTime, ids);
      persistQuoteBasketV3(dependencies.storage, basket);
      return Object.freeze({
        basket,
        mutation: basket.items.length === base.items.length ? "merged" : "added",
      });
    },
    setQuantity: (entryId, quantity) => {
      const operationTime = now();
      return persistAndReturn(
        dependencies.storage,
        setQuoteBasketV3ItemQuantity(
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
        removeQuoteBasketV3Item(
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
): QuoteBasketDocumentV3 {
  const basket = loadQuoteBasketV3(storage, now);
  if (!basket) throw new Error("Quote Basket is unavailable.");
  return basket;
}

function persistAndReturn(
  storage: QuoteBasketStorage,
  basket: QuoteBasketDocumentV3,
): QuoteBasketDocumentV3 {
  persistQuoteBasketV3(storage, basket);
  return basket;
}
