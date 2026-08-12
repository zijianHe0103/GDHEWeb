const SNAPSHOT_PREFIX = "GDHE-RFQ-BASKET-SNAPSHOT-V2\n";
const BASKET_TTL_MS = 2_592_000_000;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const snapshotKeys = [
  "schemaVersion",
  "revision",
  "writerId",
  "mutationId",
  "updatedAt",
  "expiresAt",
] as const;

type BasketSnapshot = Readonly<{
  schemaVersion: "3.0.0";
  revision: number;
  writerId: string;
  mutationId: string;
  updatedAt: string;
  expiresAt: string;
}>;

export class RfqBasketSnapshotTokenError extends Error {
  readonly category = "basket_snapshot_token" as const;
  readonly kind = "invalid_snapshot" as const;

  constructor() {
    super("The Quote Basket snapshot token could not be computed.");
    Object.defineProperty(this, "name", {
      configurable: true,
      value: "RfqBasketSnapshotTokenError",
    });
  }
}

function canonicalTimestamp(value: unknown): string | null {
  try {
    if (typeof value !== "string" || new Date(value).toISOString() !== value) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function snapshotValue(input: unknown): BasketSnapshot {
  try {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new TypeError("invalid snapshot");
    }
    const prototype = Reflect.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("invalid snapshot prototype");
    }
    const ownKeys = Reflect.ownKeys(input);
    if (
      ownKeys.some((key) => typeof key !== "string") ||
      ownKeys.length !== snapshotKeys.length ||
      snapshotKeys.some((key) => !ownKeys.includes(key))
    ) throw new TypeError("invalid snapshot keys");
    const values = Object.create(null) as Record<string, unknown>;
    for (const key of snapshotKeys) {
      const descriptor = Reflect.getOwnPropertyDescriptor(input, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw new TypeError("invalid snapshot property");
      }
      values[key] = descriptor.value;
    }
    structuredClone(input);
    const updatedAt = canonicalTimestamp(values.updatedAt);
    const expiresAt = canonicalTimestamp(values.expiresAt);
    if (
      values.schemaVersion !== "3.0.0" ||
      !Number.isSafeInteger(values.revision) ||
      (values.revision as number) < 1 ||
      typeof values.writerId !== "string" ||
      !UUID_V4.test(values.writerId) ||
      typeof values.mutationId !== "string" ||
      !UUID_V4.test(values.mutationId) ||
      updatedAt === null ||
      expiresAt === null ||
      Date.parse(expiresAt) - Date.parse(updatedAt) !== BASKET_TTL_MS
    ) throw new TypeError("invalid snapshot value");
    return Object.freeze({
      schemaVersion: "3.0.0",
      revision: values.revision as number,
      writerId: values.writerId,
      mutationId: values.mutationId,
      updatedAt,
      expiresAt,
    });
  } catch {
    throw new RfqBasketSnapshotTokenError();
  }
}

function canonicalSnapshot(snapshot: BasketSnapshot): string {
  return `{"expiresAt":${JSON.stringify(snapshot.expiresAt)},` +
    `"mutationId":${JSON.stringify(snapshot.mutationId)},` +
    `"revision":${JSON.stringify(snapshot.revision)},` +
    `"schemaVersion":${JSON.stringify(snapshot.schemaVersion)},` +
    `"updatedAt":${JSON.stringify(snapshot.updatedAt)},` +
    `"writerId":${JSON.stringify(snapshot.writerId)}}`;
}

export async function computeRfqBasketSnapshotTokenBrowser(
  input: unknown,
): Promise<string> {
  try {
    const snapshot = snapshotValue(input);
    const bytes = new TextEncoder().encode(
      `${SNAPSHOT_PREFIX}${canonicalSnapshot(snapshot)}`,
    );
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    throw new RfqBasketSnapshotTokenError();
  }
}
