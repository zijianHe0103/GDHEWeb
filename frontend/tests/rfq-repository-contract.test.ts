import { describe, expect, test } from "vitest";

import {
  createRfqRepositoryLookupResult,
  createRfqRepositoryReservationResult,
  createRfqRepositoryTransitionResult,
  readRfqRepositoryLookupResult,
  readRfqRepositoryReservationResult,
  readRfqRepositoryTransitionResult,
  type RfqRepository,
} from "../src/lib/rfq/server/v2/repository";
import { StubRfqRepository } from "../src/lib/rfq/server/v2/stub-repository";

describe("TASK-029 common RFQ repository contract", () => {
  test("accepts only authentic frozen lookup results and retains the Stub implementation", () => {
    const repository: RfqRepository = new StubRfqRepository();
    expect(repository).toBeInstanceOf(StubRfqRepository);

    for (const result of [
      createRfqRepositoryLookupResult({ kind: "miss" }),
      createRfqRepositoryLookupResult({ kind: "conflict" }),
      createRfqRepositoryLookupResult({ kind: "recovery_required" }),
    ]) {
      expect(readRfqRepositoryLookupResult(result)).toBe(result);
      expect(Object.isFrozen(result)).toBe(true);
    }

    expect(readRfqRepositoryLookupResult({ kind: "miss" })).toBeUndefined();
    const reservation = createRfqRepositoryReservationResult();
    expect(readRfqRepositoryReservationResult(reservation)).toBe(reservation);
    expect(readRfqRepositoryReservationResult({
      kind: "reserved",
      state: "idempotency_reserved",
      rowVersion: 1,
    })).toBeUndefined();
    const transition = createRfqRepositoryTransitionResult("resolving_lines", 2);
    expect(readRfqRepositoryTransitionResult(transition)).toBe(transition);
    expect(readRfqRepositoryTransitionResult({
      kind: "transitioned",
      state: "resolving_lines",
      rowVersion: 2,
    })).toBeUndefined();

    expect(() => createRfqRepositoryLookupResult({
      kind: "miss",
      privateDiagnostic: "PRIVATE_REPOSITORY_RESULT",
    } as never)).toThrowError("invalid_repository_lookup_result");
    expect(() => createRfqRepositoryLookupResult({
      kind: "replay",
      httpStatus: 200,
      document: {},
    } as never)).toThrowError("invalid_repository_lookup_result");

    const trapCalls = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostile = new Proxy(Object.create(null), {
      get() {
        trapCalls.get += 1;
        throw new Error("PRIVATE_REPOSITORY_RESULT");
      },
      getPrototypeOf() {
        trapCalls.getPrototypeOf += 1;
        throw new Error("PRIVATE_REPOSITORY_RESULT");
      },
      ownKeys() {
        trapCalls.ownKeys += 1;
        throw new Error("PRIVATE_REPOSITORY_RESULT");
      },
    });
    expect(readRfqRepositoryLookupResult(hostile)).toBeUndefined();
    expect(() => createRfqRepositoryLookupResult(hostile as never))
      .toThrowError("invalid_repository_lookup_result");
    expect(trapCalls).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });
  });
});
