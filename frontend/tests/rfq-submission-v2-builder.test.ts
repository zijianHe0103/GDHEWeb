import { createServer } from "node:http";
import { once } from "node:events";

import { afterEach, describe, expect, test, vi } from "vitest";

import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import readyBasket from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import { POST as intakePost } from "../src/app/api/rfq/intake/route";
import { normalizeRfqCustomer } from "../src/lib/rfq/customer";
import {
  getValidatedRfqBody,
  validatePublicRfqSubmission,
} from "../src/lib/rfq/server/v2";
import { issueLocalRfqIntent } from "../src/lib/rfq/server/v2/intent";
import {
  RfqSubmissionError,
  buildPublicRfqSubmission,
  projectQuoteBasketV3ToPublicRfqBasket,
  validateLocalRfqIntentResponse,
} from "../src/lib/rfq/submission";

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

function setEnvironment(values: Record<string, string> = enabled): void {
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
}

function normalizedCustomer() {
  return normalizeRfqCustomer(structuredClone(publicSubmission.customer));
}

function expectBuildFailure(action: () => unknown, kind: string): void {
  let caught: unknown;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RfqSubmissionError);
  expect(caught).toMatchObject({ category: "submission", kind });
  expect(`${String(caught)} ${JSON.stringify(caught)}`).not.toMatch(
    /diagnostic|instancePath|schemaPath|raw|secret|signature/i,
  );
}

describe("TASK-028 complete public RFQ submission builder", () => {
  test("builds one closed frozen draft that passes the delivered v2 runtime", () => {
    setEnvironment();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:20:00.000Z"));
    const customer = normalizedCustomer();
    const basket = projectQuoteBasketV3ToPublicRfqBasket(structuredClone(readyBasket));
    const issued = issueLocalRfqIntent(basket.sourceBasket);
    const intent = validateLocalRfqIntentResponse(structuredClone(issued));
    const fetch = vi.spyOn(globalThis, "fetch");
    try {
      const draft = buildPublicRfqSubmission({ customer, basket, intent });

      expect(draft).toEqual({
        contractVersion: "2.0.0",
        submissionIntent: issued.submissionIntent,
        idempotencyKey: issued.idempotencyKey,
        basket: publicSubmission.basket,
        customer: publicSubmission.customer,
        privacyNotice: issued.privacyNotice,
        antiAbuse: { honeypot: "" },
      });
      expect(fetch).not.toHaveBeenCalled();
      expect(Object.isFrozen(draft)).toBe(true);
      expect(Object.isFrozen(draft.antiAbuse)).toBe(true);
      const validated = validatePublicRfqSubmission(draft);
      expect(getValidatedRfqBody(validated, "public_submission")).toEqual(draft);
      expect(new TextEncoder().encode(JSON.stringify(draft)).byteLength).toBeLessThanOrEqual(
        262_144,
      );
    } finally {
      fetch.mockRestore();
    }
  });

  test("requires normalized customer, projected Basket and validated intent provenance", () => {
    setEnvironment();
    const customer = normalizedCustomer();
    const basket = projectQuoteBasketV3ToPublicRfqBasket(structuredClone(readyBasket));
    const issued = issueLocalRfqIntent(basket.sourceBasket);
    const intent = validateLocalRfqIntentResponse(structuredClone(issued));

    expectBuildFailure(() => buildPublicRfqSubmission({
      customer: { ok: true, customer: structuredClone(publicSubmission.customer) },
      basket,
      intent,
    }), "invalid_customer");
    expectBuildFailure(() => buildPublicRfqSubmission({
      customer,
      basket: structuredClone(basket),
      intent,
    }), "invalid_basket");
    expectBuildFailure(() => buildPublicRfqSubmission({
      customer,
      basket,
      intent: structuredClone(issued),
    }), "invalid_intent");
    expectBuildFailure(() => validateLocalRfqIntentResponse({
      ...structuredClone(issued),
      expiresAt: issued.privacyNotice.presentedAt,
    }), "invalid_intent");
  });
});

describe("TASK-028 intake pre-reservation intent binding", () => {
  test("keeps replay ahead of intent expiry and rejects an unseen tamper before mixed work", async () => {
    let mixedCalls = 0;
    const server = createServer((request, result) => {
      if (request.url === "/wp-json/gdhe/v1/quote-line-validations") mixedCalls += 1;
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
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-08-12T08:20:00.000Z"));

      const customer = normalizedCustomer();
      const basket = projectQuoteBasketV3ToPublicRfqBasket(structuredClone(readyBasket));
      const issued = issueLocalRfqIntent(basket.sourceBasket);
      const validDraft = buildPublicRfqSubmission({
        customer,
        basket,
        intent: validateLocalRfqIntentResponse(structuredClone(issued)),
      });
      const post = (body: unknown) => intakePost(new Request(
        "http://127.0.0.1:3000/api/rfq/intake/",
        {
          method: "POST",
          headers: {
            origin: enabled.GDHE_RFQ_INTAKE_ORIGIN,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        },
      ));

      const accepted = await post(validDraft);
      expect(accepted.status).toBe(201);
      expect(mixedCalls).toBe(1);

      vi.setSystemTime(new Date("2026-08-12T08:50:00.000Z"));
      const replay = await post(validDraft);
      expect(replay.status).toBe(200);
      expect(mixedCalls).toBe(1);

      const second = issueLocalRfqIntent(basket.sourceBasket);
      const tail = second.submissionIntent.at(-1);
      const tamperedIntent = validateLocalRfqIntentResponse({
        ...structuredClone(second),
        submissionIntent: `${second.submissionIntent.slice(0, -1)}${tail === "A" ? "B" : "A"}`,
      });
      const tamperedDraft = buildPublicRfqSubmission({ customer, basket, intent: tamperedIntent });
      const rejected = await post(tamperedDraft);
      expect(rejected.status).toBe(403);
      expect(await rejected.json()).toMatchObject({
        error: { code: "invalid_submission_intent" },
      });
      expect(mixedCalls).toBe(1);

      const correctedDraft = buildPublicRfqSubmission({
        customer,
        basket,
        intent: validateLocalRfqIntentResponse(structuredClone(second)),
      });
      const corrected = await post(correctedDraft);
      expect(corrected.status).toBe(201);
      expect(mixedCalls).toBe(2);
    } finally {
      vi.useRealTimers();
      server.close();
      await once(server, "close");
    }
  }, 10_000);
});
