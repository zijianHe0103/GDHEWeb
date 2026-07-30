export type ProductCardImageDto = Readonly<{
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
}>;

export type ProductCardTaxonomyRefDto = Readonly<{
  id: string;
  label: string;
  publicPath: string;
}>;

export type ProductCardAttributeDto = Readonly<{
  key: string;
  label: string;
  value: string;
  unit: string | null;
}>;

export type ProductCardActionDto =
  | Readonly<{
      mode: "view_product";
      label: "View Product";
      targetPath: string;
    }>
  | Readonly<{
      mode: "direct_rfq";
      label: "Request a Quote";
      targetPath: "/request-a-quote/";
    }>
  | Readonly<{
      mode: "replacement_contact";
      label: "Contact Us for Replacement";
      targetPath: "/contact/";
    }>;

export type ProductCardDto = Readonly<{
  id: string;
  kind: "detail_product" | "catalog_accessory";
  model: string;
  name: string;
  publicPath: string | null;
  image: ProductCardImageDto;
  primaryCategory: ProductCardTaxonomyRefDto;
  series: readonly ProductCardTaxonomyRefDto[];
  applications: readonly ProductCardTaxonomyRefDto[];
  summary: string | null;
  keyAttributes: readonly ProductCardAttributeDto[];
  lifecycle: "active" | "discontinued";
  action: ProductCardActionDto;
  modifiedAt: string;
}>;

export type ProductCardCollectionDto = Readonly<{
  apiVersion: "1";
  schemaVersion: "1.0.0";
  locale: "en";
  type: "product_card";
  sort: "modified_desc" | "title_asc";
  filter: `product_category:${string}` | null;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  items: readonly ProductCardDto[];
}>;
