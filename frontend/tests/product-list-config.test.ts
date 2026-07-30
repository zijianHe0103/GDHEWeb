import { readFile } from "node:fs/promises";

import { afterEach, describe, expect, test } from "vitest";

import { readProductListMode } from "../src/lib/product-list/config";

const originalMode = process.env.GDHE_PRODUCT_LIST_MODE;
const originalNodeEnvironment = process.env.NODE_ENV;

afterEach(() => {
  restoreEnvironment("GDHE_PRODUCT_LIST_MODE", originalMode);
  restoreEnvironment("NODE_ENV", originalNodeEnvironment);
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe("Product list mode", () => {
  test.each([
    [undefined, "development", "disabled"],
    ["", "development", "disabled"],
    ["unknown", "development", "disabled"],
    ["preview", "development", "preview"],
    ["cms", "test", "cms"],
    ["preview", "production", "disabled"],
    ["cms", "production", "disabled"],
  ] as const)(
    "maps mode %s in %s to %s",
    (mode, nodeEnvironment, expected) => {
      restoreEnvironment("GDHE_PRODUCT_LIST_MODE", mode);
      restoreEnvironment("NODE_ENV", nodeEnvironment);

      expect(readProductListMode()).toBe(expected);
    },
  );

  test("keeps the only mode reader server-only and non-public", async () => {
    const source = await readFile(
      new URL("../src/lib/product-list/config.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain('import "server-only"');
    expect(source).toContain("GDHE_PRODUCT_LIST_MODE");
    expect(source).not.toContain("NEXT_PUBLIC_");
  });
});
