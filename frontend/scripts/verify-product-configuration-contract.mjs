import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT_ROOT = "frontend/src/lib/cms/product-configuration-contract";
const MANIFEST_PATH = `${CONTRACT_ROOT}/manifest.json`;
const SCHEMA_NAMES = Object.freeze([
  "article-number-option.v1.schema.json",
  "product-configuration.v1.schema.json",
  "public-path.schema.json",
  "uuid-v4.schema.json",
]);
const ERROR_SELECTORS = Object.freeze([
  "unknown-parameter",
  "invalid-locale",
  "invalid-schema",
  "invalid-path",
  "missing-path",
  "not-found",
]);
const AUTHORITY = Object.freeze({
  task: "TASK-019",
  handoff: "TASK-019-PRODUCT-CONFIGURATION-1",
  manifestPath:
    "frontend/src/lib/cms/product-configuration-contract/fixtures/PRODUCT_CONFIGURATION_HANDOFF_MANIFEST.json",
  manifestSha256:
    "3f3133697598f53f52d327316422dad845b859dac4f3bb1da40e0b58086ed4cd",
  checksumsPath:
    "frontend/src/lib/cms/product-configuration-contract/fixtures/PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256",
  checksumsSha256:
    "b6894406436b0bf8bcd6518a49d058ccc659c3efcdaa909827cdcb39ca2e1f37",
});
const EXPECTED_QUERY = Object.freeze({
  locale: "en",
  schema: "1.0.0",
  path: "required canonical public path",
  additionalParameters: false,
});
const EXPECTED_INVENTORY = Object.freeze([
  "manifest.json",
  "samples/errors/product-configuration-errors.json",
  "samples/success/fgd-x15-pvc.json",
  ...SCHEMA_NAMES.map((name) => `schemas/${name}`),
].sort());
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const FORBIDDEN_KEYS = new Set([
  "lineKey",
  "trusted",
  "validated",
  "price",
  "discount",
  "total",
  "cost",
  "supplier",
  "inventory",
  "wordpressId",
  "databaseId",
  "feishuRecordId",
  "internalCode",
  "internalNotes",
  "diagnostic",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactKeys(value, expected, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  invariant(
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort()),
    `${label} has an unexpected shape`,
  );
}

function safeRelative(value, label) {
  invariant(typeof value === "string" && value.length > 0, `${label} is empty`);
  invariant(!value.includes("\\") && !path.posix.isAbsolute(value), `${label} is unsafe`);
  invariant(
    value.split("/").every((segment) => segment && segment !== "." && segment !== ".."),
    `${label} contains traversal`,
  );
  return value;
}

function within(root, relative, label) {
  safeRelative(relative, label);
  const base = path.resolve(root);
  const resolved = path.resolve(base, ...relative.split("/"));
  invariant(resolved.startsWith(`${base}${path.sep}`), `${label} escapes root`);
  return resolved;
}

async function bytes(file, label) {
  try {
    return await readFile(file);
  } catch {
    throw new Error(`missing ${label}`);
  }
}

async function authorityBytes(repositoryRoot, relative, label) {
  safeRelative(relative, label);
  const root = path.resolve(repositoryRoot);
  let rootStats;
  let canonicalRoot;
  try {
    rootStats = await lstat(root);
    canonicalRoot = await realpath(root);
  } catch {
    throw new Error("missing authority repository root");
  }
  invariant(
    rootStats.isDirectory() && !rootStats.isSymbolicLink(),
    "authority repository root must be a canonical directory",
  );
  invariant(canonicalRoot === root, "authority repository root identity mismatch");

  const segments = relative.split("/");
  let current = root;
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    let stats;
    let canonical;
    try {
      stats = await lstat(current);
      canonical = await realpath(current);
    } catch {
      throw new Error(`missing ${label}`);
    }
    invariant(!stats.isSymbolicLink(), `${label} must use a canonical non-symlink path`);
    invariant(
      index === segments.length - 1 ? stats.isFile() : stats.isDirectory(),
      `${label} has an invalid authority object type`,
    );
    invariant(canonical === current, `${label} canonical identity mismatch`);
  }

  return bytes(current, label);
}

async function json(file, label) {
  const source = await bytes(file, label);
  try {
    return { bytes: source, value: JSON.parse(source.toString("utf8")) };
  } catch {
    throw new Error(`invalid JSON in ${label}`);
  }
}

async function inventory(directory, prefix = "") {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    throw new Error("missing snapshot root");
  }
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await inventory(absolute, relative));
    else {
      invariant(entry.isFile(), `unsupported snapshot entry: ${relative}`);
      files.push(relative);
    }
  }
  return files;
}

function validateEntry(entry, expectedSource, expectedSnapshot, label) {
  exactKeys(entry, ["sourcePath", "snapshotPath", "sha256"], label);
  invariant(entry.sourcePath === expectedSource, `${label} must use canonical source authority`);
  invariant(entry.snapshotPath === expectedSnapshot, `${label} must use canonical snapshot identity`);
  invariant(SHA256_PATTERN.test(entry.sha256), `${label} has invalid SHA-256`);
}

function validateManifest(manifest) {
  exactKeys(manifest, [
    "manifestVersion", "sourceAuthority", "restApiVersion", "contentSchemaVersion",
    "productConfigurationSchemaVersion", "endpoint", "query", "roots", "schemas", "samples",
  ], "manifest");
  invariant(manifest.manifestVersion === "1", "manifestVersion must be 1");
  invariant(JSON.stringify(manifest.sourceAuthority) === JSON.stringify(AUTHORITY), "sourceAuthority must match frozen TASK-019 authority");
  invariant(manifest.restApiVersion === "1", "REST API version mismatch");
  invariant(manifest.contentSchemaVersion === "3.0.0", "Content Schema version mismatch");
  invariant(manifest.productConfigurationSchemaVersion === "1.0.0", "Product Configuration version mismatch");
  invariant(manifest.endpoint === "/wp-json/gdhe/v1/product-configurations", "Product Configuration endpoint mismatch");
  invariant(JSON.stringify(manifest.query) === JSON.stringify(EXPECTED_QUERY), "closed query mismatch");
  invariant(JSON.stringify(manifest.roots) === JSON.stringify(["product-configuration.v1.schema.json"]), "root schema mismatch");
  invariant(Array.isArray(manifest.schemas) && manifest.schemas.length === 4, "schemas must contain exactly four entries");
  manifest.schemas.forEach((entry, index) => {
    const name = SCHEMA_NAMES[index];
    validateEntry(
      entry,
      `cms/wp-content/plugins/gdhe-site/config/schemas/${name}`,
      `schemas/${name}`,
      `schemas[${index}]`,
    );
  });
  exactKeys(manifest.samples, ["success", "errors"], "samples");
  invariant(Array.isArray(manifest.samples.success) && manifest.samples.success.length === 1, "success samples must contain one entry");
  const success = manifest.samples.success[0];
  exactKeys(success, ["name", "sourcePath", "snapshotPath", "sha256"], "success sample");
  invariant(success.name === "fgd-x15-pvc", "success sample name mismatch");
  invariant(success.sourcePath === "frontend/src/lib/cms/product-configuration-contract/fixtures/golden-product-configuration/fgd-x15-pvc.json", "success source authority mismatch");
  invariant(success.snapshotPath === "samples/success/fgd-x15-pvc.json", "success snapshot identity mismatch");
  invariant(SHA256_PATTERN.test(success.sha256), "success SHA-256 invalid");
  const errors = manifest.samples.errors;
  exactKeys(errors, ["sourcePath", "sourceSha256", "snapshotPath", "selectors", "sha256"], "error samples");
  invariant(errors.sourcePath === "frontend/src/lib/cms/product-configuration-contract/fixtures/PRODUCT_CONFIGURATION_ERROR_FIXTURES.json", "error source authority mismatch");
  invariant(errors.sourceSha256 === "01a60b64f5e899b4cd34c03fa0e4fc599aa915ac8422a4c8162402dbb4ee88e6", "error source SHA-256 mismatch");
  invariant(errors.snapshotPath === "samples/errors/product-configuration-errors.json", "error snapshot identity mismatch");
  invariant(JSON.stringify(errors.selectors) === JSON.stringify(ERROR_SELECTORS), "error selectors mismatch");
  invariant(SHA256_PATTERN.test(errors.sha256), "error snapshot SHA-256 invalid");
}

function parseChecksums(source) {
  const entries = source.trim().split("\n").map((line) => {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    invariant(match, "invalid authority checksum line");
    safeRelative(match[2], "authority checksum path");
    return [match[2], match[1]];
  });
  invariant(entries.length === 17, "authority checksum inventory must contain 17 entries");
  const paths = entries.map(([entryPath]) => entryPath);
  invariant(new Set(paths).size === paths.length, "authority checksums contain duplicates");
  invariant(JSON.stringify(paths) === JSON.stringify([...paths].sort()), "authority checksums are not sorted");
  return new Map(entries);
}

function collectRefs(value, refs = []) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, refs));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "$ref") refs.push(child);
      collectRefs(child, refs);
    }
  }
  return refs;
}

function validateRefs(schemas) {
  const names = new Set(SCHEMA_NAMES);
  const visited = new Set();
  const visit = (name) => {
    if (visited.has(name)) return;
    invariant(names.has(name), `unknown local $ref target: ${name}`);
    visited.add(name);
    for (const reference of collectRefs(schemas.get(name))) {
      invariant(typeof reference === "string", "$ref must be a string");
      if (reference.startsWith("#")) continue;
      invariant(!/^[a-z][a-z0-9+.-]*:/i.test(reference), "remote $ref is forbidden");
      const target = reference.split("#", 1)[0];
      safeRelative(target, "$ref");
      invariant(!target.includes("/"), "$ref escapes schema root");
      visit(target);
    }
  };
  visit("product-configuration.v1.schema.json");
  invariant(visited.size === 4, "root does not close over exactly four schemas");
}

function scanForbidden(value) {
  if (Array.isArray(value)) return value.forEach(scanForbidden);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    invariant(!FORBIDDEN_KEYS.has(key), `forbidden public key: ${key}`);
    scanForbidden(child);
  }
}

function validateSuccess(document) {
  exactKeys(document, ["apiVersion", "schemaVersion", "locale", "type", "product", "articleNumberOptions", "configurationPolicy", "modifiedAt"], "success document");
  invariant(document.apiVersion === "1" && document.schemaVersion === "1.0.0" && document.locale === "en" && document.type === "product_configuration", "success version envelope mismatch");
  exactKeys(document.product, ["id", "model", "name", "publicPath", "productKind", "quantityUnit"], "success product");
  invariant(document.product.id === "17000000-0000-4000-8000-000000000001", "stable product identity mismatch");
  invariant(document.product.model === "FGD X15+PVC" && document.product.name === "FGD X15+PVC Track", "public product identity mismatch");
  invariant(document.product.publicPath === "/products/fgd-x15-pvc/" && document.product.productKind === "curtain_track" && document.product.quantityUnit === "piece", "product contract mismatch");
  invariant(Array.isArray(document.articleNumberOptions) && document.articleNumberOptions.length === 1, "exactly one confirmed standard option is required");
  const option = document.articleNumberOptions[0];
  exactKeys(option, ["articleNumber", "lengthMeters", "color"], "standard option");
  exactKeys(option.color, ["code", "label"], "standard option color");
  invariant(option.articleNumber === "GDHEPRD000172" && option.lengthMeters === 6, "confirmed Article Number or length mismatch");
  invariant(option.color.code === "ivory-white" && option.color.label === "Ivory White", "confirmed color mismatch");
  const policy = document.configurationPolicy;
  exactKeys(policy, ["installationMethods", "packaging", "customLength"], "configuration policy");
  invariant(JSON.stringify(policy.installationMethods) === JSON.stringify([
    { method: "ceiling", changesTrackArticleNumber: false, optionalAccessory: null },
    { method: "wall", changesTrackArticleNumber: false, optionalAccessory: null },
  ]), "installation policy or accessory mismatch");
  invariant(JSON.stringify(policy.packaging) === JSON.stringify({
    scope: "curtain_track",
    basePackaging: { required: true, selectionMode: "single", options: ["standard", "carton", "large_shrink_wrap"] },
    logoPrinting: { available: true, valueType: "boolean" },
    protectionArrangement: { required: false, selectionMode: "single", options: ["single_bag", "paired"] },
  }), "packaging policy mismatch");
  invariant(JSON.stringify(policy.customLength) === JSON.stringify({
    enabled: true,
    articleNumberResolution: "sales_follow_up",
    minimumExclusive: 0,
    maximum: null,
    decimalPlaces: 1,
  }), "custom-length policy mismatch");
  scanForbidden(document);
}

function validateErrors(errors) {
  invariant(JSON.stringify(Object.keys(errors)) === JSON.stringify(ERROR_SELECTORS), "error snapshot selector order mismatch");
  const expected = {
    "unknown-parameter": ["gdhe_invalid_parameter", 400],
    "invalid-locale": ["gdhe_invalid_locale", 400],
    "invalid-schema": ["gdhe_invalid_schema", 400],
    "invalid-path": ["gdhe_invalid_path", 400],
    "missing-path": ["gdhe_invalid_path", 400],
    "not-found": ["gdhe_not_found", 404],
  };
  for (const selector of ERROR_SELECTORS) {
    const value = errors[selector];
    exactKeys(value, ["apiVersion", "code", "message", "status", "requestId", "details"], `error ${selector}`);
    invariant(value.apiVersion === "1" && value.code === expected[selector][0] && value.status === expected[selector][1], `error ${selector} mismatch`);
    invariant(value.requestId === "<uuid-v4>", `error ${selector} requestId mismatch`);
    scanForbidden(value);
  }
}

export default async function verifyProductConfigurationContract(options = {}) {
  const repositoryRoot = path.resolve(options.repositoryRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));
  const contractRoot = within(repositoryRoot, CONTRACT_ROOT, "contract root");
  const manifestRecord = await json(within(repositoryRoot, MANIFEST_PATH, "manifest path"), "snapshot manifest");
  const manifest = manifestRecord.value;
  validateManifest(manifest);
  const actualInventory = (await inventory(contractRoot)).filter((file) => !file.startsWith("fixtures/")).sort();
  invariant(JSON.stringify(actualInventory) === JSON.stringify(EXPECTED_INVENTORY), "snapshot inventory has missing or extra files");

  const authorityManifestBytes = await authorityBytes(repositoryRoot, AUTHORITY.manifestPath, "authority manifest");
  const authorityChecksumsBytes = await authorityBytes(repositoryRoot, AUTHORITY.checksumsPath, "authority checksums");
  invariant(sha256(authorityManifestBytes) === AUTHORITY.manifestSha256, "authority manifest SHA-256 mismatch");
  invariant(sha256(authorityChecksumsBytes) === AUTHORITY.checksumsSha256, "authority checksums SHA-256 mismatch");
  const authorityManifest = JSON.parse(authorityManifestBytes.toString("utf8"));
  invariant(authorityManifest.handoffVersion === AUTHORITY.handoff, "authority handoff mismatch");
  invariant(authorityManifest.endpoint === manifest.endpoint, "authority endpoint mismatch");
  invariant(JSON.stringify(authorityManifest.query) === JSON.stringify(EXPECTED_QUERY), "authority query mismatch");
  const authorityChecksums = parseChecksums(authorityChecksumsBytes.toString("utf8"));
  invariant(
    JSON.stringify(Object.entries(authorityManifest.checksums).sort()) ===
      JSON.stringify([...authorityChecksums.entries()].sort()),
    "authority checksum map mismatch",
  );
  for (const [sourcePath, expectedHash] of authorityChecksums) {
    const source = await authorityBytes(repositoryRoot, sourcePath, "authority checksum source");
    invariant(sha256(source) === expectedHash, `authority source drift: ${sourcePath}`);
  }

  const schemas = new Map();
  for (const entry of manifest.schemas) {
    const source = await authorityBytes(repositoryRoot, entry.sourcePath, "schema source");
    const snapshot = await bytes(within(contractRoot, entry.snapshotPath, "schema snapshot"), "schema snapshot");
    invariant(sha256(source) === entry.sha256, "schema source SHA-256 mismatch");
    invariant(sha256(snapshot) === entry.sha256, "schema snapshot SHA-256 mismatch");
    invariant(source.equals(snapshot), "schema snapshot differs from authority bytes");
    schemas.set(path.posix.basename(entry.snapshotPath), JSON.parse(snapshot.toString("utf8")));
  }
  validateRefs(schemas);

  const successEntry = manifest.samples.success[0];
  const successSource = await authorityBytes(repositoryRoot, successEntry.sourcePath, "success source");
  const successSnapshot = await bytes(within(contractRoot, successEntry.snapshotPath, "success snapshot"), "success snapshot");
  invariant(sha256(successSource) === successEntry.sha256 && sha256(successSnapshot) === successEntry.sha256, "success sample SHA-256 mismatch");
  invariant(successSource.equals(successSnapshot), "success snapshot differs from authority bytes");
  validateSuccess(JSON.parse(successSnapshot.toString("utf8")));

  const errorEntry = manifest.samples.errors;
  const errorSource = await authorityBytes(repositoryRoot, errorEntry.sourcePath, "error source");
  const errorSnapshot = await bytes(within(contractRoot, errorEntry.snapshotPath, "error snapshot"), "error snapshot");
  invariant(sha256(errorSource) === errorEntry.sourceSha256, "error authority source drift");
  invariant(sha256(errorSnapshot) === errorEntry.sha256, "error snapshot SHA-256 mismatch");
  const sourceErrors = JSON.parse(errorSource.toString("utf8"));
  const rebuiltErrors = Object.fromEntries(ERROR_SELECTORS.map((selector) => [selector, sourceErrors[selector]]));
  invariant(`${JSON.stringify(rebuiltErrors, null, 2)}\n` === errorSnapshot.toString("utf8"), "error snapshot is not deterministic authority selection");
  validateErrors(JSON.parse(errorSnapshot.toString("utf8")));

  return { errorSamples: 6, schemas: 4, successSamples: 1 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyProductConfigurationContract()
    .then((result) => {
      console.log(`Product Configuration contract snapshot PASS: ${result.schemas} schemas, ${result.successSamples} success sample, ${result.errorSamples} error samples`);
    })
    .catch((error) => {
      console.error(`Product Configuration contract snapshot FAIL: ${error instanceof Error ? error.message : "unknown failure"}`);
      process.exitCode = 1;
    });
}
