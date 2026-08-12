import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { once } from "node:events";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { basename, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const nodeModules = fileURLToPath(new URL("../node_modules", import.meta.url));
const submission = JSON.parse(await readFile(new URL(
  "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json",
  import.meta.url,
), "utf8"));
const mixedResponse = await readFile(new URL(
  "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json",
  import.meta.url,
), "utf8");
const runtimePassword = randomBytes(48).toString("base64url");
const finalUnknownPassword = randomBytes(48).toString("base64url");
const fingerprints = new Set();
const temporaryRoots = [];
const nextProcesses = [];
let migrationAuthority;
let wordpress;
let mixedCalls = 0;
let legacyCalls = 0;

try {
  migrationAuthority = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
  });
  await migrationAuthority.query(
    `ALTER USER 'gdhe_rfq_app'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY ${migrationAuthority.escape(runtimePassword)}`,
  );

  wordpress = createServer((request, response) => {
    if (request.url === "/wp-json/gdhe/v1/quote-line-validations") mixedCalls += 1;
    else legacyCalls += 1;
    request.resume();
    response.writeHead(200, {
      "content-type": "application/json",
      "cache-control": "no-store",
    });
    response.end(mixedResponse);
  });
  wordpress.listen(0, "127.0.0.1");
  await once(wordpress, "listening");
  const wordpressPort = readPort(wordpress);

  const firstPort = await availablePort();
  const secondPort = await availablePort();
  assert.notEqual(firstPort, secondPort);
  const canonicalOrigin = `http://127.0.0.1:${firstPort}`;
  const firstOrigin = canonicalOrigin;
  const secondOrigin = `http://127.0.0.1:${secondPort}`;
  const firstRoot = await copyProject();
  const secondRoot = await copyProject();
  const environment = {
    NODE_ENV: "development",
    WORDPRESS_API_URL: `http://127.0.0.1:${wordpressPort}/wp-json`,
    GDHE_RFQ_INTAKE_MODE: "persistent_stub",
    GDHE_RFQ_INTAKE_ORIGIN: canonicalOrigin,
    GDHE_RFQ_HMAC_KEY_VERSION: "local-task029-a4-http",
    GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
    GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
    GDHE_RFQ_MYSQL_PASSWORD: runtimePassword,
    NEXT_TELEMETRY_DISABLED: "1",
  };
  const first = startNext(firstRoot, firstPort, environment);
  const second = startNext(secondRoot, secondPort, environment);
  nextProcesses.push(first, second);
  await Promise.all([
    waitForStatus(`${firstOrigin}/`, 200, first),
    waitForStatus(`${secondOrigin}/`, 200, second),
  ]);

  const attempt = await submissionWithIntent(firstOrigin, canonicalOrigin);
  const concurrent = await Promise.all(Array.from(
    { length: 20 },
    (_, index) => postIntake(
      index % 2 === 0 ? firstOrigin : secondOrigin,
      canonicalOrigin,
      attempt.body,
    ),
  ));
  const accepted = concurrent.find((result) => result.status === 201);
  assert.ok(accepted, "Twenty concurrent requests produced no initial 201.");
  assert.equal(
    concurrent.filter((result) => result.status === 201).length,
    1,
    "More than one concurrent request claimed the initial accepted response.",
  );
  assert.ok(
    concurrent.every((result) => [200, 201, 202].includes(result.status)),
    "Concurrent requests escaped the closed receipt status set.",
  );
  assert.equal(
    new Set(concurrent.map((result) => result.body.publicReference)).size,
    1,
    "Concurrent processes assigned more than one Public Reference.",
  );
  assert.equal(mixedCalls, 1, "Concurrent processes repeated the mixed batch.");
  assert.equal(legacyCalls, 0, "Concurrent processes called a legacy endpoint.");

  const firstReplay = await postIntake(firstOrigin, canonicalOrigin, attempt.body);
  const secondReplay = await postIntake(secondOrigin, canonicalOrigin, attempt.body);
  assert.deepEqual([firstReplay.status, secondReplay.status], [200, 200]);
  assert.deepEqual(firstReplay.body, accepted.body);
  assert.deepEqual(secondReplay.body, accepted.body);
  assert.equal(mixedCalls, 1, "Two-process replay repeated the mixed batch.");

  const [rows] = await migrationAuthority.execute(
    "SELECT public_reference AS publicReference, state, delivery_attempt_count AS attempts, row_version AS rowVersion FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
    [Buffer.from(attempt.keyFingerprint, "hex")],
  );
  assert.deepEqual(rows, [{
    publicReference: accepted.body.publicReference,
    state: "accepted",
    attempts: 1,
    rowVersion: 4,
  }]);

  await stopNext(first);
  await stopNext(second);
  const restarted = startNext(firstRoot, firstPort, environment);
  nextProcesses.push(restarted);
  await waitForStatus(`${firstOrigin}/`, 200, restarted);
  const restartReplay = await postIntake(firstOrigin, canonicalOrigin, attempt.body);
  assert.equal(restartReplay.status, 200);
  assert.deepEqual(restartReplay.body, accepted.body);
  assert.equal(mixedCalls, 1, "Restart replay repeated the mixed batch.");

  const publicBytes = JSON.stringify([
    concurrent,
    firstReplay,
    secondReplay,
    restartReplay,
    rows,
    ...nextProcesses.flatMap((child) => child.output),
  ]);
  for (const forbidden of [
    attempt.idempotencyKey,
    runtimePassword,
    "GDHEPRD",
    "PRIVATE",
  ]) {
    assert.equal(publicBytes.includes(forbidden), false, `Public proof leaked ${forbidden}.`);
  }

  process.stdout.write(
    "TASK-029 A4 HTTP smoke PASS: two simultaneous Next processes; 20 same-key requests; one reference/row/mixed batch/attempt; both-process replay; restart replay; zero legacy calls.\n",
  );
} finally {
  for (const child of nextProcesses) await stopNext(child);
  if (wordpress) {
    wordpress.closeAllConnections();
    if (wordpress.listening) await closeServer(wordpress);
  }
  if (migrationAuthority) {
    for (const fingerprint of fingerprints) {
      await migrationAuthority.execute(
        "DELETE FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
        [Buffer.from(fingerprint, "hex")],
      );
    }
    await migrationAuthority.query(
      `ALTER USER 'gdhe_rfq_app'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY ${migrationAuthority.escape(finalUnknownPassword)}`,
    );
    await migrationAuthority.end();
  }
  for (const root of temporaryRoots) {
    await rm(root, { recursive: true, force: true });
  }
}

async function copyProject() {
  const target = await mkdtemp(join(tmpdir(), "gdhe-task029-a4-next-"));
  temporaryRoots.push(target);
  await cp(projectRoot, target, {
    recursive: true,
    filter(source) {
      const local = relative(projectRoot, source);
      if (local === "") return true;
      const firstSegment = local.split(sep)[0];
      return firstSegment !== "node_modules" &&
        firstSegment !== ".next" &&
        basename(source) !== "tsconfig.tsbuildinfo";
    },
  });
  await symlink(nodeModules, join(target, "node_modules"), "dir");
  return target;
}

function startNext(root, port, environment) {
  const child = spawn(
    process.execPath,
    [
      nextBin,
      "dev",
      "--webpack",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: root,
      env: { ...process.env, ...environment },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const output = [];
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));
  child.output = output;
  return child;
}

async function stopNext(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await once(child, "exit");
}

async function submissionWithIntent(origin, canonicalOrigin) {
  const response = await fetch(`${origin}/api/rfq/intent`, {
    method: "POST",
    headers: { origin: canonicalOrigin, "content-type": "application/json" },
    body: JSON.stringify(submission.basket.sourceBasket),
    redirect: "error",
  });
  assert.equal(response.status, 200, "Local intent issuance failed.");
  const issued = await response.json();
  const keyFingerprint = createHash("sha256")
    .update(issued.idempotencyKey, "utf8")
    .digest("hex");
  fingerprints.add(keyFingerprint);
  return {
    body: {
      ...structuredClone(submission),
      submissionIntent: issued.submissionIntent,
      idempotencyKey: issued.idempotencyKey,
      privacyNotice: issued.privacyNotice,
    },
    idempotencyKey: issued.idempotencyKey,
    keyFingerprint,
  };
}

async function postIntake(origin, canonicalOrigin, body) {
  const response = await fetch(`${origin}/api/rfq/intake`, {
    method: "POST",
    headers: { origin: canonicalOrigin, "content-type": "application/json" },
    body: JSON.stringify(body),
    redirect: "error",
  });
  const text = await response.text();
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  return {
    status: response.status,
    body: text === "" ? undefined : JSON.parse(text),
  };
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
  if (!address || typeof address === "string") {
    throw new TypeError("Expected a loopback TCP address.");
  }
  return address.port;
}

async function waitForStatus(url, status, child) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`Next.js exited early.\n${child.output.join("")}`);
    }
    try {
      const response = await fetch(url);
      if (response.status === status) return;
    } catch {
      // Next.js is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}.\n${child.output.join("")}`);
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}
