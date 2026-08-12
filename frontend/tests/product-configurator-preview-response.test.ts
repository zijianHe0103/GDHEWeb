import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const forbiddenBrowserMarkers = [
  "21000000-0000-4000-8000-000000000001",
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
  "60000000-",
  "61000000-",
  "62000000-",
  "view_product",
  "direct_rfq",
  "media.gdhe.example",
  "modifiedAt",
  "directQuote",
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
        GDHE_RFQ_INTAKE_MODE: "stub",
        GDHE_RFQ_INTAKE_ORIGIN: origin,
        GDHE_RFQ_HMAC_KEY_VERSION: "local-task028-preview",
        GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
        GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
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
  it("carries public Article Number in Flight data without rendering it as customer copy", async () => {
    const response = await fetch(`${origin}/products/fgd-x15-pvc/`);
    const browserBytes = await response.text();
    const visibleMarkup = browserBytes.split("<script", 1)[0]!;

    expect(response.status).toBe(200);
    expect(browserBytes).toContain("Configure Your Track");
    expect(browserBytes).toContain("6 m");
    expect(browserBytes).toContain("Ivory White");
    expect(browserBytes).toContain("You May Also Need");
    expect(browserBytes).toContain("Show More Products");
    expect(browserBytes).toContain("GDHEPRD000172");
    expect(browserBytes).toContain("articleNumber");
    expect(visibleMarkup).not.toMatch(/GDHEPRD[0-9]{6}|Article Number/i);
    for (const marker of forbiddenBrowserMarkers) {
      expect(browserBytes).not.toContain(marker);
    }
  });

  it("serves the configured local Basket route without internal identity before hydration", async () => {
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

  it.each([
    ["test-candidate-1", "Ceiling Bracket"],
    ["test-candidate-3", "Track Connector"],
    ["test-candidate-5", "Glider Set"],
    ["test-candidate-7", "Suspension Kit"],
  ])("serves declared preview detail %s without internal identity", async (slug, name) => {
    const response = await fetch(`${origin}/products/${slug}/`);
    const browserBytes = await response.text();

    expect(response.status).toBe(200);
    expect(browserBytes).toContain(name);
    expect(browserBytes).toContain("Protected TEST_CANDIDATE");
    expect(browserBytes).toContain("not production product data");
    expect(browserBytes).toContain("navigation preview only");
    expect(browserBytes).toContain("noindex");
    for (const marker of forbiddenBrowserMarkers) {
      expect(browserBytes).not.toContain(marker);
    }
  });

  it.each([
    "/products/test-candidate-2/",
    "/products/test-candidate-4/",
    "/products/test-candidate-6/",
    "/products/test-candidate-8/",
    "/products/accessories/test-candidates/",
    "/products/unknown-product/",
  ])("keeps closed preview path %s at final 404", async (path) => {
    const response = await fetch(`${origin}${path}`);

    expect(response.status).toBe(404);
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
