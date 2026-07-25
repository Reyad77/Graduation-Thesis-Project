import api from "./api";
import type { TokenResponse, User } from "@/types";

/**
 * Authentication service — wraps all auth-related API calls.
 */
const authService = {
  /** Register a new user account. */
  register: async (payload: {
    email: string;
    password: string;
    displayName: string;
    role: string;
    phone?: string;
    preferredLanguage?: string;
  }): Promise<TokenResponse> => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  /** Login with email and password. */
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<TokenResponse> => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  /** Logout the current user. */
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  /** Get the currently authenticated user's profile. */
  getMe: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  /** Request a password-reset email. */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  /** Reset password with a token. */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post("/auth/reset-password", { token, new_password: newPassword });
  },
};

export default authService;
