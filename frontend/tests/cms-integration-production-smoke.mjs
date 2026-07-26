import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const projectRoot = new URL("../", import.meta.url);
const nextBinary = new URL("../node_modules/.bin/next", import.meta.url);
const homePayload = JSON.parse(
  await readFile(
    new URL(
      "../src/lib/cms/contracts/samples/success/resolve-home.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

let cmsRequests = 0;
let cmsRequestUrl = "";
const cmsServer = createServer((request, response) => {
  cmsRequests += 1;
  cmsRequestUrl = request.url ?? "";
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(homePayload));
});
cmsServer.listen(0, "127.0.0.1");
await once(cmsServer, "listening");
const cmsAddress = cmsServer.address();
if (cmsAddress === null || typeof cmsAddress === "string") {
  throw new TypeError("Expected a CMS loopback TCP address.");
}
const cmsBase = `http://127.0.0.1:${cmsAddress.port}/wp-json`;

try {
  await withNextServer(
    {
      GDHE_ENABLE_CMS_INTEGRATION_PAGE: "0",
      GDHE_CMS_INTEGRATION_PATH: "/",
      WORDPRESS_API_URL: "",
    },
    async (origin) => {
      const route = await fetch(`${origin}/integration/cms`);
      const root = await fetch(origin);
      requireEqual(route.status, 404, "disabled route status");
      requireEqual(root.status, 200, "disabled root status");
      requireIncludes(await root.text(), "Frontend foundation is running.");
      requireEqual(cmsRequests, 0, "disabled CMS request count");
    },
  );

  await withNextServer(
    {
      GDHE_ENABLE_CMS_INTEGRATION_PAGE: "1",
      GDHE_CMS_INTEGRATION_PATH: "/",
      WORDPRESS_API_URL: cmsBase,
    },
    async (origin) => {
      const route = await fetch(
        `${origin}/integration/cms?path=%2Fproducts%2Fattacker%2F`,
      );
      const html = await route.text();
      const root = await fetch(origin);

      requireEqual(route.status, 200, "enabled route status");
      requireEqual(root.status, 200, "enabled root status");
      requireIncludes(html, "CMS integration is connected");
      requireIncludes(html, homePayload.title);
      requireIncludes(html, "Module count");
      requireExcludes(html, cmsBase);
      requireExcludes(html, "safeHtml");
      requireEqual(cmsRequests, 1, "enabled CMS request count");
      requireEqual(
        cmsRequestUrl,
        "/wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0",
        "server-owned CMS path",
      );
    },
  );
} finally {
  cmsServer.closeAllConnections();
  await new Promise((resolve, reject) => {
    cmsServer.close((error) => (error ? reject(error) : resolve()));
  });
}

process.stdout.write(
  "CMS integration production smoke PASS: disabled 404, enabled 200, root 200, one fixed CMS request\n",
);

async function withNextServer(environment, assertion) {
  const port = await reservePort();
  const child = spawn(fileURLToPath(nextBinary), [
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ], {
    cwd: fileURLToPath(projectRoot),
    env: {
      ...process.env,
      ...environment,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });

  try {
    const origin = `http://127.0.0.1:${port}`;
    await waitForServer(origin, child, () => output);
    await assertion(origin);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
}

async function reservePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new TypeError("Expected a Next.js loopback TCP address.");
  }
  const { port } = address;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return port;
}

async function waitForServer(origin, child, getOutput) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before readiness.\n${getOutput()}`);
    }
    try {
      await fetch(origin);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Next.js readiness timed out.\n${getOutput()}`);
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function requireIncludes(actual, expected) {
  if (!actual.includes(expected)) {
    throw new Error(`Expected output to include ${expected}.`);
  }
}

function requireExcludes(actual, expected) {
  if (actual.includes(expected)) {
    throw new Error(`Expected output to exclude ${expected}.`);
  }
}
