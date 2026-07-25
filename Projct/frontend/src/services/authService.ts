import api from "./api";
import type { User } from "@/types";

export interface AuthResult {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

/**
 * Authentication service — wraps all auth-related API calls.
 */
const authService = {
  /** Register a new user account. Returns token + user profile. */
  register: async (payload: {
    email: string;
    password: string;
    displayName: string;
    role: string;
    phone?: string;
    preferredLanguage?: string;
  }): Promise<AuthResult> => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  /** Login with email and password. Returns token + user profile. */
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<AuthResult> => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  /** Logout the current user (server-side cleanup). */
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  /** Get the currently authenticated user's profile. */
  getMe: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  /** Request a password-reset email. */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  /** Refresh the access token. */
  refreshToken: async (): Promise<{ access_token: string; token_type: string; expires_in: number }> => {
    const { data } = await api.post("/auth/refresh-token");
    return data;
  },
};

export default authService;
