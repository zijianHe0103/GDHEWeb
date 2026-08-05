import type { PublicQuoteDraft } from "./product-configurator";

export type PublicQuoteBasketProduct = Readonly<{
  model: string;
  name: string;
  publicPath: string;
  image: Readonly<{
    url: string;
    width: number;
    height: number;
    alt: string;
  }>;
}>;

export type PublicQuoteBasketItem = Readonly<{
  entryId: string;
  createdAt: string;
  product: PublicQuoteBasketProduct;
  selection: PublicQuoteDraft["selection"];
  packaging: PublicQuoteDraft["packaging"];
  quantityUnit: string;
  quantity: number;
}>;

export type QuoteBasketDocument = Readonly<{
  schemaVersion: "1.0.0";
  revision: number;
  writerId: string;
  mutationId: string;
  updatedAt: string;
  expiresAt: string;
  items: readonly PublicQuoteBasketItem[];
}>;

export type QuoteBasketRevisionIds = Readonly<{
  writerId: string;
  mutationId: string;
}>;

export type QuoteBasketEntryIds = QuoteBasketRevisionIds &
  Readonly<{ entryId: string }>;
