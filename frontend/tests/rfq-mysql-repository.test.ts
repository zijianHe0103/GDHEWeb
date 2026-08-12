import { createHash, randomBytes } from "node:crypto";

import mysql, { type Connection, type RowDataPacket } from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import processingReceiptSample from "../src/lib/rfq-submission-contract/v2/samples/positive/processing-receipt.json";
import acceptedReceiptSample from "../src/lib/rfq-submission-contract/v2/samples/positive/accepted-receipt.json";
import authoritativeSample from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import publicErrorSample from "../src/lib/rfq-submission-contract/v2/samples/positive/public-error.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import {
  createMySqlRfqConnectionFactory,
  MySqlRfqRepository,
} from "../src/lib/rfq/server/v2/mysql-repository";
import {
  getValidatedRfqBody,
  validateAuthoritativeRfqDocument,
  validatePublicRfqError,
  validatePublicRfqReceipt,
} from "../src/lib/rfq/server/v2";

const CREATED_AT = "2026-08-12T03:02:00.000Z";
const EXPIRES_AT = "2026-09-11T03:02:00.000Z";
const runtimePassword = randomBytes(48).toString("base64url");
const finalUnknownPassword = randomBytes(48).toString("base64url");
const testFingerprints = new Set<string>();
let migrationAuthority: Connection;

function fingerprint(label: string): string {
  const value = createHash("sha256").update(`task029-a2:${label}`).digest("hex");
  testFingerprints.add(value);
  return value;
}

function processingReceipt(publicReference = processingReceiptSample.publicReference) {
  return validatePublicRfqReceipt({
    ...structuredClone(processingReceiptSample),
    publicReference,
  });
}

function acceptedReceipt(publicReference = acceptedReceiptSample.publicReference) {
  return validatePublicRfqReceipt({
    ...structuredClone(acceptedReceiptSample),
    publicReference,
  });
}

function authoritative(
  input: ReturnType<typeof reservation>,
  state: "resolving_lines" | "delivery_pending" | "accepted" |
    "delivery_indeterminate" | "rejected_before_delivery",
) {
  const delivery = state === "delivery_pending"
    ? { state: "pending", attemptCount: 1, lastTransitionAt: "2026-08-12T03:02:01.000Z" }
    : state === "accepted"
      ? { state: "accepted", attemptCount: 1, lastTransitionAt: "2026-08-12T03:02:02.000Z" }
      : state === "delivery_indeterminate"
        ? { state: "indeterminate", attemptCount: 1, lastTransitionAt: "2026-08-12T03:02:02.000Z" }
        : state === "rejected_before_delivery"
          ? { state: "rejected", attemptCount: 0, lastTransitionAt: "2026-08-12T03:02:02.000Z" }
      : { state: "not_started", attemptCount: 0, lastTransitionAt: CREATED_AT };
  return validateAuthoritativeRfqDocument({
    ...structuredClone(authoritativeSample),
    rfqId: input.rfqId,
    publicReference: input.publicReference,
    receivedAt: input.createdAt,
    status: state,
    payloadDigest: input.payloadDigest,
    idempotency: {
      keyFingerprint: input.keyFingerprint,
      createdAt: input.createdAt,
      expiresAt: input.expiresAt,
    },
    delivery,
  }, input.payloadDigest);
}

function reservation(label: string, options: Readonly<{
  keyFingerprint?: string;
  publicReference?: string;
  rfqId?: string;
}> = {}) {
  const publicReference = options.publicReference ?? "RFQ-23456789ABCD";
  return {
    keyFingerprint: options.keyFingerprint ?? fingerprint(label),
    payloadDigest: {
      keyVersion: vectors.algorithm.testKeyVersion,
      value: vectors.payloadDigestHmacSha256Hex,
    },
    comparisonToken: vectors.comparisonTokenSha256Hex,
    basketSnapshotToken: vectors.submittedBasketTokenSha256Hex,
    rfqId: options.rfqId ?? "29000000-0000-4000-8000-000000000201",
    publicReference,
    createdAt: CREATED_AT,
    expiresAt: EXPIRES_AT,
    document: processingReceipt(publicReference),
  } as const;
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

describe("TASK-029 MySQL RFQ Repository", () => {
  test("shares miss, first reservation and exact replay across two instances", async () => {
    const connect = createMySqlRfqConnectionFactory({
      host: "127.0.0.1",
      port: 3307,
      user: "gdhe_rfq_app",
      password: runtimePassword,
      database: "gdhe_rfq",
    });
    const first = new MySqlRfqRepository({ connect });
    const second = new MySqlRfqRepository({ connect });
    const input = reservation("first-reservation");
    const lookup = {
      keyFingerprint: input.keyFingerprint,
      payloadDigest: input.payloadDigest.value,
      comparisonToken: input.comparisonToken,
      now: CREATED_AT,
    } as const;

    expect(await first.lookup(lookup)).toEqual({ kind: "miss" });
    expect(await first.reserve(input)).toEqual({
      kind: "reserved",
      state: "idempotency_reserved",
      rowVersion: 1,
    });

    const replay = await second.lookup({
      ...lookup,
      now: "2026-08-13T03:02:00.000Z",
    });
    expect(replay).toMatchObject({ kind: "replay", httpStatus: 202 });
    expect(getValidatedRfqBody(
      replay.kind === "replay" ? replay.document : input.document,
      "public_receipt",
    )).toEqual(getValidatedRfqBody(input.document, "public_receipt"));
    expect(await second.reserve(input)).toMatchObject({
      kind: "replay",
      httpStatus: 202,
    });
  });

  test("converges an actual duplicate-key race on one stored RFQ", async () => {
    const connect = createMySqlRfqConnectionFactory({
      host: "127.0.0.1",
      port: 3307,
      user: "gdhe_rfq_app",
      password: runtimePassword,
      database: "gdhe_rfq",
    });
    const input = reservation("duplicate-race", {
      rfqId: "29000000-0000-4000-8000-000000000209",
      publicReference: "RFQ-23456789ABCP",
    });
    const outcomes = await Promise.all([
      new MySqlRfqRepository({ connect }).reserve(input),
      new MySqlRfqRepository({ connect }).reserve(input),
    ]);
    expect(outcomes.map((outcome) => outcome.kind).sort()).toEqual(["replay", "reserved"]);
    const [rows] = await migrationAuthority.execute<(RowDataPacket & { count: number })[]>(
      "SELECT COUNT(*) AS count FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint = ?",
      [Buffer.from(input.keyFingerprint, "hex")],
    );
    expect(rows[0]?.count).toBe(1);
  });

  test("persists only the allowed row-version CAS path and replays accepted as 200", async () => {
    const repository = new MySqlRfqRepository({
      connect: createMySqlRfqConnectionFactory({
        host: "127.0.0.1",
        port: 3307,
        user: "gdhe_rfq_app",
        password: runtimePassword,
        database: "gdhe_rfq",
      }),
    });
    const input = reservation("accepted-cas", {
      rfqId: "29000000-0000-4000-8000-000000000202",
      publicReference: "RFQ-23456789ABCE",
    });
    await repository.reserve(input);

    await expect(repository.transition({
      keyFingerprint: input.keyFingerprint,
      expectedState: "idempotency_reserved",
      expectedRowVersion: 1,
      state: "resolving_lines",
      lastTransitionAt: CREATED_AT,
      authoritativeDocument: null,
      httpStatus: 202,
      document: input.document,
    })).resolves.toEqual({ kind: "transitioned", state: "resolving_lines", rowVersion: 2 });

    const pending = authoritative(input, "delivery_pending");
    await expect(repository.transition({
      keyFingerprint: input.keyFingerprint,
      expectedState: "resolving_lines",
      expectedRowVersion: 2,
      state: "delivery_pending",
      lastTransitionAt: "2026-08-12T03:02:01.000Z",
      authoritativeDocument: pending,
      httpStatus: 202,
      document: input.document,
    })).resolves.toEqual({ kind: "transitioned", state: "delivery_pending", rowVersion: 3 });

    await expect(repository.transition({
      keyFingerprint: input.keyFingerprint,
      expectedState: "resolving_lines",
      expectedRowVersion: 2,
      state: "delivery_pending",
      lastTransitionAt: "2026-08-12T03:02:01.000Z",
      authoritativeDocument: pending,
      httpStatus: 202,
      document: input.document,
    })).rejects.toMatchObject({ category: "repository", kind: "stale_transition" });

    const accepted = acceptedReceipt(input.publicReference);
    await expect(repository.transition({
      keyFingerprint: input.keyFingerprint,
      expectedState: "delivery_pending",
      expectedRowVersion: 3,
      state: "accepted",
      lastTransitionAt: "2026-08-12T03:02:02.000Z",
      authoritativeDocument: authoritative(input, "accepted"),
      httpStatus: 201,
      document: accepted,
    })).resolves.toEqual({ kind: "transitioned", state: "accepted", rowVersion: 4 });

    const replay = await repository.lookup({
      keyFingerprint: input.keyFingerprint,
      payloadDigest: input.payloadDigest.value,
      comparisonToken: input.comparisonToken,
      now: "2026-08-13T03:02:00.000Z",
    });
    expect(replay).toMatchObject({ kind: "replay", httpStatus: 200 });
    expect(getValidatedRfqBody(
      replay.kind === "replay" ? replay.document : accepted,
      "public_receipt",
    )).toEqual(getValidatedRfqBody(accepted, "public_receipt"));
  });

  test("keeps conflict, new-key identity, expiry anchor and malformed-row handling closed", async () => {
    const repository = new MySqlRfqRepository({
      connect: createMySqlRfqConnectionFactory({
        host: "127.0.0.1",
        port: 3307,
        user: "gdhe_rfq_app",
        password: runtimePassword,
        database: "gdhe_rfq",
      }),
    });
    const first = reservation("identity-a", {
      rfqId: "29000000-0000-4000-8000-000000000205",
      publicReference: "RFQ-23456789ABCJ",
    });
    const second = reservation("identity-b", {
      rfqId: "29000000-0000-4000-8000-000000000206",
      publicReference: "RFQ-23456789ABCK",
    });
    await repository.reserve(first);
    expect(await repository.lookup({
      keyFingerprint: first.keyFingerprint,
      payloadDigest: "f".repeat(64),
      comparisonToken: first.comparisonToken,
      now: EXPIRES_AT,
    })).toEqual({ kind: "conflict" });
    expect(await repository.lookup({
      keyFingerprint: first.keyFingerprint,
      payloadDigest: first.payloadDigest.value,
      comparisonToken: first.comparisonToken,
      now: EXPIRES_AT,
    })).toEqual({ kind: "recovery_required" });
    await repository.reserve(second);

    const [rows] = await migrationAuthority.execute<(RowDataPacket & {
      keyFingerprint: string;
      rfqId: string;
      publicReference: string;
      createdAt: string;
      expiresAt: string;
      rowVersion: number;
    })[]>(
      "SELECT LOWER(HEX(key_fingerprint)) AS keyFingerprint, LOWER(BIN_TO_UUID(rfq_id)) AS rfqId, public_reference AS publicReference, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS createdAt, DATE_FORMAT(expires_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS expiresAt, row_version AS rowVersion FROM gdhe_rfq.rfq_intake_records WHERE key_fingerprint IN (?, ?) ORDER BY key_fingerprint",
      [Buffer.from(first.keyFingerprint, "hex"), Buffer.from(second.keyFingerprint, "hex")],
    );
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.rfqId))).toEqual(new Set([first.rfqId, second.rfqId]));
    expect(new Set(rows.map((row) => row.publicReference))).toEqual(
      new Set([first.publicReference, second.publicReference]),
    );
    for (const row of rows) {
      expect(row.createdAt).toBe("2026-08-12T03:02:00.000000Z");
      expect(row.expiresAt).toBe("2026-09-11T03:02:00.000000Z");
      expect(row.rowVersion).toBe(1);
    }

    await migrationAuthority.execute(
      "UPDATE gdhe_rfq.rfq_intake_records SET public_document = JSON_OBJECT('privateDiagnostic', 'PRIVATE SQL') WHERE key_fingerprint = ?",
      [Buffer.from(second.keyFingerprint, "hex")],
    );
    await expect(repository.lookup({
      keyFingerprint: second.keyFingerprint,
      payloadDigest: second.payloadDigest.value,
      comparisonToken: second.comparisonToken,
      now: CREATED_AT,
    })).rejects.toMatchObject({ category: "repository", kind: "malformed_record" });
  });

  test("supports both rejection edges and indeterminate while rejecting forbidden transitions", async () => {
    const repository = new MySqlRfqRepository({
      connect: createMySqlRfqConnectionFactory({
        host: "127.0.0.1",
        port: 3307,
        user: "gdhe_rfq_app",
        password: runtimePassword,
        database: "gdhe_rfq",
      }),
    });
    const rejected = validatePublicRfqError(structuredClone(publicErrorSample));

    const resolvingReject = reservation("resolving-reject", {
      rfqId: "29000000-0000-4000-8000-000000000207",
      publicReference: "RFQ-23456789ABCM",
    });
    await repository.reserve(resolvingReject);
    await expect(repository.transition({
      keyFingerprint: resolvingReject.keyFingerprint,
      expectedState: "idempotency_reserved",
      expectedRowVersion: 1,
      state: "accepted",
      lastTransitionAt: CREATED_AT,
      authoritativeDocument: authoritative(resolvingReject, "accepted"),
      httpStatus: 201,
      document: acceptedReceipt(resolvingReject.publicReference),
    })).rejects.toMatchObject({ kind: "invalid_input" });
    await repository.transition({
      keyFingerprint: resolvingReject.keyFingerprint,
      expectedState: "idempotency_reserved",
      expectedRowVersion: 1,
      state: "resolving_lines",
      lastTransitionAt: CREATED_AT,
      authoritativeDocument: null,
      httpStatus: 202,
      document: resolvingReject.document,
    });
    await repository.transition({
      keyFingerprint: resolvingReject.keyFingerprint,
      expectedState: "resolving_lines",
      expectedRowVersion: 2,
      state: "rejected_before_delivery",
      lastTransitionAt: "2026-08-12T03:02:02.000Z",
      authoritativeDocument: null,
      httpStatus: 409,
      document: rejected,
    });
    expect(await repository.lookup({
      keyFingerprint: resolvingReject.keyFingerprint,
      payloadDigest: resolvingReject.payloadDigest.value,
      comparisonToken: resolvingReject.comparisonToken,
      now: "2026-09-12T03:02:00.000Z",
    })).toMatchObject({ kind: "replay", httpStatus: 409 });

    const indeterminate = reservation("indeterminate", {
      rfqId: "29000000-0000-4000-8000-000000000208",
      publicReference: "RFQ-23456789ABCN",
    });
    await repository.reserve(indeterminate);
    await repository.transition({
      keyFingerprint: indeterminate.keyFingerprint,
      expectedState: "idempotency_reserved",
      expectedRowVersion: 1,
      state: "resolving_lines",
      lastTransitionAt: CREATED_AT,
      authoritativeDocument: null,
      httpStatus: 202,
      document: indeterminate.document,
    });
    await repository.transition({
      keyFingerprint: indeterminate.keyFingerprint,
      expectedState: "resolving_lines",
      expectedRowVersion: 2,
      state: "delivery_pending",
      lastTransitionAt: "2026-08-12T03:02:01.000Z",
      authoritativeDocument: authoritative(indeterminate, "delivery_pending"),
      httpStatus: 202,
      document: indeterminate.document,
    });
    await repository.transition({
      keyFingerprint: indeterminate.keyFingerprint,
      expectedState: "delivery_pending",
      expectedRowVersion: 3,
      state: "delivery_indeterminate",
      lastTransitionAt: "2026-08-12T03:02:02.000Z",
      authoritativeDocument: authoritative(indeterminate, "delivery_indeterminate"),
      httpStatus: 202,
      document: indeterminate.document,
    });
    expect(await repository.lookup({
      keyFingerprint: indeterminate.keyFingerprint,
      payloadDigest: indeterminate.payloadDigest.value,
      comparisonToken: indeterminate.comparisonToken,
      now: "2026-09-12T03:02:00.000Z",
    })).toEqual({ kind: "recovery_required" });

    const pendingReject = reservation("pending-reject", {
      rfqId: "29000000-0000-4000-8000-000000000210",
      publicReference: "RFQ-23456789ABCQ",
    });
    await repository.reserve(pendingReject);
    await repository.transition({
      keyFingerprint: pendingReject.keyFingerprint,
      expectedState: "idempotency_reserved",
      expectedRowVersion: 1,
      state: "resolving_lines",
      lastTransitionAt: CREATED_AT,
      authoritativeDocument: null,
      httpStatus: 202,
      document: pendingReject.document,
    });
    await repository.transition({
      keyFingerprint: pendingReject.keyFingerprint,
      expectedState: "resolving_lines",
      expectedRowVersion: 2,
      state: "delivery_pending",
      lastTransitionAt: "2026-08-12T03:02:01.000Z",
      authoritativeDocument: authoritative(pendingReject, "delivery_pending"),
      httpStatus: 202,
      document: pendingReject.document,
    });
    await expect(repository.transition({
      keyFingerprint: pendingReject.keyFingerprint,
      expectedState: "delivery_pending",
      expectedRowVersion: 3,
      state: "rejected_before_delivery",
      lastTransitionAt: "2026-08-12T03:02:02.000Z",
      authoritativeDocument: authoritative(pendingReject, "rejected_before_delivery"),
      httpStatus: 409,
      document: rejected,
    })).resolves.toEqual({
      kind: "transitioned",
      state: "rejected_before_delivery",
      rowVersion: 4,
    });
  });

  test("fails closed on malformed stored identity, state, JSON, timestamp and binary shapes", async () => {
    const keyFingerprint = "a".repeat(64);
    const baseRow = {
      keyFingerprint,
      rfqId: "29000000-0000-4000-8000-000000000211",
      publicReference: "RFQ-23456789ABCR",
      contractVersion: "2.0.0",
      payloadKeyVersion: vectors.algorithm.testKeyVersion,
      payloadDigest: vectors.payloadDigestHmacSha256Hex,
      comparisonToken: vectors.comparisonTokenSha256Hex,
      basketSnapshotToken: vectors.submittedBasketTokenSha256Hex,
      state: "idempotency_reserved",
      deliveryState: "not_started",
      deliveryAttemptCount: 0,
      authoritativeDocumentJson: null,
      publicDocumentKind: "receipt",
      publicDocumentJson: JSON.stringify(getValidatedRfqBody(
        processingReceipt("RFQ-23456789ABCR"),
        "public_receipt",
      )),
      initialHttpStatus: 202,
      createdAt: "2026-08-12T03:02:00.000000Z",
      expiresAt: "2026-09-11T03:02:00.000000Z",
      lastTransitionAt: "2026-08-12T03:02:00.000000Z",
      rowVersion: "1",
    };
    const mutations: readonly Readonly<Record<string, unknown>>[] = [
      { keyFingerprint: "a".repeat(62) },
      { rfqId: "00000000-0000-0000-0000-000000000000" },
      { publicReference: "RFQ-BAD" },
      { contractVersion: "3.0.0" },
      { payloadDigest: "a".repeat(62) },
      { state: "unknown" },
      { deliveryState: "accepted" },
      { publicDocumentJson: JSON.stringify({ privateDiagnostic: "PRIVATE SQL" }) },
      { publicDocumentJson: JSON.stringify({ contractVersion: "2.0.0", value: "\ud800" }) },
      { expiresAt: "2026-09-11T03:02:00.001000Z" },
      { lastTransitionAt: "2026-08-12T03:01:59.999000Z" },
      { rowVersion: "9007199254740992" },
    ];

    for (const mutation of mutations) {
      const fakeConnection = {
        query: async (sql: string) => sql.startsWith("SELECT VERSION()")
          ? [[{
              version: "8.4.10",
              port: 3307,
              databaseName: "gdhe_rfq",
              account: "gdhe_rfq_app@127.0.0.1",
            }], []]
          : [[], []],
        execute: async () => [[{ ...baseRow, ...mutation }], []],
        end: async () => undefined,
      } as unknown as Connection;
      const repository = new MySqlRfqRepository({ connect: async () => fakeConnection });
      await expect(repository.lookup({
        keyFingerprint,
        payloadDigest: vectors.payloadDigestHmacSha256Hex,
        comparisonToken: vectors.comparisonTokenSha256Hex,
        now: CREATED_AT,
      })).rejects.toMatchObject({ category: "repository", kind: "malformed_record" });
    }
  });

  test("fails closed on every impossible stored state and row-version pairing", async () => {
    const keyFingerprint = "b".repeat(64);
    const input = reservation("impossible-state-row-version", {
      keyFingerprint,
      rfqId: "29000000-0000-4000-8000-000000000212",
      publicReference: "RFQ-23456789ABCS",
    });
    const processingJson = JSON.stringify(getValidatedRfqBody(
      input.document,
      "public_receipt",
    ));
    const acceptedJson = JSON.stringify(getValidatedRfqBody(
      acceptedReceipt(input.publicReference),
      "public_receipt",
    ));
    const errorJson = JSON.stringify(getValidatedRfqBody(
      validatePublicRfqError(structuredClone(publicErrorSample)),
      "public_error",
    ));
    const authoritativeJson = (
      state: "delivery_pending" | "accepted" | "delivery_indeterminate",
    ) => JSON.stringify(getValidatedRfqBody(
      authoritative(input, state),
      "authoritative_document",
    ));
    const baseRow = {
      keyFingerprint,
      rfqId: input.rfqId,
      publicReference: input.publicReference,
      contractVersion: "2.0.0",
      payloadKeyVersion: input.payloadDigest.keyVersion,
      payloadDigest: input.payloadDigest.value,
      comparisonToken: input.comparisonToken,
      basketSnapshotToken: input.basketSnapshotToken,
      state: "idempotency_reserved",
      deliveryState: "not_started",
      deliveryAttemptCount: 0,
      authoritativeDocumentJson: null,
      publicDocumentKind: "receipt",
      publicDocumentJson: processingJson,
      initialHttpStatus: 202,
      createdAt: "2026-08-12T03:02:00.000000Z",
      expiresAt: "2026-09-11T03:02:00.000000Z",
      lastTransitionAt: "2026-08-12T03:02:00.000000Z",
      rowVersion: "1",
    };
    const impossibleRows = [
      { ...baseRow, rowVersion: "2" },
      { ...baseRow, state: "resolving_lines", rowVersion: "1" },
      {
        ...baseRow,
        state: "delivery_pending",
        deliveryState: "pending",
        deliveryAttemptCount: 1,
        authoritativeDocumentJson: authoritativeJson("delivery_pending"),
        lastTransitionAt: "2026-08-12T03:02:01.000000Z",
        rowVersion: "2",
      },
      {
        ...baseRow,
        state: "accepted",
        deliveryState: "accepted",
        deliveryAttemptCount: 1,
        authoritativeDocumentJson: authoritativeJson("accepted"),
        publicDocumentJson: acceptedJson,
        initialHttpStatus: 201,
        lastTransitionAt: "2026-08-12T03:02:02.000000Z",
        rowVersion: "3",
      },
      {
        ...baseRow,
        state: "delivery_indeterminate",
        deliveryState: "indeterminate",
        deliveryAttemptCount: 1,
        authoritativeDocumentJson: authoritativeJson("delivery_indeterminate"),
        lastTransitionAt: "2026-08-12T03:02:02.000000Z",
        rowVersion: "3",
      },
      {
        ...baseRow,
        state: "rejected_before_delivery",
        deliveryState: "rejected",
        publicDocumentKind: "error",
        publicDocumentJson: errorJson,
        initialHttpStatus: 409,
        lastTransitionAt: "2026-08-12T03:02:02.000000Z",
        rowVersion: "2",
      },
      {
        ...baseRow,
        state: "rejected_before_delivery",
        deliveryState: "rejected",
        publicDocumentKind: "error",
        publicDocumentJson: errorJson,
        initialHttpStatus: 409,
        lastTransitionAt: "2026-08-12T03:02:02.000000Z",
        rowVersion: "5",
      },
    ];

    for (const storedRow of impossibleRows) {
      const fakeConnection = {
        query: async (sql: string) => sql.startsWith("SELECT VERSION()")
          ? [[{
              version: "8.4.10",
              port: 3307,
              databaseName: "gdhe_rfq",
              account: "gdhe_rfq_app@127.0.0.1",
            }], []]
          : [[], []],
        execute: async () => [[storedRow], []],
        end: async () => undefined,
      } as unknown as Connection;
      const repository = new MySqlRfqRepository({ connect: async () => fakeConnection });

      await expect(repository.lookup({
        keyFingerprint,
        payloadDigest: input.payloadDigest.value,
        comparisonToken: input.comparisonToken,
        now: CREATED_AT,
      })).rejects.toMatchObject({ category: "repository", kind: "malformed_record" });
    }
  });

  test("normalizes hostile and injected driver failures without reflection or diagnostics", async () => {
    const traps = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostile = new Proxy(Object.create(null), {
      get() {
        traps.get += 1;
        throw new Error("PRIVATE_DATABASE_DIAGNOSTIC");
      },
      getPrototypeOf() {
        traps.getPrototypeOf += 1;
        throw new Error("PRIVATE_DATABASE_DIAGNOSTIC");
      },
      ownKeys() {
        traps.ownKeys += 1;
        throw new Error("PRIVATE_DATABASE_DIAGNOSTIC");
      },
    });
    const lookup = {
      keyFingerprint: "a".repeat(64),
      payloadDigest: vectors.payloadDigestHmacSha256Hex,
      comparisonToken: vectors.comparisonTokenSha256Hex,
      now: CREATED_AT,
    } as const;
    const hostileRepository = new MySqlRfqRepository({
      connect: async () => { throw hostile; },
    });

    await expect(hostileRepository.lookup(lookup)).rejects.toMatchObject({
      category: "repository",
      kind: "unavailable",
    });
    expect(traps).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });
    expect(JSON.stringify(await hostileRepository.lookup(lookup).catch((error: unknown) => error)))
      .not.toContain("PRIVATE_DATABASE_DIAGNOSTIC");

    const timeout = Object.defineProperty({}, "code", { value: "ER_LOCK_WAIT_TIMEOUT" });
    await expect(new MySqlRfqRepository({
      connect: async () => { throw timeout; },
    }).lookup(lookup)).rejects.toMatchObject({ kind: "timeout" });

    const fakeConnection = (failure: unknown) => ({
      query: async (sql: string) => sql.startsWith("SELECT VERSION()")
        ? [[{
            version: "8.4.10",
            port: 3307,
            databaseName: "gdhe_rfq",
            account: "gdhe_rfq_app@127.0.0.1",
          }], []]
        : [[], []],
      execute: async () => { throw failure; },
      end: async () => undefined,
    }) as unknown as Connection;
    const deadlock = Object.defineProperty({}, "code", { value: "ER_LOCK_DEADLOCK" });
    await expect(new MySqlRfqRepository({
      connect: async () => fakeConnection(deadlock),
    }).reserve(reservation("deadlock", {
      rfqId: "29000000-0000-4000-8000-000000000203",
      publicReference: "RFQ-23456789ABCF",
    }))).rejects.toMatchObject({ kind: "deadlock" });
    await expect(new MySqlRfqRepository({
      connect: async () => fakeConnection(new Error("PRIVATE SQL gdhe_rfq")),
    }).reserve(reservation("ambiguous", {
      rfqId: "29000000-0000-4000-8000-000000000204",
      publicReference: "RFQ-23456789ABCG",
    }))).rejects.toMatchObject({ kind: "ambiguous_commit" });
  });

  test("rejects a non-runtime account or unexpected MySQL target before repository SQL", async () => {
    expect(() => createMySqlRfqConnectionFactory({
      host: "127.0.0.1",
      port: 3307,
      user: "root",
      password: "not-retained",
      database: "gdhe_rfq",
    })).toThrowError(expect.objectContaining({ kind: "invalid_configuration" }));

    let repositorySqlCalls = 0;
    let endCalls = 0;
    const wrongTarget = {
      query: async (sql: string) => sql.startsWith("SELECT VERSION()")
        ? [[{
            version: "8.4.9",
            port: 3307,
            databaseName: "gdhe_rfq",
            account: "gdhe_rfq_app@127.0.0.1",
          }], []]
        : [[], []],
      execute: async () => {
        repositorySqlCalls += 1;
        return [[], []];
      },
      end: async () => { endCalls += 1; },
    } as unknown as Connection;
    await expect(new MySqlRfqRepository({
      connect: async () => wrongTarget,
    }).lookup({
      keyFingerprint: "a".repeat(64),
      payloadDigest: vectors.payloadDigestHmacSha256Hex,
      comparisonToken: vectors.comparisonTokenSha256Hex,
      now: CREATED_AT,
    })).rejects.toMatchObject({ kind: "invalid_configuration" });
    expect(repositorySqlCalls).toBe(0);
    expect(endCalls).toBe(1);
  });
});
