import {
  cp,
  mkdir,
  mkdtemp,
  realpath,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

// @ts-expect-error The Node-built verifier intentionally has no declaration.
import verifyProductConfigurationContract from "../scripts/verify-product-configuration-contract.mjs";

type Entry = {
  sourcePath: string;
  snapshotPath: string;
  sha256: string;
};

type Manifest = {
  sourceAuthority: {
    manifestPath: string;
    checksumsPath: string;
  };
  endpoint: string;
  query: Record<string, unknown>;
  productConfigurationSchemaVersion: string;
  schemas: Entry[];
  samples: {
    success: Array<Entry & { name: string }>;
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
const contractRootPath =
  "frontend/src/lib/cms/product-configuration-contract";
const temporaryRoots: string[] = [];

async function readManifest(root: string): Promise<Manifest> {
  return JSON.parse(
    await readFile(path.join(root, contractRootPath, "manifest.json"), "utf8"),
  ) as Manifest;
}

async function writeManifest(root: string, manifest: Manifest): Promise<void> {
  await writeFile(
    path.join(root, contractRootPath, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function seedTemporaryRepository(): Promise<string> {
  const root = await realpath(await mkdtemp(
    path.join(tmpdir(), "gdhe-product-configuration-contract-"),
  ));
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
  const checksumSource = await readFile(
    path.join(repositoryRoot, manifest.sourceAuthority.checksumsPath),
    "utf8",
  );
  for (const line of checksumSource.trim().split("\n")) {
    sourcePaths.add(line.slice(66));
  }
  for (const sourcePath of sourcePaths) {
    const target = path.join(root, sourcePath);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(repositoryRoot, sourcePath), target);
  }
  return root;
}

async function replaceFileWithSymlink(
  root: string,
  relative: string,
): Promise<void> {
  const target = path.join(root, relative);
  const substitute = `${target}.substitute`;
  await cp(target, substitute);
  await unlink(target);
  await symlink(path.basename(substitute), target);
}

async function replaceDirectoryWithSymlink(
  root: string,
  relative: string,
): Promise<void> {
  const target = path.join(root, relative);
  const substitute = `${target}.substitute`;
  await cp(target, substitute, { recursive: true });
  await rm(target, { recursive: true });
  await symlink(path.basename(substitute), target, "dir");
}

async function expectStableFailure(
  root: string,
  pattern: RegExp,
): Promise<void> {
  const error = await verifyProductConfigurationContract({
    repositoryRoot: root,
  }).catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toMatch(pattern);
  expect((error as Error).message).not.toContain(root);
  expect((error as Error).message).not.toContain("/Users/");
}

async function mutateSuccess(
  root: string,
  mutation: (sample: Record<string, unknown>) => void,
): Promise<void> {
  const samplePath = path.join(
    root,
    contractRootPath,
    "samples/success/fgd-x15-pvc.json",
  );
  const sample = JSON.parse(await readFile(samplePath, "utf8")) as Record<
    string,
    unknown
  >;
  mutation(sample);
  await writeFile(samplePath, `${JSON.stringify(sample, null, 2)}\n`);
}

async function addSchemaReference(
  root: string,
  reference: string,
): Promise<void> {
  const schemaPath = path.join(
    root,
    contractRootPath,
    "schemas/product-configuration.v1.schema.json",
  );
  const schema = JSON.parse(await readFile(schemaPath, "utf8")) as Record<
    string,
    unknown
  >;
  schema.__mutation = { $ref: reference };
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
}

describe("Product Configuration contract snapshot verifier", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryRoots.splice(0).map((root) =>
        rm(root, { recursive: true, force: true }),
      ),
    );
  });

  test("accepts the frozen TASK-019 Product Configuration authority", async () => {
    const root = await seedTemporaryRepository();
    await expect(
      verifyProductConfigurationContract({ repositoryRoot: root }),
    ).resolves.toEqual({ errorSamples: 6, schemas: 4, successSamples: 1 });
  });

  test("rejects substituted authority paths with identical bytes", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const rogue = `${manifest.sourceAuthority.manifestPath}.rogue`;
    await cp(
      path.join(root, manifest.sourceAuthority.manifestPath),
      path.join(root, rogue),
    );
    manifest.sourceAuthority.manifestPath = rogue;
    await writeManifest(root, manifest);
    await expectStableFailure(root, /frozen TASK-019 authority/i);
  });

  test("rejects a symlinked repository root", async () => {
    const root = await seedTemporaryRepository();
    const linkedRoot = `${root}-linked`;
    temporaryRoots.push(linkedRoot);
    await symlink(root, linkedRoot, "dir");

    await expectStableFailure(linkedRoot, /canonical|symlink|identity/i);
  });

  test.each([
    ["handoff manifest", async (root: string, manifest: Manifest) => {
      await replaceFileWithSymlink(root, manifest.sourceAuthority.manifestPath);
    }],
    ["checksum authority", async (root: string, manifest: Manifest) => {
      await replaceFileWithSymlink(root, manifest.sourceAuthority.checksumsPath);
    }],
    ["checksum-listed source", async (root: string) => {
      await replaceFileWithSymlink(
        root,
        "cms/wp-content/plugins/gdhe-site/includes/product-configurations.php",
      );
    }],
    ["Schema source", async (root: string, manifest: Manifest) => {
      await replaceFileWithSymlink(root, manifest.schemas[0].sourcePath);
    }],
    ["success source", async (root: string, manifest: Manifest) => {
      await replaceFileWithSymlink(root, manifest.samples.success[0].sourcePath);
    }],
    ["error source", async (root: string, manifest: Manifest) => {
      await replaceFileWithSymlink(root, manifest.samples.errors.sourcePath);
    }],
    ["intermediate authority segment", async (root: string) => {
      await replaceDirectoryWithSymlink(
        root,
        "TASKS/ARTIFACTS/TASK-019/golden-product-configuration",
      );
    }],
  ])("rejects byte-identical symlink substitution for %s", async (
    _label,
    substitute,
  ) => {
    const root = await seedTemporaryRepository();
    await substitute(root, await readManifest(root));
    await expectStableFailure(root, /canonical|symlink|identity/i);
  });

  test("rejects authority source drift", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    const authorityPath = path.join(
      root,
      manifest.sourceAuthority.manifestPath,
    );
    await writeFile(authorityPath, `${await readFile(authorityPath, "utf8")} `);
    await expectStableFailure(root, /authority manifest SHA-256 mismatch/i);
  });

  test("rejects missing, extra and tampered snapshot files", async () => {
    for (const mutation of ["missing", "extra", "tampered"] as const) {
      const root = await seedTemporaryRepository();
      const manifest = await readManifest(root);
      const target = path.join(
        root,
        contractRootPath,
        manifest.schemas[0].snapshotPath,
      );
      if (mutation === "missing") await unlink(target);
      if (mutation === "extra") {
        await writeFile(path.join(root, contractRootPath, "extra.json"), "{}\n");
      }
      if (mutation === "tampered") {
        await writeFile(target, `${await readFile(target, "utf8")} `);
      }
      await expectStableFailure(
        root,
        /snapshot inventory|snapshot SHA-256 mismatch/i,
      );
    }
  });

  test("rejects manifest traversal", async () => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    manifest.schemas[0].snapshotPath = "../escape.json";
    await writeManifest(root, manifest);
    await expectStableFailure(root, /canonical snapshot identity|traversal/i);
  });

  test.each([
    ["../escape.schema.json", /SHA-256|traversal|escapes schema root/i],
    ["https://example.invalid/schema.json", /SHA-256|remote \$ref is forbidden/i],
    ["unknown.schema.json", /SHA-256|unknown local \$ref target/i],
  ])("rejects unsafe or unknown $ref %s", async (reference, pattern) => {
    const root = await seedTemporaryRepository();
    await addSchemaReference(root, reference);
    await expectStableFailure(root, pattern);
  });

  test.each([
    ["endpoint", (manifest: Manifest) => { manifest.endpoint = "/rogue"; }],
    ["version", (manifest: Manifest) => { manifest.productConfigurationSchemaVersion = "2.0.0"; }],
    ["query", (manifest: Manifest) => { manifest.query.additionalParameters = true; }],
  ])("rejects an incorrect %s", async (_label, mutation) => {
    const root = await seedTemporaryRepository();
    const manifest = await readManifest(root);
    mutation(manifest);
    await writeManifest(root, manifest);
    await expectStableFailure(root, /endpoint|version|query/i);
  });

  test.each([
    ["second standard length", (sample: Record<string, unknown>) => {
      const options = sample.articleNumberOptions as Array<Record<string, unknown>>;
      options.push({ ...structuredClone(options[0]), articleNumber: "GDHEPRD000173", lengthMeters: 5 });
    }],
    ["duplicate Article Number", (sample: Record<string, unknown>) => {
      const options = sample.articleNumberOptions as Array<Record<string, unknown>>;
      options.push(structuredClone(options[0]));
    }],
    ["duplicate public choice", (sample: Record<string, unknown>) => {
      const options = sample.articleNumberOptions as Array<Record<string, unknown>>;
      options.push({ ...structuredClone(options[0]), articleNumber: "GDHEPRD000173" });
    }],
    ["guessed accessory", (sample: Record<string, unknown>) => {
      const policy = sample.configurationPolicy as Record<string, unknown>;
      const methods = policy.installationMethods as Array<Record<string, unknown>>;
      methods[0].optionalAccessory = { articleNumber: "GDHEPRD999999" };
    }],
    ["internal field", (sample: Record<string, unknown>) => {
      sample.internalCode = "must-not-leak";
    }],
    ["invalid packaging", (sample: Record<string, unknown>) => {
      const policy = sample.configurationPolicy as Record<string, unknown>;
      const packaging = policy.packaging as Record<string, unknown>;
      const base = packaging.basePackaging as Record<string, unknown>;
      base.options = ["standard", "carton"];
    }],
  ])("fails closed on %s mutation", async (_label, mutation) => {
    const root = await seedTemporaryRepository();
    await mutateSuccess(root, mutation);
    await expectStableFailure(root, /success sample SHA-256 mismatch/i);
  });
});
