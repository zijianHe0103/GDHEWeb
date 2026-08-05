import type { PublicQuoteDraft } from "../../types/product-configurator";
import type {
  PublicQuoteBasketProduct,
  QuoteBasketDocument,
} from "../../types/quote-basket";
import {
  addPublicDraft,
  createEmptyQuoteBasket,
} from "./domain";
import {
  loadQuoteBasket,
  persistQuoteBasket,
  removeStoredQuoteBasketItem,
  setStoredQuoteBasketItemQuantity,
  type QuoteBasketStorage,
} from "./storage";

export type QuoteBasketMutation = "added" | "merged";

export type BrowserQuoteBasketAdapter = Readonly<{
  load(): QuoteBasketDocument | null;
  add(
    product: PublicQuoteBasketProduct,
    draft: PublicQuoteDraft,
  ): Readonly<{ basket: QuoteBasketDocument; mutation: QuoteBasketMutation }>;
  setQuantity(entryId: string, quantity: number): QuoteBasketDocument;
  remove(entryId: string): QuoteBasketDocument;
}>;

export function createBrowserQuoteBasketAdapter(dependencies: Readonly<{
  storage: QuoteBasketStorage;
  now?: () => Date;
  uuid?: () => string;
}>): BrowserQuoteBasketAdapter {
  const now = dependencies.now ?? (() => new Date());
  const uuid = dependencies.uuid ?? (() => crypto.randomUUID());

  return Object.freeze({
    load: () => loadQuoteBasket(dependencies.storage, now()),
    add: (product, draft) => {
      const operationTime = now();
      const ids = {
        writerId: uuid(),
        mutationId: uuid(),
        entryId: uuid(),
      };
      const base =
        loadQuoteBasket(dependencies.storage, operationTime) ??
        createEmptyQuoteBasket(operationTime, ids);
      const basket = addPublicDraft(
        base,
        product,
        draft,
        operationTime,
        ids,
      );
      persistQuoteBasket(dependencies.storage, basket);
      return Object.freeze({
        basket,
        mutation: basket.items.length === base.items.length ? "merged" : "added",
      });
    },
    setQuantity: (entryId, quantity) =>
      setStoredQuoteBasketItemQuantity(
        dependencies.storage,
        entryId,
        quantity,
        now(),
        { writerId: uuid(), mutationId: uuid() },
      ),
    remove: (entryId) =>
      removeStoredQuoteBasketItem(
        dependencies.storage,
        entryId,
        now(),
        { writerId: uuid(), mutationId: uuid() },
      ),
  });
}
