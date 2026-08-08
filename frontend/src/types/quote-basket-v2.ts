import type { PublicQuoteBasketItem } from "./quote-basket";

export type ConfiguredProductBasketItemV2 = PublicQuoteBasketItem &
  Readonly<{ lineKind: "configured_product" }>;

export type CatalogAccessoryDraft = Readonly<{
  product: Readonly<{
    model: string;
    name: string;
    image: Readonly<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  }>;
  catalogPath: string;
  quantityUnit: string;
  quantity: number;
}>;

export type CatalogAccessoryBasketItemV2 = CatalogAccessoryDraft &
  Readonly<{
    lineKind: "catalog_accessory";
    entryId: string;
    createdAt: string;
  }>;

export type QuoteBasketItemV2 =
  | ConfiguredProductBasketItemV2
  | CatalogAccessoryBasketItemV2;

export type QuoteBasketDocumentV2 = Readonly<{
  schemaVersion: "2.0.0";
  revision: number;
  writerId: string;
  mutationId: string;
  updatedAt: string;
  expiresAt: string;
  items: readonly QuoteBasketItemV2[];
}>;
