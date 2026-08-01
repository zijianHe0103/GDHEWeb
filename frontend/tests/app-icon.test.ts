import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

describe("App Router fallback icon", () => {
  test("is a small self-contained non-production GDHE SVG", async () => {
    const icon = await readFile(
      new URL("../src/app/icon.svg", import.meta.url),
      "utf8",
    );

    expect(Buffer.byteLength(icon)).toBeLessThanOrEqual(1_200);
    expect(icon).toMatch(/^<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(icon).toContain("GDHE");
    expect(icon).toContain("non-production fallback");
    expect(icon).toContain("approved final brand favicon");
    expect(icon).toMatch(/<\/svg>\n$/);
    expect(icon).not.toMatch(
      /<script\b|<animate\b|<image\b|\bhref=|\burl\(|\bdata:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i,
    );
    expect(icon).not.toMatch(
      /article number|product code|supplier|cost|price|inventory|credential|wordpress|feishu/i,
    );
  });
});
