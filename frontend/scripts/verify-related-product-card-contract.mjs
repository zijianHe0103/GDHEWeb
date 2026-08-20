import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT_ROOT = "frontend/src/lib/cms/related-product-card-contract";
const MANIFEST_PATH = `${CONTRACT_ROOT}/manifest.json`;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const AUTHORITY = Object.freeze({
  task: "TASK-023",
  contract: "RelatedProductCardCollection",
  manifestPath: "frontend/src/lib/cms/related-product-card-contract/fixtures/RELATED_PRODUCT_CARD_HANDOFF_MANIFEST.json",
  manifestSha256: "bd2aa6fa3fde2585f52d26d0c45b4786ce7027c314a65d1cfc9c48bf49f44db8",
  checksumsPath: "frontend/src/lib/cms/related-product-card-contract/fixtures/RELATED_PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256",
  checksumsSha256: "3a81f3738faa2a89c56dc08891239862712d00c8a2ac0ebf1d2691542b760757",
});
const SCHEMA_NAMES = Object.freeze([
  "card-action.v1.schema.json",
  "card-attribute.v1.schema.json",
  "product-card.v1.schema.json",
  "public-path.schema.json",
  "public-protected-media.v1.schema.json",
  "public-taxonomy-ref.v1.schema.json",
  "related-product-card-collection.v1.schema.json",
  "related-product-card-item.v1.schema.json",
  "uuid-v4.schema.json",
]);
const SUCCESS_NAMES = Object.freeze(["four-plus", "one", "three", "zero"]);
const ERROR_SELECTORS = Object.freeze([
  "locale",
  "malformed-relations",
  "not-found",
  "over-20",
  "path",
  "schema",
  "source-conflict",
  "source-ineligible",
  "unknown",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactKeys(value, expected, label) {
  invariant(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  invariant(
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort()),
    `${label} has an unexpected shape`,
  );
}

function safeRelative(value, label) {
  invariant(typeof value === "string" && value.length > 0, `${label} is empty`);
  invariant(!value.includes("\\") && !path.posix.isAbsolute(value), `${label} is unsafe`);
  invariant(
    value.split("/").every((segment) => segment !== "" && segment !== "." && segment !== ".."),
    `${label} contains traversal`,
  );
  return value;
}

function within(root, relative, label) {
  safeRelative(relative, label);
  const absoluteRoot = path.resolve(root);
  const absolute = path.resolve(absoluteRoot, ...relative.split("/"));
  invariant(absolute.startsWith(`${absoluteRoot}${path.sep}`), `${label} escapes its root`);
  return absolute;
}

async function regularBytes(absolute, label) {
  try {
    const info = await lstat(absolute);
    invariant(info.isFile() && !info.isSymbolicLink(), `${label} is not a regular file`);
    const canonical = await realpath(absolute);
    invariant(canonical === absolute, `${label} canonical identity mismatch`);
    return await readFile(absolute);
  } catch (error) {
    if (error instanceof Error && /regular file|canonical identity/.test(error.message)) throw error;
    throw new Error(`missing ${label}`);
  }
}

async function jsonFile(absolute, label) {
  const bytes = await regularBytes(absolute, label);
  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    throw new Error(`invalid JSON in ${label}`);
  }
}

async function inventory(root, prefix = "") {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    throw new Error("missing snapshot root");
  }
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await inventory(absolute, relative));
    else {
      invariant(entry.isFile() && !entry.isSymbolicLink(), `unsupported snapshot entry: ${relative}`);
      files.push(relative);
    }
  }
  return files;
}

function validateManifest(manifest) {
  exactKeys(manifest, [
    "manifestVersion", "sourceAuthority", "restApiVersion", "productCardSchemaVersion",
    "relatedProductCardSchemaVersion", "endpoint", "roots", "schemas", "samples",
  ], "manifest");
  invariant(manifest.manifestVersion === "1", "manifestVersion must be 1");
  invariant(JSON.stringify(manifest.sourceAuthority) === JSON.stringify(AUTHORITY), "sourceAuthority must match frozen TASK-023 authority");
  invariant(manifest.restApiVersion === "1", "restApiVersion must be 1");
  invariant(manifest.productCardSchemaVersion === "1.0.0", "ProductCard version drift");
  invariant(manifest.relatedProductCardSchemaVersion === "1.0.0", "RelatedProductCard version drift");
  invariant(manifest.endpoint === "/wp-json/gdhe/v1/related-product-cards", "endpoint drift");
  invariant(JSON.stringify(manifest.roots) === JSON.stringify(["related-product-card-collection.v1.schema.json"]), "root identity drift");
  invariant(Array.isArray(manifest.schemas) && manifest.schemas.length === 9, "schemas must contain exactly 9 entries");
  manifest.schemas.forEach((entry, index) => {
    exactKeys(entry, ["sourcePath", "snapshotPath", "sha256"], `schemas[${index}]`);
    const name = SCHEMA_NAMES[index];
    invariant(entry.sourcePath === `cms/wp-content/plugins/gdhe-site/config/schemas/${name}`, `schemas[${index}] canonical authority mismatch`);
    invariant(entry.snapshotPath === `schemas/${name}`, `schemas[${index}] canonical snapshot mismatch`);
    invariant(SHA256_PATTERN.test(entry.sha256), `schemas[${index}] invalid SHA-256`);
  });
  exactKeys(manifest.samples, ["success", "errors"], "samples");
  invariant(Array.isArray(manifest.samples.success) && manifest.samples.success.length === 4, "success samples must contain exactly 4 entries");
  manifest.samples.success.forEach((entry, index) => {
    exactKeys(entry, ["name", "sourcePath", "snapshotPath", "sha256"], `samples.success[${index}]`);
    const name = SUCCESS_NAMES[index];
    invariant(entry.name === name, `success sample ${index} name drift`);
    invariant(entry.sourcePath === `frontend/src/lib/cms/related-product-card-contract/fixtures/golden-related-product-card/${name}.json`, `success sample ${index} authority mismatch`);
    invariant(entry.snapshotPath === `samples/success/${name}.json`, `success sample ${index} snapshot mismatch`);
    invariant(SHA256_PATTERN.test(entry.sha256), `success sample ${index} invalid SHA-256`);
  });
  const errors = manifest.samples.errors;
  exactKeys(errors, ["sourcePath", "snapshotPath", "sha256", "selectors"], "samples.errors");
  invariant(errors.sourcePath === "frontend/src/lib/cms/related-product-card-contract/fixtures/RELATED_PRODUCT_ERROR_FIXTURES.json", "error authority mismatch");
  invariant(errors.snapshotPath === "samples/errors/related-product-errors.json", "error snapshot mismatch");
  invariant(errors.sha256 === "e431d02338ccc82f9f576044dc860501c7711856bb01d8a09a454b86ecc2c91c", "error source hash drift");
  invariant(JSON.stringify(errors.selectors) === JSON.stringify(ERROR_SELECTORS), "error selector identity drift");
}

function parseChecksums(bytes) {
  const entries = bytes.toString("utf8").trimEnd().split("\n").map((line, index) => {
    const match = /^([0-9a-f]{64})  ([^\r\n]+)$/.exec(line);
    invariant(match, `authority checksum line ${index + 1} is invalid`);
    safeRelative(match[2], `authority checksum path ${index + 1}`);
    return [match[2], match[1]];
  });
  invariant(entries.length === 26, "authority checksums must contain 26 entries");
  invariant(new Set(entries.map(([name]) => name)).size === 26, "authority checksums contain duplicates");
  return Object.fromEntries(entries);
}

async function verifyEntry(repositoryRoot, contractRoot, entry, label, authorityChecksums) {
  const source = await regularBytes(within(repositoryRoot, entry.sourcePath, `${label}.sourcePath`), `${label} source`);
  const snapshot = await regularBytes(within(contractRoot, entry.snapshotPath, `${label}.snapshotPath`), `${label} snapshot`);
  invariant(authorityChecksums[entry.sourcePath] === entry.sha256, `${label} authority checksum mismatch`);
  invariant(sha256(source) === entry.sha256, `${label} source SHA-256 mismatch`);
  invariant(sha256(snapshot) === entry.sha256, `${label} snapshot SHA-256 mismatch`);
  invariant(source.equals(snapshot), `${label} source/snapshot byte parity mismatch`);
}

function collectRefs(value, result = []) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, result));
  else if (value !== null && typeof value === "object") {
    if (typeof value.$ref === "string") result.push(value.$ref);
    Object.entries(value).forEach(([key, item]) => { if (key !== "$ref") collectRefs(item, result); });
  }
  return result;
}

async function verifyClosure(contractRoot, roots) {
  const declared = new Set(SCHEMA_NAMES);
  const visited = new Set();
  const schemaRoot = path.join(contractRoot, "schemas");
  async function visit(name) {
    if (visited.has(name)) return;
    invariant(declared.has(name), `unknown local $ref target: ${name}`);
    visited.add(name);
    const { value } = await jsonFile(within(schemaRoot, name, `schema ${name}`), `schema ${name}`);
    for (const reference of collectRefs(value)) {
      if (reference.startsWith("#")) continue;
      let resolved;
      if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(reference) || reference.startsWith("//")) {
        const allowedPrefixes = [
          "https://gdhe.example/schemas/product-card/v1/",
          "https://gdhe.example/schemas/related-product-card/v1/",
        ];
        const prefix = allowedPrefixes.find((candidate) => reference.startsWith(candidate));
        invariant(prefix !== undefined, `remote $ref is forbidden in ${name}`);
        resolved = reference.slice(prefix.length).split("#", 1)[0];
      } else {
        const target = reference.split("#", 1)[0];
        resolved = path.posix.normalize(path.posix.join(path.posix.dirname(name), target));
      }
      invariant(resolved !== ".." && !resolved.startsWith("../") && !path.posix.isAbsolute(resolved), `local $ref escapes schema root in ${name}`);
      await visit(resolved);
    }
  }
  for (const root of roots) await visit(root);
  invariant(JSON.stringify([...visited].sort()) === JSON.stringify([...SCHEMA_NAMES]), `schema closure mismatch: expected 9, found ${visited.size}`);
}

function verifyProofs(success, errors) {
  const expectedCounts = { "four-plus": 4, one: 1, three: 3, zero: 0 };
  for (const [name, sample] of Object.entries(success)) {
    invariant(sample.apiVersion === "1" && sample.schemaVersion === "1.0.0" && sample.locale === "en" && sample.type === "related_product_card", `success sample ${name} identity drift`);
    invariant(sample.sourcePath === "/products/fgd-x15-pvc/" && sample.items.length === expectedCounts[name], `success sample ${name} state drift`);
  }
  const four = success["four-plus"].items;
  invariant(four[0].card.action.mode === "view_product" && four[0].directQuote === null, "detail action proof drift");
  invariant(four[1].card.action.mode === "direct_rfq" && four[1].directQuote?.kind === "catalog_accessory" && four[1].directQuote?.quantityUnit === "piece", "accessory action proof drift");
  invariant(Object.keys(errors).sort().join("\n") === [...ERROR_SELECTORS].sort().join("\n"), "error sample set drift");
  for (const [selector, error] of Object.entries(errors)) {
    invariant(error.apiVersion === "1" && Number.isSafeInteger(error.status) && typeof error.code === "string", `error sample ${selector} drift`);
  }
}

export async function verifyRelatedProductCardContract(options = {}) {
  const requestedRoot = path.resolve(options.repositoryRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));
  const repositoryRoot = await realpath(requestedRoot);
  const contractRoot = within(repositoryRoot, CONTRACT_ROOT, "contract root");
  const { value: manifest } = await jsonFile(within(repositoryRoot, MANIFEST_PATH, "manifest path"), "RelatedProductCard manifest");
  validateManifest(manifest);

  const authorityManifestFile = await jsonFile(within(repositoryRoot, AUTHORITY.manifestPath, "authority manifest"), "TASK-023 authority manifest");
  invariant(sha256(authorityManifestFile.bytes) === AUTHORITY.manifestSha256, "TASK-023 authority manifest SHA-256 mismatch");
  const checksumBytes = await regularBytes(within(repositoryRoot, AUTHORITY.checksumsPath, "authority checksums"), "TASK-023 authority checksums");
  invariant(sha256(checksumBytes) === AUTHORITY.checksumsSha256, "TASK-023 authority checksums SHA-256 mismatch");
  const checksums = parseChecksums(checksumBytes);
  invariant(authorityManifestFile.value.taskId === "TASK-023" && authorityManifestFile.value.contract === "RelatedProductCardCollection", "TASK-023 authority identity drift");
  invariant(JSON.stringify(authorityManifestFile.value.checksums) === JSON.stringify(checksums), "authority manifest/checksum stream drift");

  const expectedFiles = [
    "manifest.json",
    ...manifest.schemas.map((entry) => entry.snapshotPath),
    ...manifest.samples.success.map((entry) => entry.snapshotPath),
    manifest.samples.errors.snapshotPath,
  ].sort();
  const actualFiles = (await inventory(contractRoot)).filter((file) => !file.startsWith("fixtures/"));
  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  invariant(missing.length === 0, `missing snapshot files: ${missing.join(", ")}`);
  invariant(extra.length === 0, `extra snapshot files: ${extra.join(", ")}`);
  await verifyClosure(contractRoot, manifest.roots);

  for (const [index, entry] of manifest.schemas.entries()) await verifyEntry(repositoryRoot, contractRoot, entry, `schemas[${index}]`, checksums);
  for (const [index, entry] of manifest.samples.success.entries()) await verifyEntry(repositoryRoot, contractRoot, entry, `samples.success[${index}]`, checksums);
  await verifyEntry(repositoryRoot, contractRoot, manifest.samples.errors, "samples.errors", checksums);

  const success = {};
  for (const entry of manifest.samples.success) success[entry.name] = (await jsonFile(within(contractRoot, entry.snapshotPath, `success ${entry.name}`), `success ${entry.name}`)).value;
  const errors = (await jsonFile(within(contractRoot, manifest.samples.errors.snapshotPath, "error snapshot"), "error snapshot")).value;
  verifyProofs(success, errors);
  return { schemas: 9, successSamples: 4, errorSamples: 9 };
}

export default verifyRelatedProductCardContract;

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  verifyRelatedProductCardContract().then((result) => {
    console.log(`RelatedProductCard contract snapshot PASS: ${result.schemas} schemas, ${result.successSamples} success samples, ${result.errorSamples} error samples`);
  }).catch((error) => {
    console.error(`RelatedProductCard contract snapshot FAIL: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  });
}
