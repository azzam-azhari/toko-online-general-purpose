const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function isSafeEntityStoragePath(path: string, entityId: string) {
  const normalizedPath = path.trim();
  if (
    normalizedPath.length === 0
    || normalizedPath.length > 1024
    || normalizedPath.startsWith("/")
    || normalizedPath.includes("\\")
    || CONTROL_CHARACTER_PATTERN.test(normalizedPath)
    || !normalizedPath.startsWith(`${entityId}/`)
  ) {
    return false;
  }

  return normalizedPath
    .split("/")
    .every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

export function getSafeEntityStoragePaths(paths: readonly string[], entityId: string) {
  return [...new Set(
    paths
      .map((path) => path.trim())
      .filter((path) => isSafeEntityStoragePath(path, entityId)),
  )];
}
