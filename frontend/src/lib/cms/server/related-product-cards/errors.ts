import "server-only";

export class RelatedProductCardConfigurationError extends Error {
  readonly category = "configuration";

  constructor(readonly kind: "invalid_source_path") {
    super("Related products request configuration is invalid.");
    this.name = "RelatedProductCardConfigurationError";
  }
}

export class RelatedProductCardProtocolError extends Error {
  readonly category = "protocol";

  constructor(
    readonly kind:
      | "redirect"
      | "unexpected_status"
      | "invalid_content_type"
      | "empty_body"
      | "invalid_json"
      | "missing_etag"
      | "invalid_cache_control"
      | "error_status_mismatch"
      | "not_modified_without_cache",
  ) {
    super("Related products response did not satisfy the transport protocol.");
    this.name = "RelatedProductCardProtocolError";
  }
}

export class RelatedProductCardTransportError extends Error {
  readonly category = "transport";

  constructor(readonly kind: "timeout" | "aborted" | "network") {
    super("Related products request could not be completed.");
    this.name = "RelatedProductCardTransportError";
  }
}

export class RelatedProductCardContractError extends Error {
  readonly category = "contract";

  constructor(
    readonly kind:
      | "unsupported_schema"
      | "invalid_success_payload"
      | "invalid_error_payload",
  ) {
    super("Related products payload did not satisfy the supported contract.");
    this.name = "RelatedProductCardContractError";
  }
}

export type RelatedProductCardResponseMetadata = Readonly<{
  status: number;
  requestId?: string;
  etag?: string;
  cacheControl?: string;
  retryAfter?: string;
  contentType: string;
}>;

export class RelatedProductCardHttpError extends Error {
  readonly category = "http";
  readonly #body: unknown;

  constructor(
    readonly kind: string,
    readonly status: number,
    readonly metadata: RelatedProductCardResponseMetadata,
    body: unknown,
  ) {
    super("Related products endpoint returned an HTTP error.");
    this.name = "RelatedProductCardHttpError";
    this.#body = body;
  }

  get body(): unknown {
    return this.#body;
  }
}
