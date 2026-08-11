import { describe, expect, test } from "vitest";

import mixedV2 from "../../../frontend/src/lib/quote-basket-contract/v2/samples/success/mixed.json";
import mixedV3 from "../../../frontend/src/lib/quote-basket-contract/v3/samples/success/mixed.json";
import {
  QuoteBasketV3DomainError,
  cloneAndValidateQuoteBasketV3,
  parseQuoteBasketV3,
} from "../../../frontend/src/lib/quote-basket/v3";
import * as batchModule from "../../../frontend/src/lib/quote-basket/v3/batch";

describe("TASK-025 finding-closure independent probe", () => {
  test("keeps the plain response application helper unreachable", () => {
    expect(Object.keys(batchModule).sort()).toEqual([
      "QuoteBasketV3BatchError",
      "projectQuoteBasketV3ForValidation",
      "validateQuoteBasketV3",
    ]);
  });

  test("canonicalizes every v3 UUID without changing customer fields", () => {
    const source = structuredClone(mixedV3);
    source.writerId = "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA";
    source.mutationId = "BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB";
    source.items[0]!.entryId = "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF";
    source.items[1]!.entryId = "CDEFABCD-EFAB-4CDE-9ABC-CDEFABCDEFAB";
    source.items[2]!.entryId = "DEFABCDE-FABC-4DEF-AABC-DEFABCDEFABC";
    const normalized = cloneAndValidateQuoteBasketV3(source);

    expect(normalized.writerId).toBe(source.writerId.toLowerCase());
    expect(normalized.mutationId).toBe(source.mutationId.toLowerCase());
    expect(normalized.items.map((item) => item.entryId)).toEqual(
      source.items.map((item) => item.entryId.toLowerCase()),
    );
    expect(normalized.items.map(({ entryId: _entryId, ...item }) => item)).toEqual(
      source.items.map(({ entryId: _entryId, ...item }) => item),
    );
  });

  test("rejects a case-fold identity collision before either entry survives", () => {
    const collision = {
      ...structuredClone(mixedV3),
      items: [
        {
          ...structuredClone(mixedV3.items[0]!),
          entryId: "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF",
        },
        {
          ...structuredClone(mixedV3.items[2]!),
          entryId: "abcdefab-cdef-4abc-8abc-abcdefabcdef",
        },
      ],
    };

    expect(() => cloneAndValidateQuoteBasketV3(collision)).toThrow(
      QuoteBasketV3DomainError,
    );
  });

  test("projects a lowercase legacy identity without mutating frozen v2 input", () => {
    const source = structuredClone(mixedV2);
    source.items[0]!.entryId = "ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF";
    const original = JSON.stringify(source);
    const migrated = parseQuoteBasketV3(
      JSON.stringify(source),
      new Date("2026-08-12T00:00:00.000Z"),
    );

    expect(batchModule.projectQuoteBasketV3ForValidation(migrated)[0]?.entryId)
      .toBe("abcdefab-cdef-4abc-8abc-abcdefabcdef");
    expect(JSON.stringify(source)).toBe(original);
  });
});
