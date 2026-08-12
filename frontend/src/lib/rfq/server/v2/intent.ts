import "server-only";

import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

import {
  canonicalizeRfqValue,
  computeRfqBasketSnapshotToken,
} from "./canonical";
import {
  getValidatedRfqBody,
  snapshotRfqJsonValue,
  type ValidatedRfqDocument,
} from "./contract";
import { readRfqIntakeConfig } from "./config";

const CONTRACT_VERSION = "2.0.0" as const;
const INTENT_TTL_MS = 1_800_000;
const BASKET_TTL_MS = 2_592_000_000;
const PRIVACY_VERSION = "rfq-privacy-en-2026-08" as const;
const MAC_PREFIX = "GDHE-RFQ-INTENT-V2\n2.0.0\n";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const TOKEN = /^[A-Za-z0-9._~-]{32,8192}$/;

type JsonRecord = Readonly<Record<string, unknown>>;

export type LocalRfqIntentResponse = Readonly<{
  contractVersion: "2.0.0";
  submissionIntent: string;
  idempotencyKey: string;
  privacyNotice: Readonly<{
    version: "rfq-privacy-en-2026-08";
    presentedAt: string;
  }>;
  expiresAt: string;
}>;

export class RfqIntentError extends Error {
  readonly category = "intent" as const;
  readonly kind = "invalid_submission_intent" as const;

  constructor() {
    super("The RFQ submission intent is invalid or expired.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqIntentError",
    });
  }
}

function fail(): never {
  throw new RfqIntentError();
}

function boundary<T>(action: () => T): T {
  try {
    return action();
  } catch {
    return fail();
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: JsonRecord, keys: readonly string[]): boolean {
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function canonicalTimestamp(value: unknown): string {
  if (typeof value !== "string" || new Date(value).toISOString() !== value) fail();
  return value;
}

function sourceBasketSnapshot(input: unknown): JsonRecord {
  const snapshot = snapshotRfqJsonValue(input);
  if (
    !isRecord(snapshot) ||
    !exactKeys(snapshot, [
      "schemaVersion",
      "revision",
      "writerId",
      "mutationId",
      "updatedAt",
      "expiresAt",
    ]) ||
    snapshot.schemaVersion !== "3.0.0" ||
    !Number.isSafeInteger(snapshot.revision) ||
    (snapshot.revision as number) < 1 ||
    typeof snapshot.writerId !== "string" ||
    !UUID_V4.test(snapshot.writerId) ||
    typeof snapshot.mutationId !== "string" ||
    !UUID_V4.test(snapshot.mutationId)
  ) fail();
  const updatedAt = canonicalTimestamp(snapshot.updatedAt);
  const expiresAt = canonicalTimestamp(snapshot.expiresAt);
  if (Date.parse(expiresAt) - Date.parse(updatedAt) !== BASKET_TTL_MS) fail();
  return snapshot;
}

function signingKey(): Readonly<{
  origin: string;
  keyVersion: string;
  secretKey: Uint8Array;
}> {
  const config = readRfqIntakeConfig();
  if (!config.enabled) fail();
  return config;
}

function mac(payloadSegment: string, secretKey: Uint8Array): Buffer {
  const key = Uint8Array.prototype.slice.call(secretKey) as Uint8Array;
  try {
    return createHmac("sha256", key)
      .update(`${MAC_PREFIX}${payloadSegment}`, "utf8")
      .digest();
  } finally {
    key.fill(0);
  }
}

function encodePayload(payload: JsonRecord): string {
  return Buffer.from(canonicalizeRfqValue(payload), "utf8").toString("base64url");
}

function decodePayload(segment: string): JsonRecord {
  const bytes = Buffer.from(segment, "base64url");
  if (bytes.toString("base64url") !== segment) fail();
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const parsed = snapshotRfqJsonValue(JSON.parse(text));
  if (!isRecord(parsed)) fail();
  return parsed;
}

export function issueLocalRfqIntent(
  sourceBasket: unknown,
): LocalRfqIntentResponse {
  return boundary(() => {
    const config = signingKey();
    const basket = sourceBasketSnapshot(sourceBasket);
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.parse(issuedAt) + INTENT_TTL_MS).toISOString();
    const idempotencyKey = randomUUID();
    if (!UUID_V4.test(idempotencyKey)) fail();
    const payload = Object.freeze({
      contractVersion: CONTRACT_VERSION,
      keyVersion: config.keyVersion,
      origin: config.origin,
      idempotencyKey,
      sourceBasket: basket,
      basketSnapshotToken: computeRfqBasketSnapshotToken(basket),
      issuedAt,
      expiresAt,
    });
    const payloadSegment = encodePayload(payload);
    const signature = mac(payloadSegment, config.secretKey).toString("base64url");
    const privacyNotice = Object.freeze({
      version: PRIVACY_VERSION,
      presentedAt: issuedAt,
    });
    return Object.freeze({
      contractVersion: CONTRACT_VERSION,
      submissionIntent: `${payloadSegment}.${signature}`,
      idempotencyKey,
      privacyNotice,
      expiresAt,
    });
  });
}

export function verifyLocalRfqIntent(
  submission: ValidatedRfqDocument<"public_submission">,
): void {
  boundary(() => {
    const config = signingKey();
    const body = getValidatedRfqBody(submission, "public_submission");
    if (!isRecord(body) || typeof body.submissionIntent !== "string") fail();
    if (!TOKEN.test(body.submissionIntent)) fail();
    const parts = body.submissionIntent.split(".");
    if (parts.length !== 2) fail();
    const [payloadSegment, signatureSegment] = parts;
    if (!payloadSegment || !signatureSegment) fail();
    const signature = Buffer.from(signatureSegment, "base64url");
    if (
      signature.byteLength !== 32 ||
      signature.toString("base64url") !== signatureSegment ||
      !timingSafeEqual(signature, mac(payloadSegment, config.secretKey))
    ) fail();

    const payload = decodePayload(payloadSegment);
    if (
      !exactKeys(payload, [
        "contractVersion",
        "keyVersion",
        "origin",
        "idempotencyKey",
        "sourceBasket",
        "basketSnapshotToken",
        "issuedAt",
        "expiresAt",
      ]) ||
      payload.contractVersion !== CONTRACT_VERSION ||
      payload.keyVersion !== config.keyVersion ||
      payload.origin !== config.origin ||
      typeof payload.idempotencyKey !== "string" ||
      !UUID_V4.test(payload.idempotencyKey) ||
      payload.idempotencyKey !== body.idempotencyKey ||
      typeof payload.basketSnapshotToken !== "string" ||
      !/^[0-9a-f]{64}$/.test(payload.basketSnapshotToken)
    ) fail();
    const issuedAt = canonicalTimestamp(payload.issuedAt);
    const expiresAt = canonicalTimestamp(payload.expiresAt);
    const now = Date.now();
    const issued = Date.parse(issuedAt);
    const expires = Date.parse(expiresAt);
    if (expires - issued !== INTENT_TTL_MS || now < issued || now >= expires) fail();

    if (!isRecord(body.basket) || !isRecord(body.privacyNotice)) fail();
    const submittedSource = sourceBasketSnapshot(body.basket.sourceBasket);
    const signedSource = sourceBasketSnapshot(payload.sourceBasket);
    if (
      canonicalizeRfqValue(submittedSource) !== canonicalizeRfqValue(signedSource) ||
      payload.basketSnapshotToken !== computeRfqBasketSnapshotToken(signedSource) ||
      !exactKeys(body.privacyNotice, ["version", "presentedAt"]) ||
      body.privacyNotice.version !== PRIVACY_VERSION ||
      body.privacyNotice.presentedAt !== issuedAt
    ) fail();
  });
}
