import "server-only";

import type { PublicRelatedProduct } from "../../types/related-products";

const names = [
  "Ceiling Bracket",
  "Wall Bracket",
  "Track Connector",
  "End Stop",
  "Glider Set",
  "Curve Section",
  "Suspension Kit",
] as const;

export const previewRelatedProducts: readonly PublicRelatedProduct[] =
  Object.freeze(names.map((name, index) => Object.freeze({
    key: `test-candidate-${index + 1}`,
    product: Object.freeze({
      model: `TEST-${String(index + 1).padStart(2, "0")}`,
      name,
      image: Object.freeze({
        url: "/test-candidates/fgd-x15-protected.png",
        width: 800,
        height: 800,
        alt: `Protected test candidate ${name}`,
      }),
    }),
    summary: "Replaceable local recommendation candidate for layout testing.",
    attributes: Object.freeze([
      Object.freeze({ label: "Category", value: "Test candidate", unit: null }),
    ]),
    candidateNotice: "Protected TEST_CANDIDATE — not production product data" as const,
    action: index % 2 === 0
      ? Object.freeze({
          kind: "view" as const,
          href: `/products/test-candidate-${index + 1}/`,
        })
      : Object.freeze({
          kind: "quote" as const,
          catalogPath: "/products/accessories/test-candidates/",
          articleNumber: `GDHEPRD${String(900 + index).padStart(6, "0")}`,
          quantityUnit: "piece" as const,
        }),
  })));
