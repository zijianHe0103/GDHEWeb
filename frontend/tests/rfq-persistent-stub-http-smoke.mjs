import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
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
let migrationAuthority;
let next;
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
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  next = spawn(
    process.execPath,
    [nextBin, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: "development",
        WORDPRESS_API_URL: `http://127.0.0.1:${wordpressPort}/wp-json`,
        GDHE_RFQ_INTAKE_MODE: "persistent_stub",
        GDHE_RFQ_INTAKE_ORIGIN: origin,
        GDHE_RFQ_HMAC_KEY_VERSION: "local-task029-a3-http",
        GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
        GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
        GDHE_RFQ_MYSQL_PASSWORD: runtimePassword,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const output = [];
  next.stdout.on("data", (chunk) => output.push(String(chunk)));
  next.stderr.on("data", (chunk) => output.push(String(chunk)));
  next.output = output;
  await waitForStatus(`${origin}/`, 200, next);

  const firstAttempt = await submissionWithIntent(origin);
  const first = await postIntake(origin, firstAttempt.body);
  const replay = await postIntake(origin, firstAttempt.body);
  const changed = structuredClone(firstAttempt.body);
  changed.customer.message = "A different canonical HTTP request.";
  const conflict = await postIntake(origin, changed);
  const distinctAttempt = await submissionWithIntent(origin);
  const distinct = await postIntake(origin, distinctAttempt.body);

  assert.deepEqual(
    [first.status, replay.status, conflict.status, distinct.status],
    [201, 200, 409, 201],
  );
  assert.deepEqual(replay.body, first.body, "Stored replay body changed.");
  assert.equal(conflict.body.error.code, "idempotency_conflict");
  assert.notEqual(
    distinct.body.publicReference,
    first.body.publicReference,
    "A distinct key reused the earlier RFQ reference.",
  );
  assert.equal(mixedCalls, 2, "Replay or conflict repeated the mixed batch.");
  assert.equal(legacyCalls, 0, "The persistent flow called a legacy CMS endpoint.");

  const [rows] = await migrationAuthority.execute(
    "SELECT LOWER(HEX(key_fingerprint)) AS keyFingerprint, public_reference AS publicReference, state, delivery_attempt_count AS attempts, CAST(public_document AS CHAR CHARACTER SET utf8mb4) AS publicDocument FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint IN (?, ?) ORDER BY key_fingerprint",
    [
      Buffer.from(firstAttempt.keyFingerprint, "hex"),
      Buffer.from(distinctAttempt.keyFingerprint, "hex"),
    ],
  );
  assert.equal(rows.length, 2);
  assert.equal(new Set(rows.map((row) => row.publicReference)).size, 2);
  for (const row of rows) {
    assert.equal(row.state, "accepted");
    assert.equal(row.attempts, 1);
  }
  const publicBytes = JSON.stringify([first, replay, conflict, distinct, rows]);
  for (const forbidden of [
    firstAttempt.idempotencyKey,
    distinctAttempt.idempotencyKey,
    runtimePassword,
    "GDHEPRD",
    "wp-json",
    "PRIVATE",
  ]) {
    assert.equal(publicBytes.includes(forbidden), false, `Public result leaked ${forbidden}.`);
  }

  process.stdout.write(
    "TASK-029 persistent_stub HTTP smoke PASS: one Next process; 201/200/409/new 201; two rows/two mixed calls; zero legacy; no public identity or credential leakage.\n",
  );
} finally {
  if (next && next.exitCode === null) {
    next.kill("SIGTERM");
    await once(next, "exit");
  }
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
}

async function submissionWithIntent(origin) {
  const response = await fetch(`${origin}/api/rfq/intent`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
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

async function postIntake(origin, body) {
  const response = await fetch(`${origin}/api/rfq/intake`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
    redirect: "error",
  });
  const text = await response.text();
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  return {
    status: response.status,
    text,
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
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
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
