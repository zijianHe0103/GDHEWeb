export type PublicRelatedProductImage = Readonly<{
  url: string;
  width: number;
  height: number;
  alt: string;
}>;

export type PublicRelatedProductDescriptor = Readonly<{
  model: string;
  name: string;
  image: PublicRelatedProductImage;
}>;

export type PublicRelatedProduct = Readonly<{
  key: string;
  product: PublicRelatedProductDescriptor;
  summary: string | null;
  attributes: readonly Readonly<{
    label: string;
    value: string;
    unit: string | null;
  }>[];
  candidateNotice: "Protected TEST_CANDIDATE — not production product data";
  action:
    | Readonly<{ kind: "view"; href: string }>
    | Readonly<{
      kind: "quote";
      catalogPath: string;
      articleNumber?: string;
      quantityUnit: "piece";
      }>;
}>;
