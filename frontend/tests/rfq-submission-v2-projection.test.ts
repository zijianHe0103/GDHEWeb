import { describe, expect, test, vi } from "vitest";

import readyBasket from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json";
import requiresReadd from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/requires-readd.json";
import requiresValidation from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/requires-validation.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import {
  RfqSubmissionError,
  projectQuoteBasketV3ToPublicRfqBasket,
} from "../src/lib/rfq/submission";

function expectProjectionFailure(input: unknown): void {
  let caught: unknown;
  try {
    projectQuoteBasketV3ToPublicRfqBasket(input);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RfqSubmissionError);
  expect(caught).toMatchObject({ category: "submission", kind: "invalid_basket" });
  expect(`${String(caught)} ${JSON.stringify(caught)}`).not.toMatch(
    /diagnostic|instancePath|schemaPath|raw|Article Number/i,
  );
}

function basketWithCount(count: number): Record<string, unknown> {
  const source = structuredClone(readyBasket);
  const template = source.items[0]!;
  return {
    ...source,
    items: Array.from({ length: count }, (_value, index) => ({
      ...structuredClone(template),
      entryId: `28000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      selection: {
        ...template.selection,
        lengthMeters: index + 1,
      },
    })),
  };
}

describe("TASK-028 Quote Basket 3.0 public RFQ projection", () => {
  test("projects standard, custom and accessory lines exactly in source order", () => {
    const source = structuredClone(readyBasket);
    const before = structuredClone(source);
    const fetch = vi.spyOn(globalThis, "fetch");
    try {
      const projected = projectQuoteBasketV3ToPublicRfqBasket(source);

      expect(projected).toEqual(publicSubmission.basket);
      expect(source).toEqual(before);
      expect(fetch).not.toHaveBeenCalled();
      expect(Object.isFrozen(projected)).toBe(true);
      expect(Object.isFrozen(projected.sourceBasket)).toBe(true);
      expect(Object.isFrozen(projected.items)).toBe(true);
      for (const item of projected.items) expect(Object.isFrozen(item)).toBe(true);
      expect(JSON.stringify(projected)).not.toMatch(
        /TEST_CANDIDATE|test-candidates|createdAt|catalogPath|"state"|"model"|"name"|"image"|wordpress|scf|feishu/i,
      );
    } finally {
      fetch.mockRestore();
    }
  });

  test("preserves legal 1 and 50 line order without truncation", () => {
    for (const count of [1, 50]) {
      const projected = projectQuoteBasketV3ToPublicRfqBasket(basketWithCount(count));
      expect(projected.items).toHaveLength(count);
      expect(projected.items.map((item) => item.entryId)).toEqual(
        Array.from({ length: count }, (_value, index) =>
          `28000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`),
      );
      expect(new TextEncoder().encode(JSON.stringify(projected)).byteLength).toBeLessThanOrEqual(
        163_840,
      );
    }
  });

  test("rejects empty, blocked, oversized and invalid-identity Baskets atomically", () => {
    expectProjectionFailure({ ...structuredClone(readyBasket), items: [] });
    expectProjectionFailure(structuredClone(requiresValidation));
    expectProjectionFailure(structuredClone(requiresReadd));
    expectProjectionFailure(basketWithCount(51));

    const invalidIdentity = structuredClone(readyBasket);
    invalidIdentity.items[0]!.entryId = "not-a-public-uuid";
    expectProjectionFailure(invalidIdentity);

    const duplicate = structuredClone(readyBasket);
    duplicate.items = [duplicate.items[0]!, {
      ...structuredClone(duplicate.items[0]!),
      entryId: "28000000-0000-4000-8000-000000000099",
    }];
    expectProjectionFailure(duplicate);
  });
});
