import { describe, expect, test } from "vitest";

import productSample from "../src/lib/cms/contracts/samples/success/resolve-product-alpha.json";
import { adaptProductDetail } from "../src/lib/cms/server/product-detail/adapter";
import { validateCmsSuccessPayload } from "../src/lib/cms/server/validation";

function candidatePayload(): Record<string, unknown> {
  return {
    ...structuredClone(productSample),
    id: "17000000-0000-4000-8000-000000000001",
    publicPath: "/products/fgd-x15-pvc/",
    title: "FGD X15+PVC Track",
    featuredMedia: {
      id: "17000000-0000-4000-8000-000000000099",
      url: "https://cms.example.com/wp-content/uploads/internal.webp",
      mimeType: "image/webp",
      alt: "CMS media that must not cross the Adapter",
      width: 800,
      height: 800,
      decorative: false,
    },
    details: {
      ...(structuredClone(productSample.details) as Record<string, unknown>),
      model: "FGD X15+PVC",
      productCode: "INTERNAL-CODE-MUST-NOT-LEAK",
      categories: ["manual-curtain-tracks"],
      installationTypes: ["ceiling-mounted", "wall-mounted"],
      positioning: "Replaceable CMS test copy for this manual curtain track.",
      specifications: [
        {
          key: "cross_section_width",
          label: "Width",
          value: "28",
          unit: "mm",
        },
        {
          key: "cross_section_height",
          label: "Height",
          value: "27",
          unit: "mm",
        },
        {
          key: "representative_length",
          label: "Representative length",
          value: "6",
          unit: "m",
        },
        {
          key: "track_weight",
          label: "Track weight",
          value: "155–160",
          unit: "g/m",
        },
        {
          key: "pvc_strip_weight",
          label: "PVC strip weight",
          value: "115",
          unit: "g/m",
        },
      ],
      articleNumbers: [{ number: "GDHEPRD000172", region: "Global" }],
      gallery: [
        {
          id: "17000000-0000-4000-8000-000000000098",
          url: "https://cms.example.com/wp-content/uploads/gallery.webp",
          mimeType: "image/webp",
          alt: "CMS gallery",
          width: 800,
          height: 800,
          decorative: false,
        },
      ],
    },
  };
}

describe("Product Detail authentic Adapter", () => {
  test("maps the exact validated candidate to a deeply frozen DTO", () => {
    const validated = validateCmsSuccessPayload(candidatePayload());
    const detail = adaptProductDetail(validated);
    const serialized = JSON.stringify(detail);

    expect(detail).toMatchObject({
      id: "17000000-0000-4000-8000-000000000001",
      model: "FGD X15+PVC",
      name: "FGD X15+PVC Track",
      publicPath: "/products/fgd-x15-pvc/",
      overview: "Replaceable CMS test copy for this manual curtain track.",
    });
    expect(detail.specifications.map(({ value }) => value)).toEqual([
      "28 × 27 mm",
      "6 m",
      "Ceiling or wall mount",
      "155–160 g/m",
      "115 g/m",
    ]);
    expect(Object.isFrozen(detail)).toBe(true);
    expect(Object.isFrozen(detail.image)).toBe(true);
    expect(Object.isFrozen(detail.specifications)).toBe(true);
    expect(serialized).not.toMatch(
      /GDHEPRD000172|INTERNAL-CODE|wp-content|cms\.example|articleNumbers|gallery|modules|relations/,
    );
  });

  test("rejects raw and forged wrapper inputs", () => {
    expect(() => adaptProductDetail(candidatePayload() as never)).toThrow();
    expect(() =>
      adaptProductDetail({ kind: "success", body: candidatePayload() } as never),
    ).toThrow();
  });

  test.each([
    ["publicPath", "/products/other/"],
    ["title", "Other Product"],
  ])("rejects a mismatched %s", (field, value) => {
    const payload = candidatePayload();
    payload[field] = value;

    expectProductDetailContractError(() =>
      adaptProductDetail(validateCmsSuccessPayload(payload)),
    );
  });

  test.each([
    ["model", "FGD X15"],
    ["categories", ["other-category"]],
    ["installationTypes", ["ceiling-mounted"]],
  ])("rejects mismatched details.%s", (field, value) => {
    const payload = candidatePayload();
    (payload.details as Record<string, unknown>)[field] = value;

    expectProductDetailContractError(() =>
      adaptProductDetail(validateCmsSuccessPayload(payload)),
    );
  });

  test("rejects missing, duplicate, value and unit specification mismatches", () => {
    const mutations = [
      (specs: unknown[]) => specs.slice(1),
      (specs: unknown[]) => [...specs, specs[0]],
      (specs: unknown[]) => {
        (specs[0] as Record<string, unknown>).value = "29";
        return specs;
      },
      (specs: unknown[]) => {
        (specs[0] as Record<string, unknown>).unit = "cm";
        return specs;
      },
    ];

    for (const mutate of mutations) {
      const payload = candidatePayload();
      const details = payload.details as Record<string, unknown>;
      details.specifications = mutate(
        structuredClone(details.specifications) as unknown[],
      );

      expectProductDetailContractError(() =>
        adaptProductDetail(validateCmsSuccessPayload(payload)),
      );
    }
  });
});

function expectProductDetailContractError(operation: () => unknown): void {
  try {
    operation();
  } catch (error) {
    expect(error).toMatchObject({
      name: "ProductDetailContractError",
      kind: "invalid_candidate",
    });
    return;
  }

  throw new Error("Expected ProductDetailContractError.");
}
