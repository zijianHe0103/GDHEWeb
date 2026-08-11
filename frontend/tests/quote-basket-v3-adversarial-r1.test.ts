import { createServer, type IncomingMessage } from "node:http";

import { afterEach, describe, expect, test } from "vitest";

import mixedV2 from "../src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import mixedV3 from "../src/lib/quote-basket-contract/v3/samples/success/mixed.json";
import {
  QuoteBasketV3DomainError,
  cloneAndValidateQuoteBasketV3,
  parseQuoteBasketV3,
} from "../src/lib/quote-basket/v3";
import * as batchModule from "../src/lib/quote-basket/v3/batch";

const originalWordPressApiUrl = process.env.WORDPRESS_API_URL;
const revisionIds = {
  writerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  mutationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
} as const;

afterEach(() => {
  if (originalWordPressApiUrl === undefined) delete process.env.WORDPRESS_API_URL;
  else process.env.WORDPRESS_API_URL = originalWordPressApiUrl;
});

async function requestBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function validResponse(request: Record<string, unknown>): Record<string, unknown> {
  const line = (request.lines as Array<Record<string, unknown>>)[0]!;
  const selection = line.selection as Record<string, unknown>;
  return {
    apiVersion: "1",
    schemaVersion: "1.0.0",
    locale: "en",
    type: "mixed_quote_line_validation",
    lines: [{
      entryId: line.entryId,
      lineKind: "configured_product",
      resolution: "resolved_article_number",
      model: "FGD X15+PVC",
      publicPath: line.canonicalPath,
      articleNumber: "GDHEPRD000172",
      selection: {
        type: "article_number",
        articleNumber: "GDHEPRD000172",
        lengthMeters: selection.lengthMeters,
        color: selection.color,
      },
      packaging: line.packaging,
      quantityUnit: "piece",
      quantity: line.quantity,
    }],
  };
}

describe("TASK-025 adversarial Round 1 P1 closures", () => {
  test("does not expose a plain response application bypass", () => {
    expect(batchModule).not.toHaveProperty("applyQuoteBasketV3Validation");
  });

  test("rejects incomplete or Schema-invalid responses through the public orchestration", async () => {
    const variants = [
      {
        kind: "unsupported_schema",
        mutate: (response: Record<string, unknown>) => ({ lines: response.lines }),
      },
      {
        kind: "invalid_success_payload",
        mutate: (response: Record<string, unknown>) => {
          const copy = structuredClone(response);
          delete ((copy.lines as Array<Record<string, unknown>>)[0]!).model;
          return copy;
        },
      },
      {
        kind: "invalid_success_payload",
        mutate: (response: Record<string, unknown>) => ({ ...response, unexpected: true }),
      },
      {
        kind: "invalid_success_payload",
        mutate: (response: Record<string, unknown>) => {
          const copy = structuredClone(response);
          ((copy.lines as Array<Record<string, unknown>>)[0]!).unexpected = true;
          return copy;
        },
      },
      {
        kind: "invalid_success_payload",
        mutate: (response: Record<string, unknown>) => ({ ...response, locale: "EN" }),
      },
    ] as const;
    let call = 0;
    const server = createServer(async (request, response) => {
      const body = await requestBody(request);
      const variant = variants[call++]!;
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify(variant.mutate(validResponse(body))));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing address.");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const basket = parseQuoteBasketV3(
        JSON.stringify(mixedV2),
        new Date("2026-08-12T00:00:00.000Z"),
      );
      const before = JSON.stringify(basket);

      for (const variant of variants) {
        await expect(batchModule.validateQuoteBasketV3(
          basket,
          new Date("2026-08-12T00:00:00.000Z"),
          revisionIds,
        )).rejects.toMatchObject({
          category: "contract",
          kind: variant.kind,
        });
        expect(JSON.stringify(basket)).toBe(before);
      }
      expect(call).toBe(variants.length);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => error ? reject(error) : resolve()),
      );
    }
  });

  test("canonicalizes a frozen v2 uppercase UUID and upgrades it in one batch", async () => {
    const legacy = structuredClone(mixedV2);
    legacy.writerId = "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA";
    legacy.mutationId = "BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB";
    legacy.items[0]!.entryId = "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF";
    let calls = 0;
    const server = createServer(async (request, response) => {
      calls += 1;
      const body = await requestBody(request);
      expect((body.lines as Array<Record<string, unknown>>)[0]!.entryId).toBe(
        "abcdefab-cdef-4abc-8abc-abcdefabcdef",
      );
      response.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify(validResponse(body)));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing address.");
      process.env.WORDPRESS_API_URL = `http://127.0.0.1:${address.port}/wp-json`;
      const migrated = parseQuoteBasketV3(
        JSON.stringify(legacy),
        new Date("2026-08-12T00:00:00.000Z"),
      );

      expect(migrated).toMatchObject({
        writerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        mutationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      });
      expect(migrated.items[0]!.entryId).toBe(
        "abcdefab-cdef-4abc-8abc-abcdefabcdef",
      );
      const upgraded = await batchModule.validateQuoteBasketV3(
        migrated,
        new Date("2026-08-12T00:00:00.000Z"),
        revisionIds,
      );
      expect(upgraded.items[0]).toMatchObject({
        state: "ready",
        articleNumber: "GDHEPRD000172",
      });
      expect(calls).toBe(1);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => error ? reject(error) : resolve()),
      );
    }
  });

  test("lowercases v1 and v3 UUIDs and rejects a case-fold entry collision", () => {
    const legacyConfigured = structuredClone(mixedV2.items[0]!);
    const { lineKind: _lineKind, ...v1Item } = legacyConfigured;
    void _lineKind;
    const v1 = {
      schemaVersion: "1.0.0",
      revision: mixedV2.revision,
      writerId: "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA",
      mutationId: "BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB",
      updatedAt: mixedV2.updatedAt,
      expiresAt: mixedV2.expiresAt,
      items: [{ ...v1Item, entryId: "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF" }],
    };
    expect(parseQuoteBasketV3(
      JSON.stringify(v1),
      new Date("2026-08-12T00:00:00.000Z"),
    ).items[0]!.entryId).toBe("abcdefab-cdef-4abc-8abc-abcdefabcdef");

    const collision = {
      ...structuredClone(mixedV3),
      items: [
        { ...structuredClone(mixedV3.items[0]!), entryId: "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF" },
        { ...structuredClone(mixedV3.items[2]!), entryId: "abcdefab-cdef-4abc-8abc-abcdefabcdef" },
      ],
    };
    expect(() => cloneAndValidateQuoteBasketV3(collision)).toThrow(
      QuoteBasketV3DomainError,
    );
  });
});
