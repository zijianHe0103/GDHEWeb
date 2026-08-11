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

import { afterEach, describe, expect, test } from "vitest";

const temporaryPrefix = ".tmp-article-number-batch-server-only-";
const projectRoot = join(import.meta.dirname, "..");

afterEach(async () => {
  expect(
    (await readdir(projectRoot)).filter((entry) => entry.startsWith(temporaryPrefix)),
  ).toEqual([]);
});

describe("TASK-025 Article Number batch server-only boundary", () => {
  test.each([
    ["public consumer", "../src/lib/cms/server/article-number-batch"],
    ["deep Adapter", "../src/lib/cms/server/article-number-batch/adapter"],
  ])("rejects Client Component import of the %s", async (_name, modulePath) => {
    const positive = await buildClientImport(modulePath, true);
    const guarded = await buildClientImport(modulePath, false);

    expect(positive.status, positive.output).toBe(0);
    expect(guarded.status, guarded.output).not.toBe(0);
    expect(guarded.output).toMatch(/server-only|Client Component/i);
  }, 30_000);
});

async function buildClientImport(
  modulePath: string,
  stripServerOnlyMarkers: boolean,
): Promise<{ status: number | null; output: string }> {
  const temporaryRoot = await mkdtemp(join(projectRoot, temporaryPrefix));
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
    await writeFile(join(temporaryRoot, "package.json"), JSON.stringify({
      private: true,
      dependencies: {
        ajv: "8.20.0",
        "ajv-formats": "3.0.1",
        next: "16.2.11",
        react: "19.2.8",
        "react-dom": "19.2.8",
      },
    }));
    await writeFile(
      join(temporaryRoot, "app", "layout.tsx"),
      "export default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }",
    );
    await writeFile(
      join(temporaryRoot, "app", "page.tsx"),
      `"use client";\nimport * as consumer from "${modulePath}";\nexport default function Page() { void consumer; return null; }\n`,
    );
    const build = spawnSync(join(projectRoot, "node_modules", ".bin", "next"), ["build"], {
      cwd: temporaryRoot,
      encoding: "utf8",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    });
    return { status: build.status, output: `${build.stdout}\n${build.stderr}` };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function stripMarkers(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) await stripMarkers(filePath);
    else if (entry.name.endsWith(".ts")) {
      const source = await readFile(filePath, "utf8");
      await writeFile(filePath, source.replaceAll('import "server-only";\n\n', ""));
    }
  }
}
