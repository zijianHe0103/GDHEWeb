export type ProductDetailImageDto = Readonly<{
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
}>;

export type ProductDetailCategoryDto = Readonly<{
  id: string;
  label: string;
  publicPath: string;
}>;

export type ProductDetailSpecificationDto = Readonly<{
  key:
    | "cross_section"
    | "representative_length"
    | "installation"
    | "track_weight"
    | "pvc_strip_weight";
  label: string;
  value: string;
}>;

export type ProductDetailDto = Readonly<{
  id: string;
  model: "FGD X15+PVC";
  name: "FGD X15+PVC Track";
  publicPath: "/products/fgd-x15-pvc/";
  image: ProductDetailImageDto;
  primaryCategory: ProductDetailCategoryDto;
  overview: string;
  specifications: readonly ProductDetailSpecificationDto[];
  action: Readonly<{
    mode: "request_quote";
    label: "Request a Quote";
    target: "/request-a-quote/";
  }>;
}>;
