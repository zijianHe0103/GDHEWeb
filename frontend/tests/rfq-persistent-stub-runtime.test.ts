import { createHash, randomBytes } from "node:crypto";
import { once } from "node:events";
import { createServer, type Server } from "node:http";

import mysql, { type Connection, type RowDataPacket } from "mysql2/promise";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import { issueLocalRfqIntent } from "../src/lib/rfq/server/v2/intent";

const runtimePassword = randomBytes(48).toString("base64url");
const finalUnknownPassword = randomBytes(48).toString("base64url");
const testFingerprints = new Set<string>();
let migrationAuthority: Connection;
let wordpress: Server;
let wordpressApiUrl = "";
let mixedCalls = 0;
let legacyCalls = 0;

function setPersistentEnvironment(
  sinkOutcome: "accepted" | "indeterminate" | "rejected_before_delivery",
  nodeEnvironment = "development",
): void {
  const values = {
    NODE_ENV: nodeEnvironment,
    GDHE_RFQ_INTAKE_MODE: "persistent_stub",
    GDHE_RFQ_INTAKE_ORIGIN: "http://127.0.0.1:3000",
    GDHE_RFQ_HMAC_KEY_VERSION: "local-task029-a3",
    GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
    GDHE_RFQ_STUB_SINK_OUTCOME: sinkOutcome,
    GDHE_RFQ_MYSQL_PASSWORD: runtimePassword,
    WORDPRESS_API_URL: wordpressApiUrl,
  };
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
}

function bindNewIntent(): Readonly<{
  body: typeof publicSubmission;
  idempotencyKey: string;
  keyFingerprint: string;
}> {
  const issued = issueLocalRfqIntent(publicSubmission.basket.sourceBasket);
  const keyFingerprint = createHash("sha256")
    .update(issued.idempotencyKey, "utf8")
    .digest("hex");
  testFingerprints.add(keyFingerprint);
  return Object.freeze({
    body: {
      ...structuredClone(publicSubmission),
      submissionIntent: issued.submissionIntent,
      idempotencyKey: issued.idempotencyKey,
      privacyNotice: issued.privacyNotice,
    },
    idempotencyKey: issued.idempotencyKey,
    keyFingerprint,
  });
}

function request(body: unknown): Request {
  return new Request("http://localhost/api/rfq/intake/", {
    method: "POST",
    headers: {
      origin: "http://127.0.0.1:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function rowCount(keyFingerprint: string): Promise<number> {
  const [rows] = await migrationAuthority.execute<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
    [Buffer.from(keyFingerprint, "hex")],
  );
  return rows[0]?.count ?? -1;
}

beforeAll(async () => {
  migrationAuthority = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
  });
  await migrationAuthority.query(
    `ALTER USER 'gdhe_rfq_app'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY ${migrationAuthority.escape(runtimePassword)}`,
  );
  wordpress = createServer((incoming, outgoing) => {
    if (incoming.url === "/wp-json/gdhe/v1/quote-line-validations") mixedCalls += 1;
    else legacyCalls += 1;
    incoming.resume();
    outgoing.writeHead(200, {
      "content-type": "application/json",
      "cache-control": "no-store",
    });
    outgoing.end(JSON.stringify(expectedResponse));
  });
  wordpress.listen(0, "127.0.0.1");
  await once(wordpress, "listening");
  const address = wordpress.address();
  if (!address || typeof address === "string") throw new Error("missing fixture listener");
  wordpressApiUrl = `http://127.0.0.1:${address.port}/wp-json`;
});

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

afterAll(async () => {
  wordpress?.closeAllConnections();
  if (wordpress?.listening) {
    wordpress.close();
    await once(wordpress, "close");
  }
  if (migrationAuthority) {
    for (const value of testFingerprints) {
      await migrationAuthority.execute(
        "DELETE FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
        [Buffer.from(value, "hex")],
      );
    }
    await migrationAuthority.query(
      `ALTER USER 'gdhe_rfq_app'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY ${migrationAuthority.escape(finalUnknownPassword)}`,
    );
    await migrationAuthority.end();
  }
});

describe.sequential("TASK-029 persistent_stub Route runtime", () => {
  test("persists one accepted flow and replays/conflicts/new keys across runtime reconstruction", async () => {
    setPersistentEnvironment("accepted");
    const firstAttempt = bindNewIntent();
    const firstRoute = await import("../src/app/api/rfq/intake/route");
    const first = await firstRoute.POST(request(firstAttempt.body));

    expect(first.status).toBe(201);
    expect(await rowCount(firstAttempt.keyFingerprint)).toBe(1);
    const firstBody = await first.json();

    vi.resetModules();
    const reconstructedRoute = await import("../src/app/api/rfq/intake/route");
    const replay = await reconstructedRoute.POST(request(firstAttempt.body));
    expect(replay.status).toBe(200);
    expect(await replay.json()).toEqual(firstBody);

    const changed = structuredClone(firstAttempt.body);
    changed.customer.message = "A different canonical RFQ request.";
    const conflict = await reconstructedRoute.POST(request(changed));
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({
      error: { code: "idempotency_conflict" },
    });

    const distinctAttempt = bindNewIntent();
    const distinct = await reconstructedRoute.POST(request(distinctAttempt.body));
    expect(distinct.status).toBe(201);
    const distinctBody = await distinct.json();
    expect(distinctBody).not.toEqual(firstBody);
    expect(await rowCount(distinctAttempt.keyFingerprint)).toBe(1);
    expect(mixedCalls).toBe(2);
    expect(legacyCalls).toBe(0);

    const [rows] = await migrationAuthority.execute<(RowDataPacket & {
      state: string;
      attempts: number;
      publicDocument: string;
    })[]>(
      "SELECT state, delivery_attempt_count AS attempts, CAST(public_document AS CHAR CHARACTER SET utf8mb4) AS publicDocument FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint IN (?, ?) ORDER BY key_fingerprint",
      [
        Buffer.from(firstAttempt.keyFingerprint, "hex"),
        Buffer.from(distinctAttempt.keyFingerprint, "hex"),
      ],
    );
    expect(rows).toHaveLength(2);
    expect(rows.map(({ state, attempts }) => ({ state, attempts }))).toEqual([
      { state: "accepted", attempts: 1 },
      { state: "accepted", attempts: 1 },
    ]);
    const publicBytes = JSON.stringify([firstBody, distinctBody, ...rows]);
    for (const forbidden of [
      firstAttempt.idempotencyKey,
      distinctAttempt.idempotencyKey,
      runtimePassword,
      "GDHEPRD",
      "wp_",
      "PRIVATE",
    ]) {
      expect(publicBytes).not.toContain(forbidden);
    }
  }, 15_000);

  test.each([
    ["indeterminate", 202, "delivery_indeterminate", 1],
    ["rejected_before_delivery", 409, "rejected_before_delivery", 0],
  ] as const)(
    "stores and replays %s without another mixed request",
    async (outcome, status, state, attempts) => {
      setPersistentEnvironment(outcome);
      const attempt = bindNewIntent();
      const route = await import("../src/app/api/rfq/intake/route");
      const before = mixedCalls;
      const first = await route.POST(request(attempt.body));
      vi.resetModules();
      const replayRoute = await import("../src/app/api/rfq/intake/route");
      const replay = await replayRoute.POST(request(attempt.body));

      expect([first.status, replay.status]).toEqual([status, status]);
      expect(await replay.json()).toEqual(await first.json());
      expect(mixedCalls - before).toBe(1);
      const [rows] = await migrationAuthority.execute<(RowDataPacket & {
        state: string;
        attempts: number;
      })[]>(
        "SELECT state, delivery_attempt_count AS attempts FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
        [Buffer.from(attempt.keyFingerprint, "hex")],
      );
      expect(rows).toEqual([expect.objectContaining({ state, attempts })]);
    },
    15_000,
  );

  test("keeps production configuration closed before body, database or mixed access", async () => {
    setPersistentEnvironment("accepted", "production");
    const rowsBefore = await rowCount("f".repeat(64));
    const mixedBefore = mixedCalls;
    const requestReads = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostileRequest = new Proxy(Object.create(null), {
      get() {
        requestReads.get += 1;
        throw new Error("REQUEST_MUST_NOT_BE_READ");
      },
      getPrototypeOf() {
        requestReads.getPrototypeOf += 1;
        throw new Error("REQUEST_MUST_NOT_BE_REFLECTED");
      },
      ownKeys() {
        requestReads.ownKeys += 1;
        throw new Error("REQUEST_MUST_NOT_BE_REFLECTED");
      },
    }) as Request;
    const route = await import("../src/app/api/rfq/intake/route");
    const result = await route.POST(hostileRequest);

    expect(result.status).toBe(404);
    expect(await result.text()).toBe("");
    expect(requestReads).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });
    expect(await rowCount("f".repeat(64))).toBe(rowsBefore);
    expect(mixedCalls).toBe(mixedBefore);
  });
});
