import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

import ProductDetailPage, {
  dynamic,
  metadata,
} from "../src/app/products/fgd-x15-pvc/page";
import {
  ProductDetailUnavailable,
  ProductDetailView,
} from "../src/components/product-detail";
import productSample from "../src/lib/cms/contracts/samples/success/resolve-product-alpha.json";
import configurationSample from "../src/lib/cms/product-configuration-v2-contract/samples/success/fgd-x15-pvc.json";
import relatedSample from "../src/lib/cms/related-product-card-contract/samples/success/four-plus.json";
import { previewProductDetail } from "../src/lib/product-detail/preview";

const originalEnvironment = {
  mode: process.env.GDHE_PRODUCT_DETAIL_MODE,
  wordpress: process.env.WORDPRESS_API_URL,
};

afterEach(() => {
  restoreEnvironment("GDHE_PRODUCT_DETAIL_MODE", originalEnvironment.mode);
  restoreEnvironment("WORDPRESS_API_URL", originalEnvironment.wordpress);
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe("FGD X15+PVC local Product Detail route", () => {
  test("renders only Hero, Overview and five Key Specifications", () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailView, {
        detail: previewProductDetail,
        preview: true,
      }),
    );

    expect(html).toContain(">FGD X15+PVC Track</h1>");
    expect(html).toContain("Product Overview");
    expect(html).toContain("Key Specifications");
    expect((html.match(/<dt>/g) ?? [])).toHaveLength(5);
    expect(html).toContain("28 × 27 mm");
    expect(html).toContain("Ceiling or wall mount");
    expect(html).toContain(
      'href="/products/curtain-track-systems/manual-curtain-tracks/"',
    );
    expect(html).toContain('href="/request-a-quote/"');
    expect(html).toContain(">Request a Quote</a>");
    expect(html).toContain(
      "Local test candidate — details and copy remain replaceable",
    );
    expect(html).toContain(
      'alt="Protected FGD X15+PVC curtain track cross-section"',
    );
    expect(html).not.toMatch(
      /article number|productCode|GDHEPRD|wp-content|wordpress|cms\.example/i,
    );
  });

  test("renders a fixed unavailable state without diagnostics", () => {
    const html = renderToStaticMarkup(createElement(ProductDetailUnavailable));

    expect(html).toContain("Product details are temporarily unavailable.");
    expect(html).not.toMatch(/cms|schema|wordpress|error|diagnostic/i);
  });

  test("maps disabled and validated not-found states to framework 404", async () => {
    delete process.env.GDHE_PRODUCT_DETAIL_MODE;
    await expect(ProductDetailPage()).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });

  test("renders preview through the real route with zero browser-owned data", async () => {
    process.env.GDHE_PRODUCT_DETAIL_MODE = "preview";
    const html = renderToStaticMarkup(await ProductDetailPage());

    expect(html).toContain("FGD X15+PVC Track");
    expect(html).toContain("/test-candidates/fgd-x15-protected.png");
    expect(html).toContain('href="#configure-product"');
    expect(html).toContain(">Configure &amp; Add to Quote</a>");
    expect(html).toContain('id="configure-product"');
    expect(html).toContain("Configure Your Track");
    expect(html).toContain("Add to Quote");
    expect(html).toContain("6 m");
    expect(html).toContain("Choose a track length first.");
    expect(html).toContain("Saved in this browser for 30 days");
    expect(html).toContain('href="/request-a-quote/"');
    expect(html).toContain("You May Also Need");
    expect((html.match(/<li><article/g) ?? [])).toHaveLength(3);
    expect(html).toContain("Show More Products");
    expect(html).toContain("Protected TEST_CANDIDATE");
    expect(html).not.toMatch(/wp-content|wordpress|GDHEPRD|productCode/i);
  });

  test("renders one hostile-media CMS resolve through the real route without leakage", async () => {
    const hostileOrigin = "https://hostile-wordpress.example";
    const hostileUrl = `${hostileOrigin}/wp-content/uploads/private-track.webp`;
    const paths: string[] = [];

    await withLoopbackServer((path, response) => {
      paths.push(path);
      if (path.startsWith("/wp-json/gdhe/v1/product-configurations?")) {
        response.writeHead(200, {
          "content-type": "application/json",
          etag: '"configuration"',
          "cache-control": "public, max-age=60",
        });
        response.end(JSON.stringify(configurationSample));
      } else if (path.startsWith("/wp-json/gdhe/v1/related-product-cards?")) {
        response.writeHead(200, {
          "content-type": "application/json",
          etag: '"related"',
          "cache-control": "public, max-age=60",
        });
        response.end(JSON.stringify(relatedSample));
      } else {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(hostileCmsCandidate(hostileUrl)));
      }
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_DETAIL_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      const html = renderToStaticMarkup(await ProductDetailPage());

      expect(paths).toEqual([
        "/wp-json/gdhe/v1/resolve?locale=en&path=%2Fproducts%2Ffgd-x15-pvc%2F&schema=3.0.0",
        "/wp-json/gdhe/v1/product-configurations?locale=en&schema=2.0.0&path=%2Fproducts%2Ffgd-x15-pvc%2F",
        "/wp-json/gdhe/v1/related-product-cards?locale=en&schema=1.0.0&source_path=%2Fproducts%2Ffgd-x15-pvc%2F",
      ]);
      expect(paths.filter((path) => path.includes("/resolve?"))).toHaveLength(1);
      expect(paths.every((path) => !path.includes("/gdhe/v1/product-cards?"))).toBe(true);
      expect(html).toContain("/test-candidates/fgd-x15-protected.png");
      expect(html).toContain(
        "Local CMS test candidate — not a production product page",
      );
      expect(html).not.toContain(hostileOrigin);
      expect(html).not.toContain(hostileUrl);
      expect(html).not.toContain("wp-content");
      expect(html).not.toContain("media.gdhe.example");
      expect(html).not.toContain("You May Also Need");
      expect(html).not.toMatch(/<link[^>]+rel="preload"[^>]+https?:/);
      expect(html).not.toMatch(/<img[^>]+https?:/);
      expect(html).not.toMatch(
        /GDHEPRD000172|INTERNAL-CODE-MUST-NOT-LEAK|RAW_PAYLOAD_DIAGNOSTIC_MARKER|productCode|articleNumbers/,
      );
    });
  });

  test("exports force-dynamic and fixed noindex metadata", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(metadata).toMatchObject({
      robots: { index: false, follow: false },
    });
  });

  test("keeps React DTO-only and the CTA keyboard-visible", async () => {
    const componentSource = await readFile(
      new URL("../src/components/product-detail/index.tsx", import.meta.url),
      "utf8",
    );
    const cssSource = await readFile(
      new URL(
        "../src/components/product-detail/product-detail.module.css",
        import.meta.url,
      ),
      "utf8",
    );

    expect(componentSource).toContain(
      'import type { ProductDetailDto } from "../../types/product-detail"',
    );
    expect(componentSource).not.toMatch(
      /\bfetch\s*\(|process\.env|ValidatedCmsPayload|cms\/contracts|featuredMedia|gallery/,
    );
    expect(cssSource).toContain(":focus-visible");
    expect(cssSource).toMatch(/min-height:\s*2\.75rem/);
    expect(cssSource).toMatch(/@media\s*\(max-width:/);
  });

  test("keeps Product Detail cards width-safe and model tokens intact", async () => {
    const cssSource = await readFile(
      new URL(
        "../src/components/product-detail/product-detail.module.css",
        import.meta.url,
      ),
      "utf8",
    );

    expect(cssSource).toMatch(
      /\.hero,\s*\.overview,\s*\.specifications\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*100%;[^}]*\}/,
    );
    expect(cssSource).toMatch(
      /\.hero\s*\{[^}]*max-width:\s*100%;[^}]*\}/,
    );
    expect(cssSource).toMatch(
      /\.hero h1\s*\{[^}]*overflow-wrap:\s*normal;[^}]*\}/,
    );
    expect(cssSource).not.toMatch(
      /\.hero h1\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*\}/,
    );
  });
});

function hostileCmsCandidate(hostileUrl: string): Record<string, unknown> {
  const payload = structuredClone(productSample);
  return {
    ...payload,
    id: "17000000-0000-4000-8000-000000000001",
    publicPath: "/products/fgd-x15-pvc/",
    title: "FGD X15+PVC Track",
    featuredMedia: {
      id: "17000000-0000-4000-8000-000000000099",
      url: hostileUrl,
      mimeType: "image/webp",
      width: 800,
      height: 800,
      alt: "Hostile WordPress media",
      decorative: false,
    },
    modules: [
      {
        ...payload.modules[0],
        data: {
          ...(payload.modules[0].data as Record<string, unknown>),
          safeHtml: "<p>RAW_PAYLOAD_DIAGNOSTIC_MARKER</p>",
        },
      },
    ],
    details: {
      ...payload.details,
      model: "FGD X15+PVC",
      productCode: "INTERNAL-CODE-MUST-NOT-LEAK",
      categories: ["manual-curtain-tracks"],
      installationTypes: ["ceiling-mounted", "wall-mounted"],
      positioning: "Replaceable CMS test copy.",
      specifications: [
        { key: "cross_section_width", label: "Width", value: "28", unit: "mm" },
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
          url: hostileUrl,
          mimeType: "image/webp",
          width: 800,
          height: 800,
          alt: "Hostile WordPress gallery",
          decorative: false,
        },
      ],
    },
  };
}

async function withLoopbackServer(
  listener: (path: string, response: ServerResponse) => void,
  assertion: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = createServer((request, response) => {
    listener(request.url ?? "", response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new TypeError("Expected loopback address.");
  }

  try {
    await assertion(`http://127.0.0.1:${address.port}/wp-json`);
  } finally {
    server.close();
    await once(server, "close");
  }
}
