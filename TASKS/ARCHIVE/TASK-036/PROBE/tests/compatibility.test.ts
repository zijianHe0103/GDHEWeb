import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import * as schemaV1 from "../src/schema-v1.js";
import * as schema from "../src/schema-v2.js";

const emptyDatabaseUrl = process.env.EMPTY_DATABASE_URL;
const upgradeDatabaseUrl = process.env.UPGRADE_DATABASE_URL;

if (!emptyDatabaseUrl || !upgradeDatabaseUrl) {
  throw new Error(
    "EMPTY_DATABASE_URL and UPGRADE_DATABASE_URL are required for the real PostgreSQL probe",
  );
}

const probeRoot = fileURLToPath(new URL("../", import.meta.url));

async function resetProbeDatabase(pool: pg.Pool): Promise<void> {
  await pool.query(
    'drop schema if exists "drizzle", "rfq", "publication", "catalog" cascade',
  );
}

async function migrateFrom(pool: pg.Pool, folder: string): Promise<void> {
  await migrate(drizzle(pool, { schema }), {
    migrationsFolder: join(probeRoot, folder),
  });
}

async function expectPostgresError(
  operation: () => Promise<unknown>,
  expectedCode: string,
): Promise<void> {
  try {
    await operation();
    assert.fail(`expected PostgreSQL error ${expectedCode}`);
  } catch (error) {
    const databaseError = error as {
      cause?: { code?: unknown };
      code?: unknown;
    };
    assert.equal(databaseError.code ?? databaseError.cause?.code, expectedCode);
  }
}

test("Drizzle migrations preserve the TASK-035 representative PostgreSQL invariants", async (t) => {
  const emptyPool = new pg.Pool({ connectionString: emptyDatabaseUrl });
  const upgradePool = new pg.Pool({ connectionString: upgradeDatabaseUrl });

  try {
    await resetProbeDatabase(emptyPool);
    await resetProbeDatabase(upgradePool);

    await t.test("migrates an empty database through generated and custom SQL", async () => {
      await migrateFrom(emptyPool, "drizzle");

      const schemas = await emptyPool.query<{ schema_name: string }>(
        `select schema_name
           from information_schema.schemata
          where schema_name in ('catalog', 'publication', 'rfq')
          order by schema_name`,
      );
      assert.deepEqual(
        schemas.rows.map((row) => row.schema_name),
        ["catalog", "publication", "rfq"],
      );

      const tables = await emptyPool.query<{ table_name: string }>(
        `select table_schema || '.' || table_name as table_name
           from information_schema.tables
          where table_schema in ('catalog', 'publication', 'rfq')
          order by table_schema, table_name`,
      );
      assert.deepEqual(
        tables.rows.map((row) => row.table_name),
        [
          "catalog.product_specs",
          "catalog.products",
          "catalog.track_product_specs",
          "publication.page_versions",
          "publication.pages",
          "rfq.idempotency_records",
          "rfq.request_lines",
          "rfq.requests",
        ],
      );

      const history = await emptyPool.query<{ count: string }>(
        'select count(*)::text as count from "drizzle"."__drizzle_migrations"',
      );
      assert.equal(history.rows[0]?.count, "3");

      const customConstraint = await emptyPool.query<{
        condeferred: boolean;
        condeferrable: boolean;
      }>(
        `select condeferrable, condeferred
           from pg_constraint
          where conname = 'pages_current_published_version_same_page_fk'`,
      );
      assert.deepEqual(customConstraint.rows, [
        { condeferrable: true, condeferred: true },
      ]);
    });

    await t.test("enforces generated primary, unique, foreign-key, check and JSONB behavior", async () => {
      const db = drizzle(emptyPool, { schema });

      const [productOne] = await db
        .insert(schema.products)
        .values({ productCode: "TRACK-A" })
        .returning({ id: schema.products.id });
      const [productTwo] = await db
        .insert(schema.products)
        .values({ productCode: "TRACK-B" })
        .returning({ id: schema.products.id });
      assert.ok(productOne && productTwo);

      await expectPostgresError(
        () =>
          db.insert(schema.products).values({
            id: productOne.id,
            productCode: "TRACK-C",
          }),
        "23505",
      );
      await expectPostgresError(
        () => db.insert(schema.products).values({ productCode: "TRACK-A" }),
        "23505",
      );
      await expectPostgresError(
        () =>
          db
            .insert(schema.productSpecs)
            .values({ productId: 999_999, specCode: "INVALID-FK" }),
        "23503",
      );

      const [specOne] = await db
        .insert(schema.productSpecs)
        .values({ productId: productOne.id, specCode: "SPEC-ONE" })
        .returning({ id: schema.productSpecs.id });
      const [specTwo] = await db
        .insert(schema.productSpecs)
        .values({ productId: productOne.id, specCode: "SPEC-TWO" })
        .returning({ id: schema.productSpecs.id });
      const [specThree] = await db
        .insert(schema.productSpecs)
        .values({ productId: productOne.id, specCode: "SPEC-THREE" })
        .returning({ id: schema.productSpecs.id });
      assert.ok(specOne && specTwo && specThree);

      await expectPostgresError(
        () =>
          db.insert(schema.productSpecs).values({
            productId: productOne.id,
            specCode: "SPEC-ONE",
          }),
        "23505",
      );

      await db.insert(schema.trackProductSpecs).values({
        productId: productOne.id,
        productSpecId: specOne.id,
        finishedLengthMm: 6_000,
      });
      await expectPostgresError(
        () =>
          db.insert(schema.trackProductSpecs).values({
            productId: productTwo.id,
            productSpecId: specTwo.id,
            finishedLengthMm: 6_000,
          }),
        "23503",
      );
      await expectPostgresError(
        () =>
          db.insert(schema.trackProductSpecs).values({
            productId: productOne.id,
            productSpecId: specThree.id,
            finishedLengthMm: 0,
          }),
        "23514",
      );

      const [pageOne] = await db
        .insert(schema.pages)
        .values({ slug: "page-one" })
        .returning({ id: schema.pages.id });
      const [pageTwo] = await db
        .insert(schema.pages)
        .values({ slug: "page-two" })
        .returning({ id: schema.pages.id });
      assert.ok(pageOne && pageTwo);

      await expectPostgresError(
        () => db.insert(schema.pages).values({ slug: "page-one" }),
        "23505",
      );
      await expectPostgresError(
        () =>
          db.insert(schema.pageVersions).values({
            pageId: pageOne.id,
            versionNumber: 0,
            publishedDocument: { title: "invalid" },
          }),
        "23514",
      );

      const [versionOne] = await db
        .insert(schema.pageVersions)
        .values({
          pageId: pageOne.id,
          versionNumber: 1,
          publishedDocument: { title: "Page one" },
        })
        .returning({ id: schema.pageVersions.id });
      const [versionTwo] = await db
        .insert(schema.pageVersions)
        .values({
          pageId: pageTwo.id,
          versionNumber: 1,
          publishedDocument: { title: "Page two" },
        })
        .returning({ id: schema.pageVersions.id });
      assert.ok(versionOne && versionTwo);

      await db
        .update(schema.pages)
        .set({ currentPublishedVersionId: versionOne.id })
        .where(eq(schema.pages.id, pageOne.id));
      await expectPostgresError(
        () =>
          db
            .update(schema.pages)
            .set({ currentPublishedVersionId: versionTwo.id })
            .where(eq(schema.pages.id, pageOne.id)),
        "23503",
      );

      const [request] = await db
        .insert(schema.requests)
        .values({ publicReference: "RFQ-CONSTRAINTS" })
        .returning({ id: schema.requests.id });
      assert.ok(request);

      await db.insert(schema.requestLines).values({
        requestId: request.id,
        lineNumber: 1,
        productId: productOne.id,
        quantity: 2,
        lineSnapshot: {
          requestedConfiguration: { lengthMm: 6_000 },
          productDisplaySnapshot: { model: "TRACK-A" },
        },
      });
      await expectPostgresError(
        () =>
          db.insert(schema.requestLines).values({
            requestId: request.id,
            lineNumber: 1,
            productId: productOne.id,
            quantity: 1,
            lineSnapshot: {},
          }),
        "23505",
      );
      await expectPostgresError(
        () =>
          db.insert(schema.requestLines).values({
            requestId: 999_999,
            lineNumber: 2,
            productId: productOne.id,
            quantity: 1,
            lineSnapshot: {},
          }),
        "23503",
      );
      await expectPostgresError(
        () =>
          db.insert(schema.requestLines).values({
            requestId: request.id,
            lineNumber: 2,
            productId: productOne.id,
            quantity: 0,
            lineSnapshot: {},
          }),
        "23514",
      );

      const jsonb = await emptyPool.query<{
        kind: string;
        length_mm: string;
      }>(
        `select jsonb_typeof(line_snapshot) as kind,
                line_snapshot #>> '{requestedConfiguration,lengthMm}' as length_mm
           from rfq.request_lines
          where request_id = $1 and line_number = 1`,
        [request.id],
      );
      assert.deepEqual(jsonb.rows, [{ kind: "object", length_mm: "6000" }]);
    });

    await t.test("rolls back every table when the second write fails", async () => {
      const db = drizzle(emptyPool, { schema });
      const [product] = await db
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.productCode, "TRACK-A"));
      assert.ok(product);

      await assert.rejects(
        db.transaction(async (tx) => {
          const [request] = await tx
            .insert(schema.requests)
            .values({ publicReference: "RFQ-ROLLBACK" })
            .returning({ id: schema.requests.id });
          assert.ok(request);
          await tx.insert(schema.requestLines).values({
            requestId: request.id,
            lineNumber: 1,
            productId: product.id,
            quantity: 0,
            lineSnapshot: { marker: "must-not-survive" },
          });
        }),
      );

      const requestCount = await emptyPool.query<{ count: string }>(
        "select count(*)::text as count from rfq.requests where public_reference = 'RFQ-ROLLBACK'",
      );
      const lineCount = await emptyPool.query<{ count: string }>(
        "select count(*)::text as count from rfq.request_lines where line_snapshot @> '{\"marker\": \"must-not-survive\"}'::jsonb",
      );
      assert.deepEqual(
        [requestCount.rows[0]?.count, lineCount.rows[0]?.count],
        ["0", "0"],
      );
    });

    await t.test("creates one RFQ for concurrent equal idempotency keys", async () => {
      const db = drizzle(emptyPool, { schema });
      const [product] = await db
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.productCode, "TRACK-A"));
      assert.ok(product);

      const submit = async (
        requestHash: string,
        publicReference: string,
      ): Promise<"created" | "replay" | "conflict"> =>
        db.transaction(async (tx) => {
          const inserted = await tx
            .insert(schema.idempotencyRecords)
            .values({
              scope: "rfq-submit",
              idempotencyKey: "same-browser-operation",
              requestHash,
            })
            .onConflictDoNothing({
              target: [
                schema.idempotencyRecords.scope,
                schema.idempotencyRecords.idempotencyKey,
              ],
            })
            .returning({ id: schema.idempotencyRecords.id });

          if (!inserted[0]) {
            const [existing] = await tx
              .select({ requestHash: schema.idempotencyRecords.requestHash })
              .from(schema.idempotencyRecords)
              .where(
                and(
                  eq(schema.idempotencyRecords.scope, "rfq-submit"),
                  eq(
                    schema.idempotencyRecords.idempotencyKey,
                    "same-browser-operation",
                  ),
                ),
              );
            assert.ok(existing);
            return existing.requestHash === requestHash ? "replay" : "conflict";
          }

          const [request] = await tx
            .insert(schema.requests)
            .values({ publicReference })
            .returning({ id: schema.requests.id });
          assert.ok(request);
          await tx.insert(schema.requestLines).values({
            requestId: request.id,
            lineNumber: 1,
            productId: product.id,
            quantity: 1,
            lineSnapshot: { source: "concurrent-idempotency" },
          });
          await tx
            .update(schema.idempotencyRecords)
            .set({
              requestId: request.id,
              responseDocument: { publicReference },
            })
            .where(eq(schema.idempotencyRecords.id, inserted[0].id));
          return "created";
        });

      const outcomes = await Promise.all(
        Array.from({ length: 8 }, (_, index) =>
          submit("hash-one", `RFQ-CONCURRENT-${index}`),
        ),
      );
      assert.equal(outcomes.filter((value) => value === "created").length, 1);
      assert.equal(outcomes.filter((value) => value === "replay").length, 7);

      assert.equal(await submit("hash-two", "RFQ-MUST-NOT-EXIST"), "conflict");

      const counts = await emptyPool.query<{
        idempotency_count: string;
        line_count: string;
        request_count: string;
      }>(
        `select
           (select count(*) from rfq.idempotency_records where scope = 'rfq-submit' and idempotency_key = 'same-browser-operation')::text as idempotency_count,
           (select count(*) from rfq.requests where public_reference like 'RFQ-CONCURRENT-%')::text as request_count,
           (select count(*) from rfq.request_lines where line_snapshot @> '{"source": "concurrent-idempotency"}'::jsonb)::text as line_count`,
      );
      assert.deepEqual(counts.rows, [
        { idempotency_count: "1", request_count: "1", line_count: "1" },
      ]);
    });

    await t.test("upgrades a previous-version database without losing rows", async () => {
      await migrateFrom(upgradePool, "drizzle-v1");
      const legacyDb = drizzle(upgradePool, { schema: schemaV1 });

      const [product] = await legacyDb
        .insert(schemaV1.products)
        .values({ productCode: "LEGACY-TRACK" })
        .returning({ id: schemaV1.products.id });
      const [spec] = await legacyDb
        .insert(schemaV1.productSpecs)
        .values({ productId: product!.id, specCode: "LEGACY-SPEC" })
        .returning({ id: schemaV1.productSpecs.id });
      const [page] = await legacyDb
        .insert(schemaV1.pages)
        .values({ slug: "legacy-page" })
        .returning({ id: schemaV1.pages.id });
      const [version] = await legacyDb
        .insert(schemaV1.pageVersions)
        .values({
          pageId: page!.id,
          versionNumber: 1,
          publishedDocument: { legacy: true },
        })
        .returning({ id: schemaV1.pageVersions.id });
      assert.ok(product && spec && page && version);

      await migrateFrom(upgradePool, "drizzle");
      const db = drizzle(upgradePool, { schema });

      await db
        .update(schema.pages)
        .set({ currentPublishedVersionId: version.id })
        .where(eq(schema.pages.id, page.id));
      await db.insert(schema.trackProductSpecs).values({
        productId: product.id,
        productSpecId: spec.id,
        finishedLengthMm: 4_300,
      });

      const readback = await upgradePool.query<{
        current_version: number;
        document: { legacy: boolean };
        length_mm: number;
        migration_count: string;
      }>(
        `select p.current_published_version_id as current_version,
                pv.published_document as document,
                tps.finished_length_mm as length_mm,
                (select count(*)::text from drizzle.__drizzle_migrations) as migration_count
           from publication.pages p
           join publication.page_versions pv on pv.page_id = p.id and pv.id = p.current_published_version_id
           join catalog.product_specs ps on ps.product_id = $1
           join catalog.track_product_specs tps on tps.product_id = ps.product_id and tps.product_spec_id = ps.id
          where p.id = $2`,
        [product.id, page.id],
      );
      assert.deepEqual(readback.rows, [
        {
          current_version: version.id,
          document: { legacy: true },
          length_mm: 4_300,
          migration_count: "3",
        },
      ]);
    });
  } finally {
    await Promise.all([emptyPool.end(), upgradePool.end()]);
  }
});
