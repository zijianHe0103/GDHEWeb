import { once } from "node:events";
import { createServer } from "node:http";

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

import homePayload from "../src/lib/cms/contracts/samples/success/resolve-home.json";
import CmsIntegrationPage, {
  dynamic,
  metadata,
} from "../src/app/integration/cms/page";

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

describe("/integration/cms technical route", () => {
  test("maps a disabled integration page to the framework 404", async () => {
    delete process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE;
    delete process.env.GDHE_CMS_INTEGRATION_PATH;
    delete process.env.WORDPRESS_API_URL;

    const error = await capturePageError();

    expect(error).toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });

  test("renders only the fixed server-owned technical DTO", async () => {
    let requestUrl = "";
    const server = createServer((request, response) => {
      requestUrl = request.url ?? "";
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(homePayload));
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new TypeError("Expected a loopback TCP address.");
    }

    try {
      process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE = "1";
      process.env.GDHE_CMS_INTEGRATION_PATH = "/";
      process.env.WORDPRESS_API_URL =
        `http://127.0.0.1:${address.port}/wp-json`;

      const element = await (
        CmsIntegrationPage as unknown as (
          browserInput?: unknown,
        ) => ReturnType<typeof CmsIntegrationPage>
      )({
        searchParams: {
          path: "/products/attacker/",
          cmsUrl: "https://attacker.test",
        },
      });
      const html = renderToStaticMarkup(element);

      expect(CmsIntegrationPage.length).toBe(0);
      expect(requestUrl).toBe(
        "/wp-json/gdhe/v1/resolve?locale=en&path=%2F&schema=3.0.0",
      );
      expect(html).toContain("CMS integration is connected");
      expect(html).toContain(homePayload.title);
      expect(html).toContain("page");
      expect(html).toContain("standard");
      expect(html).toContain("3.0.0");
      expect(html).toContain("Module count");
      expect(html).not.toContain("safeHtml");
      expect(html).not.toContain(homePayload.modules[0].data.safeHtml);
      expect(html).not.toContain(process.env.WORDPRESS_API_URL);
      expect(html).not.toContain("attacker.test");
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
  });

  test("exports noindex and nofollow metadata", () => {
    expect(metadata).toMatchObject({
      robots: {
        index: false,
        follow: false,
      },
    });
  });

  test("reads the server-only gate at request time", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});

async function capturePageError(): Promise<Error & { digest?: string }> {
  try {
    await CmsIntegrationPage();
    expect.unreachable("Expected the route to call notFound().");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    return error as Error & { digest?: string };
  }
}
