import { describe, expect, test } from "vitest";

import acceptedReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/accepted-receipt.json";
import processingReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/processing-receipt.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import {
  StubRfqRepository,
  validatePublicRfqReceipt,
} from "../src/lib/rfq/server/v2";

const KEY_FINGERPRINT = "a".repeat(64);

describe("TASK-027 process-local Stub RFQ repository", () => {
  test("implements the five frozen replay decisions without extending expiry", async () => {
    const repository = new StubRfqRepository();
    const receipt = validatePublicRfqReceipt(acceptedReceipt);

    expect(await repository.lookup({
      keyFingerprint: KEY_FINGERPRINT,
      comparisonToken: vectors.comparisonTokenSha256Hex,
      payloadDigest: vectors.payloadDigestHmacSha256Hex,
      now: "2026-08-12T03:02:00.000Z",
    })).toEqual({ kind: "miss" });

    expect(await repository.reserve({
      keyFingerprint: KEY_FINGERPRINT,
      payloadDigest: {
        keyVersion: vectors.algorithm.testKeyVersion,
        value: vectors.payloadDigestHmacSha256Hex,
      },
      comparisonToken: vectors.comparisonTokenSha256Hex,
      basketSnapshotToken: vectors.submittedBasketTokenSha256Hex,
      rfqId: "27000000-0000-4000-8000-000000000001",
      publicReference: acceptedReceipt.publicReference,
      createdAt: "2026-08-12T03:02:00.000Z",
      expiresAt: "2026-09-11T03:02:00.000Z",
    })).toBe(true);
    await repository.transition({
      keyFingerprint: KEY_FINGERPRINT,
      state: "accepted",
      httpStatus: 201,
      document: receipt,
    });

    const replay = await repository.lookup({
      keyFingerprint: KEY_FINGERPRINT,
      comparisonToken: vectors.comparisonTokenSha256Hex,
      payloadDigest: vectors.payloadDigestHmacSha256Hex,
      now: "2026-08-13T03:02:00.000Z",
    });
    expect(replay).toMatchObject({ kind: "replay", httpStatus: 200 });
    expect(replay).toHaveProperty("document", receipt);

    expect(await repository.lookup({
      keyFingerprint: KEY_FINGERPRINT,
      comparisonToken: "f".repeat(64),
      payloadDigest: "f".repeat(64),
      now: "2026-08-13T03:02:00.000Z",
    })).toEqual({ kind: "conflict" });

    expect(repository.inspect()).toEqual([{
      keyFingerprint: KEY_FINGERPRINT,
      status: "accepted",
      createdAt: "2026-08-12T03:02:00.000Z",
      expiresAt: "2026-09-11T03:02:00.000Z",
    }]);
    const retained = JSON.stringify(repository.inspect());
    for (const forbidden of [
      "Ada Buyer",
      "GDHEPRD",
      "Example Contracting",
      vectors.algorithm.testSecretKeyHex,
      vectors.comparisonTokenSha256Hex,
      vectors.payloadDigestHmacSha256Hex,
    ]) {
      expect(retained).not.toContain(forbidden);
    }
  });

  test("preserves an expired indeterminate record for controlled reconciliation", async () => {
    const repository = new StubRfqRepository();
    await repository.reserve({
      keyFingerprint: KEY_FINGERPRINT,
      payloadDigest: {
        keyVersion: vectors.algorithm.testKeyVersion,
        value: vectors.payloadDigestHmacSha256Hex,
      },
      comparisonToken: vectors.comparisonTokenSha256Hex,
      basketSnapshotToken: vectors.submittedBasketTokenSha256Hex,
      rfqId: "27000000-0000-4000-8000-000000000001",
      publicReference: acceptedReceipt.publicReference,
      createdAt: "2026-07-01T03:02:00.000Z",
      expiresAt: "2026-07-31T03:02:00.000Z",
    });
    await repository.transition({
      keyFingerprint: KEY_FINGERPRINT,
      state: "delivery_indeterminate",
      httpStatus: 202,
      document: validatePublicRfqReceipt(processingReceipt),
    });
    const before = repository.inspect();

    expect(await repository.lookup({
      keyFingerprint: KEY_FINGERPRINT,
      comparisonToken: vectors.comparisonTokenSha256Hex,
      payloadDigest: vectors.payloadDigestHmacSha256Hex,
      now: "2026-08-12T03:02:00.000Z",
    })).toEqual({ kind: "expired_indeterminate" });
    expect(repository.inspect()).toEqual(before);
  });
});
