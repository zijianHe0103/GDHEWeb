import "server-only";

import type {
  ProductCardActionDto,
  ProductCardAttributeDto,
  ProductCardCollectionDto,
  ProductCardDto,
  ProductCardImageDto,
  ProductCardTaxonomyRefDto,
} from "../../../../types/product-card";
import {
  validateProductCardCollection,
  type ValidatedProductCardCollection,
} from "./validation";

type ProductCardCollectionView = ProductCardCollectionDto;

function copyImage(image: ProductCardImageDto): ProductCardImageDto {
  return {
    id: image.id,
    url: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
  };
}

function copyTaxonomy(
  reference: ProductCardTaxonomyRefDto,
): ProductCardTaxonomyRefDto {
  return {
    id: reference.id,
    label: reference.label,
    publicPath: reference.publicPath,
  };
}

function copyAttribute(
  attribute: ProductCardAttributeDto,
): ProductCardAttributeDto {
  return {
    key: attribute.key,
    label: attribute.label,
    value: attribute.value,
    unit: attribute.unit,
  };
}

function copyAction(action: ProductCardActionDto): ProductCardActionDto {
  return {
    mode: action.mode,
    label: action.label,
    targetPath: action.targetPath,
  } as ProductCardActionDto;
}

function copyCard(card: ProductCardDto): ProductCardDto {
  return {
    id: card.id,
    kind: card.kind,
    model: card.model,
    name: card.name,
    publicPath: card.publicPath,
    image: copyImage(card.image),
    primaryCategory: copyTaxonomy(card.primaryCategory),
    series: card.series.map(copyTaxonomy),
    applications: card.applications.map(copyTaxonomy),
    summary: card.summary,
    keyAttributes: card.keyAttributes.map(copyAttribute),
    lifecycle: card.lifecycle,
    action: copyAction(card.action),
    modifiedAt: card.modifiedAt,
  };
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const child of Object.values(value)) {
    deepFreeze(child, seen);
  }
  return Object.freeze(value);
}

export function adaptProductCardCollection(
  validated: ValidatedProductCardCollection,
): ProductCardCollectionDto {
  const body = validateProductCardCollection.getValidatedBody(
    validated,
  ) as ProductCardCollectionView;

  return deepFreeze({
    apiVersion: body.apiVersion,
    schemaVersion: body.schemaVersion,
    locale: body.locale,
    type: body.type,
    sort: body.sort,
    filter: body.filter,
    page: body.page,
    perPage: body.perPage,
    total: body.total,
    totalPages: body.totalPages,
    items: body.items.map(copyCard),
  });
}
