import { once } from "node:events";
import { createServer, type ServerResponse } from "node:http";

import { afterEach, describe, expect, test, vi } from "vitest";

import errors from "../src/lib/cms/contracts/samples/errors/resolve-errors.json";
import productSample from "../src/lib/cms/contracts/samples/success/resolve-product-alpha.json";
import configurationSample from "../src/lib/cms/product-configuration-v2-contract/samples/success/fgd-x15-pvc.json";
import relatedSample from "../src/lib/cms/related-product-card-contract/samples/success/four-plus.json";
import relatedErrors from "../src/lib/cms/related-product-card-contract/samples/errors/related-product-errors.json";
import { loadProductDetailPage } from "../src/lib/product-detail/load";

const originalEnvironment = {
  mode: process.env.GDHE_PRODUCT_DETAIL_MODE,
  wordpress: process.env.WORDPRESS_API_URL,
};

afterEach(() => {
  restoreEnvironment("GDHE_PRODUCT_DETAIL_MODE", originalEnvironment.mode);
  restoreEnvironment("WORDPRESS_API_URL", originalEnvironment.wordpress);
  vi.unstubAllGlobals();
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe("Product Detail page loader", () => {
  test("returns disabled for a closed mode", async () => {
    delete process.env.GDHE_PRODUCT_DETAIL_MODE;

    await expect(loadProductDetailPage()).resolves.toEqual({
      kind: "disabled",
    });
  });

  test("returns the preview DTO with zero network", async () => {
    process.env.GDHE_PRODUCT_DETAIL_MODE = "preview";
    const fetchSpy = vi.fn(() => {
      throw new Error("Preview mode must not use the network.");
    });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(loadProductDetailPage()).resolves.toMatchObject({
      kind: "ready",
      preview: true,
      detail: { publicPath: "/products/fgd-x15-pvc/" },
      configurationState: {
        kind: "ready",
        configuration: { options: [{ articleNumber: "GDHEPRD000172" }] },
      },
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("adds exactly one related collection request and zero per-card resolve", async () => {
    const paths: string[] = [];
    await withLoopbackServer((path, response) => {
      paths.push(path);
      if (path.startsWith("/wp-json/gdhe/v1/product-configurations?")) {
        sendJson(response, 200, configurationSample, {
          etag: '"configuration"',
          "cache-control": "public, max-age=60",
        });
      } else if (path.startsWith("/wp-json/gdhe/v1/related-product-cards?")) {
        sendJson(response, 200, relatedSample, {
          etag: '"related"',
          "cache-control": "public, max-age=60",
        });
      } else {
        sendJson(response, 200, candidatePayload());
      }
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_DETAIL_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      const state = await loadProductDetailPage();
      expect(state).toMatchObject({
        kind: "ready",
        preview: false,
        detail: { model: "FGD X15+PVC" },
        configurationState: {
          kind: "ready",
          configuration: { options: [{ articleNumber: "GDHEPRD000172" }] },
        },
      });
      expect(state.kind === "ready" && state.relatedProducts.items).toHaveLength(4);
      expect(
        state.kind === "ready" && state.relatedProducts.items[0].card.model,
      ).toBe("Flow Control Task-023-detail-alpha");
    });

    expect(paths).toEqual([
      "/wp-json/gdhe/v1/resolve?locale=en&path=%2Fproducts%2Ffgd-x15-pvc%2F&schema=3.0.0",
      "/wp-json/gdhe/v1/product-configurations?locale=en&schema=2.0.0&path=%2Fproducts%2Ffgd-x15-pvc%2F",
      "/wp-json/gdhe/v1/related-product-cards?locale=en&schema=1.0.0&source_path=%2Fproducts%2Ffgd-x15-pvc%2F",
    ]);
    expect(paths.every((path) => !path.includes("/gdhe/v1/product-cards?"))).toBe(true);
    expect(paths.filter((path) => path.includes("/resolve?"))).toHaveLength(1);
  });

  test("keeps the detail ready and omits only related products on related failure", async () => {
    const paths: string[] = [];
    await withLoopbackServer((path, response) => {
      paths.push(path);
      if (path.startsWith("/wp-json/gdhe/v1/product-configurations?")) {
        sendJson(response, 200, configurationSample, {
          etag: '"configuration"',
          "cache-control": "public, max-age=60",
        });
      } else if (path.startsWith("/wp-json/gdhe/v1/related-product-cards?")) {
        sendJson(response, 400, relatedErrors.unknown, {
          "cache-control": "no-store",
        });
      } else {
        sendJson(response, 200, candidatePayload());
      }
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_DETAIL_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      await expect(loadProductDetailPage()).resolves.toMatchObject({
        kind: "ready",
        configurationState: { kind: "ready" },
        relatedProducts: { items: [] },
      });
    });
    expect(paths).toHaveLength(3);
  });

  test("maps only a validated gdhe_not_found HTTP 404 to not_found", async () => {
    await withLoopbackServer((_path, response) => {
      sendJson(response, 404, errors.gdhe_not_found);
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_DETAIL_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      await expect(loadProductDetailPage()).resolves.toEqual({
        kind: "not_found",
      });
    });
  });

  test("keeps a ready detail but sanitizes a configuration failure", async () => {
    const paths: string[] = [];
    await withLoopbackServer((path, response) => {
      paths.push(path);
      if (path.startsWith("/wp-json/gdhe/v1/product-configurations?")) {
        sendJson(response, 400, errors.gdhe_invalid_schema, {
          "cache-control": "no-store",
        });
      } else {
        sendJson(response, 200, candidatePayload());
      }
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_DETAIL_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      await expect(loadProductDetailPage()).resolves.toMatchObject({
        kind: "ready",
        detail: { model: "FGD X15+PVC" },
        configurationState: { kind: "unavailable" },
      });
    });
    expect(paths).toHaveLength(3);
    expect(paths.every((path) => !path.includes("/gdhe/v1/product-cards?"))).toBe(true);
  });

  test.each([
    [404, { ...errors.gdhe_not_found, code: "other" }],
    [400, errors.gdhe_invalid_schema],
    [200, { invalid: true }],
  ])(
    "sanitizes status %s and invalid contract failures",
    async (status, body) => {
      await withLoopbackServer((_path, response) => {
        sendJson(response, status, body);
      }, async (baseUrl) => {
        process.env.GDHE_PRODUCT_DETAIL_MODE = "cms";
        process.env.WORDPRESS_API_URL = baseUrl;

        await expect(loadProductDetailPage()).resolves.toEqual({
          kind: "unavailable",
        });
      });
    },
  );
});

function candidatePayload(): Record<string, unknown> {
  return {
    ...structuredClone(productSample),
    id: "17000000-0000-4000-8000-000000000001",
    publicPath: "/products/fgd-x15-pvc/",
    title: "FGD X15+PVC Track",
    details: {
      ...structuredClone(productSample.details),
      model: "FGD X15+PVC",
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
    },
  };
}

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void {
  response.writeHead(status, { "content-type": "application/json", ...headers });
  response.end(JSON.stringify(body));
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
