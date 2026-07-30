import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT_ROOT = "frontend/src/lib/cms/product-card-contract";
const MANIFEST_PATH = `${CONTRACT_ROOT}/manifest.json`;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

const AUTHORITY = Object.freeze({
  task: "TASK-014",
  handoff: "TASK-014-PRODUCT-CARD-1",
  manifestPath:
    "TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_MANIFEST.json",
  manifestSha256:
    "aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb",
  checksumsPath:
    "TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256",
  checksumsSha256:
    "c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883",
});

const SCHEMA_NAMES = Object.freeze([
  "card-action.v1.schema.json",
  "card-attribute.v1.schema.json",
  "product-card-collection.v1.schema.json",
  "product-card.v1.schema.json",
  "public-path.schema.json",
  "public-protected-media.v1.schema.json",
  "public-taxonomy-ref.v1.schema.json",
  "uuid-v4.schema.json",
]);

const SUCCESS_IDENTITIES = Object.freeze([
  {
    name: "all",
    sourcePath:
      "TASKS/ARTIFACTS/TASK-014/golden-product-card/all.json",
    snapshotPath: "samples/success/all.json",
  },
  {
    name: "empty",
    sourcePath:
      "TASKS/ARTIFACTS/TASK-014/golden-product-card/filtered-empty.json",
    snapshotPath: "samples/success/filtered-empty.json",
  },
  {
    name: "one",
    sourcePath:
      "TASKS/ARTIFACTS/TASK-014/golden-product-card/one-item.json",
    snapshotPath: "samples/success/one-item.json",
  },
]);

const ERROR_IDENTITY = Object.freeze({
  sourcePath:
    "TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_ERROR_FIXTURES.json",
  sourceSha256:
    "c1c65c21daef313f31b0d0f8a6a0640b6507be7c534e04af864bfc9f0ffae0e9",
  snapshotPath: "samples/errors/product-card-errors.json",
  selectors: [
    "filter-taxonomy",
    "locale",
    "page-native-overflow",
    "schema",
    "sort",
    "unknown-parameter",
  ],
  expected: [
    {
      selector: "filter-taxonomy",
      code: "gdhe_invalid_filter",
      status: 400,
    },
    {
      selector: "locale",
      code: "gdhe_invalid_locale",
      status: 400,
    },
    {
      selector: "page-native-overflow",
      code: "gdhe_invalid_pagination",
      status: 400,
    },
    {
      selector: "schema",
      code: "gdhe_invalid_schema",
      status: 400,
    },
    {
      selector: "sort",
      code: "gdhe_invalid_sort",
      status: 400,
    },
    {
      selector: "unknown-parameter",
      code: "gdhe_invalid_parameter",
      status: 400,
    },
  ],
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function assertExactKeys(value, expected, label) {
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  invariant(
    JSON.stringify(actual) === JSON.stringify(sortedExpected),
    `${label} has an unexpected shape`,
  );
}

function assertSafeRelativePath(value, label) {
  invariant(
    typeof value === "string" && value.length > 0,
    `${label} is empty`,
  );
  invariant(!value.includes("\\"), `${label} uses an unsafe backslash`);
  invariant(
    !path.posix.isAbsolute(value),
    `${label} is an unsafe absolute path`,
  );
  invariant(
    value
      .split("/")
      .every(
        (segment) =>
          segment.length > 0 && segment !== "." && segment !== "..",
      ),
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
  invariant(
    typeof value === "string" && SHA256_PATTERN.test(value),
    `${label} is not a lowercase SHA-256`,
  );
}

function assertSortedUnique(values, label) {
  const sorted = [...values].sort();
  invariant(
    values.length === new Set(values).size,
    `${label} contains duplicate values`,
  );
  invariant(
    values.every((value, index) => value === sorted[index]),
    `${label} is not sorted`,
  );
}

async function inventoryFiles(directory, prefix = "") {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    throw new Error(`missing snapshot root`);
  }
  const files = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await inventoryFiles(absolutePath, relativePath));
    } else {
      invariant(
        entry.isFile(),
        `unsupported snapshot entry: ${relativePath}`,
      );
      files.push(relativePath);
    }
  }
  return files;
}

async function readBytes(absolutePath, label) {
  try {
    return await readFile(absolutePath);
  } catch {
    throw new Error(`missing ${label}`);
  }
}

async function readJson(absolutePath, label) {
  const bytes = await readBytes(absolutePath, label);
  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    throw new Error(`invalid JSON in ${label}`);
  }
}

function assertEntry(entry, label) {
  assertExactKeys(
    entry,
    ["sourcePath", "snapshotPath", "sha256"],
    label,
  );
  assertSafeRelativePath(entry.sourcePath, `${label}.sourcePath`);
  assertSafeRelativePath(entry.snapshotPath, `${label}.snapshotPath`);
  assertSha256(entry.sha256, `${label}.sha256`);
}

function validateManifest(manifest) {
  assertExactKeys(
    manifest,
    [
      "manifestVersion",
      "sourceAuthority",
      "restApiVersion",
      "contentSchemaVersion",
      "productCardSchemaVersion",
      "endpoint",
      "roots",
      "schemas",
      "samples",
    ],
    "manifest",
  );
  invariant(manifest.manifestVersion === "1", "manifestVersion must be 1");
  assertExactKeys(
    manifest.sourceAuthority,
    [
      "task",
      "handoff",
      "manifestPath",
      "manifestSha256",
      "checksumsPath",
      "checksumsSha256",
    ],
    "sourceAuthority",
  );
  invariant(
    JSON.stringify(manifest.sourceAuthority) === JSON.stringify(AUTHORITY),
    "sourceAuthority must match the frozen TASK-014 authority",
  );
  invariant(manifest.restApiVersion === "1", "restApiVersion must be 1");
  invariant(
    manifest.contentSchemaVersion === "3.0.0",
    "contentSchemaVersion must be 3.0.0",
  );
  invariant(
    manifest.productCardSchemaVersion === "1.0.0",
    "productCardSchemaVersion must be 1.0.0",
  );
  invariant(
    manifest.endpoint === "/wp-json/gdhe/v1/product-cards",
    "endpoint must match the frozen ProductCard endpoint",
  );
  invariant(
    JSON.stringify(manifest.roots) ===
      JSON.stringify(["product-card-collection.v1.schema.json"]),
    "roots must contain the frozen ProductCard collection root",
  );

  invariant(
    Array.isArray(manifest.schemas) && manifest.schemas.length === 8,
    "schemas must contain exactly 8 entries",
  );
  manifest.schemas.forEach((entry, index) => {
    assertEntry(entry, `schemas[${index}]`);
    const expectedName = SCHEMA_NAMES[index];
    invariant(
      entry.sourcePath ===
        `cms/wp-content/plugins/gdhe-site/config/schemas/${expectedName}`,
      `schemas[${index}].sourcePath must match canonical schema authority`,
    );
    invariant(
      entry.snapshotPath === `schemas/${expectedName}`,
      `schemas[${index}].snapshotPath must match canonical snapshot identity`,
    );
  });
  assertSortedUnique(
    manifest.schemas.map((entry) => entry.sourcePath),
    "schema source paths",
  );
  assertSortedUnique(
    manifest.schemas.map((entry) => entry.snapshotPath),
    "schema snapshot paths",
  );

  assertExactKeys(manifest.samples, ["success", "errors"], "samples");
  invariant(
    Array.isArray(manifest.samples.success) &&
      manifest.samples.success.length === 3,
    "success samples must contain exactly 3 entries",
  );
  manifest.samples.success.forEach((entry, index) => {
    assertExactKeys(
      entry,
      ["name", "sourcePath", "snapshotPath", "sha256"],
      `samples.success[${index}]`,
    );
    assertSafeRelativePath(
      entry.sourcePath,
      `samples.success[${index}].sourcePath`,
    );
    assertSafeRelativePath(
      entry.snapshotPath,
      `samples.success[${index}].snapshotPath`,
    );
    assertSha256(entry.sha256, `samples.success[${index}].sha256`);
    const identity = SUCCESS_IDENTITIES[index];
    invariant(
      entry.name === identity.name &&
        entry.sourcePath === identity.sourcePath &&
        entry.snapshotPath === identity.snapshotPath,
      `samples.success[${index}] must match its frozen authority identity`,
    );
  });
  assertSortedUnique(
    manifest.samples.success.map((entry) => entry.sourcePath),
    "success source paths",
  );
  assertSortedUnique(
    manifest.samples.success.map((entry) => entry.snapshotPath),
    "success snapshot paths",
  );

  const errors = manifest.samples.errors;
  assertExactKeys(
    errors,
    [
      "sourcePath",
      "sourceSha256",
      "snapshotPath",
      "selectors",
      "expected",
      "sha256",
    ],
    "samples.errors",
  );
  assertSafeRelativePath(errors.sourcePath, "samples.errors.sourcePath");
  assertSafeRelativePath(errors.snapshotPath, "samples.errors.snapshotPath");
  assertSha256(errors.sourceSha256, "samples.errors.sourceSha256");
  assertSha256(errors.sha256, "samples.errors.sha256");
  invariant(
    errors.sourcePath === ERROR_IDENTITY.sourcePath &&
      errors.sourceSha256 === ERROR_IDENTITY.sourceSha256 &&
      errors.snapshotPath === ERROR_IDENTITY.snapshotPath &&
      JSON.stringify(errors.selectors) ===
        JSON.stringify(ERROR_IDENTITY.selectors) &&
      JSON.stringify(errors.expected) ===
        JSON.stringify(ERROR_IDENTITY.expected),
    "error sample identity must match the frozen TASK-014 selection",
  );

  const snapshotPaths = [
    ...manifest.schemas.map((entry) => entry.snapshotPath),
    ...manifest.samples.success.map((entry) => entry.snapshotPath),
    errors.snapshotPath,
  ];
  invariant(
    snapshotPaths.length === new Set(snapshotPaths).size,
    "snapshot paths contain duplicate values",
  );
}

function parseAuthorityChecksums(bytes) {
  const lines = bytes.toString("utf8").trimEnd().split("\n");
  const entries = lines.map((line, index) => {
    const match = /^([0-9a-f]{64})  ([^\r\n]+)$/.exec(line);
    invariant(match, `authority checksum line ${index + 1} is invalid`);
    assertSafeRelativePath(match[2], `authority checksum path ${index + 1}`);
    return [match[2], match[1]];
  });
  const paths = entries.map(([entryPath]) => entryPath);
  assertSortedUnique(paths, "authority checksum paths");
  invariant(entries.length === 25, "authority checksums must contain 25 entries");
  return Object.fromEntries(entries);
}

function validateAuthority(authorityManifest, checksums, manifest) {
  invariant(
    authorityManifest.handoffVersion === AUTHORITY.handoff,
    "authority handoff identity drift",
  );
  invariant(
    authorityManifest.restApiVersion === manifest.restApiVersion &&
      authorityManifest.contentSchemaVersion ===
        manifest.contentSchemaVersion &&
      authorityManifest.productCardSchemaVersion ===
        manifest.productCardSchemaVersion &&
      authorityManifest.endpoint === manifest.endpoint,
    "authority version or endpoint drift",
  );
  invariant(
    JSON.stringify(authorityManifest.schemaClosureFiles) ===
      JSON.stringify(manifest.schemas.map((entry) => entry.sourcePath)),
    "authority schema closure drift",
  );
  invariant(
    authorityManifest.checksums !== null &&
      typeof authorityManifest.checksums === "object" &&
      !Array.isArray(authorityManifest.checksums),
    "authority manifest checksums are invalid",
  );
  invariant(
    JSON.stringify(Object.entries(checksums).sort()) ===
      JSON.stringify(Object.entries(authorityManifest.checksums).sort()),
    "authority checksum file and manifest disagree",
  );
  invariant(
    authorityManifest.invariants?.oneCollectionRequest === true &&
      authorityManifest.invariants?.perCardResolveRequests === 0 &&
      authorityManifest.invariants?.anonymousReadOnly === true &&
      authorityManifest.invariants?.publicDatabaseIdentifiers === false,
    "authority ProductCard invariants drift",
  );

  for (const entry of manifest.schemas) {
    invariant(
      checksums[entry.sourcePath] === entry.sha256,
      "schema entry does not match authority checksum",
    );
  }
  for (const entry of manifest.samples.success) {
    invariant(
      authorityManifest.goldenFiles.includes(entry.sourcePath) &&
        checksums[entry.sourcePath] === entry.sha256,
      "success entry does not match authority checksum",
    );
  }
  invariant(
    checksums[manifest.samples.errors.sourcePath] ===
      manifest.samples.errors.sourceSha256,
    "error source does not match authority checksum",
  );
}

async function verifyDirectEntry(repositoryRoot, contractRoot, entry, label) {
  const snapshotPath = resolveWithin(
    contractRoot,
    entry.snapshotPath,
    `${label}.snapshotPath`,
  );
  const sourcePath = resolveWithin(
    repositoryRoot,
    entry.sourcePath,
    `${label}.sourcePath`,
  );
  const snapshotBytes = await readBytes(snapshotPath, `${label} snapshot`);
  const sourceBytes = await readBytes(sourcePath, `${label} source`);
  invariant(
    sha256(snapshotBytes) === entry.sha256,
    `${label} snapshot SHA-256 mismatch`,
  );
  invariant(
    sha256(sourceBytes) === entry.sha256,
    `${label} source SHA-256 mismatch`,
  );
  invariant(
    snapshotBytes.equals(sourceBytes),
    `${label} source/snapshot byte parity mismatch`,
  );
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

async function calculateClosure(contractRoot, manifest) {
  const schemaRoot = path.join(contractRoot, "schemas");
  const declared = new Set(SCHEMA_NAMES);
  const visited = new Set();

  async function visit(schemaPath) {
    if (visited.has(schemaPath)) return;
    invariant(declared.has(schemaPath), `unknown local $ref target: ${schemaPath}`);
    visited.add(schemaPath);
    const absolutePath = resolveWithin(
      schemaRoot,
      schemaPath,
      `schema reference ${schemaPath}`,
    );
    const { value } = await readJson(absolutePath, `schema ${schemaPath}`);
    for (const reference of collectReferences(value)) {
      if (reference.startsWith("#")) continue;
      invariant(
        !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(reference) &&
          !reference.startsWith("//"),
        `remote $ref is forbidden in ${schemaPath}`,
      );
      invariant(
        !reference.includes("\\"),
        `backslash $ref is forbidden in ${schemaPath}`,
      );
      const targetPart = reference.split("#", 1)[0];
      invariant(
        targetPart.length > 0,
        `invalid local $ref in ${schemaPath}`,
      );
      const resolved = path.posix.normalize(
        path.posix.join(path.posix.dirname(schemaPath), targetPart),
      );
      invariant(
        resolved !== ".." &&
          !resolved.startsWith("../") &&
          !path.posix.isAbsolute(resolved),
        `local $ref escapes schema root in ${schemaPath}`,
      );
      invariant(
        declared.has(resolved),
        `unknown local $ref target: ${resolved}`,
      );
      await visit(resolved);
    }
  }

  for (const root of manifest.roots) await visit(root);
  const closure = [...visited].sort();
  invariant(
    JSON.stringify(closure) === JSON.stringify(SCHEMA_NAMES),
    `schema closure mismatch: expected 8, found ${closure.length}`,
  );
}

function assertSuccessProofs(samples, manifest) {
  for (const [name, sample] of Object.entries(samples)) {
    invariant(
      sample.apiVersion === manifest.restApiVersion &&
        sample.schemaVersion === manifest.productCardSchemaVersion &&
        sample.locale === "en" &&
        sample.type === "product_card",
      `success sample ${name} identity drift`,
    );
  }

  invariant(
    samples.empty.items.length === 0 && samples.empty.total === 0,
    "empty success sample must prove zero items",
  );
  invariant(
    samples.one.items.length === 1 &&
      samples.one.total === 4 &&
      samples.one.totalPages === 4,
    "one success sample must prove one item and frozen totals",
  );
  invariant(
    samples.one.items[0].series.length > 0 &&
      samples.one.items[0].applications.length > 0,
    "one success sample must prove non-empty relations",
  );
  invariant(
    samples.all.items.length > 1,
    "all success sample must prove multiple items",
  );

  const actions = new Map(
    samples.all.items.map((item) => [
      `${item.kind}:${item.lifecycle}`,
      item.action.mode,
    ]),
  );
  invariant(
    actions.get("detail_product:active") === "view_product" &&
      actions.get("detail_product:discontinued") === "view_product" &&
      actions.get("catalog_accessory:active") === "direct_rfq" &&
      actions.get("catalog_accessory:discontinued") ===
        "replacement_contact",
    "success samples do not prove all four action cells",
  );
}

export async function verifyProductCardContract(options = {}) {
  const repositoryRoot = path.resolve(
    options.repositoryRoot ??
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  );
  const contractRoot = resolveWithin(
    repositoryRoot,
    CONTRACT_ROOT,
    "contract root",
  );
  const { value: manifest } = await readJson(
    resolveWithin(repositoryRoot, MANIFEST_PATH, "manifest path"),
    "ProductCard contract manifest",
  );
  validateManifest(manifest);

  const authorityManifestPath = resolveWithin(
    repositoryRoot,
    AUTHORITY.manifestPath,
    "authority manifest path",
  );
  const { bytes: authorityManifestBytes, value: authorityManifest } =
    await readJson(authorityManifestPath, "TASK-014 handoff manifest");
  invariant(
    sha256(authorityManifestBytes) === AUTHORITY.manifestSha256,
    "TASK-014 authority manifest SHA-256 mismatch",
  );

  const authorityChecksumsPath = resolveWithin(
    repositoryRoot,
    AUTHORITY.checksumsPath,
    "authority checksums path",
  );
  const authorityChecksumsBytes = await readBytes(
    authorityChecksumsPath,
    "TASK-014 handoff checksums",
  );
  invariant(
    sha256(authorityChecksumsBytes) === AUTHORITY.checksumsSha256,
    "TASK-014 authority checksums SHA-256 mismatch",
  );
  const authorityChecksums = parseAuthorityChecksums(authorityChecksumsBytes);
  validateAuthority(authorityManifest, authorityChecksums, manifest);

  const expectedFiles = [
    "manifest.json",
    ...manifest.schemas.map((entry) => entry.snapshotPath),
    ...manifest.samples.success.map((entry) => entry.snapshotPath),
    manifest.samples.errors.snapshotPath,
  ].sort();
  const actualFiles = await inventoryFiles(contractRoot);
  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  invariant(
    missing.length === 0,
    `missing snapshot files: ${missing.join(", ")}`,
  );
  invariant(
    extra.length === 0,
    `extra snapshot files: ${extra.join(", ")}`,
  );

  await calculateClosure(contractRoot, manifest);

  for (const [index, entry] of manifest.schemas.entries()) {
    await verifyDirectEntry(
      repositoryRoot,
      contractRoot,
      entry,
      `schemas[${index}]`,
    );
  }
  for (const [index, entry] of manifest.samples.success.entries()) {
    await verifyDirectEntry(
      repositoryRoot,
      contractRoot,
      entry,
      `samples.success[${index}]`,
    );
  }

  const successSamples = {};
  for (const entry of manifest.samples.success) {
    const { value } = await readJson(
      resolveWithin(
        contractRoot,
        entry.snapshotPath,
        `success sample ${entry.name}`,
      ),
      `success sample ${entry.name}`,
    );
    successSamples[entry.name] = value;
  }
  assertSuccessProofs(successSamples, manifest);

  const errors = manifest.samples.errors;
  const { bytes: errorSourceBytes, value: errorSource } = await readJson(
    resolveWithin(repositoryRoot, errors.sourcePath, "error source path"),
    "ProductCard error authority",
  );
  invariant(
    sha256(errorSourceBytes) === errors.sourceSha256,
    "error source container SHA-256 mismatch",
  );
  const selectedErrors = Object.fromEntries(
    errors.selectors.map((selector) => {
      invariant(
        Object.hasOwn(errorSource, selector),
        `missing selected error: ${selector}`,
      );
      return [selector, errorSource[selector]];
    }),
  );
  const rebuiltBytes = Buffer.from(`${JSON.stringify(selectedErrors, null, 2)}\n`);
  const { bytes: errorSnapshotBytes, value: errorSnapshot } = await readJson(
    resolveWithin(contractRoot, errors.snapshotPath, "error snapshot path"),
    "ProductCard error snapshot",
  );
  invariant(
    sha256(errorSnapshotBytes) === errors.sha256,
    "error snapshot SHA-256 mismatch",
  );
  invariant(
    rebuiltBytes.equals(errorSnapshotBytes),
    "error snapshot deterministic byte parity mismatch",
  );
  invariant(
    JSON.stringify(Object.keys(errorSnapshot)) ===
      JSON.stringify(errors.selectors),
    "error snapshot selectors mismatch",
  );
  for (const expected of errors.expected) {
    const sample = errorSnapshot[expected.selector];
    invariant(
      sample?.apiVersion === manifest.restApiVersion &&
        sample?.code === expected.code &&
        sample?.status === expected.status,
      `error sample ${expected.selector} expectation drift`,
    );
  }

  return {
    errorSamples: errors.selectors.length,
    schemas: manifest.schemas.length,
    successSamples: manifest.samples.success.length,
  };
}

export default verifyProductCardContract;

const isCli = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  try {
    const summary = await verifyProductCardContract();
    console.log(
      `ProductCard contract snapshot PASS: ${summary.schemas} schemas, ${summary.successSamples} success samples, ${summary.errorSamples} error samples`,
    );
  } catch (error) {
    console.error(`ProductCard contract snapshot FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
