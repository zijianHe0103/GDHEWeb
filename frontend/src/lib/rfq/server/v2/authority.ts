import "server-only";

import type {
  MixedQuoteLineRequestLine,
  MixedQuoteLineValidationDto,
} from "../../../cms/server/article-number-batch/types";
import { canonicalizeRfqValue } from "./canonical";
import {
  getValidatedRfqBody,
  snapshotRfqJsonValue,
  validateAuthoritativeRfqDocument,
  type ValidatedRfqDocument,
} from "./contract";
import { RfqAuthorityError } from "./errors";

type JsonRecord = Readonly<Record<string, unknown>>;

export type AuthoritativeRfqDocumentContext = Readonly<{
  rfqId: string;
  publicReference: string;
  receivedAt: string;
  status:
    | "idempotency_reserved"
    | "resolving_lines"
    | "delivery_pending"
    | "accepted"
    | "delivery_indeterminate"
    | "rejected_before_delivery";
  payloadDigest: Readonly<{ keyVersion: string; value: string }>;
  idempotency: Readonly<{
    keyFingerprint: string;
    createdAt: string;
    expiresAt: string;
  }>;
  sourceSecurity: Readonly<{
    sourceFingerprint: string;
    contactFingerprint?: string;
    outcomeCode: "new_intent";
  }>;
  delivery: Readonly<{
    state: "not_started" | "pending" | "accepted" | "indeterminate" | "rejected";
    attemptCount: 0 | 1;
    lastTransitionAt: string;
  }>;
}>;

export type ResolveAuthoritativeRfqDependencies = Readonly<{
  document: AuthoritativeRfqDocumentContext;
  validateMixedQuoteLines: (
    lines: readonly MixedQuoteLineRequestLine[],
  ) => Promise<MixedQuoteLineValidationDto>;
}>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function freezeProjection<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) freezeProjection(child);
  return Object.freeze(value);
}

function exactKeys(value: JsonRecord, keys: readonly string[]): boolean {
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function exactJson(left: unknown, right: unknown): boolean {
  return canonicalizeRfqValue(left) === canonicalizeRfqValue(right);
}

function projectConfiguredLine(line: JsonRecord): MixedQuoteLineRequestLine {
  if (!isRecord(line.selection) || !isRecord(line.packaging)) {
    throw new RfqAuthorityError("invalid_projection");
  }
  const resolution = line.selection.resolution;
  if (resolution !== "standard_ready" && resolution !== "sales_follow_up") {
    throw new RfqAuthorityError("invalid_projection");
  }
  return {
    entryId: line.entryId as string,
    lineKind: "configured_product",
    canonicalPath: line.canonicalPath as string,
    selection: {
      type: line.selection.type as "article_number" | "custom_length",
      articleNumber: line.selection.articleNumber as string | null,
      lengthMeters: line.selection.lengthMeters as number,
      color: line.selection.color as { code: string; label: string },
      resolution,
    },
    packaging: line.packaging as {
      basePackaging: "standard" | "carton" | "large_shrink_wrap";
      logoPrinting: boolean;
      protectionArrangement: "single_bag" | "paired" | null;
    },
    quantityUnit: "piece",
    quantity: line.quantity as number,
  };
}

function projectLines(body: unknown): readonly MixedQuoteLineRequestLine[] {
  if (!isRecord(body) || !isRecord(body.basket) || !Array.isArray(body.basket.items)) {
    throw new RfqAuthorityError("invalid_projection");
  }
  if (body.basket.items.length < 1 || body.basket.items.length > 50) {
    throw new RfqAuthorityError("invalid_projection");
  }
  const entryIds = new Set<string>();
  const identities = new Set<string>();
  const lines = body.basket.items.map((value) => {
    if (!isRecord(value)) throw new RfqAuthorityError("invalid_projection");
    const line: MixedQuoteLineRequestLine = value.lineKind === "configured_product"
      ? projectConfiguredLine(value)
      : value.lineKind === "catalog_accessory"
        ? {
            entryId: value.entryId as string,
            lineKind: "catalog_accessory",
            articleNumber: value.articleNumber as string,
            quantityUnit: "piece",
            quantity: value.quantity as number,
          }
        : (() => { throw new RfqAuthorityError("invalid_projection"); })();
    const identity = line.lineKind === "configured_product"
      ? canonicalizeRfqValue({
          lineKind: line.lineKind,
          canonicalPath: line.canonicalPath,
          selection: line.selection,
          packaging: line.packaging,
          quantityUnit: line.quantityUnit,
        })
      : canonicalizeRfqValue({
          lineKind: line.lineKind,
          articleNumber: line.articleNumber,
          quantityUnit: line.quantityUnit,
        });
    if (entryIds.has(line.entryId) || identities.has(identity)) {
      throw new RfqAuthorityError("invalid_projection");
    }
    entryIds.add(line.entryId);
    identities.add(identity);
    return line;
  });
  return freezeProjection(lines);
}

function bindMixedResponse(
  submittedLines: readonly MixedQuoteLineRequestLine[],
  input: unknown,
): readonly JsonRecord[] {
  let response: JsonRecord;
  try {
    const snapshot = snapshotRfqJsonValue(input);
    if (!isRecord(snapshot)) throw new TypeError("invalid response");
    response = snapshot;
  } catch {
    throw new RfqAuthorityError("response_mismatch");
  }
  if (
    !exactKeys(response, ["apiVersion", "schemaVersion", "locale", "type", "lines"]) ||
    response.apiVersion !== "1" ||
    response.schemaVersion !== "1.0.0" ||
    response.locale !== "en" ||
    response.type !== "mixed_quote_line_validation" ||
    !Array.isArray(response.lines) ||
    response.lines.length !== submittedLines.length
  ) {
    throw new RfqAuthorityError("response_mismatch");
  }
  const responseLines = response.lines;
  const authoritativeLines = submittedLines.map((submitted, index) => {
    const resolved = responseLines[index];
    if (
      !isRecord(resolved) ||
      resolved.entryId !== submitted.entryId ||
      resolved.lineKind !== submitted.lineKind ||
      resolved.quantityUnit !== submitted.quantityUnit ||
      resolved.quantity !== submitted.quantity ||
      typeof resolved.model !== "string" ||
      resolved.model.length === 0
    ) {
      throw new RfqAuthorityError("response_mismatch");
    }
    if (submitted.lineKind === "catalog_accessory") {
      if (
        !exactKeys(resolved, [
          "entryId", "lineKind", "resolution", "model", "publicPath",
          "articleNumber", "quantityUnit", "quantity",
        ]) ||
        resolved.resolution !== "resolved_article_number" ||
        resolved.publicPath !== null ||
        resolved.articleNumber !== submitted.articleNumber
      ) {
        throw new RfqAuthorityError("response_mismatch");
      }
      return { ...resolved };
    }
    if (
      !exactKeys(resolved, [
        "entryId", "lineKind", "resolution", "model", "publicPath",
        "articleNumber", "selection", "packaging", "quantityUnit", "quantity",
      ]) ||
      resolved.publicPath !== submitted.canonicalPath ||
      !isRecord(resolved.selection) ||
      !exactJson(resolved.packaging, submitted.packaging) ||
      resolved.selection.lengthMeters !== submitted.selection.lengthMeters ||
      !exactJson(resolved.selection.color, submitted.selection.color)
    ) {
      throw new RfqAuthorityError("response_mismatch");
    }
    if (submitted.selection.resolution === "sales_follow_up") {
      if (
        resolved.resolution !== "sales_follow_up" ||
        resolved.articleNumber !== null ||
        resolved.selection.type !== "custom_length" ||
        resolved.selection.articleNumber !== null
      ) {
        throw new RfqAuthorityError("response_mismatch");
      }
      return { ...resolved, followUpReason: "custom_length" };
    }
    if (
      resolved.resolution !== "resolved_article_number" ||
      typeof resolved.articleNumber !== "string" ||
      resolved.selection.type !== "article_number" ||
      resolved.selection.articleNumber !== resolved.articleNumber ||
      resolved.articleNumber !== submitted.selection.articleNumber
    ) {
      throw new RfqAuthorityError("response_mismatch");
    }
    return { ...resolved };
  });
  return freezeProjection(authoritativeLines);
}

function buildAuthoritativeDocument(
  submissionBody: unknown,
  lines: readonly JsonRecord[],
  input: AuthoritativeRfqDocumentContext,
): ValidatedRfqDocument<"authoritative_document"> {
  try {
    const context = snapshotRfqJsonValue(input);
    if (
      !isRecord(submissionBody) ||
      !isRecord(submissionBody.customer) ||
      !isRecord(submissionBody.privacyNotice) ||
      !isRecord(context) ||
      !isRecord(context.payloadDigest) ||
      !isRecord(context.idempotency) ||
      !isRecord(context.sourceSecurity) ||
      !isRecord(context.delivery) ||
      !exactKeys(context, [
        "rfqId", "publicReference", "receivedAt", "status", "payloadDigest",
        "idempotency", "sourceSecurity", "delivery",
      ])
    ) {
      throw new TypeError("invalid context");
    }
    const document = {
      contractVersion: "2.0.0",
      rfqId: context.rfqId,
      publicReference: context.publicReference,
      receivedAt: context.receivedAt,
      status: context.status,
      customer: submissionBody.customer,
      privacyNotice: {
        version: submissionBody.privacyNotice.version,
        presentedAt: submissionBody.privacyNotice.presentedAt,
        receivedAt: context.receivedAt,
      },
      lines,
      payloadDigest: context.payloadDigest,
      idempotency: context.idempotency,
      sourceSecurity: context.sourceSecurity,
      delivery: context.delivery,
    };
    return validateAuthoritativeRfqDocument(document, {
      keyVersion: context.payloadDigest.keyVersion as string,
      value: context.payloadDigest.value as string,
    });
  } catch {
    throw new RfqAuthorityError("invalid_authority_context");
  }
}

export async function resolveAuthoritativeRfqLines(
  submission: ValidatedRfqDocument<"public_submission">,
  dependencies: ResolveAuthoritativeRfqDependencies,
): Promise<ValidatedRfqDocument<"authoritative_document">> {
  let body: unknown;
  try {
    body = getValidatedRfqBody(submission, "public_submission");
  } catch {
    throw new RfqAuthorityError("invalid_submission");
  }
  const lines = projectLines(body);
  let response: MixedQuoteLineValidationDto;
  try {
    response = await dependencies.validateMixedQuoteLines(lines);
  } catch {
    throw new RfqAuthorityError("mixed_validation_failed");
  }
  const authoritativeLines = bindMixedResponse(lines, response);
  let document: AuthoritativeRfqDocumentContext;
  try {
    document = dependencies.document;
  } catch {
    throw new RfqAuthorityError("invalid_authority_context");
  }
  return buildAuthoritativeDocument(body, authoritativeLines, document);
}
