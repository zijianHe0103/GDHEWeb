import "server-only";

export type MixedQuoteLineColor = Readonly<{
  code: string;
  label: string;
}>;

export type MixedQuoteLinePackaging = Readonly<{
  basePackaging: "standard" | "carton" | "large_shrink_wrap";
  logoPrinting: boolean;
  protectionArrangement: "single_bag" | "paired" | null;
}>;

export type ConfiguredQuoteLineRequest = Readonly<{
  entryId: string;
  lineKind: "configured_product";
  canonicalPath: string;
  selection: Readonly<{
    type: "article_number" | "custom_length";
    articleNumber: string | null;
    lengthMeters: number;
    color: MixedQuoteLineColor;
    resolution: "standard_ready" | "refresh_from_selection" | "sales_follow_up";
  }>;
  packaging: MixedQuoteLinePackaging;
  quantityUnit: "piece";
  quantity: number;
}>;

export type CatalogAccessoryQuoteLineRequest = Readonly<{
  entryId: string;
  lineKind: "catalog_accessory";
  articleNumber: string;
  quantityUnit: "piece";
  quantity: number;
}>;

export type MixedQuoteLineRequestLine =
  | ConfiguredQuoteLineRequest
  | CatalogAccessoryQuoteLineRequest;

export type MixedQuoteLineValidationRequest = Readonly<{
  apiVersion: "1";
  schemaVersion: "1.0.0";
  locale: "en";
  lines: readonly MixedQuoteLineRequestLine[];
}>;

export type MixedQuoteLineValidationDto = Readonly<{
  apiVersion: "1";
  schemaVersion: "1.0.0";
  locale: "en";
  type: "mixed_quote_line_validation";
  lines: readonly Readonly<Record<string, unknown>>[];
}>;
