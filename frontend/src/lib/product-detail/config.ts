import "server-only";

export const PRODUCT_DETAIL_PUBLIC_PATH = "/products/fgd-x15-pvc/" as const;

export type ProductDetailMode = "disabled" | "preview" | "cms";

export function readProductDetailMode(): ProductDetailMode {
  if (process.env.NODE_ENV === "production") {
    return "disabled";
  }

  const mode = process.env.GDHE_PRODUCT_DETAIL_MODE;
  return mode === "preview" || mode === "cms" ? mode : "disabled";
}
