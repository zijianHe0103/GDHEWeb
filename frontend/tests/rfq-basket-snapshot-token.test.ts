import { describe, expect, test } from "vitest";

import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import {
  RfqBasketSnapshotTokenError,
  computeRfqBasketSnapshotTokenBrowser,
} from "../src/lib/rfq/submission/snapshot-token";

function expectClosedFailure(input: unknown): Promise<void> {
  return expect(computeRfqBasketSnapshotTokenBrowser(input)).rejects.toMatchObject({
    category: "basket_snapshot_token",
    kind: "invalid_snapshot",
    message: "The Quote Basket snapshot token could not be computed.",
  });
}

describe("TASK-028 browser-compatible Basket snapshot token", () => {
  test("reproduces the frozen v2 canonical snapshot vector with Web Crypto", async () => {
    await expect(computeRfqBasketSnapshotTokenBrowser(
      structuredClone(publicSubmission.basket.sourceBasket),
    )).resolves.toBe(vectors.submittedBasketTokenSha256Hex);
  });

  test("rejects unsupported, precision-changing and non-data snapshots without coercion", async () => {
    const source = structuredClone(publicSubmission.basket.sourceBasket);
    let getterReads = 0;
    const accessor = { ...source };
    Object.defineProperty(accessor, "writerId", {
      enumerable: true,
      get() {
        getterReads += 1;
        return source.writerId;
      },
    });
    let coercions = 0;
    const hostile = new Proxy(Object.create(null), {
      ownKeys() {
        throw new Error("private snapshot diagnostic");
      },
      get() {
        coercions += 1;
        return "private snapshot diagnostic";
      },
    });

    const cases: unknown[] = [
      { ...source, revision: Number.MAX_SAFE_INTEGER + 1 },
      { ...source, writerId: "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA" },
      { ...source, updatedAt: `${source.updatedAt}${String.fromCharCode(0xd800)}` },
      Object.assign({ ...source }, { [Symbol("private")]: "hidden" }),
      accessor,
      new Proxy({ ...source }, {}),
      hostile,
    ];
    for (const input of cases) await expectClosedFailure(input);
    expect(getterReads).toBe(0);
    expect(coercions).toBe(0);

    const error = new RfqBasketSnapshotTokenError();
    expect(`${String(error)} ${JSON.stringify(error)}`).not.toMatch(
      /private snapshot diagnostic|writerId|mutationId|submittedBasketToken/i,
    );
  });
});
