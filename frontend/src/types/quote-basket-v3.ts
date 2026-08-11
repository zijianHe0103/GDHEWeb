import type { PublicQuoteBasketProduct } from "./quote-basket";
import type { CatalogAccessoryDraft } from "./quote-basket-v2";

export type QuoteBasketBasePackagingV3 = Readonly<{
  key: "standard" | "carton" | "large_shrink_wrap";
  label: string;
}>;

export type QuoteBasketProtectionV3 = Readonly<{
  key: "single_bag" | "paired";
  label: string;
}>;

export type QuoteBasketConfiguredSelectionV3 = Readonly<{
  type: "standard" | "custom";
  lengthMeters: number;
  color: Readonly<{ code: string; label: string }>;
}>;

export type QuoteBasketConfiguredPackagingV3 = Readonly<{
  basePackaging: QuoteBasketBasePackagingV3;
  logoPrinting: boolean;
  protectionArrangement: QuoteBasketProtectionV3 | null;
}>;

type ConfiguredCommonV3 = Readonly<{
  lineKind: "configured_product";
  entryId: string;
  createdAt: string;
  product: PublicQuoteBasketProduct;
  selection: QuoteBasketConfiguredSelectionV3;
  packaging: QuoteBasketConfiguredPackagingV3;
  quantityUnit: "piece";
  quantity: number;
}>;

export type ReadyStandardConfiguredItemV3 = ConfiguredCommonV3 &
  Readonly<{
    state: "ready";
    selection: QuoteBasketConfiguredSelectionV3 & Readonly<{ type: "standard" }>;
    articleNumber: string;
    resolution: "standard_ready";
  }>;

export type ReadyCustomConfiguredItemV3 = ConfiguredCommonV3 &
  Readonly<{
    state: "ready";
    selection: QuoteBasketConfiguredSelectionV3 & Readonly<{ type: "custom" }>;
    articleNumber: null;
    resolution: "sales_follow_up";
  }>;

export type RequiresValidationConfiguredItemV3 = ConfiguredCommonV3 &
  Readonly<{
    state: "requires_validation";
    selection: QuoteBasketConfiguredSelectionV3 & Readonly<{ type: "standard" }>;
    articleNumber: null;
    resolution: "refresh_from_selection";
  }>;

type AccessoryCommonV3 = Readonly<{
  lineKind: "catalog_accessory";
  entryId: string;
  createdAt: string;
  product: CatalogAccessoryDraft["product"];
  catalogPath: string;
  quantityUnit: "piece";
  quantity: number;
}>;

export type ReadyCatalogAccessoryItemV3 = AccessoryCommonV3 &
  Readonly<{
    state: "ready";
    articleNumber: string;
  }>;

export type RequiresReaddCatalogAccessoryItemV3 = AccessoryCommonV3 &
  Readonly<{
    state: "requires_readd";
    articleNumber: null;
  }>;

export type QuoteBasketItemV3 =
  | ReadyStandardConfiguredItemV3
  | ReadyCustomConfiguredItemV3
  | RequiresValidationConfiguredItemV3
  | ReadyCatalogAccessoryItemV3
  | RequiresReaddCatalogAccessoryItemV3;

export type QuoteBasketDocumentV3 = Readonly<{
  schemaVersion: "3.0.0";
  revision: number;
  writerId: string;
  mutationId: string;
  updatedAt: string;
  expiresAt: string;
  items: readonly QuoteBasketItemV3[];
}>;

export type ReadyConfiguredDraftV3 = Readonly<{
  product: Readonly<{ model: string; publicPath: string }>;
  selection: QuoteBasketConfiguredSelectionV3;
  packaging: QuoteBasketConfiguredPackagingV3;
  articleNumber: string | null;
  resolution: "standard_ready" | "sales_follow_up";
  quantityUnit: "piece";
  quantity: number;
}>;

export type ReadyCatalogAccessoryDraftV3 = CatalogAccessoryDraft &
  Readonly<{
    articleNumber: string;
    quantityUnit: "piece";
  }>;
