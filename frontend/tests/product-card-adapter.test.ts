import { describe, expect, test } from "vitest";

import allCards from "../src/lib/cms/product-card-contract/samples/success/all.json";
import emptyCards from "../src/lib/cms/product-card-contract/samples/success/filtered-empty.json";
import oneCard from "../src/lib/cms/product-card-contract/samples/success/one-item.json";
import { ProductCardContractError } from "../src/lib/cms/server/product-cards/errors";
import { adaptProductCardCollection } from "../src/lib/cms/server/product-cards/adapter";
import { validateProductCardCollection } from "../src/lib/cms/server/product-cards/validation";

describe("ProductCard Adapter", () => {
  test("maps the exact empty collection into an independent readonly DTO", () => {
    const validated = validateProductCardCollection(emptyCards);
    const dto = adaptProductCardCollection(validated);

    expect(dto).toEqual(emptyCards);
    expect(dto).not.toBe(validated.body);
    expect(Object.isFrozen(dto)).toBe(true);
    expect(Object.isFrozen(dto.items)).toBe(true);
  });

  test.each([
    ["one", oneCard],
    ["all", allCards],
  ])("copies and deeply freezes the complete %s collection", (_name, payload) => {
    const dto = adaptProductCardCollection(
      validateProductCardCollection(payload),
    );

    expect(dto).toEqual(payload);
    expect(Object.isFrozen(dto.items[0])).toBe(true);
    expect(Object.isFrozen(dto.items[0].image)).toBe(true);
    expect(Object.isFrozen(dto.items[0].series)).toBe(true);
    expect(Object.isFrozen(dto.items[0].action)).toBe(true);
  });

  test("preserves all four frozen kind/lifecycle/action cells", () => {
    const dto = adaptProductCardCollection(
      validateProductCardCollection(allCards),
    );

    expect(
      dto.items.map(({ kind, lifecycle, action }) => [
        kind,
        lifecycle,
        action.mode,
      ]),
    ).toEqual([
      ["detail_product", "active", "view_product"],
      ["detail_product", "discontinued", "view_product"],
      ["catalog_accessory", "discontinued", "replacement_contact"],
      ["catalog_accessory", "active", "direct_rfq"],
    ]);
    expect(dto.items[0].series).toHaveLength(1);
    expect(dto.items[0].applications).toHaveLength(1);
  });

  test("rejects raw and forged inputs at the production seam", () => {
    const runtimeAdapter = adaptProductCardCollection as (
      input: unknown,
    ) => unknown;

    for (const input of [
      oneCard,
      { kind: "success", body: oneCard },
    ]) {
      expect(() => runtimeAdapter(input)).toThrowError(
        new ProductCardContractError("invalid_success_payload"),
      );
    }
  });
});
