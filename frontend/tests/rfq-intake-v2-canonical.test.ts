import { describe, expect, test } from "vitest";

import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import vectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import invalidVectors from "../src/lib/rfq-submission-contract/v2/vectors/invalid/crypto-mutations.v2.json";
import {
  canonicalizeRfqValue,
  computeRfqBasketSnapshotToken,
  computeRfqBusinessDigest,
  computeRfqComparisonToken,
  RfqContractError,
} from "../src/lib/rfq/server/v2";

function businessPayload(): {
  basket: typeof publicSubmission.basket;
  customer: typeof publicSubmission.customer;
  privacyNotice: typeof publicSubmission.privacyNotice;
} {
  return {
    basket: publicSubmission.basket,
    customer: publicSubmission.customer,
    privacyNotice: publicSubmission.privacyNotice,
  };
}

function testSecret(): Uint8Array {
  return Uint8Array.from(
    Buffer.from(vectors.algorithm.testSecretKeyHex, "hex"),
  );
}

function expectCanonicalError(
  assertion: () => unknown,
  kind: "invalid_canonical_value" | "invalid_key_material",
): void {
  try {
    assertion();
    expect.unreachable("Expected canonical RFQ error.");
  } catch (error) {
    expect(error).toBeInstanceOf(RfqContractError);
    expect(error).toMatchObject({ category: "contract", kind });
    expect(`${String(error)} ${JSON.stringify(error)}`).not.toMatch(
      /SECRET_|schemaPath|instancePath|stack/i,
    );
  }
}

describe("TASK-027 RFQ Intake v2 canonical crypto", () => {
  test("reproduces the exact versioned TASK-026 crypto vectors", () => {
    const business = businessPayload();
    const secret = testSecret();

    expect(canonicalizeRfqValue(business)).toBe(
      vectors.canonicalBusinessPayload,
    );
    expect(
      computeRfqBusinessDigest(
        business,
        vectors.algorithm.testKeyVersion,
        secret,
      ),
    ).toEqual({
      keyVersion: vectors.algorithm.testKeyVersion,
      value: vectors.payloadDigestHmacSha256Hex,
    });
    expect(computeRfqComparisonToken(business)).toBe(
      vectors.comparisonTokenSha256Hex,
    );
    expect(computeRfqBasketSnapshotToken(publicSubmission.basket.sourceBasket)).toBe(
      vectors.submittedBasketTokenSha256Hex,
    );
  });

  test("keeps the frozen bad-HMAC, comparison and effect mutations negative", () => {
    const business = businessPayload();
    const digest = computeRfqBusinessDigest(
      business,
      vectors.algorithm.testKeyVersion,
      testSecret(),
    );
    const comparison = computeRfqComparisonToken(business);
    const cases = Object.fromEntries(
      invalidVectors.cases.map((item) => [item.id, item]),
    );

    expect(digest.value).not.toBe(cases.bad_v2_hmac.value);
    expect(comparison).not.toBe(cases.bad_comparison_token.value);
    expect(cases.wrong_replay_effect).toMatchObject({
      pointer: "/replayCases/3/expected/durableBusinessState",
      expectedError: "replay_effect_mismatch",
    });
    expect(vectors.replayCases[3].expected.durableBusinessState).toBe("none");
    expect(vectors.replayCases[3].expected.durableBusinessState).not.toBe(
      cases.wrong_replay_effect.value,
    );
  });

  test("implements the JSON-domain RFC 8785 ordering and number surface", () => {
    expect(
      canonicalizeRfqValue({ z: -0, a: [1e30, 0.000001, "😀"] }),
    ).toBe('{"a":[1e+30,0.000001,"😀"],"z":0}');
  });

  test.each([
    ["lone surrogate", { value: String.fromCharCode(0xd800) }],
    ["non-finite number", { value: Number.POSITIVE_INFINITY }],
    ["undefined", { value: undefined }],
    ["bigint", { value: BigInt(1) }],
    ["function", { value: () => "SECRET_FUNCTION" }],
  ])("rejects an unsupported %s without coercion", (_name, value) => {
    expectCanonicalError(
      () => canonicalizeRfqValue(value),
      "invalid_canonical_value",
    );
  });

  test("rejects reflective values without invoking attacker traps", () => {
    const calls = { get: 0, getPrototypeOf: 0, ownKeys: 0 };
    const hostile = new Proxy(Object.create(null), {
      get() {
        calls.get += 1;
        throw new Error("SECRET_GET");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("SECRET_PROTOTYPE");
      },
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("SECRET_KEYS");
      },
    });
    expectCanonicalError(
      () => canonicalizeRfqValue(hostile),
      "invalid_canonical_value",
    );
    expect(calls).toEqual({ get: 0, getPrototypeOf: 0, ownKeys: 0 });

    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    expectCanonicalError(
      () => canonicalizeRfqValue(revoked.proxy),
      "invalid_canonical_value",
    );

    let accessorCalls = 0;
    const accessor = {};
    Object.defineProperty(accessor, "value", {
      enumerable: true,
      get() {
        accessorCalls += 1;
        return "SECRET_ACCESSOR";
      },
    });
    expectCanonicalError(
      () => canonicalizeRfqValue(accessor),
      "invalid_canonical_value",
    );
    expect(accessorCalls).toBe(0);

    expectCanonicalError(
      () => canonicalizeRfqValue({ [Symbol("secret")]: "SECRET_SYMBOL" }),
      "invalid_canonical_value",
    );
  });

  test("accepts only explicit closed 32-byte server key material", () => {
    expectCanonicalError(
      () => computeRfqBusinessDigest(businessPayload(), "INVALID KEY", testSecret()),
      "invalid_key_material",
    );
    expectCanonicalError(
      () => computeRfqBusinessDigest(
        businessPayload(),
        vectors.algorithm.testKeyVersion,
        new Uint8Array(31),
      ),
      "invalid_key_material",
    );

    const calls = { get: 0, getPrototypeOf: 0 };
    const hostileKey = new Proxy(testSecret(), {
      get() {
        calls.get += 1;
        throw new Error("SECRET_KEY_GET");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("SECRET_KEY_PROTOTYPE");
      },
    });
    expectCanonicalError(
      () => computeRfqBusinessDigest(
        businessPayload(),
        vectors.algorithm.testKeyVersion,
        hostileKey,
      ),
      "invalid_key_material",
    );
    expect(calls).toEqual({ get: 0, getPrototypeOf: 0 });
  });
});
