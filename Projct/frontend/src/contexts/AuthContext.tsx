import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, UserRole } from "@/types";
import authService from "@/services/authService";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    role: null,
  });

  /** Attempt to restore the user session from localStorage. */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authService
      .getMe()
      .then((user) => {
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          role: user.role,
        });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const result = await authService.login({ email, password });
    localStorage.setItem("access_token", result.access_token);
    setState({
      user: result.user,
      isLoading: false,
      isAuthenticated: true,
      role: result.user.role,
    });
    return result.user;
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: UserRole,
    ) => {
      const result = await authService.register({
        email,
        password,
        displayName,
        role,
      });
      localStorage.setItem("access_token", result.access_token);
      setState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
        role: result.user.role,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("access_token");
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        role: null,
      });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((s) => ({ ...s, user, role: user.role }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context. Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
