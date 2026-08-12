import { describe, expect, test } from "vitest";

import authoritativeDocument from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import {
  StubRfqSink,
  validateAuthoritativeRfqDocument,
} from "../src/lib/rfq/server/v2";

function pendingDocument() {
  const document = structuredClone(authoritativeDocument);
  document.status = "delivery_pending";
  document.delivery = {
    state: "pending",
    attemptCount: 1,
    lastTransitionAt: authoritativeDocument.receivedAt,
  };
  return validateAuthoritativeRfqDocument(document, document.payloadDigest);
}

describe("TASK-027 isolated Stub RFQ sink", () => {
  test("accepts only an authentic pending document and retains no document", async () => {
    const sink = new StubRfqSink("accepted");

    await expect(sink.deliver(authoritativeDocument as never)).rejects.toMatchObject({
      category: "intake",
      kind: "dependency_failed",
    });
    expect(sink.callCount).toBe(0);

    await expect(sink.deliver(pendingDocument())).resolves.toEqual({
      kind: "accepted",
    });
    expect(sink.callCount).toBe(1);
    expect(Object.keys(sink)).not.toContain("document");
    expect(JSON.stringify(sink)).not.toContain("Ada Buyer");
  });
});
