import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  ProductListUnavailableState,
  ProductListView,
} from "../src/components/product-card";
import type {
  ProductCardCollectionDto,
  ProductCardDto,
} from "../src/types/product-card";

const baseCard: ProductCardDto = {
  id: "00000000-0000-4000-8000-000000000001",
  kind: "detail_product",
  model: "FGD X15+PVC",
  name: "FGD X15+PVC Track",
  publicPath: "/products/fgd-x15-pvc/",
  image: {
    id: "00000000-0000-4000-8000-000000000002",
    url: "/test-candidates/fgd-x15-protected.png",
    width: 800,
    height: 800,
    alt: "FGD X15 track cross-section with dimensions",
  },
  primaryCategory: {
    id: "00000000-0000-4000-8000-000000000003",
    label: "Manual Curtain Tracks",
    publicPath:
      "/products/curtain-track-systems/manual-curtain-tracks/",
  },
  series: [],
  applications: [],
  summary: "A protected local candidate for layout testing.",
  keyAttributes: [
    {
      key: "cross_section",
      label: "Cross-section",
      value: "28 × 27",
      unit: "mm",
    },
  ],
  lifecycle: "active",
  action: {
    mode: "view_product",
    label: "View Product",
    targetPath: "/products/fgd-x15-pvc/",
  },
  modifiedAt: "2026-07-30T00:00:00Z",
};

function collection(items: readonly ProductCardDto[]): ProductCardCollectionDto {
  return {
    apiVersion: "1",
    schemaVersion: "1.0.0",
    locale: "en",
    type: "product_card",
    sort: "modified_desc",
    filter: null,
    page: 1,
    perPage: 12,
    total: items.length,
    totalPages: items.length === 0 ? 0 : 1,
    items,
  };
}

describe("ProductCard presentation", () => {
  test("renders a distinct empty collection state", () => {
    const html = renderToStaticMarkup(
      createElement(ProductListView, {
        collection: collection([]),
        preview: false,
      }),
    );

    expect(html).toContain("No products are available in this test view.");
    expect(html).not.toContain("<article");
  });

  test("renders one DTO card and only its public fields", () => {
    const cardWithInternalInput = {
      ...baseCard,
      databaseId: 817,
      raw: "private-cms-payload",
      supplierCost: "secret-cost",
    } as ProductCardDto;
    const html = renderToStaticMarkup(
      createElement(ProductListView, {
        collection: collection([cardWithInternalInput]),
        preview: true,
      }),
    );

    expect(html.match(/<article/g)).toHaveLength(1);
    expect(html).toContain("Local test candidate — not production catalog");
    expect(html).toContain(baseCard.model);
    expect(html).toContain(baseCard.name);
    expect(html).toContain(baseCard.primaryCategory.label);
    expect(html).toContain(baseCard.summary);
    expect(html).toContain("Cross-section");
    expect(html).toContain("28 × 27");
    expect(html).toContain("mm");
    expect(html).toContain(baseCard.image.alt);
    expect(html).not.toContain("databaseId");
    expect(html).not.toContain("private-cms-payload");
    expect(html).not.toContain("secret-cost");
  });

  test("renders all four frozen action and lifecycle cells without recomputing them", () => {
    const detailDiscontinued: ProductCardDto = {
      ...baseCard,
      id: "00000000-0000-4000-8000-000000000011",
      model: "DETAIL-D",
      name: "Discontinued Detail",
      lifecycle: "discontinued",
    };
    const activeAccessory: ProductCardDto = {
      ...baseCard,
      id: "00000000-0000-4000-8000-000000000012",
      kind: "catalog_accessory",
      model: "ACCESSORY-A",
      name: "Active Accessory",
      publicPath: null,
      summary: null,
      keyAttributes: [],
      action: {
        mode: "direct_rfq",
        label: "Request a Quote",
        targetPath: "/request-a-quote/",
      },
    };
    const discontinuedAccessory: ProductCardDto = {
      ...activeAccessory,
      id: "00000000-0000-4000-8000-000000000013",
      model: "ACCESSORY-D",
      name: "Discontinued Accessory",
      lifecycle: "discontinued",
      action: {
        mode: "replacement_contact",
        label: "Contact Us for Replacement",
        targetPath: "/contact/",
      },
    };
    const html = renderToStaticMarkup(
      createElement(ProductListView, {
        collection: collection([
          baseCard,
          detailDiscontinued,
          activeAccessory,
          discontinuedAccessory,
        ]),
        preview: false,
      }),
    );

    expect(html.match(/<article/g)).toHaveLength(4);
    expect(html.match(/View Product/g)).toHaveLength(2);
    expect(html).toContain('href="/request-a-quote/"');
    expect(html).toContain("Request a Quote");
    expect(html).toContain('href="/contact/"');
    expect(html).toContain("Contact Us for Replacement");
    expect(
      html.match(/<p class="[^"]+">Discontinued<\/p>/g),
    ).toHaveLength(2);
    expect(html.match(/href="\/products\/fgd-x15-pvc\/"/g)).toHaveLength(6);
    expect(html).not.toContain('href="null"');
  });

  test("renders a closed unavailable state without error detail", () => {
    const html = renderToStaticMarkup(
      createElement(ProductListUnavailableState),
    );

    expect(html).toContain("Products are temporarily unavailable.");
    expect(html).not.toContain("WORDPRESS_API_URL");
    expect(html).not.toContain("wp-json");
  });
});
