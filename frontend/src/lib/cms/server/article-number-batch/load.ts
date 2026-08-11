import "server-only";

import { types as nodeTypes } from "node:util";

import { adaptMixedQuoteLineValidation } from "./adapter";
import {
  MixedQuoteLineContractError,
  MixedQuoteLineHttpError,
  MixedQuoteLineProtocolError,
} from "./errors";
import { buildMixedQuoteLineValidationRequest } from "./query";
import { requestMixedQuoteLineValidation } from "./transport";
import type {
  MixedQuoteLineRequestLine,
  MixedQuoteLineValidationDto,
  MixedQuoteLineValidationRequest,
} from "./types";
import { validateMixedQuoteLineResponse } from "./validation";

const ERROR_MATRIX = Object.freeze({
  400: Object.freeze({
    code: "gdhe_invalid_quote_line_request",
    messages: Object.freeze([
      "Quote-line request is invalid.",
      "Quote-line request contains duplicate identity.",
    ]),
  }),
  409: Object.freeze({ code: "gdhe_quote_lines_changed", messages: Object.freeze(["One or more quote lines changed."]) }),
  413: Object.freeze({ code: "gdhe_quote_line_request_too_large", messages: Object.freeze(["Request body is too large."]) }),
  415: Object.freeze({ code: "gdhe_unsupported_media_type", messages: Object.freeze(["Content-Type must be application/json."]) }),
  500: Object.freeze({ code: "gdhe_quote_line_validation_unavailable", messages: Object.freeze(["Quote-line validation is unavailable."]) }),
} as const);

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function exactJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function responseMatchesRequest(
  request: MixedQuoteLineValidationRequest,
  response: MixedQuoteLineValidationDto,
): boolean {
  if (request.lines.length !== response.lines.length) return false;
  for (let index = 0; index < request.lines.length; index += 1) {
    const submitted = request.lines[index];
    const resolved = response.lines[index];
    if (
      resolved.entryId !== submitted.entryId ||
      resolved.lineKind !== submitted.lineKind ||
      resolved.quantityUnit !== submitted.quantityUnit ||
      resolved.quantity !== submitted.quantity
    ) return false;
    if (submitted.lineKind === "catalog_accessory") {
      if (
        resolved.resolution !== "resolved_article_number" ||
        resolved.publicPath !== null ||
        resolved.articleNumber !== submitted.articleNumber
      ) return false;
      continue;
    }
    if (
      resolved.publicPath !== submitted.canonicalPath ||
      !exactJson(resolved.packaging, submitted.packaging)
    ) return false;
    const selection = resolved.selection as Record<string, unknown>;
    if (
      selection.lengthMeters !== submitted.selection.lengthMeters ||
      !exactJson(selection.color, submitted.selection.color)
    ) return false;
    if (submitted.selection.resolution === "sales_follow_up") {
      if (
        resolved.resolution !== "sales_follow_up" ||
        resolved.articleNumber !== null ||
        selection.type !== "custom_length" ||
        selection.articleNumber !== null
      ) return false;
    } else if (
      resolved.resolution !== "resolved_article_number" ||
      typeof resolved.articleNumber !== "string" ||
      selection.type !== "article_number" ||
      selection.articleNumber !== resolved.articleNumber ||
      (
        submitted.selection.resolution === "standard_ready" &&
        resolved.articleNumber !== submitted.selection.articleNumber
      )
    ) return false;
  }
  return true;
}

function validatedErrorStatus(input: unknown): number | null {
  if (nodeTypes.isProxy(input)) return null;
  try {
    if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
    const descriptorEntries = Reflect.ownKeys(input).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(input, key),
    ] as const);
    if (descriptorEntries.some(([key, descriptor]) =>
      typeof key !== "string" || !descriptor || !("value" in descriptor) || !descriptor.enumerable)) return null;
    const values = Object.fromEntries(descriptorEntries.map(([key, descriptor]) => [key, descriptor?.value]));
    if (!exactJson(Object.keys(values).sort(), ["apiVersion", "code", "message", "requestId", "status"])) return null;
    if (!Number.isSafeInteger(values.status)) return null;
    const status = values.status as keyof typeof ERROR_MATRIX;
    const expected = ERROR_MATRIX[status];
    return (
      expected &&
      values.apiVersion === "1" &&
      values.code === expected.code &&
      typeof values.message === "string" &&
      expected.messages.includes(values.message) &&
      typeof values.requestId === "string" &&
      UUID_V4.test(values.requestId)
    ) ? status : null;
  } catch {
    return null;
  }
}

export async function validateMixedQuoteLines(
  lines: readonly MixedQuoteLineRequestLine[],
  callerSignal?: AbortSignal,
): Promise<MixedQuoteLineValidationDto> {
  const request = buildMixedQuoteLineValidationRequest(lines);
  try {
    const outcome = await requestMixedQuoteLineValidation(request, callerSignal);
    const dto = adaptMixedQuoteLineValidation(
      validateMixedQuoteLineResponse(outcome.body),
    );
    if (!responseMatchesRequest(request, dto)) {
      throw new MixedQuoteLineContractError("response_mismatch");
    }
    return dto;
  } catch (error) {
    if (!(error instanceof MixedQuoteLineHttpError)) throw error;
    const bodyStatus = validatedErrorStatus(error.body);
    if (bodyStatus === null) {
      throw new MixedQuoteLineContractError("invalid_error_payload");
    }
    if (bodyStatus !== error.status || error.metadata.status !== error.status) {
      throw new MixedQuoteLineProtocolError("error_status_mismatch");
    }
    throw new MixedQuoteLineHttpError(
      error.kind,
      error.status,
      error.metadata,
      undefined,
    );
  }
}
