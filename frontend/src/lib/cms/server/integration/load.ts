import "server-only";

import type { CmsIntegrationPageDto } from "../../../../types/cms-integration";
import { adaptCmsIntegrationPage } from "../adapter/cms-integration-page";
import { CmsHttpError, resolveCmsPath } from "..";
import {
  validateCmsErrorPayload,
  validateCmsSuccessPayload,
} from "../validation";
import { readCmsIntegrationConfig } from "./config";
import { CmsIntegrationError } from "./errors";

export type CmsIntegrationPageResult =
  | Readonly<{ kind: "disabled" }>
  | Readonly<{ kind: "not_found" }>
  | Readonly<{ kind: "ready"; page: CmsIntegrationPageDto }>;

type ValidatedErrorView = {
  code: string;
  status: number;
};

export async function loadCmsIntegrationPage(): Promise<CmsIntegrationPageResult> {
  const config = readCmsIntegrationConfig();
  if (!config.enabled) {
    return Object.freeze({ kind: "disabled" });
  }

  try {
    const response = await resolveCmsPath(config.publicPath);
    const validated = validateCmsSuccessPayload(response.body);
    return Object.freeze({
      kind: "ready",
      page: adaptCmsIntegrationPage(validated),
    });
  } catch (error) {
    if (!(error instanceof CmsHttpError)) {
      throw error;
    }

    const validated = validateCmsErrorPayload(error.body);
    const body = validated.body as ValidatedErrorView;
    if (
      error.kind === "not_found" &&
      error.status === 404 &&
      body.status === 404 &&
      body.code === "gdhe_not_found"
    ) {
      return Object.freeze({ kind: "not_found" });
    }
    if (error.status === 404) {
      throw new CmsIntegrationError("not_found_mismatch");
    }
    throw new CmsIntegrationError("http_error");
  }
}
