import "server-only";

export type RfqContractErrorKind =
  | "unsupported_contract_version"
  | "invalid_public_submission"
  | "invalid_authoritative_document"
  | "invalid_public_receipt"
  | "invalid_public_error"
  | "invalid_canonical_value"
  | "invalid_key_material";

export class RfqContractError extends Error {
  readonly category = "contract";

  constructor(readonly kind: RfqContractErrorKind) {
    super("RFQ value did not satisfy the supported contract.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqContractError",
    });
  }
}

export type RfqAuthorityErrorKind =
  | "invalid_submission"
  | "invalid_projection"
  | "mixed_validation_failed"
  | "invalid_authority_context"
  | "response_mismatch";

export class RfqAuthorityError extends Error {
  readonly category = "authority";

  constructor(readonly kind: RfqAuthorityErrorKind) {
    super("RFQ authority could not be resolved.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqAuthorityError",
    });
  }
}

export type RfqIntakeErrorKind =
  | "invalid_submission"
  | "dependency_failed"
  | "pre_reservation_rejected"
  | "existing_reservation"
  | "reservation_failed";

export class RfqIntakeError extends Error {
  readonly category = "intake";

  constructor(readonly kind: RfqIntakeErrorKind) {
    super("RFQ intake could not continue.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqIntakeError",
    });
  }
}
