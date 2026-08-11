import { createServer, type IncomingMessage } from "node:http";

import { afterEach, describe, expect, test } from "vitest";

import mixedV2 from "../src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import mixedV3 from "../src/lib/quote-basket-contract/v3/samples/success/mixed.json";
import { cloneAndValidateQuoteBasketV3, parseQuoteBasketV3 } from "../src/lib/quote-basket/v3";
import {
  projectQuoteBasketV3ForValidation,
  validateQuoteBasketV3,
} from "../src/lib/quote-basket/v3/batch";

const ids = {
  writerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  mutationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
} as const;
const originalWordPressApiUrl = process.env.WORDPRESS_API_URL;

afterEach(() => {
  if (originalWordPressApiUrl === undefined) delete process.env.WORDPRESS_API_URL;
  else process.env.WORDPRESS_API_URL = originalWordPressApiUrl;
});

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

describe("Quote Basket 3.0 server-owned batch seam", () => {
  test("excludes requires_readd and atomically upgrades one migrated standard", async () => {
    const basket = parseQuoteBasketV3(
      JSON.stringify(mixedV2),
      new Date("2026-08-12T00:00:00.000Z"),
    );
    const projection = projectQuoteBasketV3ForValidation(basket);
    const before = JSON.stringify(basket);

    expect(projection).toHaveLength(1);
    expect(projection[0]).toMatchObject({
      entryId: mixedV2.items[0].entryId,
      lineKind: "configured_product",
      canonicalPath: "/products/fgd-x15-pvc/",
      selection: {
        type: "article_number",
        articleNumber: null,
        resolution: "refresh_from_selection",
      },
    });
    expect(JSON.stringify(projection)).not.toContain(mixedV2.items[1].entryId);

    let calls = 0;
    const server = createServer((request, response) => {
      request.resume();
      calls += 1;
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify({
        apiVersion: "1",
        schemaVersion: "1.0.0",
        locale: "en",
        type: "mixed_quote_line_validation",
        lines: [{
          entryId: mixedV2.items[0].entryId,
          lineKind: "configured_product",
          resolution: "resolved_article_number",
          model: "FGD X15+PVC",
          publicPath: "/products/fgd-x15-pvc/",
          articleNumber: "GDHEPRD000172",
          selection: {
            type: "article_number",
            articleNumber: "GDHEPRD000172",
            lengthMeters: 6,
            color: { code: "ivory-white", label: "Ivory White" },
          },
          packaging: {
            basePackaging: "standard",
            logoPrinting: false,
            protectionArrangement: null,
          },
          quantityUnit: "piece",
          quantity: calls === 1 ? 2 : 99,
        }],
      }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing address.");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const upgraded = await validateQuoteBasketV3(
        basket,
        new Date("2026-08-12T00:00:00.000Z"),
        ids,
      );

      expect(upgraded.items[0]).toMatchObject({
        state: "ready",
        articleNumber: "GDHEPRD000172",
        resolution: "standard_ready",
      });
      expect(upgraded.items[1]).toMatchObject({
        state: "requires_readd",
        articleNumber: null,
      });
      await expect(validateQuoteBasketV3(
        basket,
        new Date("2026-08-12T00:00:00.000Z"),
        ids,
      )).rejects.toMatchObject({
        category: "contract",
        kind: "response_mismatch",
      });
      expect(JSON.stringify(basket)).toBe(before);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => error ? reject(error) : resolve()),
      );
    }
  });

  test("uses one A3 POST for eligible 1 and 50 projections with zero legacy calls", async () => {
    const observed: string[] = [];
    const server = createServer(async (request, response) => {
      observed.push(request.url ?? "");
      const requestBody = await body(request);
      const lines = requestBody.lines as Array<Record<string, unknown>>;
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify({
        apiVersion: "1",
        schemaVersion: "1.0.0",
        locale: "en",
        type: "mixed_quote_line_validation",
        lines: lines.map((line) => {
          const selection = line.selection as Record<string, unknown>;
          return {
            entryId: line.entryId,
            lineKind: "configured_product",
            resolution: "sales_follow_up",
            model: "FGD X15+PVC",
            publicPath: line.canonicalPath,
            articleNumber: null,
            selection: {
              type: "custom_length",
              articleNumber: null,
              lengthMeters: selection.lengthMeters,
              color: selection.color,
            },
            packaging: line.packaging,
            quantityUnit: "piece",
            quantity: line.quantity,
          };
        }),
      }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing address.");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const custom = mixedV3.items[1];
      const makeBasket = (count: number) => cloneAndValidateQuoteBasketV3({
        ...mixedV3,
        items: Array.from({ length: count }, (_value, index) => ({
          ...custom,
          entryId: `25000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
          selection: {
            ...custom.selection,
            lengthMeters: Number(((index + 1) / 10).toFixed(1)),
          },
        })),
      });

      await validateQuoteBasketV3(
        makeBasket(1),
        new Date("2026-08-12T00:00:00.000Z"),
        ids,
      );
      await validateQuoteBasketV3(
        makeBasket(50),
        new Date("2026-08-12T00:00:00.000Z"),
        ids,
      );

      expect(observed).toEqual([
        "/wp-json/gdhe/v1/quote-line-validations",
        "/wp-json/gdhe/v1/quote-line-validations",
      ]);
      expect(observed.some((url) =>
        /\/resolve|product-configuration|related-product-cards/.test(url),
      )).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => error ? reject(error) : resolve()),
      );
    }
  });
});
