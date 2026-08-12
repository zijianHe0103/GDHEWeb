import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import mysql from "mysql2/promise";

const SCHEMA = "gdhe_rfq";
const MIGRATION = "001_rfq_persistent_repository";
const RUNTIME_USER = "gdhe_rfq_app";
const RUNTIME_HOST = "127.0.0.1";
const MIGRATION_FILE = fileURLToPath(new URL(
  "../rfq-mysql/migrations/001_rfq_persistent_repository.sql",
  import.meta.url,
));
const EXPECTED_TABLES = ["rfq_intake_records", "rfq_schema_migrations"];
const EXPECTED_WORDPRESS_TABLES = 12;
const EXPECTED_TABLE_DEFINITION_HASHES = Object.freeze({
  rfq_intake_records: "c513d3672bf977c6cb443535321e942b3ba54b1c0dc6b26a622f520e4b4c8697",
  rfq_schema_migrations: "92c066f31118bfea7713208ee34844ddbea5ed503b7fc316a020aaf58dcd6044",
});
const EXPECTED_COLUMN_SHAPES = [
  ["key_fingerprint", "binary(32)", "NO", null, null],
  ["rfq_id", "binary(16)", "NO", null, null],
  ["public_reference", "char(16)", "NO", "ascii", "ascii_bin"],
  ["contract_version", "varchar(16)", "NO", "ascii", "ascii_bin"],
  ["payload_key_version", "varchar(64)", "NO", "ascii", "ascii_bin"],
  ["payload_digest", "binary(32)", "NO", null, null],
  ["comparison_token", "binary(32)", "NO", null, null],
  ["basket_snapshot_token", "binary(32)", "NO", null, null],
  ["state", "varchar(32)", "NO", "ascii", "ascii_bin"],
  ["delivery_state", "varchar(16)", "NO", "ascii", "ascii_bin"],
  ["delivery_attempt_count", "tinyint unsigned", "NO", null, null],
  ["authoritative_document", "json", "YES", null, null],
  ["public_document_kind", "varchar(16)", "NO", "ascii", "ascii_bin"],
  ["public_document", "json", "NO", null, null],
  ["initial_http_status", "smallint unsigned", "NO", null, null],
  ["created_at", "datetime(3)", "NO", null, null],
  ["expires_at", "datetime(3)", "NO", null, null],
  ["last_transition_at", "datetime(3)", "NO", null, null],
  ["row_version", "bigint unsigned", "NO", null, null],
];
const EXPECTED_MIGRATION_COLUMN_SHAPES = [
  ["version", "varchar(64)", "NO", "ascii", "ascii_bin"],
  ["checksum", "binary(32)", "NO", null, null],
  ["applied_at", "datetime(3)", "NO", null, null],
];
const EXPECTED_INDEX_SHAPES = [
  ["ix_rfq_intake_records_state_expires", 1, "state,expires_at", "BTREE"],
  ["PRIMARY", 0, "key_fingerprint", "BTREE"],
  ["uq_rfq_intake_records_public_reference", 0, "public_reference", "BTREE"],
  ["uq_rfq_intake_records_rfq_id", 0, "rfq_id", "BTREE"],
];
const EXPECTED_CHECKS = [
  "ck_rfq_contract_version",
  "ck_rfq_delivery_attempt_count",
  "ck_rfq_delivery_state",
  "ck_rfq_expiry_anchor",
  "ck_rfq_initial_http_status",
  "ck_rfq_public_document_kind",
  "ck_rfq_public_reference",
  "ck_rfq_row_version",
  "ck_rfq_state",
  "ck_rfq_state_cell",
  "ck_rfq_transition_time",
];

export const RFQ_MYSQL_PLAN = Object.freeze({
  command: "plan",
  schema: SCHEMA,
  migration: MIGRATION,
  tables: Object.freeze(EXPECTED_TABLES),
  runtimePrivileges: Object.freeze(["SELECT", "INSERT", "UPDATE"]),
});

class MigrationError extends Error {
  constructor(code) {
    super(code);
    this.name = "MigrationError";
    this.code = code;
  }
}

function assert(condition, code) {
  if (!condition) throw new MigrationError(code);
}

function migrationConfig() {
  const host = process.env.RFQ_MYSQL_MIGRATION_HOST ?? RUNTIME_HOST;
  const port = Number(process.env.RFQ_MYSQL_MIGRATION_PORT ?? "3307");
  assert(host === RUNTIME_HOST, "invalid_migration_host");
  assert(port === 3307, "invalid_migration_port");
  return {
    host,
    port,
    user: process.env.RFQ_MYSQL_MIGRATION_USER ?? "root",
    password: process.env.RFQ_MYSQL_MIGRATION_PASSWORD,
    connectTimeout: 5_000,
    timezone: "Z",
  };
}

async function migrationInput() {
  const sql = await readFile(MIGRATION_FILE, "utf8");
  return {
    sql,
    checksum: createHash("sha256").update(sql, "utf8").digest(),
  };
}

async function connectMigrationAuthority() {
  const connection = await mysql.createConnection(migrationConfig());
  const [rows] = await connection.query(
    "SELECT VERSION() AS version, @@port AS port",
  );
  assert(
    rows.length === 1 &&
      Number(rows[0].port) === 3307 &&
      String(rows[0].version).startsWith("8.4.10"),
    "wrong_mysql_target",
  );
  return connection;
}

async function schemaExists(connection) {
  const [rows] = await connection.execute(
    "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
    [SCHEMA],
  );
  return rows.length === 1;
}

function splitMigrationStatements(sql) {
  return sql
    .split(/;\s*(?:\n|$)/u)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runtimeAccountExists(connection) {
  const [rows] = await connection.execute(
    "SELECT 1 FROM mysql.user WHERE User = ? AND Host = ?",
    [RUNTIME_USER, RUNTIME_HOST],
  );
  return rows.length === 1;
}

function secret() {
  return randomBytes(48).toString("base64url");
}

async function createRuntimeAccountIfMissing(connection) {
  if (await runtimeAccountExists(connection)) return false;
  const unknownPassword = secret();
  await connection.query(
    `CREATE USER '${RUNTIME_USER}'@'${RUNTIME_HOST}' IDENTIFIED WITH caching_sha2_password BY ${connection.escape(unknownPassword)}`,
  );
  return true;
}

async function setExactRuntimeGrants(connection) {
  await connection.query(
    `REVOKE ALL PRIVILEGES, GRANT OPTION FROM '${RUNTIME_USER}'@'${RUNTIME_HOST}'`,
  );
  await connection.query(
    `GRANT SELECT, INSERT, UPDATE ON \`${SCHEMA}\`.\`rfq_intake_records\` TO '${RUNTIME_USER}'@'${RUNTIME_HOST}'`,
  );
}

async function verifyStructure(connection, expectedChecksum, verifyRuntime = true) {
  const [schemaRows] = await connection.execute(
    "SELECT DEFAULT_CHARACTER_SET_NAME AS charsetName, DEFAULT_COLLATION_NAME AS collationName FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
    [SCHEMA],
  );
  assert(
    schemaRows.length === 1 &&
      schemaRows[0].charsetName === "utf8mb4" &&
      schemaRows[0].collationName === "utf8mb4_0900_bin",
    "schema_drift",
  );

  const [tableRows] = await connection.execute(
    "SELECT TABLE_NAME AS tableName, TABLE_TYPE AS tableType, ENGINE AS engine, TABLE_COLLATION AS tableCollation FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
    [SCHEMA],
  );
  assert(
    JSON.stringify(tableRows.map((row) => row.tableName)) === JSON.stringify(EXPECTED_TABLES) &&
      tableRows.every((row) =>
        row.tableType === "BASE TABLE" &&
        row.engine === "InnoDB" &&
        row.tableCollation === "utf8mb4_0900_bin"),
    "table_drift",
  );
  const [migrationRows] = await connection.execute(
    `SELECT version, checksum FROM \`${SCHEMA}\`.\`rfq_schema_migrations\``,
  );
  assert(
    migrationRows.length === 1 &&
      migrationRows[0].version === MIGRATION &&
      Buffer.compare(migrationRows[0].checksum, expectedChecksum) === 0,
    "migration_checksum_drift",
  );

  const [columnRows] = await connection.execute(
    "SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType, IS_NULLABLE AS isNullable, CHARACTER_SET_NAME AS charsetName, COLLATION_NAME AS collationName FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION",
    [SCHEMA],
  );
  const columnShape = (tableName) => columnRows
    .filter((row) => row.tableName === tableName)
    .map((row) => [
      row.columnName,
      row.columnType,
      row.isNullable,
      row.charsetName,
      row.collationName,
    ]);
  assert(
    JSON.stringify(columnShape("rfq_intake_records")) ===
      JSON.stringify(EXPECTED_COLUMN_SHAPES) &&
      JSON.stringify(columnShape("rfq_schema_migrations")) ===
      JSON.stringify(EXPECTED_MIGRATION_COLUMN_SHAPES),
    "column_drift",
  );

  const [indexRows] = await connection.execute(
    "SELECT INDEX_NAME AS indexName, NON_UNIQUE AS nonUnique, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ',') AS columns, MIN(INDEX_TYPE) AS indexType FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rfq_intake_records' GROUP BY INDEX_NAME, NON_UNIQUE ORDER BY INDEX_NAME",
    [SCHEMA],
  );
  assert(
    JSON.stringify(indexRows.map((row) => [
      row.indexName,
      Number(row.nonUnique),
      row.columns,
      row.indexType,
    ])) === JSON.stringify(EXPECTED_INDEX_SHAPES),
    "index_drift",
  );

  const [checkRows] = await connection.execute(
    "SELECT CONSTRAINT_NAME AS constraintName FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rfq_intake_records' AND CONSTRAINT_TYPE = 'CHECK' ORDER BY CONSTRAINT_NAME",
    [SCHEMA],
  );
  assert(
    JSON.stringify(checkRows.map((row) => row.constraintName)) === JSON.stringify(EXPECTED_CHECKS),
    "check_drift",
  );
  for (const tableName of EXPECTED_TABLES) {
    const [definitionRows] = await connection.query(
      `SHOW CREATE TABLE \`${SCHEMA}\`.\`${tableName}\``,
    );
    const definitionHash = createHash("sha256")
      .update(definitionRows[0]["Create Table"], "utf8")
      .digest("hex");
    assert(
      definitionHash === EXPECTED_TABLE_DEFINITION_HASHES[tableName],
      "table_definition_drift",
    );
  }

  const [extraRows] = await connection.execute(
    "SELECT (SELECT COUNT(*) FROM information_schema.VIEWS WHERE TABLE_SCHEMA = ?) + (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ?) + (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ?) + (SELECT COUNT(*) FROM information_schema.EVENTS WHERE EVENT_SCHEMA = ?) AS extraCount",
    [SCHEMA, SCHEMA, SCHEMA, SCHEMA],
  );
  assert(Number(extraRows[0].extraCount) === 0, "unexpected_schema_object");
  if (!verifyRuntime) return true;
  assert(await runtimeAccountExists(connection), "runtime_account_missing");

  const grantee = `'${RUNTIME_USER}'@'${RUNTIME_HOST}'`;
  const [tableGrantRows] = await connection.execute(
    "SELECT PRIVILEGE_TYPE AS privilegeType, TABLE_SCHEMA AS tableSchema, TABLE_NAME AS tableName FROM information_schema.TABLE_PRIVILEGES WHERE GRANTEE = ? ORDER BY PRIVILEGE_TYPE",
    [grantee],
  );
  assert(
    JSON.stringify(tableGrantRows) === JSON.stringify([
      { privilegeType: "INSERT", tableSchema: SCHEMA, tableName: "rfq_intake_records" },
      { privilegeType: "SELECT", tableSchema: SCHEMA, tableName: "rfq_intake_records" },
      { privilegeType: "UPDATE", tableSchema: SCHEMA, tableName: "rfq_intake_records" },
    ]),
    "runtime_grant_drift",
  );
  const [schemaGrantRows] = await connection.execute(
    "SELECT PRIVILEGE_TYPE FROM information_schema.SCHEMA_PRIVILEGES WHERE GRANTEE = ?",
    [grantee],
  );
  const [globalGrantRows] = await connection.execute(
    "SELECT PRIVILEGE_TYPE FROM information_schema.USER_PRIVILEGES WHERE GRANTEE = ? AND PRIVILEGE_TYPE <> 'USAGE'",
    [grantee],
  );
  assert(schemaGrantRows.length === 0 && globalGrantRows.length === 0, "runtime_grant_drift");
  return true;
}

async function wordpressTableCount(connection) {
  const [rows] = await connection.execute(
    "SELECT COUNT(*) AS tableCount FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'GDHE' AND TABLE_TYPE = 'BASE TABLE'",
  );
  return Number(rows[0].tableCount);
}

async function assertWordPressIsolation(connection) {
  assert(
    await wordpressTableCount(connection) === EXPECTED_WORDPRESS_TABLES,
    "wordpress_baseline_drift",
  );
}

function interruptAt(actualPoint, requestedPoint) {
  if (actualPoint === requestedPoint) {
    throw new MigrationError("injected_ddl_interruption");
  }
}

async function installationState(connection) {
  return {
    schemaPresent: await schemaExists(connection),
    accountPresent: await runtimeAccountExists(connection),
  };
}

async function cleanupFailedInitialization(connection, createdAccount, faultPoint) {
  await assertWordPressIsolation(connection);
  if (await schemaExists(connection)) {
    await connection.query(`DROP DATABASE \`${SCHEMA}\``);
    interruptAt("initialization_cleanup_after_database", faultPoint);
  }
  if (createdAccount && await runtimeAccountExists(connection)) {
    await connection.query(`DROP USER '${RUNTIME_USER}'@'${RUNTIME_HOST}'`);
    interruptAt("initialization_cleanup_after_account", faultPoint);
  }
  await assertWordPressIsolation(connection);
}

async function applyMigration(connection, faultPoint = null) {
  const { sql, checksum } = await migrationInput();
  const existedBefore = await schemaExists(connection);
  let createdAccount = false;
  if (!existedBefore) {
    try {
      for (const statement of splitMigrationStatements(sql)) {
        await connection.query(statement);
      }
      await connection.execute(
        `INSERT INTO \`${SCHEMA}\`.\`rfq_schema_migrations\` (version, checksum, applied_at) VALUES (?, ?, UTC_TIMESTAMP(3))`,
        [MIGRATION, checksum],
      );
      createdAccount = await createRuntimeAccountIfMissing(connection);
      await setExactRuntimeGrants(connection);
      if (faultPoint?.startsWith("initialization_cleanup_")) {
        throw new MigrationError("injected_migration_failure");
      }
      await verifyStructure(connection, checksum);
    } catch {
      await cleanupFailedInitialization(connection, createdAccount, faultPoint);
      throw new MigrationError("migration_failed");
    }
  } else {
    await verifyStructure(connection, checksum, false);
    await createRuntimeAccountIfMissing(connection);
    await setExactRuntimeGrants(connection);
  }
  if (existedBefore) await verifyStructure(connection, checksum);
  return { created: !existedBefore, checksum };
}

async function verifyMigration(connection) {
  const { checksum } = await migrationInput();
  await verifyStructure(connection, checksum);
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS businessRows FROM \`${SCHEMA}\`.\`rfq_intake_records\``,
  );
  return { businessRows: Number(rows[0].businessRows) };
}

async function downIfEmpty(connection, faultPoint = null) {
  const { checksum } = await migrationInput();
  const state = await installationState(connection);
  if (state.schemaPresent) {
    await verifyStructure(connection, checksum, state.accountPresent);
    const [rows] = await connection.execute(
      `SELECT COUNT(*) AS businessRows FROM \`${SCHEMA}\`.\`rfq_intake_records\``,
    );
    assert(Number(rows[0].businessRows) === 0, "rollback_business_rows_present");
  }
  await assertWordPressIsolation(connection);
  if (state.schemaPresent) {
    await connection.query(`DROP DATABASE \`${SCHEMA}\``);
    interruptAt("down_after_database", faultPoint);
  }
  if (state.accountPresent) {
    await connection.query(`DROP USER '${RUNTIME_USER}'@'${RUNTIME_HOST}'`);
    interruptAt("down_after_account", faultPoint);
  }
  const finalState = await installationState(connection);
  assert(!finalState.schemaPresent && !finalState.accountPresent, "rollback_incomplete");
  await assertWordPressIsolation(connection);
}

async function expectMigrationError(code, operation) {
  try {
    await operation();
  } catch (error) {
    return error instanceof MigrationError && error.code === code;
  }
  return false;
}

async function restoreEmptyBusinessTable(connection, migrationSql) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS businessRows FROM \`${SCHEMA}\`.\`rfq_intake_records\``,
  );
  assert(Number(rows[0].businessRows) === 0, "drift_cleanup_business_rows_present");
  const createBusinessTable = splitMigrationStatements(migrationSql).find((statement) =>
    statement.startsWith(`CREATE TABLE \`${SCHEMA}\`.\`rfq_intake_records\``));
  assert(createBusinessTable, "migration_source_missing_business_table");
  await connection.query(`DROP TABLE \`${SCHEMA}\`.\`rfq_intake_records\``);
  await connection.query(createBusinessTable);
}

async function stateMatches(connection, schemaPresent, accountPresent) {
  const state = await installationState(connection);
  return state.schemaPresent === schemaPresent && state.accountPresent === accountPresent;
}

async function proveRecoveryStateMachine(connection) {
  await downIfEmpty(connection);
  const wordpressBefore = await wordpressTableCount(connection);
  const schemaAbsentAccountAbsent = await stateMatches(connection, false, false);

  await applyMigration(connection);
  const schemaPresentAccountPresent = await stateMatches(connection, true, true);

  await assertWordPressIsolation(connection);
  await connection.query(`DROP USER '${RUNTIME_USER}'@'${RUNTIME_HOST}'`);
  const schemaPresentAccountAbsent = await stateMatches(connection, true, false);
  await applyMigration(connection);

  const downDatabaseInterrupted = await expectMigrationError(
    "injected_ddl_interruption",
    () => downIfEmpty(connection, "down_after_database"),
  );
  const schemaAbsentAccountPresent = await stateMatches(connection, false, true);
  await downIfEmpty(connection);
  const downIfEmptyAfterDatabaseDrop = downDatabaseInterrupted &&
    await stateMatches(connection, false, false);

  await applyMigration(connection);
  const downAccountInterrupted = await expectMigrationError(
    "injected_ddl_interruption",
    () => downIfEmpty(connection, "down_after_account"),
  );
  await downIfEmpty(connection);
  const downIfEmptyAfterAccountDrop = downAccountInterrupted &&
    await stateMatches(connection, false, false);

  const initializationDatabaseInterrupted = await expectMigrationError(
    "injected_ddl_interruption",
    () => applyMigration(connection, "initialization_cleanup_after_database"),
  );
  const initializationDatabaseHalfState = await stateMatches(connection, false, true);
  await applyMigration(connection);
  const initializationCleanupAfterDatabaseDrop = initializationDatabaseInterrupted &&
    initializationDatabaseHalfState && await stateMatches(connection, true, true);
  await downIfEmpty(connection);

  const initializationAccountInterrupted = await expectMigrationError(
    "injected_ddl_interruption",
    () => applyMigration(connection, "initialization_cleanup_after_account"),
  );
  const initializationAccountFinalState = await stateMatches(connection, false, false);
  await applyMigration(connection);
  const initializationCleanupAfterAccountDrop = initializationAccountInterrupted &&
    initializationAccountFinalState && await stateMatches(connection, true, true);
  await downIfEmpty(connection);

  return {
    stateMatrix: {
      schemaAbsentAccountAbsent,
      schemaAbsentAccountPresent,
      schemaPresentAccountAbsent,
      schemaPresentAccountPresent,
    },
    initializationCleanupAfterDatabaseDrop,
    initializationCleanupAfterAccountDrop,
    downIfEmptyAfterDatabaseDrop,
    downIfEmptyAfterAccountDrop,
    wordpressIsolationPreserved:
      wordpressBefore === EXPECTED_WORDPRESS_TABLES &&
      await wordpressTableCount(connection) === wordpressBefore,
  };
}

function publicReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  return `RFQ-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function reservedRow(fingerprint) {
  const createdAt = "2026-08-12 06:00:00.000";
  return {
    fingerprint,
    rfqId: randomUUID(),
    publicReference: publicReference(),
    keyVersion: "task029-a1",
    payloadDigest: randomBytes(32),
    comparisonToken: randomBytes(32),
    basketSnapshotToken: randomBytes(32),
    publicDocument: JSON.stringify({
      contractVersion: "2.0.0",
      publicReference: "RFQ-23456789ABCD",
      status: "processing",
      receivedAt: "2026-08-12T06:00:00.000Z",
      lineCount: 1,
      messageKey: "rfq.processing",
      submittedBasketSnapshot: {
        schemaVersion: "3.0.0",
        revision: 1,
        writerId: "29000000-0000-4000-8000-000000000001",
        mutationId: "29000000-0000-4000-8000-000000000002",
        updatedAt: "2026-08-12T06:00:00.000Z",
        expiresAt: "2026-09-11T06:00:00.000Z",
      },
      submittedBasketToken: "a".repeat(64),
      retryAfterSeconds: 30,
    }),
    createdAt,
    expiresAt: "2026-09-11 06:00:00.000",
  };
}

async function insertReservedRow(connection, row, rowVersion = 1) {
  await connection.execute(
    `INSERT INTO \`${SCHEMA}\`.\`rfq_intake_records\` (
      key_fingerprint, rfq_id, public_reference, contract_version,
      payload_key_version, payload_digest, comparison_token,
      basket_snapshot_token, state, delivery_state, delivery_attempt_count,
      authoritative_document, public_document_kind, public_document,
      initial_http_status, created_at, expires_at, last_transition_at, row_version
    ) VALUES (?, UUID_TO_BIN(?), ?, '2.0.0', ?, ?, ?, ?,
      'idempotency_reserved', 'not_started', 0, NULL, 'receipt', ?, 202,
      ?, ?, ?, ?)`,
    [
      row.fingerprint,
      row.rfqId,
      row.publicReference,
      row.keyVersion,
      row.payloadDigest,
      row.comparisonToken,
      row.basketSnapshotToken,
      row.publicDocument,
      row.createdAt,
      row.expiresAt,
      row.createdAt,
      rowVersion,
    ],
  );
}

async function rejects(operation) {
  try {
    await operation();
  } catch {
    return true;
  }
  return false;
}

async function proveRuntimePermissions(connection) {
  const transientPassword = secret();
  const finalUnknownPassword = secret();
  const fingerprint = randomBytes(32);
  let runtime;
  try {
    await connection.query(
      `ALTER USER '${RUNTIME_USER}'@'${RUNTIME_HOST}' IDENTIFIED WITH caching_sha2_password BY ${connection.escape(transientPassword)}`,
    );
    runtime = await mysql.createConnection({
      host: RUNTIME_HOST,
      port: 3307,
      user: RUNTIME_USER,
      password: transientPassword,
      database: SCHEMA,
      connectTimeout: 5_000,
      timezone: "Z",
    });
    await runtime.query("SET SESSION time_zone = '+00:00'");
    await runtime.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
    await runtime.query(
      "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'",
    );
    const [sessionRows] = await runtime.query(
      "SELECT @@session.time_zone AS timeZone, @@transaction_isolation AS isolationLevel, @@session.sql_mode AS sqlMode",
    );
    const row = reservedRow(fingerprint);
    const [beforeRows] = await runtime.execute(
      "SELECT COUNT(*) AS rowCount FROM rfq_intake_records",
    );
    await insertReservedRow(runtime, row);
    await runtime.execute(
      "UPDATE rfq_intake_records SET state = 'resolving_lines', row_version = row_version + 1 WHERE key_fingerprint = ?",
      [fingerprint],
    );
    const [updatedRows] = await runtime.execute(
      "SELECT row_version AS rowVersion FROM rfq_intake_records WHERE key_fingerprint = ?",
      [fingerprint],
    );
    const [wordpressTables] = await connection.execute(
      "SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'GDHE' AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME LIMIT 1",
    );
    assert(wordpressTables.length === 1, "wordpress_baseline_missing");
    const wordpressTable = wordpressTables[0].tableName.replaceAll("`", "``");
    const permissions = {
      select: Number(beforeRows[0].rowCount) >= 0,
      insert: updatedRows.length === 1,
      update: Number(updatedRows[0].rowVersion) === 2,
      sessionContract:
        sessionRows.length === 1 &&
        sessionRows[0].timeZone === "+00:00" &&
        sessionRows[0].isolationLevel === "READ-COMMITTED" &&
        sessionRows[0].sqlMode ===
          "STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION",
      deleteRejected: await rejects(() => runtime.execute(
        "DELETE FROM rfq_intake_records WHERE key_fingerprint = ?",
        [fingerprint],
      )),
      createRejected: await rejects(() => runtime.query(
        "CREATE TABLE gdhe_rfq.task029_runtime_probe (id INT PRIMARY KEY)",
      )),
      alterRejected: await rejects(() => runtime.query(
        "ALTER TABLE gdhe_rfq.rfq_intake_records ADD COLUMN task029_runtime_probe INT NULL",
      )),
      dropRejected: await rejects(() => runtime.query(
        "DROP TABLE gdhe_rfq.rfq_intake_records",
      )),
      grantRejected: await rejects(() => runtime.query(
        `GRANT SELECT ON gdhe_rfq.rfq_intake_records TO 'task029_forbidden_probe'@'127.0.0.1'`,
      )),
      migrationReadRejected: await rejects(() => runtime.query(
        "SELECT version FROM gdhe_rfq.rfq_schema_migrations",
      )),
      wordpressReadRejected: await rejects(() => runtime.query(
        `SELECT 1 FROM \`GDHE\`.\`${wordpressTable}\` LIMIT 1`,
      )),
    };
    assert(Object.values(permissions).every(Boolean), "runtime_permission_matrix_failed");
    return permissions;
  } finally {
    if (runtime) await runtime.end();
    await connection.execute(
      `DELETE FROM \`${SCHEMA}\`.\`rfq_intake_records\` WHERE key_fingerprint = ?`,
      [fingerprint],
    );
    await connection.query(
      `DROP TABLE IF EXISTS \`${SCHEMA}\`.\`task029_runtime_probe\``,
    );
    const [columns] = await connection.execute(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rfq_intake_records' AND COLUMN_NAME = 'task029_runtime_probe'",
      [SCHEMA],
    );
    if (columns.length > 0) {
      await connection.query(
        `ALTER TABLE \`${SCHEMA}\`.\`rfq_intake_records\` DROP COLUMN \`task029_runtime_probe\``,
      );
    }
    await connection.query(
      `DROP USER IF EXISTS 'task029_forbidden_probe'@'127.0.0.1'`,
    );
    await connection.query(
      `ALTER USER '${RUNTIME_USER}'@'${RUNTIME_HOST}' IDENTIFIED WITH caching_sha2_password BY ${connection.escape(finalUnknownPassword)}`,
    );
  }
}

async function runIntegrationTest(connection) {
  const recovery = await proveRecoveryStateMachine(connection);
  const failureCleanupSafe = recovery.initializationCleanupAfterDatabaseDrop &&
    recovery.initializationCleanupAfterAccountDrop;
  const first = await applyMigration(connection);
  assert(first.created, "empty_migration_not_applied");
  const [firstRows] = await connection.execute(
    `SELECT applied_at AS appliedAt FROM \`${SCHEMA}\`.\`rfq_schema_migrations\` WHERE version = ?`,
    [MIGRATION],
  );
  await applyMigration(connection);
  const [secondRows] = await connection.execute(
    `SELECT applied_at AS appliedAt FROM \`${SCHEMA}\`.\`rfq_schema_migrations\` WHERE version = ?`,
    [MIGRATION],
  );
  const reapplyNoop = String(firstRows[0].appliedAt) === String(secondRows[0].appliedAt);
  const { checksum, sql } = await migrationInput();

  await connection.execute(
    `UPDATE \`${SCHEMA}\`.\`rfq_schema_migrations\` SET checksum = ? WHERE version = ?`,
    [Buffer.alloc(32, 0), MIGRATION],
  );
  const checksumDriftRejected = await expectMigrationError(
    "migration_checksum_drift",
    () => verifyStructure(connection, checksum),
  );
  await connection.execute(
    `UPDATE \`${SCHEMA}\`.\`rfq_schema_migrations\` SET checksum = ? WHERE version = ?`,
    [checksum, MIGRATION],
  );

  await connection.query(
    `CREATE TABLE \`${SCHEMA}\`.\`task029_object_drift_probe\` (id INT PRIMARY KEY) ENGINE=InnoDB`,
  );
  const objectDriftRejected = await expectMigrationError(
    "table_drift",
    () => verifyStructure(connection, checksum),
  );
  await connection.query(
    `DROP TABLE \`${SCHEMA}\`.\`task029_object_drift_probe\``,
  );

  await connection.query(
    `ALTER TABLE \`${SCHEMA}\`.\`rfq_intake_records\` MODIFY \`payload_key_version\` VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL`,
  );
  const columnDriftRejected = await expectMigrationError(
    "column_drift",
    () => verifyStructure(connection, checksum),
  );
  await restoreEmptyBusinessTable(connection, sql);

  const invalidVersionFingerprint = randomBytes(32);
  const stateRowVersionConstraintRejected = await rejects(() => insertReservedRow(
    connection,
    reservedRow(invalidVersionFingerprint),
    2,
  ));
  await connection.execute(
    `DELETE FROM \`${SCHEMA}\`.\`rfq_intake_records\` WHERE key_fingerprint = ?`,
    [invalidVersionFingerprint],
  );

  await connection.query(
    `ALTER TABLE \`${SCHEMA}\`.\`rfq_intake_records\` DROP INDEX \`ix_rfq_intake_records_state_expires\`, ADD INDEX \`ix_rfq_intake_records_state_expires\` (\`expires_at\`, \`state\`)`,
  );
  const indexDriftRejected = await expectMigrationError(
    "index_drift",
    () => verifyStructure(connection, checksum),
  );
  await restoreEmptyBusinessTable(connection, sql);

  const rollbackFingerprint = randomBytes(32);
  await insertReservedRow(connection, reservedRow(rollbackFingerprint));
  const downIfEmptyBlocked = await expectMigrationError(
    "rollback_business_rows_present",
    () => downIfEmpty(connection),
  );
  await connection.execute(
    `DELETE FROM \`${SCHEMA}\`.\`rfq_intake_records\` WHERE key_fingerprint = ?`,
    [rollbackFingerprint],
  );

  const permissions = await proveRuntimePermissions(connection);
  const verified = await verifyMigration(connection);
  return {
    command: "integration-test",
    schema: SCHEMA,
    migration: {
      emptyApplied: first.created,
      reapplyNoop,
      checksumDriftRejected,
      objectDriftRejected,
      columnDriftRejected,
      indexDriftRejected,
      stateRowVersionConstraintRejected,
      failureCleanupSafe,
      verify: true,
      downIfEmptyBlocked,
    },
    recovery,
    permissions,
    final: {
      businessRows: verified.businessRows,
      runtimeAccountExists: await runtimeAccountExists(connection),
      usableCredentialRetained: false,
    },
  };
}

export function printPlan() {
  process.stdout.write(`${JSON.stringify(RFQ_MYSQL_PLAN)}\n`);
}

async function main() {
  const command = process.argv[2];
  if (command === "plan") {
    printPlan();
    return;
  }
  let connection;
  try {
    connection = await connectMigrationAuthority();
    if (command === "up") {
      const result = await applyMigration(connection);
      process.stdout.write(`${JSON.stringify({
        command,
        schema: SCHEMA,
        created: result.created,
        verified: true,
      })}\n`);
      return;
    }
    if (command === "verify") {
      const result = await verifyMigration(connection);
      process.stdout.write(`${JSON.stringify({
        command,
        schema: SCHEMA,
        verified: true,
        businessRows: result.businessRows,
      })}\n`);
      return;
    }
    if (command === "down-if-empty") {
      await downIfEmpty(connection);
      process.stdout.write(`${JSON.stringify({
        command,
        schema: SCHEMA,
        removed: true,
      })}\n`);
      return;
    }
    if (command === "integration-test") {
      process.stdout.write(`${JSON.stringify(await runIntegrationTest(connection))}\n`);
      return;
    }
    throw new MigrationError("unknown_command");
  } catch (error) {
    const code = error instanceof MigrationError ? error.code : "migration_command_failed";
    process.stderr.write(`${JSON.stringify({ ok: false, code })}\n`);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href) {
  await main();
}
