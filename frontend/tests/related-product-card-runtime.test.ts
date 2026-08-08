import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import fourPlus from "../src/lib/cms/related-product-card-contract/samples/success/four-plus.json";
import zero from "../src/lib/cms/related-product-card-contract/samples/success/zero.json";
import errors from "../src/lib/cms/related-product-card-contract/samples/errors/related-product-errors.json";
import { adaptRelatedProductCardCollection } from "../src/lib/cms/server/related-product-cards/adapter";
import { RelatedProductCardContractError } from "../src/lib/cms/server/related-product-cards/errors";
import { validateRelatedProductCardCollection } from "../src/lib/cms/server/related-product-cards/validation";
import { validateCmsErrorPayload } from "../src/lib/cms/server/validation";

describe("RelatedProductCard runtime contract", () => {
  test.each([
    ["zero", zero],
    ["four-plus", fourPlus],
  ])("validates and deeply snapshots the frozen %s sample", (_name, sample) => {
    const input = structuredClone(sample);
    const validated = validateRelatedProductCardCollection(input);

    input.sourcePath = "/products/caller-mutation/";
    expect(validated.kind).toBe("success");
    expect(validated.body).toEqual(sample);
    expect(validated.body).not.toBe(input);
    expect(Object.isFrozen(validated.body)).toBe(true);
    expect(Object.keys(validated)).toEqual(["kind"]);
    expect(JSON.stringify(validated)).toBe('{"kind":"success"}');
  });

  test("statically registers exactly the frozen nine-Schema closure", async () => {
    const source = await readFile(
      join(
        import.meta.dirname,
        "../src/lib/cms/server/related-product-cards/validation-registry.ts",
      ),
      "utf8",
    );
    expect(
      source.match(
        /from "\.\.\/\.\.\/related-product-card-contract\/schemas\/[^\"]+\.json"/g,
      ),
    ).toHaveLength(9);
    expect(source).not.toMatch(/node:fs|fetch\(|loadSchema/);
  });

  test("rejects a mismatched direct-quote semantic and forged wrapper", () => {
    const payload = structuredClone(fourPlus);
    payload.items[0].directQuote = {
      kind: "catalog_accessory",
      quantityUnit: "piece",
    };

    expect(() => validateRelatedProductCardCollection(payload)).toThrowError(
      new RelatedProductCardContractError("invalid_success_payload"),
    );
    expect(() =>
      adaptRelatedProductCardCollection({
        kind: "success",
        body: fourPlus,
      } as never),
    ).toThrowError(
      new RelatedProductCardContractError("invalid_success_payload"),
    );
  });

  test("rejects a detail target mismatch and duplicate public card identity", () => {
    const wrongTarget = structuredClone(fourPlus);
    wrongTarget.items[0].card.action.targetPath = "/products/another-product/";
    expect(() =>
      validateRelatedProductCardCollection(wrongTarget),
    ).toThrowError(
      new RelatedProductCardContractError("invalid_success_payload"),
    );

    const duplicate = structuredClone(fourPlus);
    duplicate.items[1] = structuredClone(duplicate.items[0]);
    expect(() => validateRelatedProductCardCollection(duplicate)).toThrowError(
      new RelatedProductCardContractError("invalid_success_payload"),
    );
  });

  test("adapts a complete independent deeply frozen server DTO", () => {
    const dto = adaptRelatedProductCardCollection(
      validateRelatedProductCardCollection(fourPlus),
    );

    expect(dto).toEqual(fourPlus);
    expect(dto).not.toBe(fourPlus);
    expect(Object.isFrozen(dto)).toBe(true);
    expect(Object.isFrozen(dto.items)).toBe(true);
    expect(Object.isFrozen(dto.items[0].card.image)).toBe(true);
    expect(Object.isFrozen(dto.items[1].directQuote)).toBe(true);
  });

  test.each(Object.entries(errors))(
    "validates the frozen normalized %s error with the common error root",
    (_name, payload) => {
      expect(validateCmsErrorPayload(payload).kind).toBe("error");
    },
  );
});
