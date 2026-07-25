import "server-only";

import { parseWordPressApiUrl } from "./config";
import {
  CmsHttpError,
  CmsProtocolError,
  CmsTransportError,
  type CmsHttpErrorKind,
  type CmsResponseMetadata,
} from "./errors";
import { buildResolveUrl } from "./resolve-url";

const DEFAULT_TIMEOUT_MS = 5000;

export type CmsTransportResponse = {
  body: unknown;
  metadata: CmsResponseMetadata & { status: 200 };
};

function responseMetadata(response: Response): CmsResponseMetadata {
  return {
    status: response.status,
    requestId: response.headers.get("x-gdhe-request-id") ?? undefined,
    etag: response.headers.get("etag") ?? undefined,
    lastModified: response.headers.get("last-modified") ?? undefined,
    retryAfter: response.headers.get("retry-after") ?? undefined,
    contentType: response.headers.get("content-type") ?? "",
  };
}

function isJsonContentType(value: string): boolean {
  const mediaType = value.split(";", 1)[0].trim().toLowerCase();
  return (
    mediaType === "application/json" ||
    /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(mediaType)
  );
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
    error instanceof CmsHttpError ||
    error instanceof CmsProtocolError ||
    error instanceof CmsTransportError
  ) {
    throw error;
  }
  if (isRedirectFailure(error)) {
    throw new CmsProtocolError("redirect");
  }
  if (callerSignal?.aborted) {
    throw new CmsTransportError("aborted");
  }
  if (timeoutSignal.aborted) {
    throw new CmsTransportError("timeout");
  }
  throw new CmsTransportError("network");
}

function httpErrorKind(status: number): CmsHttpErrorKind {
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

async function parseJsonBody(
  response: Response,
  metadata: CmsResponseMetadata,
): Promise<unknown> {
  if (!isJsonContentType(metadata.contentType)) {
    throw new CmsProtocolError("invalid_content_type");
  }

  const text = await response.text();
  if (text.trim() === "") {
    throw new CmsProtocolError("empty_body");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new CmsProtocolError("invalid_json");
  }
}

export async function resolveCmsPath(
  publicPath: string,
  callerSignal?: AbortSignal,
): Promise<CmsTransportResponse> {
  const base = parseWordPressApiUrl(process.env.WORDPRESS_API_URL);
  const url = buildResolveUrl(base, publicPath);
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), DEFAULT_TIMEOUT_MS);
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

    const metadata = responseMetadata(response);
    if (response.status !== 200) {
      if (
        (response.status >= 200 && response.status < 300) ||
        response.status === 304
      ) {
        throw new CmsProtocolError("unexpected_success_status");
      }
      const body = await parseJsonBody(response, metadata);
      throw new CmsHttpError(
        httpErrorKind(response.status),
        response.status,
        metadata,
        body,
      );
    }

    const body = await parseJsonBody(response, metadata);

    return {
      body,
      metadata: { ...metadata, status: 200 },
    };
  } catch (error) {
    throwMappedFailure(error, callerSignal, timeoutController.signal);
  } finally {
    clearTimeout(timer);
  }
}
