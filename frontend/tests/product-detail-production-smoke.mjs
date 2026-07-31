import { once } from "node:events";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createConnection } from "node:net";

const frontendDirectory = new URL("..", import.meta.url);
const detailPath = "/products/fgd-x15-pvc/";

for (const mode of ["preview", "cms"]) {
  await verifyProductionMode(mode);
}

console.log(
  "Product detail production smoke passed: preview/cms final 404; CMS requests 0.",
);

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
  if (cmsAddress === null || typeof cmsAddress === "string") {
    throw new TypeError("Expected CMS loopback address.");
  }

  const port = await reservePort();
  const nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)],
    {
      cwd: frontendDirectory,
      env: {
        ...process.env,
        NODE_ENV: "production",
        GDHE_PRODUCT_DETAIL_MODE: mode,
        WORDPRESS_API_URL: `http://127.0.0.1:${cmsAddress.port}/wp-json`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let logs = "";
  nextProcess.stdout.on("data", (chunk) => {
    logs += String(chunk);
  });
  nextProcess.stderr.on("data", (chunk) => {
    logs += String(chunk);
  });

  try {
    await waitForServer(port, nextProcess);
    const initialResponse = await fetch(
      `http://127.0.0.1:${port}${detailPath}`,
      {
        redirect: "manual",
      },
    );
    const response =
      initialResponse.status === 308
        ? await fetch(
            new URL(
              initialResponse.headers.get("location") ?? "",
              `http://127.0.0.1:${port}${detailPath}`,
            ),
            { redirect: "manual" },
          )
        : initialResponse;
    if (response.status !== 404) {
      throw new Error(
        `Production ${mode} exposed Product Detail: expected 404, received ${response.status}.`,
      );
    }
    const html = await response.text();
    if (/wp-content|WORDPRESS_API_URL|wordpress origin/i.test(html)) {
      throw new Error(`Production ${mode} leaked CMS data.`);
    }
    if (cmsRequests !== 0) {
      throw new Error(
        `Production ${mode} contacted CMS ${cmsRequests} time(s).`,
      );
    }
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
  if (address === null || typeof address === "string") {
    throw new TypeError("Expected Next loopback address.");
  }
  const { port } = address;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForServer(port, processHandle) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (processHandle.exitCode !== null) {
      throw new Error(`Next exited before readiness (${processHandle.exitCode}).`);
    }
    const ready = await new Promise((resolve) => {
      const socket = createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("error", () => resolve(false));
    });
    if (ready) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Next did not become ready.");
}
