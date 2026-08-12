import "server-only";

import { types as nodeTypes } from "node:util";

import mysql, {
  type Connection,
  type ConnectionOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import {
  getValidatedRfqBody,
  validateAuthoritativeRfqDocument,
  validatePublicRfqError,
  validatePublicRfqReceipt,
} from "./contract";
import {
  createRfqRepositoryLookupResult,
  createRfqRepositoryReservationResult,
  createRfqRepositoryTransitionResult,
  type RfqRepository,
  type RfqRepositoryLookupInput,
  type RfqRepositoryLookupResult,
  type RfqRepositoryReservationResult,
  type RfqRepositoryState,
  type RfqRepositoryTransitionInput,
  type RfqRepositoryTransitionResult,
  type RfqReservationInput,
} from "./repository";

const DATABASE = "gdhe_rfq";
const TABLE = "rfq_intake_records";
const EXPIRY_MS = 2_592_000_000;
const HEX_32 = /^[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PUBLIC_REFERENCE = /^RFQ-[A-Z2-9]{12}$/;
const UTC_MILLIS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type MySqlRfqRepositoryErrorKind =
  | "invalid_configuration"
  | "invalid_input"
  | "malformed_record"
  | "unavailable"
  | "timeout"
  | "deadlock"
  | "ambiguous_commit"
  | "reservation_conflict"
  | "stale_transition";

const authenticRepositoryErrors = new WeakSet<object>();

export class MySqlRfqRepositoryError extends Error {
  readonly category = "repository" as const;

  constructor(readonly kind: MySqlRfqRepositoryErrorKind) {
    super(kind);
    this.name = "MySqlRfqRepositoryError";
    authenticRepositoryErrors.add(this);
    Object.freeze(this);
  }
}

function isRepositoryError(value: unknown): value is MySqlRfqRepositoryError {
  return typeof value === "object" && value !== null && authenticRepositoryErrors.has(value);
}

export type MySqlRfqConnectionFactory = () => Promise<Connection>;

export type MySqlRfqConnectionConfig = Readonly<{
  host: string;
  port: number;
  user: string;
  password: string;
  database: "gdhe_rfq";
}>;

type StoredRow = RowDataPacket & {
  keyFingerprint: unknown;
  rfqId: unknown;
  publicReference: unknown;
  contractVersion: unknown;
  payloadKeyVersion: unknown;
  payloadDigest: unknown;
  comparisonToken: unknown;
  basketSnapshotToken: unknown;
  state: unknown;
  deliveryState: unknown;
  deliveryAttemptCount: unknown;
  authoritativeDocumentJson: unknown;
  publicDocumentKind: unknown;
  publicDocumentJson: unknown;
  initialHttpStatus: unknown;
  createdAt: unknown;
  expiresAt: unknown;
  lastTransitionAt: unknown;
  rowVersion: unknown;
};

type ParsedRow = Readonly<{
  keyFingerprint: string;
  rfqId: string;
  publicReference: string;
  payloadKeyVersion: string;
  payloadDigest: string;
  comparisonToken: string;
  basketSnapshotToken: string;
  state: RfqRepositoryState;
  deliveryState: "not_started" | "pending" | "accepted" | "indeterminate" | "rejected";
  deliveryAttemptCount: 0 | 1;
  authoritativeDocument: ReturnType<typeof validateAuthoritativeRfqDocument> | null;
  publicDocumentKind: "receipt" | "error";
  httpStatus: 201 | 202 | 409;
  createdAt: string;
  expiresAt: string;
  lastTransitionAt: string;
  rowVersion: number;
  document:
    | ReturnType<typeof validatePublicRfqReceipt>
    | ReturnType<typeof validatePublicRfqError>;
}>;

const SELECT_BY_KEY = `
  SELECT
    LOWER(HEX(key_fingerprint)) AS keyFingerprint,
    LOWER(BIN_TO_UUID(rfq_id)) AS rfqId,
    public_reference AS publicReference,
    contract_version AS contractVersion,
    payload_key_version AS payloadKeyVersion,
    LOWER(HEX(payload_digest)) AS payloadDigest,
    LOWER(HEX(comparison_token)) AS comparisonToken,
    LOWER(HEX(basket_snapshot_token)) AS basketSnapshotToken,
    state AS state,
    delivery_state AS deliveryState,
    delivery_attempt_count AS deliveryAttemptCount,
    CAST(authoritative_document AS CHAR CHARACTER SET utf8mb4) AS authoritativeDocumentJson,
    public_document_kind AS publicDocumentKind,
    CAST(public_document AS CHAR CHARACTER SET utf8mb4) AS publicDocumentJson,
    initial_http_status AS initialHttpStatus,
    DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS createdAt,
    DATE_FORMAT(expires_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS expiresAt,
    DATE_FORMAT(last_transition_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS lastTransitionAt,
    CAST(row_version AS CHAR) AS rowVersion
  FROM ${TABLE}
  WHERE key_fingerprint = UNHEX(?)
  LIMIT 1
`;

function fail(kind: MySqlRfqRepositoryErrorKind): never {
  throw new MySqlRfqRepositoryError(kind);
}

function exactObject(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || nodeTypes.isProxy(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return false;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const actualKeys = Reflect.ownKeys(descriptors);
    if (actualKeys.length !== keys.length) return false;
    return keys.every((key) => {
      const descriptor = descriptors[key];
      return descriptor !== undefined && "value" in descriptor && descriptor.enumerable;
    }) && actualKeys.every((key) => typeof key === "string" && keys.includes(key));
  } catch {
    return false;
  }
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" &&
    UTC_MILLIS.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(Date.parse(value)).toISOString() === value;
}

function millisTimestamp(value: unknown): string {
  if (typeof value !== "string") return fail("malformed_record");
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.)(\d{6})Z$/.exec(value);
  if (!match || !match[2].endsWith("000")) return fail("malformed_record");
  const normalized = `${match[1]}${match[2].slice(0, 3)}Z`;
  if (!validTimestamp(normalized)) return fail("malformed_record");
  return normalized;
}

function safeDriverCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || nodeTypes.isProxy(error)) return undefined;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(error, "code");
    return descriptor && "value" in descriptor && typeof descriptor.value === "string"
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
}

function mapDriverFailure(error: unknown, mutation: boolean): never {
  const code = safeDriverCode(error);
  if (code === "ER_LOCK_DEADLOCK") return fail("deadlock");
  if (code === "ER_LOCK_WAIT_TIMEOUT" || code === "PROTOCOL_SEQUENCE_TIMEOUT") {
    return fail("timeout");
  }
  return fail(mutation ? "ambiguous_commit" : "unavailable");
}

function validateConnectionConfig(value: MySqlRfqConnectionConfig): void {
  if (!exactObject(value, ["host", "port", "user", "password", "database"])) {
    return fail("invalid_configuration");
  }
  if (
    value.host !== "127.0.0.1" ||
    value.port !== 3307 ||
    value.user !== "gdhe_rfq_app" ||
    typeof value.password !== "string" || value.password.length === 0 ||
    value.database !== DATABASE
  ) {
    return fail("invalid_configuration");
  }
}

export function createMySqlRfqConnectionFactory(
  config: MySqlRfqConnectionConfig,
): MySqlRfqConnectionFactory {
  validateConnectionConfig(config);
  const options: ConnectionOptions = Object.freeze({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectTimeout: 5_000,
    decimalNumbers: false,
    supportBigNumbers: true,
    bigNumberStrings: true,
    timezone: "Z",
  });
  return async () => mysql.createConnection(options);
}

async function configureConnection(connection: Connection): Promise<void> {
  try {
    await connection.query("SET SESSION time_zone = '+00:00'");
    await connection.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
    await connection.query(
      "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'",
    );
    const [rows] = await connection.query<(RowDataPacket & {
      version: unknown;
      port: unknown;
      databaseName: unknown;
      account: unknown;
    })[]>(
      "SELECT VERSION() AS version, @@port AS port, DATABASE() AS databaseName, CURRENT_USER() AS account",
    );
    const target = rows[0];
    if (
      rows.length !== 1 ||
      target?.version !== "8.4.10" ||
      (target.port !== 3307 && target.port !== "3307") ||
      target.databaseName !== DATABASE ||
      target.account !== "gdhe_rfq_app@127.0.0.1"
    ) fail("invalid_configuration");
  } catch (error) {
    if (isRepositoryError(error)) throw error;
    mapDriverFailure(error, false);
  }
}

async function withConnection<T>(
  connect: MySqlRfqConnectionFactory,
  mutation: boolean,
  operation: (connection: Connection) => Promise<T>,
): Promise<T> {
  let connection: Connection;
  try {
    connection = await connect();
  } catch (error) {
    mapDriverFailure(error, false);
  }
  try {
    await configureConnection(connection);
    try {
      return await operation(connection);
    } catch (error) {
      if (isRepositoryError(error)) throw error;
      mapDriverFailure(error, mutation);
    }
  } finally {
    await connection.end().catch(() => undefined);
  }
}

function validateLookupInput(input: RfqRepositoryLookupInput): void {
  if (!exactObject(input, ["keyFingerprint", "payloadDigest", "comparisonToken", "now"])) {
    return fail("invalid_input");
  }
  if (
    typeof input.keyFingerprint !== "string" || !HEX_32.test(input.keyFingerprint) ||
    typeof input.payloadDigest !== "string" || !HEX_32.test(input.payloadDigest) ||
    typeof input.comparisonToken !== "string" || !HEX_32.test(input.comparisonToken) ||
    !validTimestamp(input.now)
  ) {
    return fail("invalid_input");
  }
}

function validateReservationInput(input: RfqReservationInput): unknown {
  if (!exactObject(input, [
    "keyFingerprint",
    "payloadDigest",
    "comparisonToken",
    "basketSnapshotToken",
    "rfqId",
    "publicReference",
    "createdAt",
    "expiresAt",
    "document",
  ])) return fail("invalid_input");
  if (!exactObject(input.payloadDigest, ["keyVersion", "value"])) return fail("invalid_input");
  if (
    typeof input.keyFingerprint !== "string" || !HEX_32.test(input.keyFingerprint) ||
    typeof input.payloadDigest.keyVersion !== "string" ||
      input.payloadDigest.keyVersion.length === 0 || input.payloadDigest.keyVersion.length > 64 ||
    typeof input.payloadDigest.value !== "string" || !HEX_32.test(input.payloadDigest.value) ||
    typeof input.comparisonToken !== "string" || !HEX_32.test(input.comparisonToken) ||
    typeof input.basketSnapshotToken !== "string" || !HEX_32.test(input.basketSnapshotToken) ||
    typeof input.rfqId !== "string" || !UUID.test(input.rfqId) ||
    typeof input.publicReference !== "string" || !PUBLIC_REFERENCE.test(input.publicReference) ||
    !validTimestamp(input.createdAt) || !validTimestamp(input.expiresAt) ||
    Date.parse(input.expiresAt) - Date.parse(input.createdAt) !== EXPIRY_MS
  ) return fail("invalid_input");

  let body: unknown;
  try {
    body = getValidatedRfqBody(input.document, "public_receipt");
  } catch {
    return fail("invalid_input");
  }
  if (!exactObject(body, [
    "contractVersion",
    "publicReference",
    "status",
    "receivedAt",
    "lineCount",
    "messageKey",
    "submittedBasketSnapshot",
    "submittedBasketToken",
    "retryAfterSeconds",
  ])) return fail("invalid_input");
  if (
    body.contractVersion !== "2.0.0" ||
    body.publicReference !== input.publicReference ||
    body.status !== "processing" ||
    body.receivedAt !== input.createdAt ||
    body.submittedBasketToken !== input.basketSnapshotToken
  ) return fail("invalid_input");
  return body;
}

async function selectRow(
  connection: Connection,
  keyFingerprint: string,
): Promise<StoredRow | undefined> {
  const [rows] = await connection.execute<StoredRow[]>(SELECT_BY_KEY, [keyFingerprint]);
  if (rows.length > 1) return fail("malformed_record");
  return rows[0];
}

function isState(value: unknown): value is RfqRepositoryState {
  return value === "idempotency_reserved" ||
    value === "resolving_lines" ||
    value === "delivery_pending" ||
    value === "accepted" ||
    value === "delivery_indeterminate" ||
    value === "rejected_before_delivery";
}

function isValidStateRowVersion(state: RfqRepositoryState, rowVersion: number): boolean {
  if (state === "idempotency_reserved") return rowVersion === 1;
  if (state === "resolving_lines") return rowVersion === 2;
  if (state === "delivery_pending") return rowVersion === 3;
  if (state === "accepted" || state === "delivery_indeterminate") return rowVersion === 4;
  return rowVersion === 3 || rowVersion === 4;
}

function stateCell(state: RfqRepositoryState) {
  if (state === "idempotency_reserved" || state === "resolving_lines") {
    return Object.freeze({ deliveryState: "not_started" as const, attemptCount: 0 as const });
  }
  if (state === "delivery_pending") {
    return Object.freeze({ deliveryState: "pending" as const, attemptCount: 1 as const });
  }
  if (state === "accepted") {
    return Object.freeze({ deliveryState: "accepted" as const, attemptCount: 1 as const });
  }
  if (state === "delivery_indeterminate") {
    return Object.freeze({ deliveryState: "indeterminate" as const, attemptCount: 1 as const });
  }
  return Object.freeze({ deliveryState: "rejected" as const, attemptCount: 0 as const });
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return fail("malformed_record");
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return fail("malformed_record");
  }
}

function assertAuthoritativeBinding(
  document: ReturnType<typeof validateAuthoritativeRfqDocument>,
  row: Readonly<{
    keyFingerprint: string;
    rfqId: string;
    publicReference: string;
    payloadKeyVersion: string;
    payloadDigest: string;
    state: RfqRepositoryState;
    createdAt: string;
    expiresAt: string;
    lastTransitionAt: string;
    deliveryState: ParsedRow["deliveryState"];
    deliveryAttemptCount: ParsedRow["deliveryAttemptCount"];
  }>,
): void {
  const body = getValidatedRfqBody(document, "authoritative_document") as Record<string, unknown>;
  const digest = body.payloadDigest as Record<string, unknown>;
  const idempotency = body.idempotency as Record<string, unknown>;
  const delivery = body.delivery as Record<string, unknown>;
  if (
    body.rfqId !== row.rfqId ||
    body.publicReference !== row.publicReference ||
    body.receivedAt !== row.createdAt ||
    body.status !== row.state ||
    digest.keyVersion !== row.payloadKeyVersion || digest.value !== row.payloadDigest ||
    idempotency.keyFingerprint !== row.keyFingerprint ||
    idempotency.createdAt !== row.createdAt || idempotency.expiresAt !== row.expiresAt ||
    delivery.state !== row.deliveryState ||
    delivery.attemptCount !== row.deliveryAttemptCount ||
    delivery.lastTransitionAt !== row.lastTransitionAt
  ) return fail("malformed_record");
}

function parseRow(row: StoredRow): ParsedRow {
  if (
    typeof row.keyFingerprint !== "string" || !HEX_32.test(row.keyFingerprint) ||
    typeof row.rfqId !== "string" || !UUID.test(row.rfqId) ||
    typeof row.publicReference !== "string" || !PUBLIC_REFERENCE.test(row.publicReference) ||
    row.contractVersion !== "2.0.0" ||
    typeof row.payloadKeyVersion !== "string" || row.payloadKeyVersion.length === 0 ||
      row.payloadKeyVersion.length > 64 ||
    typeof row.payloadDigest !== "string" || !HEX_32.test(row.payloadDigest) ||
    typeof row.comparisonToken !== "string" || !HEX_32.test(row.comparisonToken) ||
    typeof row.basketSnapshotToken !== "string" || !HEX_32.test(row.basketSnapshotToken) ||
    !isState(row.state) ||
    (row.deliveryAttemptCount !== 0 && row.deliveryAttemptCount !== 1) ||
    (row.publicDocumentKind !== "receipt" && row.publicDocumentKind !== "error") ||
    (row.initialHttpStatus !== 201 && row.initialHttpStatus !== 202 && row.initialHttpStatus !== 409) ||
    typeof row.rowVersion !== "string" || !/^[1-9]\d*$/.test(row.rowVersion)
  ) return fail("malformed_record");

  const rowVersion = Number(row.rowVersion);
  if (
    !Number.isSafeInteger(rowVersion) ||
    !isValidStateRowVersion(row.state, rowVersion)
  ) return fail("malformed_record");
  const createdAt = millisTimestamp(row.createdAt);
  const expiresAt = millisTimestamp(row.expiresAt);
  const lastTransitionAt = millisTimestamp(row.lastTransitionAt);
  if (
    Date.parse(expiresAt) - Date.parse(createdAt) !== EXPIRY_MS ||
    Date.parse(lastTransitionAt) < Date.parse(createdAt)
  ) return fail("malformed_record");

  const cell = stateCell(row.state);
  if (
    row.deliveryState !== cell.deliveryState ||
    row.deliveryAttemptCount !== cell.attemptCount
  ) return fail("malformed_record");

  let document: ParsedRow["document"];
  try {
    if (row.publicDocumentKind === "receipt") {
      document = validatePublicRfqReceipt(parseJson(row.publicDocumentJson));
      const body = getValidatedRfqBody(document, "public_receipt") as Record<string, unknown>;
      const accepted = row.state === "accepted";
      if (
        body.publicReference !== row.publicReference ||
        body.status !== (accepted ? "accepted" : "processing") ||
        body.receivedAt !== createdAt ||
        body.submittedBasketToken !== row.basketSnapshotToken ||
        row.initialHttpStatus !== (accepted ? 201 : 202) ||
        row.state === "rejected_before_delivery"
      ) return fail("malformed_record");
    } else {
      document = validatePublicRfqError(parseJson(row.publicDocumentJson));
      if (row.state !== "rejected_before_delivery" || row.initialHttpStatus !== 409) {
        return fail("malformed_record");
      }
    }
  } catch (error) {
    if (isRepositoryError(error)) throw error;
    return fail("malformed_record");
  }

  let authoritativeDocument: ParsedRow["authoritativeDocument"] = null;
  if (row.authoritativeDocumentJson !== null) {
    try {
      authoritativeDocument = validateAuthoritativeRfqDocument(
        parseJson(row.authoritativeDocumentJson),
        Object.freeze({ keyVersion: row.payloadKeyVersion, value: row.payloadDigest }),
      );
    } catch (error) {
      if (isRepositoryError(error)) throw error;
      return fail("malformed_record");
    }
  }
  if (
    (row.state === "idempotency_reserved" && authoritativeDocument !== null) ||
    ((row.state === "delivery_pending" || row.state === "accepted" ||
      row.state === "delivery_indeterminate") && authoritativeDocument === null)
  ) return fail("malformed_record");

  const parsed = Object.freeze({
    keyFingerprint: row.keyFingerprint,
    rfqId: row.rfqId,
    publicReference: row.publicReference,
    payloadKeyVersion: row.payloadKeyVersion,
    payloadDigest: row.payloadDigest,
    comparisonToken: row.comparisonToken,
    basketSnapshotToken: row.basketSnapshotToken,
    state: row.state,
    deliveryState: cell.deliveryState,
    deliveryAttemptCount: cell.attemptCount,
    authoritativeDocument,
    publicDocumentKind: row.publicDocumentKind,
    httpStatus: row.initialHttpStatus,
    createdAt,
    expiresAt,
    lastTransitionAt,
    rowVersion,
    document,
  });
  if (authoritativeDocument) assertAuthoritativeBinding(authoritativeDocument, parsed);
  return parsed;
}

function classifyRow(
  row: ParsedRow,
  input: RfqRepositoryLookupInput,
): RfqRepositoryLookupResult {
  if (row.keyFingerprint !== input.keyFingerprint) return fail("malformed_record");
  if (
    row.payloadDigest !== input.payloadDigest ||
    row.comparisonToken !== input.comparisonToken
  ) return createRfqRepositoryLookupResult({ kind: "conflict" });
  if (
    Date.parse(input.now) >= Date.parse(row.expiresAt) &&
    row.state !== "accepted" && row.state !== "rejected_before_delivery"
  ) {
    return createRfqRepositoryLookupResult({ kind: "recovery_required" });
  }
  return createRfqRepositoryLookupResult({
    kind: "replay",
    httpStatus: row.httpStatus === 201 ? 200 : row.httpStatus,
    document: row.document,
  });
}

const ALLOWED_TRANSITIONS = Object.freeze({
    idempotency_reserved: Object.freeze(["resolving_lines"] as const),
    resolving_lines: Object.freeze(["delivery_pending", "rejected_before_delivery"] as const),
    delivery_pending: Object.freeze([
      "accepted",
      "delivery_indeterminate",
      "rejected_before_delivery",
    ] as const),
    accepted: Object.freeze([]),
    delivery_indeterminate: Object.freeze([]),
    rejected_before_delivery: Object.freeze([]),
  }) satisfies Readonly<Record<RfqRepositoryState, readonly RfqRepositoryState[]>>;

function validateTransitionShape(input: RfqRepositoryTransitionInput): void {
  if (!exactObject(input, [
    "keyFingerprint",
    "expectedState",
    "expectedRowVersion",
    "state",
    "lastTransitionAt",
    "authoritativeDocument",
    "httpStatus",
    "document",
  ])) return fail("invalid_input");
  if (
    typeof input.keyFingerprint !== "string" || !HEX_32.test(input.keyFingerprint) ||
    !isState(input.expectedState) || !isState(input.state) ||
    !Number.isSafeInteger(input.expectedRowVersion) || input.expectedRowVersion < 1 ||
    !validTimestamp(input.lastTransitionAt) ||
    !(ALLOWED_TRANSITIONS[input.expectedState] as readonly RfqRepositoryState[])
      .includes(input.state)
  ) return fail("invalid_input");
}

function prepareTransition(
  row: ParsedRow,
  input: RfqRepositoryTransitionInput,
): Readonly<{
  deliveryState: ParsedRow["deliveryState"];
  attemptCount: ParsedRow["deliveryAttemptCount"];
  authoritativeJson: string | null;
  publicKind: ParsedRow["publicDocumentKind"];
  publicJson: string;
}> {
  if (Date.parse(input.lastTransitionAt) < Date.parse(row.lastTransitionAt)) {
    return fail("invalid_input");
  }
  const cell = stateCell(input.state);
  const requiresAuthority = input.state === "delivery_pending" ||
    input.state === "accepted" || input.state === "delivery_indeterminate";
  if (
    (input.state === "resolving_lines" && input.authoritativeDocument !== null) ||
    (requiresAuthority && input.authoritativeDocument === null)
  ) return fail("invalid_input");

  let authoritativeJson: string | null = null;
  if (input.authoritativeDocument !== null) {
    let body: unknown;
    try {
      body = getValidatedRfqBody(input.authoritativeDocument, "authoritative_document");
    } catch {
      return fail("invalid_input");
    }
    try {
      assertAuthoritativeBinding(input.authoritativeDocument, {
        keyFingerprint: row.keyFingerprint,
        rfqId: row.rfqId,
        publicReference: row.publicReference,
        payloadKeyVersion: row.payloadKeyVersion,
        payloadDigest: row.payloadDigest,
        state: input.state,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
        lastTransitionAt: input.lastTransitionAt,
        deliveryState: cell.deliveryState,
        deliveryAttemptCount: cell.attemptCount,
      });
    } catch {
      return fail("invalid_input");
    }
    authoritativeJson = JSON.stringify(body);
  }

  let publicKind: ParsedRow["publicDocumentKind"];
  let publicJson: string;
  try {
    if (input.state === "rejected_before_delivery") {
      if (input.httpStatus !== 409) return fail("invalid_input");
      publicKind = "error";
      publicJson = JSON.stringify(getValidatedRfqBody(input.document, "public_error"));
    } else {
      const accepted = input.state === "accepted";
      if (input.httpStatus !== (accepted ? 201 : 202)) return fail("invalid_input");
      const body = getValidatedRfqBody(input.document, "public_receipt") as Record<string, unknown>;
      if (
        body.publicReference !== row.publicReference ||
        body.status !== (accepted ? "accepted" : "processing") ||
        body.receivedAt !== row.createdAt ||
        body.submittedBasketToken !== row.basketSnapshotToken
      ) return fail("invalid_input");
      publicKind = "receipt";
      publicJson = JSON.stringify(body);
    }
  } catch (error) {
    if (isRepositoryError(error)) throw error;
    return fail("invalid_input");
  }

  return Object.freeze({
    deliveryState: cell.deliveryState,
    attemptCount: cell.attemptCount,
    authoritativeJson,
    publicKind,
    publicJson,
  });
}

export class MySqlRfqRepository implements RfqRepository {
  readonly #connect: MySqlRfqConnectionFactory;

  constructor(input: Readonly<{ connect: MySqlRfqConnectionFactory }>) {
    if (!exactObject(input, ["connect"]) || typeof input.connect !== "function") {
      fail("invalid_configuration");
    }
    this.#connect = input.connect;
  }

  async lookup(input: RfqRepositoryLookupInput): Promise<RfqRepositoryLookupResult> {
    validateLookupInput(input);
    return withConnection(this.#connect, false, async (connection) => {
      const row = await selectRow(connection, input.keyFingerprint);
      return row
        ? classifyRow(parseRow(row), input)
        : createRfqRepositoryLookupResult({ kind: "miss" });
    });
  }

  async reserve(input: RfqReservationInput): Promise<RfqRepositoryReservationResult> {
    const body = validateReservationInput(input);
    return withConnection(this.#connect, true, async (connection) => {
      try {
        await connection.execute<ResultSetHeader>(`
          INSERT INTO ${TABLE} (
            key_fingerprint, rfq_id, public_reference, contract_version,
            payload_key_version, payload_digest, comparison_token, basket_snapshot_token,
            state, delivery_state, delivery_attempt_count, authoritative_document,
            public_document_kind, public_document, initial_http_status,
            created_at, expires_at, last_transition_at, row_version
          ) VALUES (
            UNHEX(?), UUID_TO_BIN(?), ?, '2.0.0',
            ?, UNHEX(?), UNHEX(?), UNHEX(?),
            'idempotency_reserved', 'not_started', 0, NULL,
            'receipt', CAST(? AS JSON), 202,
            ?, ?, ?, 1
          )
        `, [
          input.keyFingerprint,
          input.rfqId,
          input.publicReference,
          input.payloadDigest.keyVersion,
          input.payloadDigest.value,
          input.comparisonToken,
          input.basketSnapshotToken,
          JSON.stringify(body),
          input.createdAt.slice(0, -1).replace("T", " "),
          input.expiresAt.slice(0, -1).replace("T", " "),
          input.createdAt.slice(0, -1).replace("T", " "),
        ]);
        return createRfqRepositoryReservationResult();
      } catch (error) {
        if (safeDriverCode(error) !== "ER_DUP_ENTRY") throw error;
        const row = await selectRow(connection, input.keyFingerprint);
        if (!row) return fail("reservation_conflict");
        return classifyRow(parseRow(row), {
          keyFingerprint: input.keyFingerprint,
          payloadDigest: input.payloadDigest.value,
          comparisonToken: input.comparisonToken,
          now: input.createdAt,
        }) as Exclude<RfqRepositoryLookupResult, Readonly<{ kind: "miss" }>>;
      }
    });
  }

  async transition(input: RfqRepositoryTransitionInput): Promise<RfqRepositoryTransitionResult> {
    validateTransitionShape(input);
    return withConnection(this.#connect, true, async (connection) => {
      const stored = await selectRow(connection, input.keyFingerprint);
      if (!stored) return fail("stale_transition");
      const row = parseRow(stored);
      if (
        row.state !== input.expectedState ||
        row.rowVersion !== input.expectedRowVersion
      ) return fail("stale_transition");

      const next = prepareTransition(row, input);
      const authoritySql = next.authoritativeJson === null
        ? "NULL"
        : "CAST(? AS JSON)";
      const parameters: (string | number | null)[] = [
        input.state,
        next.deliveryState,
        next.attemptCount,
        ...(next.authoritativeJson === null ? [] : [next.authoritativeJson]),
        next.publicKind,
        next.publicJson,
        input.httpStatus,
        input.lastTransitionAt.slice(0, -1).replace("T", " "),
        input.keyFingerprint,
        input.expectedState,
        input.expectedRowVersion,
      ];
      const [result] = await connection.execute<ResultSetHeader>(`
        UPDATE ${TABLE}
        SET state = ?,
            delivery_state = ?,
            delivery_attempt_count = ?,
            authoritative_document = ${authoritySql},
            public_document_kind = ?,
            public_document = CAST(? AS JSON),
            initial_http_status = ?,
            last_transition_at = ?,
            row_version = row_version + 1
        WHERE key_fingerprint = UNHEX(?)
          AND state = ?
          AND row_version = ?
      `, parameters);
      if (result.affectedRows !== 1) return fail("stale_transition");
      return createRfqRepositoryTransitionResult(
        input.state,
        input.expectedRowVersion + 1,
      );
    });
  }
}
