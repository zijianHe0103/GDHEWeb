import "server-only";

import { MixedQuoteLineContractError } from "./errors";
import type {
  MixedQuoteLineValidationRequest,
  MixedQuoteLineValidationDto,
} from "./types";
import {
  validateMixedQuoteLineRequestSchema,
  validateMixedQuoteLineResponseSchema,
} from "./validation-registry";

const authenticRequests = new WeakMap<object, unknown>();
const authenticResponses = new WeakMap<object, unknown>();

export type ValidatedMixedQuoteLineRequest = Readonly<{
  kind: "request";
}>;

export type ValidatedMixedQuoteLineResponse = Readonly<{
  kind: "success";
}>;

function deepFreeze(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    throw new TypeError("Mixed quote-line snapshot contains a non-JSON object.");
  }
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function snapshotPayload(input: unknown, kind: "invalid_request" | "invalid_success_payload"): unknown {
  try {
    return deepFreeze(structuredClone(input));
  } catch {
    throw new MixedQuoteLineContractError(kind);
  }
}

function createWrapper(
  kind: "request" | "success",
  body: unknown,
): ValidatedMixedQuoteLineRequest | ValidatedMixedQuoteLineResponse {
  const wrapper = Object.create(null) as ValidatedMixedQuoteLineRequest | ValidatedMixedQuoteLineResponse;
  Object.defineProperties(wrapper, {
    kind: { enumerable: true, value: kind },
    toJSON: { value: () => ({ kind }) },
  });
  (kind === "request" ? authenticRequests : authenticResponses).set(wrapper, body);
  return Object.freeze(wrapper);
}

function mergeIdentity(line: Record<string, unknown>): string {
  if (line.lineKind === "catalog_accessory") {
    return JSON.stringify({
      lineKind: line.lineKind,
      articleNumber: line.articleNumber,
      quantityUnit: line.quantityUnit,
    });
  }
  return JSON.stringify({
    lineKind: line.lineKind,
    canonicalPath: line.canonicalPath,
    selection: line.selection,
    packaging: line.packaging,
    quantityUnit: line.quantityUnit,
  });
}

function hasUniqueRequestIdentity(input: MixedQuoteLineValidationRequest): boolean {
  const entryIds = new Set<string>();
  const identities = new Set<string>();
  for (const line of input.lines) {
    if (entryIds.has(line.entryId)) return false;
    entryIds.add(line.entryId);
    const identity = mergeIdentity(line as unknown as Record<string, unknown>);
    if (identities.has(identity)) return false;
    identities.add(identity);
  }
  return true;
}

export function validateMixedQuoteLineRequest(
  input: unknown,
): ValidatedMixedQuoteLineRequest {
  const snapshot = snapshotPayload(input, "invalid_request");
  if (!validateMixedQuoteLineRequestSchema(snapshot)) {
    throw new MixedQuoteLineContractError("invalid_request");
  }
  if (!hasUniqueRequestIdentity(snapshot as MixedQuoteLineValidationRequest)) {
    throw new MixedQuoteLineContractError("invalid_request");
  }
  return createWrapper("request", snapshot) as ValidatedMixedQuoteLineRequest;
}

export function validateMixedQuoteLineResponse(
  input: unknown,
): ValidatedMixedQuoteLineResponse {
  const snapshot = snapshotPayload(input, "invalid_success_payload");
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    (snapshot as Record<string, unknown>).apiVersion !== "1" ||
    (snapshot as Record<string, unknown>).schemaVersion !== "1.0.0"
  ) {
    throw new MixedQuoteLineContractError("unsupported_schema");
  }
  if (!validateMixedQuoteLineResponseSchema(snapshot)) {
    throw new MixedQuoteLineContractError("invalid_success_payload");
  }
  return createWrapper("success", snapshot) as ValidatedMixedQuoteLineResponse;
}

export function getValidatedMixedQuoteLineRequest(
  input: ValidatedMixedQuoteLineRequest,
): MixedQuoteLineValidationRequest {
  const body = authenticRequests.get(input);
  if (!body) throw new MixedQuoteLineContractError("invalid_request");
  return body as MixedQuoteLineValidationRequest;
}

export function getValidatedMixedQuoteLineResponse(
  input: ValidatedMixedQuoteLineResponse,
): MixedQuoteLineValidationDto {
  const body = authenticResponses.get(input);
  if (!body) throw new MixedQuoteLineContractError("invalid_success_payload");
  return body as MixedQuoteLineValidationDto;
}
