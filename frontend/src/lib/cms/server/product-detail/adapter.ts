import "server-only";

import type {
  ProductDetailDto,
  ProductDetailSpecificationDto,
} from "../../../../types/product-detail";
import {
  validateCmsSuccessPayload,
  type ValidatedCmsPayload,
} from "../validation";

type ProductSpecificationView = {
  key: unknown;
  value: unknown;
  unit?: unknown;
};

type ProductPageView = {
  id: unknown;
  type: unknown;
  templateKey: unknown;
  locale: unknown;
  publicPath: unknown;
  title: unknown;
  details: {
    model?: unknown;
    categories?: unknown;
    installationTypes?: unknown;
    positioning?: unknown;
    specifications?: unknown;
  };
};

type RequiredSpecification = Readonly<{
  key: string;
  value: string;
  unit: string;
}>;

const requiredSpecifications: readonly RequiredSpecification[] = Object.freeze([
  Object.freeze({ key: "cross_section_width", value: "28", unit: "mm" }),
  Object.freeze({ key: "cross_section_height", value: "27", unit: "mm" }),
  Object.freeze({ key: "representative_length", value: "6", unit: "m" }),
  Object.freeze({ key: "track_weight", value: "155–160", unit: "g/m" }),
  Object.freeze({ key: "pvc_strip_weight", value: "115", unit: "g/m" }),
]);

export class ProductDetailContractError extends Error {
  readonly category = "product_detail";
  readonly kind = "invalid_candidate";

  constructor() {
    super("Product detail candidate did not satisfy the frozen contract.");
    this.name = "ProductDetailContractError";
  }
}

export function adaptProductDetail(
  validated: ValidatedCmsPayload<"success">,
): ProductDetailDto {
  const body = validateCmsSuccessPayload.getValidatedBody(
    validated,
  ) as ProductPageView;
  const details = body.details;

  if (
    body.type !== "product" ||
    body.templateKey !== "product" ||
    body.locale !== "en" ||
    body.publicPath !== "/products/fgd-x15-pvc/" ||
    body.title !== "FGD X15+PVC Track" ||
    details.model !== "FGD X15+PVC" ||
    !isStringArray(details.categories) ||
    !details.categories.includes("manual-curtain-tracks") ||
    !isStringArray(details.installationTypes) ||
    !details.installationTypes.includes("ceiling-mounted") ||
    !details.installationTypes.includes("wall-mounted") ||
    typeof details.positioning !== "string" ||
    details.positioning.trim() === "" ||
    typeof body.id !== "string" ||
    !hasExactSpecifications(details.specifications)
  ) {
    throw new ProductDetailContractError();
  }

  return Object.freeze({
    id: body.id,
    model: "FGD X15+PVC",
    name: "FGD X15+PVC Track",
    publicPath: "/products/fgd-x15-pvc/",
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
    overview: details.positioning,
    specifications: detailSpecifications(),
    action: Object.freeze({
      mode: "request_quote",
      label: "Request a Quote",
      target: "/request-a-quote/",
    }),
  });
}

function isStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function hasExactSpecifications(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return requiredSpecifications.every((required) => {
    const matches = value.filter(
      (candidate): candidate is ProductSpecificationView =>
        isSpecification(candidate) && candidate.key === required.key,
    );
    return (
      matches.length === 1 &&
      matches[0].value === required.value &&
      matches[0].unit === required.unit
    );
  });
}

function isSpecification(value: unknown): value is ProductSpecificationView {
  return typeof value === "object" && value !== null;
}

function detailSpecifications(): readonly ProductDetailSpecificationDto[] {
  return Object.freeze([
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
  ]);
}
