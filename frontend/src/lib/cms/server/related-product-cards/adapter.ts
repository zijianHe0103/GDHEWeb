import "server-only";

import type { RelatedProductCardCollectionDto } from "../../../../types/related-product-card";
import {
  validateRelatedProductCardCollection,
  type ValidatedRelatedProductCardCollection,
} from "./validation";

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

export function adaptRelatedProductCardCollection(
  validated: ValidatedRelatedProductCardCollection,
): RelatedProductCardCollectionDto {
  const body = validateRelatedProductCardCollection.getValidatedBody(
    validated,
  ) as RelatedProductCardCollectionDto;
  return deepFreeze(structuredClone(body));
}
