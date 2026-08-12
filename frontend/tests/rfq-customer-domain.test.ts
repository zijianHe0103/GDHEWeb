import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, test } from "vitest";

import commonSchema from "../src/lib/rfq-submission-contract/v2/schemas/common.v2.schema.json";
import {
  normalizeRfqCustomer,
  type RfqCustomerFieldError,
} from "../src/lib/rfq/customer";

const ajv = new Ajv2020({
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
  validateFormats: true,
});
addFormats(ajv, ["email", "uri"]);
ajv.addSchema(commonSchema);
const validatePublicCustomer = ajv.getSchema(
  "common.v2.schema.json#/$defs/publicCustomer",
);
if (!validatePublicCustomer) {
  throw new Error("Frozen publicCustomer Schema did not compile.");
}

function validInput(): Record<string, unknown> {
  return {
    fullName: "Ada Buyer",
    companyName: "Example Contracting Ltd",
    whatsApp: "+1 202 555 0100",
    countryRegion: "United States",
    city: "Seattle",
  };
}

function expectErrors(
  input: unknown,
  expected: readonly RfqCustomerFieldError[],
): void {
  const result = normalizeRfqCustomer(input);
  expect(result).toEqual({ ok: false, errors: expected });
  if (result.ok) expect.unreachable("Expected customer field errors.");
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.errors)).toBe(true);
  for (const error of result.errors) expect(Object.isFrozen(error)).toBe(true);
  expect(JSON.stringify(result)).not.toMatch(
    /instancePath|schemaPath|Ajv|submittedValue|raw|diagnostic/i,
  );
}

describe("TASK-028 RFQ customer public domain", () => {
  test("normalizes a closed customer DTO against the frozen publicCustomer Schema", () => {
    const result = normalizeRfqCustomer({
      fullName: "\u2003Ada Buyer\u2003",
      companyName: "\u00a0Example Contracting Ltd\u00a0",
      whatsApp: "  +1 202 555 0100  ",
      weChat: "  ",
      businessEmail: "",
      phone: "  ",
      countryRegion: "  United States  ",
      city: "  Seattle  ",
      companyWebsite: "  https://example.com/rfq  ",
      message: "  Please quote for one project.  ",
    });

    expect(result).toEqual({
      ok: true,
      customer: {
        fullName: "Ada Buyer",
        companyName: "Example Contracting Ltd",
        whatsApp: "+1 202 555 0100",
        countryRegion: "United States",
        city: "Seattle",
        companyWebsite: "https://example.com/rfq",
        message: "Please quote for one project.",
      },
    });
    if (!result.ok) expect.unreachable("Expected a normalized customer.");
    expect(validatePublicCustomer(result.customer)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.customer)).toBe(true);
  });

  test("returns the exact required, contact, email and website field errors", () => {
    for (const field of [
      "fullName",
      "companyName",
      "countryRegion",
      "city",
    ] as const) {
      const missing = validInput();
      Reflect.deleteProperty(missing, field);
      expectErrors(missing, [{ field, code: "required" }]);

      const blank = validInput();
      blank[field] = "  ";
      expectErrors(blank, [{ field, code: "required" }]);
    }

    const withoutContact = validInput();
    Reflect.deleteProperty(withoutContact, "whatsApp");
    expectErrors(withoutContact, [
      { field: "contactMethods", code: "at_least_one_required" },
    ]);

    for (const [field, value] of [
      ["whatsApp", "+1 202 555 0100"],
      ["weChat", "ada-buyer"],
      ["businessEmail", "ada@example.com"],
      ["phone", "+1 202 555 0101"],
    ] as const) {
      const result = normalizeRfqCustomer({ ...withoutContact, [field]: value });
      expect(result.ok).toBe(true);
      if (!result.ok) expect.unreachable(`Expected ${field} to satisfy contact.`);
      expect(validatePublicCustomer(result.customer)).toBe(true);
    }

    expectErrors(
      { ...withoutContact, businessEmail: "not-an-email" },
      [{ field: "businessEmail", code: "invalid" }],
    );
    expectErrors(
      { ...validInput(), companyWebsite: "ftp://example.com/rfq" },
      [{ field: "companyWebsite", code: "invalid" }],
    );
    expectErrors(
      { ...validInput(), companyWebsite: "https://user:secret@example.com/rfq" },
      [{ field: "companyWebsite", code: "invalid" }],
    );
  });

  test("returns all four required fields and the contact group for one empty form", () => {
    expectErrors(
      {
        fullName: "",
        companyName: "",
        countryRegion: "",
        city: "",
        whatsApp: "",
        weChat: "",
        businessEmail: "",
        phone: "",
        companyWebsite: "",
        message: "",
      },
      [
        { field: "fullName", code: "required" },
        { field: "companyName", code: "required" },
        { field: "countryRegion", code: "required" },
        { field: "city", code: "required" },
        { field: "contactMethods", code: "at_least_one_required" },
      ],
    );
  });

  test("uses Unicode code-point bounds, rejects lone surrogates and never truncates", () => {
    const maxEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
    const websitePrefix = "https://example.com/";
    const exact = {
      fullName: "😀".repeat(120),
      companyName: "c".repeat(160),
      whatsApp: "w".repeat(128),
      weChat: "x".repeat(128),
      businessEmail: maxEmail,
      phone: "1".repeat(64),
      countryRegion: "r".repeat(100),
      city: "y".repeat(100),
      companyWebsite: websitePrefix + "p".repeat(2048 - websitePrefix.length),
      message: "m".repeat(2000),
    };
    const exactResult = normalizeRfqCustomer(exact);
    expect(exactResult.ok).toBe(true);
    if (!exactResult.ok) expect.unreachable("Expected exact maxima to pass.");
    expect(validatePublicCustomer(exactResult.customer)).toBe(true);
    expect(exactResult.customer.fullName).toBe("😀".repeat(120));

    const overlongCases = [
      ["fullName", "😀".repeat(121)],
      ["companyName", "c".repeat(161)],
      ["whatsApp", "w".repeat(129)],
      ["weChat", "x".repeat(129)],
      ["businessEmail", `${maxEmail}e`],
      ["phone", "1".repeat(65)],
      ["countryRegion", "r".repeat(101)],
      ["city", "y".repeat(101)],
      ["companyWebsite", `${exact.companyWebsite}p`],
      ["message", "m".repeat(2001)],
    ] as const;
    for (const [field, value] of overlongCases) {
      expectErrors(
        { ...validInput(), [field]: value },
        [{ field, code: "too_long" }],
      );
    }

    expectErrors(
      { ...validInput(), message: String.fromCharCode(0xd800) },
      [{ field: "message", code: "invalid" }],
    );
  });

  test("fails closed on hostile and non-data inputs without getter or coercion reads", () => {
    const structuralError = [
      { field: "contactMethods", code: "invalid" },
    ] as const;

    let accessorCalls = 0;
    const accessor = validInput();
    Object.defineProperty(accessor, "fullName", {
      enumerable: true,
      get() {
        accessorCalls += 1;
        throw new Error("PRIVATE_CUSTOMER_ACCESSOR");
      },
    });
    expectErrors(accessor, structuralError);
    expect(accessorCalls).toBe(0);

    let coercionCalls = 0;
    const coercionValue = Object.freeze({
      [Symbol.toPrimitive]() {
        coercionCalls += 1;
        throw new Error("PRIVATE_CUSTOMER_COERCION");
      },
    });
    expectErrors(
      { ...validInput(), fullName: coercionValue },
      [{ field: "fullName", code: "invalid" }],
    );
    expect(coercionCalls).toBe(0);

    const symbolBearing = validInput();
    Object.defineProperty(symbolBearing, Symbol("PRIVATE_CUSTOMER_SYMBOL"), {
      enumerable: true,
      value: "private",
    });
    expectErrors(symbolBearing, structuralError);

    const nonEnumerable = validInput();
    Object.defineProperty(nonEnumerable, "privateCustomerField", {
      enumerable: false,
      value: "PRIVATE_CUSTOMER_HIDDEN",
    });
    expectErrors(nonEnumerable, structuralError);

    expectErrors(
      { ...validInput(), preliminaryCustomerGrade: "A" },
      structuralError,
    );

    const inherited = Object.assign(Object.create({ internal: "private" }), validInput());
    expectErrors(inherited, structuralError);

    const transparentCalls = { get: 0, toPrimitive: 0 };
    const transparent = new Proxy(validInput(), {
      get(target, key, receiver) {
        transparentCalls.get += 1;
        if (key === Symbol.toPrimitive) transparentCalls.toPrimitive += 1;
        return Reflect.get(target, key, receiver);
      },
    });
    expectErrors(transparent, structuralError);
    expect(transparentCalls).toEqual({ get: 0, toPrimitive: 0 });

    const throwing = new Proxy(Object.create(null), {
      get() {
        throw new Error("PRIVATE_CUSTOMER_PROXY_GET");
      },
      ownKeys() {
        throw new Error("PRIVATE_CUSTOMER_PROXY_KEYS");
      },
    });
    expectErrors(throwing, structuralError);

    const revoked = Proxy.revocable(validInput(), {});
    revoked.revoke();
    expectErrors(revoked.proxy, structuralError);

    expectErrors([validInput()], structuralError);
    expectErrors("customer", structuralError);
  });
});
