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

describe("TASK-027 local RFQ intake configuration", () => {
  test("accepts only the exact complete non-production loopback configuration", () => {
    expect(readRfqIntakeConfig(valid)).toMatchObject({
      enabled: true,
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
});
