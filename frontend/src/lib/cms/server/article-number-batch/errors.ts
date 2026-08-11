import "server-only";

export class MixedQuoteLineConfigurationError extends Error {
  readonly category = "configuration";

  constructor(readonly kind: "invalid_request" | "request_too_large") {
    super("Mixed quote-line request configuration is invalid.");
    this.name = "MixedQuoteLineConfigurationError";
  }
}

export class MixedQuoteLineContractError extends Error {
  readonly category = "contract";

  constructor(
    readonly kind:
      | "invalid_request"
      | "unsupported_schema"
      | "invalid_success_payload"
      | "invalid_error_payload"
      | "response_mismatch",
  ) {
    super("Mixed quote-line payload did not satisfy the supported contract.");
    this.name = "MixedQuoteLineContractError";
  }
}

export class MixedQuoteLineProtocolError extends Error {
  readonly category = "protocol";

  constructor(
    readonly kind:
      | "redirect"
      | "unexpected_status"
      | "invalid_content_type"
      | "empty_body"
      | "invalid_json"
      | "invalid_cache_control"
      | "error_status_mismatch",
  ) {
    super("Mixed quote-line response did not satisfy the transport protocol.");
    this.name = "MixedQuoteLineProtocolError";
  }
}

export class MixedQuoteLineTransportError extends Error {
  readonly category = "transport";

  constructor(readonly kind: "timeout" | "aborted" | "network") {
    super("Mixed quote-line request could not be completed.");
    this.name = "MixedQuoteLineTransportError";
  }
}

export type MixedQuoteLineResponseMetadata = Readonly<{
  status: number;
  requestId?: string;
  retryAfter?: string;
  cacheControl?: string;
  contentType: string;
}>;

export class MixedQuoteLineHttpError extends Error {
  readonly category = "http";
  readonly #body: unknown;

  constructor(
    readonly kind: string,
    readonly status: number,
    readonly metadata: MixedQuoteLineResponseMetadata,
    body: unknown,
  ) {
    super("Mixed quote-line endpoint returned an HTTP error.");
    this.name = "MixedQuoteLineHttpError";
    this.#body = body;
  }

  get body(): unknown {
    return this.#body;
  }
}
