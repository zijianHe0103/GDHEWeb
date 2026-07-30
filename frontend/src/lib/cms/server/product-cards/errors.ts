import "server-only";

export type ProductCardConfigurationErrorKind = "invalid_query";

export class ProductCardConfigurationError extends Error {
  readonly category = "configuration";

  constructor(readonly kind: ProductCardConfigurationErrorKind) {
    super("ProductCard query configuration is invalid.");
    this.name = "ProductCardConfigurationError";
  }
}

export type ProductCardProtocolErrorKind =
  | "redirect"
  | "unexpected_status"
  | "invalid_content_type"
  | "empty_body"
  | "invalid_json"
  | "missing_etag"
  | "invalid_cache_control"
  | "error_status_mismatch"
  | "not_modified_without_cache";

export class ProductCardProtocolError extends Error {
  readonly category = "protocol";

  constructor(readonly kind: ProductCardProtocolErrorKind) {
    super("ProductCard response did not satisfy the transport protocol.");
    this.name = "ProductCardProtocolError";
  }
}

export type ProductCardTransportErrorKind = "timeout" | "aborted" | "network";

export class ProductCardTransportError extends Error {
  readonly category = "transport";

  constructor(readonly kind: ProductCardTransportErrorKind) {
    super("ProductCard request could not be completed.");
    this.name = "ProductCardTransportError";
  }
}

export type ProductCardContractErrorKind =
  | "unsupported_schema"
  | "invalid_success_payload"
  | "invalid_error_payload";

export class ProductCardContractError extends Error {
  readonly category = "contract";

  constructor(readonly kind: ProductCardContractErrorKind) {
    super("ProductCard payload did not satisfy the supported contract.");
    this.name = "ProductCardContractError";
  }
}

export type ProductCardHttpErrorKind =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "upstream_failure"
  | "unexpected_status";

export type ProductCardErrorMetadata = Readonly<{
  status: number;
  requestId?: string;
  etag?: string;
  cacheControl?: string;
  retryAfter?: string;
  contentType: string;
}>;

export class ProductCardHttpError extends Error {
  readonly category = "http";
  readonly #body: unknown;

  constructor(
    readonly kind: ProductCardHttpErrorKind,
    readonly status: number,
    readonly metadata: ProductCardErrorMetadata,
    body: unknown,
  ) {
    super("ProductCard endpoint returned an HTTP error.");
    this.name = "ProductCardHttpError";
    this.#body = body;
  }

  get body(): unknown {
    return this.#body;
  }
}
