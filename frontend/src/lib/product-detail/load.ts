import "server-only";

import type { ProductDetailDto } from "../../types/product-detail";
import type { ProductConfigurationV2Dto } from "../../types/product-configuration-v2";
import type { RelatedProductCardCollectionDto } from "../../types/related-product-card";
import { CmsHttpError, resolveCmsPath } from "../cms/server";
import { loadProductConfigurationV2 } from "../cms/server/product-configurations-v2";
import { loadRelatedProductCardCollection } from "../cms/server/related-product-cards";
import { adaptProductDetail } from "../cms/server/product-detail/adapter";
import {
  validateCmsErrorPayload,
  validateCmsSuccessPayload,
} from "../cms/server/validation";
import { PRODUCT_DETAIL_PUBLIC_PATH, readProductDetailMode } from "./config";
import { previewProductDetail } from "./preview";
import { previewProductConfigurationV2 } from "../product-configuration/v2/preview";

export type ProductConfigurationPageState =
  | Readonly<{
      kind: "ready";
      configuration: ProductConfigurationV2Dto;
    }>
  | Readonly<{ kind: "unavailable" }>;

export type ProductDetailPageState =
  | Readonly<{ kind: "disabled" }>
  | Readonly<{ kind: "not_found" }>
  | Readonly<{ kind: "unavailable" }>
  | Readonly<{
      kind: "ready";
      detail: ProductDetailDto;
      configurationState: ProductConfigurationPageState;
      relatedProducts: RelatedProductCardCollectionDto;
      preview: boolean;
    }>;

type ValidatedErrorView = {
  code: unknown;
  status: unknown;
};

export async function loadProductDetailPage(): Promise<ProductDetailPageState> {
  const mode = readProductDetailMode();
  if (mode === "disabled") {
    return Object.freeze({ kind: "disabled" });
  }
  if (mode === "preview") {
    return Object.freeze({
      kind: "ready",
      detail: previewProductDetail,
      configurationState: Object.freeze({
        kind: "ready",
        configuration: previewProductConfigurationV2,
      }),
      relatedProducts: emptyRelatedProducts(),
      preview: true,
    });
  }

  try {
    const response = await resolveCmsPath(PRODUCT_DETAIL_PUBLIC_PATH);
    const validated = validateCmsSuccessPayload(response.body);
    const detail = adaptProductDetail(validated);
    let configurationState: ProductConfigurationPageState;
    try {
      configurationState = Object.freeze({
        kind: "ready",
        configuration: await loadProductConfigurationV2(),
      });
    } catch {
      configurationState = Object.freeze({ kind: "unavailable" });
    }
    let relatedProducts: RelatedProductCardCollectionDto;
    try {
      relatedProducts = await loadRelatedProductCardCollection(
        PRODUCT_DETAIL_PUBLIC_PATH,
      );
    } catch {
      relatedProducts = emptyRelatedProducts();
    }
    return Object.freeze({
      kind: "ready",
      detail,
      configurationState,
      relatedProducts,
      preview: false,
    });
  } catch (error) {
    if (isValidatedNotFound(error)) {
      return Object.freeze({ kind: "not_found" });
    }
    return Object.freeze({ kind: "unavailable" });
  }
}

function emptyRelatedProducts(): RelatedProductCardCollectionDto {
  return Object.freeze({
    apiVersion: "1",
    schemaVersion: "1.0.0",
    locale: "en",
    type: "related_product_card",
    sourcePath: PRODUCT_DETAIL_PUBLIC_PATH,
    items: Object.freeze([]),
  });
}

function isValidatedNotFound(error: unknown): boolean {
  if (
    !(error instanceof CmsHttpError) ||
    error.kind !== "not_found" ||
    error.status !== 404
  ) {
    return false;
  }

  try {
    const validated = validateCmsErrorPayload(error.body);
    const body = validated.body as ValidatedErrorView;
    return body.status === 404 && body.code === "gdhe_not_found";
  } catch {
    return false;
  }
}
