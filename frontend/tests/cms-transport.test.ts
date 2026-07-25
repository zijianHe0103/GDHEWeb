import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer, type RequestListener } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";

import { describe, expect, expectTypeOf, test } from "vitest";

import { parseWordPressApiUrl } from "../src/lib/cms/server/config";
import {
  CmsConfigurationError,
  CmsHttpError,
} from "../src/lib/cms/server/errors";
import {
  buildResolveUrl,
  validateCanonicalPublicPath,
} from "../src/lib/cms/server/resolve-url";
import {
  resolveCmsPath,
  type CmsTransportResponse,
} from "../src/lib/cms/server";
import * as transportModule from "../src/lib/cms/server/transport";

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
    const baseUrl = `http://127.0.0.1:${address.port}/wp-json`;
    await withWordPressApiUrl(baseUrl, () => assertion(baseUrl));
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("CMS configuration", () => {
  test("rejects a missing REST base without echoing configuration", () => {
    expect(() => parseWordPressApiUrl(undefined)).toThrowError(
      new CmsConfigurationError("missing_base"),
    );
  });

  test.each([
    "cms.example.com/wp-json",
    "ftp://cms.example.com/wp-json",
    "https://user:secret@cms.example.com/wp-json",
    "https://cms.example.com/wp-json?debug=1",
    "https://cms.example.com/wp-json#fragment",
    "https://cms.example.com/",
    "http://cms.example.com/wp-json",
    "http://localhost.example.com/wp-json",
    "http://localhost/wp-json",
    "http://127.0.0.1/wp-json",
    "http://[::1]/wp-json",
  ])("rejects unsafe REST base %s", (value) => {
    expect(() => parseWordPressApiUrl(value)).toThrowError(
      new CmsConfigurationError("invalid_base"),
    );
  });

  test.each([
    "https://cms.example.com/wp-json",
    "http://localhost:8080/wp-json",
    "http://127.0.0.1:8080/wp-json",
    "http://[::1]:8080/wp-json",
  ])("accepts safe REST base %s", (value) => {
    expect(parseWordPressApiUrl(value).toString()).toBe(value);
  });
});

describe("resolve URL", () => {
  test.each([
    "/",
    "/products/",
    "/products/service-unit-2/",
    `/${"a".repeat(63)}/`,
  ])("accepts canonical public path %s", (path) => {
    expect(validateCanonicalPublicPath(path)).toBe(path);
  });

  test.each([
    "",
    "products/",
    "/Products/",
    "/products",
    "/products//item/",
    "/products/../item/",
    "/products/item/?preview=1",
    "/products/item/#fragment",
    "/products\\item/",
    "/products/%2f/",
    `/${"a".repeat(64)}/`,
    `/${"a".repeat(499)}/`,
  ])("rejects non-canonical public path %s", (path) => {
    expect(() => validateCanonicalPublicPath(path)).toThrowError(
      new CmsConfigurationError("invalid_path"),
    );
  });

  test("builds only the fixed English Schema 3 resolve URL", () => {
    const base = parseWordPressApiUrl("https://cms.example.com/wp-json");
    const result = buildResolveUrl(base, "/products/service-unit/");

    expect(result.origin).toBe("https://cms.example.com");
    expect(result.pathname).toBe("/wp-json/gdhe/v1/resolve");
    expect([...result.searchParams.entries()]).toEqual([
      ["locale", "en"],
      ["path", "/products/service-unit/"],
      ["schema", "3.0.0"],
    ]);
  });
});

describe("resolve transport success and protocol", () => {
  test("sends one anonymous GET and returns only allowlisted metadata", async () => {
    let requests = 0;

    await withLoopbackServer((request, response) => {
      requests += 1;
      expect(request.method).toBe("GET");
      expect(request.url).toBe(
        "/wp-json/gdhe/v1/resolve?locale=en&path=%2Fproducts%2F&schema=3.0.0",
      );
      expect(request.headers.accept).toBe("application/json");
      expect(request.headers.authorization).toBeUndefined();
      expect(request.headers.cookie).toBeUndefined();
      expect(request.headers["x-wp-nonce"]).toBeUndefined();

      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        ETag: '"fixture"',
        "Last-Modified": "Wed, 01 Jan 2025 00:00:00 GMT",
        "Retry-After": "120",
        "X-GDHE-Request-ID": "request-1",
        "X-Internal-Secret": "must-not-pass",
      });
      response.end('{"type":"Product"}');
    }, async () => {
      const result = await resolveCmsPath("/products/");

      expect(result.body).toEqual({ type: "Product" });
      expect(result.metadata).toEqual({
        status: 200,
        requestId: "request-1",
        etag: '"fixture"',
        lastModified: "Wed, 01 Jan 2025 00:00:00 GMT",
        retryAfter: "120",
        contentType: "application/json; charset=utf-8",
      });
      expect(result.metadata).not.toHaveProperty("x-internal-secret");
    });

    expect(requests).toBe(1);
  });

  test.each([
    [204, "application/json", "", "unexpected_success_status"],
    [206, "application/json", "{}", "unexpected_success_status"],
    [304, "application/json", "", "unexpected_success_status"],
    [200, "text/html", "{}", "invalid_content_type"],
    [200, "application/json", "", "empty_body"],
    [200, "application/json", "{", "invalid_json"],
  ])(
    "rejects protocol response status %i as %s",
    async (status, contentType, body, expectedKind) => {
      await withLoopbackServer((_request, response) => {
        response.writeHead(status, { "Content-Type": contentType });
        response.end(body);
      }, async () => {
        await expect(resolveCmsPath("/")).rejects.toMatchObject({
          category: "protocol",
          kind: expectedKind,
        });
      });
    },
  );

  test("refuses redirects", async () => {
    let requests = 0;

    await withLoopbackServer((_request, response) => {
      requests += 1;
      response.writeHead(302, { Location: "https://example.com/" });
      response.end();
    }, async () => {
      await expect(resolveCmsPath("/")).rejects.toMatchObject({
        category: "protocol",
        kind: "redirect",
      });
    });

    expect(requests).toBe(1);
  });
});

describe("resolve transport errors", () => {
  test.each([
    [400, "bad_request"],
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
        "Retry-After": status === 429 ? "60" : "",
      });
      response.end(`{"code":"status_${status}"}`);
    }, async () => {
      await expect(resolveCmsPath("/")).rejects.toMatchObject({
        category: "http",
        kind,
        status,
      });
    });
  });

  test("keeps an HTTP body unknown and non-enumerable", async () => {
    const internalBody = {
      code: "gdhe_private_failure",
      detail: "private-response-detail",
    };

    await withLoopbackServer((_request, response) => {
      response.writeHead(429, {
        "Content-Type": "application/problem+json",
        "Retry-After": "60",
        "X-GDHE-Request-ID": "request-429",
      });
      response.end(JSON.stringify(internalBody));
    }, async (baseUrl) => {
      try {
        await resolveCmsPath("/");
        expect.unreachable("Expected an HTTP error.");
      } catch (error) {
        expect(error).toBeInstanceOf(CmsHttpError);
        const httpError = error as CmsHttpError;
        expect(httpError.body).toEqual(internalBody);
        expect(httpError.metadata.retryAfter).toBe("60");
        expect(httpError.metadata.requestId).toBe("request-429");
        expect(Object.keys(httpError)).not.toContain("body");
        expect(httpError.message).not.toContain(baseUrl);
        expect(JSON.stringify(httpError)).not.toContain("private-response-detail");
        expect(JSON.stringify(httpError)).not.toContain(baseUrl);
      }
    });
  });

  test("maps a bounded timeout without retrying", async () => {
    let requests = 0;

    await withLoopbackServer((_request, response) => {
      requests += 1;
      const timer = setTimeout(() => {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end("{}");
      }, 5_500);
      timer.unref();
    }, async () => {
      await expect(resolveCmsPath("/")).rejects.toMatchObject({
        category: "transport",
        kind: "timeout",
      });
    });

    expect(requests).toBe(1);
  }, 7_000);

  test("keeps the timeout active while reading the response body", async () => {
    await withLoopbackServer((_request, response) => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.flushHeaders();
      const timer = setTimeout(() => response.end("{}"), 5_500);
      timer.unref();
    }, async () => {
      await expect(resolveCmsPath("/")).rejects.toMatchObject({
        category: "transport",
        kind: "timeout",
      });
    });
  }, 7_000);

  test("distinguishes caller abort from timeout", async () => {
    const controller = new AbortController();
    controller.abort();

    await withLoopbackServer((_request, response) => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end("{}");
    }, async () => {
      await expect(resolveCmsPath("/", controller.signal)).rejects.toMatchObject({
        category: "transport",
        kind: "aborted",
      });
    });
  });

  test("maps connection failure to network without exposing origin", async () => {
    let closedBase = "";
    const server = createServer();
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address() as AddressInfo;
    closedBase = `http://127.0.0.1:${address.port}/wp-json`;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    await withWordPressApiUrl(closedBase, async () => {
      try {
        await resolveCmsPath("/");
        expect.unreachable("Expected a network error.");
      } catch (error) {
        expect(error).toMatchObject({
          category: "transport",
          kind: "network",
        });
        expect(String(error)).not.toContain(closedBase);
        expect(JSON.stringify(error)).not.toContain(closedBase);
      }
    });
  });
});

describe("public server-only entry", () => {
  test("does not expose a deep base or timeout injection surface", () => {
    expect(transportModule).not.toHaveProperty("requestResolvedPath");
    expect(Object.keys(transportModule)).toEqual(["resolveCmsPath"]);
    expect(transportModule.resolveCmsPath).toBe(resolveCmsPath);
    expectTypeOf(resolveCmsPath).toEqualTypeOf<
      (
        publicPath: string,
        callerSignal?: AbortSignal,
      ) => Promise<CmsTransportResponse>
    >();
  });

  test("reads the REST base from WORDPRESS_API_URL", async () => {
    await withLoopbackServer((_request, response) => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end('{"type":"Page"}');
    }, async () => {
      await expect(resolveCmsPath("/")).resolves.toMatchObject({
        body: { type: "Page" },
        metadata: { status: 200 },
      });
    });
  });

  test.each([
    ["public entry", "../src/lib/cms/server"],
    ["deep transport", "../src/lib/cms/server/transport"],
  ])("cannot import %s from a real Client Component build", async (_label, modulePath) => {
    const projectRoot = join(import.meta.dirname, "..");
    const temporaryRoot = await mkdtemp(
      join(projectRoot, ".tmp-server-only-negative-"),
    );

    try {
      await mkdir(join(temporaryRoot, "app"), { recursive: true });
      await mkdir(join(temporaryRoot, "src", "lib", "cms"), {
        recursive: true,
      });
      await cp(
        join(projectRoot, "src", "lib", "cms", "server"),
        join(temporaryRoot, "src", "lib", "cms", "server"),
        { recursive: true },
      );
      await writeFile(
        join(temporaryRoot, "package.json"),
        JSON.stringify({
          private: true,
          dependencies: {
            next: "16.2.11",
            react: "19.2.8",
            "react-dom": "19.2.8",
          },
        }),
      );
      await writeFile(
        join(temporaryRoot, "app", "layout.tsx"),
        "export default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }",
      );
      await writeFile(
        join(temporaryRoot, "app", "page.tsx"),
        `"use client";\nimport { resolveCmsPath } from "${modulePath}";\nexport default function Page() { void resolveCmsPath; return null; }\n`,
      );

      const build = spawnSync(
        join(projectRoot, "node_modules", ".bin", "next"),
        ["build"],
        {
          cwd: temporaryRoot,
          encoding: "utf8",
          env: {
            ...process.env,
            NEXT_TELEMETRY_DISABLED: "1",
          },
        },
      );
      const output = `${build.stdout}\n${build.stderr}`;

      expect(build.status).not.toBe(0);
      expect(output).toMatch(/server-only|Client Component/i);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 30_000);
});
