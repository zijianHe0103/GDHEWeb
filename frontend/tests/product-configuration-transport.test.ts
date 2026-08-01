import { once } from "node:events";
import { createServer } from "node:http";

import { afterEach, describe, expect, test, vi } from "vitest";

import { requestProductConfiguration } from "../src/lib/cms/server/product-configurations/transport";

const originalWordPressApiUrl = process.env.WORDPRESS_API_URL;

afterEach(() => {
  if (originalWordPressApiUrl === undefined) {
    delete process.env.WORDPRESS_API_URL;
  } else {
    process.env.WORDPRESS_API_URL = originalWordPressApiUrl;
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Product Configuration fixed transport", () => {
  test("uses one anonymous fixed GET with no caller-controlled query", async () => {
    const requests: Array<{
      method: string | undefined;
      path: string | undefined;
      accept: string | undefined;
    }> = [];
    const server = createServer((request, response) => {
      requests.push({
        method: request.method,
        path: request.url,
        accept: request.headers.accept,
      });
      response.writeHead(200, {
        "cache-control": "public, max-age=60",
        "content-type": "application/json",
        etag: '"configuration"',
      });
      response.end('{"apiVersion":"1"}');
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new TypeError("Expected loopback address.");
    }
    process.env.WORDPRESS_API_URL =
      `http://127.0.0.1:${address.port}/wp-json`;

    try {
      await expect(requestProductConfiguration()).resolves.toMatchObject({
        kind: "ok",
        body: { apiVersion: "1" },
        metadata: {
          status: 200,
          cacheControl: "public, max-age=60",
          etag: '"configuration"',
        },
      });
    } finally {
      server.close();
      await once(server, "close");
    }

    expect(requests).toEqual([
      {
        method: "GET",
        path:
          "/wp-json/gdhe/v1/product-configurations?locale=en&schema=1.0.0&path=%2Fproducts%2Ffgd-x15-pvc%2F",
        accept: "application/json",
      },
    ]);
  });

  test("represents a bodyless 304 for the no-cache loader", async () => {
    const fetchSpy = stubFetch(new Response(null, { status: 304 }));

    await expect(requestProductConfiguration()).resolves.toMatchObject({
      kind: "not_modified",
      metadata: { status: 304 },
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["wrong content type", jsonResponse(200, {}, {
      "cache-control": "public, max-age=60",
      "content-type": "text/plain",
      etag: '"ok"',
    }), "invalid_content_type"],
    ["empty body", new Response("", {
      status: 200,
      headers: successHeaders(),
    }), "empty_body"],
    ["invalid JSON", new Response("{", {
      status: 200,
      headers: successHeaders(),
    }), "invalid_json"],
    ["unexpected 2xx", jsonResponse(201, {}, successHeaders()), "unexpected_status"],
    ["missing ETag", jsonResponse(200, {}, {
      "cache-control": "public, max-age=60",
      "content-type": "application/json",
    }), "missing_etag"],
    ["wrong success cache", jsonResponse(200, {}, {
      "cache-control": "no-store",
      "content-type": "application/json",
      etag: '"ok"',
    }), "invalid_cache_control"],
    ["cacheable HTTP error", jsonResponse(400, { code: "bad" }, {
      "cache-control": "public, max-age=60",
      "content-type": "application/json",
    }), "invalid_cache_control"],
  ])("fails closed on %s", async (_label, response, kind) => {
    const fetchSpy = stubFetch(response);
    await expect(captureFailure(requestProductConfiguration())).resolves.toMatchObject({
      category: "protocol",
      kind,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("preserves one normalized no-store HTTP error body for validation", async () => {
    const body = { apiVersion: "1", code: "gdhe_invalid_path", status: 400 };
    const fetchSpy = stubFetch(jsonResponse(400, body, {
      "cache-control": "no-store",
      "content-type": "application/json",
    }));

    const error = await captureFailure(requestProductConfiguration());
    expect(error).toMatchObject({
      category: "http",
      kind: "bad_request",
      status: 400,
      body,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("maps redirect refusal without retry", async () => {
    const fetchSpy = stubRejectedFetch(
      new TypeError("fetch failed", { cause: new Error("unexpected redirect") }),
    );
    await expect(captureFailure(requestProductConfiguration())).resolves.toMatchObject({
      category: "protocol",
      kind: "redirect",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("uses the frozen 5000 ms timeout without retry", async () => {
    vi.useFakeTimers();
    const fetchSpy = stubAbortableFetch();
    const failure = captureFailure(requestProductConfiguration());

    await vi.advanceTimersByTimeAsync(4999);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);

    await expect(failure).resolves.toMatchObject({
      category: "transport",
      kind: "timeout",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("distinguishes caller abort from timeout", async () => {
    const fetchSpy = stubAbortableFetch();
    const controller = new AbortController();
    const request = requestProductConfiguration(controller.signal);
    controller.abort();

    await expect(captureFailure(request)).resolves.toMatchObject({
      category: "transport",
      kind: "aborted",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("maps a network failure without retry", async () => {
    const fetchSpy = stubRejectedFetch(new TypeError("fetch failed"));
    await expect(captureFailure(requestProductConfiguration())).resolves.toMatchObject({
      category: "transport",
      kind: "network",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

function successHeaders(): HeadersInit {
  return {
    "cache-control": "public, max-age=60",
    "content-type": "application/json",
    etag: '"ok"',
  };
}

function jsonResponse(
  status: number,
  body: unknown,
  headers: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function setStubEnvironment(): void {
  process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
}

function stubFetch(response: Response) {
  setStubEnvironment();
  const fetchSpy = vi.fn(async () => response);
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

function stubRejectedFetch(error: Error) {
  setStubEnvironment();
  const fetchSpy = vi.fn(async () => {
    throw error;
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

function stubAbortableFetch() {
  setStubEnvironment();
  const fetchSpy = vi.fn((_url: URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("aborted", "AbortError"));
      }, { once: true });
    })
  );
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

async function captureFailure(promise: Promise<unknown>): Promise<unknown> {
  return promise.catch((error: unknown) => error);
}
