import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error The Node-built verifier intentionally has no declaration.
import verifyRfqSubmissionV2Contract from "../scripts/verify-rfq-submission-v2-contract.mjs";

const frontendRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(frontendRoot, "..");
const contractRoot = "frontend/src/lib/rfq-submission-contract/v2";
const temporaryRoots: string[] = [];

type ManifestEntry = {
  sourcePath: string;
  snapshotPath: string;
  sha256: string;
};

type Manifest = {
  manifestVersion: string;
  authority: {
    taskId: string;
    verifierPath: string;
    verifierSha256: string;
  };
  files: ManifestEntry[];
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
  const root = await mkdtemp(path.join(tmpdir(), "gdhe-task027-contract-"));
  temporaryRoots.push(root);
  await mkdir(path.join(root, "frontend/src/lib/rfq-submission-contract"), {
    recursive: true,
  });
  await cp(path.join(repositoryRoot, contractRoot), path.join(root, contractRoot), {
    recursive: true,
  });
  const manifest = await readManifest(repositoryRoot);
  for (const source of [
    manifest.authority.verifierPath,
    ...manifest.files.map((entry) => entry.sourcePath),
  ]) {
    const target = path.join(root, source);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(repositoryRoot, source), target);
  }
  return realpath(root);
}

async function expectFailure(root: string, expected: RegExp): Promise<void> {
  const error = await verifyRfqSubmissionV2Contract({ repositoryRoot: root })
    .catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toMatch(expected);
  expect((error as Error).message).not.toContain(root);
}

describe("TASK-027 RFQ Submission v2 contract snapshot", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
    );
  });

  it("verifies the exact frontend-local TASK-026 authority closure offline", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/verify-rfq-submission-v2-contract.mjs"],
      { cwd: frontendRoot, encoding: "utf8" },
    );

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain(
      "RFQ Submission v2 contract snapshot PASS: 20 JSON files, 5 schemas, 63 closed refs, 94/94 authority checks",
    );
  });

  it("fails closed on missing, extra and tampered snapshot bytes", async () => {
    const missing = await seedRepository();
    const missingManifest = await readManifest(missing);
    await unlink(path.join(missing, contractRoot, missingManifest.files[0].snapshotPath));
    await expectFailure(missing, /missing snapshot files/i);

    const extra = await seedRepository();
    await writeFile(path.join(extra, contractRoot, "extra.json"), "{}\n");
    await expectFailure(extra, /extra snapshot files/i);

    const tampered = await seedRepository();
    const tamperedManifest = await readManifest(tampered);
    const snapshot = path.join(
      tampered,
      contractRoot,
      tamperedManifest.files[0].snapshotPath,
    );
    await writeFile(snapshot, `${await readFile(snapshot, "utf8")} `);
    await expectFailure(tampered, /snapshot SHA-256 mismatch/i);
  });

  it("fails closed on symlinked, non-regular and non-canonical snapshot identities", async () => {
    const linkedFile = await seedRepository();
    const linkedManifest = await readManifest(linkedFile);
    const snapshot = path.join(
      linkedFile,
      contractRoot,
      linkedManifest.files[0].snapshotPath,
    );
    const target = `${snapshot}.target`;
    await rename(snapshot, target);
    await symlink(target, snapshot);
    await expectFailure(linkedFile, /unsupported snapshot entry|regular non-symlink|canonical identity/i);

    const nonRegular = await seedRepository();
    const nonRegularManifest = await readManifest(nonRegular);
    const nonRegularSnapshot = path.join(
      nonRegular,
      contractRoot,
      nonRegularManifest.files[0].snapshotPath,
    );
    await unlink(nonRegularSnapshot);
    await mkdir(nonRegularSnapshot);
    await expectFailure(nonRegular, /missing snapshot files|unsupported snapshot entry/i);

    const linkedRoot = await seedRepository();
    const originalRoot = path.join(linkedRoot, contractRoot);
    const realRoot = `${originalRoot}-real`;
    await rename(originalRoot, realRoot);
    await symlink(realRoot, originalRoot);
    await expectFailure(linkedRoot, /canonical identity mismatch/i);

    const nonCanonical = await seedRepository();
    const nonCanonicalManifest = await readManifest(nonCanonical);
    nonCanonicalManifest.files[0].snapshotPath =
      `samples/../${nonCanonicalManifest.files[0].snapshotPath}`;
    await writeManifest(nonCanonical, nonCanonicalManifest);
    await expectFailure(nonCanonical, /manifest file authority drift/i);
  });

  it("fails closed on traversing, remote and unknown Schema references", async () => {
    const traversal = await seedRepository();
    const traversalManifest = await readManifest(traversal);
    traversalManifest.files[0].snapshotPath = "../escape.json";
    await writeManifest(traversal, traversalManifest);
    await expectFailure(traversal, /manifest file authority drift/i);

    for (const [reference, expected] of [
      ["https://example.invalid/unknown.schema.json", /remote \$ref is forbidden/i],
      ["unknown.schema.json", /unknown local \$ref target/i],
    ] as const) {
      const root = await seedRepository();
      const schemaPath = path.join(
        root,
        contractRoot,
        "schemas/public-rfq-submission-draft.v2.schema.json",
      );
      const schema = JSON.parse(await readFile(schemaPath, "utf8")) as Record<string, unknown>;
      schema.__mutation = { $ref: reference };
      await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
      await expectFailure(root, expected);
    }
  });

  it("fails closed on authority substitution and source or verifier drift", async () => {
    const substituted = await seedRepository();
    const substitutedManifest = await readManifest(substituted);
    const original = substitutedManifest.files[0].sourcePath;
    const rogue = `${original}.rogue`;
    await cp(path.join(substituted, original), path.join(substituted, rogue));
    substitutedManifest.files[0].sourcePath = rogue;
    await writeManifest(substituted, substitutedManifest);
    await expectFailure(substituted, /manifest file authority drift/i);

    const drift = await seedRepository();
    const driftManifest = await readManifest(drift);
    const source = path.join(drift, driftManifest.files[0].sourcePath);
    await writeFile(source, `${await readFile(source, "utf8")} `);
    await expectFailure(drift, /source SHA-256 mismatch/i);

    const verifierDrift = await seedRepository();
    const verifierManifest = await readManifest(verifierDrift);
    const verifier = path.join(verifierDrift, verifierManifest.authority.verifierPath);
    await writeFile(verifier, `${await readFile(verifier, "utf8")} `);
    await expectFailure(verifierDrift, /authority verifier SHA-256 mismatch/i);

    const linkedSource = await seedRepository();
    const linkedSourceManifest = await readManifest(linkedSource);
    const sourceFile = path.join(linkedSource, linkedSourceManifest.files[0].sourcePath);
    const sourceTarget = `${sourceFile}.target`;
    await rename(sourceFile, sourceTarget);
    await symlink(sourceTarget, sourceFile);
    await expectFailure(linkedSource, /regular non-symlink|canonical identity/i);
  });
});
