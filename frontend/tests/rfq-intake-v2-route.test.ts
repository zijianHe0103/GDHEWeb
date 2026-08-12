import { createServer } from "node:http";
import { once } from "node:events";

import { afterEach, describe, expect, test, vi } from "vitest";

import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import { POST } from "../src/app/api/rfq/intake/route";
import { issueLocalRfqIntent } from "../src/lib/rfq/server/v2/intent";

const enabled = {
  NODE_ENV: "development",
  GDHE_RFQ_INTAKE_MODE: "stub",
  GDHE_RFQ_INTAKE_ORIGIN: "http://127.0.0.1:3000",
  GDHE_RFQ_HMAC_KEY_VERSION: "local-v2",
  GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
  GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
};

afterEach(() => vi.unstubAllEnvs());

function setEnvironment(values: Record<string, string>): void {
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
}

describe("TASK-027 local RFQ POST transport gates", () => {
  test("fails closed when disabled and rejects origin/media before body parsing", async () => {
    const disabledBody = new ReadableStream({
      pull() {
        throw new Error("BODY_MUST_NOT_BE_READ");
      },
    });
    const disabled = await POST(new Request("http://localhost/api/rfq/intake/", {
      method: "POST",
      body: disabledBody,
      duplex: "half",
    } as RequestInit));
    expect(disabled.status).toBe(404);
    expect(await disabled.text()).toBe("");
    expect(disabled.headers.get("cache-control")).toBe("no-store");

    setEnvironment(enabled);
    const wrongOrigin = await POST(new Request("http://localhost/api/rfq/intake/", {
      method: "POST",
      headers: { origin: "http://evil.example", "content-type": "application/json" },
      body: "{}",
    }));
    expect(wrongOrigin.status).toBe(403);

    const wrongMedia = await POST(new Request("http://localhost/api/rfq/intake/", {
      method: "POST",
      headers: {
        origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
        "content-type": "application/json; charset=utf-8",
      },
      body: "{}",
    }));
    expect(wrongMedia.status).toBe(415);
    expect(wrongMedia.headers.get("access-control-allow-origin")).toBeNull();
  });

  test("maps declared/stream limits and malformed UTF-8, JSON and contract safely", async () => {
    setEnvironment(enabled);
    const headers = {
      origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
      "content-type": "application/json",
    };
    const cases = [
      ["declared", new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers: { ...headers, "content-length": "262145" },
        body: "{}",
      }), 413, "payload_too_large"],
      ["stream", new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers,
        body: new Uint8Array(262_145),
      }), 413, "payload_too_large"],
      ["utf8", new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers,
        body: Uint8Array.from([0xc3, 0x28]),
      }), 400, "invalid_request"],
      ["json", new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers,
        body: "{",
      }), 400, "invalid_request"],
      ["contract", new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers,
        body: "{}",
      }), 400, "invalid_request"],
    ] as const;

    for (const [name, request, status, code] of cases) {
      const result = await POST(request);
      expect(result.status, name).toBe(status);
      expect(await result.json(), name).toMatchObject({ error: { code } });
      expect(result.headers.get("cache-control"), name).toBe("no-store");
    }
  });

  test("normalizes hostile body-reader rejection without observing the unknown value", async () => {
    setEnvironment(enabled);
    const traps = {
      get: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      has: 0,
      ownKeys: 0,
      set: 0,
    };
    const hostile = new Proxy(Object.create(null), {
      get() {
        traps.get += 1;
        throw new Error("PRIVATE_RAW_BODY_GET");
      },
      getOwnPropertyDescriptor() {
        traps.getOwnPropertyDescriptor += 1;
        throw new Error("PRIVATE_RAW_BODY_DESCRIPTOR");
      },
      getPrototypeOf() {
        traps.getPrototypeOf += 1;
        throw new Error("PRIVATE_RAW_BODY_DIAGNOSTIC");
      },
      has() {
        traps.has += 1;
        throw new Error("PRIVATE_RAW_BODY_HAS");
      },
      ownKeys() {
        traps.ownKeys += 1;
        throw new Error("PRIVATE_RAW_BODY_KEYS");
      },
      set() {
        traps.set += 1;
        throw new Error("PRIVATE_RAW_BODY_SET");
      },
    });
    const body = new ReadableStream({
      pull(controller) {
        controller.error(hostile);
      },
    });

    const result = await POST(new Request("http://localhost/api/rfq/intake/", {
      method: "POST",
      headers: {
        origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
        "content-type": "application/json",
      },
      body,
      duplex: "half",
    } as RequestInit));

    expect(result.status).toBe(400);
    const publicBody = await result.json();
    expect(publicBody).toMatchObject({ error: { code: "invalid_request" } });
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(result.headers.get("access-control-allow-origin")).toBeNull();
    expect(traps).toEqual({
      get: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      has: 0,
      ownKeys: 0,
      set: 0,
    });
    expect(JSON.stringify(publicBody)).not.toContain("PRIVATE_RAW_BODY");
  });

  test("parses the raw JSON body exactly once before contract rejection", async () => {
    setEnvironment(enabled);
    const parse = vi.spyOn(JSON, "parse");
    try {
      const result = await POST(new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers: {
          origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
          "content-type": "application/json",
        },
        body: "{}",
      }));

      expect(result.status).toBe(400);
      expect(parse).toHaveBeenCalledTimes(1);
    } finally {
      parse.mockRestore();
    }
  });

  test("uses one real mixed POST for accepted 201 and returns replay 200", async () => {
    let mixedCalls = 0;
    let legacyCalls = 0;
    const server = createServer((request, result) => {
      if (request.url === "/wp-json/gdhe/v1/quote-line-validations") mixedCalls += 1;
      else legacyCalls += 1;
      request.resume();
      result.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      result.end(JSON.stringify(expectedResponse));
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing listener");
      setEnvironment({
        ...enabled,
        WORDPRESS_API_URL: `http://127.0.0.1:${address.port}/wp-json`,
      });
      const issued = issueLocalRfqIntent(publicSubmission.basket.sourceBasket);
      const boundSubmission = {
        ...structuredClone(publicSubmission),
        submissionIntent: issued.submissionIntent,
        idempotencyKey: issued.idempotencyKey,
        privacyNotice: issued.privacyNotice,
      };
      const request = () => new Request("http://localhost/api/rfq/intake/", {
        method: "POST",
        headers: {
          origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
          "content-type": "application/json",
        },
        body: JSON.stringify(boundSubmission),
      });

      const first = await POST(request());
      const replay = await POST(request());
      expect(first.status).toBe(201);
      expect(replay.status).toBe(200);
      expect(await replay.json()).toEqual(await first.json());
      expect(mixedCalls).toBe(1);
      expect(legacyCalls).toBe(0);
    } finally {
      server.close();
      await once(server, "close");
    }
  }, 10_000);
});
