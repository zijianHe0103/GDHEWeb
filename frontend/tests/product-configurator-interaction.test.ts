import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyProductConfiguratorSubmission,
  createProductConfiguratorResultState,
  getProductConfiguratorFieldError,
  LatestPublicQuoteDraftSummary,
} from "../src/components/product-configurator";
import { previewProductConfigurationV2 } from "../src/lib/product-configuration/v2/preview";
import { projectPublicProductConfigurator } from "../src/lib/product-configuration/v2/public-configurator";
import type { PublicProductConfiguratorField, PublicProductConfiguratorFormValues } from "../src/types/product-configurator";

const publicConfiguration = projectPublicProductConfigurator(
  previewProductConfigurationV2,
);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProductConfigurator production interaction state", () => {
  it("creates no draft and associates every builder-returned visible error", () => {
    const initial = createProductConfiguratorResultState();
    const invalid = applyProductConfiguratorSubmission(
      publicConfiguration,
      initial,
      {
        lengthChoice: "custom",
        customLength: "5.88",
        colorCode: "unknown",
        basePackaging: "",
        logoPrinting: false,
        protectionArrangement: "unknown",
        quantity: "1.5",
      },
    );
    const invalidSelection = applyProductConfiguratorSubmission(
      publicConfiguration,
      initial,
      {
        lengthChoice: "standard:999",
        colorCode: "ivory-white",
        basePackaging: "standard",
        logoPrinting: false,
        protectionArrangement: null,
        quantity: "1",
      },
    );

    expect(invalid.latestDraft).toBeNull();
    expect(invalidSelection.latestDraft).toBeNull();
    const returnedFields = new Set([
      ...invalid.errors,
      ...invalidSelection.errors,
    ]);
    expect(returnedFields).toEqual(
      new Set<PublicProductConfiguratorField>([
        "selection",
        "customLength",
        "color",
        "basePackaging",
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
      publicConfiguration,
      state,
      standardValues,
    );
    expect(state.errors).toEqual([]);
    expect(state.latestDraft?.selection.type).toBe("standard");
    const standardDraft = state.latestDraft;
    const standardHtml = renderToStaticMarkup(
      createElement(LatestPublicQuoteDraftSummary, { draft: state.latestDraft! }),
    );
    expect(standardHtml).toContain("Standard Length");
    expect(standardHtml).not.toContain("Installation");
    expect(standardHtml).toContain("Standard Packaging");

    state = applyProductConfiguratorSubmission(
      publicConfiguration,
      state,
      customValues,
    );
    expect(state.errors).toEqual([]);
    expect(state.latestDraft).not.toBe(standardDraft);
    expect(state.latestDraft?.selection.type).toBe("custom");
    expect(Array.isArray(state.latestDraft)).toBe(false);
    const customHtml = renderToStaticMarkup(
      createElement(LatestPublicQuoteDraftSummary, { draft: state.latestDraft! }),
    );
    expect(customHtml).toContain("Custom Length");
    expect(customHtml).not.toContain("Installation");
    expect(customHtml).toContain("Carton Packaging");
    expect(customHtml).not.toContain("Standard Length");
    expect(customHtml).not.toMatch(
      /GDHEPRD|articleNumber|raw|payload|wordpress|diagnostic|saved|sent/i,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();
  });
});

const standardValues: PublicProductConfiguratorFormValues = {
  lengthChoice: "standard:6",
  colorCode: "ivory-white",
  basePackaging: "standard-packaging",
  logoPrinting: false,
  protectionArrangement: null,
  quantity: "2",
};

const customValues: PublicProductConfiguratorFormValues = {
  lengthChoice: "custom",
  customLength: "5.8",
  colorCode: "ivory-white",
  basePackaging: "carton-packaging",
  logoPrinting: true,
  protectionArrangement: "single-piece-bagging",
  quantity: "1",
};
