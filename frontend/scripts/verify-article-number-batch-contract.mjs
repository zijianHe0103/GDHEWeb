import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT_ROOT = "frontend/src/lib/cms/article-number-batch-contract";
const MANIFEST_PATH = `${CONTRACT_ROOT}/manifest.json`;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const AUTHORITY = Object.freeze({
  task: "TASK-025",
  manifestPath: "TASKS/ARTIFACTS/TASK-025/WORDPRESS_HANDOFF_MANIFEST.json",
  manifestSha256: "9bfb794e6dace0e4a15aef5f2d5a755b333482d297d1a071f74bbbb1277bce5f",
  checksumsPath: "TASKS/ARTIFACTS/TASK-025/WORDPRESS_HANDOFF_CHECKSUMS.sha256",
  checksumsSha256: "512b27a4b6d42b94cc73f45943b11a4b20ce4d08bd7305382f556e9a0c41e25a",
});
const SCHEMA_NAMES = Object.freeze([
  "card-action.v1.schema.json",
  "card-attribute.v1.schema.json",
  "mixed-quote-line-validation-request.v1.schema.json",
  "mixed-quote-line-validation-response.v1.schema.json",
  "product-card.v1.schema.json",
  "public-path.schema.json",
  "public-protected-media.v1.schema.json",
  "public-taxonomy-ref.v1.schema.json",
  "related-product-card-collection.v2.schema.json",
  "related-product-card-item.v2.schema.json",
  "uuid-v4.schema.json",
]);
const ROOTS = Object.freeze([
  "mixed-quote-line-validation-request.v1.schema.json",
  "mixed-quote-line-validation-response.v1.schema.json",
  "related-product-card-collection.v2.schema.json",
]);
const SUCCESS_NAMES = Object.freeze([
  "custom-sales-follow-up",
  "migrated-standard-refresh",
  "mixed-two-line",
  "related-product-card-v2",
  "standard-ready",
]);
const ERROR_MATRIX = Object.freeze([
  Object.freeze({ status: 400, code: "gdhe_invalid_quote_line_request" }),
  Object.freeze({ status: 409, code: "gdhe_quote_lines_changed" }),
  Object.freeze({ status: 413, code: "gdhe_quote_line_request_too_large" }),
  Object.freeze({ status: 415, code: "gdhe_unsupported_media_type" }),
  Object.freeze({ status: 500, code: "gdhe_quote_line_validation_unavailable" }),
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
    "manifestVersion", "sourceAuthority", "apiVersion", "relatedProductCardVersion",
    "mixedQuoteLineValidationVersion", "relatedProductCardEndpoint",
    "mixedValidationEndpoint", "mixedValidationMethod", "roots", "schemas", "samples",
  ], "manifest");
  invariant(manifest.manifestVersion === "1", "manifestVersion must be 1");
  invariant(JSON.stringify(manifest.sourceAuthority) === JSON.stringify(AUTHORITY), "sourceAuthority drift");
  invariant(manifest.apiVersion === "1", "apiVersion drift");
  invariant(manifest.relatedProductCardVersion === "2.0.0", "RelatedProductCard version drift");
  invariant(manifest.mixedQuoteLineValidationVersion === "1.0.0", "mixed validation version drift");
  invariant(manifest.relatedProductCardEndpoint === "/wp-json/gdhe/v1/related-product-cards", "RelatedProductCard endpoint drift");
  invariant(manifest.mixedValidationEndpoint === "/wp-json/gdhe/v1/quote-line-validations", "mixed endpoint drift");
  invariant(manifest.mixedValidationMethod === "POST", "mixed method drift");
  invariant(JSON.stringify(manifest.roots) === JSON.stringify(ROOTS), "root identity drift");
  invariant(Array.isArray(manifest.schemas) && manifest.schemas.length === SCHEMA_NAMES.length, "schemas must contain exactly 11 entries");
  manifest.schemas.forEach((entry, index) => {
    exactKeys(entry, ["sourcePath", "snapshotPath", "sha256"], `schemas[${index}]`);
    const name = SCHEMA_NAMES[index];
    invariant(entry.sourcePath === `cms/wp-content/plugins/gdhe-site/config/schemas/${name}`, `schemas[${index}] canonical authority mismatch`);
    invariant(entry.snapshotPath === `schemas/${name}`, `schemas[${index}] canonical snapshot mismatch`);
    invariant(SHA256_PATTERN.test(entry.sha256), `schemas[${index}] invalid SHA-256`);
  });
  exactKeys(manifest.samples, ["success", "errors"], "samples");
  invariant(Array.isArray(manifest.samples.success) && manifest.samples.success.length === 5, "success samples must contain exactly 5 entries");
  manifest.samples.success.forEach((entry, index) => {
    exactKeys(entry, ["name", "sourcePath", "snapshotPath", "sha256"], `samples.success[${index}]`);
    const name = SUCCESS_NAMES[index];
    invariant(entry.name === name, `success sample ${index} name drift`);
    invariant(entry.sourcePath === `TASKS/ARTIFACTS/TASK-025/golden-wordpress/${name}.json`, `success sample ${index} authority mismatch`);
    invariant(entry.snapshotPath === `samples/success/${name}.json`, `success sample ${index} snapshot mismatch`);
    invariant(SHA256_PATTERN.test(entry.sha256), `success sample ${index} invalid SHA-256`);
  });
  const errors = manifest.samples.errors;
  exactKeys(errors, ["sourcePath", "snapshotPath", "sha256", "matrix"], "samples.errors");
  invariant(errors.sourcePath === "TASKS/ARTIFACTS/TASK-025/QUOTE_LINE_ERROR_EVIDENCE.json", "error authority mismatch");
  invariant(errors.snapshotPath === "samples/errors/quote-line-errors.json", "error snapshot mismatch");
  invariant(errors.sha256 === "8749e1962f5de1f939a6d32447d5f8e43feaed28ca554a222b99192b51dda814", "error source hash drift");
  invariant(JSON.stringify(errors.matrix) === JSON.stringify(ERROR_MATRIX), "error matrix drift");
}

function parseChecksums(bytes) {
  const lines = bytes.toString("utf8").trimEnd().split("\n");
  invariant(lines.length === 52, "authority checksums must contain exactly 52 entries");
  const entries = lines.map((line, index) => {
    const match = /^([0-9a-f]{64})  ([^\r\n]+)$/.exec(line);
    invariant(match, `authority checksum line ${index + 1} is invalid`);
    safeRelative(match[2], `authority checksum path ${index + 1}`);
    return [match[2], match[1]];
  });
  invariant(new Set(entries.map(([name]) => name)).size === 52, "authority checksums contain duplicates");
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
  const schemaRoot = path.join(contractRoot, "schemas");
  const declared = new Set(SCHEMA_NAMES);
  const schemas = new Map();
  const ids = new Map();
  for (const name of SCHEMA_NAMES) {
    const value = (await jsonFile(within(schemaRoot, name, `schema ${name}`), `schema ${name}`)).value;
    schemas.set(name, value);
    invariant(typeof value.$id === "string", `schema ${name} has no $id`);
    invariant(!ids.has(value.$id), `duplicate schema $id: ${value.$id}`);
    ids.set(value.$id, name);
  }
  const visited = new Set();
  async function visit(name) {
    if (visited.has(name)) return;
    invariant(declared.has(name), `unknown local $ref target: ${name}`);
    visited.add(name);
    for (const reference of collectRefs(schemas.get(name))) {
      if (reference.startsWith("#")) continue;
      let resolved;
      if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(reference) || reference.startsWith("//")) {
        invariant(reference.startsWith("https://gdhe.example/"), `remote $ref is forbidden in ${name}`);
        const target = reference.split("#", 1)[0];
        resolved = ids.get(target);
        if (!resolved && target.startsWith("https://gdhe.example/schemas/product-card/v1/")) {
          resolved = target.slice("https://gdhe.example/schemas/product-card/v1/".length);
        }
        invariant(resolved, `unknown remote $ref target in ${name}`);
      } else {
        const target = reference.split("#", 1)[0];
        resolved = path.posix.normalize(path.posix.join(path.posix.dirname(name), target));
      }
      invariant(resolved !== ".." && !resolved.startsWith("../") && !path.posix.isAbsolute(resolved), `local $ref escapes schema root in ${name}`);
      await visit(resolved);
    }
  }
  for (const root of roots) await visit(root);
  invariant(JSON.stringify([...visited].sort()) === JSON.stringify([...SCHEMA_NAMES]), `schema closure mismatch: expected 11, found ${visited.size}`);
}

function verifyProofs(success, errorEvidence) {
  const related = success["related-product-card-v2"];
  invariant(related.schemaVersion === "2.0.0" && related.items.length === 1, "RelatedProductCard v2 proof drift");
  invariant(related.items[0].directQuote.articleNumber === "GDHEPRD000901", "RelatedProductCard Article Number proof drift");
  const standard = success["standard-ready"];
  invariant(standard.lines.length === 1 && standard.lines[0].articleNumber === "GDHEPRD000172", "standard ordered proof drift");
  const custom = success["custom-sales-follow-up"];
  invariant(custom.lines.length === 1 && custom.lines[0].resolution === "sales_follow_up" && custom.lines[0].articleNumber === null, "custom proof drift");
  const mixed = success["mixed-two-line"];
  invariant(mixed.lines.length === 2 && mixed.lines[0].lineKind === "configured_product" && mixed.lines[1].lineKind === "catalog_accessory", "mixed order proof drift");
  const migrated = success["migrated-standard-refresh"];
  invariant(migrated.lines.length === 2 && migrated.lines[0].articleNumber === "GDHEPRD000172", "refresh proof drift");
  invariant(errorEvidence.sanitized === true && Array.isArray(errorEvidence.errors), "error evidence shape drift");
  for (const expected of ERROR_MATRIX) {
    invariant(
      errorEvidence.errors.some((error) => error.status === expected.status && error.code === expected.code),
      `missing frozen error ${expected.status}/${expected.code}`,
    );
  }
}

export async function verifyArticleNumberBatchContract(options = {}) {
  const requestedRoot = path.resolve(options.repositoryRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));
  const repositoryRoot = await realpath(requestedRoot);
  const contractRoot = within(repositoryRoot, CONTRACT_ROOT, "contract root");
  const { value: manifest } = await jsonFile(within(repositoryRoot, MANIFEST_PATH, "manifest path"), "Article Number batch manifest");
  validateManifest(manifest);

  const authorityManifest = await jsonFile(within(repositoryRoot, AUTHORITY.manifestPath, "authority manifest"), "TASK-025 authority manifest");
  invariant(sha256(authorityManifest.bytes) === AUTHORITY.manifestSha256, "TASK-025 authority manifest SHA-256 mismatch");
  const checksumBytes = await regularBytes(within(repositoryRoot, AUTHORITY.checksumsPath, "authority checksums"), "TASK-025 authority checksums");
  invariant(sha256(checksumBytes) === AUTHORITY.checksumsSha256, "TASK-025 authority checksums SHA-256 mismatch");
  const checksums = parseChecksums(checksumBytes);
  invariant(authorityManifest.value.taskId === "TASK-025" && authorityManifest.value.handoffFileCount === 52, "TASK-025 authority identity drift");
  invariant(JSON.stringify(authorityManifest.value.checksums) === JSON.stringify(checksums), "authority manifest/checksum stream drift");

  const expectedFiles = [
    "manifest.json",
    ...manifest.schemas.map((entry) => entry.snapshotPath),
    ...manifest.samples.success.map((entry) => entry.snapshotPath),
    manifest.samples.errors.snapshotPath,
  ].sort();
  const actualFiles = await inventory(contractRoot);
  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  invariant(missing.length === 0, `missing snapshot files: ${missing.join(", ")}`);
  invariant(extra.length === 0, `extra snapshot files: ${extra.join(", ")}`);
  await verifyClosure(contractRoot, manifest.roots);

  for (const [index, entry] of manifest.schemas.entries()) await verifyEntry(repositoryRoot, contractRoot, entry, `schemas[${index}]`, checksums);
  for (const [index, entry] of manifest.samples.success.entries()) await verifyEntry(repositoryRoot, contractRoot, entry, `samples.success[${index}]`, checksums);
  await verifyEntry(repositoryRoot, contractRoot, manifest.samples.errors, "samples.errors", checksums);

  const success = {};
  for (const entry of manifest.samples.success) {
    success[entry.name] = (await jsonFile(within(contractRoot, entry.snapshotPath, `success ${entry.name}`), `success ${entry.name}`)).value;
  }
  const errors = (await jsonFile(within(contractRoot, manifest.samples.errors.snapshotPath, "error snapshot"), "error snapshot")).value;
  verifyProofs(success, errors);
  return { schemas: 11, successSamples: 5, errorSamples: 5 };
}

export default verifyArticleNumberBatchContract;

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  verifyArticleNumberBatchContract().then((result) => {
    console.log(`Article Number batch contract snapshot PASS: ${result.schemas} schemas, ${result.successSamples} success samples, ${result.errorSamples} error samples`);
  }).catch((error) => {
    console.error(`Article Number batch contract snapshot FAIL: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  });
}
