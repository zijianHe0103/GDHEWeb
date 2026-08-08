import type { ProductCardDto } from "./product-card";

export type RelatedProductDirectQuoteDto = Readonly<{
  kind: "catalog_accessory";
  quantityUnit: "piece";
}>;

export type RelatedProductCardItemDto = Readonly<{
  card: ProductCardDto;
  directQuote: RelatedProductDirectQuoteDto | null;
}>;

export type RelatedProductCardCollectionDto = Readonly<{
  apiVersion: "1";
  schemaVersion: "1.0.0";
  locale: "en";
  type: "related_product_card";
  sourcePath: string;
  items: readonly RelatedProductCardItemDto[];
}>;
