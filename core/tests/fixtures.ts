import { spawn, execFile } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { Pool } from "pg";

const root = fileURLToPath(new URL("../", import.meta.url));
export const writerToken = randomBytes(32).toString("base64url");
export const cmsToken = randomBytes(32).toString("base64url");
export const ids = {
  site: randomUUID(), category: randomUUID(), inactiveCategory: randomUUID(),
  ivory: randomUUID(), black: randomUUID(), inactiveColor: randomUUID(),
};

export async function prepareDatabase(pool: Pool, adminUrl: string) {
  await promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], {
    cwd: fileURLToPath(new URL("../../database/", import.meta.url)),
    env: { ...process.env, DATABASE_URL: adminUrl },
  });
  await pool.query("INSERT INTO site.sites (id,key,status) VALUES ($1,'test-gdhe','active')", [ids.site]);
  await pool.query("INSERT INTO catalog.categories (id,code,name_zh,name_en,status) VALUES ($1,'test-manual','测试手动轨道','Test Manual Tracks','active'),($2,'test-retired','测试停用','Test Retired','inactive')", [ids.category, ids.inactiveCategory]);
  await pool.query("INSERT INTO catalog.colors (id,code,name_zh,name_en,status) VALUES ($1,'test-ivory','测试象牙白','Test Ivory White','active'),($2,'test-black','测试黑','Test Black','active'),($3,'test-retired','测试停用色','Test Retired Color','inactive')", [ids.ivory, ids.black, ids.inactiveColor]);
  const password = randomBytes(32).toString("hex");
  await pool.query(`CREATE ROLE core_test_app LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`);
  await pool.query("REVOKE CREATE ON SCHEMA public FROM PUBLIC");
  await pool.query("GRANT USAGE ON SCHEMA catalog TO core_test_app");
  await pool.query("GRANT SELECT ON catalog.categories,catalog.colors,catalog.track_standard_lengths TO core_test_app");
  await pool.query("GRANT SELECT,INSERT,UPDATE ON catalog.products,catalog.track_products,catalog.product_colors TO core_test_app");
  const url = new URL(adminUrl);
  url.username = "core_test_app";
  url.password = password;
  return url.toString();
}

export function startCore(databaseUrl: string, overrides: NodeJS.ProcessEnv = {}) {
  const child = spawn(process.execPath, ["dist/main.js"], {
    cwd: root, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, CORE_DATABASE_URL: databaseUrl, CORE_PORT: "0", CATALOG_MAINTENANCE_TOKEN: writerToken, CATALOG_CMS_TOKEN: cmsToken, ...overrides },
  });
  let logs = "";
  const exited = once(child, "exit");
  const ready = new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Core readiness timed out"));
    }, 10_000);
    child.stdout.on("data", (data) => {
      logs += String(data);
      const address = logs.match(/Core listening (http:\/\/127\.0\.0\.1:\d+)/)?.[1];
      if (address) { clearTimeout(timer); resolve(address); }
    });
    child.stderr.on("data", (data) => { logs += String(data); });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", () => { clearTimeout(timer); reject(new Error("Core exited before readiness")); });
  });
  // Callers can await a failed startup without an unhandled rejection.
  void ready.catch(() => undefined);
  return {
    ready, exited, logs: () => logs,
    async stop() {
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
      await exited;
    },
  };
}

export function productInput(overrides: Record<string, unknown> = {}) {
  return {
    model: "TEST-X38", nameZh: "测试静音轨道", nameEn: "Test Silent Track",
    primaryCategoryId: ids.category, status: "active", allowsCustomLength: true, quantityUnit: "piece",
    colors: [
      { colorId: ids.ivory, status: "active", isPublic: true, sortOrder: 0 },
      { colorId: ids.black, status: "active", isPublic: false, sortOrder: 1 },
      { colorId: ids.inactiveColor, status: "active", isPublic: true, sortOrder: 2 },
    ], ...overrides,
  };
}

export async function request(base: string, path: string, token: string | undefined, method = "GET", body?: unknown) {
  const response = await fetch(base + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(8_000),
  });
  return { status: response.status, body: await response.json() };
}
