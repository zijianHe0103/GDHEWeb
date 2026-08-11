import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { adaptMixedQuoteLineValidation } from "../src/lib/cms/server/article-number-batch/adapter";
import { validateMixedQuoteLineResponse } from "../src/lib/cms/server/article-number-batch/validation";

const samplePath = path.resolve(
  import.meta.dirname,
  "../src/lib/cms/article-number-batch-contract/samples/success/mixed-two-line.json",
);

async function sample(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(samplePath, "utf8")) as Record<string, unknown>;
}

describe("TASK-025 mixed validation Runtime Validator and Adapter", () => {
  it("keeps an authentic caller-isolated body opaque and emits a deep-frozen DTO", async () => {
    const input = await sample();
    const validated = validateMixedQuoteLineResponse(input);
    const lines = input.lines as Array<Record<string, unknown>>;
    lines[0].articleNumber = "GDHEPRD999999";

    expect(Object.keys(validated)).toEqual(["kind"]);
    expect({ ...validated }).toEqual({ kind: "success" });
    expect(JSON.stringify(validated)).toBe('{"kind":"success"}');
    expect((validated as unknown as { body?: unknown }).body).toBeUndefined();

    const dto = adaptMixedQuoteLineValidation(validated);
    expect(dto.lines.map((line) => line.articleNumber)).toEqual([
      "GDHEPRD000172",
      "GDHEPRD000901",
    ]);
    expect(Object.isFrozen(dto)).toBe(true);
    expect(Object.isFrozen(dto.lines)).toBe(true);
    expect(Object.isFrozen(dto.lines[0])).toBe(true);
    expect(() => {
      (dto.lines[0] as { model: string }).model = "poisoned";
    }).toThrow();
  });

  it("fails closed with a stable contract error for malformed success data", async () => {
    const input = await sample();
    delete ((input.lines as Array<Record<string, unknown>>)[0]).entryId;

    expect(() => validateMixedQuoteLineResponse(input)).toThrowError(
      expect.objectContaining({
        category: "contract",
        kind: "invalid_success_payload",
      }),
    );
  });
});
