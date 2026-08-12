import type { RfqCustomerFieldError } from "../customer";
import { normalizeRfqCustomer } from "../customer";
import {
  buildPublicRfqSubmission,
  projectQuoteBasketV3ToPublicRfqBasket,
  validateLocalRfqIntentResponse,
  type PublicRfqSourceBasket,
  type PublicRfqSubmissionDraft,
} from ".";
import {
  parsePublicRfqResponse,
  type PublicRfqResponseDto,
} from "./public-response";

export type RfqSubmissionClientResult =
  | Readonly<{ kind: "pending"; basketRetained: true }>
  | Readonly<{
      kind: "invalid_fields";
      errors: readonly RfqCustomerFieldError[];
      basketRetained: true;
    }>
  | Readonly<{ kind: "accepted_cleared"; publicReference: string; basketRetained: false }>
  | Readonly<{ kind: "accepted_basket_changed"; publicReference: string; basketRetained: true }>
  | Readonly<{ kind: "processing"; publicReference: string; basketRetained: true }>
  | Readonly<{ kind: "basket_refresh_required"; basketRetained: true }>
  | Readonly<{ kind: "conflict"; basketRetained: true }>
  | Readonly<{ kind: "rate_or_security"; basketRetained: true }>
  | Readonly<{ kind: "temporary_unavailable"; basketRetained: true }>;

export type RfqSubmissionOperation = Readonly<{
  submit(input: Readonly<{ basket: unknown; customer: unknown }>): Promise<RfqSubmissionClientResult>;
}>;

type ClearAcceptedReceipt = (
  receipt: PublicRfqResponseDto,
  submittedSnapshot: PublicRfqSourceBasket,
) => Promise<boolean>;

type LiveAttempt = Readonly<{
  customerKey: string;
  snapshotKey: string;
  expiresAtMs: number;
  sourceSnapshot: PublicRfqSourceBasket;
  draft: PublicRfqSubmissionDraft;
  bodyText: string;
}>;

const pendingResult = Object.freeze({ kind: "pending" as const, basketRetained: true as const });
const temporaryResult = Object.freeze({
  kind: "temporary_unavailable" as const,
  basketRetained: true as const,
});

type ReadResponse = Readonly<{
  status: number;
  contentType: string;
  bodyText: string;
}>;

async function readResponse(response: Response): Promise<ReadResponse> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!/^application\/json(?:;\s*charset=utf-8)?$/i.test(contentType)) {
    throw new TypeError("invalid response media");
  }
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > 262_144) {
    throw new TypeError("response too large");
  }
  return Object.freeze({
    status: response.status,
    contentType,
    bodyText: text,
  });
}

function customerFieldErrors(
  response: Extract<PublicRfqResponseDto, { kind: "error" }>,
): readonly RfqCustomerFieldError[] | undefined {
  if (response.code !== "invalid_customer_fields" || !response.fieldErrors) {
    return undefined;
  }
  const customerFields = new Set([
    "fullName",
    "companyName",
    "whatsApp",
    "weChat",
    "businessEmail",
    "phone",
    "countryRegion",
    "city",
    "companyWebsite",
    "message",
    "contactMethods",
  ]);
  const customerCodes = new Set([
    "required",
    "invalid",
    "too_long",
    "at_least_one_required",
  ]);
  const result = response.fieldErrors.filter(
    (error) => customerFields.has(error.field) && customerCodes.has(error.code),
  ) as readonly RfqCustomerFieldError[];
  return result.length > 0 ? Object.freeze(result) : undefined;
}

async function clientResult(
  response: PublicRfqResponseDto,
  sourceSnapshot: PublicRfqSourceBasket | null,
  clearAcceptedReceipt: ClearAcceptedReceipt | undefined,
): Promise<RfqSubmissionClientResult> {
  if (response.kind === "receipt" && response.status === "accepted") {
    let cleared = false;
    if (sourceSnapshot && clearAcceptedReceipt) {
      try {
        cleared = await clearAcceptedReceipt(response, sourceSnapshot);
      } catch {
        cleared = false;
      }
    }
    return cleared
      ? Object.freeze({
          kind: "accepted_cleared" as const,
          publicReference: response.publicReference,
          basketRetained: false as const,
        })
      : Object.freeze({
          kind: "accepted_basket_changed" as const,
          publicReference: response.publicReference,
          basketRetained: true as const,
        });
  }
  if (response.kind === "receipt") {
    return Object.freeze({
      kind: "processing" as const,
      publicReference: response.publicReference,
      basketRetained: true as const,
    });
  }
  const fieldErrors = customerFieldErrors(response);
  if (fieldErrors) {
    return Object.freeze({
      kind: "invalid_fields" as const,
      errors: fieldErrors,
      basketRetained: true as const,
    });
  }
  if ([
    "invalid_line_count",
    "invalid_quantity",
    "basket_refresh_required",
    "product_unavailable",
    "configuration_changed",
  ].includes(response.code)) {
    return Object.freeze({
      kind: "basket_refresh_required" as const,
      basketRetained: true as const,
    });
  }
  if (response.code === "idempotency_conflict") {
    return Object.freeze({ kind: "conflict" as const, basketRetained: true as const });
  }
  if ([
    "invalid_submission_intent",
    "request_not_allowed",
    "challenge_required_or_invalid",
    "rate_limited",
  ].includes(response.code)) {
    return Object.freeze({
      kind: "rate_or_security" as const,
      basketRetained: true as const,
    });
  }
  return temporaryResult;
}

function invalidatesLiveAttempt(response: PublicRfqResponseDto): boolean {
  if (response.kind === "receipt") return response.status === "accepted";
  return [
    "invalid_submission_intent",
    "request_not_allowed",
    "challenge_required_or_invalid",
    "idempotency_conflict",
  ].includes(response.code);
}

export function createRfqSubmissionOperation(
  dependencies: Readonly<{ clearAcceptedReceipt?: ClearAcceptedReceipt }> = {},
): RfqSubmissionOperation {
  let pending = false;
  let liveAttempt: LiveAttempt | null = null;
  return Object.freeze({
    async submit(input) {
      if (pending) return pendingResult;
      pending = true;
      try {
        const customer = normalizeRfqCustomer(input.customer);
        if (!customer.ok) {
          liveAttempt = null;
          return Object.freeze({
            kind: "invalid_fields" as const,
            errors: customer.errors,
            basketRetained: true as const,
          });
        }
        let basket;
        try {
          basket = projectQuoteBasketV3ToPublicRfqBasket(input.basket);
        } catch {
          liveAttempt = null;
          return Object.freeze({
            kind: "basket_refresh_required" as const,
            basketRetained: true as const,
          });
        }
        const customerKey = JSON.stringify(customer.customer);
        const snapshotKey = JSON.stringify(basket.sourceBasket);
        if (
          liveAttempt &&
          (
            liveAttempt.customerKey !== customerKey ||
            liveAttempt.snapshotKey !== snapshotKey ||
            Date.now() >= liveAttempt.expiresAtMs
          )
        ) liveAttempt = null;
        if (!liveAttempt) {
          const intentResponse = await fetch("/api/rfq/intent", {
            method: "POST",
            cache: "no-store",
            redirect: "error",
            headers: { "content-type": "application/json" },
            body: snapshotKey,
          });
          const intentHttp = await readResponse(intentResponse);
          if (intentHttp.status !== 200) {
            const response = parsePublicRfqResponse(
              intentHttp.status,
              intentHttp.contentType,
              intentHttp.bodyText,
            );
            return clientResult(response, null, dependencies.clearAcceptedReceipt);
          }
          const intent = validateLocalRfqIntentResponse(JSON.parse(intentHttp.bodyText) as unknown);
          const draft = buildPublicRfqSubmission({ customer, basket, intent });
          liveAttempt = Object.freeze({
            customerKey,
            snapshotKey,
            expiresAtMs: Date.parse(intent.expiresAt),
            sourceSnapshot: basket.sourceBasket,
            draft,
            bodyText: JSON.stringify(draft),
          });
        }
        const intakeResponse = await fetch("/api/rfq/intake", {
          method: "POST",
          cache: "no-store",
          redirect: "error",
          headers: { "content-type": "application/json" },
          body: liveAttempt.bodyText,
        });
        const intakeHttp = await readResponse(intakeResponse);
        const response = parsePublicRfqResponse(
          intakeHttp.status,
          intakeHttp.contentType,
          intakeHttp.bodyText,
        );
        const sourceSnapshot = liveAttempt.sourceSnapshot;
        if (invalidatesLiveAttempt(response)) liveAttempt = null;
        return clientResult(
          response,
          sourceSnapshot,
          dependencies.clearAcceptedReceipt,
        );
      } catch {
        return temporaryResult;
      } finally {
        pending = false;
      }
    },
  });
}
