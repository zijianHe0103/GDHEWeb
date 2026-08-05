import { once } from "node:events";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createConnection } from "node:net";

const frontendDirectory = new URL("..", import.meta.url);

for (const mode of ["preview", "cms"]) await verifyProductionMode(mode);

console.log("Quote Basket production smoke passed: preview/cms final 404; CMS requests 0; submission endpoints 0.");

async function verifyProductionMode(mode) {
  let cmsRequests = 0;
  const cmsServer = createServer((_request, response) => {
    cmsRequests += 1;
    response.writeHead(500);
    response.end();
  });
  cmsServer.listen(0, "127.0.0.1");
  await once(cmsServer, "listening");
  const cmsAddress = cmsServer.address();
  if (cmsAddress === null || typeof cmsAddress === "string") throw new TypeError("Expected CMS address.");

  const port = await reservePort();
  const nextProcess = spawn(process.execPath, [
    "node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port),
  ], {
    cwd: frontendDirectory,
    env: {
      ...process.env,
      NODE_ENV: "production",
      GDHE_PRODUCT_DETAIL_MODE: mode,
      WORDPRESS_API_URL: `http://127.0.0.1:${cmsAddress.port}/wp-json`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  nextProcess.stdout.on("data", (chunk) => { logs += String(chunk); });
  nextProcess.stderr.on("data", (chunk) => { logs += String(chunk); });

  try {
    await waitForServer(port, nextProcess);
    const initial = await fetch(`http://127.0.0.1:${port}/request-a-quote/`, { redirect: "manual" });
    const response = initial.status === 308
      ? await fetch(new URL(initial.headers.get("location") ?? "", `http://127.0.0.1:${port}/request-a-quote/`), { redirect: "manual" })
      : initial;
    if (response.status !== 404) throw new Error(`Production ${mode} exposed Quote Basket: ${response.status}.`);
    const bytes = await response.text();
    if (/wp-content|WORDPRESS_API_URL|feishu|submission succeeded/i.test(bytes)) throw new Error(`Production ${mode} leaked a protected boundary.`);
    if (cmsRequests !== 0) throw new Error(`Production ${mode} contacted CMS ${cmsRequests} time(s).`);
  } catch (error) {
    throw new Error(`${error.message}\nNext output:\n${logs}`);
  } finally {
    nextProcess.kill("SIGTERM");
    await once(nextProcess, "exit");
    cmsServer.close();
    await once(cmsServer, "close");
  }
}

async function reservePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") throw new TypeError("Expected Next address.");
  const { port } = address;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForServer(port, processHandle) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (processHandle.exitCode !== null) throw new Error("Next exited before readiness.");
    const ready = await new Promise((resolve) => {
      const socket = createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("error", () => resolve(false));
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Next did not become ready.");
}
