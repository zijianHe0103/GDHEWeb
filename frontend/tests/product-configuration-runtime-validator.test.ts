import { describe, expect, it } from "vitest";

import sample from "../src/lib/cms/product-configuration-contract/samples/success/fgd-x15-pvc.json";
import {
  ProductConfigurationContractError,
  validateProductConfiguration,
} from "../src/lib/cms/server/product-configurations/validation";

function copySample(): Record<string, unknown> {
  return structuredClone(sample) as Record<string, unknown>;
}

describe("Product Configuration runtime validator", () => {
  it("returns an authentic opaque wrapper around an isolated frozen snapshot", () => {
    const input = copySample();
    const validated = validateProductConfiguration(input);
    const body = validateProductConfiguration.getValidatedBody(validated) as typeof sample;

    expect(validated.kind).toBe("success");
    expect(Object.keys(validated)).toEqual(["kind"]);
    expect({ ...validated }).toEqual({ kind: "success" });
    expect(JSON.stringify(validated)).toBe('{"kind":"success"}');
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(body)).toBe(true);
    expect(Object.isFrozen(body.articleNumberOptions[0])).toBe(true);

    input.product = { ...(input.product as object), model: "mutated" };
    expect(body.product.model).toBe("FGD X15+PVC");
    expect(() => {
      (body.articleNumberOptions[0] as { lengthMeters: number }).lengthMeters = 7;
    }).toThrow();
  });

  it.each([
    ["wrong apiVersion", (body: Record<string, unknown>) => { body.apiVersion = "2"; }, "unsupported_schema"],
    ["wrong schemaVersion", (body: Record<string, unknown>) => { body.schemaVersion = "2.0.0"; }, "unsupported_schema"],
    ["unknown field", (body: Record<string, unknown>) => { body.internal = true; }, "invalid_success_payload"],
    ["wrong product model", (body: Record<string, unknown>) => { (body.product as Record<string, unknown>).model = "FGD X14"; }, "invalid_success_payload"],
    ["wrong product name", (body: Record<string, unknown>) => { (body.product as Record<string, unknown>).name = "Wrong"; }, "invalid_success_payload"],
    ["wrong canonical path", (body: Record<string, unknown>) => { (body.product as Record<string, unknown>).publicPath = "/products/wrong/"; }, "invalid_success_payload"],
    ["duplicate option", (body: Record<string, unknown>) => { (body.articleNumberOptions as unknown[]).push(structuredClone((body.articleNumberOptions as unknown[])[0])); }, "invalid_success_payload"],
    ["option ordering drift", (body: Record<string, unknown>) => { const options = body.articleNumberOptions as Array<Record<string, unknown>>; options.push({ ...structuredClone(options[0]), articleNumber: "GDHEPRD000171" }); }, "invalid_success_payload"],
    ["installation policy drift", (body: Record<string, unknown>) => { const policy = body.configurationPolicy as Record<string, unknown>; const methods = policy.installationMethods as Array<Record<string, unknown>>; methods[0].optionalAccessory = { id: "17000000-0000-4000-8000-000000000002", model: "X", name: "X", articleNumber: "GDHEPRD000171" }; }, "invalid_success_payload"],
    ["non-JSON value", (body: Record<string, unknown>) => { body.modifiedAt = new Map(); }, "invalid_success_payload"],
  ])("rejects %s", (_name, mutate, kind) => {
    const body = copySample();
    mutate(body);
    expect(() => validateProductConfiguration(body)).toThrowError(
      ProductConfigurationContractError,
    );
    try {
      validateProductConfiguration(body);
    } catch (error) {
      expect(error).toMatchObject({
        name: "ProductConfigurationContractError",
        category: "contract",
        kind,
      });
    }
  });

  it("rejects copied and forged wrappers", () => {
    const authentic = validateProductConfiguration(copySample());

    expect(() =>
      validateProductConfiguration.getValidatedBody({ ...authentic }),
    ).toThrowError(ProductConfigurationContractError);
    expect(() =>
      validateProductConfiguration.getValidatedBody({ kind: "success" }),
    ).toThrowError(ProductConfigurationContractError);
  });
});
