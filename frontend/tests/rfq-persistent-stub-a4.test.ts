import { createHash, randomBytes, randomUUID } from "node:crypto";

import mysql, { type Connection, type RowDataPacket } from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import expectedResponse from "../src/lib/rfq-submission-contract/v2/samples/task025/batch-response-ready-mixed.json";
import authoritativeSample from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import type { MixedQuoteLineValidationDto } from "../src/lib/cms/server/article-number-batch";
import {
  StubRfqSink,
  createRfqIntakeRuntime,
  getValidatedRfqBody,
  validatePublicRfqSubmission,
  type RfqRepository,
} from "../src/lib/rfq/server/v2";
import {
  createMySqlRfqConnectionFactory,
  MySqlRfqRepository,
} from "../src/lib/rfq/server/v2/mysql-repository";

const CREATED_AT = "2026-08-12T03:02:00.000Z";
const runtimePassword = randomBytes(48).toString("base64url");
const finalUnknownPassword = randomBytes(48).toString("base64url");
const testFingerprints = new Set<string>();
const referenceAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
let migrationAuthority: Connection;

function reference(prefix: "RFQ" | "REQ"): string {
  const bytes = randomBytes(12);
  let suffix = "";
  for (const byte of bytes) {
    suffix += referenceAlphabet[byte % referenceAlphabet.length];
  }
  return `${prefix}-${suffix}`;
}

function submission(label: string) {
  const idempotencyKey = randomUUID();
  const keyFingerprint = createHash("sha256")
    .update(idempotencyKey, "utf8")
    .digest("hex");
  testFingerprints.add(keyFingerprint);
  return Object.freeze({
    keyFingerprint,
    document: validatePublicRfqSubmission({
      ...structuredClone(publicSubmission),
      idempotencyKey,
      customer: {
        ...structuredClone(publicSubmission.customer),
        message: `TASK-029 A4 ${label}`,
      },
    }),
  });
}

function repository(): MySqlRfqRepository {
  return new MySqlRfqRepository({
    connect: createMySqlRfqConnectionFactory({
      host: "127.0.0.1",
      port: 3307,
      user: "gdhe_rfq_app",
      password: runtimePassword,
      database: "gdhe_rfq",
    }),
  });
}

function runtime(
  repositoryInstance: RfqRepository,
  sink: StubRfqSink,
  onMixed: () => void,
  now = CREATED_AT,
  mixedResult: () => Promise<MixedQuoteLineValidationDto> = async () =>
    structuredClone(expectedResponse) as MixedQuoteLineValidationDto,
) {
  return createRfqIntakeRuntime({
    clock: { now: () => now },
    ids: {
      nextRfqId: () => randomUUID(),
      nextPublicReference: () => reference("RFQ"),
      nextRequestReference: () => reference("REQ"),
    },
    keyMaterial: {
      keyVersion: vectors.algorithm.testKeyVersion,
      secretKey: Uint8Array.from(
        Buffer.from(vectors.algorithm.testSecretKeyHex, "hex"),
      ),
    },
    sourceSecurity: {
      ...authoritativeSample.sourceSecurity,
      outcomeCode: "new_intent" as const,
    },
    repository: repositoryInstance,
    preReservationGate: async () => undefined,
    validateMixedQuoteLines: async () => {
      onMixed();
      return mixedResult();
    },
    sink,
  });
}

async function storedRows(keyFingerprint: string) {
  const [rows] = await migrationAuthority.execute<(RowDataPacket & {
    publicReference: string;
    state: string;
    attempts: number;
    rowVersion: number;
    publicDocument: string;
  })[]>(
    "SELECT public_reference AS publicReference, state, delivery_attempt_count AS attempts, row_version AS rowVersion, CAST(public_document AS CHAR CHARACTER SET utf8mb4) AS publicDocument FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
    [Buffer.from(keyFingerprint, "hex")],
  );
  return rows;
}

type FaultPoint =
  | "before_reservation"
  | "after_reservation"
  | "before_resolving"
  | "after_resolving"
  | "before_pending"
  | "after_pending"
  | "after_indeterminate"
  | "after_accepted";

class FaultingRepository implements RfqRepository {
  readonly #base: RfqRepository;
  readonly #point: FaultPoint;

  constructor(base: RfqRepository, point: FaultPoint) {
    this.#base = base;
    this.#point = point;
  }

  async lookup(input: Parameters<RfqRepository["lookup"]>[0]) {
    return this.#base.lookup(input);
  }

  async reserve(input: Parameters<RfqRepository["reserve"]>[0]) {
    if (this.#point === "before_reservation") this.#crash();
    const result = await this.#base.reserve(input);
    if (this.#point === "after_reservation") this.#crash();
    return result;
  }

  async transition(input: Parameters<RfqRepository["transition"]>[0]) {
    const before =
      (this.#point === "before_resolving" && input.state === "resolving_lines") ||
      (this.#point === "before_pending" && input.state === "delivery_pending");
    if (before) this.#crash();
    const result = await this.#base.transition(input);
    const after =
      (this.#point === "after_resolving" && input.state === "resolving_lines") ||
      (this.#point === "after_pending" && input.state === "delivery_pending") ||
      (this.#point === "after_indeterminate" && input.state === "delivery_indeterminate") ||
      (this.#point === "after_accepted" && input.state === "accepted");
    if (after) this.#crash();
    return result;
  }

  #crash(): never {
    throw new Error("PRIVATE_SIMULATED_PROCESS_LOSS");
  }
}

class HangingSink extends StubRfqSink {
  override async deliver(document: Parameters<StubRfqSink["deliver"]>[0]): Promise<never> {
    await super.deliver(document);
    return new Promise<never>(() => undefined);
  }
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("A4 observation timed out");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
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
});

afterAll(async () => {
  if (!migrationAuthority) return;
  for (const keyFingerprint of testFingerprints) {
    await migrationAuthority.execute(
      "DELETE FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
      [Buffer.from(keyFingerprint, "hex")],
    );
  }
  await migrationAuthority.query(
    `ALTER USER 'gdhe_rfq_app'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY ${migrationAuthority.escape(finalUnknownPassword)}`,
  );
  await migrationAuthority.end();
});

describe.sequential("TASK-029 persistent restart, concurrency and crash proof", () => {
  test("converges twenty same-key requests across two repositories to one delivery", async () => {
    const attempt = submission("twenty concurrent requests");
    const sink = new StubRfqSink("accepted");
    let mixedCalls = 0;
    const runtimes = [
      runtime(repository(), sink, () => { mixedCalls += 1; }),
      runtime(repository(), sink, () => { mixedCalls += 1; }),
    ];

    const results = await Promise.all(Array.from(
      { length: 20 },
      (_, index) => runtimes[index % runtimes.length].resolve(attempt.document),
    ));
    const bodies = results.map((result) => getValidatedRfqBody(
      result.document,
      "public_receipt",
    ));
    const references = new Set(bodies.map((body) =>
      (body as { publicReference: string }).publicReference));
    const statuses = results.map((result) => result.httpStatus);

    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.every((status) => [200, 201, 202].includes(status))).toBe(true);
    expect(references.size).toBe(1);
    expect(mixedCalls).toBe(1);
    expect(sink.callCount).toBe(1);
    expect(await storedRows(attempt.keyFingerprint)).toEqual([
      expect.objectContaining({
        publicReference: [...references][0],
        state: "accepted",
        attempts: 1,
        rowVersion: 4,
      }),
    ]);
  }, 20_000);

  test.each([
    ["after_reservation", "idempotency_reserved", 0, 0, 0, 202],
    ["before_resolving", "idempotency_reserved", 0, 0, 0, 202],
    ["after_resolving", "resolving_lines", 0, 0, 0, 202],
    ["before_pending", "resolving_lines", 1, 0, 0, 202],
    ["after_pending", "delivery_pending", 1, 0, 1, 202],
    ["after_indeterminate", "delivery_indeterminate", 1, 1, 1, 202],
    ["after_accepted", "accepted", 1, 1, 1, 200],
  ] as const)(
    "keeps %s process loss durable as %s and replays without downstream work",
    async (
      point,
      state,
      expectedMixed,
      expectedSink,
      expectedAttempts,
      replayStatus,
    ) => {
      const attempt = submission(point);
      const sink = new StubRfqSink(
        point === "after_indeterminate" ? "indeterminate" : "accepted",
      );
      let mixedCalls = 0;
      const crashed = runtime(
        new FaultingRepository(repository(), point),
        sink,
        () => { mixedCalls += 1; },
      );

      let failure: unknown;
      try {
        await crashed.resolve(attempt.document);
      } catch (error) {
        failure = error;
      }
      expect(failure).toMatchObject({ category: "intake" });
      expect(JSON.stringify(failure)).not.toContain("PRIVATE_SIMULATED_PROCESS_LOSS");
      const beforeReplay = await storedRows(attempt.keyFingerprint);
      expect(beforeReplay).toEqual([
        expect.objectContaining({ state, attempts: expectedAttempts }),
      ]);

      const replay = await runtime(
        repository(),
        sink,
        () => { mixedCalls += 1; },
      ).resolve(attempt.document);

      expect(replay.httpStatus).toBe(replayStatus);
      expect(mixedCalls).toBe(expectedMixed);
      expect(sink.callCount).toBe(expectedSink);
      expect(await storedRows(attempt.keyFingerprint)).toEqual(beforeReplay);
      if (point === "after_accepted") {
        expect(getValidatedRfqBody(replay.document, "public_receipt")).toEqual(
          JSON.parse(beforeReplay[0].publicDocument),
        );
      } else {
        expect(getValidatedRfqBody(replay.document, "public_receipt")).toMatchObject({
          status: "processing",
        });
      }
    },
    20_000,
  );

  test("allows a clean first attempt after a pre-reservation process loss", async () => {
    const attempt = submission("before reservation");
    const sink = new StubRfqSink("accepted");
    let mixedCalls = 0;
    await expect(runtime(
      new FaultingRepository(repository(), "before_reservation"),
      sink,
      () => { mixedCalls += 1; },
    ).resolve(attempt.document)).rejects.toMatchObject({ category: "intake" });
    expect(await storedRows(attempt.keyFingerprint)).toEqual([]);

    const retried = await runtime(
      repository(),
      sink,
      () => { mixedCalls += 1; },
    ).resolve(attempt.document);
    expect(retried.httpStatus).toBe(201);
    expect(mixedCalls).toBe(1);
    expect(sink.callCount).toBe(1);
    expect(await storedRows(attempt.keyFingerprint)).toEqual([
      expect.objectContaining({ state: "accepted", attempts: 1 }),
    ]);
  }, 20_000);

  test("keeps a during-mixed crash at resolving and never resumes it on replay", async () => {
    const attempt = submission("during mixed");
    const sink = new StubRfqSink("accepted");
    let mixedCalls = 0;
    const running = runtime(
      repository(),
      sink,
      () => { mixedCalls += 1; },
      CREATED_AT,
      async () => new Promise<MixedQuoteLineValidationDto>(() => undefined),
    ).resolve(attempt.document);
    void running.catch(() => undefined);
    await waitUntil(() => mixedCalls === 1);
    expect(await storedRows(attempt.keyFingerprint)).toEqual([
      expect.objectContaining({ state: "resolving_lines", attempts: 0 }),
    ]);

    const replay = await runtime(
      repository(),
      sink,
      () => { mixedCalls += 1; },
    ).resolve(attempt.document);
    expect(replay.httpStatus).toBe(202);
    expect(mixedCalls).toBe(1);
    expect(sink.callCount).toBe(0);
  }, 20_000);

  test("keeps a during-or-after-Sink crash pending and never invokes it again", async () => {
    const attempt = submission("during or after sink");
    const sink = new HangingSink("accepted");
    let mixedCalls = 0;
    const running = runtime(
      repository(),
      sink,
      () => { mixedCalls += 1; },
    ).resolve(attempt.document);
    void running.catch(() => undefined);
    await waitUntil(() => sink.callCount === 1);
    expect(await storedRows(attempt.keyFingerprint)).toEqual([
      expect.objectContaining({ state: "delivery_pending", attempts: 1 }),
    ]);

    const replay = await runtime(
      repository(),
      sink,
      () => { mixedCalls += 1; },
    ).resolve(attempt.document);
    expect(replay.httpStatus).toBe(202);
    expect(mixedCalls).toBe(1);
    expect(sink.callCount).toBe(1);
  }, 20_000);

  test.each([
    ["after_pending", "delivery_pending"],
    ["after_indeterminate", "delivery_indeterminate"],
  ] as const)(
    "keeps expired %s state as recovery-required without resend or deletion",
    async (point, state) => {
      const attempt = submission(`expired ${state}`);
      const sink = new StubRfqSink(
        point === "after_indeterminate" ? "indeterminate" : "accepted",
      );
      let mixedCalls = 0;
      await expect(runtime(
        new FaultingRepository(repository(), point),
        sink,
        () => { mixedCalls += 1; },
      ).resolve(attempt.document)).rejects.toMatchObject({ category: "intake" });
      const beforeReplay = await storedRows(attempt.keyFingerprint);

      const replay = await runtime(
        repository(),
        sink,
        () => { mixedCalls += 1; },
        "2026-09-11T03:02:00.000Z",
      ).resolve(attempt.document);

      expect(replay.httpStatus).toBe(409);
      expect(getValidatedRfqBody(replay.document, "public_error")).toMatchObject({
        error: { code: "service_temporarily_unavailable" },
      });
      expect(mixedCalls).toBe(1);
      expect(sink.callCount).toBe(point === "after_indeterminate" ? 1 : 0);
      expect(await storedRows(attempt.keyFingerprint)).toEqual(beforeReplay);
      expect(beforeReplay).toEqual([expect.objectContaining({ state })]);
    },
    20_000,
  );
});
