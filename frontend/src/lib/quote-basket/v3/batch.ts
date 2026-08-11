import "server-only";

import type {
  MixedQuoteLineRequestLine,
  MixedQuoteLineValidationDto,
} from "../../cms/server/article-number-batch";
import { validateMixedQuoteLines } from "../../cms/server/article-number-batch";
import type {
  QuoteBasketDocumentV3,
  QuoteBasketItemV3,
} from "../../../types/quote-basket-v3";
import type { QuoteBasketRevisionIds } from "../../../types/quote-basket";
import { QUOTE_BASKET_TTL_MS } from "../domain";
import { cloneAndValidateQuoteBasketV3 } from ".";

export class QuoteBasketV3BatchError extends Error {
  readonly code = "invalid_batch_result" as const;

  constructor() {
    super("The Quote Basket could not be refreshed.");
    this.name = "QuoteBasketV3BatchError";
  }
}

export function projectQuoteBasketV3ForValidation(
  basket: QuoteBasketDocumentV3,
): readonly MixedQuoteLineRequestLine[] {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV3(basket);
    return deepFreeze(current.items.flatMap((item): MixedQuoteLineRequestLine[] => {
      if (item.lineKind === "catalog_accessory") {
        return item.state === "ready"
          ? [{
              entryId: item.entryId,
              lineKind: "catalog_accessory",
              articleNumber: item.articleNumber,
              quantityUnit: "piece",
              quantity: item.quantity,
            }]
          : [];
      }
      return [{
        entryId: item.entryId,
        lineKind: "configured_product",
        canonicalPath: item.product.publicPath,
        selection: {
          type: item.selection.type === "custom" ? "custom_length" : "article_number",
          articleNumber: item.articleNumber,
          lengthMeters: item.selection.lengthMeters,
          color: item.selection.color,
          resolution: item.resolution,
        },
        packaging: {
          basePackaging: item.packaging.basePackaging.key,
          logoPrinting: item.packaging.logoPrinting,
          protectionArrangement: item.packaging.protectionArrangement?.key ?? null,
        },
        quantityUnit: "piece",
        quantity: item.quantity,
      }];
    }));
  });
}

function applyQuoteBasketV3Validation(
  basket: QuoteBasketDocumentV3,
  response: MixedQuoteLineValidationDto,
  now: Date,
  ids: QuoteBasketRevisionIds,
): QuoteBasketDocumentV3 {
  return boundary(() => {
    const current = cloneAndValidateQuoteBasketV3(basket);
    const requestLines = projectQuoteBasketV3ForValidation(current);
    if (!Array.isArray(response.lines) || response.lines.length !== requestLines.length) fail();
    const byEntry = new Map<string, Record<string, unknown>>();
    for (let index = 0; index < requestLines.length; index += 1) {
      const submitted = requestLines[index]!;
      const resolved = requireDataRecord(response.lines[index]);
      if (!resolvedMatchesRequest(resolved, submitted)) fail();
      byEntry.set(submitted.entryId, resolved);
    }
    if (byEntry.size !== requestLines.length) fail();

    const items = current.items.map((item): QuoteBasketItemV3 => {
      if (item.lineKind !== "configured_product" || item.state !== "requires_validation") return item;
      const resolved = byEntry.get(item.entryId);
      if (!resolved || !isArticleNumber(resolved.articleNumber)) fail();
      return {
        ...item,
        state: "ready",
        articleNumber: resolved.articleNumber,
        resolution: "standard_ready",
      };
    });
    const updatedAt = canonicalNow(now);
    assertUuid(ids.writerId);
    assertUuid(ids.mutationId);
    if (Date.parse(updatedAt) < Date.parse(current.updatedAt)) fail();
    return cloneAndValidateQuoteBasketV3({
      schemaVersion: "3.0.0",
      revision: current.revision + 1,
      writerId: ids.writerId,
      mutationId: ids.mutationId,
      updatedAt,
      expiresAt: new Date(Date.parse(updatedAt) + QUOTE_BASKET_TTL_MS).toISOString(),
      items,
    });
  });
}

export async function validateQuoteBasketV3(
  basket: QuoteBasketDocumentV3,
  now: Date,
  ids: QuoteBasketRevisionIds,
  callerSignal?: AbortSignal,
): Promise<QuoteBasketDocumentV3> {
  const current = cloneAndValidateQuoteBasketV3(basket);
  const projection = projectQuoteBasketV3ForValidation(current);
  if (projection.length < 1 || projection.length > 50) fail();
  const response = await validateMixedQuoteLines(projection, callerSignal);
  return applyQuoteBasketV3Validation(current, response, now, ids);
}

function resolvedMatchesRequest(
  resolved: Record<string, unknown>,
  submitted: MixedQuoteLineRequestLine,
): boolean {
  if (
    resolved.entryId !== submitted.entryId ||
    resolved.lineKind !== submitted.lineKind ||
    resolved.quantityUnit !== submitted.quantityUnit ||
    resolved.quantity !== submitted.quantity
  ) return false;
  if (submitted.lineKind === "catalog_accessory") {
    return resolved.resolution === "resolved_article_number" &&
      resolved.publicPath === null &&
      resolved.articleNumber === submitted.articleNumber;
  }
  if (
    resolved.publicPath !== submitted.canonicalPath ||
    JSON.stringify(resolved.packaging) !== JSON.stringify(submitted.packaging)
  ) return false;
  const selection = requireDataRecord(resolved.selection);
  if (
    selection.lengthMeters !== submitted.selection.lengthMeters ||
    JSON.stringify(selection.color) !== JSON.stringify(submitted.selection.color)
  ) return false;
  if (submitted.selection.resolution === "sales_follow_up") {
    return resolved.resolution === "sales_follow_up" &&
      resolved.articleNumber === null &&
      selection.type === "custom_length" &&
      selection.articleNumber === null;
  }
  return resolved.resolution === "resolved_article_number" &&
    isArticleNumber(resolved.articleNumber) &&
    selection.type === "article_number" &&
    selection.articleNumber === resolved.articleNumber &&
    (
      submitted.selection.resolution !== "standard_ready" ||
      resolved.articleNumber === submitted.selection.articleNumber
    );
}

function requireDataRecord(value: unknown): Record<string, unknown> {
  try {
    if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) fail();
    const result: Record<string, unknown> = {};
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string") fail();
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) fail();
      result[key] = descriptor.value;
    }
    return result;
  } catch {
    fail();
  }
}

function canonicalNow(now: Date): string {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) fail();
  return now.toISOString();
}

function assertUuid(value: unknown): void {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) fail();
}

function isArticleNumber(value: unknown): value is string {
  return typeof value === "string" && /^GDHEPRD[0-9]{6}$/.test(value);
}

function boundary<T>(operation: () => T): T {
  try {
    return operation();
  } catch {
    fail();
  }
}

function fail(): never {
  throw new QuoteBasketV3BatchError();
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}
