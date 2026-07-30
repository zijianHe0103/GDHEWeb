import "server-only";

export type ProductListMode = "disabled" | "preview" | "cms";

export function readProductListMode(): ProductListMode {
  if (process.env.NODE_ENV === "production") {
    return "disabled";
  }

  const mode = process.env.GDHE_PRODUCT_LIST_MODE;
  return mode === "preview" || mode === "cms" ? mode : "disabled";
}
