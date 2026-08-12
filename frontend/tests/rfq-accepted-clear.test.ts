import { describe, expect, test, vi } from "vitest";

import readyBasket from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json";
import acceptedReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/accepted-receipt.json";
import processingReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/processing-receipt.json";
import { createBrowserQuoteBasketAdapter } from "../src/lib/quote-basket/browser";
import {
  QUOTE_BASKET_STORAGE_KEY,
  type QuoteBasketStorage,
} from "../src/lib/quote-basket/storage";
import { parsePublicRfqResponse } from "../src/lib/rfq/submission/public-response";

class MemoryStorage implements QuoteBasketStorage {
  raw: string | null;
  readonly removeItem = vi.fn((key: string) => {
    if (key === QUOTE_BASKET_STORAGE_KEY) this.raw = null;
  });

  constructor(raw: string | null) {
    this.raw = raw;
  }

  getItem(key: string): string | null {
    return key === QUOTE_BASKET_STORAGE_KEY ? this.raw : null;
  }

  setItem(key: string, value: string): void {
    if (key === QUOTE_BASKET_STORAGE_KEY) this.raw = value;
  }
}

function parseReceipt(body: unknown, status: number) {
  return parsePublicRfqResponse(status, "application/json", JSON.stringify(body));
}

function adapter(storage: QuoteBasketStorage, now = "2026-08-12T08:46:00.000Z") {
  return createBrowserQuoteBasketAdapter({
    storage,
    now: () => new Date(now),
    uuid: () => "28000000-0000-4000-8000-000000000099",
  });
}

describe("TASK-028 exact accepted Basket compare-and-clear", () => {
  test("removes the one storage key only for an authentic exact accepted receipt", async () => {
    const storage = new MemoryStorage(JSON.stringify(readyBasket));
    const receipt = parseReceipt(acceptedReceipt, 201);

    await expect(adapter(storage).clearAcceptedReceipt(
      receipt,
      structuredClone(acceptedReceipt.submittedBasketSnapshot),
    )).resolves.toBe(true);

    expect(storage.raw).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledOnce();
    expect(storage.removeItem).toHaveBeenCalledWith(QUOTE_BASKET_STORAGE_KEY);
  });

  test("retains every byte for six-field, token, authenticity and receipt-status mismatch", async () => {
    const exactRaw = JSON.stringify(readyBasket);
    const accepted = parseReceipt(acceptedReceipt, 201);
    const processing = parseReceipt(processingReceipt, 202);
    const badToken = parseReceipt({
      ...structuredClone(acceptedReceipt),
      submittedBasketToken: "0".repeat(64),
    }, 201);
    const plainVisibleReceipt = structuredClone(accepted);
    const fields = [
      ["schemaVersion", "2.0.0"],
      ["revision", 8],
      ["writerId", "28000000-0000-4000-8000-000000000001"],
      ["mutationId", "28000000-0000-4000-8000-000000000002"],
      ["updatedAt", "2026-08-12T03:00:01.000Z"],
      ["expiresAt", "2026-09-11T03:00:01.000Z"],
    ] as const;
    const cases: readonly (readonly [unknown, unknown])[] = [
      ...fields.map(([field, value]) => [
        accepted,
        { ...structuredClone(acceptedReceipt.submittedBasketSnapshot), [field]: value },
      ] as const),
      [badToken, structuredClone(acceptedReceipt.submittedBasketSnapshot)],
      [processing, structuredClone(acceptedReceipt.submittedBasketSnapshot)],
      [plainVisibleReceipt, structuredClone(acceptedReceipt.submittedBasketSnapshot)],
    ];

    for (const [receipt, submittedSnapshot] of cases) {
      const storage = new MemoryStorage(exactRaw);
      await expect(adapter(storage).clearAcceptedReceipt(
        receipt,
        submittedSnapshot,
      )).resolves.toBe(false);
      expect(storage.raw).toBe(exactRaw);
      expect(storage.removeItem).not.toHaveBeenCalled();
    }
  });

  test("retains malformed, expired, changed and throwing storage without partial deletion", async () => {
    const accepted = parseReceipt(acceptedReceipt, 201);
    const source = structuredClone(acceptedReceipt.submittedBasketSnapshot);
    const changedRaw = JSON.stringify({ ...structuredClone(readyBasket), revision: 8 });
    const rawCases: readonly [string | null, string][] = [
      [null, "2026-08-12T08:46:00.000Z"],
      ["{", "2026-08-12T08:46:00.000Z"],
      [changedRaw, "2026-08-12T08:46:00.000Z"],
      [JSON.stringify(readyBasket), "2026-09-12T08:46:00.000Z"],
    ];
    for (const [raw, now] of rawCases) {
      const storage = new MemoryStorage(raw);
      await expect(adapter(storage, now).clearAcceptedReceipt(accepted, source))
        .resolves.toBe(false);
      expect(storage.raw).toBe(raw);
      expect(storage.removeItem).not.toHaveBeenCalled();
    }

    const getFailure: QuoteBasketStorage = {
      getItem() {
        throw new Error("private storage read");
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    await expect(adapter(getFailure).clearAcceptedReceipt(accepted, source))
      .resolves.toBe(false);
    expect(getFailure.removeItem).not.toHaveBeenCalled();

    const removeFailure = new MemoryStorage(JSON.stringify(readyBasket));
    removeFailure.removeItem.mockImplementationOnce(() => {
      throw new Error("private storage remove");
    });
    await expect(adapter(removeFailure).clearAcceptedReceipt(accepted, source))
      .resolves.toBe(false);
    expect(removeFailure.raw).toBe(JSON.stringify(readyBasket));
  });
});
