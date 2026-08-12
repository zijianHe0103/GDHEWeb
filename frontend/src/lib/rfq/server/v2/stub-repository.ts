import "server-only";

import {
  getValidatedRfqBody,
  type ValidatedRfqDocument,
} from "./contract";
import type { RfqReservationInput } from "./intake";

type PublicDocument =
  | ValidatedRfqDocument<"public_receipt">
  | ValidatedRfqDocument<"public_error">;

type StoredStatus =
  | "reserved"
  | "accepted"
  | "processing"
  | "rejected"
  | "delivery_indeterminate";

type StoredRecord = {
  readonly payloadDigest: string;
  readonly comparisonToken: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  status: StoredStatus;
  document?: PublicDocument;
  httpStatus?: 201 | 202 | 409;
};

export type StubRfqLookupInput = Readonly<{
  keyFingerprint: string;
  payloadDigest: string;
  comparisonToken: string;
  now: string;
}>;

export type StubRfqLookupResult =
  | Readonly<{ kind: "miss" }>
  | Readonly<{
      kind: "replay";
      httpStatus: 200 | 202 | 409;
      document: PublicDocument;
    }>
  | Readonly<{ kind: "conflict" }>
  | Readonly<{ kind: "expired_indeterminate" }>;

export type StubRfqTransitionInput = Readonly<{
  keyFingerprint: string;
  state: Exclude<StoredStatus, "reserved">;
  httpStatus: 201 | 202 | 409;
  document: PublicDocument;
}>;

const authenticLookupResults = new WeakSet<object>();

function freeze<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}

function lookupResult<T extends StubRfqLookupResult>(value: T): T {
  const result = Object.freeze(value);
  authenticLookupResults.add(result);
  return result;
}

export function readStubRfqLookupResult(input: unknown): StubRfqLookupResult | undefined {
  return typeof input === "object" && input !== null && authenticLookupResults.has(input)
    ? input as StubRfqLookupResult
    : undefined;
}

export class StubRfqRepository {
  readonly #records = new Map<string, StoredRecord>();

  async lookup(input: StubRfqLookupInput): Promise<StubRfqLookupResult> {
    const record = this.#records.get(input.keyFingerprint);
    if (!record) return lookupResult({ kind: "miss" });
    if (Date.parse(input.now) >= Date.parse(record.expiresAt)) {
      if (record.status === "delivery_indeterminate") {
        return lookupResult({ kind: "expired_indeterminate" });
      }
      this.#records.delete(input.keyFingerprint);
      return lookupResult({ kind: "miss" });
    }
    if (
      record.payloadDigest !== input.payloadDigest ||
      record.comparisonToken !== input.comparisonToken
    ) {
      return lookupResult({ kind: "conflict" });
    }
    if (!record.document || record.httpStatus === undefined) {
      return lookupResult({ kind: "expired_indeterminate" });
    }
    const httpStatus: 200 | 202 | 409 = record.httpStatus === 201
      ? 200
      : record.httpStatus;
    return lookupResult({
      kind: "replay",
      httpStatus,
      document: record.document,
    });
  }

  async reserve(input: RfqReservationInput): Promise<boolean> {
    if (this.#records.has(input.keyFingerprint)) return false;
    this.#records.set(input.keyFingerprint, {
      payloadDigest: input.payloadDigest.value,
      comparisonToken: input.comparisonToken,
      createdAt: input.createdAt,
      expiresAt: input.expiresAt,
      status: "reserved",
    });
    return true;
  }

  async transition(input: StubRfqTransitionInput): Promise<void> {
    const record = this.#records.get(input.keyFingerprint);
    if (!record || record.status !== "reserved") throw new Error("invalid transition");
    getValidatedRfqBody(
      input.document,
      input.state === "accepted" ||
        input.state === "processing" ||
        input.state === "delivery_indeterminate"
        ? "public_receipt"
        : "public_error",
    );
    record.status = input.state;
    record.document = input.document;
    record.httpStatus = input.httpStatus;
  }

  inspect(): readonly Readonly<{
    keyFingerprint: string;
    status: StoredStatus;
    createdAt: string;
    expiresAt: string;
  }>[] {
    return Object.freeze([...this.#records.entries()].map(([keyFingerprint, record]) =>
      freeze({
        keyFingerprint,
        status: record.status,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      })));
  }
}
