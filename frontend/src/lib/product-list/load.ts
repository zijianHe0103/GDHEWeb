import "server-only";

import type { ProductCardCollectionDto } from "../../types/product-card";
import { loadProductCardCollection } from "../cms/server/product-cards";
import { readProductListMode } from "./config";
import { isSafeFrontendMediaPath } from "./media-policy";
import { previewProductCardCollection } from "./preview";

export type ProductListPageState =
  | Readonly<{ kind: "disabled" }>
  | Readonly<{
      kind: "ready";
      collection: ProductCardCollectionDto;
      preview: boolean;
    }>
  | Readonly<{ kind: "unavailable" }>;

export async function loadProductListPage(): Promise<ProductListPageState> {
  const mode = readProductListMode();
  if (mode === "disabled") {
    return { kind: "disabled" };
  }
  if (mode === "preview") {
    return {
      kind: "ready",
      collection: previewProductCardCollection,
      preview: true,
    };
  }

  try {
    const collection = await loadProductCardCollection({
      page: 1,
      perPage: 12,
      sort: "modified_desc",
    });
    if (
      collection.items.length > 0 &&
      collection.items.some(
        (card) => !isSafeFrontendMediaPath(card.image.url),
      )
    ) {
      return { kind: "unavailable" };
    }

    return {
      kind: "ready",
      collection,
      preview: false,
    };
  } catch {
    return { kind: "unavailable" };
  }
}
