import "server-only";

import type {
  ProductCardCollectionDto,
  ProductCardDto,
} from "../../types/product-card";

const previewCard: ProductCardDto = Object.freeze({
  id: "17000000-0000-4000-8000-000000000001",
  kind: "detail_product",
  model: "FGD X15+PVC",
  name: "FGD X15+PVC Track",
  publicPath: "/products/fgd-x15-pvc/",
  image: Object.freeze({
    id: "17000000-0000-4000-8000-000000000002",
    url: "/test-candidates/fgd-x15-protected.png",
    width: 800,
    height: 800,
    alt: "Protected FGD X15 curtain track cross-section showing 28 by 27 millimetre dimensions",
  }),
  primaryCategory: Object.freeze({
    id: "17000000-0000-4000-8000-000000000003",
    label: "Manual Curtain Tracks",
    publicPath:
      "/products/curtain-track-systems/manual-curtain-tracks/",
  }),
  series: Object.freeze([]),
  applications: Object.freeze([]),
  summary:
    "A manual curtain track candidate shown only for local layout testing.",
  keyAttributes: Object.freeze([
    Object.freeze({
      key: "cross_section",
      label: "Cross-section",
      value: "28 × 27",
      unit: "mm",
    }),
    Object.freeze({
      key: "representative_length",
      label: "Representative length",
      value: "6",
      unit: "m",
    }),
  ]),
  lifecycle: "active",
  action: Object.freeze({
    mode: "view_product",
    label: "View Product",
    targetPath: "/products/fgd-x15-pvc/",
  }),
  modifiedAt: "2026-07-30T00:00:00Z",
});

export const previewProductCardCollection: ProductCardCollectionDto =
  Object.freeze({
    apiVersion: "1",
    schemaVersion: "1.0.0",
    locale: "en",
    type: "product_card",
    sort: "modified_desc",
    filter: null,
    page: 1,
    perPage: 12,
    total: 1,
    totalPages: 1,
    items: Object.freeze([previewCard]),
  });
