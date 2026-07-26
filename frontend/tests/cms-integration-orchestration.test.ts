import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";

import { afterEach, describe, expect, test } from "vitest";

import errorPayloads from "../src/lib/cms/contracts/samples/errors/resolve-errors.json";
import homePayload from "../src/lib/cms/contracts/samples/success/resolve-home.json";
import {
  CmsIntegrationConfigurationError,
  CmsIntegrationError,
  loadCmsIntegrationPage,
} from "../src/lib/cms/server/integration";
import {
  CmsContractError,
} from "../src/lib/cms/server/validation";
import {
  CmsProtocolError,
  CmsTransportError,
} from "../src/lib/cms/server";

type LoopbackObservation = {
  requestCount: number;
  requests: Array<{
    method: string | undefined;
    url: string | undefined;
    accept: string | undefined;
    authorization: string | undefined;
    cookie: string | undefined;
  }>;
};

type LoopbackHandler = (
  request: IncomingMessage,
  response: ServerResponse,
) => void;

const originalEnvironment = {
  enable: process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE,
  path: process.env.GDHE_CMS_INTEGRATION_PATH,
  wordpress: process.env.WORDPRESS_API_URL,
};

afterEach(() => {
  restoreEnvironment(
    "GDHE_ENABLE_CMS_INTEGRATION_PAGE",
    originalEnvironment.enable,
  );
  restoreEnvironment("GDHE_CMS_INTEGRATION_PATH", originalEnvironment.path);
  restoreEnvironment("WORDPRESS_API_URL", originalEnvironment.wordpress);
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

function jsonResponse(
  response: ServerResponse,
  status: number,
  body: unknown,
): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function withLoopbackServer<T>(
  handler: LoopbackHandler,
  assertion: (
    baseUrl: string,
    observation: LoopbackObservation,
  ) => Promise<T>,
): Promise<T> {
  const observation: LoopbackObservation = {
    requestCount: 0,
    requests: [],
  };
  const server = createServer((request, response) => {
    observation.requestCount += 1;
    observation.requests.push({
      method: request.method,
      url: request.url,
      accept: request.headers.accept,
      authorization: request.headers.authorization,
      cookie: request.headers.cookie,
    });
    handler(request, response);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new TypeError("Expected a loopback TCP address.");
  }

  try {
    return await assertion(
      `http://127.0.0.1:${address.port}/wp-json`,
      observation,
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

function enableIntegration(baseUrl: string, path = "/"): void {
  process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE = "1";
  process.env.GDHE_CMS_INTEGRATION_PATH = path;
  process.env.WORDPRESS_API_URL = baseUrl;
}

async function captureError(assertion: () => Promise<unknown>): Promise<Error> {
  try {
    await assertion();
    expect.unreachable("Expected integration loading to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    return error as Error;
  }
}

describe("CMS integration orchestration", () => {
  test.each([undefined, "", "0", "false", "true", "yes"])(
    "treats enable value %s as disabled without reading CMS configuration",
    async (value) => {
      restoreEnvironment("GDHE_ENABLE_CMS_INTEGRATION_PAGE", value);
      process.env.GDHE_CMS_INTEGRATION_PATH = "/INVALID/";
      delete process.env.WORDPRESS_API_URL;

      const result = await loadCmsIntegrationPage();

      expect(result).toEqual({ kind: "disabled" });
      expect(Object.isFrozen(result)).toBe(true);
    },
  );

  test.each([undefined, "", "/UPPER/", "/missing-tail", "/?path=/evil/"])(
    "rejects enabled integration path %s before fetch",
    async (path) => {
      process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE = "1";
      restoreEnvironment("GDHE_CMS_INTEGRATION_PATH", path);
      process.env.WORDPRESS_API_URL = "http://127.0.0.1:1/wp-json";

      const error = await captureError(loadCmsIntegrationPage);

      expect(error).toBeInstanceOf(CmsIntegrationConfigurationError);
      expect(error).toMatchObject({
        category: "configuration",
        kind: "invalid_integration_path",
      });
      if (path) {
        expect(`${error} ${JSON.stringify(error)}`).not.toContain(path);
      }
    },
  );

  test("performs one fixed request, validates and adapts the success body", async () => {
    await withLoopbackServer(
      (_request, response) => jsonResponse(response, 200, homePayload),
      async (baseUrl, observation) => {
        enableIntegration(baseUrl);

        const result = await (
          loadCmsIntegrationPage as unknown as (
            browserInput?: unknown,
          ) => ReturnType<typeof loadCmsIntegrationPage>
        )({ path: "/products/attacker/", cmsUrl: "https://attacker.test" });

        expect(result).toEqual({
          kind: "ready",
          page: {
            id: homePayload.id,
            apiVersion: "1",
            schemaVersion: "3.0.0",
            type: "page",
            templateKey: "standard",
            locale: "en",
            publicPath: "/",
            title: homePayload.title,
            excerpt: homePayload.excerpt,
            moduleCount: 1,
          },
        });
        expect(Object.isFrozen(result)).toBe(true);
        expect(result.kind === "ready" && Object.isFrozen(result.page)).toBe(
          true,
        );
        expect(loadCmsIntegrationPage.length).toBe(0);
        expect(observation.requestCount).toBe(1);
        expect(observation.requests).toEqual([
          {
            method: "GET",
            url: "/wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0",
            accept: "application/json",
            authorization: undefined,
            cookie: undefined,
          },
        ]);
      },
    );
  });

  test("keeps an invalid success body as a contract failure", async () => {
    await withLoopbackServer(
      (_request, response) =>
        jsonResponse(response, 200, { ...homePayload, title: "" }),
      async (baseUrl, observation) => {
        enableIntegration(baseUrl);

        const error = await captureError(loadCmsIntegrationPage);

        expect(error).toBeInstanceOf(CmsContractError);
        expect(error).toMatchObject({
          category: "contract",
          kind: "invalid_success_payload",
        });
        expect(observation.requestCount).toBe(1);
      },
    );
  });

  test("returns not_found only for an agreed validated 404 body", async () => {
    await withLoopbackServer(
      (_request, response) =>
        jsonResponse(response, 404, errorPayloads.gdhe_not_found),
      async (baseUrl) => {
        enableIntegration(baseUrl);

        const result = await loadCmsIntegrationPage();

        expect(result).toEqual({ kind: "not_found" });
        expect(Object.isFrozen(result)).toBe(true);
      },
    );
  });

  test.each([
    {
      name: "mismatched status",
      body: { ...errorPayloads.gdhe_not_found, status: 400 },
    },
    {
      name: "mismatched code",
      body: { ...errorPayloads.gdhe_not_found, code: "gdhe_other" },
    },
  ])("rejects a validated 404 with $name", async ({ body }) => {
    await withLoopbackServer(
      (_request, response) => jsonResponse(response, 404, body),
      async (baseUrl) => {
        enableIntegration(baseUrl);

        const error = await captureError(loadCmsIntegrationPage);

        expect(error).toBeInstanceOf(CmsIntegrationError);
        expect(error).toMatchObject({
          category: "integration",
          kind: "not_found_mismatch",
        });
      },
    );
  });

  test("keeps an unvalidated 404 as a contract failure", async () => {
    await withLoopbackServer(
      (_request, response) =>
        jsonResponse(response, 404, {
          ...errorPayloads.gdhe_not_found,
          requestId: "raw-secret",
        }),
      async (baseUrl) => {
        enableIntegration(baseUrl);

        const error = await captureError(loadCmsIntegrationPage);

        expect(error).toBeInstanceOf(CmsContractError);
        expect(error).toMatchObject({
          category: "contract",
          kind: "invalid_error_payload",
        });
        expect(`${error} ${JSON.stringify(error)}`).not.toContain("raw-secret");
      },
    );
  });

  test.each([400, 401, 403, 409, 429, 500, 502, 503])(
    "keeps HTTP %i as a stable non-404 integration failure",
    async (status) => {
      await withLoopbackServer(
        (_request, response) =>
          jsonResponse(response, status, {
            ...errorPayloads.gdhe_invalid_schema,
            code: "gdhe_upstream_error",
            message: "raw-body-secret",
            status,
          }),
        async (baseUrl) => {
          enableIntegration(baseUrl);

          const error = await captureError(loadCmsIntegrationPage);
          const exposed = `${error} ${JSON.stringify(error)}`;

          expect(error).toBeInstanceOf(CmsIntegrationError);
          expect(error).toMatchObject({
            category: "integration",
            kind: "http_error",
          });
          expect(exposed).not.toContain("raw-body-secret");
          expect(exposed).not.toContain(baseUrl);
        },
      );
    },
  );

  test("preserves invalid JSON as a non-404 protocol failure", async () => {
    await withLoopbackServer(
      (_request, response) => {
        response.writeHead(200, { "content-type": "application/json" });
        response.end("{");
      },
      async (baseUrl) => {
        enableIntegration(baseUrl);

        const error = await captureError(loadCmsIntegrationPage);

        expect(error).toBeInstanceOf(CmsProtocolError);
        expect(error).toMatchObject({
          category: "protocol",
          kind: "invalid_json",
        });
      },
    );
  });

  test(
    "preserves timeout as a non-404 transport failure",
    async () => {
      await withLoopbackServer(
        () => {},
        async (baseUrl) => {
          enableIntegration(baseUrl);

          const error = await captureError(loadCmsIntegrationPage);

          expect(error).toBeInstanceOf(CmsTransportError);
          expect(error).toMatchObject({
            category: "transport",
            kind: "timeout",
          });
        },
      );
    },
    7_000,
  );

  test("preserves network failure as non-404", async () => {
    process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE = "1";
    process.env.GDHE_CMS_INTEGRATION_PATH = "/";
    process.env.WORDPRESS_API_URL = "http://127.0.0.1:1/wp-json";

    const error = await captureError(loadCmsIntegrationPage);

    expect(error).toBeInstanceOf(CmsTransportError);
    expect(error).toMatchObject({
      category: "transport",
      kind: "network",
    });
  });
});
