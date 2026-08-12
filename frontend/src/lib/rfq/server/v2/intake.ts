import "server-only";

import { createHash } from "node:crypto";

import type {
  MixedQuoteLineRequestLine,
  MixedQuoteLineValidationDto,
} from "../../../cms/server/article-number-batch/types";
import { resolveAuthoritativeRfqLines } from "./authority";
import {
  computeRfqBasketSnapshotToken,
  computeRfqBusinessDigest,
  computeRfqComparisonToken,
} from "./canonical";
import {
  getValidatedRfqBody,
  snapshotRfqJsonValue,
  validateAuthoritativeRfqDocument,
  validatePublicRfqError,
  validatePublicRfqReceipt,
  type ValidatedRfqDocument,
} from "./contract";
import { RfqIntakeError } from "./errors";
import {
  readStubRfqLookupResult,
  StubRfqRepository,
} from "./stub-repository";
import { StubRfqSink } from "./stub-sink";

const RETENTION_MS = 2_592_000_000;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PUBLIC_REFERENCE = /^RFQ-[A-Z2-9]{12}$/;
const HEX_SHA256 = /^[0-9a-f]{64}$/;

type IntakeLookupResult =
  | Readonly<{ kind: "miss" }>
  | Readonly<{ kind: "existing" }>
  | Readonly<{ kind: "expired_indeterminate" }>;

export type RfqReservationInput = Readonly<{
  keyFingerprint: string;
  payloadDigest: Readonly<{ keyVersion: string; value: string }>;
  comparisonToken: string;
  basketSnapshotToken: string;
  rfqId: string;
  publicReference: string;
  createdAt: string;
  expiresAt: string;
}>;

export type RfqIntakeDependencies = Readonly<{
  clock: Readonly<{ now: () => string }>;
  ids: Readonly<{
    nextRfqId: () => string;
    nextPublicReference: () => string;
  }>;
  keyMaterial: Readonly<{
    keyVersion: string;
    secretKey: Uint8Array;
  }>;
  sourceSecurity: Readonly<{
    sourceFingerprint: string;
    contactFingerprint?: string;
    outcomeCode: "new_intent";
  }>;
  repository: Readonly<{
    lookup: (input: Readonly<{
      keyFingerprint: string;
      payloadDigest: string;
      comparisonToken: string;
      now: string;
    }>) => Promise<IntakeLookupResult>;
    reserve: (input: RfqReservationInput) => Promise<void>;
  }>;
  preReservationGate: (
    submission: ValidatedRfqDocument<"public_submission">,
  ) => Promise<void>;
  validateMixedQuoteLines: (
    lines: readonly MixedQuoteLineRequestLine[],
  ) => Promise<MixedQuoteLineValidationDto>;
}>;

export type RfqLocalIntakeResult = Readonly<{
  httpStatus: 200 | 201 | 202 | 409;
  document:
    | ValidatedRfqDocument<"public_receipt">
    | ValidatedRfqDocument<"public_error">;
}>;

export type RfqLocalIntakeDependencies = Readonly<{
  clock: RfqIntakeDependencies["clock"];
  ids: RfqIntakeDependencies["ids"] & Readonly<{
    nextRequestReference: () => string;
  }>;
  keyMaterial: RfqIntakeDependencies["keyMaterial"];
  sourceSecurity: RfqIntakeDependencies["sourceSecurity"];
  repository: StubRfqRepository;
  preReservationGate: RfqIntakeDependencies["preReservationGate"];
  validateMixedQuoteLines: RfqIntakeDependencies["validateMixedQuoteLines"];
  sink: StubRfqSink;
}>;

type JsonRecord = Readonly<Record<string, unknown>>;
type IntakeSourceSecurity = RfqIntakeDependencies["sourceSecurity"];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function freezeRecord<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}

function fingerprint(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function requireSubmissionBody(
  submission: ValidatedRfqDocument<"public_submission">,
): JsonRecord {
  try {
    const body = getValidatedRfqBody(submission, "public_submission");
    if (
      !isRecord(body) ||
      !isRecord(body.basket) ||
      !isRecord(body.customer) ||
      !isRecord(body.privacyNotice) ||
      typeof body.idempotencyKey !== "string"
    ) {
      throw new TypeError("invalid submission");
    }
    return body;
  } catch {
    throw new RfqIntakeError("invalid_submission");
  }
}

function requireLookupResult(input: unknown): IntakeLookupResult {
  try {
    const result = snapshotRfqJsonValue(input);
    if (
      !isRecord(result) ||
      Object.keys(result).length !== 1 ||
      !["miss", "existing", "expired_indeterminate"].includes(
        result.kind as string,
      )
    ) {
      throw new TypeError("invalid lookup result");
    }
    return result as IntakeLookupResult;
  } catch {
    throw new RfqIntakeError("dependency_failed");
  }
}

function requireSourceSecurity(input: unknown): IntakeSourceSecurity {
  try {
    const snapshot = snapshotRfqJsonValue(input);
    if (!isRecord(snapshot)) throw new TypeError("invalid source security");
    const keys = Object.keys(snapshot).sort();
    const expected = snapshot.contactFingerprint === undefined
      ? ["outcomeCode", "sourceFingerprint"]
      : ["contactFingerprint", "outcomeCode", "sourceFingerprint"];
    if (
      JSON.stringify(keys) !== JSON.stringify(expected) ||
      snapshot.outcomeCode !== "new_intent" ||
      typeof snapshot.sourceFingerprint !== "string" ||
      !HEX_SHA256.test(snapshot.sourceFingerprint) ||
      (
        snapshot.contactFingerprint !== undefined &&
        (
          typeof snapshot.contactFingerprint !== "string" ||
          !HEX_SHA256.test(snapshot.contactFingerprint)
        )
      )
    ) {
      throw new TypeError("invalid source security");
    }
    return snapshot as IntakeSourceSecurity;
  } catch {
    throw new RfqIntakeError("dependency_failed");
  }
}

export function createRfqIntakeRuntime(dependencies: RfqIntakeDependencies):
Readonly<{
  resolve: (
    submission: ValidatedRfqDocument<"public_submission">,
  ) => Promise<ValidatedRfqDocument<"authoritative_document">>;
}>;
export function createRfqIntakeRuntime(dependencies: RfqLocalIntakeDependencies):
Readonly<{
  resolve: (
    submission: ValidatedRfqDocument<"public_submission">,
  ) => Promise<RfqLocalIntakeResult>;
}>;
export function createRfqIntakeRuntime(
  dependencies: RfqIntakeDependencies | RfqLocalIntakeDependencies,
): Readonly<{
  resolve: (
    submission: ValidatedRfqDocument<"public_submission">,
  ) => Promise<ValidatedRfqDocument<"authoritative_document"> | RfqLocalIntakeResult>;
}> {
  const localDependencies = "sink" in dependencies ? dependencies : undefined;

  function requestReference(): string {
    if (!localDependencies) throw new RfqIntakeError("dependency_failed");
    try {
      const value: unknown = localDependencies.ids.nextRequestReference();
      if (
        typeof value !== "string" ||
        !/^REQ-[A-Z2-9]{12}$/.test(value)
      ) {
        throw new RfqIntakeError("dependency_failed");
      }
      return value;
    } catch {
      throw new RfqIntakeError("dependency_failed");
    }
  }

  function publicError(
    code: "request_not_allowed" | "idempotency_conflict" | "service_temporarily_unavailable" | "basket_refresh_required",
    fieldErrors?: readonly Readonly<{ field: "basket"; code: "changed" }>[] ,
  ): ValidatedRfqDocument<"public_error"> {
    return validatePublicRfqError({
      contractVersion: "2.0.0",
      error: {
        code,
        requestReference: requestReference(),
        messageKey: `rfq.error.${code}`,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    });
  }

  function localResult(
    httpStatus: 200 | 201 | 202 | 409,
    document: RfqLocalIntakeResult["document"],
  ): RfqLocalIntakeResult {
    return freezeRecord({ httpStatus, document });
  }

  async function persistLocalResult(
    input: Parameters<StubRfqRepository["transition"]>[0],
  ): Promise<void> {
    if (!localDependencies) throw new RfqIntakeError("dependency_failed");
    try {
      await localDependencies.repository.transition(input);
    } catch {
      throw new RfqIntakeError("dependency_failed");
    }
  }

  return freezeRecord({
    async resolve(submission: ValidatedRfqDocument<"public_submission">) {
      const body = requireSubmissionBody(submission);
      let now: string;
      let expiresAt: string;
      let payloadDigest: Readonly<{ keyVersion: string; value: string }>;
      let comparisonToken: string;
      let basketSnapshotToken: string;
      let keyFingerprint: string;
      try {
        now = dependencies.clock.now();
        if (new Date(now).toISOString() !== now) throw new TypeError("invalid clock");
        expiresAt = new Date(Date.parse(now) + RETENTION_MS).toISOString();
        const businessPayload = {
          basket: body.basket,
          customer: body.customer,
          privacyNotice: body.privacyNotice,
        };
        payloadDigest = computeRfqBusinessDigest(
          businessPayload,
          dependencies.keyMaterial.keyVersion,
          dependencies.keyMaterial.secretKey,
        );
        comparisonToken = computeRfqComparisonToken(businessPayload);
        basketSnapshotToken = computeRfqBasketSnapshotToken(
          (body.basket as JsonRecord).sourceBasket,
        );
        keyFingerprint = fingerprint(body.idempotencyKey as string);
      } catch {
        throw new RfqIntakeError("dependency_failed");
      }

      let lookupInput: unknown;
      try {
        lookupInput = await dependencies.repository.lookup(
          freezeRecord({
            keyFingerprint,
            payloadDigest: payloadDigest.value,
            comparisonToken,
            now,
          }),
        );
      } catch {
        throw new RfqIntakeError("dependency_failed");
      }
      if (localDependencies) {
        const lookup = readStubRfqLookupResult(lookupInput);
        if (!lookup) throw new RfqIntakeError("dependency_failed");
        if (lookup.kind === "replay") {
          return localResult(lookup.httpStatus, lookup.document);
        }
        if (lookup.kind === "conflict") {
          return localResult(409, publicError("idempotency_conflict"));
        }
        if (lookup.kind === "expired_indeterminate") {
          return localResult(409, publicError("service_temporarily_unavailable"));
        }
        if (lookup.kind !== "miss") {
          throw new RfqIntakeError("dependency_failed");
        }
      }
      const lookup = localDependencies
        ? ({ kind: "miss" } as const)
        : requireLookupResult(lookupInput);
      if (lookup.kind !== "miss") {
        throw new RfqIntakeError("existing_reservation");
      }

      try {
        await dependencies.preReservationGate(submission);
      } catch {
        if (localDependencies) {
          return localResult(409, publicError("request_not_allowed"));
        }
        throw new RfqIntakeError("pre_reservation_rejected");
      }

      let rfqId: string;
      let publicReference: string;
      let sourceSecurity: IntakeSourceSecurity;
      let validateMixedQuoteLines: RfqIntakeDependencies["validateMixedQuoteLines"];
      try {
        rfqId = dependencies.ids.nextRfqId();
        publicReference = dependencies.ids.nextPublicReference();
        sourceSecurity = requireSourceSecurity(dependencies.sourceSecurity);
        validateMixedQuoteLines = dependencies.validateMixedQuoteLines;
        if (
          !UUID_V4.test(rfqId) ||
          !PUBLIC_REFERENCE.test(publicReference) ||
          typeof validateMixedQuoteLines !== "function"
        ) {
          throw new TypeError("invalid reservation identity");
        }
      } catch {
        throw new RfqIntakeError("dependency_failed");
      }
      const reservation = freezeRecord({
        keyFingerprint,
        payloadDigest,
        comparisonToken,
        basketSnapshotToken,
        rfqId,
        publicReference,
        createdAt: now,
        expiresAt,
      });
      try {
        const reserved = await dependencies.repository.reserve(reservation);
        if (localDependencies && reserved === false) {
          return localResult(409, publicError("service_temporarily_unavailable"));
        }
      } catch {
        throw new RfqIntakeError("reservation_failed");
      }

      const resolvingContext = {
          rfqId,
          publicReference,
          receivedAt: now,
          status: "resolving_lines",
          payloadDigest,
          idempotency: { keyFingerprint, createdAt: now, expiresAt },
          sourceSecurity,
          delivery: {
            state: "not_started",
            attemptCount: 0,
            lastTransitionAt: now,
          },
      } as const;
      if (!localDependencies) {
        return resolveAuthoritativeRfqLines(submission, {
          validateMixedQuoteLines,
          document: resolvingContext,
        });
      }

      let resolving: ValidatedRfqDocument<"authoritative_document">;
      try {
        resolving = await resolveAuthoritativeRfqLines(submission, {
          validateMixedQuoteLines,
          document: resolvingContext,
        });
      } catch {
        const error = publicError("basket_refresh_required", [
          { field: "basket", code: "changed" },
        ]);
        await persistLocalResult({
          keyFingerprint,
          state: "rejected",
          httpStatus: 409,
          document: error,
        });
        return localResult(409, error);
      }

      const resolvingBody = getValidatedRfqBody(
        resolving,
        "authoritative_document",
      ) as JsonRecord;
      const pending = validateAuthoritativeRfqDocument({
        ...resolvingBody,
        status: "delivery_pending",
        delivery: {
          state: "pending",
          attemptCount: 1,
          lastTransitionAt: now,
        },
      }, payloadDigest);

      let outcome: "accepted" | "indeterminate" | "rejected_before_delivery";
      try {
        outcome = (await localDependencies.sink.deliver(pending)).kind;
      } catch {
        outcome = "indeterminate";
      }

      const sourceBasket = (body.basket as JsonRecord).sourceBasket;
      const lineCount = ((body.basket as JsonRecord).items as readonly unknown[]).length;
      if (outcome === "accepted" || outcome === "indeterminate") {
        const processing = outcome === "indeterminate";
        const receipt = validatePublicRfqReceipt({
          contractVersion: "2.0.0",
          publicReference,
          status: processing ? "processing" : "accepted",
          receivedAt: now,
          lineCount,
          messageKey: processing ? "rfq.processing" : "rfq.accepted",
          submittedBasketSnapshot: sourceBasket,
          submittedBasketToken: basketSnapshotToken,
          ...(processing ? { retryAfterSeconds: 30 } : {}),
        });
        await persistLocalResult({
          keyFingerprint,
          state: processing ? "delivery_indeterminate" : "accepted",
          httpStatus: processing ? 202 : 201,
          document: receipt,
        });
        return localResult(processing ? 202 : 201, receipt);
      }

      const error = publicError("service_temporarily_unavailable");
      await persistLocalResult({
        keyFingerprint,
        state: "rejected",
        httpStatus: 409,
        document: error,
      });
      return localResult(409, error);
    },
  });
}
