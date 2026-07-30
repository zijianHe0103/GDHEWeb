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

import { afterEach, describe, expect, test } from "vitest";

// @ts-expect-error The Node-built verifier intentionally has no TypeScript declaration.
import verifyProductCardContract from "../scripts/verify-product-card-contract.mjs";

type DirectEntry = {
  sourcePath: string;
  snapshotPath: string;
  sha256: string;
};

type ProductCardManifest = {
  sourceAuthority: {
    manifestPath: string;
    checksumsPath: string;
  };
  schemas: DirectEntry[];
  samples: {
    success: Array<DirectEntry & { name: string }>;
    errors: {
      sourcePath: string;
      snapshotPath: string;
    };
  };
};

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const contractRootPath = "frontend/src/lib/cms/product-card-contract";
const temporaryRoots: string[] = [];

async function readManifest(root: string): Promise<ProductCardManifest> {
  return JSON.parse(
    await readFile(path.join(root, contractRootPath, "manifest.json"), "utf8"),
  ) as ProductCardManifest;
}

async function writeManifest(
  root: string,
  manifest: ProductCardManifest,
): Promise<void> {
  await writeFile(
    path.join(root, contractRootPath, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function seedTemporaryRepository(): Promise<string> {
  const root = await mkdtemp(
    path.join(tmpdir(), "gdhe-product-card-contract-"),
  );
  temporaryRoots.push(root);

  await mkdir(path.join(root, "frontend/src/lib/cms"), { recursive: true });
  await cp(
    path.join(repositoryRoot, contractRootPath),
    path.join(root, contractRootPath),
    { recursive: true },
  );

  const manifest = await readManifest(repositoryRoot);
  const sourcePaths = new Set([
    manifest.sourceAuthority.manifestPath,
    manifest.sourceAuthority.checksumsPath,
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

async function expectStableFailure(
  root: string,
  pattern: RegExp,
): Promise<void> {
  const error = await verifyProductCardContract({
    repositoryRoot: root,
  }).catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toMatch(pattern);
  expect((error as Error).message).not.toContain(root);
  const macOSUserRoot = [path.sep, "Users", path.sep].join("");
  expect((error as Error).message).not.toContain(macOSUserRoot);
}

async function addSchemaReference(
  root: string,
  reference: string,
): Promise<void> {
  const schemaPath = path.join(
    root,
    contractRootPath,
    "schemas/product-card-collection.v1.schema.json",
  );
  const schema = JSON.parse(await readFile(schemaPath, "utf8")) as Record<
    string,
    unknown
  >;
  schema.__mutation = { $ref: reference };
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
}

describe("ProductCard contract snapshot verifier", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryRoots.splice(0).map((root) =>
        rm(root, { recursive: true, force: true }),
      ),
    );
  });

  test("accepts the frozen TASK-014 ProductCard contract", async () => {
    const root = await seedTemporaryRepository();

    await expect(
      verifyProductCardContract({ repositoryRoot: root }),
    ).resolves.toEqual({
      errorSamples: 6,
      schemas: 8,
      successSamples: 3,
    });
  });

  test("rejects a substituted schema authority path", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const entry = manifest.schemas[0];
    const roguePath = `${entry.sourcePath}.rogue`;
    await cp(path.join(root, entry.sourcePath), path.join(root, roguePath));
    entry.sourcePath = roguePath;
    await writeManifest(root, manifest);

    await expectStableFailure(root, /canonical schema authority/i);
  });

  test("rejects substituted TASK-014 authority paths", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const roguePath = `${manifest.sourceAuthority.manifestPath}.rogue`;
    await cp(
      path.join(root, manifest.sourceAuthority.manifestPath),
      path.join(root, roguePath),
    );
    manifest.sourceAuthority.manifestPath = roguePath;
    await writeManifest(root, manifest);

    await expectStableFailure(root, /frozen TASK-014 authority/i);
  });

  test("rejects a substituted TASK-014 checksum authority path", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const roguePath = `${manifest.sourceAuthority.checksumsPath}.rogue`;
    await cp(
      path.join(root, manifest.sourceAuthority.checksumsPath),
      path.join(root, roguePath),
    );
    manifest.sourceAuthority.checksumsPath = roguePath;
    await writeManifest(root, manifest);

    await expectStableFailure(root, /frozen TASK-014 authority/i);
  });

  test("rejects TASK-014 authority manifest source drift", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const authorityPath = path.join(
      root,
      manifest.sourceAuthority.manifestPath,
    );
    await writeFile(
      authorityPath,
      `${await readFile(authorityPath, "utf8")} `,
    );

    await expectStableFailure(root, /authority manifest SHA-256 mismatch/i);
  });

  test("rejects a missing snapshot file", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    await unlink(
      path.join(root, contractRootPath, manifest.schemas[0].snapshotPath),
    );

    await expectStableFailure(root, /missing snapshot files/i);
  });

  test("rejects an extra snapshot file", async () => {
    const root = await seedTemporaryRepository();
    await writeFile(
      path.join(root, contractRootPath, "samples/extra.json"),
      "{}\n",
    );

    await expectStableFailure(root, /extra snapshot files/i);
  });

  test("rejects a tampered snapshot byte", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const snapshotPath = path.join(
      root,
      contractRootPath,
      manifest.samples.success[0].snapshotPath,
    );
    await writeFile(
      snapshotPath,
      `${await readFile(snapshotPath, "utf8")} `,
    );

    await expectStableFailure(root, /snapshot SHA-256 mismatch/i);
  });

  test("rejects manifest path traversal", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    manifest.schemas[0].snapshotPath = "../escape.json";
    await writeManifest(root, manifest);

    await expectStableFailure(root, /canonical snapshot identity|traversal/i);
  });

  test("rejects a traversing local schema reference", async () => {
    const root = await seedTemporaryRepository();
    await addSchemaReference(root, "../escape.schema.json");

    await expectStableFailure(root, /escapes schema root/i);
  });

  test("rejects a remote schema reference", async () => {
    const root = await seedTemporaryRepository();
    await addSchemaReference(
      root,
      "https://example.invalid/remote.schema.json",
    );

    await expectStableFailure(root, /remote \$ref is forbidden/i);
  });

  test("rejects an unknown local schema reference", async () => {
    const root = await seedTemporaryRepository();
    await addSchemaReference(root, "unknown.schema.json");

    await expectStableFailure(root, /unknown local \$ref target/i);
  });

  test("rejects direct authority source drift", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const sourcePath = path.join(root, manifest.schemas[0].sourcePath);
    await writeFile(sourcePath, `${await readFile(sourcePath, "utf8")} `);

    await expectStableFailure(root, /source SHA-256 mismatch/i);
  });
});
