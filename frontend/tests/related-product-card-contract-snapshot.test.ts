import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error The Node-built verifier intentionally has no declaration.
import verifyRelatedProductCardContract from "../scripts/verify-related-product-card-contract.mjs";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const repositoryRoot = path.resolve(frontendRoot, "..");
const contractRoot = "frontend/src/lib/cms/related-product-card-contract";
const temporaryRoots: string[] = [];

type Manifest = {
  sourceAuthority: { manifestPath: string; checksumsPath: string };
  schemas: Array<{ sourcePath: string; snapshotPath: string; sha256: string }>;
  samples: {
    success: Array<{ sourcePath: string; snapshotPath: string }>;
    errors: { sourcePath: string; snapshotPath: string };
  };
};

async function readManifest(root: string): Promise<Manifest> {
  return JSON.parse(
    await readFile(path.join(root, contractRoot, "manifest.json"), "utf8"),
  ) as Manifest;
}

async function writeManifest(root: string, manifest: Manifest): Promise<void> {
  await writeFile(
    path.join(root, contractRoot, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function seedRepository(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "gdhe-related-contract-"));
  temporaryRoots.push(root);
  await mkdir(path.join(root, "frontend/src/lib/cms"), { recursive: true });
  await cp(path.join(repositoryRoot, contractRoot), path.join(root, contractRoot), {
    recursive: true,
  });
  const manifest = await readManifest(repositoryRoot);
  const sources = new Set([
    manifest.sourceAuthority.manifestPath,
    manifest.sourceAuthority.checksumsPath,
    ...manifest.schemas.map((entry) => entry.sourcePath),
    ...manifest.samples.success.map((entry) => entry.sourcePath),
    manifest.samples.errors.sourcePath,
  ]);
  for (const source of sources) {
    const target = path.join(root, source);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(repositoryRoot, source), target);
  }
  return root;
}

async function expectFailure(root: string, expected: RegExp): Promise<void> {
  const error = await verifyRelatedProductCardContract({ repositoryRoot: root })
    .catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toMatch(expected);
  expect((error as Error).message).not.toContain(root);
}

describe("RelatedProductCard contract snapshot", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
    );
  });

  it("verifies the exact frozen TASK-023 authority offline", () => {
    const result = spawnSync(
      process.execPath,
      [path.join(frontendRoot, "scripts/verify-related-product-card-contract.mjs")],
      { cwd: path.resolve(frontendRoot, ".."), encoding: "utf8" },
    );

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain(
      "RelatedProductCard contract snapshot PASS: 9 schemas, 4 success samples, 9 error samples",
    );
  });

  it("fails closed on missing, extra and tampered snapshot bytes", async () => {
    const missing = await seedRepository();
    const missingManifest = await readManifest(missing);
    await unlink(path.join(missing, contractRoot, missingManifest.schemas[0].snapshotPath));
    await expectFailure(missing, /missing snapshot files/i);

    const extra = await seedRepository();
    await writeFile(path.join(extra, contractRoot, "extra.json"), "{}\n");
    await expectFailure(extra, /extra snapshot files/i);

    const tampered = await seedRepository();
    const tamperedManifest = await readManifest(tampered);
    const sample = path.join(
      tampered,
      contractRoot,
      tamperedManifest.samples.success[0].snapshotPath,
    );
    await writeFile(sample, `${await readFile(sample, "utf8")} `);
    await expectFailure(tampered, /snapshot SHA-256 mismatch/i);
  });

  it("fails closed on traversal and unknown or remote references", async () => {
    const traversal = await seedRepository();
    const traversalManifest = await readManifest(traversal);
    traversalManifest.schemas[0].snapshotPath = "../escape.json";
    await writeManifest(traversal, traversalManifest);
    await expectFailure(traversal, /canonical snapshot mismatch|traversal/i);

    for (const reference of [
      "unknown.schema.json",
      "https://example.invalid/unknown.schema.json",
    ]) {
      const root = await seedRepository();
      const schemaPath = path.join(
        root,
        contractRoot,
        "schemas/related-product-card-collection.v1.schema.json",
      );
      const schema = JSON.parse(await readFile(schemaPath, "utf8")) as Record<string, unknown>;
      schema.__mutation = { $ref: reference };
      await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
      await expectFailure(root, /unknown local \$ref|remote \$ref is forbidden/i);
    }
  });

  it("fails closed on authority substitution and source drift", async () => {
    const substituted = await seedRepository();
    const substitutedManifest = await readManifest(substituted);
    const original = substitutedManifest.schemas[0].sourcePath;
    const rogue = `${original}.rogue`;
    await cp(path.join(substituted, original), path.join(substituted, rogue));
    substitutedManifest.schemas[0].sourcePath = rogue;
    await writeManifest(substituted, substitutedManifest);
    await expectFailure(substituted, /canonical authority mismatch/i);

    const drift = await seedRepository();
    const driftManifest = await readManifest(drift);
    const source = path.join(drift, driftManifest.schemas[0].sourcePath);
    await writeFile(source, `${await readFile(source, "utf8")} `);
    await expectFailure(drift, /source SHA-256 mismatch/i);
  });
});
