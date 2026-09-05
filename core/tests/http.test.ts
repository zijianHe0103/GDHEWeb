import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";
import { withPostgres } from "@gdhe/database/testing";
import { prepareDatabase, startCore, request, writerToken, cmsToken, productInput, ids } from "./fixtures.js";

test("compiled Catalog HTTP, real PostgreSQL, permissions and restart", { timeout: 120_000 }, async (t) => {
  await withPostgres(async ({ pool, url }) => {
    const databaseUrl = await prepareDatabase(pool, url);
    let core = startCore(databaseUrl);
    try {
      const result = await core.ready.then(base => ({ base, error: "" }), () => ({ base: "", error: core.logs() }));
      assert.ok(result.base, result.error);
      let { base } = result;
      const observations: { path: string; method: string; status: number; body: unknown }[] = [];
      const call = async (path: string, token: string | undefined, method = "GET", body?: unknown) => {
        const response = await request(base, path, token, method, body);
        const route = path.split("?")[0].replace(/(\/(?:manual-track-products|products))\/[^/]+$/, "$1/{id}");
        observations.push({ path: route, method: method.toLowerCase(), ...response });
        return response;
      };
      let created: Awaited<ReturnType<typeof request>>["body"];
      await t.test("database-backed readiness", async () => {
        assert.deepEqual(await call("/health/ready", cmsToken), { status: 200, body: { status: "ready" } });
      });
      for (const [label, token, status] of [["missing", undefined, 401], ["wrong", "wrong", 401], ["CMS read-only", cmsToken, 403]] as const) {
        await t.test(`${label} credential cannot create`, async () => {
          assert.equal((await call("/v1/catalog/manual-track-products", token, "POST", productInput())).status, status);
        });
      }
      await t.test("writer creates Product / Track / Product–Color atomically", async () => {
        const response = await call("/v1/catalog/manual-track-products", writerToken, "POST", productInput());
        assert.equal(response.status, 201);
        assert.equal(response.body.model, "TEST-X38");
        assert.equal((await pool.query("SELECT count(*)::int AS n FROM catalog.product_colors WHERE product_id=$1", [response.body.id])).rows[0].n, 3);
        assert.equal((await pool.query("SELECT quantity_unit FROM catalog.track_products WHERE product_id=$1", [response.body.id])).rows[0].quantity_unit, "piece");
        created = response.body;
      });
      await t.test("application role is not an owner and cannot DDL, DELETE or mutate reference data", async () => {
        const probe = new Pool({ connectionString: databaseUrl });
        try {
          assert.equal((await probe.query("SELECT current_user AS name")).rows[0].name, "core_test_app");
          assert.equal((await pool.query("SELECT rolsuper FROM pg_roles WHERE rolname='core_test_app'")).rows[0].rolsuper, false);
          assert.equal((await pool.query("SELECT count(*)::int AS n FROM pg_tables WHERE tableowner='core_test_app'")).rows[0].n, 0);
          for (const statement of ["CREATE TABLE catalog.test_forbidden (id integer)", "DELETE FROM catalog.products", "UPDATE catalog.colors SET status='inactive'", "INSERT INTO catalog.track_standard_lengths(length_mm) VALUES (7000)", "SELECT * FROM drizzle.__drizzle_migrations"]) {
            await assert.rejects(probe.query(statement), { code: "42501" });
          }
        } finally { await probe.end(); }
      });
      const invalid = [
        { id: randomUUID() }, { createdAt: "2020-01-01T00:00:00Z" }, { articleNumber: "PRIVATE" }, { allowsCustomColor: false },
        { model: "  " }, { nameEn: "x".repeat(241) }, { primaryCategoryId: "not-uuid" }, { status: "published" },
        { quantityUnit: "metre" }, { allowsCustomLength: "true" },
        { colors: [{ colorId: ids.ivory, status: "active", isPublic: true, sortOrder: -1 }] },
        { colors: [{ colorId: ids.ivory, status: "active", isPublic: true, sortOrder: 0, price: 10 }] },
        { colors: [{ colorId: ids.ivory, status: "active", isPublic: true, sortOrder: 0 }, { colorId: ids.ivory.toUpperCase(), status: "inactive", isPublic: false, sortOrder: 1 }] },
      ];
      for (const [index, input] of invalid.entries()) {
        await t.test(`closed create input rejects invalid case ${index + 1}`, async () => {
          assert.equal((await call("/v1/catalog/manual-track-products", writerToken, "POST", productInput(input))).status, 400);
        });
      }
      await t.test("create requires explicit lifecycle and does not default active", async () => {
        const input = productInput();
        const { status: _status, ...withoutStatus } = input;
        assert.equal((await call("/v1/catalog/manual-track-products", writerToken, "POST", withoutStatus)).status, 400);
      });
      await t.test("same model creates another stable Product ID without merge", async () => {
        const second = await call("/v1/catalog/manual-track-products", writerToken, "POST", productInput());
        assert.equal(second.status, 201);
        assert.notEqual(second.body.id, created.id);
        assert.equal((await call(`/v1/catalog/manual-track-products/${second.body.id}`, writerToken)).body.id, second.body.id);
      });
      await t.test("CMS cannot access maintenance DTO even through case-insensitive URL spelling", async () => {
        assert.equal((await call(`/v1/catalog/manual-track-products/${created.id}`, cmsToken)).status, 403);
        assert.equal((await request(base, `/V1/CATALOG/MANUAL-TRACK-PRODUCTS/${created.id}`, cmsToken)).status, 403);
      });
      await t.test("CMS identifies product and exposes filtered English facts, not internal rows", async () => {
        const cms = await call(`/v1/cms/products/${created.id}`, cmsToken);
        assert.equal(cms.status, 200);
        assert.equal(cms.body.nameZh, "测试静音轨道");
        const facts = cms.body.publicFacts;
        assert.deepEqual(facts.colors, [{ id: ids.ivory, code: "test-ivory", nameEn: "Test Ivory White" }]);
        assert.deepEqual(facts.standardLengthsMm, [4300, 5800, 6000, 6300, 6700]);
        assert.equal(facts.quantityUnit, "piece");
        assert.deepEqual(Object.keys(facts).sort(), ["allowsCustomLength", "colors", "id", "model", "nameEn", "primaryCategory", "quantityUnit", "standardLengthsMm"].sort());
        assert.doesNotMatch(JSON.stringify(facts), /nameZh|createdAt|updatedAt|articleNumber|weight|cost|inventory|productSpec|allowsCustomColor|测试/);
      });
      await t.test("database-side search covers model, Chinese and English; stable bounded pages", async () => {
        for (const q of ["TEST-X38", "静音", "Silent"]) {
          const page = await call(`/v1/cms/products?q=${encodeURIComponent(q)}&limit=1&offset=0`, cmsToken);
          assert.equal(page.status, 200);
          assert.equal(page.body.items.length, 1);
          assert.equal(page.body.hasMore, true);
          assert.deepEqual((await call(`/v1/cms/products?q=${encodeURIComponent(q)}&limit=1&offset=0`, cmsToken)).body, page.body);
          const second = await call(`/v1/cms/products?q=${encodeURIComponent(q)}&limit=1&offset=1`, cmsToken);
          assert.notEqual(second.body.items[0].id, page.body.items[0].id);
        }
        const empty = await call("/v1/cms/products?q=NO-SUCH-TEST-PRODUCT", cmsToken);
        assert.deepEqual(empty.body.items, []);
        assert.equal(empty.body.hasMore, false);
        assert.equal((await call(`/v1/cms/products/${randomUUID()}`, cmsToken)).status, 404);
        assert.equal((await call("/v1/cms/products/not-uuid", cmsToken)).status, 400);
        assert.equal((await call("/v1/catalog/manual-track-products?q=Silent", writerToken)).status, 200);
        for (const query of ["limit=51", "limit=0", "offset=-1", "offset=10001", "q=x&siteId=other", "limit=1&limit=2"]) {
          assert.equal((await call(`/v1/cms/products?${query}`, cmsToken)).status, 400);
        }
      });
      await t.test("reference APIs read database dictionaries without write APIs", async () => {
        const category = await call("/v1/catalog/references/categories?limit=1", cmsToken);
        assert.equal(category.status, 200);
        assert.equal(category.body.items.length, 1);
        assert.equal(category.body.hasMore, true);
        const color = await call("/v1/catalog/references/colors", cmsToken);
        assert.equal(color.body.items.length, 3);
        const lengths = await call("/v1/catalog/references/standard-lengths", cmsToken);
        assert.deepEqual(lengths.body.items.map((item: { lengthMm: number }) => item.lengthMm), [4300, 5800, 6000, 6300, 6700]);
        assert.equal((await request(base, "/v1/catalog/references/colors", writerToken, "POST", { code: "no-write" })).status, 404);
      });
      await t.test("standard lengths do not silently accept unsupported pagination", async () => {
        assert.equal((await call("/v1/catalog/references/standard-lengths?limit=1", cmsToken)).status, 400);
      });
      await t.test("malformed JSON, oversized bodies and caller-claimed roles fail closed", async () => {
        for (const [raw, status] of [["{\"PRIVATE_MALFORMED_038\":", 400], [JSON.stringify({ extra: "x".repeat(150_000) }), 413]] as const) {
          const response = await fetch(base + "/v1/catalog/manual-track-products", { method: "POST", headers: { Authorization: `Bearer ${writerToken}`, "Content-Type": "application/json" }, body: raw });
          const body = await response.json();
          assert.equal(response.status, status);
          assert.doesNotMatch(JSON.stringify(body), /PRIVATE_MALFORMED_038|SyntaxError|stack|SELECT/);
        }
        const forged = await fetch(base + "/v1/catalog/manual-track-products", { method: "POST", headers: { "x-role": "maintenance", "Content-Type": "application/json" }, body: JSON.stringify(productInput()) });
        assert.equal(forged.status, 401);
      });
      await t.test("PATCH preserves omitted data and relationships while explicitly changing public configuration", async () => {
        const response = await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken, "PATCH", {
          nameEn: "Test Updated Track", allowsCustomLength: false,
          colors: [{ colorId: ids.ivory, status: "inactive", isPublic: false, sortOrder: 5 }, { colorId: ids.black, status: "active", isPublic: true, sortOrder: 1 }],
        });
        assert.equal(response.status, 200);
        assert.equal(response.body.nameZh, created.nameZh);
        assert.equal(response.body.model, created.model);
        assert.equal(response.body.createdAt, created.createdAt);
        assert.ok(response.body.updatedAt > created.updatedAt);
        assert.equal(response.body.colors.length, 3);
        assert.equal(response.body.colors.find((c: { color: { id: string } }) => c.color.id === ids.inactiveColor).isPublic, true);
        const cms = await call(`/v1/cms/products/${created.id}`, cmsToken);
        assert.equal(cms.body.nameEn, "Test Updated Track");
        assert.equal(cms.body.publicFacts.allowsCustomLength, false);
        assert.deepEqual(cms.body.publicFacts.colors, [{ id: ids.black, code: "test-black", nameEn: "Test Black" }]);
        assert.equal((await pool.query("SELECT count(*)::int AS n FROM catalog.product_colors WHERE product_id=$1", [created.id])).rows[0].n, 3);
        const before = response.body;
        const emptyColors = await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken, "PATCH", { colors: [] });
        assert.deepEqual(emptyColors.body.colors, before.colors);
        for (const input of [{}, { id: randomUUID() }, { createdAt: created.createdAt }, { updatedAt: created.updatedAt }, { colors: null }]) {
          assert.equal((await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken, "PATCH", input)).status, 400);
        }
        assert.equal((await call(`/v1/catalog/manual-track-products/${created.id}`, cmsToken, "PATCH", { nameEn: "Unauthorized" })).status, 403);
      });
      await t.test("late Color foreign-key failure rolls back already-inserted Product and Track", async () => {
        const input = productInput({ model: "TEST-ROLLBACK-CREATE", colors: [{ colorId: randomUUID(), status: "active", isPublic: true, sortOrder: 0 }] });
        const response = await call("/v1/catalog/manual-track-products", writerToken, "POST", input);
        assert.equal(response.status, 409);
        assert.equal(response.body.code, "reference_conflict");
        assert.equal((await pool.query("SELECT count(*)::int AS n FROM catalog.products WHERE model='TEST-ROLLBACK-CREATE'")).rows[0].n, 0);
        assert.equal((await pool.query("SELECT count(*)::int AS n FROM catalog.track_products t LEFT JOIN catalog.products p ON p.id=t.product_id WHERE p.id IS NULL")).rows[0].n, 0);
      });
      await t.test("late update failure rolls back names, Track and earlier color change", async () => {
        const before = await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken);
        const response = await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken, "PATCH", {
          nameEn: "MUST ROLL BACK", allowsCustomLength: true,
          colors: [{ colorId: ids.black, status: "inactive", isPublic: false, sortOrder: 0 }, { colorId: randomUUID(), status: "active", isPublic: true, sortOrder: 1 }],
        });
        assert.equal(response.status, 409);
        assert.deepEqual((await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken)).body, before.body);
      });
      await t.test("inactive and incomplete products remain identifiable but have no public facts", async () => {
        const inactive = await call("/v1/catalog/manual-track-products", writerToken, "POST", productInput({ status: "inactive" }));
        assert.equal(inactive.status, 201);
        const detail = await call(`/v1/cms/products/${inactive.body.id}`, cmsToken);
        assert.equal(detail.body.status, "inactive");
        assert.equal(detail.body.publicFacts, null);
        await pool.query("DELETE FROM catalog.track_products WHERE product_id=$1", [inactive.body.id]);
        await pool.query("UPDATE catalog.products SET status='active' WHERE id=$1", [inactive.body.id]);
        const incomplete = await call(`/v1/cms/products/${inactive.body.id}`, cmsToken);
        assert.equal(incomplete.body.track, null);
        assert.equal(incomplete.body.publicFacts, null);
        assert.equal((await call(`/v1/catalog/manual-track-products/${inactive.body.id}`, writerToken, "PATCH", { nameEn: "No implicit repair" })).status, 409);
      });
      await t.test("active lengths and category lifecycle are applied to current facts", async () => {
        await pool.query("UPDATE catalog.track_standard_lengths SET status='inactive' WHERE length_mm=5800");
        assert.deepEqual((await call(`/v1/cms/products/${created.id}`, cmsToken)).body.publicFacts.standardLengthsMm, [4300, 6000, 6300, 6700]);
        await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken, "PATCH", { primaryCategoryId: ids.inactiveCategory });
        assert.equal((await call(`/v1/cms/products/${created.id}`, cmsToken)).body.publicFacts, null);
        await call(`/v1/catalog/manual-track-products/${created.id}`, writerToken, "PATCH", { primaryCategoryId: ids.category });
      });
      await t.test("search treats SQL wildcard characters as literal input", async () => {
        await call("/v1/catalog/manual-track-products", writerToken, "POST", productInput({ model: "TEST_%38" }));
        const page = await call("/v1/cms/products?q=%25", cmsToken);
        assert.equal(page.body.items.length, 1);
        assert.equal(page.body.items[0].model, "TEST_%38");
      });
      await t.test("database failure returns 503, not empty data or fake readiness", async () => {
        await pool.query("REVOKE SELECT ON catalog.products FROM core_test_app");
        try {
          for (const path of ["/health/ready", "/v1/cms/products", `/v1/cms/products/${created.id}`]) {
            const response = await call(path, cmsToken);
            assert.equal(response.status, 503);
            assert.equal(response.body.code, "database_unavailable");
            assert.doesNotMatch(JSON.stringify(response.body), /SELECT|catalog\.|postgres|stack|password|core_test_app/);
          }
        } finally { await pool.query("GRANT SELECT ON catalog.products TO core_test_app"); }
      });
      await t.test("OpenAPI matches every observed request/response and closed input", async () => {
        const doc = (await request(base, "/openapi.json", cmsToken)).body;
        assert.equal(doc.openapi, "3.1.0");
        const ajv = new Ajv({ strict: false });
        addFormats.default(ajv);
        ajv.addSchema({ $id: "urn:gdhe:catalog-api", components: doc.components });
        for (const observation of observations) {
          const operation = doc.paths[observation.path]?.[observation.method];
          assert.ok(operation, `OpenAPI operation missing: ${observation.method} ${observation.path}`);
          const schema = operation.responses[observation.status]?.content?.["application/json"]?.schema;
          assert.ok(schema, `OpenAPI response missing: ${observation.status} ${observation.path}`);
          const validate = ajv.compile({ ...schema, $ref: schema.$ref ? `urn:gdhe:catalog-api${schema.$ref}` : undefined });
          assert.ok(validate(observation.body), JSON.stringify(validate.errors));
        }
        const validateCreate = ajv.compile(doc.components.schemas.CreateProduct);
        assert.equal(validateCreate(productInput()), true);
        assert.equal(validateCreate(productInput({ articleNumber: "not-allowed" })), false);
      });
      await t.test("shutdown releases pool/HTTP and restart retains API-created data", async () => {
        const before = await call(`/v1/cms/products/${created.id}`, cmsToken);
        assert.equal(before.status, 200);
        assert.equal(before.body.id, created.id);
        await core.stop();
        assert.equal((await pool.query("SELECT count(*)::int AS n FROM pg_stat_activity WHERE application_name='gdhe-core-catalog'")).rows[0].n, 0);
        await assert.rejects(fetch(base + "/health/ready", { signal: AbortSignal.timeout(1000) }));
        core = startCore(databaseUrl);
        base = await core.ready;
        const after = await request(base, `/v1/cms/products/${created.id}`, cmsToken);
        assert.equal(after.status, 200);
        assert.deepEqual(after.body, before.body);
      });
      await t.test("missing config and unavailable database fail startup without credential leakage", async () => {
        for (const overrides of [{ CORE_DATABASE_URL: "" }, { CATALOG_CMS_TOKEN: writerToken }, { CORE_DATABASE_URL: new URL("/missing_database", databaseUrl).toString() }]) {
          const failed = startCore(databaseUrl, overrides);
          try { await assert.rejects(failed.ready); }
          finally { await failed.stop(); }
          assert.doesNotMatch(failed.logs(), new RegExp(`${writerToken}|${cmsToken}|${new URL(databaseUrl).password}`));
          assert.doesNotMatch(failed.logs(), /Called end on pool more than once|Cannot use a pool after calling end|node:internal/, "Startup failure should not escape as a second cleanup exception");
        }
      });
      assert.ok(!core.logs().includes(writerToken) && !core.logs().includes(cmsToken) && !core.logs().includes(new URL(databaseUrl).password));
    } finally {
      await core.stop();
    }
  });
});
