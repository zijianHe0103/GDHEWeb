import "server-only";

export type CmsConfigurationErrorKind =
  | "missing_base"
  | "invalid_base"
  | "invalid_path";

export class CmsConfigurationError extends Error {
  readonly category = "configuration";

  constructor(readonly kind: CmsConfigurationErrorKind) {
    super(
      kind === "missing_base"
        ? "CMS REST base configuration is missing."
        : kind === "invalid_path"
          ? "CMS public path is not canonical."
          : "CMS REST base configuration is invalid.",
    );
    this.name = "CmsConfigurationError";
  }
}

export type CmsProtocolErrorKind =
  | "redirect"
  | "unexpected_success_status"
  | "invalid_content_type"
  | "empty_body"
  | "invalid_json";

export class CmsProtocolError extends Error {
  readonly category = "protocol";

  constructor(readonly kind: CmsProtocolErrorKind) {
    super("CMS response did not satisfy the transport protocol.");
    this.name = "CmsProtocolError";
  }
}

export type CmsResponseMetadata = {
  status: number;
  requestId?: string;
  etag?: string;
  lastModified?: string;
  retryAfter?: string;
  contentType: string;
};

export type CmsTransportErrorKind = "timeout" | "aborted" | "network";

export class CmsTransportError extends Error {
  readonly category = "transport";

  constructor(readonly kind: CmsTransportErrorKind) {
    super("CMS request could not be completed.");
    this.name = "CmsTransportError";
  }
}

export type CmsHttpErrorKind =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "upstream_failure"
  | "unexpected_status";

export class CmsHttpError extends Error {
  readonly category = "http";
  readonly #body: unknown;

  constructor(
    readonly kind: CmsHttpErrorKind,
    readonly status: number,
    readonly metadata: CmsResponseMetadata,
    body: unknown,
  ) {
    super("CMS returned an HTTP error.");
    this.name = "CmsHttpError";
    this.#body = body;
  }

  get body(): unknown {
    return this.#body;
  }
}
