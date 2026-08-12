import { randomBytes, randomUUID } from "node:crypto";

import { validateMixedQuoteLines } from "../../../../lib/cms/server/article-number-batch";
import {
  StubRfqRepository,
  StubRfqSink,
  createRfqIntakeRuntime,
  getValidatedRfqBody,
  validatePublicRfqError,
  validatePublicRfqSubmission,
  type RfqIntakeConfig,
  type RfqLocalIntakeResult,
  type RfqRepository,
} from "../../../../lib/rfq/server/v2";
import { readRfqIntakeConfig } from "../../../../lib/rfq/server/v2/config";
import { verifyLocalRfqIntent } from "../../../../lib/rfq/server/v2/intent";
import {
  createMySqlRfqConnectionFactory,
  MySqlRfqRepository,
} from "../../../../lib/rfq/server/v2/mysql-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAW_LIMIT = 262_144;
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

let activeKey = "";
let activeRuntime: ReturnType<typeof createRfqIntakeRuntime> | undefined;

function reference(prefix: "RFQ" | "REQ"): string {
  const bytes = randomBytes(12);
  let suffix = "";
  for (const byte of bytes) suffix += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `${prefix}-${suffix}`;
}

function response(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function emptyNotFound(): Response {
  return new Response(null, {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}

function publicError(
  code:
    | "request_not_allowed"
    | "invalid_submission_intent"
    | "unsupported_media_type"
    | "payload_too_large"
    | "invalid_request"
    | "service_temporarily_unavailable",
  status: 400 | 403 | 413 | 415 | 503,
): Response {
  const document = validatePublicRfqError({
    contractVersion: "2.0.0",
    error: {
      code,
      requestReference: reference("REQ"),
      messageKey: `rfq.error.${code}`,
    },
  });
  return response(getValidatedRfqBody(document, "public_error"), status);
}

function createConfiguredRuntime(
  config: Extract<RfqIntakeConfig, { enabled: true }>,
  repository: RfqRepository,
) {
  const sink = new StubRfqSink(config.sinkOutcome);
  return createRfqIntakeRuntime({
    clock: { now: () => new Date().toISOString() },
    ids: {
      nextRfqId: () => randomUUID(),
      nextPublicReference: () => reference("RFQ"),
      nextRequestReference: () => reference("REQ"),
    },
    keyMaterial: { keyVersion: config.keyVersion, secretKey: config.secretKey },
    sourceSecurity: {
      sourceFingerprint: "0".repeat(64),
      outcomeCode: "new_intent",
    },
    repository,
    preReservationGate: async (submission) => verifyLocalRfqIntent(submission),
    validateMixedQuoteLines,
    sink,
  });
}

function configuredRuntime(config: Extract<RfqIntakeConfig, { enabled: true }>) {
  if (config.mode === "persistent_stub") {
    const connect = createMySqlRfqConnectionFactory({
      host: "127.0.0.1",
      port: 3307,
      user: "gdhe_rfq_app",
      password: config.mysqlPassword,
      database: "gdhe_rfq",
    });
    return createConfiguredRuntime(config, new MySqlRfqRepository({ connect }));
  }
  const key = `${config.origin}\n${config.keyVersion}\n${config.sinkOutcome}`;
  if (activeRuntime && activeKey === key) return activeRuntime;
  const repository = new StubRfqRepository();
  activeKey = key;
  activeRuntime = createConfiguredRuntime(config, repository);
  return activeRuntime;
}

type RawBodyResult =
  | Readonly<{ kind: "ok"; body: Uint8Array }>
  | Readonly<{ kind: "invalid" }>
  | Readonly<{ kind: "too_large" }>;

async function readRawBody(request: Request): Promise<RawBodyResult> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    if (!/^(0|[1-9][0-9]*)$/.test(declared)) return { kind: "invalid" };
    const length = Number(declared);
    if (!Number.isSafeInteger(length)) return { kind: "invalid" };
    if (length > RAW_LIMIT) return { kind: "too_large" };
  }
  if (!request.body) return { kind: "ok", body: new Uint8Array() };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > RAW_LIMIT) {
        void reader.cancel().catch(() => undefined);
        return { kind: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { kind: "invalid" };
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { kind: "ok", body };
}

export async function POST(request: Request): Promise<Response> {
  const config = readRfqIntakeConfig();
  if (!config.enabled) return emptyNotFound();
  if (request.headers.get("origin") !== config.origin) {
    return publicError("request_not_allowed", 403);
  }
  const media = request.headers.get("content-type") ?? "";
  if (!/^[\t ]*application\/json[\t ]*$/i.test(media)) {
    return publicError("unsupported_media_type", 415);
  }
  const raw = await readRawBody(request);
  if (raw.kind === "too_large") return publicError("payload_too_large", 413);
  if (raw.kind === "invalid") return publicError("invalid_request", 400);
  let input: unknown;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(raw.body);
    input = JSON.parse(text);
  } catch {
    return publicError("invalid_request", 400);
  }
  let submission: ReturnType<typeof validatePublicRfqSubmission>;
  try {
    submission = validatePublicRfqSubmission(input);
  } catch {
    return publicError("invalid_request", 400);
  }
  try {
    const result = await configuredRuntime(config).resolve(submission) as RfqLocalIntakeResult;
    const kind = result.document.kind;
    const body = getValidatedRfqBody(
      result.document,
      kind === "public_receipt" ? "public_receipt" : "public_error",
    );
    if (
      result.httpStatus === 409 &&
      kind === "public_error" &&
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "code" in body.error &&
      body.error.code === "request_not_allowed"
    ) {
      return publicError("invalid_submission_intent", 403);
    }
    return response(body, result.httpStatus);
  } catch {
    return publicError("service_temporarily_unavailable", 503);
  }
}
