// ── Application constants ──────────────────────────────────────────────

/** Base URL for the backend API (from Vite env or default). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/** Supported languages in the application. */
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "fr", name: "French", nativeName: "Français" },
];

/** Application status display labels. */
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected",
  completed: "Completed",
};

/** Job status display labels. */
export const JOB_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  active: "Active",
  paused: "Paused",
  expired: "Expired",
  rejected: "Rejected",
};

/** Color mapping for application status badges. */
export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  interview: "bg-purple-100 text-purple-800",
  hired: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-800",
};

/** Default pagination size. */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum file upload size in bytes (10 MB). */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
