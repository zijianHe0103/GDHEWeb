import { afterEach, describe, expect, test } from "vitest";

import {
  PRODUCT_DETAIL_PUBLIC_PATH,
  readProductDetailMode,
} from "../src/lib/product-detail/config";
import { previewProductDetail } from "../src/lib/product-detail/preview";

const originalEnvironment = {
  mode: process.env.GDHE_PRODUCT_DETAIL_MODE,
  node: process.env.NODE_ENV,
};

afterEach(() => {
  restoreEnvironment("GDHE_PRODUCT_DETAIL_MODE", originalEnvironment.mode);
  restoreEnvironment("NODE_ENV", originalEnvironment.node);
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe("Product Detail local configuration and preview DTO", () => {
  test.each([
    [undefined, "disabled"],
    ["unknown", "disabled"],
    ["preview", "preview"],
    ["cms", "cms"],
  ] as const)("maps %s to %s outside production", (value, expected) => {
    restoreEnvironment("NODE_ENV", "test");
    restoreEnvironment("GDHE_PRODUCT_DETAIL_MODE", value);

    expect(readProductDetailMode()).toBe(expected);
  });

  test.each(["preview", "cms"])(
    "hard-disables %s in production",
    (mode) => {
      restoreEnvironment("NODE_ENV", "production");
      process.env.GDHE_PRODUCT_DETAIL_MODE = mode;

      expect(readProductDetailMode()).toBe("disabled");
    },
  );

  test("freezes the exact local candidate without internal fields", () => {
    expect(PRODUCT_DETAIL_PUBLIC_PATH).toBe("/products/fgd-x15-pvc/");
    expect(previewProductDetail).toMatchObject({
      model: "FGD X15+PVC",
      name: "FGD X15+PVC Track",
      publicPath: PRODUCT_DETAIL_PUBLIC_PATH,
      image: {
        url: "/test-candidates/fgd-x15-protected.png",
        width: 800,
        height: 800,
      },
      primaryCategory: {
        label: "Manual Curtain Tracks",
        publicPath:
          "/products/curtain-track-systems/manual-curtain-tracks/",
      },
      action: {
        mode: "request_quote",
        label: "Request a Quote",
        target: "/request-a-quote/",
      },
    });
    expect(previewProductDetail.specifications).toEqual([
      {
        key: "cross_section",
        label: "Cross-section",
        value: "28 × 27 mm",
      },
      {
        key: "representative_length",
        label: "Representative length",
        value: "6 m",
      },
      {
        key: "installation",
        label: "Installation",
        value: "Ceiling or wall mount",
      },
      {
        key: "track_weight",
        label: "Track weight",
        value: "155–160 g/m",
      },
      {
        key: "pvc_strip_weight",
        label: "PVC strip weight",
        value: "115 g/m",
      },
    ]);
    expect(Object.isFrozen(previewProductDetail)).toBe(true);
    expect(Object.isFrozen(previewProductDetail.specifications)).toBe(true);
    expect(JSON.stringify(previewProductDetail)).not.toMatch(
      /article|productCode|wordpress|wp-content/i,
    );
  });
});
