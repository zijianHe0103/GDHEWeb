import "server-only";

import {
  getValidatedRfqBody,
} from "./contract";
import {
  createRfqRepositoryLookupResult,
  createRfqRepositoryReservationResult,
  createRfqRepositoryTransitionResult,
  type RfqRepository,
  type RfqRepositoryLookupInput,
  type RfqRepositoryLookupResult,
  type RfqRepositoryPublicDocument,
  type RfqRepositoryReservationResult,
  type RfqRepositoryState,
  type RfqRepositoryTransitionInput,
  type RfqRepositoryTransitionResult,
  type RfqReservationInput,
} from "./repository";

type StoredRecord = {
  readonly payloadDigest: string;
  readonly comparisonToken: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  state: RfqRepositoryState;
  rowVersion: number;
  document: RfqRepositoryPublicDocument;
  httpStatus: 201 | 202 | 409;
};

export type StubRfqLookupInput = RfqRepositoryLookupInput;
export type StubRfqLookupResult = RfqRepositoryLookupResult;
export type StubRfqTransitionInput = RfqRepositoryTransitionInput;

function freeze<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}

export class StubRfqRepository implements RfqRepository {
  readonly #records = new Map<string, StoredRecord>();

  async lookup(input: StubRfqLookupInput): Promise<StubRfqLookupResult> {
    const record = this.#records.get(input.keyFingerprint);
    if (!record) return createRfqRepositoryLookupResult({ kind: "miss" });
    if (
      record.payloadDigest !== input.payloadDigest ||
      record.comparisonToken !== input.comparisonToken
    ) {
      return createRfqRepositoryLookupResult({ kind: "conflict" });
    }
    if (
      Date.parse(input.now) >= Date.parse(record.expiresAt) &&
      record.state !== "accepted" && record.state !== "rejected_before_delivery"
    ) {
      return createRfqRepositoryLookupResult({ kind: "recovery_required" });
    }
    const httpStatus: 200 | 202 | 409 = record.httpStatus === 201
      ? 200
      : record.httpStatus;
    return createRfqRepositoryLookupResult({
      kind: "replay",
      httpStatus,
      document: record.document,
    });
  }

  async reserve(input: RfqReservationInput): Promise<RfqRepositoryReservationResult> {
    const existing = this.#records.get(input.keyFingerprint);
    if (existing) {
      return existing.payloadDigest === input.payloadDigest.value &&
          existing.comparisonToken === input.comparisonToken
        ? createRfqRepositoryLookupResult({
            kind: "replay",
            httpStatus: existing.httpStatus === 201 ? 200 : existing.httpStatus,
            document: existing.document,
          }) as Exclude<RfqRepositoryReservationResult, { kind: "reserved" }>
        : createRfqRepositoryLookupResult({ kind: "conflict" }) as
          Exclude<RfqRepositoryReservationResult, { kind: "reserved" }>;
    }
    getValidatedRfqBody(input.document, "public_receipt");
    this.#records.set(input.keyFingerprint, {
      payloadDigest: input.payloadDigest.value,
      comparisonToken: input.comparisonToken,
      createdAt: input.createdAt,
      expiresAt: input.expiresAt,
      state: "idempotency_reserved",
      rowVersion: 1,
      document: input.document,
      httpStatus: 202,
    });
    return createRfqRepositoryReservationResult();
  }

  async transition(input: RfqRepositoryTransitionInput): Promise<RfqRepositoryTransitionResult> {
    const record = this.#records.get(input.keyFingerprint);
    if (
      !record ||
      record.state !== input.expectedState ||
      record.rowVersion !== input.expectedRowVersion
    ) throw new Error("stale transition");
    getValidatedRfqBody(
      input.document,
      input.state === "rejected_before_delivery"
        ? "public_error"
        : "public_receipt",
    );
    record.state = input.state;
    record.rowVersion += 1;
    record.document = input.document;
    record.httpStatus = input.httpStatus;
    return createRfqRepositoryTransitionResult(input.state, record.rowVersion);
  }

  inspect(): readonly Readonly<{
    keyFingerprint: string;
    status: RfqRepositoryState;
    createdAt: string;
    expiresAt: string;
  }>[] {
    return Object.freeze([...this.#records.entries()].map(([keyFingerprint, record]) =>
      freeze({
        keyFingerprint,
        status: record.state,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      })));
  }
}
