import "server-only";

import type { ProductDetailDto } from "../../types/product-detail";
import type { ProductConfigurationV2Dto } from "../../types/product-configuration-v2";
import { CmsHttpError, resolveCmsPath } from "../cms/server";
import { loadProductConfigurationV2 } from "../cms/server/product-configurations-v2";
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
    return Object.freeze({
      kind: "ready",
      detail,
      configurationState,
      preview: false,
    });
  } catch (error) {
    if (isValidatedNotFound(error)) {
      return Object.freeze({ kind: "not_found" });
    }
    return Object.freeze({ kind: "unavailable" });
  }
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
