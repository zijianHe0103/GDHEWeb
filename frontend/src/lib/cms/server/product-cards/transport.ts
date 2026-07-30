import "server-only";

import { types as nodeTypes } from "node:util";

import { parseWordPressApiUrl } from "../config";
import {
  ProductCardConfigurationError,
  ProductCardHttpError,
  ProductCardProtocolError,
  ProductCardTransportError,
  type ProductCardHttpErrorKind,
} from "./errors";

const DEFAULT_TIMEOUT_MS = 5000;

export type ProductCardCollectionQuery = Readonly<{
  page?: number;
  perPage?: number;
  sort?: "modified_desc" | "title_asc";
  filter?: `product_category:${string}`;
}>;

export type ValidatedProductCardQuery = Readonly<{
  page: number;
  perPage: number;
  sort: "modified_desc" | "title_asc";
  filter?: `product_category:${string}`;
}>;

export type ProductCardResponseMetadata = Readonly<{
  status: number;
  requestId?: string;
  etag?: string;
  cacheControl?: string;
  retryAfter?: string;
  contentType: string;
}>;

export type ProductCardTransportOutcome =
  | Readonly<{
      kind: "ok";
      body: unknown;
      metadata: ProductCardResponseMetadata & { status: 200 };
    }>
  | Readonly<{
      kind: "not_modified";
      metadata: ProductCardResponseMetadata & { status: 304 };
    }>;

const QUERY_KEYS = new Set(["page", "perPage", "sort", "filter"]);
const FILTER_PATTERN = /^product_category:[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isProductCardSort(
  value: unknown,
): value is "modified_desc" | "title_asc" {
  return value === "modified_desc" || value === "title_asc";
}

function isProductCategoryFilter(
  value: unknown,
): value is `product_category:${string}` {
  return typeof value === "string" && FILTER_PATTERN.test(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    nodeTypes.isProxy(value)
  ) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function snapshotQuery(input: unknown): Record<string, unknown> {
  try {
    if (!isPlainObject(input)) {
      throw new ProductCardConfigurationError("invalid_query");
    }

    const snapshot: Record<string, unknown> = {};
    for (const key of Reflect.ownKeys(input)) {
      if (typeof key !== "string" || !QUERY_KEYS.has(key)) {
        throw new ProductCardConfigurationError("invalid_query");
      }

      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      ) {
        throw new ProductCardConfigurationError("invalid_query");
      }
      snapshot[key] = descriptor.value;
    }
    return snapshot;
  } catch (error) {
    if (error instanceof ProductCardConfigurationError) {
      throw error;
    }
    throw new ProductCardConfigurationError("invalid_query");
  }
}

export function validateProductCardQuery(
  input: ProductCardCollectionQuery = {},
): ValidatedProductCardQuery {
  const snapshot = snapshotQuery(input);
  const page = snapshot.page ?? 1;
  const perPage = snapshot.perPage ?? 10;
  const sort = snapshot.sort ?? "modified_desc";
  const filter = snapshot.filter;

  if (
    typeof page !== "number" ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    typeof perPage !== "number" ||
    !Number.isSafeInteger(perPage) ||
    perPage < 1 ||
    perPage > 100
  ) {
    throw new ProductCardConfigurationError("invalid_query");
  }

  if (!isProductCardSort(sort)) {
    throw new ProductCardConfigurationError("invalid_query");
  }

  const requiredQuery = {
    page,
    perPage,
    sort,
  };
  if (filter === undefined) {
    return Object.freeze(requiredQuery);
  }
  if (!isProductCategoryFilter(filter)) {
    throw new ProductCardConfigurationError("invalid_query");
  }
  return Object.freeze({ ...requiredQuery, filter });
}

export function buildProductCardUrl(
  base: URL,
  query: ValidatedProductCardQuery,
): URL {
  const url = new URL(`${base.pathname}/gdhe/v1/product-cards`, base);
  url.searchParams.set("locale", "en");
  url.searchParams.set("schema", "1.0.0");
  url.searchParams.set("page", String(query.page));
  url.searchParams.set("per_page", String(query.perPage));
  url.searchParams.set("sort", query.sort);
  if (query.filter !== undefined) {
    url.searchParams.set("filter", query.filter);
  }
  return url;
}

function responseMetadata(response: Response): ProductCardResponseMetadata {
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
  return (
    mediaType === "application/json" ||
    /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(mediaType)
  );
}

function httpErrorKind(status: number): ProductCardHttpErrorKind {
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
  metadata: ProductCardResponseMetadata,
): Promise<unknown> {
  if (!isJsonContentType(metadata.contentType)) {
    throw new ProductCardProtocolError("invalid_content_type");
  }
  const text = await response.text();
  if (text.trim() === "") {
    throw new ProductCardProtocolError("empty_body");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ProductCardProtocolError("invalid_json");
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
    error instanceof ProductCardHttpError ||
    error instanceof ProductCardProtocolError ||
    error instanceof ProductCardTransportError
  ) {
    throw error;
  }
  if (isRedirectFailure(error)) {
    throw new ProductCardProtocolError("redirect");
  }
  if (callerSignal?.aborted) {
    throw new ProductCardTransportError("aborted");
  }
  if (timeoutSignal.aborted) {
    throw new ProductCardTransportError("timeout");
  }
  throw new ProductCardTransportError("network");
}

export async function requestProductCardCollection(
  input: ProductCardCollectionQuery = {},
  callerSignal?: AbortSignal,
): Promise<ProductCardTransportOutcome> {
  const query = validateProductCardQuery(input);
  const base = parseWordPressApiUrl(process.env.WORDPRESS_API_URL);
  const url = buildProductCardUrl(base, query);
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

    if (response.status === 304) {
      return {
        kind: "not_modified",
        metadata: { ...metadata, status: 304 },
      };
    }
    if (response.status !== 200) {
      if (response.status >= 200 && response.status < 300) {
        throw new ProductCardProtocolError("unexpected_status");
      }
      if (metadata.cacheControl !== "no-store") {
        throw new ProductCardProtocolError("invalid_cache_control");
      }
      const body = await parseJsonBody(response, metadata);
      throw new ProductCardHttpError(
        httpErrorKind(response.status),
        response.status,
        metadata,
        body,
      );
    }
    if (!metadata.etag) {
      throw new ProductCardProtocolError("missing_etag");
    }
    if (metadata.cacheControl !== "public, max-age=60") {
      throw new ProductCardProtocolError("invalid_cache_control");
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
