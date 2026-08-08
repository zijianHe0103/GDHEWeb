import "server-only";

import { types as nodeTypes } from "node:util";

import { parseWordPressApiUrl } from "../config";
import { validateCanonicalPublicPath } from "../resolve-url";
import {
  RelatedProductCardConfigurationError,
  RelatedProductCardHttpError,
  RelatedProductCardProtocolError,
  RelatedProductCardTransportError,
  type RelatedProductCardResponseMetadata,
} from "./errors";

const TIMEOUT_MS = 5000;

export type RelatedProductCardTransportOutcome =
  | Readonly<{
      kind: "ok";
      body: unknown;
      metadata: RelatedProductCardResponseMetadata & { status: 200 };
    }>
  | Readonly<{
      kind: "not_modified";
      metadata: RelatedProductCardResponseMetadata & { status: 304 };
    }>;

function buildUrl(sourcePath: string): URL {
  let path: string;
  try {
    path = validateCanonicalPublicPath(sourcePath);
  } catch {
    throw new RelatedProductCardConfigurationError("invalid_source_path");
  }
  const base = parseWordPressApiUrl(process.env.WORDPRESS_API_URL);
  const url = new URL(`${base.pathname}/gdhe/v1/related-product-cards`, base);
  url.searchParams.set("locale", "en");
  url.searchParams.set("schema", "1.0.0");
  url.searchParams.set("source_path", path);
  return url;
}

function metadata(response: Response): RelatedProductCardResponseMetadata {
  return {
    status: response.status,
    requestId: response.headers.get("x-gdhe-request-id") ?? undefined,
    etag: response.headers.get("etag") ?? undefined,
    cacheControl: response.headers.get("cache-control") ?? undefined,
    retryAfter: response.headers.get("retry-after") ?? undefined,
    contentType: response.headers.get("content-type") ?? "",
  };
}

function isJson(value: string): boolean {
  const mediaType = value.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json" ||
    /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(mediaType);
}

async function parseJson(
  response: Response,
  responseMetadata: RelatedProductCardResponseMetadata,
): Promise<unknown> {
  if (!isJson(responseMetadata.contentType)) {
    throw new RelatedProductCardProtocolError("invalid_content_type");
  }
  const text = await response.text();
  if (text.trim() === "") {
    throw new RelatedProductCardProtocolError("empty_body");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RelatedProductCardProtocolError("invalid_json");
  }
}

function httpKind(status: number): string {
  if (status === 400) return "bad_request";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if ([500, 502, 503].includes(status)) return "upstream_failure";
  return "unexpected_status";
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

function isTrustedTransportError(error: unknown): error is
  | RelatedProductCardHttpError
  | RelatedProductCardProtocolError
  | RelatedProductCardTransportError {
  if (nodeTypes.isProxy(error)) return false;
  try {
    return error instanceof RelatedProductCardHttpError ||
      error instanceof RelatedProductCardProtocolError ||
      error instanceof RelatedProductCardTransportError;
  } catch {
    return false;
  }
}

export async function requestRelatedProductCardCollection(
  sourcePath: string,
  callerSignal?: AbortSignal,
): Promise<RelatedProductCardTransportOutcome> {
  const url = buildUrl(sourcePath);
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "error",
      cache: "no-store",
      signal,
    });
    const responseMetadata = metadata(response);
    if (response.status === 304) {
      return {
        kind: "not_modified",
        metadata: { ...responseMetadata, status: 304 },
      };
    }
    if (response.status !== 200) {
      if (response.status >= 200 && response.status < 300) {
        throw new RelatedProductCardProtocolError("unexpected_status");
      }
      if (responseMetadata.cacheControl !== "no-store") {
        throw new RelatedProductCardProtocolError("invalid_cache_control");
      }
      throw new RelatedProductCardHttpError(
        httpKind(response.status),
        response.status,
        responseMetadata,
        await parseJson(response, responseMetadata),
      );
    }
    if (!responseMetadata.etag) {
      throw new RelatedProductCardProtocolError("missing_etag");
    }
    if (responseMetadata.cacheControl !== "public, max-age=60") {
      throw new RelatedProductCardProtocolError("invalid_cache_control");
    }
    return {
      kind: "ok",
      body: await parseJson(response, responseMetadata),
      metadata: { ...responseMetadata, status: 200 },
    };
  } catch (error) {
    if (isTrustedTransportError(error)) {
      throw error;
    }
    if (isRedirectFailure(error)) {
      throw new RelatedProductCardProtocolError("redirect");
    }
    if (callerSignal?.aborted) {
      throw new RelatedProductCardTransportError("aborted");
    }
    if (timeoutController.signal.aborted) {
      throw new RelatedProductCardTransportError("timeout");
    }
    throw new RelatedProductCardTransportError("network");
  } finally {
    clearTimeout(timer);
  }
}
