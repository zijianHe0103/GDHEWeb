import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import errorPayloads from "../src/lib/cms/contracts/samples/errors/resolve-errors.json";
import homePayload from "../src/lib/cms/contracts/samples/success/resolve-home.json";
import productPayload from "../src/lib/cms/contracts/samples/success/resolve-product-alpha.json";
import { adaptCmsIntegrationPage } from "../src/lib/cms/server/adapter/cms-integration-page";
import {
  CmsContractError,
  validateCmsErrorPayload,
  validateCmsSuccessPayload,
  type ValidatedCmsPayload,
} from "../src/lib/cms/server/validation";

describe("CMS integration Adapter", () => {
  test.each([
    {
      name: "home",
      payload: homePayload,
      expected: {
        id: "31000000-0000-4000-8000-000000000001",
        apiVersion: "1",
        schemaVersion: "3.0.0",
        type: "page",
        templateKey: "standard",
        locale: "en",
        publicPath: "/",
        title: "TASK-007 A3 Home",
        excerpt: "Synthetic product portfolio home.",
        moduleCount: 1,
      },
    },
    {
      name: "product",
      payload: productPayload,
      expected: {
        id: "31000000-0000-4000-8000-000000000002",
        apiVersion: "1",
        schemaVersion: "3.0.0",
        type: "product",
        templateKey: "product",
        locale: "en",
        publicPath: "/products/task-007-a3-flow-control-alpha/",
        title: "GDHE Flow Control Alpha",
        excerpt: "Synthetic flow-control product alpha.",
        moduleCount: 1,
      },
    },
  ])("maps the validated $name payload to the exact frozen DTO", ({
    payload,
    expected,
  }) => {
    const validated = validateCmsSuccessPayload(payload);
    const page = adaptCmsIntegrationPage(validated);

    expect(page).toEqual(expected);
    expect(Object.isFrozen(page)).toBe(true);
    expect(Reflect.set(page, "title", "Changed")).toBe(false);
    expect(page.title).toBe(expected.title);
    expect(Object.keys(page)).toEqual(Object.keys(expected));
    expect(JSON.stringify(page)).not.toContain("safeHtml");
    expect(JSON.stringify(page)).not.toContain("relations");
    expect(JSON.stringify(page)).not.toContain("details");
    expect(JSON.stringify(page)).not.toContain("modules");
  });

  test("accepts only the validated success wrapper at compile time", () => {
    if (false) {
      const networkInput: unknown = homePayload;
      // @ts-expect-error Network unknown must pass runtime validation first.
      adaptCmsIntegrationPage(networkInput);

      const structuralObject = {
        kind: "success",
        body: homePayload,
      };
      // @ts-expect-error The module-private Validator brand is required.
      adaptCmsIntegrationPage(structuralObject);
    }

    const validated: ValidatedCmsPayload<"success"> =
      validateCmsSuccessPayload(homePayload);
    expect(adaptCmsIntegrationPage(validated).title).toBe(homePayload.title);
  });

  test.each([
    ["raw success payload", homePayload],
    [
      "ordinary structural object",
      {
        kind: "success",
        body: {
          ...homePayload,
          title: "FORGED ADAPTER TITLE",
          diagnostics: "FORGED ADAPTER DIAGNOSTICS",
        },
      },
    ],
    [
      "authentic error wrapper",
      validateCmsErrorPayload(errorPayloads.gdhe_not_found),
    ],
  ])("rejects a %s at the real production seam", (_name, input) => {
    const runtimeAdapter = adaptCmsIntegrationPage as (
      candidate: unknown,
    ) => unknown;

    try {
      runtimeAdapter(input);
      expect.unreachable("Expected the Adapter to reject an inauthentic input.");
    } catch (error) {
      expect(error).toBeInstanceOf(CmsContractError);
      expect(error).toMatchObject({
        category: "contract",
        kind: "invalid_success_payload",
        message: "CMS payload did not satisfy the supported contract.",
      });

      const renderedError = `${String(
        (error as Error).message,
      )}\n${JSON.stringify(error)}`;
      for (const forbidden of [
        homePayload.title,
        "FORGED ADAPTER TITLE",
        "FORGED ADAPTER DIAGNOSTICS",
        "body",
        "diagnostics",
      ]) {
        expect(renderedError).not.toContain(forbidden);
      }
    }
  });

  test("does not couple the Adapter to transport, contracts, Ajv or React", async () => {
    const source = await readFile(
      join(
        import.meta.dirname,
        "../src/lib/cms/server/adapter/cms-integration-page.ts",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/transport|contracts\/|ajv|react/i);
  });
});
