import { describe, expect, test } from "vitest";

import acceptedReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/accepted-receipt.json";
import processingReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/processing-receipt.json";
import publicError from "../src/lib/rfq-submission-contract/v2/samples/positive/public-error.json";
import {
  RfqPublicResponseError,
  matchesValidatedAcceptedRfqReceipt,
  parsePublicRfqResponse,
} from "../src/lib/rfq/submission/public-response";
import * as publicResponseModule from "../src/lib/rfq/submission/public-response";

const requestReference = "REQ-23456789ABCD";

const statusByCode = {
  invalid_request: 400,
  invalid_submission_intent: 403,
  request_not_allowed: 403,
  challenge_required_or_invalid: 403,
  rate_limited: 429,
  unsupported_media_type: 415,
  payload_too_large: 413,
  basket_too_large_to_submit: 422,
  invalid_customer_fields: 422,
  invalid_line_count: 422,
  invalid_quantity: 422,
  basket_refresh_required: 409,
  product_unavailable: 409,
  configuration_changed: 409,
  idempotency_conflict: 409,
  service_temporarily_unavailable: 503,
} as const;

type ErrorCode = keyof typeof statusByCode;

function errorDocument(code: ErrorCode): Record<string, unknown> {
  const fieldErrors: Partial<Record<ErrorCode, readonly Record<string, string>[]>> = {
    invalid_customer_fields: [{ field: "fullName", code: "required" }],
    invalid_line_count: [{ field: "lineCount", code: "invalid" }],
    invalid_quantity: [{ field: "quantity", code: "invalid", entryId: "26000000-0000-4000-8000-000000000101" }],
    basket_refresh_required: [{ field: "basket", code: "changed" }],
    product_unavailable: [{ field: "selection", code: "unavailable", entryId: "26000000-0000-4000-8000-000000000101" }],
    configuration_changed: [{ field: "packaging", code: "changed", entryId: "26000000-0000-4000-8000-000000000101" }],
  };
  return {
    contractVersion: "2.0.0",
    error: {
      code,
      requestReference,
      messageKey: `rfq.error.${code}`,
      ...(fieldErrors[code] ? { fieldErrors: fieldErrors[code] } : {}),
      ...(code === "rate_limited" ? { retryAfterSeconds: 30 } : {}),
    },
  };
}

function parse(body: unknown, status: number) {
  return parsePublicRfqResponse(status, "application/json", JSON.stringify(body));
}

function expectClosedFailure(action: () => unknown): void {
  let caught: unknown;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RfqPublicResponseError);
  expect(caught).toMatchObject({
    category: "public_response",
    kind: "invalid_response",
  });
  expect(`${String(caught)} ${JSON.stringify(caught)}`).not.toMatch(
    /instancePath|schemaPath|requestReference|REQ-|submittedBasketToken|diagnostic|raw payload|secret/i,
  );
}

describe("TASK-028 closed public RFQ response boundary", () => {
  test("keeps the deep-import runtime surface closed and exports no receipt material accessor", () => {
    expect(Object.keys(publicResponseModule).sort()).toEqual([
      "RfqPublicResponseError",
      "matchesValidatedAcceptedRfqReceipt",
      "parsePublicRfqResponse",
    ]);
    expect(publicResponseModule).not.toHaveProperty("receiptMaterials");
    expect(publicResponseModule).not.toHaveProperty("getReceiptMaterial");
  });

  test("returns immutable customer-safe receipt DTOs without snapshot or token bytes", () => {
    const accepted = parse(acceptedReceipt, 201);
    const replay = parse(acceptedReceipt, 200);
    const processing = parse(processingReceipt, 202);

    expect(accepted).toEqual({
      kind: "receipt",
      status: "accepted",
      publicReference: acceptedReceipt.publicReference,
      lineCount: 3,
    });
    expect(replay).toEqual(accepted);
    expect(processing).toEqual({
      kind: "receipt",
      status: "processing",
      publicReference: processingReceipt.publicReference,
      lineCount: 3,
      retryAfterSeconds: 30,
    });
    for (const result of [accepted, replay, processing]) {
      expect(Object.isFrozen(result)).toBe(true);
      expect(JSON.stringify(result)).not.toMatch(
        /submittedBasketSnapshot|submittedBasketToken|writerId|mutationId|requestReference|GDHEPRD|diagnostic/i,
      );
    }
  });

  test("keeps accepted clear material private and binds it to the validated receipt instance", () => {
    const accepted = parse(acceptedReceipt, 201);
    const processing = parse(processingReceipt, 202);
    const plainVisibleClone = structuredClone(accepted);

    expect(matchesValidatedAcceptedRfqReceipt(
      accepted,
      acceptedReceipt.submittedBasketSnapshot,
      acceptedReceipt.submittedBasketToken,
    )).toBe(true);
    expect(matchesValidatedAcceptedRfqReceipt(
      plainVisibleClone,
      acceptedReceipt.submittedBasketSnapshot,
      acceptedReceipt.submittedBasketToken,
    )).toBe(false);
    expect(matchesValidatedAcceptedRfqReceipt(
      processing,
      processingReceipt.submittedBasketSnapshot,
      processingReceipt.submittedBasketToken,
    )).toBe(false);
    expect(matchesValidatedAcceptedRfqReceipt(
      accepted,
      { ...acceptedReceipt.submittedBasketSnapshot, revision: 8 },
      acceptedReceipt.submittedBasketToken,
    )).toBe(false);
    expect(matchesValidatedAcceptedRfqReceipt(
      accepted,
      acceptedReceipt.submittedBasketSnapshot,
      "0".repeat(64),
    )).toBe(false);
    expect(Object.keys(accepted)).toEqual([
      "kind",
      "status",
      "publicReference",
      "lineCount",
    ]);
    expect(JSON.stringify({ accepted, plainVisibleClone })).not.toMatch(
      /submittedBasketSnapshot|submittedBasketToken|writerId|mutationId/i,
    );
  });

  test("binds every public error code to its exact HTTP status and safe semantic projection", () => {
    for (const [code, status] of Object.entries(statusByCode) as [ErrorCode, number][]) {
      const result = parse(errorDocument(code), status);
      expect(result).toMatchObject({ kind: "error", code });
      expect(Object.isFrozen(result)).toBe(true);
      expect(JSON.stringify(result)).not.toMatch(/REQ-|entryId|GDHEPRD|diagnostic/i);
    }
    expect(parse(publicError, 422)).toEqual({
      kind: "error",
      code: "invalid_quantity",
      fieldErrors: [{ field: "quantity", code: "invalid" }],
    });
  });

  test("rejects status, Schema, semantic, media, body and hostile input drift without leakage", () => {
    const extra = { ...structuredClone(acceptedReceipt), privateDiagnostic: "do-not-leak" };
    const semantic = structuredClone(publicError);
    semantic.error.messageKey = "rfq.error.invalid_request";
    const wrongField = errorDocument("invalid_customer_fields");
    (wrongField.error as Record<string, unknown>).fieldErrors = [
      { field: "quantity", code: "invalid", entryId: "26000000-0000-4000-8000-000000000101" },
    ];
    for (const action of [
      () => parse(acceptedReceipt, 202),
      () => parse(extra, 201),
      () => parse(semantic, 422),
      () => parse(wrongField, 422),
      () => parse({ contractVersion: "2.0.0", error: { code: "unknown" } }, 400),
      () => parsePublicRfqResponse(201, "text/plain", JSON.stringify(acceptedReceipt)),
      () => parsePublicRfqResponse(201, "application/json", "{"),
      () => parsePublicRfqResponse(201, "application/json", " ".repeat(262_145)),
    ]) expectClosedFailure(action);

    let coercions = 0;
    const hostile = new Proxy(Object.create(null), {
      get() {
        coercions += 1;
        throw new Error("private diagnostic");
      },
      getOwnPropertyDescriptor() {
        coercions += 1;
        throw new Error("private diagnostic");
      },
      ownKeys() {
        coercions += 1;
        throw new Error("private diagnostic");
      },
    });
    expectClosedFailure(() => parsePublicRfqResponse(201, "application/json", hostile));
    expect(coercions).toBe(0);
  });
});
