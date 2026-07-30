import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import allCards from "../src/lib/cms/product-card-contract/samples/success/all.json";
import ProductListPage, {
  dynamic,
  metadata,
} from "../src/app/products/page";
import { previewProductCardCollection } from "../src/lib/product-list/preview";

const originalEnvironment = {
  mode: process.env.GDHE_PRODUCT_LIST_MODE,
  wordpress: process.env.WORDPRESS_API_URL,
};

afterEach(() => {
  restoreEnvironment("GDHE_PRODUCT_LIST_MODE", originalEnvironment.mode);
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

async function renderPage(): Promise<string> {
  return renderToStaticMarkup(await ProductListPage());
}

describe("/products/ local ProductCard slice", () => {
  test("maps the disabled mode to the framework 404", async () => {
    delete process.env.GDHE_PRODUCT_LIST_MODE;
    delete process.env.WORDPRESS_API_URL;

    await expect(ProductListPage()).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });

  test("renders the protected preview candidate with zero network requests", async () => {
    process.env.GDHE_PRODUCT_LIST_MODE = "preview";
    const fetchSpy = vi.fn(() => {
      throw new Error("Preview mode must not use the network.");
    });
    vi.stubGlobal("fetch", fetchSpy);

    const html = await renderPage();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(html).toContain("FGD X15+PVC");
    expect(html).toContain(
      "/test-candidates/fgd-x15-protected.png",
    );
    expect(html).toContain(
      "Local test candidate — not production catalog",
    );
  });

  test("uses the frozen manual-track subcategory canonical path", () => {
    expect(
      previewProductCardCollection.items[0].primaryCategory.publicPath,
    ).toBe(
      "/products/curtain-track-systems/manual-curtain-tracks/",
    );
  });

  test("fails closed after one CMS collection request and zero resolve requests", async () => {
    const paths: string[] = [];
    await withLoopbackServer((path, response) => {
      paths.push(path);
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "public, max-age=60",
        etag: '"product-list-cards"',
      });
      response.end(JSON.stringify(allCards));
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_LIST_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      const html = await renderPage();

      expect(html).toContain("Products are temporarily unavailable.");
      expect(html).not.toContain(allCards.items[0].name);
      expect(html).not.toContain(allCards.items[0].image.url);
      expect(html).not.toContain("Local test candidate");
    });

    expect(paths).toEqual([
      "/wp-json/gdhe/v1/product-cards?locale=en&schema=1.0.0&page=1&per_page=12&sort=modified_desc",
    ]);
    expect(paths[0]).not.toContain("/resolve");
  });

  test("fails closed before React when CMS media is not same-origin", async () => {
    const remoteMediaUrl =
      "https://cms.example.com/wp-content/uploads/protected.webp";
    const remoteMediaCollection = {
      ...allCards,
      perPage: 12,
      total: 1,
      totalPages: 1,
      items: [
        {
          ...allCards.items[0],
          image: {
            ...allCards.items[0].image,
            url: remoteMediaUrl,
          },
        },
      ],
    };
    const fetchSpy = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify(remoteMediaCollection), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=60",
          etag: '"product-list-remote-media"',
        },
      });
    });
    vi.stubGlobal("fetch", fetchSpy);
    process.env.GDHE_PRODUCT_LIST_MODE = "cms";
    process.env.WORDPRESS_API_URL = "https://cms.example.com/wp-json";

    const html = await renderPage();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toContain(
      "/gdhe/v1/product-cards?",
    );
    expect(String(fetchSpy.mock.calls[0][0])).not.toContain("/resolve");
    expect(html).not.toContain(remoteMediaUrl);
    expect(html).not.toContain("cms.example.com");
    expect(html).not.toMatch(/<link[^>]+rel="preload"[^>]+https?:/);
    expect(html).not.toMatch(/<img[^>]+https?:/);
    expect(html).toContain("Products are temporarily unavailable.");
  });

  test("keeps a valid empty collection distinct from unavailable", async () => {
    const emptyCollection = {
      ...allCards,
      perPage: 12,
      total: 0,
      totalPages: 0,
      items: [],
    };
    await withLoopbackServer((_path, response) => {
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "public, max-age=60",
        etag: '"product-list-empty"',
      });
      response.end(JSON.stringify(emptyCollection));
    }, async (baseUrl) => {
      process.env.GDHE_PRODUCT_LIST_MODE = "cms";
      process.env.WORDPRESS_API_URL = baseUrl;

      const html = await renderPage();

      expect(html).toContain("No products are available in this test view.");
      expect(html).not.toContain("temporarily unavailable");
    });
  });

  test("sanitizes every enabled CMS load failure", async () => {
    process.env.GDHE_PRODUCT_LIST_MODE = "cms";
    process.env.WORDPRESS_API_URL =
      "https://user:secret@cms-private.example/wp-json";

    const html = await renderPage();

    expect(html).toContain("Products are temporarily unavailable.");
    expect(html).not.toContain("secret");
    expect(html).not.toContain("cms-private");
    expect(html).not.toContain("wp-json");
    expect(html).not.toContain("ProductCard");
  });

  test("exports the fixed dynamic and noindex metadata boundary", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(metadata).toMatchObject({
      robots: {
        index: false,
        follow: false,
      },
    });
  });

  test("keeps focus, media geometry and browser-fetch protections in source", async () => {
    const componentSource = await readFile(
      new URL("../src/components/product-card/index.tsx", import.meta.url),
      "utf8",
    );
    const cssSource = await readFile(
      new URL(
        "../src/components/product-card/product-card.module.css",
        import.meta.url,
      ),
      "utf8",
    );
    const routeSource = await readFile(
      new URL("../src/app/products/page.tsx", import.meta.url),
      "utf8",
    );

    expect(componentSource).not.toMatch(/\bfetch\s*\(/);
    expect(componentSource).toContain("width={image.width}");
    expect(componentSource).toContain("height={image.height}");
    expect(cssSource).toContain(":focus-visible");
    expect(cssSource).toMatch(/min-height:\s*2\.75rem/);
    expect(cssSource).toMatch(/aspect-ratio:\s*1\s*\/\s*1/);
    expect(routeSource).not.toMatch(/\bfetch\s*\(/);
  });

  test("keeps the two-column card body content-sized and the media focus ring inside", async () => {
    const cssSource = await readFile(
      new URL(
        "../src/components/product-card/product-card.module.css",
        import.meta.url,
      ),
      "utf8",
    );
    const twoColumnRules = cssSource
      .split("@media (max-width: 64rem)")[1]
      ?.split("@media (max-width: 42rem)")[0];

    expect(twoColumnRules).toMatch(
      /\.cardBody\s*\{[^}]*height:\s*auto;/,
    );
    expect(cssSource).toMatch(
      /\.mediaLink:focus-visible\s*\{[^}]*outline-offset:\s*-0\.2rem;/,
    );
  });
});

async function withLoopbackServer(
  listener: (
    path: string,
    response: import("node:http").ServerResponse,
  ) => void,
  assertion: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = createServer((request, response) => {
    listener(request.url ?? "", response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new TypeError("Expected a loopback TCP address.");
  }

  try {
    await assertion(`http://127.0.0.1:${address.port}/wp-json`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
