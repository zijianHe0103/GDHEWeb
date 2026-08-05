import "server-only";

import type { PublicQuoteBasketProduct } from "../../types/quote-basket";
import type { ProductDetailDto } from "../../types/product-detail";

export function projectQuoteBasketProduct(
  detail: ProductDetailDto,
): PublicQuoteBasketProduct {
  if (
    detail.model !== "FGD X15+PVC" ||
    detail.name !== "FGD X15+PVC Track" ||
    detail.publicPath !== "/products/fgd-x15-pvc/"
  ) {
    throw new TypeError("The public quote product is unavailable.");
  }

  return Object.freeze({
    model: detail.model,
    name: detail.name,
    publicPath: detail.publicPath,
    image: Object.freeze({
      url: "/test-candidates/fgd-x15-protected.png",
      width: 800,
      height: 800,
      alt: "Protected FGD X15+PVC curtain track cross-section",
    }),
  });
}
