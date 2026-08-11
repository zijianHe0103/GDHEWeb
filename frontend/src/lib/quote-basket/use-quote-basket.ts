"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  PublicQuoteBasketProduct,
} from "../../types/quote-basket";
import type {
  QuoteBasketDocumentV3,
  ReadyCatalogAccessoryDraftV3,
  ReadyConfiguredDraftV3,
} from "../../types/quote-basket-v3";
import {
  QUOTE_BASKET_STORAGE_KEY,
} from "./storage";
import {
  parseQuoteBasketV3,
  reconcileQuoteBasketV3StorageEvent as reconcileQuoteBasketStorageEvent,
} from "./v3";
import {
  createBrowserQuoteBasketAdapter,
  type BrowserQuoteBasketAdapter,
  type QuoteBasketMutation,
} from "./browser";

export type QuoteBasketClientState = Readonly<{
  hydrated: boolean;
  basket: QuoteBasketDocumentV3 | null;
  error: string | null;
  announcement: string;
  add(product: PublicQuoteBasketProduct, draft: ReadyConfiguredDraftV3): QuoteBasketMutation | null;
  addAccessory(draft: ReadyCatalogAccessoryDraftV3): QuoteBasketMutation | null;
  setQuantity(entryId: string, quantity: number): boolean;
  remove(entryId: string): boolean;
}>;

const storageError = "Your Quote Basket is unavailable in this browser.";

export function useQuoteBasket(): QuoteBasketClientState {
  const [adapter, setAdapter] = useState<BrowserQuoteBasketAdapter | null>(null);
  const [basket, setBasket] = useState<QuoteBasketDocumentV3 | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let active = true;
    try {
      const current = createBrowserQuoteBasketAdapter({ storage: localStorage });
      const loaded = current.load();
      queueMicrotask(() => {
        if (!active) return;
        setAdapter(current);
        setBasket(loaded);
        setError(null);
        setHydrated(true);
      });
    } catch {
      queueMicrotask(() => {
        if (!active) return;
        setError(storageError);
        setHydrated(true);
      });
    }

    function handleStorage(event: StorageEvent): void {
      if (event.key !== QUOTE_BASKET_STORAGE_KEY) return;
      if (event.newValue === null) return;
      try {
        const incoming = parseQuoteBasketV3(event.newValue, new Date());
        setBasket((current) =>
          current
            ? reconcileQuoteBasketStorageEvent(current, event, new Date())
            : incoming,
        );
        setAnnouncement("Quote Basket updated in another tab.");
      } catch {
        // Invalid external bytes never replace the current legal snapshot.
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const add = useCallback(
    (product: PublicQuoteBasketProduct, draft: ReadyConfiguredDraftV3) => {
      try {
        if (!adapter) throw new Error();
        const result = adapter.add(product, draft);
        setBasket(result.basket);
        setError(null);
        setAnnouncement(
          result.mutation === "added"
            ? "Added to your Quote Basket."
            : "Updated the matching Quote Basket item.",
        );
        return result.mutation;
      } catch {
        setError(storageError);
        return null;
      }
    },
    [adapter],
  );

  const addAccessory = useCallback((draft: ReadyCatalogAccessoryDraftV3) => {
    try {
      if (!adapter) throw new Error();
      const result = adapter.addAccessory(draft);
      setBasket(result.basket);
      setError(null);
      setAnnouncement(
        result.mutation === "added"
          ? "Added to your Quote Basket."
          : "Updated the matching Quote Basket item.",
      );
      return result.mutation;
    } catch {
      setError(storageError);
      return null;
    }
  }, [adapter]);

  const setQuantity = useCallback((entryId: string, quantity: number) => {
    try {
      if (!adapter) throw new Error();
      setBasket(adapter.setQuantity(entryId, quantity));
      setError(null);
      setAnnouncement("Quote Basket quantity updated.");
      return true;
    } catch {
      setError(storageError);
      return false;
    }
  }, [adapter]);

  const remove = useCallback((entryId: string) => {
    try {
      if (!adapter) throw new Error();
      setBasket(adapter.remove(entryId));
      setError(null);
      setAnnouncement("Item removed from your Quote Basket.");
      return true;
    } catch {
      setError(storageError);
      return false;
    }
  }, [adapter]);

  return Object.freeze({
    hydrated,
    basket,
    error,
    announcement,
    add,
    addAccessory,
    setQuantity,
    remove,
  });
}
