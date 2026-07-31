import "server-only";

import type { ProductDetailDto } from "../../types/product-detail";
import { PRODUCT_DETAIL_PUBLIC_PATH } from "./config";

export const previewProductDetail: ProductDetailDto = Object.freeze({
  id: "17000000-0000-4000-8000-000000000001",
  model: "FGD X15+PVC",
  name: "FGD X15+PVC Track",
  publicPath: PRODUCT_DETAIL_PUBLIC_PATH,
  image: Object.freeze({
    id: "17000000-0000-4000-8000-000000000002",
    url: "/test-candidates/fgd-x15-protected.png",
    width: 800,
    height: 800,
    alt: "Protected FGD X15+PVC curtain track cross-section",
  }),
  primaryCategory: Object.freeze({
    id: "17000000-0000-4000-8000-000000000003",
    label: "Manual Curtain Tracks",
    publicPath:
      "/products/curtain-track-systems/manual-curtain-tracks/",
  }),
  overview:
    "Replaceable local test copy for the FGD X15+PVC manual curtain track candidate.",
  specifications: Object.freeze([
    Object.freeze({
      key: "cross_section",
      label: "Cross-section",
      value: "28 × 27 mm",
    }),
    Object.freeze({
      key: "representative_length",
      label: "Representative length",
      value: "6 m",
    }),
    Object.freeze({
      key: "installation",
      label: "Installation",
      value: "Ceiling or wall mount",
    }),
    Object.freeze({
      key: "track_weight",
      label: "Track weight",
      value: "155–160 g/m",
    }),
    Object.freeze({
      key: "pvc_strip_weight",
      label: "PVC strip weight",
      value: "115 g/m",
    }),
  ]),
  action: Object.freeze({
    mode: "request_quote",
    label: "Request a Quote",
    target: "/request-a-quote/",
  }),
});
