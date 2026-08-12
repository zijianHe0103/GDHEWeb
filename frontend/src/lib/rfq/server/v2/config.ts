import "server-only";

import type { StubRfqSinkOutcome } from "./stub-sink";

type Environment = Readonly<Record<string, string | undefined>>;

export type RfqIntakeConfig =
  | Readonly<{ enabled: false }>
  | (Readonly<{
      enabled: true;
      origin: string;
      keyVersion: string;
      secretKey: Uint8Array;
      sinkOutcome: StubRfqSinkOutcome;
    }> & (
      | Readonly<{ mode: "stub" }>
      | Readonly<{ mode: "persistent_stub"; mysqlPassword: string }>
    ));

const DISABLED = Object.freeze({ enabled: false } as const);

export function readRfqIntakeConfig(
  environment: Environment = process.env,
): RfqIntakeConfig {
  const mode = environment.GDHE_RFQ_INTAKE_MODE;
  if (
    environment.NODE_ENV === "production" ||
    (mode !== "stub" && mode !== "persistent_stub")
  ) return DISABLED;
  const origin = environment.GDHE_RFQ_INTAKE_ORIGIN;
  const keyVersion = environment.GDHE_RFQ_HMAC_KEY_VERSION;
  const keyHex = environment.GDHE_RFQ_HMAC_KEY_HEX;
  const sinkOutcome = environment.GDHE_RFQ_STUB_SINK_OUTCOME;
  const mysqlPassword = environment.GDHE_RFQ_MYSQL_PASSWORD;
  if (
    typeof origin !== "string" ||
    typeof keyVersion !== "string" ||
    !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(keyVersion) ||
    typeof keyHex !== "string" ||
    !/^[0-9a-f]{64}$/.test(keyHex) ||
    !["accepted", "indeterminate", "rejected_before_delivery"].includes(
      sinkOutcome ?? "",
    )
  ) return DISABLED;
  try {
    const url = new URL(origin);
    if (
      url.protocol !== "http:" ||
      !["127.0.0.1", "localhost"].includes(url.hostname) ||
      url.port === "" ||
      url.username !== "" ||
      url.password !== "" ||
      url.pathname !== "/" ||
      url.search !== "" ||
      url.hash !== "" ||
      url.origin !== origin
    ) return DISABLED;
  } catch {
    return DISABLED;
  }
  const common = {
    enabled: true,
    origin,
    keyVersion,
    secretKey: Uint8Array.from(Buffer.from(keyHex, "hex")),
    sinkOutcome: sinkOutcome as StubRfqSinkOutcome,
  } as const;
  if (mode === "persistent_stub") {
    if (
      typeof mysqlPassword !== "string" ||
      mysqlPassword.length === 0 ||
      mysqlPassword.length > 255
    ) return DISABLED;
    return Object.freeze({ ...common, mode, mysqlPassword });
  }
  return Object.freeze({ ...common, mode });
}
