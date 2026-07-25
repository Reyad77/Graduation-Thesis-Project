import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  /** If provided, only users with this role can access the route. */
  allowedRole?: UserRole;
  /** If true, renders children directly instead of <Outlet />. */
  children?: React.ReactNode;
}

/**
 * Route guard that checks authentication and optional role.
 *
 * - Not authenticated → redirect to /login
 * - Wrong role → redirect to /
 * - Loading → show spinner
 * - Authenticated + correct role → render children / <Outlet />
 */
export default function ProtectedRoute({
  allowedRole,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
