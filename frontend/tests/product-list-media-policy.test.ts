import { describe, expect, test } from "vitest";

import { isSafeFrontendMediaPath } from "../src/lib/product-list/media-policy";

describe("ProductList media policy", () => {
  test.each([
    "https://cms.example.com/wp-content/uploads/protected.webp",
    "//cms.example.com/wp-content/uploads/protected.webp",
    "/\\cms.example.com/wp-content/uploads/protected.webp",
    "https://user:secret@cms.example.com/protected.webp",
    "/media/bad%zz-image.webp",
  ])("rejects non-authorized media path %s", (value) => {
    expect(isSafeFrontendMediaPath(value)).toBe(false);
  });

  test.each([
    "/media/products/protected.webp",
    "/test-candidates/fgd-x15-protected.png?size=card",
  ])("accepts safe root-relative media path %s", (value) => {
    expect(isSafeFrontendMediaPath(value)).toBe(true);
  });
});
