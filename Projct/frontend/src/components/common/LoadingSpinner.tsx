import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /** Optional text displayed below the spinner. */
  message?: string;
  /** Size of the spinner in pixels. */
  size?: number;
  /** Whether to take full-screen height. */
  fullPage?: boolean;
}

/**
 * A centered loading spinner with an optional message.
 */
export default function LoadingSpinner({
  message = "Loading...",
  size = 32,
  fullPage = false,
}: LoadingSpinnerProps) {
  const containerClass = fullPage
    ? "flex flex-col items-center justify-center min-h-screen"
    : "flex flex-col items-center justify-center py-16";

  return (
    <div className={containerClass}>
      <Loader2
        className="animate-spin text-primary-600"
        size={size}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
}
