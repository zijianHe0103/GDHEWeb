import { describe, expect, test } from "vitest";

import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import authoritativeDocument from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import type { MixedQuoteLineValidationDto } from "../src/lib/cms/server/article-number-batch";
import {
  createRfqIntakeRuntime,
  getValidatedRfqBody,
  validatePublicRfqSubmission,
  type RfqIntakeDependencies,
} from "../src/lib/rfq/server/v2";

function testSecret(): Uint8Array {
  return Uint8Array.from(Buffer.from(vectors.algorithm.testSecretKeyHex, "hex"));
}

function baseDependencies(calls: string[]): RfqIntakeDependencies {
  return {
    clock: { now: () => "2026-08-12T03:02:00.000Z" },
    ids: {
      nextRfqId: () => authoritativeDocument.rfqId,
      nextPublicReference: () => authoritativeDocument.publicReference,
    },
    keyMaterial: {
      keyVersion: vectors.algorithm.testKeyVersion,
      secretKey: testSecret(),
    },
    sourceSecurity: {
      sourceFingerprint: authoritativeDocument.sourceSecurity.sourceFingerprint,
      contactFingerprint: authoritativeDocument.sourceSecurity.contactFingerprint,
      outcomeCode: "new_intent",
    },
    repository: {
      async lookup() {
        calls.push("lookup");
        return { kind: "miss" };
      },
      async reserve() {
        calls.push("reserve");
      },
    },
    async preReservationGate() {
      calls.push("pre_gate");
    },
    async validateMixedQuoteLines(lines) {
      calls.push(`mixed:${lines.length}`);
      return structuredClone(expectedResponse) as MixedQuoteLineValidationDto;
    },
  };
}

describe("TASK-027 RFQ Intake v2 reservation and resolution orchestration", () => {
  test("orders one lookup, pre-gate, reservation and complete mixed resolution", async () => {
    const calls: string[] = [];
    let reservation: unknown;
    const runtime = createRfqIntakeRuntime({
      clock: { now: () => "2026-08-12T03:02:00.000Z" },
      ids: {
        nextRfqId: () => authoritativeDocument.rfqId,
        nextPublicReference: () => authoritativeDocument.publicReference,
      },
      keyMaterial: {
        keyVersion: vectors.algorithm.testKeyVersion,
        secretKey: testSecret(),
      },
      sourceSecurity: {
        sourceFingerprint: authoritativeDocument.sourceSecurity.sourceFingerprint,
        contactFingerprint: authoritativeDocument.sourceSecurity.contactFingerprint,
        outcomeCode: "new_intent",
      },
      repository: {
        async lookup() {
          calls.push("lookup");
          return { kind: "miss" } as const;
        },
        async reserve(value) {
          calls.push("reserve");
          reservation = value;
        },
      },
      async preReservationGate() {
        calls.push("pre_gate");
      },
      async validateMixedQuoteLines(lines) {
        calls.push(`mixed:${lines.length}`);
        return structuredClone(expectedResponse) as MixedQuoteLineValidationDto;
      },
    });

    const result = await runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    );
    const body = getValidatedRfqBody(result, "authoritative_document") as
      typeof authoritativeDocument;

    expect(calls).toEqual(["lookup", "pre_gate", "reserve", "mixed:3"]);
    expect(reservation).toMatchObject({
      payloadDigest: {
        keyVersion: vectors.algorithm.testKeyVersion,
        value: vectors.payloadDigestHmacSha256Hex,
      },
      comparisonToken: vectors.comparisonTokenSha256Hex,
      basketSnapshotToken: vectors.submittedBasketTokenSha256Hex,
      createdAt: "2026-08-12T03:02:00.000Z",
      expiresAt: "2026-09-11T03:02:00.000Z",
    });
    expect(body).toMatchObject({
      contractVersion: "2.0.0",
      rfqId: authoritativeDocument.rfqId,
      publicReference: authoritativeDocument.publicReference,
      status: "resolving_lines",
      lines: authoritativeDocument.lines,
      delivery: {
        state: "not_started",
        attemptCount: 0,
        lastTransitionAt: "2026-08-12T03:02:00.000Z",
      },
    });
  });

  test("keeps pre-reservation rejection free of reservation and mixed side effects", async () => {
    const calls: string[] = [];
    const dependencies = baseDependencies(calls);
    const runtime = createRfqIntakeRuntime({
      ...dependencies,
      async preReservationGate() {
        calls.push("pre_gate");
        throw new Error("SECRET_PRE_GATE");
      },
    });

    const error = await runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    ).catch((value: unknown) => value);

    expect(error).toMatchObject({
      category: "intake",
      kind: "pre_reservation_rejected",
    });
    expect(`${String(error)} ${JSON.stringify(error)}`).not.toContain("SECRET_PRE_GATE");
    expect(calls).toEqual(["lookup", "pre_gate"]);
  });

  test("stops an existing or indeterminate repository result before later effects", async () => {
    for (const kind of ["existing", "expired_indeterminate"] as const) {
      const calls: string[] = [];
      const dependencies = baseDependencies(calls);
      const runtime = createRfqIntakeRuntime({
        ...dependencies,
        repository: {
          ...dependencies.repository,
          async lookup() {
            calls.push("lookup");
            return { kind };
          },
        },
      });

      await expect(runtime.resolve(
        validatePublicRfqSubmission(publicSubmission),
      )).rejects.toMatchObject({
        category: "intake",
        kind: "existing_reservation",
      });
      expect(calls).toEqual(["lookup"]);
    }
  });

  test("sanitizes hostile dependency failures and never returns a partial document", async () => {
    const calls = {
      descriptor: 0,
      get: 0,
      getPrototypeOf: 0,
      has: 0,
      ownKeys: 0,
      toPrimitive: 0,
    };
    const target = Object.create(null) as Record<PropertyKey, unknown>;
    Object.defineProperty(target, Symbol.toPrimitive, {
      value() {
        calls.toPrimitive += 1;
        throw new Error("PRIVATE_TASK027_PROXY_COERCION");
      },
    });
    const hostile = new Proxy(target, {
      get() {
        calls.get += 1;
        throw new Error("PRIVATE_TASK027_PROXY_GET");
      },
      getOwnPropertyDescriptor() {
        calls.descriptor += 1;
        throw new Error("PRIVATE_TASK027_PROXY_DESCRIPTOR");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("PRIVATE_TASK027_PROXY_DIAGNOSTIC");
      },
      has() {
        calls.has += 1;
        throw new Error("PRIVATE_TASK027_PROXY_HAS");
      },
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("PRIVATE_TASK027_PROXY_KEYS");
      },
    });
    const events: string[] = [];
    const dependencies = baseDependencies(events);
    const runtime = createRfqIntakeRuntime({
      ...dependencies,
      repository: {
        ...dependencies.repository,
        async lookup() {
          events.push("lookup");
          throw hostile;
        },
      },
    });

    const error = await runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    ).catch((value: unknown) => value);

    expect(error).toMatchObject({ category: "intake", kind: "dependency_failed" });
    expect(`${String(error)} ${JSON.stringify(error)}`).not.toContain(
      "PRIVATE_TASK027_PROXY",
    );
    expect(events).toEqual(["lookup"]);
    expect(calls).toEqual({
      descriptor: 0,
      get: 0,
      getPrototypeOf: 0,
      has: 0,
      ownKeys: 0,
      toPrimitive: 0,
    });
  });

  test("normalizes an unrepresentable fixed expiry before business side effects", async () => {
    const calls: string[] = [];
    const dependencies = baseDependencies(calls);
    const runtime = createRfqIntakeRuntime({
      ...dependencies,
      clock: { now: () => "+275760-09-12T00:00:00.000Z" },
    });

    const error = await runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    ).catch((value: unknown) => value);

    expect(error).toMatchObject({ category: "intake", kind: "dependency_failed" });
    expect(`${String(error)} ${JSON.stringify(error)}`).not.toContain(
      "Invalid time value",
    );
    expect(calls).toEqual([]);
  });

  test("rejects invalid injected identity before reservation or mixed resolution", async () => {
    const calls: string[] = [];
    const dependencies = baseDependencies(calls);
    const runtime = createRfqIntakeRuntime({
      ...dependencies,
      ids: {
        ...dependencies.ids,
        nextRfqId: () => "SECRET_INVALID_RFQ_ID",
      },
    });

    await expect(runtime.resolve(
      validatePublicRfqSubmission(publicSubmission),
    )).rejects.toMatchObject({ category: "intake", kind: "dependency_failed" });
    expect(calls).toEqual(["lookup", "pre_gate"]);
  });
});
