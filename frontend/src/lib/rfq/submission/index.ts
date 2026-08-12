import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import type { QuoteBasketDocumentV3 } from "../../../types/quote-basket-v3";
import { cloneAndValidateQuoteBasketV3 } from "../../quote-basket/v3";
import {
  normalizeRfqCustomer,
  type NormalizeRfqCustomerResult,
  type RfqPublicCustomer,
} from "../customer";
import commonSchema from "../../rfq-submission-contract/v2/schemas/common.v2.schema.json";
import submissionSchema from "../../rfq-submission-contract/v2/schemas/public-rfq-submission-draft.v2.schema.json";

const PUBLIC_BASKET_LIMIT = 163_840;

export type PublicRfqSourceBasket = Readonly<{
  schemaVersion: "3.0.0";
  revision: number;
  writerId: string;
  mutationId: string;
  updatedAt: string;
  expiresAt: string;
}>;

export type PublicRfqConfiguredLine = Readonly<{
  entryId: string;
  lineKind: "configured_product";
  canonicalPath: string;
  selection: Readonly<{
    type: "article_number" | "custom_length";
    articleNumber: string | null;
    lengthMeters: number;
    color: Readonly<{ code: string; label: string }>;
    resolution: "standard_ready" | "sales_follow_up";
  }>;
  packaging: Readonly<{
    basePackaging: "standard" | "carton" | "large_shrink_wrap";
    logoPrinting: boolean;
    protectionArrangement: "single_bag" | "paired" | null;
  }>;
  quantityUnit: "piece";
  quantity: number;
}>;

export type PublicRfqAccessoryLine = Readonly<{
  entryId: string;
  lineKind: "catalog_accessory";
  articleNumber: string;
  quantityUnit: "piece";
  quantity: number;
}>;

export type PublicRfqBasket = Readonly<{
  contractVersion: "2.0.0";
  sourceBasket: PublicRfqSourceBasket;
  items: readonly (PublicRfqConfiguredLine | PublicRfqAccessoryLine)[];
}>;

export type LocalRfqIntentResponse = Readonly<{
  contractVersion: "2.0.0";
  submissionIntent: string;
  idempotencyKey: string;
  privacyNotice: Readonly<{
    version: "rfq-privacy-en-2026-08";
    presentedAt: string;
  }>;
  expiresAt: string;
}>;

export type PublicRfqSubmissionDraft = Readonly<{
  contractVersion: "2.0.0";
  submissionIntent: string;
  idempotencyKey: string;
  basket: PublicRfqBasket;
  customer: RfqPublicCustomer;
  privacyNotice: LocalRfqIntentResponse["privacyNotice"];
  antiAbuse: Readonly<{ honeypot: "" }>;
}>;

export class RfqSubmissionError extends Error {
  readonly category = "submission" as const;

  constructor(readonly kind:
    | "invalid_basket"
    | "invalid_customer"
    | "invalid_intent"
    | "invalid_submission"
    | "submission_too_large") {
    super("The RFQ submission could not be prepared.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqSubmissionError",
    });
  }
}

const ajv = new Ajv2020({
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  useDefaults: false,
  validateFormats: true,
});
addFormats(ajv, ["date-time", "email", "uri"]);
ajv.addSchema(commonSchema);
ajv.addSchema(submissionSchema);

function requirePublicBasketValidator(): ValidateFunction<unknown> {
  const validator = ajv.getSchema(
    "common.v2.schema.json#/$defs/publicBasketSubmission",
  );
  if (!validator) throw new Error("RFQ public Basket Schema failed to compile.");
  return validator;
}

const validatePublicBasket = requirePublicBasketValidator();
function requirePublicSubmissionValidator(): ValidateFunction<unknown> {
  const validator = ajv.getSchema("public-rfq-submission-draft.v2.schema.json");
  if (!validator) throw new Error("RFQ public submission Schema failed to compile.");
  return validator;
}

const validatePublicSubmission = requirePublicSubmissionValidator();
const authenticBaskets = new WeakSet<object>();
const authenticIntents = new WeakSet<object>();

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function publicSourceBasket(basket: QuoteBasketDocumentV3): PublicRfqSourceBasket {
  return {
    schemaVersion: "3.0.0",
    revision: basket.revision,
    writerId: basket.writerId,
    mutationId: basket.mutationId,
    updatedAt: basket.updatedAt,
    expiresAt: basket.expiresAt,
  };
}

function projectLine(
  item: QuoteBasketDocumentV3["items"][number],
): PublicRfqConfiguredLine | PublicRfqAccessoryLine {
  if (item.state !== "ready") throw new RfqSubmissionError("invalid_basket");
  if (item.lineKind === "catalog_accessory") {
    return {
      entryId: item.entryId,
      lineKind: "catalog_accessory",
      articleNumber: item.articleNumber,
      quantityUnit: "piece",
      quantity: item.quantity,
    };
  }
  const standard = item.selection.type === "standard";
  return {
    entryId: item.entryId,
    lineKind: "configured_product",
    canonicalPath: item.product.publicPath,
    selection: {
      type: standard ? "article_number" : "custom_length",
      articleNumber: standard ? item.articleNumber : null,
      lengthMeters: item.selection.lengthMeters,
      color: {
        code: item.selection.color.code,
        label: item.selection.color.label,
      },
      resolution: standard ? "standard_ready" : "sales_follow_up",
    },
    packaging: {
      basePackaging: item.packaging.basePackaging.key,
      logoPrinting: item.packaging.logoPrinting,
      protectionArrangement: item.packaging.protectionArrangement?.key ?? null,
    },
    quantityUnit: "piece",
    quantity: item.quantity,
  };
}

export function projectQuoteBasketV3ToPublicRfqBasket(
  input: unknown,
): PublicRfqBasket {
  try {
    const basket = cloneAndValidateQuoteBasketV3(input);
    if (basket.items.length < 1 || basket.items.length > 50) {
      throw new RfqSubmissionError("invalid_basket");
    }
    const projected = deepFreeze({
      contractVersion: "2.0.0" as const,
      sourceBasket: publicSourceBasket(basket),
      items: basket.items.map(projectLine),
    });
    if (
      !validatePublicBasket(projected) ||
      new TextEncoder().encode(JSON.stringify(projected)).byteLength > PUBLIC_BASKET_LIMIT
    ) {
      throw new RfqSubmissionError("invalid_basket");
    }
    authenticBaskets.add(projected);
    return projected;
  } catch {
    throw new RfqSubmissionError("invalid_basket");
  }
}

function recordSnapshot(
  input: unknown,
  keys: readonly string[],
): Readonly<Record<string, unknown>> {
  try {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new TypeError("invalid record");
    }
    const ownKeys = Reflect.ownKeys(input);
    if (
      ownKeys.some((key) => typeof key !== "string") ||
      ownKeys.length !== keys.length ||
      keys.some((key) => !ownKeys.includes(key))
    ) throw new TypeError("invalid keys");
    const prototype = Reflect.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("invalid prototype");
    }
    const snapshot = Object.create(null) as Record<string, unknown>;
    for (const key of keys) {
      const descriptor = Reflect.getOwnPropertyDescriptor(input, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw new TypeError("invalid property");
      }
      snapshot[key] = descriptor.value;
    }
    return snapshot;
  } catch {
    throw new RfqSubmissionError("invalid_intent");
  }
}

function canonicalTimestamp(value: unknown): string {
  try {
    if (typeof value !== "string" || new Date(value).toISOString() !== value) {
      throw new TypeError("invalid timestamp");
    }
    return value;
  } catch {
    throw new RfqSubmissionError("invalid_intent");
  }
}

export function validateLocalRfqIntentResponse(
  input: unknown,
): LocalRfqIntentResponse {
  try {
    const source = recordSnapshot(input, [
      "contractVersion",
      "submissionIntent",
      "idempotencyKey",
      "privacyNotice",
      "expiresAt",
    ]);
    const privacy = recordSnapshot(source.privacyNotice, ["version", "presentedAt"]);
    const presentedAt = canonicalTimestamp(privacy.presentedAt);
    const expiresAt = canonicalTimestamp(source.expiresAt);
    if (
      source.contractVersion !== "2.0.0" ||
      typeof source.submissionIntent !== "string" ||
      !/^[A-Za-z0-9._~-]{32,8192}$/.test(source.submissionIntent) ||
      typeof source.idempotencyKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        source.idempotencyKey,
      ) ||
      privacy.version !== "rfq-privacy-en-2026-08" ||
      Date.parse(expiresAt) - Date.parse(presentedAt) !== 1_800_000 ||
      Date.now() < Date.parse(presentedAt) ||
      Date.now() >= Date.parse(expiresAt)
    ) {
      throw new RfqSubmissionError("invalid_intent");
    }
    const result = deepFreeze({
      contractVersion: "2.0.0" as const,
      submissionIntent: source.submissionIntent,
      idempotencyKey: source.idempotencyKey,
      privacyNotice: {
        version: "rfq-privacy-en-2026-08" as const,
        presentedAt,
      },
      expiresAt,
    });
    authenticIntents.add(result);
    return result;
  } catch {
    throw new RfqSubmissionError("invalid_intent");
  }
}

function authenticCustomer(
  result: NormalizeRfqCustomerResult,
): RfqPublicCustomer {
  if (
    typeof result !== "object" ||
    result === null ||
    !Object.isFrozen(result) ||
    !result.ok ||
    !Object.isFrozen(result.customer)
  ) throw new RfqSubmissionError("invalid_customer");
  const normalized = normalizeRfqCustomer(result.customer);
  if (!normalized.ok || JSON.stringify(normalized.customer) !== JSON.stringify(result.customer)) {
    throw new RfqSubmissionError("invalid_customer");
  }
  return normalized.customer;
}

export function buildPublicRfqSubmission(input: Readonly<{
  customer: NormalizeRfqCustomerResult;
  basket: PublicRfqBasket;
  intent: LocalRfqIntentResponse;
}>): PublicRfqSubmissionDraft {
  let customer: RfqPublicCustomer;
  try {
    customer = authenticCustomer(input.customer);
  } catch {
    throw new RfqSubmissionError("invalid_customer");
  }
  if (
    typeof input.basket !== "object" ||
    input.basket === null ||
    !authenticBaskets.has(input.basket)
  ) throw new RfqSubmissionError("invalid_basket");
  if (
    typeof input.intent !== "object" ||
    input.intent === null ||
    !authenticIntents.has(input.intent)
  ) throw new RfqSubmissionError("invalid_intent");
  const draft = deepFreeze({
    contractVersion: "2.0.0" as const,
    submissionIntent: input.intent.submissionIntent,
    idempotencyKey: input.intent.idempotencyKey,
    basket: input.basket,
    customer,
    privacyNotice: input.intent.privacyNotice,
    antiAbuse: { honeypot: "" as const },
  });
  if (!validatePublicSubmission(draft)) {
    throw new RfqSubmissionError("invalid_submission");
  }
  if (new TextEncoder().encode(JSON.stringify(draft)).byteLength > 262_144) {
    throw new RfqSubmissionError("submission_too_large");
  }
  return draft;
}
