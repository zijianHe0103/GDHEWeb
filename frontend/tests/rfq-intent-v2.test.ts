import { describe, expect, test, vi } from "vitest";

import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import {
  getValidatedRfqBody,
  validatePublicRfqSubmission,
  type ValidatedRfqDocument,
} from "../src/lib/rfq/server/v2";
import {
  RfqIntentError,
  issueLocalRfqIntent,
  verifyLocalRfqIntent,
} from "../src/lib/rfq/server/v2/intent";

const enabled = {
  NODE_ENV: "development",
  GDHE_RFQ_INTAKE_MODE: "stub",
  GDHE_RFQ_INTAKE_ORIGIN: "http://127.0.0.1:3000",
  GDHE_RFQ_HMAC_KEY_VERSION: "local-v2",
  GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
  GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
};

function setEnvironment(values = enabled): void {
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
}

function submissionFor(
  issued: ReturnType<typeof issueLocalRfqIntent>,
  overrides: Record<string, unknown> = {},
): ValidatedRfqDocument<"public_submission"> {
  return validatePublicRfqSubmission({
    ...structuredClone(publicSubmission),
    submissionIntent: issued.submissionIntent,
    idempotencyKey: issued.idempotencyKey,
    privacyNotice: issued.privacyNotice,
    ...overrides,
  });
}

function expectStableFailure(action: () => unknown): void {
  let caught: unknown;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RfqIntentError);
  expect(caught).toMatchObject({
    category: "intent",
    kind: "invalid_submission_intent",
  });
  expect(`${String(caught)} ${JSON.stringify(caught)}`).not.toMatch(
    /20{16}|PRIVATE|diagnostic|signature|secret/i,
  );
}

describe("TASK-028 local RFQ intent issuer and verifier", () => {
  test("issues an exact 30-minute snapshot/key/origin-bound token", () => {
    setEnvironment();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:20:00.000Z"));
    try {
      const issued = issueLocalRfqIntent(publicSubmission.basket.sourceBasket);

      expect(issued).toMatchObject({
        contractVersion: "2.0.0",
        privacyNotice: {
          version: "rfq-privacy-en-2026-08",
          presentedAt: "2026-08-12T08:20:00.000Z",
        },
        expiresAt: "2026-08-12T08:50:00.000Z",
      });
      expect(issued.idempotencyKey).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(issued.submissionIntent).toMatch(/^[A-Za-z0-9._~-]{32,8192}$/);
      expect(Object.isFrozen(issued)).toBe(true);
      expect(Object.isFrozen(issued.privacyNotice)).toBe(true);

      const submission = submissionFor(issued);
      expect(() => verifyLocalRfqIntent(submission)).not.toThrow();
      expect(getValidatedRfqBody(submission, "public_submission")).toMatchObject({
        idempotencyKey: issued.idempotencyKey,
      });
    } finally {
      vi.useRealTimers();
      vi.unstubAllEnvs();
    }
  });

  test("fails closed on tamper, context mismatch, expiry and invalid clocks", () => {
    setEnvironment();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:20:00.000Z"));
    try {
      const issued = issueLocalRfqIntent(publicSubmission.basket.sourceBasket);
      const tokenTail = issued.submissionIntent.at(-1);
      const tampered = {
        ...issued,
        submissionIntent: `${issued.submissionIntent.slice(0, -1)}${tokenTail === "A" ? "B" : "A"}`,
      };
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(tampered)));
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor({
        ...issued,
        submissionIntent: "A".repeat(32),
      })));

      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued, {
        idempotencyKey: "26000000-0000-4000-8000-000000000009",
      })));
      const changedBasket = structuredClone(publicSubmission.basket);
      changedBasket.sourceBasket.revision += 1;
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued, {
        basket: changedBasket,
      })));

      vi.stubEnv("GDHE_RFQ_INTAKE_ORIGIN", "http://127.0.0.1:3001");
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued)));
      vi.stubEnv("GDHE_RFQ_INTAKE_ORIGIN", enabled.GDHE_RFQ_INTAKE_ORIGIN);
      vi.stubEnv("GDHE_RFQ_HMAC_KEY_VERSION", "local-v3");
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued)));
      vi.stubEnv("GDHE_RFQ_HMAC_KEY_VERSION", enabled.GDHE_RFQ_HMAC_KEY_VERSION);
      vi.stubEnv("GDHE_RFQ_HMAC_KEY_HEX", "21".repeat(32));
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued)));

      setEnvironment();
      vi.setSystemTime(new Date(issued.expiresAt));
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued)));
      vi.setSystemTime(new Date("2026-08-12T08:19:59.999Z"));
      expectStableFailure(() => verifyLocalRfqIntent(submissionFor(issued)));

      vi.setSystemTime(new Date(8_640_000_000_000_000 - 1_000));
      expectStableFailure(() => issueLocalRfqIntent(publicSubmission.basket.sourceBasket));
    } finally {
      vi.useRealTimers();
      vi.unstubAllEnvs();
    }
  });

  test("does not reflect or coerce a hostile document", () => {
    setEnvironment();
    const calls = { get: 0, getPrototypeOf: 0, ownKeys: 0, toPrimitive: 0 };
    const target = Object.create(null) as Record<PropertyKey, unknown>;
    Object.defineProperty(target, Symbol.toPrimitive, {
      value() {
        calls.toPrimitive += 1;
        throw new Error("PRIVATE_INTENT_COERCION");
      },
    });
    const hostile = new Proxy(target, {
      get() {
        calls.get += 1;
        throw new Error("PRIVATE_INTENT_GET");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("PRIVATE_INTENT_PROTOTYPE");
      },
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("PRIVATE_INTENT_KEYS");
      },
    });

    expectStableFailure(() => verifyLocalRfqIntent(
      hostile as ValidatedRfqDocument<"public_submission">,
    ));
    expectStableFailure(() => issueLocalRfqIntent(hostile));
    expect(calls).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0, toPrimitive: 0 });
    vi.unstubAllEnvs();
  });
});
