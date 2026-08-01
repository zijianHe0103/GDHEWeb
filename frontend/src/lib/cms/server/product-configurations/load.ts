import "server-only";

import type { ProductConfigurationDto } from "../../../../types/product-configuration";
import { validateCmsErrorPayload } from "../validation";
import { adaptProductConfiguration } from "./adapter";
import {
  ProductConfigurationHttpError,
  ProductConfigurationProtocolError,
} from "./errors";
import { requestProductConfiguration } from "./transport";
import { validateProductConfiguration } from "./validation";

export async function loadProductConfiguration(
  callerSignal?: AbortSignal,
): Promise<ProductConfigurationDto> {
  try {
    const outcome = await requestProductConfiguration(callerSignal);
    if (outcome.kind === "not_modified") {
      throw new ProductConfigurationProtocolError("not_modified_without_cache");
    }
    return adaptProductConfiguration(
      validateProductConfiguration(outcome.body),
    );
  } catch (error) {
    if (!(error instanceof ProductConfigurationHttpError)) {
      throw error;
    }
    const validated = validateCmsErrorPayload(error.body);
    const body = validated.body as { status: number };
    if (body.status !== error.status) {
      throw new ProductConfigurationProtocolError("error_status_mismatch");
    }
    throw new ProductConfigurationHttpError(
      error.kind,
      error.status,
      error.metadata,
      undefined,
    );
  }
}
