import { describe, expect, test } from "vitest";

import expectedRequest from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-request-ready-mixed.json";
import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import authoritativeDocument from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import type { MixedQuoteLineValidationDto } from "../src/lib/cms/server/article-number-batch";
import {
  getValidatedRfqBody,
  resolveAuthoritativeRfqLines,
  validatePublicRfqSubmission,
  type AuthoritativeRfqDocumentContext,
} from "../src/lib/rfq/server/v2";

const documentContext = {
  rfqId: authoritativeDocument.rfqId,
  publicReference: authoritativeDocument.publicReference,
  receivedAt: authoritativeDocument.receivedAt,
  status: "accepted",
  payloadDigest: authoritativeDocument.payloadDigest,
  idempotency: authoritativeDocument.idempotency,
  sourceSecurity: {
    sourceFingerprint: authoritativeDocument.sourceSecurity.sourceFingerprint,
    contactFingerprint: authoritativeDocument.sourceSecurity.contactFingerprint,
    outcomeCode: "new_intent",
  },
  delivery: {
    state: "accepted",
    attemptCount: 1,
    lastTransitionAt: authoritativeDocument.delivery.lastTransitionAt,
  },
} satisfies AuthoritativeRfqDocumentContext;

function validResponse(): MixedQuoteLineValidationDto {
  return structuredClone(expectedResponse) as MixedQuoteLineValidationDto;
}

type MutableResponse = {
  apiVersion: string;
  schemaVersion: string;
  locale: string;
  type: string;
  lines: Array<Record<string, unknown>>;
};

function responseFor(lines: readonly Record<string, unknown>[]): MixedQuoteLineValidationDto {
  return {
    apiVersion: "1",
    schemaVersion: "1.0.0",
    locale: "en",
    type: "mixed_quote_line_validation",
    lines: lines.map((line) => {
      if (line.lineKind === "catalog_accessory") {
        return {
          entryId: line.entryId,
          lineKind: "catalog_accessory",
          resolution: "resolved_article_number",
          model: "TASK-025 ACCESSORY",
          publicPath: null,
          articleNumber: line.articleNumber,
          quantityUnit: line.quantityUnit,
          quantity: line.quantity,
        };
      }
      const selection = line.selection as Record<string, unknown>;
      const custom = selection.resolution === "sales_follow_up";
      return {
        entryId: line.entryId,
        lineKind: "configured_product",
        resolution: custom ? "sales_follow_up" : "resolved_article_number",
        model: "FGD X15+PVC",
        publicPath: line.canonicalPath,
        articleNumber: custom ? null : selection.articleNumber,
        selection: {
          type: selection.type,
          articleNumber: custom ? null : selection.articleNumber,
          lengthMeters: selection.lengthMeters,
          color: selection.color,
        },
        packaging: line.packaging,
        quantityUnit: line.quantityUnit,
        quantity: line.quantity,
      };
    }),
  };
}

function submissionWithLines(count: 1 | 50): typeof publicSubmission {
  const input = structuredClone(publicSubmission);
  if (count === 1) {
    input.basket.items = [structuredClone(publicSubmission.basket.items[0])];
    return input;
  }
  input.basket.items = Array.from({ length: count }, (_, index) => ({
    entryId: `26000000-0000-4000-8000-${String(index + 300).padStart(12, "0")}`,
    lineKind: "catalog_accessory" as const,
    articleNumber: `GDHEPRD${String(index + 900).padStart(6, "0")}`,
    quantityUnit: "piece" as const,
    quantity: 1,
  }));
  return input;
}

describe("TASK-027 RFQ Intake v2 authoritative projection", () => {
  test("projects the authentic public submission into the exact ordered mixed request", async () => {
    const submission = validatePublicRfqSubmission(publicSubmission);
    let captured: unknown;

    await expect(
      resolveAuthoritativeRfqLines(submission, {
        document: documentContext,
        validateMixedQuoteLines: async (lines) => {
          captured = lines;
          throw new Error("SECRET_DOWNSTREAM_FAILURE");
        },
      }),
    ).rejects.toMatchObject({
      category: "authority",
      kind: "mixed_validation_failed",
    });

    expect(captured).toEqual(expectedRequest.lines);
    expect(Object.isFrozen(captured)).toBe(true);
    expect(Object.isFrozen((captured as readonly unknown[])[0])).toBe(true);
    expect(JSON.stringify(captured)).not.toMatch(
      /Ada Buyer|Example Contracting|submissionIntent|idempotencyKey|writerId|mutationId/,
    );
  });

  test("rejects one incomplete mixed response atomically after exactly one call", async () => {
    const submission = validatePublicRfqSubmission(publicSubmission);
    const response = structuredClone(expectedResponse) as unknown as {
      lines: Array<Record<string, unknown>>;
    };
    response.lines.pop();
    let calls = 0;

    await expect(
      resolveAuthoritativeRfqLines(submission, {
        document: documentContext,
        validateMixedQuoteLines: async () => {
          calls += 1;
          return response as unknown as MixedQuoteLineValidationDto;
        },
      }),
    ).rejects.toMatchObject({
      category: "authority",
      kind: "response_mismatch",
    });
    expect(calls).toBe(1);
  });

  test("returns only an authentic authoritative document matching the frozen mapping", async () => {
    const submission = validatePublicRfqSubmission(publicSubmission);
    const response = validResponse() as MixedQuoteLineValidationDto & {
      lines: Array<Record<string, unknown>>;
    };
    const authoritative = await resolveAuthoritativeRfqLines(submission, {
      document: documentContext,
      validateMixedQuoteLines: async () => response,
    });
    const body = getValidatedRfqBody(
      authoritative,
      "authoritative_document",
    );

    response.lines[0].model = "Caller mutation";

    expect(authoritative.kind).toBe("authoritative_document");
    expect(body).toEqual(authoritativeDocument);
    expect(Object.isFrozen(body)).toBe(true);
    expect(Object.isFrozen((body as typeof authoritativeDocument).lines)).toBe(true);
    expect(Object.keys(authoritative)).toEqual(["kind"]);
    expect(JSON.stringify(authoritative)).toBe('{"kind":"authoritative_document"}');
  });

  test.each([1, 50] as const)(
    "uses one complete mixed call for %i ordered line(s)",
    async (count) => {
      const submission = validatePublicRfqSubmission(submissionWithLines(count));
      let calls = 0;
      let captured: readonly Record<string, unknown>[] = [];
      const authoritative = await resolveAuthoritativeRfqLines(submission, {
        document: documentContext,
        validateMixedQuoteLines: async (lines) => {
          calls += 1;
          captured = lines;
          return responseFor(lines);
        },
      });
      const body = getValidatedRfqBody(
        authoritative,
        "authoritative_document",
      ) as { lines: readonly Record<string, unknown>[] };

      expect(calls).toBe(1);
      expect(captured).toHaveLength(count);
      expect(body.lines).toHaveLength(count);
      expect(body.lines.map((line) => line.entryId)).toEqual(
        captured.map((line) => line.entryId),
      );
    },
  );

  test.each([
    ["count", (value: MutableResponse) => { value.lines.pop(); }],
    ["order", (value: MutableResponse) => { [value.lines[0], value.lines[2]] = [value.lines[2], value.lines[0]]; }],
    ["entryId", (value: MutableResponse) => { value.lines[0].entryId = "26000000-0000-4000-8000-000000000199"; }],
    ["quantity unit", (value: MutableResponse) => { value.lines[0].quantityUnit = "roll"; }],
    ["quantity", (value: MutableResponse) => { value.lines[0].quantity = 9; }],
    ["path", (value: MutableResponse) => { value.lines[0].publicPath = "/products/different/"; }],
    ["selection", (value: MutableResponse) => { (value.lines[0].selection as Record<string, unknown>).lengthMeters = 7; }],
    ["packaging", (value: MutableResponse) => { (value.lines[0].packaging as Record<string, unknown>).logoPrinting = true; }],
    ["resolution", (value: MutableResponse) => {
      value.lines[0].resolution = "sales_follow_up";
      value.lines[0].articleNumber = null;
      const selection = value.lines[0].selection as Record<string, unknown>;
      selection.type = "custom_length";
      selection.articleNumber = null;
    }],
    ["configured root Article Number", (value: MutableResponse) => { value.lines[0].articleNumber = "GDHEPRD000999"; }],
    ["configured nested Article Number", (value: MutableResponse) => { (value.lines[0].selection as Record<string, unknown>).articleNumber = "GDHEPRD000999"; }],
    ["accessory Article Number", (value: MutableResponse) => { value.lines[2].articleNumber = "GDHEPRD000999"; }],
  ] as const)("rejects the complete response on %s mismatch", async (_name, mutate) => {
    const response = structuredClone(expectedResponse) as MutableResponse;
    mutate(response);
    await expect(
      resolveAuthoritativeRfqLines(validatePublicRfqSubmission(publicSubmission), {
        document: documentContext,
        validateMixedQuoteLines: async () => response as MixedQuoteLineValidationDto,
      }),
    ).rejects.toMatchObject({ category: "authority", kind: "response_mismatch" });
  });

  test("rejects forged wrappers and hostile responses without invoking reflection traps", async () => {
    let mixedCalls = 0;
    await expect(
      resolveAuthoritativeRfqLines(
        { kind: "public_submission" } as Parameters<
          typeof resolveAuthoritativeRfqLines
        >[0],
        {
          document: documentContext,
          validateMixedQuoteLines: async () => {
            mixedCalls += 1;
            return validResponse();
          },
        },
      ),
    ).rejects.toMatchObject({ category: "authority", kind: "invalid_submission" });
    expect(mixedCalls).toBe(0);
    expect(() => getValidatedRfqBody(
      authoritativeDocument as unknown as Parameters<typeof getValidatedRfqBody>[0],
      "authoritative_document",
    )).toThrowError(expect.objectContaining({ category: "contract" }));

    const calls = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostile = new Proxy(Object.create(null), {
      get() {
        calls.get += 1;
        throw new Error("SECRET_RESPONSE_GET");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("SECRET_RESPONSE_PROTOTYPE");
      },
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("SECRET_RESPONSE_KEYS");
      },
    });
    const hostileResponse = validResponse() as MixedQuoteLineValidationDto & {
      lines: Array<Record<string, unknown>>;
    };
    hostileResponse.lines[0].selection = hostile;
    await expect(
      resolveAuthoritativeRfqLines(validatePublicRfqSubmission(publicSubmission), {
        document: documentContext,
        validateMixedQuoteLines: async () => hostileResponse,
      }),
    ).rejects.toMatchObject({ category: "authority", kind: "response_mismatch" });
    expect(calls).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });
  });
});
