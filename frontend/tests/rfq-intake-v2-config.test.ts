import { describe, expect, test } from "vitest";

import { readRfqIntakeConfig } from "../src/lib/rfq/server/v2/config";

const valid = {
  NODE_ENV: "development",
  GDHE_RFQ_INTAKE_MODE: "stub",
  GDHE_RFQ_INTAKE_ORIGIN: "http://127.0.0.1:3000",
  GDHE_RFQ_HMAC_KEY_VERSION: "local-v2",
  GDHE_RFQ_HMAC_KEY_HEX: "20".repeat(32),
  GDHE_RFQ_STUB_SINK_OUTCOME: "accepted",
};

const persistent = {
  ...valid,
  GDHE_RFQ_INTAKE_MODE: "persistent_stub",
  GDHE_RFQ_MYSQL_PASSWORD: "transient-runtime-password",
};

describe("TASK-027 local RFQ intake configuration", () => {
  test("accepts only the exact complete non-production loopback configuration", () => {
    expect(readRfqIntakeConfig(valid)).toMatchObject({
      enabled: true,
      mode: "stub",
      origin: "http://127.0.0.1:3000",
      keyVersion: "local-v2",
      sinkOutcome: "accepted",
    });
    for (const environment of [
      { ...valid, NODE_ENV: "production" },
      { ...valid, GDHE_RFQ_INTAKE_MODE: "preview" },
      { ...valid, GDHE_RFQ_INTAKE_ORIGIN: "http://127.0.0.1" },
      { ...valid, GDHE_RFQ_INTAKE_ORIGIN: "http://localhost:3000/path" },
      { ...valid, GDHE_RFQ_INTAKE_ORIGIN: "http://user@localhost:3000" },
      { ...valid, GDHE_RFQ_HMAC_KEY_VERSION: "" },
      { ...valid, GDHE_RFQ_HMAC_KEY_HEX: "AA".repeat(32) },
      { ...valid, GDHE_RFQ_STUB_SINK_OUTCOME: "cms" },
      {},
    ]) {
      expect(readRfqIntakeConfig(environment)).toEqual({ enabled: false });
    }
  });

  test("accepts persistent_stub only with the closed server-only MySQL credential", () => {
    expect(readRfqIntakeConfig(persistent)).toMatchObject({
      enabled: true,
      mode: "persistent_stub",
      mysqlPassword: "transient-runtime-password",
    });
    for (const environment of [
      { ...persistent, GDHE_RFQ_MYSQL_PASSWORD: undefined },
      { ...persistent, GDHE_RFQ_MYSQL_PASSWORD: "" },
      { ...persistent, GDHE_RFQ_MYSQL_PASSWORD: "x".repeat(256) },
      { ...persistent, NODE_ENV: "production" },
    ]) {
      expect(readRfqIntakeConfig(environment)).toEqual({ enabled: false });
    }
  });
});
