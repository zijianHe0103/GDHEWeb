import { randomBytes } from "node:crypto";

import {
  getValidatedRfqBody,
  validatePublicRfqError,
} from "../../../../lib/rfq/server/v2";
import { readRfqIntakeConfig } from "../../../../lib/rfq/server/v2/config";
import { issueLocalRfqIntent } from "../../../../lib/rfq/server/v2/intent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAW_LIMIT = 8_192;
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

type RawBodyResult =
  | Readonly<{ kind: "ok"; body: Uint8Array }>
  | Readonly<{ kind: "invalid" }>
  | Readonly<{ kind: "too_large" }>;

function reference(): string {
  const bytes = randomBytes(12);
  let suffix = "";
  for (const byte of bytes) suffix += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `REQ-${suffix}`;
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
    | "unsupported_media_type"
    | "payload_too_large"
    | "invalid_request",
  status: 400 | 403 | 413 | 415,
): Response {
  const document = validatePublicRfqError({
    contractVersion: "2.0.0",
    error: {
      code,
      requestReference: reference(),
      messageKey: `rfq.error.${code}`,
    },
  });
  return response(getValidatedRfqBody(document, "public_error"), status);
}

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
  try {
    return response(issueLocalRfqIntent(input), 200);
  } catch {
    return publicError("invalid_request", 400);
  }
}
