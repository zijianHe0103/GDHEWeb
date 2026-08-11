import { createServer, type IncomingMessage } from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import { validateMixedQuoteLines } from "../src/lib/cms/server/article-number-batch";
import {
  MixedQuoteLineHttpError,
  MixedQuoteLineProtocolError,
} from "../src/lib/cms/server/article-number-batch/errors";

const originalWordPressApiUrl = process.env.WORDPRESS_API_URL;

const packaging = {
  basePackaging: "standard",
  logoPrinting: false,
  protectionArrangement: null,
} as const;

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
  packaging,
  quantityUnit: "piece",
  quantity: 2,
} as const;

afterEach(() => {
  if (originalWordPressApiUrl === undefined) delete process.env.WORDPRESS_API_URL;
  else process.env.WORDPRESS_API_URL = originalWordPressApiUrl;
});

async function jsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function responseFor(request: Record<string, unknown>): Record<string, unknown> {
  const lines = request.lines as Array<Record<string, unknown>>;
  return {
    apiVersion: "1",
    schemaVersion: "1.0.0",
    locale: "en",
    type: "mixed_quote_line_validation",
    lines: lines.map((line) => {
      if (line.lineKind === "catalog_accessory") {
        return {
          entryId: line.entryId,
          lineKind: "catalog_accessory",
          resolution: "resolved_article_number",
          model: "TASK-025 ACCESSORY",
          publicPath: null,
          articleNumber: line.articleNumber,
          quantityUnit: "piece",
          quantity: line.quantity,
        };
      }
      const selection = line.selection as Record<string, unknown>;
      const custom = selection.resolution === "sales_follow_up";
      return {
        entryId: line.entryId,
        lineKind: "configured_product",
        resolution: custom ? "sales_follow_up" : "resolved_article_number",
        model: "FGD X15+PVC",
        publicPath: line.canonicalPath,
        articleNumber: custom ? null : selection.articleNumber,
        selection: {
          type: selection.type,
          articleNumber: custom ? null : selection.articleNumber,
          lengthMeters: selection.lengthMeters,
          color: selection.color,
        },
        packaging: line.packaging,
        quantityUnit: "piece",
        quantity: line.quantity,
      };
    }),
  };
}

describe("TASK-025 mixed validation one-call orchestration", () => {
  it("uses exactly one batch POST for 1 and 50 ordered lines and zero legacy calls", async () => {
    const observed: Array<{ method?: string; url?: string; count: number }> = [];
    const server = createServer(async (request, response) => {
      const body = await jsonBody(request);
      observed.push({
        method: request.method,
        url: request.url,
        count: (body.lines as unknown[]).length,
      });
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify(responseFor(body)));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing loopback address");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;

      const one = await validateMixedQuoteLines([standardLine]);
      const fifty = await validateMixedQuoteLines([
        {
          entryId: "25000000-0000-4000-8000-000000000200",
          lineKind: "catalog_accessory",
          articleNumber: "GDHEPRD000901",
          quantityUnit: "piece",
          quantity: 3,
        },
        ...Array.from({ length: 49 }, (_, index) => ({
          entryId: `25000000-0000-4000-8000-${String(index + 201).padStart(12, "0")}`,
          lineKind: "configured_product" as const,
          canonicalPath: "/products/fgd-x15-pvc/",
          selection: {
            type: "custom_length" as const,
            articleNumber: null,
            lengthMeters: Number(((index + 1) / 10).toFixed(1)),
            color: { code: "ivory-white", label: "Ivory White" },
            resolution: "sales_follow_up" as const,
          },
          packaging,
          quantityUnit: "piece" as const,
          quantity: 2,
        })),
      ]);

      expect(one.lines).toHaveLength(1);
      expect(fifty.lines).toHaveLength(50);
      expect(fifty.lines.map((line) => line.entryId)).toEqual([
        "25000000-0000-4000-8000-000000000200",
        ...Array.from({ length: 49 }, (_, index) =>
          `25000000-0000-4000-8000-${String(index + 201).padStart(12, "0")}`),
      ]);
      expect(observed).toEqual([
        { method: "POST", url: "/wp-json/gdhe/v1/quote-line-validations", count: 1 },
        { method: "POST", url: "/wp-json/gdhe/v1/quote-line-validations", count: 50 },
      ]);
      expect(observed.some(({ url }) =>
        url?.includes("/resolve") ||
        url?.includes("product-configuration") ||
        url?.includes("related-product-cards"))).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("validates then sanitizes normalized errors and fails closed on status mismatch", async () => {
    let calls = 0;
    const server = createServer((request, response) => {
      request.resume();
      calls += 1;
      const bodyStatus = calls === 1 ? 400 : 409;
      const code = bodyStatus === 400
        ? "gdhe_invalid_quote_line_request"
        : "gdhe_quote_lines_changed";
      const message = bodyStatus === 400
        ? "Quote-line request is invalid."
        : "One or more quote lines changed.";
      response.writeHead(400, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify({
        apiVersion: "1",
        code,
        message,
        status: bodyStatus,
        requestId: "25000000-0000-4000-8000-000000000099",
      }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing loopback address");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;

      const first = await validateMixedQuoteLines([standardLine]).catch((error: unknown) => error);
      expect(first).toBeInstanceOf(MixedQuoteLineHttpError);
      expect(first).toMatchObject({ category: "http", kind: "bad_request", status: 400 });
      expect((first as MixedQuoteLineHttpError).body).toBeUndefined();

      await expect(validateMixedQuoteLines([standardLine])).rejects.toMatchObject({
        category: "protocol",
        kind: "error_status_mismatch",
      } satisfies Partial<MixedQuoteLineProtocolError>);
      expect(calls).toBe(2);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("accepts and sanitizes the frozen duplicate-identity 400 variant", async () => {
    const server = createServer((request, response) => {
      request.resume();
      response.writeHead(400, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify({
        apiVersion: "1",
        code: "gdhe_invalid_quote_line_request",
        message: "Quote-line request contains duplicate identity.",
        status: 400,
        requestId: "25000000-0000-4000-8000-000000000099",
      }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing loopback address");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;

      const error = await validateMixedQuoteLines([standardLine]).catch((value: unknown) => value);
      expect(error).toBeInstanceOf(MixedQuoteLineHttpError);
      expect(error).toMatchObject({ category: "http", kind: "bad_request", status: 400 });
      expect((error as MixedQuoteLineHttpError).body).toBeUndefined();
    } finally {
      await new Promise<void>((resolve, reject) => server.close((closeError) => closeError ? reject(closeError) : resolve()));
    }
  });
});
