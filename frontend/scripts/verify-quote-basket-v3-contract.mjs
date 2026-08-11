import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(frontendRoot, "src/lib/quote-basket-contract/v3");
const expected = Object.freeze({
  "samples/errors/invalid.json": "b3eba1369cea48267bfd070a1954c417f234f20c3f9b216d3aa5d80eb4c1f349",
  "samples/success/mixed.json": "8a4e8616686ec2b60e06e26392d3aad2e0cb500a71fece9672709985104c93ef",
  "schemas/quote-basket.v3.schema.json": "9d52e5d3879cd16661d6d5ab82530a6c82669dc63fe69a9c219dcade8d6b3854",
});

async function main() {
  const canonicalRoot = await realpath(root);
  if (canonicalRoot !== root) fail("contract root identity mismatch");
  const manifest = await readJson(join(root, "manifest.json"));
  if (
    manifest.contract !== "GDHE Public Quote Basket" ||
    manifest.schemaVersion !== "3.0.0" ||
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

  const schema = await readJson(join(root, "schemas/quote-basket.v3.schema.json"));
  if (
    schema.$id !== "https://gdhe.example/frontend/quote-basket/v3/quote-basket.v3.schema.json" ||
    schema.properties?.schemaVersion?.const !== "3.0.0" ||
    schema.additionalProperties !== false ||
    schema.$defs?.positiveSafeInteger?.maximum !== Number.MAX_SAFE_INTEGER ||
    schema.$defs?.configuredReadyStandard?.unevaluatedProperties !== false ||
    schema.$defs?.accessoryRequiresReadd?.unevaluatedProperties !== false
  ) fail("closed Schema authority mismatch");

  const success = await readJson(join(root, "samples/success/mixed.json"));
  assertDocument(success);
  const errors = await readJson(join(root, "samples/errors/invalid.json"));
  const invalid = Object.values(errors);
  if (invalid.length !== 6) fail("invalid sample count mismatch");
  for (const sample of invalid) {
    let rejected = false;
    try {
      assertStateSummary(sample);
    } catch {
      rejected = true;
    }
    if (!rejected) fail("invalid sample was accepted");
  }
  process.stdout.write(
    "Quote Basket 3.0 contract PASS: 1 schema, 1 success sample, 6 invalid samples\n",
  );
}

function assertDocument(value) {
  assertRecord(value, ["schemaVersion", "revision", "writerId", "mutationId", "updatedAt", "expiresAt", "items"]);
  if (value.schemaVersion !== "3.0.0" || value.items.length !== 3) fail("success root mismatch");
  if (Date.parse(value.expiresAt) !== Date.parse(value.updatedAt) + 2_592_000_000) fail("TTL mismatch");
  for (const item of value.items) {
    assertStateSummary({
      lineKind: item.lineKind,
      state: item.state,
      selectionType: item.selection?.type,
      articleNumber: item.articleNumber,
      resolution: item.resolution,
      quantity: item.quantity,
    });
  }
}

function assertStateSummary(value) {
  if (!Number.isSafeInteger(value.quantity) || value.quantity < 1) fail("quantity mismatch");
  const article = typeof value.articleNumber === "string" && /^GDHEPRD[0-9]{6}$/.test(value.articleNumber);
  if (value.lineKind === "configured_product") {
    if (value.state === "ready" && value.selectionType === "standard" && article && value.resolution === "standard_ready") return;
    if (value.state === "ready" && value.selectionType === "custom" && value.articleNumber === null && value.resolution === "sales_follow_up") return;
    if (value.state === "requires_validation" && value.selectionType === "standard" && value.articleNumber === null && value.resolution === "refresh_from_selection") return;
    fail("configured state mismatch");
  }
  if (value.lineKind === "catalog_accessory") {
    if (value.state === "ready" && article) return;
    if (value.state === "requires_readd" && value.articleNumber === null) return;
    fail("accessory state mismatch");
  }
  fail("line kind mismatch");
}

function assertRecord(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("record mismatch");
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) fail("closed keys mismatch");
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
    if (entry.isSymbolicLink()) fail("symlink inventory entry");
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else result.push(relative(root, absolute));
  }
  return result;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function fail(message) {
  throw new Error(`Quote Basket 3.0 verification failed: ${message}`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "verification failed"}\n`);
  process.exitCode = 1;
});
