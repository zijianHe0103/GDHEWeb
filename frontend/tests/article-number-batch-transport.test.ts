import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildMixedQuoteLineValidationRequest } from "../src/lib/cms/server/article-number-batch/query";
import { MixedQuoteLineHttpError } from "../src/lib/cms/server/article-number-batch/errors";
import {
  MixedQuoteLineProtocolError,
  MixedQuoteLineTransportError,
} from "../src/lib/cms/server/article-number-batch/errors";
import { requestMixedQuoteLineValidation } from "../src/lib/cms/server/article-number-batch/transport";

const originalWordPressApiUrl = process.env.WORDPRESS_API_URL;

const standardLine = {
  entryId: "25000000-0000-4000-8000-000000000101",
  lineKind: "configured_product",
  canonicalPath: "/products/fgd-x15-pvc/",
  selection: {
    type: "article_number",
    articleNumber: "GDHEPRD000172",
    lengthMeters: 6,
    color: { code: "ivory-white", label: "Ivory White" },
    resolution: "standard_ready",
  },
  packaging: {
    basePackaging: "standard",
    logoPrinting: false,
    protectionArrangement: null,
  },
  quantityUnit: "piece",
  quantity: 2,
} as const;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  if (originalWordPressApiUrl === undefined) delete process.env.WORDPRESS_API_URL;
  else process.env.WORDPRESS_API_URL = originalWordPressApiUrl;
});

async function bodyOf(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

describe("TASK-025 mixed validation Transport", () => {
  it("makes one fixed anonymous no-store JSON POST and parses one 200 body", async () => {
    const observed: Array<{ method?: string; url?: string; accept?: string; contentType?: string; body: string }> = [];
    const responseBody = {
      apiVersion: "1",
      schemaVersion: "1.0.0",
      locale: "en",
      type: "mixed_quote_line_validation",
      lines: [],
    };
    const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
      observed.push({
        method: request.method,
        url: request.url,
        accept: request.headers.accept,
        contentType: request.headers["content-type"],
        body: await bodyOf(request),
      });
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-gdhe-request-id": "25000000-0000-4000-8000-000000000099",
      });
      response.end(JSON.stringify(responseBody));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing loopback address");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const request = buildMixedQuoteLineValidationRequest([standardLine]);

      const result = await requestMixedQuoteLineValidation(request);

      expect(result.kind).toBe("ok");
      if (result.kind !== "ok") throw new Error("expected ok outcome");
      expect(result.body).toEqual(responseBody);
      expect(result.metadata).toMatchObject({ status: 200, cacheControl: "no-store" });
      expect(observed).toEqual([{
        method: "POST",
        url: "/wp-json/gdhe/v1/quote-line-validations",
        accept: "application/json",
        contentType: "application/json",
        body: JSON.stringify(request),
      }]);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("classifies the frozen sanitized HTTP status matrix with zero retry", async () => {
    const matrix = [
      [400, "gdhe_invalid_quote_line_request", "bad_request"],
      [409, "gdhe_quote_lines_changed", "quote_lines_changed"],
      [413, "gdhe_quote_line_request_too_large", "request_too_large"],
      [415, "gdhe_unsupported_media_type", "unsupported_media_type"],
      [500, "gdhe_quote_line_validation_unavailable", "upstream_failure"],
    ] as const;
    let calls = 0;
    const server = createServer((request, response) => {
      request.resume();
      const [status, code] = matrix[calls++];
      response.writeHead(status, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify({
        apiVersion: "1",
        code,
        message: "Sanitized error.",
        status,
        requestId: "25000000-0000-4000-8000-000000000099",
      }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing loopback address");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const request = buildMixedQuoteLineValidationRequest([standardLine]);

      for (const [status, , kind] of matrix) {
        await expect(requestMixedQuoteLineValidation(request)).rejects.toMatchObject({
          category: "http",
          kind,
          status,
        } satisfies Partial<MixedQuoteLineHttpError>);
      }
      expect(calls).toBe(matrix.length);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("distinguishes redirect, caller abort and the frozen 5000 ms timeout", async () => {
    let calls = 0;
    const server = createServer((request, response) => {
      request.resume();
      calls += 1;
      if (calls === 1) {
        response.writeHead(302, { location: "/redirected" });
        response.end();
        return;
      }
      const timer = setTimeout(() => {
        response.writeHead(200, {
          "content-type": "application/json",
          "cache-control": "no-store",
        });
        response.end('{"late":true}');
      }, 5500);
      request.on("close", () => clearTimeout(timer));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing loopback address");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const request = buildMixedQuoteLineValidationRequest([standardLine]);

      await expect(requestMixedQuoteLineValidation(request)).rejects.toMatchObject({
        category: "protocol",
        kind: "redirect",
      } satisfies Partial<MixedQuoteLineProtocolError>);

      const caller = new AbortController();
      const aborted = requestMixedQuoteLineValidation(request, caller.signal);
      setTimeout(() => caller.abort(), 10);
      await expect(aborted).rejects.toMatchObject({
        category: "transport",
        kind: "aborted",
      } satisfies Partial<MixedQuoteLineTransportError>);

      await expect(requestMixedQuoteLineValidation(request)).rejects.toMatchObject({
        category: "transport",
        kind: "timeout",
      } satisfies Partial<MixedQuoteLineTransportError>);
      expect(calls).toBe(3);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 7000);

  it("maps hostile thrown values to the sanitized network error without reflection", async () => {
    const request = buildMixedQuoteLineValidationRequest([standardLine]);
    let trapReads = 0;
    const hostile = new Proxy(Object.create(null), {
      get() { trapReads += 1; throw new Error("secret get"); },
      getOwnPropertyDescriptor() { trapReads += 1; throw new Error("secret descriptor"); },
      getPrototypeOf() { trapReads += 1; throw new Error("secret prototype"); },
      ownKeys() { trapReads += 1; throw new Error("secret keys"); },
    });
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();

    for (const value of [hostile, revoked.proxy]) {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(value);
      await expect(requestMixedQuoteLineValidation(request)).rejects.toMatchObject({
        category: "transport",
        kind: "network",
      } satisfies Partial<MixedQuoteLineTransportError>);
    }
    expect(trapReads).toBe(0);
  });
});
