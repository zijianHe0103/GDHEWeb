import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const frontendRoot = resolve(import.meta.dirname, "..");
const migrationScript = resolve(frontendRoot, "scripts/rfq-mysql-migrate.mjs");

describe("TASK-029 explicit RFQ MySQL migration", () => {
  test("exposes an explicit plan without connecting or reading credentials", () => {
    const result = spawnSync(process.execPath, [migrationScript, "plan"], {
      cwd: frontendRoot,
      encoding: "utf8",
      env: { NODE_ENV: "test" },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      command: "plan",
      schema: "gdhe_rfq",
      migration: "001_rfq_persistent_repository",
      tables: ["rfq_intake_records", "rfq_schema_migrations"],
      runtimePrivileges: ["SELECT", "INSERT", "UPDATE"],
    });
  });

  test("migrates, rejects drift and proves the runtime permission matrix with no retained credential", () => {
    const result = spawnSync(process.execPath, [migrationScript, "integration-test"], {
      cwd: frontendRoot,
      encoding: "utf8",
      env: {
        NODE_ENV: "test",
        PATH: process.env.PATH,
        RFQ_MYSQL_MIGRATION_HOST: "127.0.0.1",
        RFQ_MYSQL_MIGRATION_PORT: "3307",
        RFQ_MYSQL_MIGRATION_USER: "root",
      },
      timeout: 30_000,
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      command: "integration-test",
      schema: "gdhe_rfq",
      migration: {
        emptyApplied: true,
        reapplyNoop: true,
        checksumDriftRejected: true,
        objectDriftRejected: true,
        columnDriftRejected: true,
        indexDriftRejected: true,
        stateRowVersionConstraintRejected: true,
        failureCleanupSafe: true,
        verify: true,
        downIfEmptyBlocked: true,
      },
      permissions: {
        select: true,
        insert: true,
        update: true,
        sessionContract: true,
        deleteRejected: true,
        createRejected: true,
        alterRejected: true,
        dropRejected: true,
        grantRejected: true,
        migrationReadRejected: true,
        wordpressReadRejected: true,
      },
      final: {
        businessRows: 0,
        runtimeAccountExists: true,
        usableCredentialRetained: false,
      },
    });
  });

  test("recovers every exact Schema and account half-state after destructive DDL interruption", () => {
    const result = spawnSync(process.execPath, [migrationScript, "integration-test"], {
      cwd: frontendRoot,
      encoding: "utf8",
      env: {
        NODE_ENV: "test",
        PATH: process.env.PATH,
        RFQ_MYSQL_MIGRATION_HOST: "127.0.0.1",
        RFQ_MYSQL_MIGRATION_PORT: "3307",
        RFQ_MYSQL_MIGRATION_USER: "root",
      },
      timeout: 30_000,
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      recovery: {
        stateMatrix: {
          schemaAbsentAccountAbsent: true,
          schemaAbsentAccountPresent: true,
          schemaPresentAccountAbsent: true,
          schemaPresentAccountPresent: true,
        },
        initializationCleanupAfterDatabaseDrop: true,
        initializationCleanupAfterAccountDrop: true,
        downIfEmptyAfterDatabaseDrop: true,
        downIfEmptyAfterAccountDrop: true,
        wordpressIsolationPreserved: true,
      },
    });
  });
});
