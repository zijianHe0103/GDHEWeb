import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import errorSamples from "../src/lib/cms/product-card-contract/samples/errors/product-card-errors.json";
import allCards from "../src/lib/cms/product-card-contract/samples/success/all.json";
import emptyCards from "../src/lib/cms/product-card-contract/samples/success/filtered-empty.json";
import oneCard from "../src/lib/cms/product-card-contract/samples/success/one-item.json";
import { ProductCardContractError } from "../src/lib/cms/server/product-cards/errors";
import {
  validateProductCardCollection,
} from "../src/lib/cms/server/product-cards/validation";
import { validateCmsErrorPayload } from "../src/lib/cms/server/validation";

describe("ProductCard runtime Validator", () => {
  test.each([
    ["empty", emptyCards],
    ["one", oneCard],
    ["all", allCards],
  ])("validates the frozen %s success sample through the public seam", (
    _name,
    payload,
  ) => {
    const validated = validateProductCardCollection(payload);

    expect(validated.kind).toBe("success");
    expect(validated.body).toEqual(payload);
    expect(validated.body).not.toBe(payload);
    expect(Object.isFrozen(validated.body)).toBe(true);
  });

  test("statically registers exactly the frozen eight-Schema closure", async () => {
    const source = await readFile(
      join(
        import.meta.dirname,
        "../src/lib/cms/server/product-cards/validation-registry.ts",
      ),
      "utf8",
    );
    const imports = source.match(
      /from "\.\.\/\.\.\/product-card-contract\/schemas\/[^"]+\.json"/g,
    );

    expect(imports).toHaveLength(8);
    expect(source).not.toMatch(/node:fs|fetch\(|loadSchema/);
  });

  test("rejects a detail action targeting another canonical product path", () => {
    const payload = structuredClone(oneCard);
    payload.items[0].action.targetPath = "/products/another-product/";

    expect(() => validateProductCardCollection(payload)).toThrowError(
      new ProductCardContractError("invalid_success_payload"),
    );
  });

  test.each([
    [
      "unsupported API",
      (payload: typeof oneCard) => {
        (payload as { apiVersion: string }).apiVersion = "2";
      },
      "unsupported_schema",
    ],
    [
      "unsupported Schema",
      (payload: typeof oneCard) => {
        (payload as { schemaVersion: string }).schemaVersion = "2.0.0";
      },
      "unsupported_schema",
    ],
    [
      "extra root field",
      (payload: typeof oneCard) => {
        Object.assign(payload, { rawMeta: "private" });
      },
      "invalid_success_payload",
    ],
    [
      "non-HTTPS media",
      (payload: typeof oneCard) => {
        payload.items[0].image.url = "http://media.example.test/image.webp";
      },
      "invalid_success_payload",
    ],
    [
      "invalid relation UUID",
      (payload: typeof oneCard) => {
        payload.items[0].series[0].id = "wordpress-42";
      },
      "invalid_success_payload",
    ],
  ])("rejects the %s mutation", (_name, mutate, expectedKind) => {
    const payload = structuredClone(oneCard);
    mutate(payload);

    expect(() => validateProductCardCollection(payload)).toThrowError(
      new ProductCardContractError(
        expectedKind as "unsupported_schema" | "invalid_success_payload",
      ),
    );
  });

  test("isolates and deeply freezes the body without serializing it", () => {
    const payload = structuredClone(oneCard);
    const validated = validateProductCardCollection(payload);

    payload.items[0].name = "caller mutation";
    expect((validated.body as typeof oneCard).items[0].name).toBe(
      oneCard.items[0].name,
    );
    expect(Object.isFrozen((validated.body as typeof oneCard).items[0])).toBe(
      true,
    );
    expect(Object.keys(validated)).toEqual(["kind"]);
    expect({ ...validated }).toEqual({ kind: "success" });
    expect(JSON.stringify(validated)).toBe('{"kind":"success"}');
  });

  test("rejects a forged wrapper and a non-cloneable input with stable errors", () => {
    expect(() =>
      validateProductCardCollection.getValidatedBody({
        kind: "success",
        body: oneCard,
      }),
    ).toThrowError(new ProductCardContractError("invalid_success_payload"));

    expect(() =>
      validateProductCardCollection({
        ...oneCard,
        callback: () => "not JSON",
      }),
    ).toThrowError(new ProductCardContractError("invalid_success_payload"));
  });

  test.each(Object.entries(errorSamples))(
    "validates the frozen normalized %s error with the common error root",
    (_name, payload) => {
      expect(validateCmsErrorPayload(payload).kind).toBe("error");
    },
  );
});
