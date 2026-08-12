import { afterEach, describe, expect, test, vi } from "vitest";

import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import { POST } from "../src/app/api/rfq/intent/route";

const enabled = {
  NODE_ENV: "development",
  GDHE_RFQ_INTAKE_MODE: "stub",
  GDHE_RFQ_INTAKE_ORIGIN: "http://127.0.0.1:3000",
  GDHE_RFQ_HMAC_KEY_VERSION: "local-v2",
  GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
  GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

function setEnvironment(values = enabled): void {
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
}

function request(
  body: BodyInit = JSON.stringify(publicSubmission.basket.sourceBasket),
  headers: Record<string, string> = {},
): Request {
  return new Request("http://127.0.0.1:3000/api/rfq/intent/", {
    method: "POST",
    headers: {
      origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
      "content-type": "application/json",
      ...headers,
    },
    body,
  });
}

describe("TASK-028 local RFQ intent Route", () => {
  test("issues only the closed no-store local response", async () => {
    setEnvironment();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:20:00.000Z"));
    const parse = vi.spyOn(JSON, "parse");
    try {
      const requestBody = JSON.stringify(publicSubmission.basket.sourceBasket);
      const result = await POST(request(requestBody));

      expect(result.status).toBe(200);
      expect(result.headers.get("cache-control")).toBe("no-store");
      expect(result.headers.get("access-control-allow-origin")).toBeNull();
      const text = await result.text();
      expect(parse.mock.calls.filter(([value]) => value === requestBody)).toHaveLength(1);
      parse.mockRestore();
      expect(JSON.parse(text)).toEqual(expect.objectContaining({
        contractVersion: "2.0.0",
        submissionIntent: expect.stringMatching(/^[A-Za-z0-9._~-]{32,8192}$/),
        idempotencyKey: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        privacyNotice: {
          version: "rfq-privacy-en-2026-08",
          presentedAt: "2026-08-12T08:20:00.000Z",
        },
        expiresAt: "2026-08-12T08:50:00.000Z",
      }));
    } finally {
      parse.mockRestore();
    }
  });

  test("fails closed before issuer work when disabled or production", async () => {
    const unreadable = new ReadableStream({
      pull() {
        throw new Error("PRIVATE_INTENT_BODY_MUST_NOT_BE_READ");
      },
    });
    const disabled = await POST(new Request(
      "http://127.0.0.1:3000/api/rfq/intent/",
      { method: "POST", body: unreadable, duplex: "half" } as RequestInit,
    ));
    expect(disabled.status).toBe(404);
    expect(await disabled.text()).toBe("");
    expect(disabled.headers.get("cache-control")).toBe("no-store");

    setEnvironment({ ...enabled, NODE_ENV: "production" });
    const production = await POST(request());
    expect(production.status).toBe(404);
    expect(await production.text()).toBe("");
  });

  test("maps exact origin, media, raw and closed snapshot failures safely", async () => {
    setEnvironment();
    const cases = [
      [request("{}", { origin: "http://evil.example" }), 403, "request_not_allowed"],
      [request("{}", { "content-type": "application/json; charset=utf-8" }), 415, "unsupported_media_type"],
      [request("{}", { "content-length": "8193" }), 413, "payload_too_large"],
      [request(new Uint8Array(8_193)), 413, "payload_too_large"],
      [request(Uint8Array.from([0xc3, 0x28])), 400, "invalid_request"],
      [request("{"), 400, "invalid_request"],
      [request(JSON.stringify({ ...publicSubmission.basket.sourceBasket, extra: true })), 400, "invalid_request"],
    ] as const;

    for (const [input, status, code] of cases) {
      const result = await POST(input);
      expect(result.status).toBe(status);
      expect(await result.json()).toMatchObject({ error: { code } });
      expect(result.headers.get("cache-control")).toBe("no-store");
      expect(result.headers.get("access-control-allow-origin")).toBeNull();
    }
  });

  test("normalizes hostile body-reader failure without observing the thrown value", async () => {
    setEnvironment();
    const calls = { get: 0, getPrototypeOf: 0, ownKeys: 0, toPrimitive: 0 };
    const target = Object.create(null) as Record<PropertyKey, unknown>;
    Object.defineProperty(target, Symbol.toPrimitive, {
      value() {
        calls.toPrimitive += 1;
        throw new Error("PRIVATE_INTENT_BODY_COERCION");
      },
    });
    const hostile = new Proxy(target, {
      get() {
        calls.get += 1;
        throw new Error("PRIVATE_INTENT_BODY_GET");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("PRIVATE_INTENT_BODY_PROTOTYPE");
      },
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("PRIVATE_INTENT_BODY_KEYS");
      },
    });
    const body = new ReadableStream({
      pull(controller) {
        controller.error(hostile);
      },
    });
    const result = await POST(new Request(
      "http://127.0.0.1:3000/api/rfq/intent/",
      {
        method: "POST",
        headers: {
          origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
          "content-type": "application/json",
        },
        body,
        duplex: "half",
      } as RequestInit,
    ));

    expect(result.status).toBe(400);
    const publicBody = await result.json();
    expect(publicBody).toMatchObject({ error: { code: "invalid_request" } });
    expect(JSON.stringify(publicBody)).not.toContain("PRIVATE_INTENT_BODY");
    expect(calls).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0, toPrimitive: 0 });
  });
});
