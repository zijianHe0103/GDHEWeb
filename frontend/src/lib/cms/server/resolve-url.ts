import "server-only";

import { CmsConfigurationError } from "./errors";

const PUBLIC_PATH_PATTERN =
  /^\/$|^\/(?:[a-z0-9](?:[a-z0-9-]{0,62})\/)+$/;

export function validateCanonicalPublicPath(path: string): string {
  if (path.length > 500 || !PUBLIC_PATH_PATTERN.test(path)) {
    throw new CmsConfigurationError("invalid_path");
  }

  return path;
}

export function buildResolveUrl(base: URL, publicPath: string): URL {
  const url = new URL(`${base.pathname}/gdhe/v1/resolve`, base);
  url.searchParams.set("locale", "en");
  url.searchParams.set("path", validateCanonicalPublicPath(publicPath));
  url.searchParams.set("schema", "3.0.0");
  return url;
}
