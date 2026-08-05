import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const forbiddenBrowserMarkers = [
  "GDHEPRD000172",
  "21000000-0000-4000-8000-000000000001",
  "articleNumber",
  "productKind",
  "configurationPolicy",
  "large_shrink_wrap",
  "single_bag",
  "sales_follow_up",
  "wp-content",
  "WORDPRESS_API_URL",
  "feishu",
  "secret",
  "diagnostic",
] as const;

let nextProcess: ChildProcess | undefined;
let origin = "";

beforeAll(async () => {
  const port = await reservePort();
  origin = `http://127.0.0.1:${port}`;
  nextProcess = spawn(
    process.execPath,
    [
      join(projectRoot, "node_modules/next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        GDHE_PRODUCT_DETAIL_MODE: "preview",
      },
      stdio: "ignore",
    },
  );
  await waitForPage(`${origin}/products/fgd-x15-pvc/`);
}, 60_000);

afterAll(async () => {
  if (!nextProcess || nextProcess.exitCode !== null) return;
  nextProcess.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    nextProcess?.once("exit", () => resolve());
    setTimeout(resolve, 5_000).unref();
  });
}, 10_000);

describe("ProductConfigurator real preview response", () => {
  it("keeps internal product identity out of browser-facing HTML and Flight bytes", async () => {
    const response = await fetch(`${origin}/products/fgd-x15-pvc/`);
    const browserBytes = await response.text();

    expect(response.status).toBe(200);
    expect(browserBytes).toContain("Configure Your Track");
    expect(browserBytes).toContain("6 m");
    expect(browserBytes).toContain("Ivory White");
    for (const marker of forbiddenBrowserMarkers) {
      expect(browserBytes).not.toContain(marker);
    }
  });

  it("serves the local Basket route without internal identity or an active submission", async () => {
    const response = await fetch(`${origin}/request-a-quote/`);
    const browserBytes = await response.text();

    expect(response.status).toBe(200);
    expect(browserBytes).toContain("Quote Basket");
    expect(browserBytes).toContain("Loading your saved quote items");
    expect(browserBytes).toContain("noindex");
    expect(browserBytes).not.toMatch(/fetch\(|sendBeacon|submission succeeded/i);
    for (const marker of forbiddenBrowserMarkers) {
      expect(browserBytes).not.toContain(marker);
    }
  });
});

async function reservePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Unable to reserve a loopback port.");
  }
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return address.port;
}

async function waitForPage(url: string): Promise<void> {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (nextProcess?.exitCode !== null) {
      throw new Error("Next.js preview process exited before becoming ready.");
    }
    try {
      const response = await fetch(url);
      if (response.status === 200) return;
    } catch {
      // The loopback server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for the Next.js preview response.");
}
