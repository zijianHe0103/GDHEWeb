import "server-only";

import type { RelatedProductCardCollectionDto } from "../../../../types/related-product-card";
import { validateCmsErrorPayload } from "../validation";
import { adaptRelatedProductCardCollection } from "./adapter";
import {
  RelatedProductCardHttpError,
  RelatedProductCardProtocolError,
} from "./errors";
import { requestRelatedProductCardCollection } from "./transport";
import { validateRelatedProductCardCollection } from "./validation";

export async function loadRelatedProductCardCollection(
  sourcePath: string,
  callerSignal?: AbortSignal,
): Promise<RelatedProductCardCollectionDto> {
  try {
    const outcome = await requestRelatedProductCardCollection(
      sourcePath,
      callerSignal,
    );
    if (outcome.kind === "not_modified") {
      throw new RelatedProductCardProtocolError("not_modified_without_cache");
    }
    return adaptRelatedProductCardCollection(
      validateRelatedProductCardCollection(outcome.body),
    );
  } catch (error) {
    if (!(error instanceof RelatedProductCardHttpError)) throw error;
    const validated = validateCmsErrorPayload(error.body);
    const body = validated.body as { status: number };
    if (body.status !== error.status) {
      throw new RelatedProductCardProtocolError("error_status_mismatch");
    }
    throw new RelatedProductCardHttpError(
      error.kind,
      error.status,
      error.metadata,
      undefined,
    );
  }
}
