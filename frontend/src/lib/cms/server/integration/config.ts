import "server-only";

import { validateCanonicalPublicPath } from "../resolve-url";
import { CmsIntegrationConfigurationError } from "./errors";

export type CmsIntegrationConfig =
  | Readonly<{ enabled: false }>
  | Readonly<{ enabled: true; publicPath: string }>;

export function readCmsIntegrationConfig(): CmsIntegrationConfig {
  if (process.env.GDHE_ENABLE_CMS_INTEGRATION_PAGE !== "1") {
    return Object.freeze({ enabled: false });
  }

  const configuredPath = process.env.GDHE_CMS_INTEGRATION_PATH;
  if (!configuredPath) {
    throw new CmsIntegrationConfigurationError("invalid_integration_path");
  }

  try {
    return Object.freeze({
      enabled: true,
      publicPath: validateCanonicalPublicPath(configuredPath),
    });
  } catch {
    throw new CmsIntegrationConfigurationError("invalid_integration_path");
  }
}
