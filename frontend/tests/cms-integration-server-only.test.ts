import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

async function buildClientImport(
  modulePath: string,
  stripServerOnlyMarkers: boolean,
): Promise<{ status: number | null; output: string }> {
  const projectRoot = join(import.meta.dirname, "..");
  const temporaryRoot = await mkdtemp(
    join(projectRoot, ".tmp-integration-server-only-"),
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

    if (stripServerOnlyMarkers) {
      await stripMarkers(join(temporaryRoot, "src", "lib", "cms", "server"));
    }

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
      `"use client";\nimport * as integration from "${modulePath}";\nexport default function Page() { void integration; return null; }\n`,
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

    return {
      status: build.status,
      output: `${build.stdout}\n${build.stderr}`,
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function stripMarkers(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await stripMarkers(path);
    } else if (entry.name.endsWith(".ts")) {
      const source = await readFile(path, "utf8");
      await writeFile(path, source.replace('import "server-only";\n\n', ""));
    }
  }
}

describe("CMS integration server-only boundary", () => {
  test.each([
    ["public integration entry", "../src/lib/cms/server/integration"],
    ["deep integration error module", "../src/lib/cms/server/integration/errors"],
  ])(
    "rejects a Client Component import of the %s",
    async (_name, path) => {
      const positiveControl = await buildClientImport(path, true);
      const guardedBuild = await buildClientImport(path, false);

      expect(positiveControl.status, positiveControl.output).toBe(0);
      expect(guardedBuild.status, guardedBuild.output).not.toBe(0);
      expect(guardedBuild.output).toMatch(/server-only|Client Component/i);
    },
    30_000,
  );
});
