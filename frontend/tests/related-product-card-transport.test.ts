import { afterEach, describe, expect, test, vi } from "vitest";

import {
  RelatedProductCardConfigurationError,
  RelatedProductCardHttpError,
  RelatedProductCardProtocolError,
  RelatedProductCardTransportError,
} from "../src/lib/cms/server/related-product-cards/errors";
import { loadRelatedProductCardCollection } from "../src/lib/cms/server/related-product-cards/load";
import {
  requestRelatedProductCardCollection,
} from "../src/lib/cms/server/related-product-cards/transport";
import relatedErrors from "../src/lib/cms/related-product-card-contract/samples/errors/related-product-errors.json";

const SOURCE_PATH = "/products/fgd-x15-pvc/";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  delete process.env.WORDPRESS_API_URL;
});

describe("RelatedProductCard transport", () => {
  test("makes one fixed anonymous request and exposes only allowlisted metadata", async () => {
    process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
    const fetchMock = vi.fn(async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      void input;
      void init;
      return new Response('{"items":[]}', {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=60",
          ETag: '"related"',
          "X-GDHE-Request-ID": "related-request",
          "X-Internal-Secret": "do-not-expose",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestRelatedProductCardCollection(SOURCE_PATH);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://cms.example/wp-json/gdhe/v1/related-product-cards?locale=en&schema=1.0.0&source_path=%2Fproducts%2Ffgd-x15-pvc%2F",
    );
    expect(init).toMatchObject({
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "error",
      cache: "no-store",
    });
    expect(result).toEqual({
      kind: "ok",
      body: { items: [] },
      metadata: {
        status: 200,
        requestId: "related-request",
        etag: '"related"',
        cacheControl: "public, max-age=60",
        retryAfter: undefined,
        contentType: "application/json; charset=utf-8",
      },
    });
  });

  test("rejects a non-canonical source path before making a request", async () => {
    process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestRelatedProductCardCollection("/products/../private/"),
    ).rejects.toBeInstanceOf(RelatedProductCardConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns a bodyless 304 outcome and refuses it without a cache owner", async () => {
    process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, {
      status: 304,
      headers: { ETag: '"related"', "Cache-Control": "public, max-age=60" },
    })));

    await expect(
      requestRelatedProductCardCollection(SOURCE_PATH),
    ).resolves.toMatchObject({ kind: "not_modified", metadata: { status: 304 } });
    await expect(loadRelatedProductCardCollection(SOURCE_PATH)).rejects.toEqual(
      new RelatedProductCardProtocolError("not_modified_without_cache"),
    );
  });

  test("validates then removes a normalized HTTP error body", async () => {
    process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify(relatedErrors.unknown),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    )));

    let caught: unknown;
    try {
      await loadRelatedProductCardCollection(SOURCE_PATH);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(RelatedProductCardHttpError);
    expect(caught).toMatchObject({ status: 400, kind: "bad_request" });
    expect((caught as RelatedProductCardHttpError).body).toBeUndefined();
    expect(JSON.stringify(caught)).not.toMatch(/requestId|details|page/);
  });

  test("distinguishes caller abort, frozen timeout and redirect without retry", async () => {
    process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
    const caller = new AbortController();
    caller.abort();
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException("aborted", "AbortError");
      throw new TypeError("fetch failed", { cause: new Error("unexpected redirect") });
    }));
    await expect(
      requestRelatedProductCardCollection(SOURCE_PATH, caller.signal),
    ).rejects.toEqual(new RelatedProductCardTransportError("aborted"));
    await expect(
      requestRelatedProductCardCollection(SOURCE_PATH),
    ).rejects.toEqual(new RelatedProductCardProtocolError("redirect"));

    vi.useFakeTimers();
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("timeout", "AbortError")),
        );
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const pending = requestRelatedProductCardCollection(SOURCE_PATH);
    const timeoutExpectation = expect(pending).rejects.toEqual(
      new RelatedProductCardTransportError("timeout"),
    );
    await vi.advanceTimersByTimeAsync(5000);
    await timeoutExpectation;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["hostile Proxy", () => new Proxy(Object.create(null), {
      getPrototypeOf() {
        throw new Error("PRIVATE_PROXY_DIAGNOSTIC_023");
      },
    })],
    ["revoked Proxy", () => {
      const target = Proxy.revocable(Object.create(null), {});
      target.revoke();
      return target.proxy;
    }],
    ["unsafe cause access", () => {
      const error = new TypeError("fetch failed");
      Object.defineProperty(error, "cause", {
        get() {
          throw new Error("PRIVATE_CAUSE_DIAGNOSTIC_023");
        },
      });
      return error;
    }],
    ["unsafe message access", () => {
      const cause = new Error("redirect");
      Object.defineProperty(cause, "message", {
        get() {
          throw new Error("PRIVATE_MESSAGE_DIAGNOSTIC_023");
        },
      });
      return new TypeError("fetch failed", { cause });
    }],
  ])("sanitizes %s without retry or attacker diagnostics", async (_label, thrown) => {
    process.env.WORDPRESS_API_URL = "https://cms.example/wp-json";
    const fetchMock = vi.fn(async () => {
      throw thrown();
    });
    vi.stubGlobal("fetch", fetchMock);

    let caught: unknown;
    try {
      await requestRelatedProductCardCollection(SOURCE_PATH);
    } catch (error) {
      caught = error;
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(caught).toEqual(new RelatedProductCardTransportError("network"));
    expect(String(caught)).not.toMatch(/PRIVATE_|diagnostic/i);
  });
});
