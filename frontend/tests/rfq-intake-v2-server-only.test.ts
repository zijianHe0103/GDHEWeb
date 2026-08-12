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

const temporaryPrefix = ".tmp-rfq-intake-v2-server-only-";
const projectRoot = join(import.meta.dirname, "..");

afterEach(async () => {
  expect(
    (await readdir(projectRoot)).filter((entry) => entry.startsWith(temporaryPrefix)),
  ).toEqual([]);
});

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

async function replaceMySqlForPositiveControl(directory: string): Promise<void> {
  await writeFile(
    join(directory, "src", "lib", "rfq", "server", "v2", "mysql-repository.ts"),
    [
      'import type { RfqRepository, RfqRepositoryLookupInput, RfqRepositoryLookupResult, RfqRepositoryReservationResult, RfqRepositoryTransitionInput, RfqRepositoryTransitionResult, RfqReservationInput } from "./repository";',
      "export function createMySqlRfqConnectionFactory(_config: Readonly<{ host: string; port: number; user: string; password: string; database: \"gdhe_rfq\" }>): () => Promise<never> { return async () => { throw new Error(\"positive control only\"); }; }",
      "export class MySqlRfqRepository implements RfqRepository {",
      "  constructor(_input: Readonly<{ connect: () => Promise<never> }>) {}",
      "  async lookup(_input: RfqRepositoryLookupInput): Promise<RfqRepositoryLookupResult> { throw new Error(\"positive control only\"); }",
      "  async reserve(_input: RfqReservationInput): Promise<RfqRepositoryReservationResult> { throw new Error(\"positive control only\"); }",
      "  async transition(_input: RfqRepositoryTransitionInput): Promise<RfqRepositoryTransitionResult> { throw new Error(\"positive control only\"); }",
      "}",
      "",
    ].join("\n"),
  );
}

async function buildClientImport(
  modulePath: string,
  stripServerOnlyMarkers: boolean,
): Promise<{ status: number | null; output: string }> {
  const temporaryRoot = await mkdtemp(join(projectRoot, temporaryPrefix));
  try {
    await mkdir(join(temporaryRoot, "app"), { recursive: true });
    await mkdir(join(temporaryRoot, "src", "lib"), { recursive: true });
    await mkdir(
      join(temporaryRoot, "src", "lib", "cms", "server", "article-number-batch"),
      { recursive: true },
    );
    await mkdir(join(temporaryRoot, "src", "app", "api", "rfq", "intake"), {
      recursive: true,
    });
    await mkdir(join(temporaryRoot, "src", "app", "api", "rfq", "intent"), {
      recursive: true,
    });
    await mkdir(join(temporaryRoot, "src", "lib", "rfq"), { recursive: true });
    await cp(
      join(projectRoot, "src", "lib", "rfq", "server"),
      join(temporaryRoot, "src", "lib", "rfq", "server"),
      { recursive: true },
    );
    await cp(
      join(projectRoot, "src", "lib", "rfq-submission-contract"),
      join(temporaryRoot, "src", "lib", "rfq-submission-contract"),
      { recursive: true },
    );
    await cp(
      join(projectRoot, "src", "lib", "cms", "server", "article-number-batch"),
      join(temporaryRoot, "src", "lib", "cms", "server", "article-number-batch"),
      { recursive: true },
    );
    await cp(
      join(projectRoot, "src", "lib", "cms", "article-number-batch-contract"),
      join(temporaryRoot, "src", "lib", "cms", "article-number-batch-contract"),
      { recursive: true },
    );
    await cp(
      join(projectRoot, "src", "lib", "cms", "server", "config.ts"),
      join(temporaryRoot, "src", "lib", "cms", "server", "config.ts"),
    );
    await cp(
      join(projectRoot, "src", "lib", "cms", "server", "errors.ts"),
      join(temporaryRoot, "src", "lib", "cms", "server", "errors.ts"),
    );
    await cp(
      join(projectRoot, "src", "app", "api", "rfq", "intake", "route.ts"),
      join(temporaryRoot, "src", "app", "api", "rfq", "intake", "route.ts"),
    );
    await cp(
      join(projectRoot, "src", "app", "api", "rfq", "intent", "route.ts"),
      join(temporaryRoot, "src", "app", "api", "rfq", "intent", "route.ts"),
    );
    if (stripServerOnlyMarkers) {
      await stripMarkers(join(temporaryRoot, "src", "lib"));
      await replaceMySqlForPositiveControl(temporaryRoot);
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
      `"use client";\nimport * as rfq from "${modulePath}";\nexport default function Page() { void rfq; return null; }\n`,
    );
    const build = spawnSync(
      join(projectRoot, "node_modules", ".bin", "next"),
      ["build"],
      {
        cwd: temporaryRoot,
        encoding: "utf8",
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      },
    );
    return { status: build.status, output: `${build.stdout}\n${build.stderr}` };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

describe("TASK-027 RFQ Intake v2 server-only boundary", () => {
  test.each([
    ["public entry", "../src/lib/rfq/server/v2"],
    ["deep canonical module", "../src/lib/rfq/server/v2/canonical"],
    ["deep authority module", "../src/lib/rfq/server/v2/authority"],
    ["deep intake module", "../src/lib/rfq/server/v2/intake"],
    ["deep common Repository module", "../src/lib/rfq/server/v2/repository"],
    ["deep Stub Repository module", "../src/lib/rfq/server/v2/stub-repository"],
    ["deep Stub Sink module", "../src/lib/rfq/server/v2/stub-sink"],
    ["deep MySQL Repository module", "../src/lib/rfq/server/v2/mysql-repository"],
    ["deep configuration module", "../src/lib/rfq/server/v2/config"],
    ["deep intent issuer and verifier", "../src/lib/rfq/server/v2/intent"],
    ["Route Handler module", "../src/app/api/rfq/intake/route"],
    ["intent Route Handler module", "../src/app/api/rfq/intent/route"],
  ])("rejects Client Component import of the %s", async (_name, modulePath) => {
    const positive = await buildClientImport(modulePath, true);
    const guarded = await buildClientImport(modulePath, false);

    expect(positive.status, positive.output).toBe(0);
    expect(guarded.status, guarded.output).not.toBe(0);
    expect(guarded.output).toMatch(/server-only|Client Component/i);
  }, 60_000);
});
