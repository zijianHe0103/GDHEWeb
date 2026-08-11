import "server-only";

import { types as nodeTypes } from "node:util";

import { parseWordPressApiUrl } from "../config";
import {
  MixedQuoteLineHttpError,
  MixedQuoteLineProtocolError,
  type MixedQuoteLineResponseMetadata,
  MixedQuoteLineTransportError,
} from "./errors";
import type { MixedQuoteLineValidationRequest } from "./types";

const TIMEOUT_MS = 5000;

export type MixedQuoteLineTransportOutcome = Readonly<{
  kind: "ok";
  body: unknown;
  metadata: MixedQuoteLineResponseMetadata & { status: 200 };
}>;

function buildUrl(): URL {
  const base = parseWordPressApiUrl(process.env.WORDPRESS_API_URL);
  return new URL(`${base.pathname}/gdhe/v1/quote-line-validations`, base);
}

function responseMetadata(response: Response): MixedQuoteLineResponseMetadata {
  return {
    status: response.status,
    requestId: response.headers.get("x-gdhe-request-id") ?? undefined,
    retryAfter: response.headers.get("retry-after") ?? undefined,
    cacheControl: response.headers.get("cache-control") ?? undefined,
    contentType: response.headers.get("content-type") ?? "",
  };
}

function isJson(contentType: string): boolean {
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json" ||
    /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(mediaType);
}

async function parseJson(
  response: Response,
  metadata: MixedQuoteLineResponseMetadata,
): Promise<unknown> {
  if (!isJson(metadata.contentType)) {
    throw new MixedQuoteLineProtocolError("invalid_content_type");
  }
  const text = await response.text();
  if (text.trim() === "") throw new MixedQuoteLineProtocolError("empty_body");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new MixedQuoteLineProtocolError("invalid_json");
  }
}

function isRedirectFailure(error: unknown): boolean {
  if (nodeTypes.isProxy(error)) return false;
  try {
    if (!(error instanceof TypeError)) return false;
    const causeDescriptor = Object.getOwnPropertyDescriptor(error, "cause");
    if (!causeDescriptor || !("value" in causeDescriptor)) return false;
    const cause = causeDescriptor.value;
    if (nodeTypes.isProxy(cause) || !(cause instanceof Error)) return false;
    const messageDescriptor = Object.getOwnPropertyDescriptor(cause, "message");
    return Boolean(
      messageDescriptor &&
      "value" in messageDescriptor &&
      typeof messageDescriptor.value === "string" &&
      messageDescriptor.value.toLowerCase().includes("redirect"),
    );
  } catch {
    return false;
  }
}

function httpKind(status: number): string {
  if (status === 400) return "bad_request";
  if (status === 409) return "quote_lines_changed";
  if (status === 413) return "request_too_large";
  if (status === 415) return "unsupported_media_type";
  if (status === 500) return "upstream_failure";
  return "unexpected_status";
}

function isTrustedError(error: unknown): error is
  | MixedQuoteLineHttpError
  | MixedQuoteLineProtocolError
  | MixedQuoteLineTransportError {
  if (nodeTypes.isProxy(error)) return false;
  try {
    return error instanceof MixedQuoteLineHttpError ||
      error instanceof MixedQuoteLineProtocolError ||
      error instanceof MixedQuoteLineTransportError;
  } catch {
    return false;
  }
}

export async function requestMixedQuoteLineValidation(
  request: MixedQuoteLineValidationRequest,
  callerSignal?: AbortSignal,
): Promise<MixedQuoteLineTransportOutcome> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(buildUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store",
      redirect: "error",
      signal,
    });
    const metadata = responseMetadata(response);
    if (metadata.cacheControl !== "no-store") {
      throw new MixedQuoteLineProtocolError("invalid_cache_control");
    }
    if (response.status !== 200) {
      if (response.status >= 200 && response.status < 300) {
        throw new MixedQuoteLineProtocolError("unexpected_status");
      }
      throw new MixedQuoteLineHttpError(
        httpKind(response.status),
        response.status,
        metadata,
        await parseJson(response, metadata),
      );
    }
    return {
      kind: "ok",
      body: await parseJson(response, metadata),
      metadata: { ...metadata, status: 200 },
    };
  } catch (error) {
    if (isTrustedError(error)) throw error;
    if (isRedirectFailure(error)) throw new MixedQuoteLineProtocolError("redirect");
    if (callerSignal?.aborted) throw new MixedQuoteLineTransportError("aborted");
    if (timeoutController.signal.aborted) throw new MixedQuoteLineTransportError("timeout");
    throw new MixedQuoteLineTransportError("network");
  } finally {
    clearTimeout(timer);
  }
}
