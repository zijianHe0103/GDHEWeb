import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { setTimeout } from "node:timers/promises";
import { Pool } from "pg";

const exec = promisify(execFile);
export const postgresImage = "postgres:18.6-alpine";

// Tests own this entire disposable database. No external URL or Schema deletion.
export async function withPostgres<T>(
  run: (database: { pool: Pool; url: string; containerId: string }) => Promise<T>,
): Promise<T> {
  const password = randomUUID();
  const { stdout } = await exec("docker", [
    "run", "--detach", "--rm",
    "--name", `gdhe-db-test-${randomUUID()}`,
    "--tmpfs", "/var/lib/postgresql",
    "--publish", "127.0.0.1::5432",
    "--env", "POSTGRES_USER=gdhe_test",
    "--env", `POSTGRES_PASSWORD=${password}`,
    "--env", "POSTGRES_DB=gdhe_test",
    postgresImage,
  ]);
  const containerId = stdout.trim();
  let pool: Pool | undefined;
  try {
    const port = (await exec("docker", ["port", containerId, "5432/tcp"])).stdout.trim().split(":").at(-1);
    const url = `postgresql://gdhe_test:${password}@127.0.0.1:${port}/gdhe_test`;
    pool = new Pool({ connectionString: url, connectionTimeoutMillis: 1_000 });
    let lastStartupError: unknown;
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        await pool.query("SELECT 1");
        ready = true;
        break;
      } catch (error) {
        lastStartupError = error;
        await setTimeout(100);
      }
    }
    if (!ready) throw new Error("Test PostgreSQL did not start", { cause: lastStartupError });
    return await run({ pool, url, containerId });
  } finally {
    try {
      await pool?.end();
    } finally {
      await exec("docker", ["rm", "--force", "--volumes", containerId]);
      console.log(`Removed owned PostgreSQL container ${containerId}`);
    }
  }
}
