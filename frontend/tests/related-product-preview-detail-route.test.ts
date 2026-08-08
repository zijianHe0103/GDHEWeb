import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, test, vi } from "vitest";

import TestCandidateOnePage, {
  dynamic,
  metadata,
} from "../src/app/products/test-candidate-1/page";
import TestCandidateThreePage from "../src/app/products/test-candidate-3/page";
import TestCandidateFivePage from "../src/app/products/test-candidate-5/page";
import TestCandidateSevenPage from "../src/app/products/test-candidate-7/page";
import { renderPreviewRelatedProductDetail } from "../src/lib/related-products/preview-detail-page";

const originalMode = process.env.GDHE_PRODUCT_DETAIL_MODE;

afterEach(() => {
  if (originalMode === undefined) {
    delete process.env.GDHE_PRODUCT_DETAIL_MODE;
  } else {
    process.env.GDHE_PRODUCT_DETAIL_MODE = originalMode;
  }
  vi.unstubAllGlobals();
});

describe("preview TEST_CANDIDATE detail landing", () => {
  test.each([
    [TestCandidateOnePage, "Ceiling Bracket"],
    [TestCandidateThreePage, "Track Connector"],
    [TestCandidateFivePage, "Glider Set"],
    [TestCandidateSevenPage, "Suspension Kit"],
  ])("renders the declared %s detail candidate without network", async (slug, name) => {
    let requests = 0;
    vi.stubGlobal("fetch", async () => {
      requests += 1;
      throw new Error("Preview candidate detail must not fetch.");
    });
    process.env.GDHE_PRODUCT_DETAIL_MODE = "preview";

    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        slug(),
      ),
    );

    expect(html).toContain(`>${name}</h1>`);
    expect(html).toContain("Protected TEST_CANDIDATE");
    expect(html).toContain("not production product data");
    expect(html).toContain("%2Ftest-candidates%2Ffgd-x15-protected.png");
    expect(html).toContain("navigation preview only");
    expect(html).not.toMatch(
      /article number|productCode|product UUID|media UUID|wp-content|wordpress|feishu|price|payment|checkout|add to quote|buy/i,
    );
    expect(requests).toBe(0);
  });

  test.each([
    "test-candidate-2",
    "test-candidate-4",
    "test-candidate-6",
    "test-candidate-8",
    "accessories",
    "unknown-product",
  ])("keeps undeclared or catalog candidate %s at framework 404", async (slug) => {
    let requests = 0;
    vi.stubGlobal("fetch", async () => {
      requests += 1;
      throw new Error("Rejected candidate detail must not fetch.");
    });
    process.env.GDHE_PRODUCT_DETAIL_MODE = "preview";

    await expect(
      Promise.resolve().then(() => renderPreviewRelatedProductDetail(slug)),
    ).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(requests).toBe(0);
  });

  test.each([undefined, "disabled", "cms"])(
    "keeps mode %s at framework 404 without CMS requests",
    async (mode) => {
      let requests = 0;
      vi.stubGlobal("fetch", async () => {
        requests += 1;
        throw new Error("Closed candidate mode must not fetch.");
      });
      if (mode === undefined) {
        delete process.env.GDHE_PRODUCT_DETAIL_MODE;
      } else {
        process.env.GDHE_PRODUCT_DETAIL_MODE = mode;
      }

      await expect(
        Promise.resolve().then(() => TestCandidateOnePage()),
      ).rejects.toMatchObject({ digest: expect.stringContaining("404") });
      expect(requests).toBe(0);
    },
  );

  test("exports force-dynamic noindex metadata", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(metadata).toMatchObject({
      robots: { index: false, follow: false },
    });
  });

  test("constrains semantic content, protected media and text at 768/390/320", async () => {
    const source = await readFile(
      new URL(
        "../src/lib/related-products/preview-detail-page.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    const css = await readFile(
      new URL(
        "../src/lib/related-products/preview-detail-page.module.css",
        import.meta.url,
      ),
      "utf8",
    ).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return "";
      throw error;
    });

    expect(source).toContain(
      'import styles from "./preview-detail-page.module.css"',
    );
    expect(source).toContain('<main className={styles.main}>');
    expect(source).toContain('<article className={styles.content}>');
    expect(source).toContain('className={styles.image}');
    expect(css).toMatch(
      /\.main\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*\}/,
    );
    expect(css).toMatch(
      /\.content\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*100%;[^}]*max-width:\s*50rem;[^}]*min-width:\s*0;[^}]*\}/,
    );
    expect(css).toMatch(
      /\.image\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*height:\s*auto;[^}]*\}/,
    );
    expect(css).toMatch(
      /\.content h1,\s*\.content p\s*\{[^}]*max-width:\s*100%;[^}]*overflow-wrap:\s*break-word;[^}]*\}/,
    );
    expect(css).not.toMatch(/overflow:\s*(?:hidden|clip)/);
  });
});
