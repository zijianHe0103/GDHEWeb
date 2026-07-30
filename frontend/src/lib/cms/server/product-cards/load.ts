import "server-only";

import type { ProductCardCollectionDto } from "../../../../types/product-card";
import { validateCmsErrorPayload } from "../validation";
import { adaptProductCardCollection } from "./adapter";
import {
  ProductCardHttpError,
  ProductCardProtocolError,
} from "./errors";
import {
  requestProductCardCollection,
  type ProductCardCollectionQuery,
} from "./transport";
import { validateProductCardCollection } from "./validation";

export async function loadProductCardCollection(
  query: ProductCardCollectionQuery = {},
  callerSignal?: AbortSignal,
): Promise<ProductCardCollectionDto> {
  try {
    const outcome = await requestProductCardCollection(query, callerSignal);
    if (outcome.kind === "not_modified") {
      throw new ProductCardProtocolError("not_modified_without_cache");
    }
    return adaptProductCardCollection(
      validateProductCardCollection(outcome.body),
    );
  } catch (error) {
    if (!(error instanceof ProductCardHttpError)) {
      throw error;
    }

    const validated = validateCmsErrorPayload(error.body);
    const body = validated.body as { status: number };
    if (body.status !== error.status) {
      throw new ProductCardProtocolError("error_status_mismatch");
    }
    throw new ProductCardHttpError(
      error.kind,
      error.status,
      error.metadata,
      undefined,
    );
  }
}
