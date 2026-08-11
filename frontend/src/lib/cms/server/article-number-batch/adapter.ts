import "server-only";

import type { MixedQuoteLineValidationDto } from "./types";
import {
  getValidatedMixedQuoteLineResponse,
  type ValidatedMixedQuoteLineResponse,
} from "./validation";

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

export function adaptMixedQuoteLineValidation(
  validated: ValidatedMixedQuoteLineResponse,
): MixedQuoteLineValidationDto {
  return deepFreeze(structuredClone(getValidatedMixedQuoteLineResponse(validated)));
}
