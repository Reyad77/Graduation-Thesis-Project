import axios from "axios";

/**
 * Extract a human-readable message from an API error.
 *
 * Prefers the backend's `detail` field (FastAPI HTTPException messages like
 * "Incorrect password." or "An account with this email already exists.").
 * Falls back to `networkFallback` when the server could not be reached at
 * all (e.g. the backend isn't running), and to `fallback` otherwise.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  networkFallback?: string,
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return networkFallback ?? fallback;
    }
    const detail = (error.response.data as { detail?: unknown } | undefined)
      ?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }
  return fallback;
}
