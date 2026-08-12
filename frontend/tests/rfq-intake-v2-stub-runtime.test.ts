import { describe, expect, test } from "vitest";

import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import authoritativeDocument from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import type { MixedQuoteLineValidationDto } from "../src/lib/cms/server/article-number-batch";
import {
  StubRfqRepository,
  StubRfqSink,
  createRfqIntakeRuntime,
  getValidatedRfqBody,
  validatePublicRfqSubmission,
} from "../src/lib/rfq/server/v2";

function testSecret(): Uint8Array {
  return Uint8Array.from(Buffer.from(vectors.algorithm.testSecretKeyHex, "hex"));
}

function makeHarness(
  outcome: "accepted" | "indeterminate" | "rejected_before_delivery",
  options: Readonly<{
    rejectPreGate?: boolean;
    rejectMixed?: boolean;
    nextRequestReference?: () => string;
    repository?: StubRfqRepository;
    sink?: StubRfqSink;
  }> = {},
) {
  const events: string[] = [];
  class RecordingRepository extends StubRfqRepository {
    override async lookup(input: Parameters<StubRfqRepository["lookup"]>[0]) {
      events.push("lookup");
      return super.lookup(input);
    }

    override async reserve(input: Parameters<StubRfqRepository["reserve"]>[0]) {
      events.push("reserve");
      return super.reserve(input);
    }

    override async transition(input: Parameters<StubRfqRepository["transition"]>[0]) {
      events.push("transition");
      return super.transition(input);
    }
  }
  class RecordingSink extends StubRfqSink {
    override async deliver(document: Parameters<StubRfqSink["deliver"]>[0]) {
      events.push("sink");
      return super.deliver(document);
    }
  }
  const repository = options.repository ?? new RecordingRepository();
  const sink = options.sink ?? new RecordingSink(outcome);
  let now = "2026-08-12T03:02:00.000Z";
  let requestReferenceCount = 0;
  const runtime = createRfqIntakeRuntime({
    clock: { now: () => now },
    ids: {
      nextRfqId: () => authoritativeDocument.rfqId,
      nextPublicReference: () => authoritativeDocument.publicReference,
      nextRequestReference: () => {
        requestReferenceCount += 1;
        return options.nextRequestReference?.() ?? "REQ-23456789ABCD";
      },
    },
    keyMaterial: {
      keyVersion: vectors.algorithm.testKeyVersion,
      secretKey: testSecret(),
    },
    sourceSecurity: {
      ...authoritativeDocument.sourceSecurity,
      outcomeCode: "new_intent" as const,
    },
    repository,
    async preReservationGate() {
      events.push("pre_gate");
      if (options.rejectPreGate) throw new Error("PRIVATE_PRE_GATE");
    },
    async validateMixedQuoteLines(lines) {
      events.push(`mixed:${lines.length}`);
      if (options.rejectMixed) throw new Error("PRIVATE_MIXED");
      return structuredClone(expectedResponse) as MixedQuoteLineValidationDto;
    },
    sink,
  });
  return {
    events,
    repository,
    runtime,
    sink,
    requestReferenceCount: () => requestReferenceCount,
    setNow(value: string) {
      now = value;
    },
  };
}

describe("TASK-027 complete process-local RFQ intake", () => {
  test("returns accepted 201 then the exact stored receipt as 200 with one delivery", async () => {
    const harness = makeHarness("accepted");
    const submission = validatePublicRfqSubmission(publicSubmission);

    const first = await harness.runtime.resolve(submission);
    const replay = await harness.runtime.resolve(submission);

    expect(first.httpStatus).toBe(201);
    expect(replay.httpStatus).toBe(200);
    expect(first.document).toBe(replay.document);
    expect(getValidatedRfqBody(first.document, "public_receipt")).toEqual(
      getValidatedRfqBody(replay.document, "public_receipt"),
    );
    expect(getValidatedRfqBody(first.document, "public_receipt")).toEqual({
      contractVersion: "2.0.0",
      publicReference: authoritativeDocument.publicReference,
      status: "accepted",
      receivedAt: "2026-08-12T03:02:00.000Z",
      lineCount: 3,
      messageKey: "rfq.accepted",
      submittedBasketSnapshot: publicSubmission.basket.sourceBasket,
      submittedBasketToken: vectors.submittedBasketTokenSha256Hex,
    });
    expect(JSON.stringify(first.document)).toBe('{"kind":"public_receipt"}');
    const publicBody = JSON.stringify(
      getValidatedRfqBody(first.document, "public_receipt"),
    );
    for (const forbidden of [
      "Ada Buyer",
      "GDHEPRD",
      authoritativeDocument.rfqId,
      authoritativeDocument.sourceSecurity.sourceFingerprint,
      vectors.algorithm.testSecretKeyHex,
    ]) {
      expect(publicBody).not.toContain(forbidden);
    }
    expect(harness.events).toEqual([
      "lookup", "pre_gate", "reserve", "mixed:3", "sink", "transition", "lookup",
    ]);
    expect(harness.sink.callCount).toBe(1);
    expect(harness.repository.inspect()[0]).toMatchObject({
      createdAt: "2026-08-12T03:02:00.000Z",
      expiresAt: "2026-09-11T03:02:00.000Z",
      status: "accepted",
    });
  });

  test.each([
    ["indeterminate", 202, "processing", "rfq.processing", 30],
    ["rejected_before_delivery", 409, undefined, undefined, undefined],
  ] as const)(
    "stores and replays the %s outcome without resend",
    async (outcome, status, receiptStatus, messageKey, retryAfterSeconds) => {
      const harness = makeHarness(outcome);
      const submission = validatePublicRfqSubmission(publicSubmission);
      const first = await harness.runtime.resolve(submission);
      const replay = await harness.runtime.resolve(submission);

      expect(first.httpStatus).toBe(status);
      expect(replay.httpStatus).toBe(status);
      expect(replay.document).toBe(first.document);
      expect(harness.events).toEqual([
        "lookup", "pre_gate", "reserve", "mixed:3", "sink", "transition", "lookup",
      ]);
      expect(harness.sink.callCount).toBe(1);
      if (receiptStatus) {
        expect(getValidatedRfqBody(first.document, "public_receipt")).toMatchObject({
          status: receiptStatus,
          messageKey,
          retryAfterSeconds,
        });
      } else {
        expect(getValidatedRfqBody(first.document, "public_error")).toEqual({
          contractVersion: "2.0.0",
          error: {
            code: "service_temporarily_unavailable",
            requestReference: "REQ-23456789ABCD",
            messageKey: "rfq.error.service_temporarily_unavailable",
          },
        });
      }
    },
  );

  test("stores a mixed failure after reservation and replays it with zero sink calls", async () => {
    const harness = makeHarness("accepted", { rejectMixed: true });
    const submission = validatePublicRfqSubmission(publicSubmission);

    const first = await harness.runtime.resolve(submission);
    const replay = await harness.runtime.resolve(submission);

    expect(first.httpStatus).toBe(409);
    expect(replay.document).toBe(first.document);
    expect(getValidatedRfqBody(first.document, "public_error")).toEqual({
      contractVersion: "2.0.0",
      error: {
        code: "basket_refresh_required",
        requestReference: "REQ-23456789ABCD",
        messageKey: "rfq.error.basket_refresh_required",
        fieldErrors: [{ field: "basket", code: "changed" }],
      },
    });
    expect(harness.events).toEqual([
      "lookup", "pre_gate", "reserve", "mixed:3", "transition", "lookup",
    ]);
    expect(harness.sink.callCount).toBe(0);
    expect(harness.requestReferenceCount()).toBe(1);
  });

  test("returns conflict and pre-gate errors without changing retained state", async () => {
    const accepted = makeHarness("accepted");
    const submission = validatePublicRfqSubmission(publicSubmission);
    await accepted.runtime.resolve(submission);
    const before = accepted.repository.inspect();
    const changed = structuredClone(publicSubmission);
    changed.customer.message = "A different business request.";

    const conflict = await accepted.runtime.resolve(
      validatePublicRfqSubmission(changed),
    );
    expect(conflict.httpStatus).toBe(409);
    expect(getValidatedRfqBody(conflict.document, "public_error")).toMatchObject({
      error: { code: "idempotency_conflict" },
    });
    expect(accepted.repository.inspect()).toEqual(before);
    expect(accepted.events).toEqual([
      "lookup", "pre_gate", "reserve", "mixed:3", "sink", "transition", "lookup",
    ]);
    expect(accepted.sink.callCount).toBe(1);

    const rejected = makeHarness("accepted", { rejectPreGate: true });
    const preGate = await rejected.runtime.resolve(submission);
    expect(preGate.httpStatus).toBe(409);
    expect(getValidatedRfqBody(preGate.document, "public_error")).toMatchObject({
      error: { code: "request_not_allowed" },
    });
    expect(rejected.repository.inspect()).toEqual([]);
    expect(rejected.events).toEqual(["lookup", "pre_gate"]);
    expect(rejected.sink.callCount).toBe(0);
  });

  test("normalizes hostile non-string request references without coercion or reflection", async () => {
    type TrapName =
      | "get"
      | "getOwnPropertyDescriptor"
      | "getPrototypeOf"
      | "has"
      | "ownKeys";
    const makeTrapCounts = (): Record<TrapName, number> => ({
      get: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      has: 0,
      ownKeys: 0,
    });
    const makeHandler = (counts: Record<TrapName, number>): ProxyHandler<object> => ({
      get() {
        counts.get += 1;
        throw new Error("PRIVATE_REQUEST_REFERENCE_GET");
      },
      getOwnPropertyDescriptor() {
        counts.getOwnPropertyDescriptor += 1;
        throw new Error("PRIVATE_REQUEST_REFERENCE_DESCRIPTOR");
      },
      getPrototypeOf() {
        counts.getPrototypeOf += 1;
        throw new Error("PRIVATE_REQUEST_REFERENCE_PROTOTYPE");
      },
      has() {
        counts.has += 1;
        throw new Error("PRIVATE_REQUEST_REFERENCE_HAS");
      },
      ownKeys() {
        counts.ownKeys += 1;
        throw new Error("PRIVATE_REQUEST_REFERENCE_KEYS");
      },
    });

    const hostileTraps = makeTrapCounts();
    const hostile = new Proxy(Object.create(null), makeHandler(hostileTraps));
    const revokedTraps = makeTrapCounts();
    const revoked = Proxy.revocable(Object.create(null), makeHandler(revokedTraps));
    revoked.revoke();

    for (const candidate of [hostile, revoked.proxy]) {
      const harness = makeHarness("accepted", {
        rejectPreGate: true,
        nextRequestReference: () => candidate as unknown as string,
      });
      const error = await harness.runtime.resolve(
        validatePublicRfqSubmission(publicSubmission),
      ).catch((value: unknown) => value);

      expect(error).toMatchObject({
        category: "intake",
        kind: "dependency_failed",
      });
      expect(JSON.stringify(error)).not.toContain("PRIVATE_REQUEST_REFERENCE");
      expect(harness.events).toEqual(["lookup", "pre_gate"]);
      expect(harness.repository.inspect()).toEqual([]);
      expect(harness.requestReferenceCount()).toBe(1);
    }

    expect(hostileTraps).toEqual(makeTrapCounts());
    expect(revokedTraps).toEqual(makeTrapCounts());

    const valid = makeHarness("accepted", { rejectPreGate: true });
    const result = await valid.runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    );
    expect(result.httpStatus).toBe(409);
    expect(getValidatedRfqBody(result.document, "public_error")).toMatchObject({
      error: {
        code: "request_not_allowed",
        requestReference: "REQ-23456789ABCD",
      },
    });
  });

  test("does not resend expired indeterminate state or concurrent same-key work", async () => {
    const expired = makeHarness("indeterminate");
    const submission = validatePublicRfqSubmission(publicSubmission);
    await expired.runtime.resolve(submission);
    const before = expired.repository.inspect();
    expired.setNow("2026-09-12T03:02:00.000Z");
    const reconciliation = await expired.runtime.resolve(submission);
    expect(reconciliation.httpStatus).toBe(409);
    expect(getValidatedRfqBody(reconciliation.document, "public_error")).toMatchObject({
      error: { code: "service_temporarily_unavailable" },
    });
    expect(expired.repository.inspect()).toEqual(before);
    expect(expired.events).toEqual([
      "lookup", "pre_gate", "reserve", "mixed:3", "sink", "transition", "lookup",
    ]);
    expect(expired.sink.callCount).toBe(1);

    const concurrent = makeHarness("accepted");
    const results = await Promise.all([
      concurrent.runtime.resolve(submission),
      concurrent.runtime.resolve(submission),
    ]);
    expect(results.map((result) => result.httpStatus).sort()).toEqual([201, 409]);
    expect(concurrent.events.filter((event) => event.startsWith("mixed"))).toHaveLength(1);
    expect(concurrent.sink.callCount).toBe(1);
    expect(concurrent.repository.inspect()).toHaveLength(1);
  });

  test("normalizes a hostile throwing sink without observing its thrown Proxy", async () => {
    const traps = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostile = new Proxy(Object.create(null), {
      get() {
        traps.get += 1;
        throw new Error("PRIVATE_SINK_GET");
      },
      getPrototypeOf() {
        traps.getPrototypeOf += 1;
        throw new Error("PRIVATE_SINK_PROTO");
      },
      ownKeys() {
        traps.ownKeys += 1;
        throw new Error("PRIVATE_SINK_KEYS");
      },
    });
    class ThrowingSink extends StubRfqSink {
      override async deliver(): Promise<never> {
        throw hostile;
      }
    }
    const harness = makeHarness("accepted", { sink: new ThrowingSink("accepted") });
    const result = await harness.runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    );

    expect(result.httpStatus).toBe(202);
    expect(getValidatedRfqBody(result.document, "public_receipt")).toMatchObject({
      status: "processing",
      retryAfterSeconds: 30,
    });
    expect(traps).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });
    expect(JSON.stringify(result.document)).not.toContain(
      "PRIVATE_SINK",
    );
  });

  test("normalizes a hostile repository transition without observing its thrown Proxy", async () => {
    const traps = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostile = new Proxy(Object.create(null), {
      get() {
        traps.get += 1;
        throw new Error("PRIVATE_TRANSITION_GET");
      },
      getPrototypeOf() {
        traps.getPrototypeOf += 1;
        throw new Error("PRIVATE_TRANSITION_PROTO");
      },
      ownKeys() {
        traps.ownKeys += 1;
        throw new Error("PRIVATE_TRANSITION_KEYS");
      },
    });
    class ThrowingRepository extends StubRfqRepository {
      override async transition(): Promise<never> {
        throw hostile;
      }
    }
    const harness = makeHarness("accepted", {
      repository: new ThrowingRepository(),
    });

    const error = await harness.runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    ).catch((value: unknown) => value);

    expect(error === hostile).toBe(false);
    expect(error).toMatchObject({ category: "intake", kind: "dependency_failed" });
    expect(traps).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });
  });

});
