import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

async function buildClientImport(modulePath: string): Promise<string> {
  const projectRoot = join(import.meta.dirname, "..");
  const temporaryRoot = await mkdtemp(
    join(projectRoot, ".tmp-product-card-server-only-"),
  );

  try {
    await mkdir(join(temporaryRoot, "app"), { recursive: true });
    await mkdir(join(temporaryRoot, "src", "lib"), { recursive: true });
    await cp(
      join(projectRoot, "src", "lib", "cms"),
      join(temporaryRoot, "src", "lib", "cms"),
      { recursive: true },
    );
    await cp(
      join(projectRoot, "src", "types"),
      join(temporaryRoot, "src", "types"),
      { recursive: true },
    );
    await writeFile(
      join(temporaryRoot, "package.json"),
      JSON.stringify({
        private: true,
        dependencies: {
          ajv: "8.20.0",
          "ajv-formats": "3.0.1",
          next: "16.2.11",
          react: "19.2.8",
          "react-dom": "19.2.8",
        },
      }),
    );
    await writeFile(
      join(temporaryRoot, "app", "layout.tsx"),
      "export default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }",
    );
    await writeFile(
      join(temporaryRoot, "app", "page.tsx"),
      `"use client";\nimport * as productCards from "${modulePath}";\nexport default function Page() { void productCards; return null; }\n`,
    );

    const build = spawnSync(
      join(projectRoot, "node_modules", ".bin", "next"),
      ["build"],
      {
        cwd: temporaryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          NEXT_TELEMETRY_DISABLED: "1",
        },
      },
    );
    const output = `${build.stdout}\n${build.stderr}`;
    expect(build.status).not.toBe(0);
    return output;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

describe("ProductCard server-only boundary", () => {
  test.each([
    ["public entry", "../src/lib/cms/server/product-cards"],
    ["deep transport", "../src/lib/cms/server/product-cards/transport"],
    ["deep validator", "../src/lib/cms/server/product-cards/validation"],
    ["deep adapter", "../src/lib/cms/server/product-cards/adapter"],
    ["RelatedProductCard public entry", "../src/lib/cms/server/related-product-cards"],
    ["RelatedProductCard deep transport", "../src/lib/cms/server/related-product-cards/transport"],
    ["RelatedProductCard deep validator", "../src/lib/cms/server/related-product-cards/validation"],
    ["RelatedProductCard deep adapter", "../src/lib/cms/server/related-product-cards/adapter"],
  ])("rejects a real Client Component import of the %s", async (_name, path) => {
    const output = await buildClientImport(path);
    expect(output).toMatch(/server-only|Client Component/i);
  }, 30_000);
});
