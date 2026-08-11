import "server-only";

import { MixedQuoteLineConfigurationError } from "./errors";
import type {
  MixedQuoteLineRequestLine,
  MixedQuoteLineValidationRequest,
} from "./types";
import {
  getValidatedMixedQuoteLineRequest,
  validateMixedQuoteLineRequest,
} from "./validation";

const RAW_BYTE_LIMIT = 163840;

export { MixedQuoteLineConfigurationError } from "./errors";

export function buildMixedQuoteLineValidationRequest(
  lines: unknown,
): MixedQuoteLineValidationRequest {
  try {
    const validated = validateMixedQuoteLineRequest({
      apiVersion: "1",
      schemaVersion: "1.0.0",
      locale: "en",
      lines,
    });
    const request = getValidatedMixedQuoteLineRequest(validated);
    if (new TextEncoder().encode(JSON.stringify(request)).byteLength > RAW_BYTE_LIMIT) {
      throw new MixedQuoteLineConfigurationError("request_too_large");
    }
    return request;
  } catch (error) {
    if (error instanceof MixedQuoteLineConfigurationError) throw error;
    throw new MixedQuoteLineConfigurationError("invalid_request");
  }
}

export type { MixedQuoteLineRequestLine };
