import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, request as httpRequest } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

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
let mixedCalls = 0;
let legacyCalls = 0;
let intentPosts = 0;
let intakePosts = 0;
let wordpressMode = "success";
const wordpress = createServer((request, response) => {
  if (request.url === "/wp-json/gdhe/v1/quote-line-validations") mixedCalls += 1;
  else legacyCalls += 1;
  request.resume();
  if (wordpressMode === "transport") {
    request.socket.destroy();
    return;
  }
  response.writeHead(200, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  response.end(wordpressMode === "mixed" ? "{}" : mixedResponse);
});

wordpress.listen(0, "127.0.0.1");
await once(wordpress, "listening");
const wordpressPort = readPort(wordpress);

try {
  await verifyEnabled("accepted", [201, 200, 409]);
  assert.equal(mixedCalls, 1, "Accepted/replay/conflict made more than one mixed POST.");
  assert.equal(legacyCalls, 0, "Accepted flow called a legacy CMS endpoint.");

  await verifyEnabled("indeterminate", [202, 202]);
  assert.equal(mixedCalls, 2, "Indeterminate replay resent the mixed POST.");
  assert.equal(legacyCalls, 0, "Indeterminate flow called a legacy CMS endpoint.");

  await verifyEnabled("rejected_before_delivery", [409, 409]);
  assert.equal(mixedCalls, 3, "Rejected-before-delivery replay resent the mixed POST.");
  await verifyCustomerFieldFailure();
  assert.equal(mixedCalls, 3, "A customer-field failure contacted WordPress.");
  for (const mode of ["mixed", "transport"]) await verifyWordPressFailure(mode);
  assert.equal(mixedCalls, 5, "A validation failure retried its mixed POST.");
  assert.equal(legacyCalls, 0, "A failure path called a legacy CMS endpoint.");

  const callsBeforeDisabled = mixedCalls + legacyCalls;
  await verifyDisabled("unset");
  await verifyDisabled("disabled");
  await verifyDisabled("production");
  assert.equal(
    mixedCalls + legacyCalls,
    callsBeforeDisabled,
    "A disabled or production route contacted WordPress.",
  );
  process.stdout.write(
    "RFQ intake production smoke PASS: visible local page/noindex disclosure; accepted/processing/conflict/customer/Basket failures; one intent plus one intake per new attempt; exact replay; zero legacy; unset/disabled/production page+Route 404.\n",
  );
} finally {
  wordpress.closeAllConnections();
  await closeServer(wordpress);
}

async function verifyWordPressFailure(mode) {
  wordpressMode = mode;
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = startNext("dev", port, {
    GDHE_PRODUCT_DETAIL_MODE: "preview",
    GDHE_RFQ_INTAKE_MODE: "stub",
    GDHE_RFQ_INTAKE_ORIGIN: origin,
    GDHE_RFQ_HMAC_KEY_VERSION: `smoke-${mode}`,
    GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
    GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
  });
  try {
    await waitForStatus(`${origin}/`, 200, child);
    await verifyLocalPage(origin);
    const postsBefore = { intent: intentPosts, intake: intakePosts };
    const result = await post(origin, await submissionWithIntent(origin));
    assert.equal(result.status, 409);
    assert.equal(result.body.error.code, "basket_refresh_required");
    assertPublicResponse(result);
    assert.deepEqual(
      { intent: intentPosts - postsBefore.intent, intake: intakePosts - postsBefore.intake },
      { intent: 1, intake: 1 },
      "A Basket failure did not use one intent POST and one intake POST.",
    );
  } finally {
    await stopNext(child);
    wordpressMode = "success";
  }
}

async function verifyEnabled(sinkOutcome, expectedStatuses) {
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = startNext("dev", port, {
    GDHE_PRODUCT_DETAIL_MODE: "preview",
    GDHE_RFQ_INTAKE_MODE: "stub",
    GDHE_RFQ_INTAKE_ORIGIN: origin,
    GDHE_RFQ_HMAC_KEY_VERSION: `smoke-${sinkOutcome}`,
    GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
    GDHE_RFQ_STUB_SINK_OUTCOME: sinkOutcome,
  });
  try {
    await waitForStatus(`${origin}/`, 200, child);
    await verifyLocalPage(origin);
    if (expectedStatuses.length === 3) await verifyRawGates(origin);
    const postsBefore = { intent: intentPosts, intake: intakePosts };
    const boundSubmission = await submissionWithIntent(origin);
    const requests = [boundSubmission, boundSubmission];
    if (expectedStatuses.length === 3) {
      const changed = structuredClone(boundSubmission);
      changed.customer.message = "A distinct smoke-test request.";
      requests.push(changed);
    }
    const responses = [];
    for (const body of requests) responses.push(await post(origin, body));
    assert.deepEqual(responses.map(({ status }) => status), expectedStatuses);
    assert.deepEqual(responses[0].body, responses[1].body, "Replay body changed.");
    assert.equal(
      JSON.stringify(requests[0]),
      JSON.stringify(requests[1]),
      "Replay did not reuse the byte-identical draft and idempotency key.",
    );
    assert.deepEqual(
      { intent: intentPosts - postsBefore.intent, intake: intakePosts - postsBefore.intake },
      { intent: 1, intake: requests.length },
      "A new attempt or its replays used the wrong HTTP call counts.",
    );
    for (const result of responses) assertPublicResponse(result);
  } finally {
    await stopNext(child);
  }
}

async function verifyCustomerFieldFailure() {
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = startNext("dev", port, {
    GDHE_PRODUCT_DETAIL_MODE: "preview",
    GDHE_RFQ_INTAKE_MODE: "stub",
    GDHE_RFQ_INTAKE_ORIGIN: origin,
    GDHE_RFQ_HMAC_KEY_VERSION: "smoke-customer-fields",
    GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
    GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
  });
  try {
    await waitForStatus(`${origin}/`, 200, child);
    await verifyLocalPage(origin);
    const postsBefore = { intent: intentPosts, intake: intakePosts };
    const invalid = await submissionWithIntent(origin);
    invalid.customer.fullName = "";
    const result = await post(origin, invalid);
    assert.equal(result.status, 400);
    assert.equal(result.body.error.code, "invalid_request");
    assertPublicResponse(result);
    assert.deepEqual(
      { intent: intentPosts - postsBefore.intent, intake: intakePosts - postsBefore.intake },
      { intent: 1, intake: 1 },
      "A customer-field failure did not use one intent POST and one intake POST.",
    );
  } finally {
    await stopNext(child);
  }
}

async function verifyRawGates(origin) {
  const callsBefore = mixedCalls + legacyCalls;
  const cases = [
    ["origin", await requestRaw(origin, {
      headers: { origin: "http://evil.example", "content-type": "application/json" },
      body: Buffer.from("{}"),
    }), 403, "request_not_allowed"],
    ["media", await requestRaw(origin, {
      headers: { origin, "content-type": "application/json; charset=utf-8" },
      body: Buffer.from("{}"),
    }), 415, "unsupported_media_type"],
    ["declared-size", await requestRaw(origin, {
      headers: {
        origin,
        "content-type": "application/json",
        "content-length": "262145",
      },
      body: Buffer.alloc(262_145),
    }), 413, "payload_too_large"],
    ["stream-size", await requestStreamRaw(origin), 413, "payload_too_large"],
    ["fatal-utf8", await requestRaw(origin, {
      headers: { origin, "content-type": "application/json" },
      body: Buffer.from([0xc3, 0x28]),
    }), 400, "invalid_request"],
  ];
  for (const [name, result, status, code] of cases) {
    assert.equal(result.status, status, `${name} returned the wrong status.`);
    assert.equal(JSON.parse(result.text).error.code, code, `${name} returned the wrong code.`);
    assertPublicResponse(result);
  }
  assert.equal(
    mixedCalls + legacyCalls,
    callsBefore,
    "A raw HTTP gate contacted WordPress.",
  );
}

async function verifyDisabled(mode) {
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const command = mode === "production" ? "start" : "dev";
  const environment = mode === "unset"
    ? { GDHE_PRODUCT_DETAIL_MODE: "preview" }
    : mode === "disabled"
      ? {
          GDHE_PRODUCT_DETAIL_MODE: "preview",
          GDHE_RFQ_INTAKE_MODE: "off",
        }
      : {
          GDHE_PRODUCT_DETAIL_MODE: "preview",
          GDHE_RFQ_INTAKE_MODE: "stub",
          GDHE_RFQ_INTAKE_ORIGIN: origin,
          GDHE_RFQ_HMAC_KEY_VERSION: "smoke-production",
          GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
          GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
        };
  const child = startNext(command, port, environment);
  try {
    await waitForStatus(`${origin}/`, 200, child);
    const page = await fetch(`${origin}/request-a-quote/`);
    assert.equal(page.status, 404, `${mode} page was not fail-closed.`);
    assertNoProtectedBytes(await page.text(), `${mode} page`);
    const result = await post(origin, submission);
    assert.equal(result.status, 404, `${mode} route was not fail-closed.`);
    assert.equal(result.text, "", `${mode} 404 exposed a body.`);
    assert.equal(result.headers.get("cache-control"), "no-store");
    const intent = await postIntent(origin);
    assert.equal(intent.status, 404, `${mode} intent route was not fail-closed.`);
    assert.equal(intent.text, "", `${mode} intent 404 exposed a body.`);
    assert.equal(intent.headers.get("cache-control"), "no-store");
  } finally {
    await stopNext(child);
  }
}

async function verifyLocalPage(origin) {
  const response = await fetch(`${origin}/request-a-quote/`);
  assert.equal(response.status, 200, "The configured local RFQ page was unavailable.");
  const html = await response.text();
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/i);
  assert.match(html, /Local RFQ collection/);
  assert.match(html, /non-production Stub is enabled/);
  assertNoProtectedBytes(html, "local RFQ page");
}

function startNext(command, port, environment) {
  const output = [];
  const child = spawn(
    process.execPath,
    [nextBin, command, "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        ...environment,
        WORDPRESS_API_URL: `http://127.0.0.1:${wordpressPort}/wp-json`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.output = output;
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));
  return child;
}

async function post(origin, body) {
  intakePosts += 1;
  const response = await fetch(`${origin}/api/rfq/intake/`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    text,
    body: text === "" ? undefined : JSON.parse(text),
  };
}

async function submissionWithIntent(origin) {
  const issued = await postIntent(origin, submission.basket.sourceBasket);
  assert.equal(issued.status, 200, "Local intent issuance failed.");
  assert.equal(issued.headers.get("cache-control"), "no-store");
  assert.equal(issued.headers.get("access-control-allow-origin"), null);
  return {
    ...structuredClone(submission),
    submissionIntent: issued.body.submissionIntent,
    idempotencyKey: issued.body.idempotencyKey,
    privacyNotice: issued.body.privacyNotice,
  };
}

async function postIntent(origin, sourceBasket = submission.basket.sourceBasket) {
  intentPosts += 1;
  const response = await fetch(`${origin}/api/rfq/intent/`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(sourceBasket),
  });
  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    text,
    body: text === "" ? undefined : JSON.parse(text),
  };
}

async function requestRaw(origin, { headers, body }) {
  const url = new URL("/api/rfq/intake", origin);
  const response = await new Promise((resolve, reject) => {
    const request = httpRequest(url, { method: "POST", headers }, (incoming) => {
      const chunks = [];
      incoming.on("data", (chunk) => chunks.push(chunk));
      incoming.on("end", () => resolve({
        status: incoming.statusCode,
        headers: new Headers(incoming.headers),
        text: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
  return response;
}

async function requestStreamRaw(origin) {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(262_145));
      controller.close();
    },
  });
  const response = await fetch(`${origin}/api/rfq/intake`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body,
    duplex: "half",
  });
  return {
    status: response.status,
    headers: response.headers,
    text: await response.text(),
  };
}

function assertPublicResponse(result) {
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(result.headers.get("access-control-allow-origin"), null);
  for (const forbidden of [
    "Ada Buyer",
    "Example Contracting",
    "GDHEPRD",
    "26000000-0000-4000-8000-000000000201",
    "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    "wp-json",
    "WORDPRESS_API_URL",
    "2025550100",
    "20".repeat(32),
  ]) assert.equal(result.text.includes(forbidden), false, `Response leaked ${forbidden}.`);
}

function assertNoProtectedBytes(text, name) {
  for (const forbidden of [
    "GDHEPRD",
    "26000000-0000-4000-8000-000000000201",
    "wp-content",
    "wp-json",
    "WORDPRESS_API_URL",
    "submissionIntent",
    "idempotencyKey",
    "submittedBasketSnapshot",
    "submittedBasketToken",
    "requestReference",
    "20".repeat(32),
  ]) assert.equal(text.includes(forbidden), false, `${name} leaked ${forbidden}.`);
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

async function stopNext(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await once(child, "exit");
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}
