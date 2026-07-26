import "server-only";

export type CmsIntegrationConfigurationErrorKind =
  "invalid_integration_path";

export class CmsIntegrationConfigurationError extends Error {
  readonly category = "configuration";

  constructor(readonly kind: CmsIntegrationConfigurationErrorKind) {
    super("CMS integration page configuration is invalid.");
    this.name = "CmsIntegrationConfigurationError";
  }
}

export type CmsIntegrationErrorKind =
  | "http_error"
  | "not_found_mismatch";

export class CmsIntegrationError extends Error {
  readonly category = "integration";

  constructor(readonly kind: CmsIntegrationErrorKind) {
    super("CMS integration request could not be rendered.");
    this.name = "CmsIntegrationError";
  }
}
