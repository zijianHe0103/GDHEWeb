import "server-only";

import { createHash, createHmac } from "node:crypto";
import { types as nodeTypes } from "node:util";

import { snapshotRfqJsonValue } from "./contract";
import { RfqContractError } from "./errors";

const MAC_PREFIX = "GDHE-RFQ-DIGEST-V2\n2.0.0\n";
const COMPARISON_PREFIX = "GDHE-RFQ-COMPARISON-V2\n2.0.0\n";
const SNAPSHOT_PREFIX = "GDHE-RFQ-BASKET-SNAPSHOT-V2\n";
const KEY_VERSION_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/;

function serializeCanonical(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(serializeCanonical).join(",")}]`;
  }
  if (typeof value !== "object") throw new TypeError("unsupported canonical value");
  return `{${Object.keys(value).sort().map((key) => (
    `${JSON.stringify(key)}:${serializeCanonical(
      (value as Record<string, unknown>)[key],
    )}`
  )).join(",")}}`;
}

export function canonicalizeRfqValue(value: unknown): string {
  try {
    return serializeCanonical(snapshotRfqJsonValue(value));
  } catch {
    throw new RfqContractError("invalid_canonical_value");
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function copySecretKey(secretKey: Uint8Array): Uint8Array {
  try {
    if (
      typeof secretKey !== "object" ||
      secretKey === null ||
      nodeTypes.isProxy(secretKey) ||
      Object.getPrototypeOf(secretKey) !== Uint8Array.prototype ||
      Reflect.ownKeys(secretKey).some((key) => typeof key === "symbol")
    ) {
      throw new TypeError("invalid key object");
    }
    const copy = Uint8Array.prototype.slice.call(secretKey) as Uint8Array;
    if (copy.byteLength !== 32) throw new TypeError("invalid key length");
    return copy;
  } catch {
    throw new RfqContractError("invalid_key_material");
  }
}

export function computeRfqBusinessDigest(
  businessPayload: unknown,
  keyVersion: string,
  secretKey: Uint8Array,
): Readonly<{ keyVersion: string; value: string }> {
  if (
    typeof keyVersion !== "string" ||
    !KEY_VERSION_PATTERN.test(keyVersion)
  ) {
    throw new RfqContractError("invalid_key_material");
  }
  const secretCopy = copySecretKey(secretKey);
  try {
    const canonical = canonicalizeRfqValue(businessPayload);
    const value = createHmac("sha256", secretCopy)
      .update(`${MAC_PREFIX}${canonical}`, "utf8")
      .digest("hex");
    return Object.freeze({ keyVersion, value });
  } finally {
    secretCopy.fill(0);
  }
}

export function computeRfqComparisonToken(businessPayload: unknown): string {
  return sha256(`${COMPARISON_PREFIX}${canonicalizeRfqValue(businessPayload)}`);
}

export function computeRfqBasketSnapshotToken(sourceBasket: unknown): string {
  return sha256(`${SNAPSHOT_PREFIX}${canonicalizeRfqValue(sourceBasket)}`);
}
