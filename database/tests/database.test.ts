import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { withPostgres } from "./postgres.js";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const migrateDatabase = (url: string) => exec(process.execPath, [
  "--import", "tsx", "scripts/migrate.ts",
], { cwd: root, env: { ...process.env, DATABASE_URL: url } });

test("formal Site / Manual Track migrations on real PostgreSQL", { timeout: 120_000 }, async (t) => {
  await withPostgres(async ({ pool, url }) => {
    const version = await pool.query("SHOW server_version");
    t.diagnostic(`PostgreSQL ${version.rows[0].server_version}`);
    await migrateDatabase(url);

    await t.test("empty migration creates exactly seven business tables", async () => {
      const { rows } = await pool.query(`
        SELECT table_schema || '.' || table_name AS name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema', 'drizzle')
        ORDER BY name
      `);
      assert.deepEqual(rows.map((row) => row.name), [
        "catalog.categories", "catalog.colors", "catalog.product_colors", "catalog.products",
        "catalog.track_products", "catalog.track_standard_lengths", "site.sites",
      ]);
    });
    // Stop further probes on a missing foundation, while still exercising cleanup.
    assert.equal((await pool.query("SELECT to_regclass('catalog.products') AS table_name")).rows[0].table_name, "catalog.products");

    await t.test("read back real keys, references, CHECKs and column types", async () => {
      const { rows } = await pool.query(`
        SELECT n.nspname || '.' || c.relname AS table_name, con.conname,
          con.contype, con.condeferrable, con.confdeltype, pg_get_constraintdef(con.oid) AS definition
        FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('site', 'catalog') AND con.contype IN ('p','u','f','c')
        ORDER BY table_name, con.conname
      `);
      assert.equal(rows.filter((row) => row.contype === "p").length, 7);
      assert.equal(rows.filter((row) => row.contype === "u").length, 3);
      assert.equal(rows.filter((row) => row.contype === "f").length, 5);
      for (const row of rows.filter((row) => row.contype === "f")) {
        assert.equal(row.condeferrable, false);
        assert.equal(row.confdeltype, "r");
      }
      assert.ok(rows.some((row) => row.table_name === "catalog.product_colors" && row.definition === "PRIMARY KEY (product_id, color_id)"));
      assert.ok(rows.some((row) => row.conname === "track_standard_lengths_positive"));
      t.diagnostic(`Database constraints read back: ${JSON.stringify(rows)}`);
      const columns = await pool.query(`
        SELECT table_schema, table_name, column_name, data_type, column_default
        FROM information_schema.columns WHERE table_schema IN ('site', 'catalog')
        ORDER BY table_schema, table_name, ordinal_position
      `);
      assert.ok(columns.rows.every((row) => row.data_type !== "jsonb"));
      assert.ok(columns.rows.filter((row) => row.column_name === "id").every((row) => row.data_type === "uuid" && row.column_default === null));
      assert.ok(columns.rows.filter((row) => row.column_name.endsWith("_at")).every((row) => row.data_type === "timestamp with time zone"));
      t.diagnostic(`Database columns read back: ${JSON.stringify(columns.rows)}`);
    });

    await t.test("five agreed standard lengths and repeat migrate without reapplying", async () => {
      const lengths = await pool.query("SELECT length_mm, status FROM catalog.track_standard_lengths ORDER BY sort_order, length_mm");
      assert.deepEqual(lengths.rows, [4300, 5800, 6000, 6300, 6700].map((length_mm) => ({ length_mm, status: "active" })));
      await pool.query("UPDATE catalog.track_standard_lengths SET status = 'inactive' WHERE length_mm = 4300");
      await migrateDatabase(url);
      assert.equal((await pool.query("SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations")).rows[0].count, 2);
      assert.equal((await pool.query("SELECT status FROM catalog.track_standard_lengths WHERE length_mm = 4300")).rows[0].status, "inactive");
      t.diagnostic("Migration reapply: two recorded migrations, existing dictionary edit preserved");
    });

    const siteId = randomUUID();
    const rootCategory = randomUUID();
    const manualCategory = randomUUID();
    const productId = randomUUID();
    const secondProductId = randomUUID();
    const colorId = randomUUID();
    await t.test("create synthetic Site / Category / Product / Color and valid track relationship", async () => {
      await pool.query("INSERT INTO site.sites (id, key) VALUES ($1, 'test-site')", [siteId]);
      await pool.query("INSERT INTO catalog.categories (id, code, name_zh, name_en) VALUES ($1, 'test-tracks', '测试轨道', 'Test Tracks')", [rootCategory]);
      await pool.query("INSERT INTO catalog.categories (id, parent_id, code, name_zh, name_en) VALUES ($1, $2, 'test-manual', '测试手动', 'Test Manual')", [manualCategory, rootCategory]);
      await pool.query("INSERT INTO catalog.products (id, family_code, model, name_zh, name_en, primary_category_id) VALUES ($1, 'track', 'TEST-TRACK', '测试产品', 'Test Product', $3), ($2, 'track', 'TEST-TRACK', '测试产品二', 'Test Product Two', $3)", [productId, secondProductId, manualCategory]);
      await pool.query("INSERT INTO catalog.colors (id, code, name_zh, name_en) VALUES ($1, 'test-ivory', '测试象牙白', 'Test Ivory')", [colorId]);
      const database = drizzle(pool);
      await database.transaction(async (tx) => {
        await tx.execute(sql`INSERT INTO catalog.track_products (product_id, allows_custom_length, quantity_unit) VALUES (${productId}, true, 'piece')`);
        await tx.execute(sql`INSERT INTO catalog.product_colors (product_id, color_id, is_public, status, sort_order) VALUES (${productId}, ${colorId}, true, 'active', 0)`);
      });
      assert.equal((await pool.query("SELECT count(*)::int AS count FROM catalog.products WHERE model = 'TEST-TRACK'")).rows[0].count, 2);
      assert.equal((await pool.query("SELECT status FROM site.sites WHERE id = $1", [siteId])).rows[0].status, "inactive");
      assert.equal((await pool.query("SELECT allows_custom_length FROM catalog.track_products WHERE product_id = $1", [productId])).rows[0].allows_custom_length, true);
    });

    const invalidCases: [string, string, unknown[], string][] = [
      ["unknown parent Category", "UPDATE catalog.categories SET parent_id = $1 WHERE id = $2", [randomUUID(), manualCategory], "23503"],
      ["unknown primary Category", "UPDATE catalog.products SET primary_category_id = $1 WHERE id = $2", [randomUUID(), productId], "23503"],
      ["unknown relation Product", "INSERT INTO catalog.product_colors (product_id, color_id) VALUES ($1, $2)", [randomUUID(), colorId], "23503"],
      ["unknown relation Color", "INSERT INTO catalog.product_colors (product_id, color_id) VALUES ($1, $2)", [productId, randomUUID()], "23503"],
      ["unknown track Product", "INSERT INTO catalog.track_products (product_id, allows_custom_length, quantity_unit) VALUES ($1, true, 'piece')", [randomUUID()], "23503"],
      ["duplicate Product Color", "INSERT INTO catalog.product_colors (product_id, color_id) VALUES ($1, $2)", [productId, colorId], "23505"],
      ["duplicate track extension", "INSERT INTO catalog.track_products (product_id, allows_custom_length, quantity_unit) VALUES ($1, false, 'piece')", [productId], "23505"],
      ["duplicate Site key", "INSERT INTO site.sites (id, key) VALUES ($1, 'test-site')", [randomUUID()], "23505"],
      ["duplicate Category code", "INSERT INTO catalog.categories (id, code, name_zh, name_en) VALUES ($1, 'test-manual', '测试', 'Test')", [randomUUID()], "23505"],
      ["duplicate Color code", "INSERT INTO catalog.colors (id, code, name_zh, name_en) VALUES ($1, 'test-ivory', '测试', 'Test')", [randomUUID()], "23505"],
      ["duplicate length", "INSERT INTO catalog.track_standard_lengths (length_mm) VALUES (6000)", [], "23505"],
      ["zero length", "INSERT INTO catalog.track_standard_lengths (length_mm) VALUES (0)", [], "23514"],
      ["negative length", "INSERT INTO catalog.track_standard_lengths (length_mm) VALUES (-1)", [], "23514"],
      ["fractional millimetres", "INSERT INTO catalog.track_standard_lengths (length_mm) VALUES ($1)", ["6000.5"], "22P02"],
      ["negative length order", "UPDATE catalog.track_standard_lengths SET sort_order = -1 WHERE length_mm = 6000", [], "23514"],
      ["negative Color order", "UPDATE catalog.product_colors SET sort_order = -1 WHERE product_id = $1", [productId], "23514"],
      ["invalid lifecycle state", "UPDATE catalog.products SET status = 'published' WHERE id = $1", [productId], "23514"],
      ["unsupported Product family", "UPDATE catalog.products SET family_code = 'tape' WHERE id = $1", [productId], "23514"],
      ["unsupported track unit", "UPDATE catalog.track_products SET quantity_unit = 'metre' WHERE product_id = $1", [productId], "23514"],
      ["self-parent Category", "UPDATE catalog.categories SET parent_id = id WHERE id = $1", [manualCategory], "23514"],
      ["blank model", "UPDATE catalog.products SET model = '   ' WHERE id = $1", [productId], "23514"],
      ["missing required unit", "UPDATE catalog.track_products SET quantity_unit = NULL WHERE product_id = $1", [productId], "23502"],
      ["referenced Product deletion", "DELETE FROM catalog.products WHERE id = $1", [productId], "23001"],
      ["referenced Color deletion", "DELETE FROM catalog.colors WHERE id = $1", [colorId], "23001"],
      ["referenced Category deletion", "DELETE FROM catalog.categories WHERE id = $1", [manualCategory], "23001"],
    ];
    for (const [name, statement, parameters, code] of invalidCases) {
      await t.test(`database rejects ${name} (${code})`, async () => {
        await assert.rejects(pool.query(statement, parameters), { code });
      });
    }

    await t.test("inactive/non-public relationship is retained, not deleted", async () => {
      await pool.query("UPDATE catalog.product_colors SET status = 'inactive', is_public = false WHERE product_id = $1 AND color_id = $2", [productId, colorId]);
      assert.deepEqual((await pool.query("SELECT status, is_public FROM catalog.product_colors WHERE product_id = $1 AND color_id = $2", [productId, colorId])).rows, [{ status: "inactive", is_public: false }]);
    });

    await t.test("second table failure rolls back all preceding writes", async () => {
      const rolledBackProduct = randomUUID();
      await assert.rejects(drizzle(pool).transaction(async (tx) => {
        await tx.execute(sql`INSERT INTO catalog.products (id, family_code, model, name_zh, name_en, primary_category_id)
          VALUES (${rolledBackProduct}, 'track', 'TEST-ROLLBACK', '测试回滚', 'Test Rollback', ${manualCategory})`);
        await tx.execute(sql`INSERT INTO catalog.product_colors (product_id, color_id) VALUES (${rolledBackProduct}, ${colorId})`);
        await tx.execute(sql`INSERT INTO catalog.track_products (product_id, allows_custom_length, quantity_unit) VALUES (${rolledBackProduct}, true, 'invalid')`);
      }), (error: unknown) => {
        assert.equal((error as { cause: { code: string } }).cause.code, "23514");
        return true;
      });
      for (const table of ["products", "product_colors", "track_products"]) {
        const key = table === "products" ? "id" : "product_id";
        assert.equal((await pool.query(`SELECT count(*)::int AS count FROM catalog.${table} WHERE ${key} = $1`, [rolledBackProduct])).rows[0].count, 0);
      }
      t.diagnostic("Rollback: products=0, product_colors=0, track_products=0 for failed transaction");
    });
  });
});

test("failure cleanup deletes only its own newly created PostgreSQL container", { timeout: 30_000 }, async () => {
  const before = (await exec("docker", ["ps", "--quiet"])).stdout.trim().split("\n").filter(Boolean).sort();
  let ownedId = "";
  const intentionalFailure = new Error("intentional test body failure");
  await assert.rejects(withPostgres(async ({ containerId }) => {
    ownedId = containerId;
    throw intentionalFailure;
  }), (error) => error === intentionalFailure);
  assert.ok(ownedId.length > 0);
  const after = (await exec("docker", ["ps", "--quiet"])).stdout.trim().split("\n").filter(Boolean).sort();
  assert.deepEqual(after, before);
  assert.equal((await exec("docker", ["ps", "--all", "--quiet", "--filter", `id=${ownedId}`])).stdout.trim(), "");
});
