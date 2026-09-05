import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";

test("plain Node can consume the schema and shared PostgreSQL harness through package exports", async () => {
  const result = await promisify(execFile)(process.execPath, ["--input-type=module", "-e", `
    import { products } from '@gdhe/database';
    import { withPostgres } from '@gdhe/database/testing';
    import { getTableName } from 'drizzle-orm';
    console.log(getTableName(products), typeof withPostgres);
  `]).catch((error: Error & { stdout: string; stderr: string; code: number }) => ({
    stdout: error.stdout, stderr: error.stderr, exitCode: error.code,
  }));
  assert.ok(!("exitCode" in result), result.stderr);
  assert.equal(result.stdout.trim(), "products function");
});
