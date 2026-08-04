import "server-only";

import { parseWordPressApiUrl } from "../config";
import {
  ProductConfigurationHttpError,
  ProductConfigurationProtocolError,
  ProductConfigurationTransportError,
  type ProductConfigurationHttpErrorKind,
} from "./errors";

const DEFAULT_TIMEOUT_MS = 5000;

export type ProductConfigurationResponseMetadata = Readonly<{
  status: number;
  requestId?: string;
  etag?: string;
  cacheControl?: string;
  retryAfter?: string;
  contentType: string;
}>;

export type ProductConfigurationTransportOutcome =
  | Readonly<{
      kind: "ok";
      body: unknown;
      metadata: ProductConfigurationResponseMetadata & { status: 200 };
    }>
  | Readonly<{
      kind: "not_modified";
      metadata: ProductConfigurationResponseMetadata & { status: 304 };
    }>;

function buildProductConfigurationUrl(
  base: URL,
  schemaVersion: "1.0.0" | "2.0.0",
): URL {
  const url = new URL(
    `${base.pathname}/gdhe/v1/product-configurations`,
    base,
  );
  url.searchParams.set("locale", "en");
  url.searchParams.set("schema", schemaVersion);
  url.searchParams.set("path", "/products/fgd-x15-pvc/");
  return url;
}

function responseMetadata(
  response: Response,
): ProductConfigurationResponseMetadata {
  return {
    status: response.status,
    requestId: response.headers.get("x-gdhe-request-id") ?? undefined,
    etag: response.headers.get("etag") ?? undefined,
    cacheControl: response.headers.get("cache-control") ?? undefined,
    retryAfter: response.headers.get("retry-after") ?? undefined,
    contentType: response.headers.get("content-type") ?? "",
  };
}

function isJsonContentType(value: string): boolean {
  const mediaType = value.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json" ||
    /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(mediaType);
}

async function parseJsonBody(
  response: Response,
  metadata: ProductConfigurationResponseMetadata,
): Promise<unknown> {
  if (!isJsonContentType(metadata.contentType)) {
    throw new ProductConfigurationProtocolError("invalid_content_type");
  }
  const text = await response.text();
  if (text.trim() === "") {
    throw new ProductConfigurationProtocolError("empty_body");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ProductConfigurationProtocolError("invalid_json");
  }
}

function httpErrorKind(status: number): ProductConfigurationHttpErrorKind {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 429:
      return "rate_limited";
    case 500:
    case 502:
    case 503:
      return "upstream_failure";
    default:
      return "unexpected_status";
  }
}

function isRedirectFailure(error: unknown): boolean {
  if (!(error instanceof TypeError) || !("cause" in error)) {
    return false;
  }
  const cause = error.cause;
  return cause instanceof Error && cause.message.toLowerCase().includes("redirect");
}

function throwMappedFailure(
  error: unknown,
  callerSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal,
): never {
  if (
    error instanceof ProductConfigurationHttpError ||
    error instanceof ProductConfigurationProtocolError ||
    error instanceof ProductConfigurationTransportError
  ) {
    throw error;
  }
  if (isRedirectFailure(error)) {
    throw new ProductConfigurationProtocolError("redirect");
  }
  if (callerSignal?.aborted) {
    throw new ProductConfigurationTransportError("aborted");
  }
  if (timeoutSignal.aborted) {
    throw new ProductConfigurationTransportError("timeout");
  }
  throw new ProductConfigurationTransportError("network");
}

async function requestProductConfigurationVersion(
  schemaVersion: "1.0.0" | "2.0.0",
  callerSignal?: AbortSignal,
): Promise<
  ProductConfigurationTransportOutcome
> {
  const base = parseWordPressApiUrl(process.env.WORDPRESS_API_URL);
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), DEFAULT_TIMEOUT_MS);
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(buildProductConfigurationUrl(base, schemaVersion), {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "error",
      cache: "no-store",
      signal,
    });
    const metadata = responseMetadata(response);
    if (response.status === 304) {
      return {
        kind: "not_modified",
        metadata: { ...metadata, status: 304 },
      };
    }
    if (response.status !== 200) {
      if (response.status >= 200 && response.status < 300) {
        throw new ProductConfigurationProtocolError("unexpected_status");
      }
      if (metadata.cacheControl !== "no-store") {
        throw new ProductConfigurationProtocolError("invalid_cache_control");
      }
      const body = await parseJsonBody(response, metadata);
      throw new ProductConfigurationHttpError(
        httpErrorKind(response.status),
        response.status,
        metadata,
        body,
      );
    }
    if (!metadata.etag) {
      throw new ProductConfigurationProtocolError("missing_etag");
    }
    if (metadata.cacheControl !== "public, max-age=60") {
      throw new ProductConfigurationProtocolError("invalid_cache_control");
    }
    const body = await parseJsonBody(response, metadata);
    return {
      kind: "ok",
      body,
      metadata: { ...metadata, status: 200 },
    };
  } catch (error) {
    throwMappedFailure(error, callerSignal, timeoutController.signal);
  } finally {
    clearTimeout(timer);
  }
}

export function requestProductConfiguration(
  callerSignal?: AbortSignal,
): Promise<ProductConfigurationTransportOutcome> {
  return requestProductConfigurationVersion("1.0.0", callerSignal);
}

export function requestProductConfigurationV2(
  callerSignal?: AbortSignal,
): Promise<ProductConfigurationTransportOutcome> {
  return requestProductConfigurationVersion("2.0.0", callerSignal);
}
