import "server-only";

import type {
  RelatedProductCardCollectionDto,
  RelatedProductCardCollectionDtoV2,
} from "../../types/related-product-card";
import type { PublicRelatedProduct } from "../../types/related-products";

const LOCAL_MEDIA = /^\/test-candidates\/[a-z0-9][a-z0-9._-]*$/i;

export function projectPublicRelatedProducts(
  collection: RelatedProductCardCollectionDto,
): readonly PublicRelatedProduct[] {
  const items: PublicRelatedProduct[] = [];
  for (const item of collection.items) {
    const { card } = item;
    if (!LOCAL_MEDIA.test(card.image.url)) continue;

    let action: PublicRelatedProduct["action"];
    if (
      card.kind === "detail_product" &&
      card.action.mode === "view_product" &&
      card.publicPath !== null &&
      card.action.targetPath === card.publicPath &&
      item.directQuote === null
    ) {
      action = { kind: "view", href: card.publicPath };
    } else if (
      card.kind === "catalog_accessory" &&
      card.lifecycle === "active" &&
      card.action.mode === "direct_rfq" &&
      item.directQuote?.kind === "catalog_accessory" &&
      item.directQuote.quantityUnit === "piece"
    ) {
      action = {
        kind: "quote",
        catalogPath: card.primaryCategory.publicPath,
        quantityUnit: "piece",
      };
    } else {
      continue;
    }

    items.push({
      key: `${action.kind}:${card.model}:${
        action.kind === "view" ? action.href : action.catalogPath
      }`,
      product: {
        model: card.model,
        name: card.name,
        image: {
          url: card.image.url,
          width: card.image.width,
          height: card.image.height,
          alt: card.image.alt,
        },
      },
      summary: card.summary,
      attributes: card.keyAttributes.slice(0, 2).map((attribute) => ({
        label: attribute.label,
        value: attribute.value,
        unit: attribute.unit,
      })),
      candidateNotice: "Protected TEST_CANDIDATE — not production product data",
      action,
    });
  }
  return deepFreeze(items);
}

export function projectPublicRelatedProductsV2(
  collection: RelatedProductCardCollectionDtoV2,
): readonly PublicRelatedProduct[] {
  const items: PublicRelatedProduct[] = [];
  for (const item of collection.items) {
    const { card } = item;
    if (!LOCAL_MEDIA.test(card.image.url)) continue;
    if (
      card.kind === "detail_product" &&
      card.action.mode === "view_product" &&
      card.publicPath !== null &&
      card.action.targetPath === card.publicPath &&
      item.directQuote === null
    ) {
      items.push(projectItem(card, { kind: "view", href: card.publicPath }));
      continue;
    }
    if (
      card.kind !== "catalog_accessory" ||
      card.lifecycle !== "active" ||
      card.action.mode !== "direct_rfq" ||
      item.directQuote?.kind !== "catalog_accessory" ||
      item.directQuote.quantityUnit !== "piece" ||
      !/^GDHEPRD[0-9]{6}$/.test(item.directQuote.articleNumber)
    ) continue;
    items.push(projectItem(card, {
      kind: "quote",
      catalogPath: card.primaryCategory.publicPath,
      articleNumber: item.directQuote.articleNumber,
      quantityUnit: "piece",
    }));
  }
  return deepFreeze(items);
}

function projectItem(
  card: RelatedProductCardCollectionDto["items"][number]["card"],
  action: PublicRelatedProduct["action"],
): PublicRelatedProduct {
  return {
    key: `${action.kind}:${card.model}:${
      action.kind === "view" ? action.href : action.catalogPath
    }`,
    product: {
      model: card.model,
      name: card.name,
      image: {
        url: card.image.url,
        width: card.image.width,
        height: card.image.height,
        alt: card.image.alt,
      },
    },
    summary: card.summary,
    attributes: card.keyAttributes.slice(0, 2).map((attribute) => ({
      label: attribute.label,
      value: attribute.value,
      unit: attribute.unit,
    })),
    candidateNotice: "Protected TEST_CANDIDATE — not production product data",
    action,
  };
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}
