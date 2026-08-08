import { spawnSync } from "node:child_process";

import { describe, expect, test } from "vitest";

describe("Quote Basket 2.0 offline contract", () => {
  test("verifies the closed local schema and deterministic samples", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/verify-quote-basket-v2-contract.mjs"],
      { cwd: new URL("..", import.meta.url), encoding: "utf8" },
    );

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(result.stdout).toContain(
      "Quote Basket 2.0 contract PASS: 1 schema, 1 success sample, 3 invalid samples",
    );
  });
});
