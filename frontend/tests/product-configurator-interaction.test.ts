import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyProductConfiguratorSubmission,
  createProductConfiguratorResultState,
  getProductConfiguratorFieldError,
  LatestQuoteLineSummary,
} from "../src/components/product-configurator";
import type {
  ProductConfigurationField,
  ProductConfigurationFormValues,
} from "../src/lib/product-configuration/build-quote-line";
import { previewProductConfiguration } from "../src/lib/product-configuration/preview";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProductConfigurator production interaction state", () => {
  it("creates no line and associates every builder-returned visible error", () => {
    const initial = createProductConfiguratorResultState();
    const invalid = applyProductConfiguratorSubmission(
      previewProductConfiguration,
      initial,
      {
        mode: "custom",
        customLength: "5.88",
        colorCode: "unknown",
        installationMethod: "",
        basePackaging: "",
        logoPrinting: "yes" as unknown as boolean,
        protectionArrangement: "unknown",
        quantity: "1.5",
      },
    );
    const invalidSelection = applyProductConfiguratorSubmission(
      previewProductConfiguration,
      initial,
      {
        mode: "standard",
        articleNumber: "GDHEPRD999999",
        installationMethod: "ceiling",
        basePackaging: "standard",
        logoPrinting: false,
        protectionArrangement: null,
        quantity: "1",
      },
    );

    expect(invalid.latestLine).toBeNull();
    expect(invalidSelection.latestLine).toBeNull();
    const returnedFields = new Set([
      ...invalid.errors,
      ...invalidSelection.errors,
    ]);
    expect(returnedFields).toEqual(
      new Set<ProductConfigurationField>([
        "selection",
        "customLength",
        "color",
        "installationMethod",
        "basePackaging",
        "logoPrinting",
        "protectionArrangement",
        "quantity",
      ]),
    );
    for (const field of returnedFields) {
      expect(getProductConfiguratorFieldError(field, [...returnedFields])).toEqual({
        invalid: true,
        describedBy: `${field}-error`,
        id: `${field}-error`,
        message: expect.any(String),
      });
      expect(
        getProductConfiguratorFieldError(field, [...returnedFields])?.message,
      ).not.toMatch(/schema|payload|wordpress|endpoint|diagnostic|GDHEPRD/i);
    }
  });

  it("replaces one standard result with one custom result without side effects", () => {
    const fetchSpy = vi.fn();
    const storageSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("localStorage", {
      getItem: storageSpy,
      setItem: storageSpy,
      removeItem: storageSpy,
      clear: storageSpy,
    });

    let state = createProductConfiguratorResultState();
    state = applyProductConfiguratorSubmission(
      previewProductConfiguration,
      state,
      standardValues,
    );
    expect(state.errors).toEqual([]);
    expect(state.latestLine?.selection.type).toBe("article_number");
    const standardLine = state.latestLine;
    const standardHtml = renderToStaticMarkup(
      createElement(LatestQuoteLineSummary, { line: state.latestLine! }),
    );
    expect(standardHtml).toContain("Standard Length");
    expect(standardHtml).toContain("Ceiling Mount");
    expect(standardHtml).toContain("Standard Packaging");

    state = applyProductConfiguratorSubmission(
      previewProductConfiguration,
      state,
      customValues,
    );
    expect(state.errors).toEqual([]);
    expect(state.latestLine).not.toBe(standardLine);
    expect(state.latestLine?.selection.type).toBe("custom_length");
    expect(Array.isArray(state.latestLine)).toBe(false);
    const customHtml = renderToStaticMarkup(
      createElement(LatestQuoteLineSummary, { line: state.latestLine! }),
    );
    expect(customHtml).toContain("Custom Length");
    expect(customHtml).toContain("Wall Mount");
    expect(customHtml).toContain("Carton Packaging");
    expect(customHtml).not.toContain("Standard Length");
    expect(customHtml).not.toMatch(
      /GDHEPRD|articleNumber|raw|payload|wordpress|diagnostic|saved|sent/i,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();
  });
});

const standardValues: ProductConfigurationFormValues = {
  mode: "standard",
  articleNumber: "GDHEPRD000172",
  installationMethod: "ceiling",
  basePackaging: "standard",
  logoPrinting: false,
  protectionArrangement: null,
  quantity: "2",
};

const customValues: ProductConfigurationFormValues = {
  mode: "custom",
  customLength: "5.8",
  colorCode: "ivory-white",
  installationMethod: "wall",
  basePackaging: "carton",
  logoPrinting: true,
  protectionArrangement: "single_bag",
  quantity: "1",
};
