import "server-only";

import { types as nodeTypes } from "node:util";

import {
  getValidatedRfqBody,
  type ValidatedRfqDocument,
} from "./contract";

export type RfqRepositoryPublicDocument =
  | ValidatedRfqDocument<"public_receipt">
  | ValidatedRfqDocument<"public_error">;

export type RfqRepositoryLookupInput = Readonly<{
  keyFingerprint: string;
  payloadDigest: string;
  comparisonToken: string;
  now: string;
}>;

export type RfqRepositoryLookupResult =
  | Readonly<{ kind: "miss" }>
  | Readonly<{
      kind: "replay";
      httpStatus: 200 | 202 | 409;
      document: RfqRepositoryPublicDocument;
    }>
  | Readonly<{ kind: "conflict" }>
  | Readonly<{ kind: "recovery_required" }>;

export type RfqReservationInput = Readonly<{
  keyFingerprint: string;
  payloadDigest: Readonly<{ keyVersion: string; value: string }>;
  comparisonToken: string;
  basketSnapshotToken: string;
  rfqId: string;
  publicReference: string;
  createdAt: string;
  expiresAt: string;
  document: ValidatedRfqDocument<"public_receipt">;
}>;

export type RfqRepositoryReservationResult =
  | Readonly<{
      kind: "reserved";
      state: "idempotency_reserved";
      rowVersion: 1;
    }>
  | Exclude<RfqRepositoryLookupResult, Readonly<{ kind: "miss" }>>;

export type RfqRepositoryState =
  | "idempotency_reserved"
  | "resolving_lines"
  | "delivery_pending"
  | "accepted"
  | "delivery_indeterminate"
  | "rejected_before_delivery";

export type RfqRepositoryTransitionInput = Readonly<{
  keyFingerprint: string;
  expectedState: RfqRepositoryState;
  expectedRowVersion: number;
  state: RfqRepositoryState;
  lastTransitionAt: string;
  authoritativeDocument: ValidatedRfqDocument<"authoritative_document"> | null;
  httpStatus: 201 | 202 | 409;
  document: RfqRepositoryPublicDocument;
}>;

export type RfqRepositoryTransitionResult = Readonly<{
  kind: "transitioned";
  state: RfqRepositoryState;
  rowVersion: number;
}>;

export type RfqRepository = Readonly<{
  lookup(input: RfqRepositoryLookupInput): Promise<RfqRepositoryLookupResult>;
  reserve(input: RfqReservationInput): Promise<RfqRepositoryReservationResult>;
  transition(input: RfqRepositoryTransitionInput): Promise<RfqRepositoryTransitionResult>;
}>;

const authenticLookupResults = new WeakSet<object>();
const authenticReservationResults = new WeakSet<object>();
const authenticTransitionResults = new WeakSet<object>();

export function createRfqRepositoryReservationResult(): Readonly<{
  kind: "reserved";
  state: "idempotency_reserved";
  rowVersion: 1;
}> {
  const result = Object.freeze({
    kind: "reserved",
    state: "idempotency_reserved",
    rowVersion: 1,
  });
  authenticReservationResults.add(result);
  return result;
}

export function readRfqRepositoryReservationResult(
  input: unknown,
): RfqRepositoryReservationResult | undefined {
  if (typeof input !== "object" || input === null) return undefined;
  if (authenticReservationResults.has(input)) {
    return input as Extract<RfqRepositoryReservationResult, { kind: "reserved" }>;
  }
  const lookup = readRfqRepositoryLookupResult(input);
  return lookup && lookup.kind !== "miss" ? lookup : undefined;
}

export function createRfqRepositoryTransitionResult(
  state: RfqRepositoryState,
  rowVersion: number,
): RfqRepositoryTransitionResult {
  if (
    ![
      "idempotency_reserved",
      "resolving_lines",
      "delivery_pending",
      "accepted",
      "delivery_indeterminate",
      "rejected_before_delivery",
    ].includes(state) ||
    !Number.isSafeInteger(rowVersion) || rowVersion < 2
  ) throw new TypeError("invalid_repository_transition_result");
  const result = Object.freeze({ kind: "transitioned" as const, state, rowVersion });
  authenticTransitionResults.add(result);
  return result;
}

export function readRfqRepositoryTransitionResult(
  input: unknown,
): RfqRepositoryTransitionResult | undefined {
  return typeof input === "object" && input !== null && authenticTransitionResults.has(input)
    ? input as RfqRepositoryTransitionResult
    : undefined;
}

function invalidLookupResult(): never {
  throw new TypeError("invalid_repository_lookup_result");
}

export function createRfqRepositoryLookupResult(
  value: RfqRepositoryLookupResult,
): RfqRepositoryLookupResult {
  if (typeof value !== "object" || value === null || nodeTypes.isProxy(value)) {
    return invalidLookupResult();
  }

  let descriptors: PropertyDescriptorMap;
  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      return invalidLookupResult();
    }
    descriptors = Object.getOwnPropertyDescriptors(value);
  } catch {
    return invalidLookupResult();
  }

  const keys = Reflect.ownKeys(descriptors);
  if (keys.some((key) => typeof key !== "string")) return invalidLookupResult();
  for (const key of keys) {
    const descriptor = descriptors[key as string];
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      return invalidLookupResult();
    }
  }

  const kind = descriptors.kind?.value;
  let result: RfqRepositoryLookupResult;
  if (kind === "miss" || kind === "conflict" || kind === "recovery_required") {
    if (keys.length !== 1 || keys[0] !== "kind") return invalidLookupResult();
    result = Object.freeze({ kind });
  } else if (kind === "replay") {
    if (
      keys.length !== 3 ||
      !Object.hasOwn(descriptors, "kind") ||
      !Object.hasOwn(descriptors, "httpStatus") ||
      !Object.hasOwn(descriptors, "document")
    ) {
      return invalidLookupResult();
    }
    const httpStatus = descriptors.httpStatus?.value;
    const document = descriptors.document?.value;
    if (httpStatus !== 200 && httpStatus !== 202 && httpStatus !== 409) {
      return invalidLookupResult();
    }
    try {
      getValidatedRfqBody(
        document,
        httpStatus === 409 ? "public_error" : "public_receipt",
      );
    } catch {
      return invalidLookupResult();
    }
    result = Object.freeze({ kind, httpStatus, document });
  } else {
    return invalidLookupResult();
  }

  authenticLookupResults.add(result);
  return result;
}

export function readRfqRepositoryLookupResult(
  input: unknown,
): RfqRepositoryLookupResult | undefined {
  return typeof input === "object" && input !== null && authenticLookupResults.has(input)
    ? input as RfqRepositoryLookupResult
    : undefined;
}
