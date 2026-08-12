import "server-only";

import {
  getValidatedRfqBody,
  type ValidatedRfqDocument,
} from "./contract";
import { RfqIntakeError } from "./errors";

export type StubRfqSinkOutcome =
  | "accepted"
  | "indeterminate"
  | "rejected_before_delivery";

type JsonRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class StubRfqSink {
  readonly #outcome: StubRfqSinkOutcome;
  #callCount = 0;

  constructor(outcome: StubRfqSinkOutcome) {
    if (![
      "accepted",
      "indeterminate",
      "rejected_before_delivery",
    ].includes(outcome)) {
      throw new RfqIntakeError("dependency_failed");
    }
    this.#outcome = outcome;
  }

  get callCount(): number {
    return this.#callCount;
  }

  async deliver(
    document: ValidatedRfqDocument<"authoritative_document">,
  ): Promise<Readonly<{ kind: StubRfqSinkOutcome }>> {
    let body: unknown;
    try {
      body = getValidatedRfqBody(document, "authoritative_document");
    } catch {
      throw new RfqIntakeError("dependency_failed");
    }
    if (
      !isRecord(body) ||
      body.status !== "delivery_pending" ||
      !isRecord(body.delivery) ||
      body.delivery.state !== "pending" ||
      body.delivery.attemptCount !== 1
    ) {
      throw new RfqIntakeError("dependency_failed");
    }
    this.#callCount += 1;
    return Object.freeze({ kind: this.#outcome });
  }
}
