import { describe, expect, test } from "vitest";

import authoritativeDocument from "../src/lib/rfq-submission-contract/v2/samples/positive/authoritative-mixed.json";
import acceptedReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/accepted-receipt.json";
import processingReceipt from "../src/lib/rfq-submission-contract/v2/samples/positive/processing-receipt.json";
import publicError from "../src/lib/rfq-submission-contract/v2/samples/positive/public-error.json";
import publicSubmission from "../src/lib/rfq-submission-contract/v2/samples/positive/public-mixed.json";
import cryptoVectors from "../src/lib/rfq-submission-contract/v2/vectors/expected.v2.json";
import {
  getValidatedRfqBody,
  RfqContractError,
  validateAuthoritativeRfqDocument,
  validatePublicRfqError,
  validatePublicRfqReceipt,
  validatePublicRfqSubmission,
} from "../src/lib/rfq/server/v2";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function expectContractError(
  assertion: () => unknown,
  kind: RfqContractError["kind"],
): RfqContractError {
  try {
    assertion();
    expect.unreachable("Expected an RFQ contract error.");
  } catch (error) {
    expect(error).toBeInstanceOf(RfqContractError);
    expect(error).toMatchObject({ category: "contract", kind });
    return error as RfqContractError;
  }
}

describe("TASK-027 RFQ Intake v2 runtime contract", () => {
  test("returns an authentic caller-isolated deep-frozen public submission", () => {
    const input = structuredClone(publicSubmission);
    const validated = validatePublicRfqSubmission(input);
    const body = validatePublicRfqSubmission.getValidatedBody(
      validated,
    ) as typeof publicSubmission;

    input.customer.fullName = "Caller mutation";

    expect(validated.kind).toBe("public_submission");
    expect(Object.keys(validated)).toEqual(["kind"]);
    expect(JSON.stringify(validated)).toBe('{"kind":"public_submission"}');
    expect(body).not.toBe(input);
    expect(body.customer.fullName).toBe("Ada Buyer");
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(body)).toBe(true);
    expect(Object.isFrozen(body.basket.items)).toBe(true);
    expect(Object.isFrozen(body.basket.items[0])).toBe(true);
    expect(Reflect.set(body.customer, "fullName", "Changed")).toBe(false);
  });

  test("compiles and validates every current v2 document root", () => {
    const digestContext = {
      keyVersion: cryptoVectors.algorithm.testKeyVersion,
      value: cryptoVectors.payloadDigestHmacSha256Hex,
    };
    const authoritative = validateAuthoritativeRfqDocument(
      authoritativeDocument,
      digestContext,
    );
    const accepted = validatePublicRfqReceipt(acceptedReceipt);
    const processing = validatePublicRfqReceipt(processingReceipt);
    const error = validatePublicRfqError(publicError);

    expect(authoritative.kind).toBe("authoritative_document");
    expect(accepted.kind).toBe("public_receipt");
    expect(processing.kind).toBe("public_receipt");
    expect(error.kind).toBe("public_error");
    expect(Object.isFrozen(getValidatedRfqBody(authoritative, "authoritative_document"))).toBe(true);
  });

  test("rejects closed-Schema and semantic public-submission mutations", () => {
    const unknown = clone(publicSubmission) as typeof publicSubmission & {
      debug?: boolean;
    };
    unknown.debug = true;
    expectContractError(
      () => validatePublicRfqSubmission(unknown),
      "invalid_public_submission",
    );

    const missingArticle = clone(publicSubmission);
    // @ts-expect-error The mutation deliberately removes a required field.
    delete missingArticle.basket.items[0].selection.articleNumber;
    expectContractError(
      () => validatePublicRfqSubmission(missingArticle),
      "invalid_public_submission",
    );

    const duplicateIdentity = clone(publicSubmission);
    duplicateIdentity.basket.items = [
      clone(publicSubmission.basket.items[0]),
      {
        ...clone(publicSubmission.basket.items[0]),
        entryId: "26000000-0000-4000-8000-000000000199",
      },
    ];
    expectContractError(
      () => validatePublicRfqSubmission(duplicateIdentity),
      "invalid_public_submission",
    );

    const invalidTtl = clone(publicSubmission);
    invalidTtl.basket.sourceBasket.expiresAt = "2026-09-10T03:00:00.000Z";
    expectContractError(
      () => validatePublicRfqSubmission(invalidTtl),
      "invalid_public_submission",
    );
  });

  test("rejects Schema-valid authoritative and public-error semantic drift", () => {
    const digestContext = {
      keyVersion: cryptoVectors.algorithm.testKeyVersion,
      value: cryptoVectors.payloadDigestHmacSha256Hex,
    };
    const articleMismatch = clone(authoritativeDocument);
    articleMismatch.lines[0].articleNumber = "GDHEPRD000999";
    expectContractError(
      () => validateAuthoritativeRfqDocument(articleMismatch, digestContext),
      "invalid_authoritative_document",
    );

    const digestMismatch = clone(authoritativeDocument);
    digestMismatch.payloadDigest.value = "f".repeat(64);
    expectContractError(
      () => validateAuthoritativeRfqDocument(digestMismatch, digestContext),
      "invalid_authoritative_document",
    );

    const crossDomain = clone(publicError);
    crossDomain.error.fieldErrors[0].field = "fullName";
    Reflect.deleteProperty(crossDomain.error.fieldErrors[0], "entryId");
    expectContractError(
      () => validatePublicRfqError(crossDomain),
      "invalid_public_error",
    );

    const crossCategoryCode = clone(publicError);
    crossCategoryCode.error.fieldErrors[0].code = "changed";
    expectContractError(
      () => validatePublicRfqError(crossCategoryCode),
      "invalid_public_error",
    );
  });

  test("rejects hostile reflection without invoking attacker code or leaking diagnostics", () => {
    const calls = {
      get: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      ownKeys: 0,
    };
    const hostile = new Proxy(Object.create(null), {
      get() {
        calls.get += 1;
        throw new Error("SECRET_PROXY_GET");
      },
      getOwnPropertyDescriptor() {
        calls.getOwnPropertyDescriptor += 1;
        throw new Error("SECRET_PROXY_DESCRIPTOR");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("SECRET_PROXY_PROTOTYPE");
      },
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("SECRET_PROXY_KEYS");
      },
    });
    const proxyError = expectContractError(
      () => validatePublicRfqSubmission(hostile),
      "invalid_public_submission",
    );
    expect(calls).toEqual({
      get: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      ownKeys: 0,
    });

    const accessor = clone(publicSubmission);
    let getterCalls = 0;
    Object.defineProperty(accessor.customer, "fullName", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "SECRET_ACCESSOR";
      },
    });
    expectContractError(
      () => validatePublicRfqSubmission(accessor),
      "invalid_public_submission",
    );
    expect(getterCalls).toBe(0);

    const symbolBearing = clone(publicSubmission) as typeof publicSubmission & {
      [key: symbol]: string;
    };
    symbolBearing[Symbol("secret")] = "SECRET_SYMBOL";
    expectContractError(
      () => validatePublicRfqSubmission(symbolBearing),
      "invalid_public_submission",
    );

    const nonEnumerable = clone(publicSubmission);
    Object.defineProperty(nonEnumerable, "secret", {
      value: "SECRET_NON_ENUMERABLE",
    });
    expectContractError(
      () => validatePublicRfqSubmission(nonEnumerable),
      "invalid_public_submission",
    );

    const invalidUnicode = clone(publicSubmission);
    invalidUnicode.customer.message = String.fromCharCode(0xd800);
    const unicodeError = expectContractError(
      () => validatePublicRfqSubmission(invalidUnicode),
      "invalid_public_submission",
    );

    const exposed = `${String(proxyError)} ${JSON.stringify(proxyError)} ${String(unicodeError)} ${JSON.stringify(unicodeError)}`;
    expect(exposed).not.toMatch(/SECRET_|schemaPath|instancePath|Ajv|surrogate/i);
  });

  test("does not allow a structural forgery to reveal an authentic body", () => {
    const forged = { kind: "public_submission" };
    expectContractError(
      () => getValidatedRfqBody(
        // @ts-expect-error A plain structural value lacks the private brand.
        forged,
        "public_submission",
      ),
      "invalid_public_submission",
    );
  });
});
