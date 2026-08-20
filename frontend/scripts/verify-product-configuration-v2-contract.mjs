import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = "frontend/src/lib/cms/product-configuration-v2-contract";
const INVENTORY = Object.freeze([
  "manifest.json",
  "samples/errors/product-configuration-errors.json",
  "samples/success/fgd-x15-pvc.json",
  "schemas/article-number-option.v1.schema.json",
  "schemas/product-configuration.v2.schema.json",
  "schemas/public-path.schema.json",
  "schemas/uuid-v4.schema.json",
]);
const AUTHORITY = Object.freeze({
  manifestPath: "frontend/src/lib/cms/product-configuration-v2-contract/fixtures/PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json",
  manifestSha256: "3a19148a7ede56556048ec5e048a0973781c12df7081403779b13fd73a0f4aed",
  checksumsPath: "frontend/src/lib/cms/product-configuration-v2-contract/fixtures/PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256",
  checksumsSha256: "1b8510803a22395183fd05741854e3934085423f04b91af72fd47a52d27fac11",
});
const SCHEMA_SOURCES = Object.freeze([
  "cms/wp-content/plugins/gdhe-site/config/schemas/article-number-option.v1.schema.json",
  "cms/wp-content/plugins/gdhe-site/config/schemas/product-configuration.v2.schema.json",
  "cms/wp-content/plugins/gdhe-site/config/schemas/public-path.schema.json",
  "cms/wp-content/plugins/gdhe-site/config/schemas/uuid-v4.schema.json",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function safeRelative(value, label) {
  invariant(typeof value === "string" && value.length > 0, `${label} is empty`);
  invariant(!value.includes("\\") && !path.posix.isAbsolute(value), `${label} is unsafe`);
  invariant(value.split("/").every((part) => part && part !== "." && part !== ".."), `${label} contains traversal`);
  return value;
}

async function canonicalBytes(repositoryRoot, relative, label) {
  safeRelative(relative, label);
  const root = path.resolve(repositoryRoot);
  invariant(await realpath(root) === root, "repository root identity mismatch");
  let current = root;
  for (const [index, segment] of relative.split("/").entries()) {
    current = path.join(current, segment);
    const stat = await lstat(current).catch(() => null);
    invariant(stat && !stat.isSymbolicLink(), `missing or substituted ${label}`);
    invariant(index === relative.split("/").length - 1 ? stat.isFile() : stat.isDirectory(), `${label} identity mismatch`);
    invariant(await realpath(current) === current, `${label} canonical identity mismatch`);
  }
  return readFile(current);
}

async function inventory(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await inventory(path.join(directory, entry.name), relative));
    else {
      invariant(entry.isFile(), `unsupported snapshot entry: ${relative}`);
      files.push(relative);
    }
  }
  return files;
}

function collectRefs(value, result = []) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, result));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "$ref") result.push(child);
      collectRefs(child, result);
    }
  }
  return result;
}

export default async function verifyProductConfigurationV2Contract(options = {}) {
  const repositoryRoot = options.repositoryRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const contractRoot = path.join(repositoryRoot, ROOT);
  invariant(JSON.stringify((await inventory(contractRoot)).filter((file) => !file.startsWith("fixtures/"))) === JSON.stringify(INVENTORY), "v2 snapshot inventory mismatch");
  const manifestBytes = await canonicalBytes(repositoryRoot, `${ROOT}/manifest.json`, "v2 manifest");
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  invariant(JSON.stringify(manifest.sourceAuthority) === JSON.stringify(AUTHORITY), "v2 authority identity mismatch");
  invariant(digest(await canonicalBytes(repositoryRoot, AUTHORITY.manifestPath, "v2 handoff manifest")) === AUTHORITY.manifestSha256, "v2 handoff manifest SHA-256 mismatch");
  invariant(digest(await canonicalBytes(repositoryRoot, AUTHORITY.checksumsPath, "v2 handoff checksums")) === AUTHORITY.checksumsSha256, "v2 handoff checksum SHA-256 mismatch");
  invariant(manifest.productConfigurationSchemaVersion === "2.0.0", "v2 version mismatch");
  invariant(manifest.endpoint === "/wp-json/gdhe/v1/product-configurations", "v2 endpoint mismatch");
  invariant(JSON.stringify(manifest.query) === JSON.stringify({locale:"en",schema:"2.0.0",path:"required canonical public path",additionalParameters:false}), "v2 query mismatch");
  invariant(Array.isArray(manifest.schemas) && manifest.schemas.length === 4, "v2 Schema closure mismatch");
  invariant(JSON.stringify(manifest.schemas.map((entry) => entry.sourcePath)) === JSON.stringify(SCHEMA_SOURCES), "v2 Schema authority substitution");
  invariant(manifest.samples.success[0].sourcePath === "frontend/src/lib/cms/product-configuration-v2-contract/fixtures/golden-product-configuration-v2/fgd-x15-pvc.json", "v2 success authority substitution");
  invariant(manifest.samples.errors.sourcePath === "frontend/src/lib/cms/product-configuration-v2-contract/fixtures/PRODUCT_CONFIGURATION_V2_ERROR_FIXTURES.json", "v2 error authority substitution");
  const schemaNames = new Set(manifest.schemas.map((entry) => path.posix.basename(entry.snapshotPath)));
  for (const entry of [...manifest.schemas, ...manifest.samples.success]) {
    const source = await canonicalBytes(repositoryRoot, entry.sourcePath, "v2 source authority");
    const snapshot = await canonicalBytes(repositoryRoot, `${ROOT}/${entry.snapshotPath}`, "v2 snapshot");
    invariant(digest(source) === entry.sha256, "v2 source SHA-256 mismatch");
    invariant(digest(snapshot) === entry.sha256, "v2 snapshot SHA-256 mismatch");
  }
  const sourceErrors = await canonicalBytes(repositoryRoot, manifest.samples.errors.sourcePath, "v2 error authority");
  invariant(digest(sourceErrors) === manifest.samples.errors.sourceSha256, "v2 error source SHA-256 mismatch");
  const selectedErrors = JSON.parse(await canonicalBytes(repositoryRoot, `${ROOT}/${manifest.samples.errors.snapshotPath}`, "v2 error snapshot"));
  invariant(JSON.stringify(Object.keys(selectedErrors)) === JSON.stringify(manifest.samples.errors.selectors), "v2 error selector mismatch");
  invariant(digest(await readFile(path.join(contractRoot, manifest.samples.errors.snapshotPath))) === manifest.samples.errors.sha256, "v2 error snapshot SHA-256 mismatch");
  const schemas = new Map();
  for (const entry of manifest.schemas) schemas.set(path.posix.basename(entry.snapshotPath), JSON.parse(await readFile(path.join(contractRoot, entry.snapshotPath), "utf8")));
  const visited = new Set();
  const visit = (name) => {
    invariant(schemaNames.has(name), `unknown local $ref target: ${name}`);
    if (visited.has(name)) return;
    visited.add(name);
    for (const reference of collectRefs(schemas.get(name))) {
      invariant(typeof reference === "string", "$ref must be a string");
      if (reference.startsWith("#")) continue;
      invariant(!/^[a-z][a-z0-9+.-]*:/i.test(reference), "remote $ref is forbidden");
      const target = safeRelative(reference.split("#", 1)[0], "$ref");
      invariant(!target.includes("/"), "$ref escapes schema root");
      visit(target);
    }
  };
  visit("product-configuration.v2.schema.json");
  invariant(visited.size === 4, "v2 root does not close over four schemas");
  return { errorSamples: 6, schemas: 4, successSamples: 1 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await verifyProductConfigurationV2Contract();
  console.log("Product Configuration 2.0.0 contract snapshot verified.");
}
