import "server-only";

import { CmsConfigurationError } from "./errors";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function parseWordPressApiUrl(value: string | undefined): URL {
  if (!value) {
    throw new CmsConfigurationError("missing_base");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new CmsConfigurationError("invalid_base");
  }

  const isHttp = url.protocol === "http:";
  const isHttps = url.protocol === "https:";
  const hasSafeAuthority = url.username === "" && url.password === "";
  const hasSafeSuffix = url.search === "" && url.hash === "";
  const isRestBase = url.pathname === "/wp-json";
  const hasSafeTransport =
    isHttps ||
    (isHttp && LOOPBACK_HOSTS.has(url.hostname) && url.port !== "");

  if (
    !(isHttp || isHttps) ||
    !hasSafeAuthority ||
    !hasSafeSuffix ||
    !isRestBase ||
    !hasSafeTransport
  ) {
    throw new CmsConfigurationError("invalid_base");
  }

  return url;
}
