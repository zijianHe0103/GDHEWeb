import { createServer, type RequestListener } from "node:http";
import type { AddressInfo } from "node:net";

import { describe, expect, test } from "vitest";

import {
  ProductCardConfigurationError,
  ProductCardHttpError,
} from "../src/lib/cms/server/product-cards/errors";
import {
  buildProductCardUrl,
  requestProductCardCollection,
  validateProductCardQuery,
} from "../src/lib/cms/server/product-cards/transport";

function expectInvalidQuery(query: unknown): void {
  expect(() => validateProductCardQuery(query as never)).toThrowError(
    new ProductCardConfigurationError("invalid_query"),
  );
}

async function withWordPressApiUrl<T>(
  baseUrl: string,
  assertion: () => Promise<T>,
): Promise<T> {
  const previous = process.env.WORDPRESS_API_URL;
  process.env.WORDPRESS_API_URL = baseUrl;
  try {
    return await assertion();
  } finally {
    if (previous === undefined) {
      delete process.env.WORDPRESS_API_URL;
    } else {
      process.env.WORDPRESS_API_URL = previous;
    }
  }
}

async function withLoopbackServer(
  listener: RequestListener,
  assertion: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = createServer(listener);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;
  try {
    await withWordPressApiUrl(
      `http://127.0.0.1:${address.port}/wp-json`,
      () => assertion(`http://127.0.0.1:${address.port}/wp-json`),
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("ProductCard query and URL", () => {
  test("builds only the fixed English ProductCard 1.0.0 URL", () => {
    const query = validateProductCardQuery();
    const result = buildProductCardUrl(
      new URL("https://cms.example.com/wp-json"),
      query,
    );

    expect(result.origin).toBe("https://cms.example.com");
    expect(result.pathname).toBe("/wp-json/gdhe/v1/product-cards");
    expect([...result.searchParams.entries()]).toEqual([
      ["locale", "en"],
      ["schema", "1.0.0"],
      ["page", "1"],
      ["per_page", "10"],
      ["sort", "modified_desc"],
    ]);
  });

  test("rejects unknown query keys instead of ignoring them", () => {
    expect(() =>
      validateProductCardQuery({ page: 1, meta_key: "private" } as never),
    ).toThrowError(
      expect.objectContaining({
        category: "configuration",
        kind: "invalid_query",
      }),
    );
  });

  test.each([
    null,
    [],
    new Date(),
    { page: 0 },
    { page: 1.5 },
    { page: Number.MAX_SAFE_INTEGER + 1 },
    { perPage: 0 },
    { perPage: 101 },
    { sort: "price_asc" },
    { filter: "product_category:Track" },
    { filter: "product_category:track&meta=private" },
  ])("rejects an invalid closed query %#", (query) => {
    expect(() => validateProductCardQuery(query as never)).toThrowError(
      expect.objectContaining({
        category: "configuration",
        kind: "invalid_query",
      }),
    );
  });

  test("rejects a stateful coercible filter without coercing it", () => {
    let coercions = 0;
    const filter = {
      [Symbol.toPrimitive]() {
        coercions += 1;
        return coercions === 1
          ? "product_category:track"
          : "product_category:track&meta_key=private";
      },
    };

    expectInvalidQuery({ filter });
    expect(coercions).toBe(0);
  });

  test("rejects an unknown non-enumerable own key", () => {
    const query = { page: 1 };
    Object.defineProperty(query, "meta_key", {
      value: "private",
    });

    expectInvalidQuery(query);
  });

  test("rejects every symbol own key", () => {
    const query = { page: 1 };
    Object.defineProperty(query, Symbol("private"), {
      enumerable: true,
      value: "private",
    });

    expectInvalidQuery(query);
  });

  test("rejects an accessor on an allowed key without invoking it", () => {
    let reads = 0;
    const query = {};
    Object.defineProperty(query, "page", {
      enumerable: true,
      get() {
        reads += 1;
        return 1;
      },
    });

    expectInvalidQuery(query);
    expect(reads).toBe(0);
  });

  test("rejects a Proxy that hides an unknown own key", () => {
    const query = new Proxy(
      { page: 1, meta_key: "private" },
      {
        ownKeys() {
          return ["page"];
        },
      },
    );

    expectInvalidQuery(query);
  });

  test("turns a reflection trap into the stable query error without invoking it", () => {
    let trapCalls = 0;
    const query = new Proxy(
      {},
      {
        getPrototypeOf() {
          trapCalls += 1;
          throw new Error("private reflection failure");
        },
      },
    );

    expectInvalidQuery(query);
    expect(trapCalls).toBe(0);
  });

  test("builds from a frozen primitive snapshot byte-for-byte", () => {
    const filter: `product_category:${string}` = "product_category:track";
    const input = Object.preventExtensions({
      page: 2,
      perPage: 25,
      sort: "title_asc" as const,
      filter,
    });

    const query = validateProductCardQuery(input);
    const url = buildProductCardUrl(
      new URL("https://cms.example.com/wp-json"),
      query,
    );

    expect(query).not.toBe(input);
    expect(Object.isFrozen(query)).toBe(true);
    expect(query.filter).toBe(filter);
    expect(typeof query.filter).toBe("string");
    expect(url.searchParams.get("filter")).toBe(filter);
    expect(
      url.searchParams.toString().includes(
        "filter=product_category%3Atrack",
      ),
    ).toBe(true);
  });
});

describe("ProductCard transport", () => {
  test("sends exactly one anonymous fixed GET and returns sanitized 200", async () => {
    let requests = 0;

    await withLoopbackServer((request, response) => {
      requests += 1;
      expect(request.method).toBe("GET");
      expect(request.url).toBe(
        "/wp-json/gdhe/v1/product-cards?locale=en&schema=1.0.0&page=2&per_page=25&sort=title_asc&filter=product_category%3Atrack",
      );
      expect(request.headers.accept).toBe("application/json");
      expect(request.headers.authorization).toBeUndefined();
      expect(request.headers.cookie).toBeUndefined();
      expect(request.headers["x-wp-nonce"]).toBeUndefined();
      expect(request.headers["if-none-match"]).toBeUndefined();

      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        ETag: '"cards"',
        "X-GDHE-Request-ID": "request-cards",
        "X-Internal-Secret": "hidden",
      });
      response.end('{"items":[]}');
    }, async () => {
      const result = await requestProductCardCollection({
        page: 2,
        perPage: 25,
        sort: "title_asc",
        filter: "product_category:track",
      });

      expect(result).toEqual({
        kind: "ok",
        body: { items: [] },
        metadata: {
          status: 200,
          requestId: "request-cards",
          etag: '"cards"',
          cacheControl: "public, max-age=60",
          retryAfter: undefined,
          contentType: "application/json; charset=utf-8",
        },
      });
      expect(result.metadata).not.toHaveProperty("x-internal-secret");
    });

    expect(requests).toBe(1);
  });

  test("returns a bodyless typed 304 outcome without a conditional request", async () => {
    await withLoopbackServer((request, response) => {
      expect(request.headers["if-none-match"]).toBeUndefined();
      response.writeHead(304, {
        "Cache-Control": "public, max-age=60",
        ETag: '"cards"',
        "X-GDHE-Request-ID": "request-304",
      });
      response.end();
    }, async () => {
      await expect(requestProductCardCollection()).resolves.toEqual({
        kind: "not_modified",
        metadata: {
          status: 304,
          requestId: "request-304",
          etag: '"cards"',
          cacheControl: "public, max-age=60",
          retryAfter: undefined,
          contentType: "",
        },
      });
    });
  });

  test("keeps a normalized HTTP error body private and requires no-store", async () => {
    const privateBody = {
      apiVersion: "1",
      code: "gdhe_invalid_filter",
      message: "private upstream detail",
      status: 400,
      requestId: "5fdc4971-d513-4769-a2be-baee947bcb9c",
      details: [{ field: "filter", code: "gdhe_invalid_filter" }],
    };

    await withLoopbackServer((_request, response) => {
      response.writeHead(400, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-GDHE-Request-ID": "request-400",
      });
      response.end(JSON.stringify(privateBody));
    }, async (baseUrl) => {
      try {
        await requestProductCardCollection();
        expect.unreachable("Expected a ProductCard HTTP error.");
      } catch (error) {
        expect(error).toBeInstanceOf(ProductCardHttpError);
        const httpError = error as ProductCardHttpError;
        expect(httpError).toMatchObject({
          category: "http",
          kind: "bad_request",
          status: 400,
        });
        expect(httpError.body).toEqual(privateBody);
        expect(Object.keys(httpError)).not.toContain("body");
        expect(JSON.stringify(httpError)).not.toContain("private upstream detail");
        expect(JSON.stringify(httpError)).not.toContain(baseUrl);
      }
    });
  });

  test("refuses a redirect as a stable protocol error", async () => {
    await withLoopbackServer((_request, response) => {
      response.writeHead(302, { Location: "https://example.com/" });
      response.end();
    }, async () => {
      await expect(requestProductCardCollection()).rejects.toMatchObject({
        category: "protocol",
        kind: "redirect",
      });
    });
  });

  test("times out after the frozen 5000 ms without retrying", async () => {
    let requests = 0;

    await withLoopbackServer((_request, response) => {
      requests += 1;
      const timer = setTimeout(() => {
        response.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
          ETag: '"late"',
        });
        response.end('{"items":[]}');
      }, 5_500);
      timer.unref();
    }, async () => {
      await expect(requestProductCardCollection()).rejects.toMatchObject({
        category: "transport",
        kind: "timeout",
      });
    });

    expect(requests).toBe(1);
  }, 7_000);

  test("distinguishes a caller abort from the timeout", async () => {
    const controller = new AbortController();
    controller.abort();

    await withLoopbackServer((_request, response) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        ETag: '"aborted"',
      });
      response.end('{"items":[]}');
    }, async () => {
      await expect(
        requestProductCardCollection({}, controller.signal),
      ).rejects.toMatchObject({
        category: "transport",
        kind: "aborted",
      });
    });
  });

  test.each([
    [204, "application/json", "", {}, "unexpected_status"],
    [200, "text/html", "{}", { ETag: '"cards"', "Cache-Control": "public, max-age=60" }, "invalid_content_type"],
    [200, "application/json", "", { ETag: '"cards"', "Cache-Control": "public, max-age=60" }, "empty_body"],
    [200, "application/json", "{", { ETag: '"cards"', "Cache-Control": "public, max-age=60" }, "invalid_json"],
    [200, "application/json", "{}", { "Cache-Control": "public, max-age=60" }, "missing_etag"],
    [200, "application/json", "{}", { ETag: '"cards"', "Cache-Control": "no-store" }, "invalid_cache_control"],
  ])(
    "fails closed for protocol response %i as %s",
    async (status, contentType, body, headers, expectedKind) => {
      await withLoopbackServer((_request, response) => {
        response.writeHead(status, {
          "Content-Type": contentType,
          ...headers,
        });
        response.end(body);
      }, async () => {
        await expect(requestProductCardCollection()).rejects.toMatchObject({
          category: "protocol",
          kind: expectedKind,
        });
      });
    },
  );

  test.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "conflict"],
    [429, "rate_limited"],
    [500, "upstream_failure"],
    [502, "upstream_failure"],
    [503, "upstream_failure"],
    [418, "unexpected_status"],
  ])("maps HTTP %i to %s", async (status, kind) => {
    await withLoopbackServer((_request, response) => {
      response.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      response.end(`{"status":${status}}`);
    }, async () => {
      await expect(requestProductCardCollection()).rejects.toMatchObject({
        category: "http",
        kind,
        status,
      });
    });
  });

  test("keeps the timeout active while reading the response body", async () => {
    await withLoopbackServer((_request, response) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        ETag: '"slow-body"',
      });
      response.flushHeaders();
      const timer = setTimeout(() => response.end('{"items":[]}'), 5_500);
      timer.unref();
    }, async () => {
      await expect(requestProductCardCollection()).rejects.toMatchObject({
        category: "transport",
        kind: "timeout",
      });
    });
  }, 7_000);
});
