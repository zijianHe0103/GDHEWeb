import "server-only";

export type ProductConfigurationProtocolErrorKind =
  | "redirect"
  | "unexpected_status"
  | "invalid_content_type"
  | "empty_body"
  | "invalid_json"
  | "missing_etag"
  | "invalid_cache_control"
  | "not_modified_without_cache"
  | "error_status_mismatch";

export class ProductConfigurationProtocolError extends Error {
  readonly category = "protocol";

  constructor(readonly kind: ProductConfigurationProtocolErrorKind) {
    super("Product Configuration response did not satisfy the protocol.");
    this.name = "ProductConfigurationProtocolError";
  }
}

export type ProductConfigurationTransportErrorKind =
  | "timeout"
  | "aborted"
  | "network";

export class ProductConfigurationTransportError extends Error {
  readonly category = "transport";

  constructor(readonly kind: ProductConfigurationTransportErrorKind) {
    super("Product Configuration request could not be completed.");
    this.name = "ProductConfigurationTransportError";
  }
}

export type ProductConfigurationHttpErrorKind =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "upstream_failure"
  | "unexpected_status";

export type ProductConfigurationErrorMetadata = Readonly<{
  status: number;
  requestId?: string;
  etag?: string;
  cacheControl?: string;
  retryAfter?: string;
  contentType: string;
}>;

export class ProductConfigurationHttpError extends Error {
  readonly category = "http";
  readonly #body: unknown;

  constructor(
    readonly kind: ProductConfigurationHttpErrorKind,
    readonly status: number,
    readonly metadata: ProductConfigurationErrorMetadata,
    body: unknown,
  ) {
    super("Product Configuration endpoint returned an HTTP error.");
    this.name = "ProductConfigurationHttpError";
    this.#body = body;
  }

  get body(): unknown {
    return this.#body;
  }
}
