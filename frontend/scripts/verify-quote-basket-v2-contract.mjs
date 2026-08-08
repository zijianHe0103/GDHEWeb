import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(frontendRoot, "src/lib/quote-basket-contract/v2");
const expected = Object.freeze({
  "samples/errors/invalid.json": "df5c61b65e1dfb5912f022c973d69812f2f2877054f15345b40af79e030f427c",
  "samples/success/mixed.json": "70f7d58c52dde27c3458fc145c099da7b3d3efe74c3e3fb432a7f45e13751687",
  "schemas/quote-basket.v2.schema.json": "0fb78fa7f12d479b02a8a347305cf0928dd0987ded4158da7051414a15f07eb3",
});

async function main() {
  const canonicalRoot = await realpath(root);
  if (canonicalRoot !== root) fail("contract root identity mismatch");
  const manifest = await readJson(join(root, "manifest.json"));
  if (
    manifest.contract !== "GDHE Public Quote Basket" ||
    manifest.schemaVersion !== "2.0.0" ||
    JSON.stringify(manifest.files) !== JSON.stringify(expected)
  ) fail("manifest authority mismatch");

  const inventory = (await walk(root)).sort();
  const allowed = ["manifest.json", ...Object.keys(expected)].sort();
  if (JSON.stringify(inventory) !== JSON.stringify(allowed)) fail("inventory mismatch");
  for (const [path, digest] of Object.entries(expected)) {
    const absolute = join(root, path);
    await assertCanonicalRegularFile(absolute, canonicalRoot);
    const actual = createHash("sha256").update(await readFile(absolute)).digest("hex");
    if (actual !== digest) fail(`checksum mismatch: ${path}`);
  }

  const schema = await readJson(join(root, "schemas/quote-basket.v2.schema.json"));
  if (
    schema.$id !== "https://gdhe.example/frontend/quote-basket/v2/quote-basket.v2.schema.json" ||
    schema.properties?.schemaVersion?.const !== "2.0.0" ||
    schema.additionalProperties !== false ||
    schema.$defs?.catalogAccessory?.additionalProperties !== false ||
    schema.$defs?.positiveSafeInteger?.maximum !== Number.MAX_SAFE_INTEGER
  ) fail("closed Schema authority mismatch");

  const success = await readJson(join(root, "samples/success/mixed.json"));
  assertDocument(success);
  const errors = await readJson(join(root, "samples/errors/invalid.json"));
  const invalid = Object.values(errors);
  if (invalid.length !== 3) fail("invalid sample count mismatch");
  for (const sample of invalid) {
    let rejected = false;
    try {
      assertAccessory(sample);
    } catch {
      rejected = true;
    }
    if (!rejected) fail("invalid sample was accepted");
  }
  process.stdout.write(
    "Quote Basket 2.0 contract PASS: 1 schema, 1 success sample, 3 invalid samples\n",
  );
}

function assertDocument(value) {
  assertRecord(value, ["schemaVersion", "revision", "writerId", "mutationId", "updatedAt", "expiresAt", "items"]);
  if (value.schemaVersion !== "2.0.0" || value.items.length !== 2) fail("success root mismatch");
  if (Date.parse(value.expiresAt) !== Date.parse(value.updatedAt) + 2_592_000_000) fail("TTL mismatch");
  if (value.items[0].lineKind !== "configured_product") fail("configured line mismatch");
  assertAccessory(value.items[1]);
}

function assertAccessory(value) {
  assertRecord(value, ["lineKind", "entryId", "createdAt", "product", "catalogPath", "quantityUnit", "quantity"]);
  if (value.lineKind !== "catalog_accessory") fail("accessory kind mismatch");
  if (!Number.isSafeInteger(value.quantity) || value.quantity < 1) fail("accessory quantity mismatch");
  if (!/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*\/$/.test(value.catalogPath)) fail("catalog path mismatch");
  assertRecord(value.product, ["model", "name", "image"]);
  assertRecord(value.product.image, ["url", "width", "height", "alt"]);
  if (!/^\/test-candidates\/[a-z0-9][a-z0-9._-]*$/i.test(value.product.image.url)) fail("media mismatch");
}

function assertRecord(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("record mismatch");
  const actual = Object.keys(value).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...keys].sort())) fail("closed keys mismatch");
}

async function assertCanonicalRegularFile(path, canonicalRoot) {
  const stats = await lstat(path);
  if (!stats.isFile() || stats.isSymbolicLink()) fail("non-regular contract file");
  const canonical = await realpath(path);
  if (!canonical.startsWith(`${canonicalRoot}${sep}`)) fail("contract traversal");
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else result.push(relative(root, absolute));
  }
  return result;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function fail(message) {
  throw new Error(`Quote Basket 2.0 verification failed: ${message}`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "verification failed"}\n`);
  process.exitCode = 1;
});
