import { createHash } from "node:crypto";
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

// @ts-expect-error The Node-built verifier intentionally has no TypeScript declaration.
import verifyCmsContract from "../scripts/verify-cms-contract.mjs";

type ManifestEntry = {
  sourcePath: string;
  snapshotPath: string;
  sha256: string;
};

type ContractManifest = {
  schemas: ManifestEntry[];
  samples: {
    errors: {
      sourcePath: string;
      snapshotPath: string;
    };
    success: ManifestEntry[];
  };
};

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const contractRootPath = "frontend/src/lib/cms/contracts";
const temporaryRoots: string[] = [];

async function readManifest(root: string): Promise<ContractManifest> {
  return JSON.parse(
    await readFile(path.join(root, contractRootPath, "manifest.json"), "utf8"),
  ) as ContractManifest;
}

async function writeManifest(
  root: string,
  manifest: ContractManifest,
): Promise<void> {
  await writeFile(
    path.join(root, contractRootPath, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function seedTemporaryRepository(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "gdhe-cms-contract-"));
  temporaryRoots.push(root);

  await mkdir(path.join(root, "frontend/src/lib/cms"), { recursive: true });
  await cp(
    path.join(repositoryRoot, contractRootPath),
    path.join(root, contractRootPath),
    { recursive: true },
  );

  const manifest = await readManifest(repositoryRoot);
  const sourcePaths = new Set([
    ...manifest.schemas.map(({ sourcePath }) => sourcePath),
    ...manifest.samples.success.map(({ sourcePath }) => sourcePath),
    manifest.samples.errors.sourcePath,
  ]);

  for (const sourcePath of sourcePaths) {
    const target = path.join(root, sourcePath);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(repositoryRoot, sourcePath), target);
  }

  return root;
}

function sha256(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      rm(root, { recursive: true, force: true }),
    ),
  );
});

describe("CMS contract snapshot verifier", () => {
  test("accepts the frozen TASK-007 resolve contract", async () => {
    const root = await seedTemporaryRepository();

    await expect(verifyCmsContract({ repositoryRoot: root })).resolves.toEqual({
      errorSamples: 2,
      schemas: 16,
      successSamples: 2,
    });
  });


  test("fails when a schema authority source path is substituted", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const entry = manifest.schemas.find(
      ({ snapshotPath }) => snapshotPath === "schemas/error.schema.json",
    );
    expect(entry).toBeDefined();

    const rogueSourcePath = `${entry!.sourcePath}.rogue`;
    await cp(
      path.join(root, entry!.sourcePath),
      path.join(root, rogueSourcePath),
    );
    entry!.sourcePath = rogueSourcePath;
    await writeManifest(root, manifest);

    await expect(
      verifyCmsContract({ repositoryRoot: root }),
    ).rejects.toThrow(/authority|canonical source/i);
  });
  test("fails when a declared snapshot file is missing", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    await unlink(
      path.join(root, contractRootPath, manifest.schemas[0].snapshotPath),
    );

    await expect(
      verifyCmsContract({ repositoryRoot: root }),
    ).rejects.toThrow(/missing/i);
  });

  test("fails when the snapshot contains an undeclared file", async () => {
    const root = await seedTemporaryRepository();
    await writeFile(
      path.join(root, contractRootPath, "samples/undeclared.json"),
      "{}\n",
    );

    await expect(
      verifyCmsContract({ repositoryRoot: root }),
    ).rejects.toThrow(/extra/i);
  });

  test("fails when a snapshot file is tampered", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const snapshot = path.join(
      root,
      contractRootPath,
      manifest.schemas[0].snapshotPath,
    );
    await writeFile(snapshot, `${await readFile(snapshot, "utf8")} `);

    await expect(
      verifyCmsContract({ repositoryRoot: root }),
    ).rejects.toThrow(/sha-256/i);
  });

  test("fails closed on a manifest path traversal", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    manifest.schemas[0].snapshotPath = "../escape.json";
    await writeManifest(root, manifest);

    await expect(
      verifyCmsContract({ repositoryRoot: root }),
    ).rejects.toThrow(/unsafe|traversal/i);
  });

  test("fails closed on an unknown local schema reference", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const entry = manifest.schemas.find(({ snapshotPath }) =>
      snapshotPath.endsWith("/page.v3.schema.json"),
    );
    expect(entry).toBeDefined();

    const snapshot = path.join(root, contractRootPath, entry!.snapshotPath);
    const sourcePath = path.join(root, entry!.sourcePath);
    const schema = JSON.parse(await readFile(snapshot, "utf8")) as Record<
      string,
      unknown
    >;
    schema.__unknownContractReference = {
      $ref: "unknown.schema.json",
    };
    const bytes = Buffer.from(`${JSON.stringify(schema, null, 2)}\n`);

    await writeFile(snapshot, bytes);
    await writeFile(sourcePath, bytes);
    entry!.sha256 = sha256(bytes);
    await writeManifest(root, manifest);

    await expect(
      verifyCmsContract({ repositoryRoot: root }),
    ).rejects.toThrow(/unknown local \$ref/i);
  });
});
