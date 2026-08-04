import "server-only";

import type { ProductConfigurationV2Dto } from "../../../../types/product-configuration-v2";
import { validateCmsErrorPayload } from "../validation";
import { ProductConfigurationHttpError, ProductConfigurationProtocolError } from "../product-configurations/errors";
import { requestProductConfigurationV2 } from "../product-configurations/transport";
import { adaptProductConfigurationV2 } from "./adapter";
import { validateProductConfigurationV2 } from "./validation";

export async function loadProductConfigurationV2(callerSignal?: AbortSignal): Promise<ProductConfigurationV2Dto> {
  try {
    const outcome = await requestProductConfigurationV2(callerSignal);
    if (outcome.kind === "not_modified") throw new ProductConfigurationProtocolError("not_modified_without_cache");
    return adaptProductConfigurationV2(validateProductConfigurationV2(outcome.body));
  } catch (error) {
    if (!(error instanceof ProductConfigurationHttpError)) throw error;
    const validated = validateCmsErrorPayload(error.body);
    const body = validated.body as {status:number};
    if (body.status !== error.status) throw new ProductConfigurationProtocolError("error_status_mismatch");
    throw new ProductConfigurationHttpError(error.kind, error.status, error.metadata, undefined);
  }
}
