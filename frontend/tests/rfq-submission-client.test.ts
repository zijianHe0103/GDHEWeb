import { afterEach, describe, expect, test, vi } from "vitest";

import readyBasket from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json";
import acceptedReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/accepted-receipt.json";
import processingReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/processing-receipt.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import { QUOTE_BASKET_STORAGE_KEY } from "../src/lib/quote-basket/storage";
import { createRfqSubmissionOperation } from "../src/lib/rfq/submission/client";

const intent = {
  contractVersion: "2.0.0",
  submissionIntent: "a".repeat(64),
  idempotencyKey: "28000000-0000-4000-8000-000000000099",
  privacyNotice: {
    version: "rfq-privacy-en-2026-08",
    presentedAt: "2026-08-12T08:45:00.000Z",
  },
  expiresAt: "2026-08-12T09:15:00.000Z",
} as const;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function publicError(
  code: string,
  fieldErrors?: readonly Record<string, string>[],
  retryAfterSeconds?: number,
): Record<string, unknown> {
  return {
    contractVersion: "2.0.0",
    error: {
      code,
      requestReference: "REQ-23456789ABCD",
      messageKey: `rfq.error.${code}`,
      ...(fieldErrors ? { fieldErrors } : {}),
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    },
  };
}

describe("TASK-028 one-operation client submission", () => {
  test("uses one intent then one intake request and clears only through the accepted callback", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const source = structuredClone(readyBasket);
    const before = structuredClone(source);
    const request = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockResolvedValueOnce(jsonResponse(acceptedReceipt, 201));
    const clearAcceptedReceipt = vi.fn().mockResolvedValue(true);

    const result = await createRfqSubmissionOperation({ clearAcceptedReceipt }).submit({
      basket: source,
      customer: structuredClone(publicSubmission.customer),
    });

    expect(result).toEqual({
      kind: "accepted_cleared",
      publicReference: acceptedReceipt.publicReference,
      basketRetained: false,
    });
    expect(clearAcceptedReceipt).toHaveBeenCalledOnce();
    expect(clearAcceptedReceipt.mock.calls[0]![1]).toEqual(
      publicSubmission.basket.sourceBasket,
    );
    expect(source).toEqual(before);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls.map(([path]) => path)).toEqual([
      "/api/rfq/intent",
      "/api/rfq/intake",
    ]);
    for (const [, init] of request.mock.calls) {
      expect(init).toMatchObject({
        method: "POST",
        cache: "no-store",
        redirect: "error",
        headers: { "content-type": "application/json" },
      });
      expect(init).not.toHaveProperty("mode");
    }
    expect(JSON.parse(String(request.mock.calls[0]![1]!.body))).toEqual(
      publicSubmission.basket.sourceBasket,
    );
    expect(JSON.parse(String(request.mock.calls[1]![1]!.body))).toEqual({
      ...publicSubmission,
      submissionIntent: intent.submissionIntent,
      idempotencyKey: intent.idempotencyKey,
      privacyNotice: intent.privacyNotice,
    });
    expect(JSON.stringify(result)).not.toMatch(
      /submissionIntent|idempotencyKey|submittedBasketToken|GDHEPRD|writerId|mutationId|diagnostic/i,
    );
  });

  test("reports an accepted changed-Basket result when the exact clear callback declines", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockResolvedValueOnce(jsonResponse(acceptedReceipt, 201));
    const clearAcceptedReceipt = vi.fn().mockResolvedValue(false);

    await expect(createRfqSubmissionOperation({ clearAcceptedReceipt }).submit({
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    })).resolves.toEqual({
      kind: "accepted_basket_changed",
      publicReference: acceptedReceipt.publicReference,
      basketRetained: true,
    });
    expect(clearAcceptedReceipt).toHaveBeenCalledOnce();
  });

  test("retains the entire current Basket when storage mutates during the intake request", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const current = { ...structuredClone(readyBasket), revision: 8 };
    const currentRaw = JSON.stringify(current);
    const storage = {
      raw: JSON.stringify(readyBasket),
      getItem(key: string) {
        return key === QUOTE_BASKET_STORAGE_KEY ? this.raw : null;
      },
      setItem(key: string, value: string) {
        if (key === QUOTE_BASKET_STORAGE_KEY) this.raw = value;
      },
      removeItem: vi.fn(function removeItem(this: { raw: string }, key: string) {
        if (key === QUOTE_BASKET_STORAGE_KEY) this.raw = "";
      }),
    };
    const basketAdapter = createBrowserQuoteBasketAdapter({
      storage,
      now: () => new Date("2026-08-12T08:46:00.000Z"),
    });
    let resolveIntake!: (response: Response) => void;
    const intakePending = new Promise<Response>((resolve) => {
      resolveIntake = resolve;
    });
    const request = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockReturnValueOnce(intakePending);
    const operation = createRfqSubmissionOperation({
      clearAcceptedReceipt: basketAdapter.clearAcceptedReceipt,
    });

    const submitted = operation.submit({
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    });
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    storage.raw = currentRaw;
    resolveIntake(jsonResponse(acceptedReceipt, 201));

    await expect(submitted).resolves.toEqual({
      kind: "accepted_basket_changed",
      publicReference: acceptedReceipt.publicReference,
      basketRetained: true,
    });
    expect(storage.raw).toBe(currentRaw);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  test("suppresses a repeated submit while the first operation is pending", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    let releaseIntent!: (response: Response) => void;
    const pendingIntent = new Promise<Response>((resolve) => {
      releaseIntent = resolve;
    });
    const request = vi.spyOn(globalThis, "fetch")
      .mockReturnValueOnce(pendingIntent)
      .mockResolvedValueOnce(jsonResponse(acceptedReceipt, 201));
    const operation = createRfqSubmissionOperation();
    const input = {
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    };

    const first = operation.submit(input);
    const second = await operation.submit(input);
    expect(second).toEqual({ kind: "pending", basketRetained: true });
    expect(request).toHaveBeenCalledTimes(1);

    releaseIntent(jsonResponse(intent, 200));
    await expect(first).resolves.toMatchObject({
      kind: "accepted_basket_changed",
      basketRetained: true,
    });
    expect(request).toHaveBeenCalledTimes(2);
  });

  test("returns local and server field errors without issuing duplicate or external requests", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const request = vi.spyOn(globalThis, "fetch");
    const operation = createRfqSubmissionOperation();
    await expect(operation.submit({
      basket: structuredClone(readyBasket),
      customer: { ...structuredClone(publicSubmission.customer), fullName: "" },
    })).resolves.toMatchObject({
      kind: "invalid_fields",
      errors: [{ field: "fullName", code: "required" }],
      basketRetained: true,
    });
    expect(request).not.toHaveBeenCalled();

    request
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockResolvedValueOnce(jsonResponse(publicError(
        "invalid_customer_fields",
        [{ field: "businessEmail", code: "invalid" }],
      ), 422));
    await expect(operation.submit({
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    })).resolves.toEqual({
      kind: "invalid_fields",
      errors: [{ field: "businessEmail", code: "invalid" }],
      basketRetained: true,
    });
    expect(request.mock.calls.map(([path]) => path)).toEqual([
      "/api/rfq/intent",
      "/api/rfq/intake",
    ]);
  });

  test.each([
    [processingReceipt, 202, "processing"],
    [publicError("basket_refresh_required", [{ field: "basket", code: "changed" }]), 409, "basket_refresh_required"],
    [publicError("idempotency_conflict"), 409, "conflict"],
    [publicError("invalid_submission_intent"), 403, "rate_or_security"],
    [publicError("rate_limited", undefined, 30), 429, "rate_or_security"],
    [publicError("service_temporarily_unavailable"), 503, "temporary_unavailable"],
  ])("maps a closed %s response to %s while retaining the Basket", async (body, status, kind) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const source = structuredClone(readyBasket);
    const before = structuredClone(source);
    const removeItem = vi.fn();
    vi.stubGlobal("localStorage", { removeItem });
    const request = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockResolvedValueOnce(jsonResponse(body, status));

    const result = await createRfqSubmissionOperation().submit({
      basket: source,
      customer: structuredClone(publicSubmission.customer),
    });

    expect(result).toMatchObject({ kind, basketRetained: true });
    expect(source).toEqual(before);
    expect(removeItem).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls.every(([path]) =>
      path === "/api/rfq/intent" || path === "/api/rfq/intake"
    )).toBe(true);
  });

  test("fails malformed intent, public response and network results closed without clearing", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const removeItem = vi.fn();
    vi.stubGlobal("localStorage", { removeItem });
    const input = {
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    };
    const cases: (() => void)[] = [
      () => vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("private network detail")),
      () => vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("{", {
        status: 200,
        headers: { "content-type": "application/json" },
      })),
      () => vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(jsonResponse(intent, 200))
        .mockResolvedValueOnce(new Response("private raw body", {
          status: 503,
          headers: { "content-type": "text/plain" },
        })),
      () => vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(jsonResponse(intent, 200))
        .mockResolvedValueOnce(jsonResponse({ ...acceptedReceipt, diagnostic: "private" }, 201)),
    ];
    for (const setup of cases) {
      vi.restoreAllMocks();
      setup();
      const result = await createRfqSubmissionOperation().submit(input);
      expect(result).toEqual({ kind: "temporary_unavailable", basketRetained: true });
      expect(JSON.stringify(result)).not.toMatch(/private|diagnostic|raw|token|GDHEPRD/i);
    }
    expect(removeItem).not.toHaveBeenCalled();
  });

  test("reuses the byte-identical live draft for an explicit unchanged retry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const request = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockRejectedValueOnce(new TypeError("uncertain intake result"))
      .mockResolvedValueOnce(jsonResponse(processingReceipt, 202));
    const operation = createRfqSubmissionOperation();
    const input = {
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    };

    await expect(operation.submit(input)).resolves.toEqual({
      kind: "temporary_unavailable",
      basketRetained: true,
    });
    await expect(operation.submit(structuredClone(input))).resolves.toMatchObject({
      kind: "processing",
      basketRetained: true,
    });

    expect(request.mock.calls.map(([path]) => path)).toEqual([
      "/api/rfq/intent",
      "/api/rfq/intake",
      "/api/rfq/intake",
    ]);
    expect(request.mock.calls[2]![1]!.body).toBe(request.mock.calls[1]![1]!.body);
    expect(String(request.mock.calls[2]![1]!.body)).toContain(intent.idempotencyKey);
  });

  test("invalidates the live attempt after customer, Basket, expiry, security, conflict or accepted terminal change", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const baseInput = {
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    };

    for (const changedInput of [
      { ...structuredClone(baseInput), customer: { ...structuredClone(baseInput.customer), city: "Portland" } },
      { ...structuredClone(baseInput), basket: { ...structuredClone(baseInput.basket), revision: 8 } },
    ]) {
      const request = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(jsonResponse(intent, 200))
        .mockRejectedValueOnce(new TypeError("uncertain intake result"))
        .mockResolvedValueOnce(jsonResponse(intent, 200))
        .mockResolvedValueOnce(jsonResponse(processingReceipt, 202));
      const operation = createRfqSubmissionOperation();
      await operation.submit(structuredClone(baseInput));
      await operation.submit(changedInput);
      expect(request.mock.calls.map(([path]) => path)).toEqual([
        "/api/rfq/intent",
        "/api/rfq/intake",
        "/api/rfq/intent",
        "/api/rfq/intake",
      ]);
      vi.restoreAllMocks();
    }

    const laterIntent = {
      ...intent,
      idempotencyKey: "28000000-0000-4000-8000-000000000100",
      privacyNotice: { ...intent.privacyNotice, presentedAt: "2026-08-12T09:16:00.000Z" },
      expiresAt: "2026-08-12T09:46:00.000Z",
    };
    const expiryRequest = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockRejectedValueOnce(new TypeError("uncertain intake result"))
      .mockResolvedValueOnce(jsonResponse(laterIntent, 200))
      .mockResolvedValueOnce(jsonResponse(processingReceipt, 202));
    const expiryOperation = createRfqSubmissionOperation();
    await expiryOperation.submit(structuredClone(baseInput));
    vi.setSystemTime(new Date("2026-08-12T09:16:00.000Z"));
    await expiryOperation.submit(structuredClone(baseInput));
    expect(expiryRequest.mock.calls.map(([path]) => path)).toEqual([
      "/api/rfq/intent",
      "/api/rfq/intake",
      "/api/rfq/intent",
      "/api/rfq/intake",
    ]);
    vi.restoreAllMocks();

    for (const [body, status] of [
      [publicError("invalid_submission_intent"), 403],
      [publicError("request_not_allowed"), 403],
      [publicError("challenge_required_or_invalid"), 403],
      [publicError("idempotency_conflict"), 409],
      [acceptedReceipt, 201],
    ] as const) {
      vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
      const request = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(jsonResponse(intent, 200))
        .mockResolvedValueOnce(jsonResponse(body, status))
        .mockResolvedValueOnce(jsonResponse(intent, 200))
        .mockResolvedValueOnce(jsonResponse(processingReceipt, 202));
      const operation = createRfqSubmissionOperation({
        clearAcceptedReceipt: vi.fn().mockResolvedValue(false),
      });
      await operation.submit(structuredClone(baseInput));
      await operation.submit(structuredClone(baseInput));
      expect(request.mock.calls.map(([path]) => path)).toEqual([
        "/api/rfq/intent",
        "/api/rfq/intake",
        "/api/rfq/intent",
        "/api/rfq/intake",
      ]);
      vi.restoreAllMocks();
    }
  });

  test.each([
    [processingReceipt, 202],
    [publicError("rate_limited", undefined, 30), 429],
    [publicError("service_temporarily_unavailable"), 503],
  ])("retains one still-live attempt after bounded retryable response %#", async (body, status) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T08:46:00.000Z"));
    const request = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(intent, 200))
      .mockResolvedValueOnce(jsonResponse(body, status))
      .mockResolvedValueOnce(jsonResponse(processingReceipt, 202));
    const operation = createRfqSubmissionOperation();
    const input = {
      basket: structuredClone(readyBasket),
      customer: structuredClone(publicSubmission.customer),
    };

    await operation.submit(structuredClone(input));
    await operation.submit(structuredClone(input));

    expect(request.mock.calls.map(([path]) => path)).toEqual([
      "/api/rfq/intent",
      "/api/rfq/intake",
      "/api/rfq/intake",
    ]);
    expect(request.mock.calls[2]![1]!.body).toBe(request.mock.calls[1]![1]!.body);
  });
});
