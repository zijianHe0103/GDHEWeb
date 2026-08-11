import { spawnSync } from "node:child_process";
import { cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

describe("Quote Basket 3.0 offline contract", () => {
  test("verifies the independent closed schema and deterministic samples", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/verify-quote-basket-v3-contract.mjs"],
      { cwd: new URL("..", import.meta.url), encoding: "utf8" },
    );

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(result.stdout).toContain(
      "Quote Basket 3.0 contract PASS: 1 schema, 1 success sample, 6 invalid samples",
    );
  });

  test("fails closed on tamper, extra inventory and symlink substitution", async () => {
    const projectRoot = fileURLToPath(new URL("..", import.meta.url));
    const temporaryRoot = await mkdtemp(join(projectRoot, ".tmp-quote-basket-v3-contract-"));
    try {
      await cp(fileURLToPath(new URL("../scripts", import.meta.url)), join(temporaryRoot, "scripts"), { recursive: true });
      await cp(
        fileURLToPath(new URL("../src/lib/quote-basket-contract/v3", import.meta.url)),
        join(temporaryRoot, "src/lib/quote-basket-contract/v3"),
        { recursive: true },
      );
      const verifier = join(temporaryRoot, "scripts/verify-quote-basket-v3-contract.mjs");
      const contractRoot = join(temporaryRoot, "src/lib/quote-basket-contract/v3");

      await writeFile(join(contractRoot, "samples/success/mixed.json"), "{}\n");
      expect(spawnSync(process.execPath, [verifier], { encoding: "utf8" }).status).not.toBe(0);

      await rm(contractRoot, { recursive: true });
      await cp(
        fileURLToPath(new URL("../src/lib/quote-basket-contract/v3", import.meta.url)),
        contractRoot,
        { recursive: true },
      );
      await writeFile(join(contractRoot, "extra.json"), "{}\n");
      expect(spawnSync(process.execPath, [verifier], { encoding: "utf8" }).status).not.toBe(0);

      await rm(join(contractRoot, "extra.json"));
      const schema = join(contractRoot, "schemas/quote-basket.v3.schema.json");
      const replacement = join(temporaryRoot, "replacement.json");
      await cp(schema, replacement);
      await rm(schema);
      await symlink(replacement, schema);
      expect(spawnSync(process.execPath, [verifier], { encoding: "utf8" }).status).not.toBe(0);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
});
