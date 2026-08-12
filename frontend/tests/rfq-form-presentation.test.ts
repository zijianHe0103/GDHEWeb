import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import readyBasket from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json";
import requiresReadd from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/requires-readd.json";
import requiresValidation from "../src/lib/rfq-submission-contract/v2/samples/basket-v3/requires-validation.json";
import { RfqSubmissionPanel } from "../src/components/rfq-form/presentation";
import { rfqSubmissionResultMessage } from "../src/components/rfq-form";
import { normalizeRfqCustomer } from "../src/lib/rfq/customer";
import { QuoteBasketContent } from "../src/components/quote-basket";
import type { QuoteBasketDocumentV3 } from "../src/types/quote-basket-v3";

function render(
  basket: QuoteBasketDocumentV3 | null,
  options: Readonly<{ enabled?: boolean; storageError?: boolean }> = {},
): string {
  return renderToStaticMarkup(createElement(RfqSubmissionPanel, {
    basket,
    enabled: options.enabled ?? true,
    storageError: options.storageError ?? false,
    pending: false,
    errors: [],
    result: null,
    onSubmit: vi.fn(),
  }));
}

describe("TASK-028 visible RFQ form presentation", () => {
  test("renders the exact ordered accessible customer fields for a ready Basket", () => {
    const html = render(structuredClone(readyBasket) as QuoteBasketDocumentV3);
    const orderedLabels = [
      "Full Name",
      "Company Name",
      "Country/Region",
      "City",
      "WhatsApp",
      "WeChat",
      "Business Email",
      "Phone",
      "Company Website",
      "Additional Requirements",
    ];

    let cursor = -1;
    for (const label of orderedLabels) {
      const next = html.indexOf(`>${label}`);
      expect(next).toBeGreaterThan(cursor);
      cursor = next;
    }
    expect(html).toContain('id="rfq-full-name"');
    expect(html).toContain('name="fullName"');
    expect(html).toContain('autoComplete="name"');
    expect(html).toContain('id="rfq-company-name"');
    expect(html).toContain('autoComplete="organization"');
    expect(html).toContain('id="rfq-country-region"');
    expect(html).toContain('autoComplete="country-name"');
    expect(html).toContain('id="rfq-city"');
    expect(html).toContain('autoComplete="address-level2"');
    expect(html).toContain('id="rfq-business-email"');
    expect(html).toContain('type="email"');
    expect(html).toContain('inputMode="email"');
    expect(html).toContain('id="rfq-phone"');
    expect(html).toContain('type="tel"');
    expect(html).toContain('id="rfq-company-website"');
    expect(html).toContain('type="url"');
    expect(html.match(/ required=""/g)).toHaveLength(4);
    expect(html).toContain("At least one of WhatsApp, WeChat, Business Email or Phone is required.");
    expect(html).toContain("Local non-production Stub");
    expect(html).toContain('type="submit"');
    expect(html).not.toMatch(
      /article number|GDHEPRD|submissionIntent|idempotencyKey|writerId|mutationId|wordpress|wp-content|diagnostic/i,
    );
  });

  test("lets the exact Unicode code-point limit reach the authoritative customer normalizer", () => {
    const html = render(structuredClone(readyBasket) as QuoteBasketDocumentV3);
    const customerControls = html.match(
      /<(?:input|textarea)\b[^>]*\bname="(?:fullName|companyName|countryRegion|city|whatsApp|weChat|businessEmail|phone|companyWebsite|message)"[^>]*>/g,
    ) ?? [];

    expect(customerControls).toHaveLength(10);
    for (const control of customerControls) {
      expect(control).not.toMatch(/\bmaxlength=/i);
    }

    const exactLimit = "😀".repeat(120);
    expect(exactLimit).toHaveLength(240);
    const exact = normalizeRfqCustomer({
      fullName: exactLimit,
      companyName: "Example Contracting Ltd",
      countryRegion: "United States",
      city: "Seattle",
      whatsApp: "+1 202 555 0100",
    });
    expect(exact).toMatchObject({ ok: true });
    if (!exact.ok) expect.unreachable("Expected 120 Unicode code points to pass.");
    expect(exact.customer.fullName).toBe(exactLimit);

    expect(normalizeRfqCustomer({
      fullName: `${exactLimit}😀`,
      companyName: "Example Contracting Ltd",
      countryRegion: "United States",
      city: "Seattle",
      whatsApp: "+1 202 555 0100",
    })).toEqual({
      ok: false,
      errors: [{ field: "fullName", code: "too_long" }],
    });
  });

  test("does not expose an active submit control for blocked, empty, storage-error or disabled states", () => {
    const cases = [
      render(structuredClone(requiresValidation) as QuoteBasketDocumentV3),
      render(structuredClone(requiresReadd) as QuoteBasketDocumentV3),
      render(null),
      render(null, { storageError: true }),
      render(structuredClone(readyBasket) as QuoteBasketDocumentV3, { enabled: false }),
    ];

    for (const html of cases) expect(html).not.toContain('type="submit"');
    expect(cases[0]).toContain("refresh this saved configuration");
    expect(cases[1]).toContain("remove the saved accessory and add it again");
    expect(cases[2]).toContain("Add a ready product configuration");
    expect(cases[3]).toContain("unavailable in this browser");
    expect(cases[4]).toContain("Local RFQ submission is not enabled");
  });

  test("replaces the real ready-Basket placeholder while preserving blocked gating", () => {
    const state = {
      hydrated: true,
      error: null,
      announcement: "",
      setQuantity: vi.fn(),
      remove: vi.fn(),
    };
    const ready = renderToStaticMarkup(createElement(QuoteBasketContent, {
      ...state,
      basket: structuredClone(readyBasket) as QuoteBasketDocumentV3,
      submissionEnabled: true,
    }));
    const blocked = renderToStaticMarkup(createElement(QuoteBasketContent, {
      ...state,
      basket: structuredClone(requiresValidation) as QuoteBasketDocumentV3,
      submissionEnabled: true,
    }));

    expect(ready).toContain('name="fullName"');
    expect(ready).toContain('type="submit"');
    expect(ready).not.toContain("Final quote submission is not available yet");
    expect(blocked).not.toContain('type="submit"');
    expect(blocked).toContain("refresh this saved configuration");
  });

  test("associates closed field errors, exposes a focusable summary and disables mutable controls while pending", () => {
    const html = renderToStaticMarkup(createElement(RfqSubmissionPanel, {
      basket: structuredClone(readyBasket) as QuoteBasketDocumentV3,
      enabled: true,
      storageError: false,
      pending: true,
      errors: [
        { field: "fullName", code: "required" },
        { field: "contactMethods", code: "at_least_one_required" },
      ],
      result: "Please correct the highlighted fields.",
      onSubmit: vi.fn(),
    }));

    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('href="#rfq-full-name"');
    expect(html).toContain('href="#rfq-whatsapp"');
    expect(html).toContain('id="rfq-full-name-error"');
    expect(html).toContain('aria-describedby="rfq-full-name-error"');
    expect(html).toContain('id="rfq-contact-methods-error"');
    expect(html).toContain('aria-describedby="rfq-contact-guidance rfq-contact-methods-error"');
    expect(html.match(/<fieldset[^>]*disabled=""/g)).toHaveLength(3);
    expect(html).toContain('<button type="submit" disabled="">Submitting');
    expect(html.match(/aria-live="polite"/g)).toHaveLength(1);
  });

  test("renders all five empty-form repair errors with stable accessible targets", () => {
    const normalized = normalizeRfqCustomer({
      fullName: "",
      companyName: "",
      countryRegion: "",
      city: "",
      whatsApp: "",
      weChat: "",
      businessEmail: "",
      phone: "",
      companyWebsite: "",
      message: "",
    });
    if (normalized.ok) expect.unreachable("Expected empty-form errors.");
    const html = renderToStaticMarkup(createElement(RfqSubmissionPanel, {
      basket: structuredClone(readyBasket) as QuoteBasketDocumentV3,
      enabled: true,
      storageError: false,
      pending: false,
      errors: normalized.errors,
      result: "Please correct the highlighted fields.",
      onSubmit: vi.fn(),
    }));

    const messages = [
      "Full Name is required.",
      "Company Name is required.",
      "Country/Region is required.",
      "City is required.",
      "Enter at least one contact method.",
    ];
    let cursor = -1;
    for (const message of messages) {
      const next = html.indexOf(message, cursor + 1);
      expect(next).toBeGreaterThan(cursor);
      cursor = next;
    }
    expect(html).toContain('href="#rfq-full-name"');
    expect(html).toContain('href="#rfq-company-name"');
    expect(html).toContain('href="#rfq-country-region"');
    expect(html).toContain('href="#rfq-city"');
    expect(html).toContain('href="#rfq-whatsapp"');
    expect(html.match(/aria-invalid="true"/g)).toHaveLength(4);
    expect(html).toContain('aria-describedby="rfq-full-name-error"');
    expect(html).toContain('aria-describedby="rfq-company-name-error"');
    expect(html).toContain('aria-describedby="rfq-country-region-error"');
    expect(html).toContain('aria-describedby="rfq-city-error"');
    expect(html).toContain('aria-describedby="rfq-contact-guidance rfq-contact-methods-error"');
    expect(html).toContain('tabindex="-1"');
    expect(html).not.toMatch(/instancePath|schemaPath|Ajv|raw|diagnostic/i);
  });

  test("places one focusable local Privacy Policy target before submit without an external request", () => {
    const html = render(structuredClone(readyBasket) as QuoteBasketDocumentV3);
    const link = '<a href="#rfq-privacy-policy">Privacy Policy</a>';
    const target = 'id="rfq-privacy-policy"';
    const submit = '<button type="submit"';

    expect(html).toContain(link);
    expect(html).toContain(target);
    expect(html.indexOf(link)).toBeLessThan(html.indexOf(submit));
    expect(html.indexOf(target)).toBeLessThan(html.indexOf(submit));
    expect(html).toContain('id="rfq-privacy-policy" tabindex="-1"');
    expect(html).toContain("processed only by the local non-production Stub");
    expect(html).toContain("not sent to Feishu, CRM or email");
    expect(html).toContain("not stored in durable production storage");
    expect(html).not.toMatch(/href="https?:\/\//i);
    expect(html).not.toMatch(
      /article number|GDHEPRD|submissionIntent|idempotencyKey|writerId|mutationId|wp-content|diagnostic/i,
    );
  });

  test("keeps the nested Privacy Policy section within the form inline size", () => {
    const css = readFileSync(resolve(
      process.cwd(),
      "src/components/rfq-form/rfq-form.module.css",
    ), "utf8");

    expect(css).toMatch(
      /\.panel\s+form\s*>\s*section\s*\{[^}]*box-sizing:\s*border-box;[^}]*min-width:\s*0;[^}]*\}/,
    );
  });

  test("uses stable accepted-clear and retained-Basket copy for every closed public result", () => {
    const messages = [
      rfqSubmissionResultMessage({
        kind: "accepted_cleared",
        publicReference: "RFQ-23456789ABCD",
        basketRetained: false,
      }),
      rfqSubmissionResultMessage({
        kind: "accepted_basket_changed",
        publicReference: "RFQ-23456789ABCD",
        basketRetained: true,
      }),
      rfqSubmissionResultMessage({
        kind: "processing",
        publicReference: "RFQ-23456789ABCD",
        basketRetained: true,
      }),
      rfqSubmissionResultMessage({ kind: "basket_refresh_required", basketRetained: true }),
      rfqSubmissionResultMessage({ kind: "conflict", basketRetained: true }),
      rfqSubmissionResultMessage({ kind: "rate_or_security", basketRetained: true }),
      rfqSubmissionResultMessage({ kind: "temporary_unavailable", basketRetained: true }),
    ];

    expect(messages[0]).toContain("was cleared");
    expect(messages[1]).toContain("changed");
    expect(messages[1]).toContain("kept");
    expect(messages[2]).toContain("remains in this browser");
    for (const message of messages.slice(3)) expect(message).toContain("Quote Basket");
    expect(messages.join(" ")).not.toMatch(
      /submissionIntent|idempotencyKey|submittedBasketToken|GDHEPRD|writerId|mutationId|REQ-|diagnostic|wordpress|wp-content|feishu/i,
    );
  });
});
