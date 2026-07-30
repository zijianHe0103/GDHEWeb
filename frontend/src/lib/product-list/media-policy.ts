import "server-only";

const SYNTHETIC_FRONTEND_ORIGIN = new URL("https://frontend.invalid");

export function isSafeFrontendMediaPath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  try {
    if (decodeURI(value).includes("\\")) {
      return false;
    }

    const resolved = new URL(value, SYNTHETIC_FRONTEND_ORIGIN);
    return (
      resolved.origin === SYNTHETIC_FRONTEND_ORIGIN.origin &&
      resolved.username === "" &&
      resolved.password === ""
    );
  } catch {
    return false;
  }
}
