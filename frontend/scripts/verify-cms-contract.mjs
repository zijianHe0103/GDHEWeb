import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT_ROOT = "frontend/src/lib/cms/contracts";
const MANIFEST_PATH = `${CONTRACT_ROOT}/manifest.json`;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSafeRelativePath(value, label) {
  invariant(typeof value === "string" && value.length > 0, `${label} is empty`);
  invariant(!value.includes("\\"), `${label} uses an unsafe backslash`);
  invariant(!path.posix.isAbsolute(value), `${label} is an unsafe absolute path`);
  invariant(
    value.split("/").every((segment) => segment.length > 0 && segment !== "." && segment !== ".."),
    `${label} contains unsafe traversal`,
  );
  return value;
}

function resolveWithin(root, relativePath, label) {
  assertSafeRelativePath(relativePath, label);
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, ...relativePath.split("/"));
  invariant(
    resolved === resolvedRoot || resolved.startsWith(`${resolvedRoot}${path.sep}`),
    `${label} escapes its root`,
  );
  return resolved;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function assertSha256(value, label) {
  invariant(typeof value === "string" && SHA256_PATTERN.test(value), `${label} is not a lowercase SHA-256`);
}

function assertSortedUnique(values, label) {
  const sorted = [...values].sort();
  invariant(values.length === new Set(values).size, `${label} contains duplicate values`);
  invariant(values.every((value, index) => value === sorted[index]), `${label} is not sorted`);
}

async function inventoryFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await inventoryFiles(absolutePath, relativePath));
    } else {
      invariant(entry.isFile(), `unsupported snapshot entry: ${relativePath}`);
      files.push(relativePath);
    }
  }
  return files;
}

function collectReferences(value, references = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectReferences(item, references);
  } else if (value !== null && typeof value === "object") {
    if (typeof value.$ref === "string") references.push(value.$ref);
    for (const [key, item] of Object.entries(value)) {
      if (key !== "$ref") collectReferences(item, references);
    }
  }
  return references;
}

function assertEntry(entry, label) {
  invariant(entry !== null && typeof entry === "object" && !Array.isArray(entry), `${label} is invalid`);
  assertSafeRelativePath(entry.sourcePath, `${label}.sourcePath`);
  assertSafeRelativePath(entry.snapshotPath, `${label}.snapshotPath`);
  assertSha256(entry.sha256, `${label}.sha256`);
}

function validateManifest(manifest) {
  invariant(manifest !== null && typeof manifest === "object" && !Array.isArray(manifest), "manifest must be an object");
  invariant(manifest.manifestVersion === "1", "manifestVersion must be 1");
  invariant(manifest.sourceTask === "TASK-007", "sourceTask must be TASK-007");
  invariant(manifest.apiVersion === "1", "apiVersion must be 1");
  invariant(manifest.contentSchemaVersion === "3.0.0", "contentSchemaVersion must be 3.0.0");
  invariant(Array.isArray(manifest.roots), "roots must be an array");
  invariant(
    JSON.stringify(manifest.roots) === JSON.stringify(["error.schema.json", "page.v3.schema.json"]),
    "roots must be the frozen error/page.v3 pair",
  );
  assertSortedUnique(manifest.roots, "roots");

  invariant(Array.isArray(manifest.schemas) && manifest.schemas.length === 16, "schemas must contain exactly 16 entries");
  manifest.schemas.forEach((entry, index) => assertEntry(entry, `schemas[${index}]`));
  manifest.schemas.forEach((entry, index) => {
    const schemaPath = entry.snapshotPath.startsWith("schemas/")
      ? entry.snapshotPath.slice("schemas/".length)
      : "";
    invariant(
      schemaPath.length > 0 &&
        entry.sourcePath ===
          `cms/wp-content/plugins/gdhe-site/config/schemas/${schemaPath}`,
      `schemas[${index}].sourcePath must match canonical schema authority`,
    );
  });
  assertSortedUnique(manifest.schemas.map((entry) => entry.snapshotPath), "schema snapshot paths");
  assertSortedUnique(manifest.schemas.map((entry) => entry.sourcePath), "schema source paths");

  invariant(manifest.samples !== null && typeof manifest.samples === "object", "samples is invalid");
  invariant(Array.isArray(manifest.samples.success) && manifest.samples.success.length === 2, "success samples must contain exactly two entries");
  manifest.samples.success.forEach((entry, index) => {
    assertEntry(entry, `samples.success[${index}]`);
    invariant(entry.name === "page" || entry.name === "product", `samples.success[${index}].name is invalid`);
    invariant(entry.type === entry.name, `samples.success[${index}].type must match name`);
  });
  assertSortedUnique(manifest.samples.success.map((entry) => entry.snapshotPath), "success sample snapshot paths");
  assertSortedUnique(manifest.samples.success.map((entry) => entry.sourcePath), "success sample source paths");

  invariant(
    JSON.stringify(
      manifest.samples.success.map(
        ({ name, type, sourcePath, snapshotPath }) => ({
          name,
          type,
          sourcePath,
          snapshotPath,
        }),
      ),
    ) ===
      JSON.stringify([
        {
          name: "page",
          type: "page",
          sourcePath:
            "TASKS/ARTIFACTS/TASK-007/golden-a3/resolve-home.json",
          snapshotPath: "samples/success/resolve-home.json",
        },
        {
          name: "product",
          type: "product",
          sourcePath:
            "TASKS/ARTIFACTS/TASK-007/golden-a3/resolve-product-alpha.json",
          snapshotPath: "samples/success/resolve-product-alpha.json",
        },
      ]),
    "success sample identities must match frozen Page/Product authorities",
  );
  const errors = manifest.samples.errors;
  invariant(errors !== null && typeof errors === "object" && !Array.isArray(errors), "error samples are invalid");
  assertSafeRelativePath(errors.sourcePath, "samples.errors.sourcePath");
  assertSafeRelativePath(errors.snapshotPath, "samples.errors.snapshotPath");
  assertSha256(errors.sourceSha256, "samples.errors.sourceSha256");
  invariant(
    errors.sourcePath ===
      "TASKS/ARTIFACTS/TASK-007/ERROR_CONTRACT_FIXTURES.json",
    "error sourcePath must match frozen authority",
  );
  invariant(
    errors.snapshotPath === "samples/errors/resolve-errors.json",
    "error snapshotPath must match frozen identity",
  );
  assertSha256(errors.sha256, "samples.errors.sha256");
  invariant(
    JSON.stringify(errors.selectors) === JSON.stringify(["gdhe_invalid_schema", "gdhe_not_found"]),
    "error selectors must be the frozen sorted pair",
  );
  invariant(
    JSON.stringify(errors.expected) === JSON.stringify([
      { code: "gdhe_invalid_schema", status: 400 },
      { code: "gdhe_not_found", status: 404 },
    ]),
    "error expectations do not match the frozen contract",
  );

  const allSnapshotPaths = [
    ...manifest.schemas.map((entry) => entry.snapshotPath),
    ...manifest.samples.success.map((entry) => entry.snapshotPath),
    errors.snapshotPath,
  ];
  invariant(allSnapshotPaths.length === new Set(allSnapshotPaths).size, "all snapshot paths contains duplicate values");
  invariant(!allSnapshotPaths.includes("manifest.json"), "manifest cannot declare itself");
}

async function readJson(absolutePath, label) {
  let bytes;
  try {
    bytes = await readFile(absolutePath);
  } catch (error) {
    throw new Error(`missing ${label}: ${error.message}`);
  }
  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch (error) {
    throw new Error(`invalid JSON in ${label}: ${error.message}`);
  }
}

async function verifyDirectEntry(repositoryRoot, contractRoot, entry, label) {
  const snapshotPath = resolveWithin(contractRoot, entry.snapshotPath, `${label}.snapshotPath`);
  const sourcePath = resolveWithin(repositoryRoot, entry.sourcePath, `${label}.sourcePath`);
  const snapshotBytes = await readFile(snapshotPath);
  const sourceBytes = await readFile(sourcePath);
  invariant(sha256(snapshotBytes) === entry.sha256, `${label} snapshot SHA-256 mismatch`);
  invariant(sha256(sourceBytes) === entry.sha256, `${label} source SHA-256 mismatch`);
  invariant(snapshotBytes.equals(sourceBytes), `${label} source/snapshot byte parity mismatch`);
}

async function calculateClosure(contractRoot, manifest) {
  const schemaRoot = path.join(contractRoot, "schemas");
  invariant(
    manifest.schemas.every((entry) => entry.snapshotPath.startsWith("schemas/")),
    "every schema snapshotPath must be under schemas/",
  );
  const declared = new Set(
    manifest.schemas.map((entry) => entry.snapshotPath.slice("schemas/".length)),
  );
  const visited = new Set();

  async function visit(schemaPath) {
    if (visited.has(schemaPath)) return;
    invariant(declared.has(schemaPath), `unknown local $ref target: ${schemaPath}`);
    visited.add(schemaPath);
    const absolutePath = resolveWithin(schemaRoot, schemaPath, `schema reference ${schemaPath}`);
    const { value } = await readJson(absolutePath, `schema ${schemaPath}`);
    for (const reference of collectReferences(value)) {
      if (reference.startsWith("#")) continue;
      invariant(
        !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(reference) && !reference.startsWith("//"),
        `remote $ref is forbidden in ${schemaPath}: ${reference}`,
      );
      invariant(!reference.includes("\\"), `backslash $ref is forbidden in ${schemaPath}: ${reference}`);
      const targetPart = reference.split("#", 1)[0];
      invariant(targetPart.length > 0, `invalid local $ref in ${schemaPath}: ${reference}`);
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(schemaPath), targetPart));
      invariant(
        resolved !== ".." && !resolved.startsWith("../") && !path.posix.isAbsolute(resolved),
        `local $ref escapes schema root in ${schemaPath}: ${reference}`,
      );
      invariant(declared.has(resolved), `unknown local $ref target: ${resolved}`);
      await visit(resolved);
    }
  }

  for (const root of manifest.roots) await visit(root);
  const closure = [...visited].sort();
  const expected = [...declared].sort();
  invariant(
    JSON.stringify(closure) === JSON.stringify(expected),
    `schema closure mismatch: expected ${expected.length}, found ${closure.length}`,
  );
}

export async function verifyCmsContract(options = {}) {
  const repositoryRoot = path.resolve(
    options.repositoryRoot ??
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  );
  const contractRoot = resolveWithin(repositoryRoot, CONTRACT_ROOT, "contract root");
  const { value: manifest } = await readJson(
    resolveWithin(repositoryRoot, MANIFEST_PATH, "manifest path"),
    "contract manifest",
  );
  validateManifest(manifest);

  const expectedFiles = [
    "manifest.json",
    ...manifest.schemas.map((entry) => entry.snapshotPath),
    ...manifest.samples.success.map((entry) => entry.snapshotPath),
    manifest.samples.errors.snapshotPath,
  ].sort();
  const actualFiles = await inventoryFiles(contractRoot);
  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  invariant(missing.length === 0, `missing snapshot files: ${missing.join(", ")}`);
  invariant(extra.length === 0, `extra snapshot files: ${extra.join(", ")}`);

  for (const [index, entry] of manifest.schemas.entries()) {
    await verifyDirectEntry(repositoryRoot, contractRoot, entry, `schemas[${index}]`);
  }
  for (const [index, entry] of manifest.samples.success.entries()) {
    await verifyDirectEntry(repositoryRoot, contractRoot, entry, `samples.success[${index}]`);
  }

  await calculateClosure(contractRoot, manifest);

  for (const [index, entry] of manifest.samples.success.entries()) {
    const samplePath = resolveWithin(contractRoot, entry.snapshotPath, `samples.success[${index}].snapshotPath`);
    const { value: sample } = await readJson(samplePath, `success sample ${entry.name}`);
    invariant(sample.apiVersion === manifest.apiVersion, `success sample ${entry.name} apiVersion mismatch`);
    invariant(sample.schemaVersion === manifest.contentSchemaVersion, `success sample ${entry.name} schemaVersion mismatch`);
    invariant(sample.type === entry.type, `success sample ${entry.name} type mismatch`);
  }

  const errors = manifest.samples.errors;
  const errorSourcePath = resolveWithin(repositoryRoot, errors.sourcePath, "samples.errors.sourcePath");
  const { bytes: sourceBytes, value: sourceContainer } = await readJson(errorSourcePath, "error source container");
  invariant(sha256(sourceBytes) === errors.sourceSha256, "error source container SHA-256 mismatch");
  const selectedErrors = Object.fromEntries(
    errors.selectors.map((selector) => {
      invariant(Object.hasOwn(sourceContainer, selector), `missing selected error: ${selector}`);
      return [selector, sourceContainer[selector]];
    }),
  );
  const rebuiltBytes = Buffer.from(`${JSON.stringify(selectedErrors, null, 2)}\n`);
  const errorSnapshotPath = resolveWithin(contractRoot, errors.snapshotPath, "samples.errors.snapshotPath");
  const { bytes: errorSnapshotBytes, value: errorSnapshot } = await readJson(errorSnapshotPath, "error snapshot");
  invariant(sha256(errorSnapshotBytes) === errors.sha256, "error snapshot SHA-256 mismatch");
  invariant(rebuiltBytes.equals(errorSnapshotBytes), "error snapshot deterministic byte parity mismatch");
  invariant(
    JSON.stringify(Object.keys(errorSnapshot)) === JSON.stringify(errors.selectors),
    "error snapshot selectors mismatch",
  );
  errors.expected.forEach(({ code, status }) => {
    const sample = errorSnapshot[code];
    invariant(sample?.apiVersion === manifest.apiVersion, `error sample ${code} apiVersion mismatch`);
    invariant(sample?.code === code, `error sample ${code} code mismatch`);
    invariant(sample?.status === status, `error sample ${code} status mismatch`);
  });

  return {
    errorSamples: errors.selectors.length,
    schemas: manifest.schemas.length,
    successSamples: manifest.samples.success.length,
  };
}

export default verifyCmsContract;

const isCli = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  try {
    const summary = await verifyCmsContract();
    console.log(
      `CMS contract snapshot PASS: ${summary.schemas} schemas, ${summary.successSamples} success samples, ${summary.errorSamples} error samples`,
    );
  } catch (error) {
    console.error(`CMS contract snapshot FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
