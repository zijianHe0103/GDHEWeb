import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import errorPayloads from "../src/lib/cms/contracts/samples/errors/resolve-errors.json";
import homePayload from "../src/lib/cms/contracts/samples/success/resolve-home.json";
import productPayload from "../src/lib/cms/contracts/samples/success/resolve-product-alpha.json";
import * as validationModule from "../src/lib/cms/server/validation";
import {
  CmsContractError,
  type CmsContractErrorKind,
  type ValidatedCmsPayload,
  validateCmsErrorPayload,
  validateCmsSuccessPayload,
} from "../src/lib/cms/server/validation";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Expected a test object.");
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError("Expected a test array.");
  }
  return value;
}

function expectContractError(
  assertion: () => unknown,
  kind: CmsContractErrorKind,
): CmsContractError {
  try {
    assertion();
    expect.unreachable("Expected a CMS contract error.");
  } catch (error) {
    expect(error).toBeInstanceOf(CmsContractError);
    expect(error).toMatchObject({ category: "contract", kind });
    return error as CmsContractError;
  }
}

function withRestoredProperty(
  target: object,
  key: PropertyKey,
  assertion: () => void,
): void {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);

  try {
    assertion();
  } finally {
    if (descriptor) {
      Object.defineProperty(target, key, descriptor);
    } else {
      Reflect.deleteProperty(target, key);
    }
  }
}

function createDownloadPayload(): Record<string, unknown> {
  const payload = clone(homePayload) as Record<string, unknown>;
  payload.type = "download";
  payload.templateKey = "download";
  payload.publicPath = "/downloads/synthetic-data-sheet/";
  payload.details = {
    documentType: "data-sheet",
    version: "1.0",
    date: "2026-07-25",
    locale: "en",
    file: {
      id: "38000000-0000-4000-8000-000000000001",
      url: "https://media.gdhe.example/fixtures/data-sheet.pdf",
      filename: "data-sheet.pdf",
      mimeType: "application/pdf",
      bytes: 1024,
    },
    description: "Synthetic download fixture.",
  };
  return payload;
}

async function buildClientImport(
  modulePath: string,
  stripServerOnlyMarkers: boolean,
): Promise<{ status: number | null; output: string }> {
  const projectRoot = join(import.meta.dirname, "..");
  const temporaryRoot = await mkdtemp(
    join(projectRoot, ".tmp-validator-server-only-"),
  );

  try {
    await mkdir(join(temporaryRoot, "app"), { recursive: true });
    await mkdir(join(temporaryRoot, "src", "lib", "cms", "server"), {
      recursive: true,
    });
    await cp(
      join(projectRoot, "src", "lib", "cms", "contracts"),
      join(temporaryRoot, "src", "lib", "cms", "contracts"),
      { recursive: true },
    );
    await cp(
      join(projectRoot, "src", "lib", "cms", "server", "validation"),
      join(temporaryRoot, "src", "lib", "cms", "server", "validation"),
      { recursive: true },
    );

    if (stripServerOnlyMarkers) {
      for (const filename of ["errors.ts", "index.ts", "registry.ts"]) {
        const path = join(
          temporaryRoot,
          "src",
          "lib",
          "cms",
          "server",
          "validation",
          filename,
        );
        const source = await readFile(path, "utf8");
        await writeFile(path, source.replace('import "server-only";\n\n', ""));
      }
    }

    await writeFile(
      join(temporaryRoot, "package.json"),
      JSON.stringify({
        private: true,
        dependencies: {
          ajv: "8.20.0",
          "ajv-formats": "3.0.1",
          next: "16.2.11",
          react: "19.2.8",
          "react-dom": "19.2.8",
        },
      }),
    );
    await writeFile(
      join(temporaryRoot, "app", "layout.tsx"),
      "export default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }",
    );
    await writeFile(
      join(temporaryRoot, "app", "page.tsx"),
      `"use client";\nimport * as validator from "${modulePath}";\nexport default function Page() { void validator; return null; }\n`,
    );

    const build = spawnSync(
      join(projectRoot, "node_modules", ".bin", "next"),
      ["build"],
      {
        cwd: temporaryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          NEXT_TELEMETRY_DISABLED: "1",
        },
      },
    );

    return {
      status: build.status,
      output: `${build.stdout}\n${build.stderr}`,
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

describe("CMS runtime validator", () => {
  test("keeps the public runtime export surface minimal", () => {
    expect(Object.keys(validationModule).sort()).toEqual([
      "CmsContractError",
      "validateCmsErrorPayload",
      "validateCmsSuccessPayload",
    ]);
  });

  test("registers exactly the frozen 16-Schema closure without remote loading", async () => {
    const registrySource = await readFile(
      join(
        import.meta.dirname,
        "../src/lib/cms/server/validation/registry.ts",
      ),
      "utf8",
    );
    const staticSchemaImports = registrySource.match(
      /from "\.\.\/\.\.\/contracts\/schemas\/[^"]+\.json"/g,
    );

    expect(staticSchemaImports).toHaveLength(16);
    expect(registrySource).not.toContain("loadSchema");
    expect(registrySource).not.toMatch(/node:fs|fetch\(/);
  });

  test("validates the canonical home success payload through the public seam", () => {
    const validated = validateCmsSuccessPayload(homePayload);

    expect(validated.kind).toBe("success");
    expect(validated.body).toEqual(homePayload);
    expect(validated.body).not.toBe(homePayload);
  });

  test("validates the canonical product success payload", () => {
    const validated = validateCmsSuccessPayload(productPayload);

    expect(validated.kind).toBe("success");
    expect(validated.body).toEqual(productPayload);
    expect(validated.body).not.toBe(productPayload);
  });

  test.each([
    ["gdhe_invalid_schema", errorPayloads.gdhe_invalid_schema],
    ["gdhe_not_found", errorPayloads.gdhe_not_found],
  ])("validates the canonical %s error payload", (_name, payload) => {
    const validated = validateCmsErrorPayload(payload);

    expect(validated.kind).toBe("error");
    expect(validated.body).toEqual(payload);
    expect(validated.body).not.toBe(payload);
  });

  test.each([
    ["success API", "apiVersion", "2"],
    ["success Schema", "schemaVersion", "4.0.0"],
  ])("rejects an unsupported %s version", (_name, field, value) => {
    const payload = clone(homePayload) as Record<string, unknown>;
    payload[field] = value;

    expectContractError(
      () => validateCmsSuccessPayload(payload),
      "unsupported_schema",
    );
  });

  test("rejects an unsupported error API version", () => {
    const payload = clone(errorPayloads.gdhe_not_found);
    payload.apiVersion = "2";

    expectContractError(
      () => validateCmsErrorPayload(payload),
      "unsupported_schema",
    );
  });

  test.each([
    ["success API version", validateCmsSuccessPayload, homePayload, "apiVersion"],
    [
      "success content Schema version",
      validateCmsSuccessPayload,
      homePayload,
      "schemaVersion",
    ],
    [
      "error API version",
      validateCmsErrorPayload,
      errorPayloads.gdhe_not_found,
      "apiVersion",
    ],
  ])("rejects a missing %s", (_name, validate, source, field) => {
    const payload = clone(source) as Record<string, unknown>;
    delete payload[field];

    expectContractError(() => validate(payload), "unsupported_schema");
  });

  test.each([
    [
      "missing required root field",
      (payload: Record<string, unknown>) => {
        delete payload.title;
      },
    ],
    [
      "invalid content type and template pair",
      (payload: Record<string, unknown>) => {
        payload.templateKey = "product";
      },
    ],
    [
      "unknown module type",
      (payload: Record<string, unknown>) => {
        asRecord(asArray(payload.modules)[0]).type = "unknown_module";
      },
    ],
    [
      "wrong module Schema version",
      (payload: Record<string, unknown>) => {
        asRecord(asArray(payload.modules)[0]).schemaVersion = "2.0.0";
      },
    ],
    [
      "invalid module UUID",
      (payload: Record<string, unknown>) => {
        asRecord(asArray(payload.modules)[0]).id = "not-a-uuid";
      },
    ],
    [
      "invalid publication date-time",
      (payload: Record<string, unknown>) => {
        payload.publishedAt = "2026-99-99";
      },
    ],
    [
      "forbidden root property",
      (payload: Record<string, unknown>) => {
        payload.rawMeta = "must-not-pass";
      },
    ],
    [
      "invalid relation",
      (payload: Record<string, unknown>) => {
        const relations = asRecord(payload.relations);
        const product = asRecord(asArray(relations.products)[0]);
        product.publicPath = "not-canonical";
      },
    ],
  ])("rejects a success payload with %s", (_name, mutate) => {
    const payload = clone(homePayload) as Record<string, unknown>;
    mutate(payload);

    expectContractError(
      () => validateCmsSuccessPayload(payload),
      "invalid_success_payload",
    );
  });

  test.each([
    [
      "invalid media URL",
      (media: Record<string, unknown>) => {
        media.url = "not a URI";
      },
    ],
    [
      "invalid media width",
      (media: Record<string, unknown>) => {
        media.width = 0;
      },
    ],
  ])("rejects a product payload with %s", (_name, mutate) => {
    const payload = clone(productPayload) as Record<string, unknown>;
    const details = asRecord(payload.details);
    const media = {
      id: "35000000-0000-4000-8000-000000000001",
      url: "https://media.gdhe.example/fixtures/image.jpg",
      mimeType: "image/jpeg",
      width: 640,
      height: 480,
      alt: "Synthetic fixture",
      decorative: false,
    };
    mutate(media);
    details.gallery = [media];

    expectContractError(
      () => validateCmsSuccessPayload(payload),
      "invalid_success_payload",
    );
  });

  test("rejects a non-string data table cell", () => {
    const payload = clone(homePayload) as Record<string, unknown>;
    payload.modules = [
      {
        id: "36000000-0000-4000-8000-000000000001",
        type: "data_table",
        schemaVersion: "1.0.0",
        data: {
          caption: "Synthetic table",
          columns: [{ key: "flow", label: "Flow" }],
          rows: [
            {
              id: "37000000-0000-4000-8000-000000000001",
              cells: { flow: 12 },
            },
          ],
        },
      },
    ];

    expectContractError(
      () => validateCmsSuccessPayload(payload),
      "invalid_success_payload",
    );
  });

  test.each([
    [
      "missing row ID",
      (row: Record<string, unknown>) => {
        delete row.id;
      },
    ],
    [
      "non-object cells",
      (row: Record<string, unknown>) => {
        row.cells = [];
      },
    ],
  ])("rejects a data table with %s", (_name, mutate) => {
    const payload = clone(homePayload) as Record<string, unknown>;
    const row: Record<string, unknown> = {
      id: "37000000-0000-4000-8000-000000000001",
      cells: { flow: "12" },
    };
    mutate(row);
    payload.modules = [
      {
        id: "36000000-0000-4000-8000-000000000001",
        type: "data_table",
        schemaVersion: "1.0.0",
        data: {
          caption: "Synthetic table",
          columns: [{ key: "flow", label: "Flow" }],
          rows: [row],
        },
      },
    ];

    expectContractError(
      () => validateCmsSuccessPayload(payload),
      "invalid_success_payload",
    );
  });

  test("validates the file/date format baseline for a download", () => {
    expect(validateCmsSuccessPayload(createDownloadPayload()).kind).toBe(
      "success",
    );
  });

  test.each([
    [
      "invalid file URI",
      (details: Record<string, unknown>) => {
        asRecord(details.file).url = "not a URI";
      },
    ],
    [
      "invalid date",
      (details: Record<string, unknown>) => {
        details.date = "2026-99-99";
      },
    ],
  ])("rejects a download with %s", (_name, mutate) => {
    const payload = createDownloadPayload();
    mutate(asRecord(payload.details));

    expectContractError(
      () => validateCmsSuccessPayload(payload),
      "invalid_success_payload",
    );
  });

  test.each([
    [
      "malformed code",
      (payload: Record<string, unknown>) => {
        payload.code = "INVALID";
      },
    ],
    [
      "malformed status",
      (payload: Record<string, unknown>) => {
        payload.status = 200;
      },
    ],
    [
      "malformed request ID",
      (payload: Record<string, unknown>) => {
        payload.requestId = "request-secret";
      },
    ],
    [
      "malformed details",
      (payload: Record<string, unknown>) => {
        payload.details = [{ field: "path" }];
      },
    ],
    [
      "missing required message",
      (payload: Record<string, unknown>) => {
        delete payload.message;
      },
    ],
  ])("rejects an error payload with %s", (_name, mutate) => {
    const payload = clone(
      errorPayloads.gdhe_not_found,
    ) as Record<string, unknown>;
    mutate(payload);

    expectContractError(
      () => validateCmsErrorPayload(payload),
      "invalid_error_payload",
    );
  });

  test("returns an opaque wrapper that does not serialize its body", () => {
    const validated = validateCmsSuccessPayload(homePayload);

    expect(Object.keys(validated)).toEqual(["kind"]);
    expect({ ...validated }).toEqual({ kind: "success" });
    expect(JSON.stringify(validated)).toBe('{"kind":"success"}');
    expect(JSON.stringify(validated)).not.toContain(homePayload.title);
  });

  test("keeps a success wrapper isolated and deeply immutable", () => {
    const input = clone(homePayload);
    const validated = validateCmsSuccessPayload(input);
    const body = asRecord(validated.body);
    const moduleEntry = asRecord(asArray(body.modules)[0]);
    const moduleData = asRecord(moduleEntry.data);

    input.title = "Caller-mutated title";
    input.modules[0].data.safeHtml = "<p>Caller mutation</p>";

    expect(body.title).toBe(homePayload.title);
    expect(moduleData.safeHtml).toBe(homePayload.modules[0].data.safeHtml);
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(body)).toBe(true);
    expect(Object.isFrozen(moduleData)).toBe(true);
    expect(Reflect.set(body, "title", "")).toBe(false);
    expect(Reflect.set(moduleData, "safeHtml", "<p>Changed</p>")).toBe(false);
    expect(Reflect.set(validated, "kind", "error")).toBe(false);
    expect(Reflect.set(validated, "extra", true)).toBe(false);
    expect(Object.getOwnPropertyDescriptor(validated, "kind")).toMatchObject({
      configurable: false,
      enumerable: true,
      value: "success",
      writable: false,
    });
    const [brand] = Object.getOwnPropertySymbols(validated);
    expect(Object.getOwnPropertyDescriptor(validated, brand!)).toMatchObject({
      configurable: false,
      enumerable: false,
      value: "success",
      writable: false,
    });
    expect(validated.kind).toBe("success");
    expect(validateCmsSuccessPayload(validated.body).kind).toBe("success");
    expect(Object.keys(validated)).toEqual(["kind"]);
    expect({ ...validated }).toEqual({ kind: "success" });
    expect(JSON.stringify(validated)).toBe('{"kind":"success"}');
  });

  test("keeps an error wrapper isolated and deeply immutable", () => {
    const input = clone(errorPayloads.gdhe_not_found);
    const validated = validateCmsErrorPayload(input);
    const body = asRecord(validated.body);
    const detail = asRecord(asArray(body.details)[0]);

    input.message = "Caller-mutated error";
    input.details[0].field = "caller";

    expect(body.message).toBe(errorPayloads.gdhe_not_found.message);
    expect(detail.field).toBe(errorPayloads.gdhe_not_found.details[0].field);
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(body)).toBe(true);
    expect(Object.isFrozen(detail)).toBe(true);
    expect(Reflect.set(body, "message", "")).toBe(false);
    expect(Reflect.set(detail, "field", "changed")).toBe(false);
    expect(Reflect.set(validated, "kind", "success")).toBe(false);
    expect(Reflect.set(validated, "extra", true)).toBe(false);
    expect(Object.getOwnPropertyDescriptor(validated, "kind")).toMatchObject({
      configurable: false,
      enumerable: true,
      value: "error",
      writable: false,
    });
    const [brand] = Object.getOwnPropertySymbols(validated);
    expect(Object.getOwnPropertyDescriptor(validated, brand!)).toMatchObject({
      configurable: false,
      enumerable: false,
      value: "error",
      writable: false,
    });
    expect(validated.kind).toBe("error");
    expect(validateCmsErrorPayload(validated.body).kind).toBe("error");
    expect(Object.keys(validated)).toEqual(["kind"]);
    expect({ ...validated }).toEqual({ kind: "error" });
    expect(JSON.stringify(validated)).toBe('{"kind":"error"}');
  });

  test.each([
    {
      kind: "success",
      create: () => validateCmsSuccessPayload(homePayload),
      revalidate: validateCmsSuccessPayload,
      sentinel: "prototype-success-body-leak",
    },
    {
      kind: "error",
      create: () => validateCmsErrorPayload(errorPayloads.gdhe_not_found),
      revalidate: validateCmsErrorPayload,
      sentinel: "prototype-error-body-leak",
    },
  ] as const)(
    "resists a prototype body getter and replacement for a $kind wrapper",
    ({ kind, create, revalidate, sentinel }) => {
      const validated = create();
      const originalBody = validated.body;
      const originalPrototype = Object.getPrototypeOf(validated);
      const poisonTarget = originalPrototype ?? Object.prototype;

      withRestoredProperty(poisonTarget, "body", () => {
        Object.defineProperty(poisonTarget, "body", {
          configurable: true,
          get: () => ({ sentinel }),
        });

        expect(validated.body).toBe(originalBody);
        expect(revalidate(validated.body).kind).toBe(kind);
        expect(
          Reflect.defineProperty(validated, "body", {
            get: () => ({ sentinel }),
          }),
        ).toBe(false);
        expect(
          Reflect.setPrototypeOf(validated, {
            body: { sentinel },
          }),
        ).toBe(false);
        expect(Object.getPrototypeOf(validated)).toBe(originalPrototype);
        expect(originalPrototype).toBeNull();
        expect(Object.keys(validated)).toEqual(["kind"]);
        expect({ ...validated }).toEqual({ kind });
        expect(JSON.stringify(validated)).toBe(`{"kind":"${kind}"}`);
        expect(JSON.stringify(validated)).not.toContain(sentinel);
      });
    },
  );

  test.each([
    {
      kind: "success",
      create: () => validateCmsSuccessPayload(homePayload),
      revalidate: validateCmsSuccessPayload,
      sentinel: "prototype-success-json-leak",
    },
    {
      kind: "error",
      create: () => validateCmsErrorPayload(errorPayloads.gdhe_not_found),
      revalidate: validateCmsErrorPayload,
      sentinel: "prototype-error-json-leak",
    },
  ] as const)(
    "resists a prototype toJSON payload leak for a $kind wrapper",
    ({ kind, create, revalidate, sentinel }) => {
      const validated = create();
      const originalBody = validated.body;
      const prototype = Object.getPrototypeOf(validated) ?? Object.prototype;

      withRestoredProperty(prototype, "toJSON", () => {
        Object.defineProperty(prototype, "toJSON", {
          configurable: true,
          value: () => ({ kind, body: validated.body, sentinel }),
        });

        expect(validated.body).toBe(originalBody);
        expect(revalidate(validated.body).kind).toBe(kind);
        expect(
          Reflect.defineProperty(validated, "toJSON", {
            value: () => ({ kind, body: validated.body, sentinel }),
          }),
        ).toBe(false);
        expect(Object.keys(validated)).toEqual(["kind"]);
        expect({ ...validated }).toEqual({ kind });
        expect(JSON.stringify(validated)).toBe(`{"kind":"${kind}"}`);
        expect(JSON.stringify(validated)).not.toContain(sentinel);
      });
    },
  );

  test.each([
    [
      "success",
      () =>
        validateCmsSuccessPayload(new Proxy(clone(homePayload), {})),
      "invalid_success_payload",
    ],
    [
      "error",
      () =>
        validateCmsErrorPayload(
          new Proxy(clone(errorPayloads.gdhe_not_found), {}),
        ),
      "invalid_error_payload",
    ],
    [
      "revoked success Proxy",
      () => {
        const revocable = Proxy.revocable(clone(homePayload), {});
        revocable.revoke();
        return validateCmsSuccessPayload(revocable.proxy);
      },
      "invalid_success_payload",
    ],
    [
      "revoked error Proxy",
      () => {
        const revocable = Proxy.revocable(
          clone(errorPayloads.gdhe_not_found),
          {},
        );
        revocable.revoke();
        return validateCmsErrorPayload(revocable.proxy);
      },
      "invalid_error_payload",
    ],
  ] as const)(
    "maps a non-clonable %s input to the stable contract error",
    (_name, validate, kind) => {
      const error = expectContractError(validate, kind);
      const exposed = `${String(error)} ${JSON.stringify(error)}`;

      expect(error.name).toBe("CmsContractError");
      expect(exposed).not.toContain("DataCloneError");
      expect(exposed).not.toContain("DOMException");
      expect(exposed).not.toContain("schemaPath");
      expect(exposed).not.toContain("TASK-007 A3");
    },
  );

  test("does not allow a plain structural object to satisfy the wrapper type", () => {
    // @ts-expect-error The module-private brand must reject structural forgery.
    const forged: ValidatedCmsPayload<"success"> = {
      kind: "success",
      body: homePayload,
    };

    expect(forged.kind).toBe("success");
  });

  test("keeps raw payload and Ajv diagnostics out of contract errors", () => {
    const sentinel =
      "https://user:credential@cms.internal.example/wp-json?cookie=secret";
    const payload = clone(homePayload) as Record<string, unknown>;
    payload.rawMeta = sentinel;

    const error = expectContractError(
      () => validateCmsSuccessPayload(payload),
      "invalid_success_payload",
    );
    const exposed = `${String(error)} ${JSON.stringify(error)} ${Object.keys(error).join(" ")}`;

    expect(exposed).not.toContain(sentinel);
    expect(exposed).not.toContain("schemaPath");
    expect(exposed).not.toContain("contracts.gdhe.local");
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      category: "contract",
      kind: "invalid_success_payload",
    });
  });

  test.each([
    ["public validator", "../src/lib/cms/server/validation"],
    ["deep registry", "../src/lib/cms/server/validation/registry"],
  ])("rejects a %s import from a real Client Component build", async (
    _label,
    modulePath,
  ) => {
    const unguardedBuild = await buildClientImport(modulePath, true);
    expect(unguardedBuild.status).toBe(0);

    const guardedBuild = await buildClientImport(modulePath, false);
    expect(guardedBuild.status).not.toBe(0);
    expect(guardedBuild.output).toMatch(/server-only|Client Component/i);
  }, 60_000);
});
