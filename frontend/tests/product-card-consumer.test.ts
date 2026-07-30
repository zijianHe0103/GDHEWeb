import { createServer, type RequestListener } from "node:http";
import type { AddressInfo } from "node:net";

import { describe, expect, test } from "vitest";

import errorSamples from "../src/lib/cms/product-card-contract/samples/errors/product-card-errors.json";
import allCards from "../src/lib/cms/product-card-contract/samples/success/all.json";
import {
  ProductCardHttpError,
  ProductCardProtocolError,
} from "../src/lib/cms/server/product-cards/errors";
import { loadProductCardCollection } from "../src/lib/cms/server/product-cards";

async function withLoopbackServer(
  listener: RequestListener,
  assertion: () => Promise<void>,
): Promise<void> {
  const server = createServer(listener);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  const previous = process.env.WORDPRESS_API_URL;
  process.env.WORDPRESS_API_URL =
    `http://127.0.0.1:${address.port}/wp-json`;

  try {
    await assertion();
  } finally {
    if (previous === undefined) {
      delete process.env.WORDPRESS_API_URL;
    } else {
      process.env.WORDPRESS_API_URL = previous;
    }
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("ProductCard collection orchestration", () => {
  test("uses one collection request and zero per-card resolve requests", async () => {
    const paths: string[] = [];

    await withLoopbackServer((request, response) => {
      paths.push(request.url ?? "");
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        ETag: '"all-cards"',
      });
      response.end(JSON.stringify(allCards));
    }, async () => {
      await expect(
        loadProductCardCollection({ perPage: 100 }),
      ).resolves.toEqual(allCards);
    });

    expect(paths).toHaveLength(1);
    expect(paths[0]).toContain("/gdhe/v1/product-cards?");
    expect(paths[0]).not.toContain("/resolve");
  });

  test("validates then sanitizes a normalized HTTP error", async () => {
    const body = errorSamples["filter-taxonomy"];

    await withLoopbackServer((_request, response) => {
      response.writeHead(400, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(body));
    }, async () => {
      try {
        await loadProductCardCollection();
        expect.unreachable("Expected a sanitized HTTP error.");
      } catch (error) {
        expect(error).toBeInstanceOf(ProductCardHttpError);
        const httpError = error as ProductCardHttpError;
        expect(httpError).toMatchObject({
          category: "http",
          kind: "bad_request",
          status: 400,
        });
        expect(httpError.body).toBeUndefined();
        expect(JSON.stringify(httpError)).not.toContain(body.message);
      }
    });
  });

  test("fails closed when HTTP status and normalized body status differ", async () => {
    const body = structuredClone(errorSamples["filter-taxonomy"]);
    body.status = 404;

    await withLoopbackServer((_request, response) => {
      response.writeHead(400, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(body));
    }, async () => {
      await expect(loadProductCardCollection()).rejects.toEqual(
        new ProductCardProtocolError("error_status_mismatch"),
      );
    });
  });

  test("does not adapt a 304 without a matching validated cache", async () => {
    await withLoopbackServer((_request, response) => {
      response.writeHead(304, {
        "Cache-Control": "public, max-age=60",
        ETag: '"cards"',
      });
      response.end();
    }, async () => {
      await expect(loadProductCardCollection()).rejects.toEqual(
        new ProductCardProtocolError("not_modified_without_cache"),
      );
    });
  });
});
