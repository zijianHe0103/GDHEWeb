import "server-only";

export type CmsContractErrorKind =
  | "unsupported_schema"
  | "invalid_success_payload"
  | "invalid_error_payload";

export class CmsContractError extends Error {
  readonly category = "contract";

  constructor(readonly kind: CmsContractErrorKind) {
    super("CMS payload did not satisfy the supported contract.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "CmsContractError",
    });
  }
}
