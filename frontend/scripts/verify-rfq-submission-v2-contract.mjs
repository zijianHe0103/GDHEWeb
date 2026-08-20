import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT_ROOT = "frontend/src/lib/rfq-submission-contract/v2";
const MANIFEST_PATH = `${CONTRACT_ROOT}/manifest.json`;
const SOURCE_ROOT = "frontend/src/lib/rfq-submission-contract/v2/fixtures";
const AUTHORITY = Object.freeze({
  taskId: "TASK-026",
  verifierPath: `${SOURCE_ROOT}/verify-machine-contract.cjs`,
  verifierSha256: "1ae7bf75fc11b59b4919f5a4636025be696f98577e79d9a8c1ba0b6515ec8fd6",
});
const FILE_HASHES = Object.freeze({
  "samples/basket-v3/ready-mixed.json": "0bdcf375459c49dccf65ec383c5d35cc0538f242c698850dc8166b1c65ae38b9",
  "samples/basket-v3/requires-readd.json": "001c0be91aa037d34996e16f008ff8e31aaca7e803119fd847fb16ac3b3a519f",
  "samples/basket-v3/requires-validation.json": "24651818c7199855f7d119a7db89f0ad4fb619db964670b7ef6007ef280dfcad",
  "samples/matrix.json": "9a35c27e333c9aa54c3ba37087f516ce6631b313a3822e2866768da337b83f7f",
  "samples/negative/manifest.json": "8ae59216ecba4b066551b04911bc503c3e21cc758bca7c119b832d926bfb2054",
  "samples/negative/semantic-mutations.json": "2ca3adc23ee8e73e4cf543aa63c40027d728467a75526bc6c59cf8db7711eb08",
  "samples/positive/accepted-receipt.json": "bc3b1e38edbdc5a835e03ca4f05ffdd2b34efb2c9eea051df2893c873cde1d1b",
  "samples/positive/authoritative-mixed.json": "814fba85be34c5873fd7dc7ba8c87afd81800bcbc8b2bfd15b82887ec4a93a6e",
  "samples/positive/processing-receipt.json": "7a595daf9ba7d46e563f9ed706f040654dd11bf6851d0cb56162216833a21590",
  "samples/positive/public-error.json": "8a6c5dab8fa1bcb73ead7577857ae5909258ccdc518d35334041b01492a95fab",
  "samples/positive/public-mixed.json": "ac309c2d8ef16d10f6d8c863398662f2434cd311ccf4fdc0ad22885a29d3f380",
  "samples/task025/batch-request-ready-mixed.json": "f54ca3e8a59fd4dd1b234cd98e1850cea513ec33f2ef75d4e80d73d28bd3ef67",
  "samples/task025/batch-response-ready-mixed.json": "40e26faae74009d3e7178967f04d94bff62373734573b243f073bc916f589c6b",
  "schemas/authoritative-rfq-document.v2.schema.json": "6335baa0bcaf4f7f9dec8692d47d0116b5676f90f8a3afdd40872bc8aced3de3",
  "schemas/common.v2.schema.json": "5d9804907603bb4ca10bf543374a4992e2899ebdf8f0f7c22ab8d4cc2b19cf82",
  "schemas/public-rfq-error.v2.schema.json": "bb9fe3ff8fcdd32e67daf4c9f2edfea0c0c945b129917bdc057e9070b9a10f99",
  "schemas/public-rfq-receipt.v2.schema.json": "c88d563a8c0cc4ee989851b1de1c868b5c20a33ab3a6449a45a22195bd947f34",
  "schemas/public-rfq-submission-draft.v2.schema.json": "9bed07807c3a6fe8152fed5e144ab746b88a1329d7e228d317ad575d8d6c1e4e",
  "vectors/expected.v2.json": "cc09d2a9661065af299805d0be4ebde76b48a5363d4be9ae762f9b5529d972fc",
  "vectors/invalid/crypto-mutations.v2.json": "500f1d97e0da0d34160e5f23827cf058971c1c292cd24c8c8075d24d33e5cc50",
});
const SNAPSHOT_PATHS = Object.freeze(Object.keys(FILE_HASHES));
const SCHEMA_PATHS = Object.freeze(SNAPSHOT_PATHS.filter((name) => name.startsWith("schemas/")));

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactKeys(value, keys, label) {
  invariant(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  invariant(JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort()), `${label} keys drift`);
}

function safeRelative(relative, label) {
  invariant(typeof relative === "string" && relative.length > 0, `${label} must be a non-empty string`);
  invariant(relative === relative.replaceAll("\\", "/"), `${label} uses a backslash`);
  invariant(!path.posix.isAbsolute(relative), `${label} must be relative`);
  invariant(path.posix.normalize(relative) === relative, `${label} is non-canonical or traversing`);
  invariant(relative !== ".." && !relative.startsWith("../"), `${label} is traversing`);
  return relative;
}

function within(root, relative, label) {
  const safe = safeRelative(relative, label);
  const absolute = path.resolve(root, safe);
  invariant(absolute.startsWith(`${root}${path.sep}`), `${label} escapes repository root`);
  return absolute;
}

async function canonicalRepositoryRoot(requestedRoot) {
  const resolved = path.resolve(requestedRoot);
  const canonical = await realpath(resolved);
  invariant(canonical === resolved, "repository root canonical identity mismatch");
  const status = await lstat(canonical);
  invariant(status.isDirectory() && !status.isSymbolicLink(), "repository root must be a real directory");
  return canonical;
}

async function regularBytes(absolute, label) {
  let status;
  try {
    status = await lstat(absolute);
  } catch {
    throw new Error(`missing ${label}`);
  }
  invariant(status.isFile() && !status.isSymbolicLink(), `${label} must be a regular non-symlink file`);
  invariant(await realpath(absolute) === absolute, `${label} canonical identity mismatch`);
  return readFile(absolute);
}

async function jsonFile(absolute, label) {
  const bytes = await regularBytes(absolute, label);
  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    throw new Error(`${label} must contain valid JSON`);
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
      invariant(await realpath(absolute) === absolute, `snapshot canonical identity mismatch: ${relative}`);
      files.push(relative);
    }
  }
  return files;
}

function expectedManifestEntries() {
  return SNAPSHOT_PATHS.map((snapshotPath) => ({
    sourcePath: `${SOURCE_ROOT}/${snapshotPath}`,
    snapshotPath,
    sha256: FILE_HASHES[snapshotPath],
  }));
}

function validateManifest(manifest) {
  exactKeys(manifest, ["manifestVersion", "authority", "files"], "manifest");
  invariant(manifest.manifestVersion === "1", "manifestVersion must be 1");
  exactKeys(manifest.authority, ["taskId", "verifierPath", "verifierSha256"], "manifest.authority");
  invariant(JSON.stringify(manifest.authority) === JSON.stringify(AUTHORITY), "authority identity drift");
  invariant(Array.isArray(manifest.files) && manifest.files.length === 20, "manifest must contain exactly 20 JSON files");
  manifest.files.forEach((entry, index) => exactKeys(entry, ["sourcePath", "snapshotPath", "sha256"], `manifest.files[${index}]`));
  invariant(JSON.stringify(manifest.files) === JSON.stringify(expectedManifestEntries()), "manifest file authority drift");
}

function collectRefs(value, refs = []) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, refs));
  else if (value !== null && typeof value === "object") {
    if (typeof value.$ref === "string") refs.push(value.$ref);
    Object.entries(value).forEach(([key, item]) => {
      if (key !== "$ref") collectRefs(item, refs);
    });
  }
  return refs;
}

async function verifySchemaClosure(contractRoot) {
  const schemaNames = new Set(SCHEMA_PATHS.map((name) => path.posix.basename(name)));
  let referenceCount = 0;
  for (const snapshotPath of SCHEMA_PATHS) {
    const { value } = await jsonFile(within(contractRoot, snapshotPath, `schema ${snapshotPath}`), `schema ${snapshotPath}`);
    for (const reference of collectRefs(value)) {
      referenceCount += 1;
      invariant(!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(reference) && !reference.startsWith("//"), `remote $ref is forbidden in ${snapshotPath}`);
      const target = reference.split("#", 1)[0];
      if (!target) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(snapshotPath), target));
      invariant(resolved !== ".." && !resolved.startsWith("../") && !path.posix.isAbsolute(resolved), `local $ref escapes schema root in ${snapshotPath}`);
      invariant(resolved.startsWith("schemas/") && schemaNames.has(path.posix.basename(resolved)), `unknown local $ref target in ${snapshotPath}`);
    }
  }
  invariant(referenceCount === 63, `Schema reference count drift: expected 63, found ${referenceCount}`);
  return referenceCount;
}

async function verifyParity(repositoryRoot, contractRoot, entries) {
  for (const [index, entry] of entries.entries()) {
    const source = await regularBytes(within(repositoryRoot, entry.sourcePath, `files[${index}].sourcePath`), `files[${index}] source`);
    const snapshot = await regularBytes(within(contractRoot, entry.snapshotPath, `files[${index}].snapshotPath`), `files[${index}] snapshot`);
    invariant(sha256(source) === entry.sha256, `files[${index}] source SHA-256 mismatch`);
    invariant(sha256(snapshot) === entry.sha256, `files[${index}] snapshot SHA-256 mismatch`);
    invariant(source.equals(snapshot), `files[${index}] source/snapshot byte parity mismatch`);
  }
}

async function verifyAuthorityTruth(repositoryRoot) {
  const verifier = within(repositoryRoot, AUTHORITY.verifierPath, "authority verifier path");
  const verifierBytes = await regularBytes(verifier, "TASK-026 authority verifier");
  invariant(sha256(verifierBytes) === AUTHORITY.verifierSha256, "TASK-026 authority verifier SHA-256 mismatch");
  const result = spawnSync(process.execPath, [verifier], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  invariant(result.status === 0, "TASK-026 authority verifier failed");
  const summaryLine = result.stdout.trimEnd().split("\n").at(-1);
  let summary;
  try {
    summary = JSON.parse(summaryLine);
  } catch {
    throw new Error("TASK-026 authority verifier summary is invalid");
  }
  invariant(
    JSON.stringify(summary) === JSON.stringify({
      schemas: 5,
      localReferences: 63,
      positiveChecks: 47,
      negativeChecks: 47,
      checks: 94,
      failures: 0,
    }),
    "TASK-026 authority truth boundary drift",
  );
  return summary;
}

export async function verifyRfqSubmissionV2Contract(options = {}) {
  const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const repositoryRoot = await canonicalRepositoryRoot(options.repositoryRoot ?? defaultRoot);
  const contractRoot = within(repositoryRoot, CONTRACT_ROOT, "contract root");
  invariant(await realpath(contractRoot) === contractRoot, "contract root canonical identity mismatch");
  const { value: manifest } = await jsonFile(within(repositoryRoot, MANIFEST_PATH, "manifest path"), "RFQ Submission v2 manifest");
  validateManifest(manifest);

  const expectedFiles = ["manifest.json", ...SNAPSHOT_PATHS].sort();
  const actualFiles = (await inventory(contractRoot)).filter((file) => !file.startsWith("fixtures/"));
  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  invariant(missing.length === 0, `missing snapshot files: ${missing.join(", ")}`);
  invariant(extra.length === 0, `extra snapshot files: ${extra.join(", ")}`);

  const localReferences = await verifySchemaClosure(contractRoot);
  await verifyParity(repositoryRoot, contractRoot, manifest.files);
  const authority = await verifyAuthorityTruth(repositoryRoot);
  return {
    files: manifest.files.length,
    schemas: SCHEMA_PATHS.length,
    localReferences,
    checks: authority.checks,
  };
}

export default verifyRfqSubmissionV2Contract;

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  verifyRfqSubmissionV2Contract().then((result) => {
    console.log(`RFQ Submission v2 contract snapshot PASS: ${result.files} JSON files, ${result.schemas} schemas, ${result.localReferences} closed refs, ${result.checks}/94 authority checks`);
  }).catch((error) => {
    console.error(`RFQ Submission v2 contract snapshot FAIL: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  });
}
