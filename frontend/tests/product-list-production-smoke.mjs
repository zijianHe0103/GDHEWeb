import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
let cmsRequests = 0;
const cmsServer = createServer((_request, response) => {
  cmsRequests += 1;
  response.writeHead(500, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  response.end("{}");
});

cmsServer.listen(0, "127.0.0.1");
await once(cmsServer, "listening");
const cmsPort = readPort(cmsServer);

try {
  for (const mode of ["preview", "cms"]) {
    await verifyProductionMode(mode, cmsPort);
  }
  assert.equal(cmsRequests, 0, "Production smoke contacted the CMS.");
  process.stdout.write(
    "Product list production smoke passed: preview/cms both 404; root 200; integration 404; CMS requests 0.\n",
  );
} finally {
  cmsServer.closeAllConnections();
  await closeServer(cmsServer);
}

async function verifyProductionMode(mode, cmsPort) {
  const port = await availablePort();
  const output = [];
  const child = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: "production",
        GDHE_PRODUCT_LIST_MODE: mode,
        GDHE_ENABLE_CMS_INTEGRATION_PAGE: "",
        WORDPRESS_API_URL: `http://127.0.0.1:${cmsPort}/wp-json`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));

  try {
    const origin = `http://127.0.0.1:${port}`;
    await waitForStatus(`${origin}/`, 200, child, output);
    const products = await fetch(`${origin}/products/`);
    const integration = await fetch(`${origin}/integration/cms`, {
      redirect: "manual",
    });

    assert.equal(
      products.status,
      404,
      `Production ${mode} mode exposed /products/.`,
    );
    assert.equal(
      integration.status,
      404,
      `Production ${mode} mode changed /integration/cms.`,
    );
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
}

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = readPort(server);
  await closeServer(server);
  return port;
}

function readPort(server) {
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new TypeError("Expected a loopback TCP address.");
  }
  return address.port;
}

async function waitForStatus(url, status, child, output) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited early.\n${output.join("")}`);
    }
    try {
      const response = await fetch(url);
      if (response.status === status) {
        return;
      }
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}.\n${output.join("")}`);
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
