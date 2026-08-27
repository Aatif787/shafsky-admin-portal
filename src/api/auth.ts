import { apiFetch, executeSingleFlightRefresh } from "./client";
import { buildApiUrl } from "./config";
import { setAccessToken, clearAccessToken } from "../auth/tokenStore";
import type { ApiResponse, AuthResponseData, AuthUser } from "../types/auth";

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Authenticates against POST /api/auth/login.
 * Saves the received access token in memory; refresh token is saved by backend cookie.
 */
export async function loginApi(email: string, password: string): Promise<LoginResult> {
  try {
    const url = buildApiUrl("/api/auth/login");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    if (!res.ok) {
      let errorMsg = "Invalid email or password.";
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.error || errorMsg;
      } catch {
        // Use standard error message on parse error
      }
      return { success: false, error: errorMsg };
    }

    const json = (await res.json()) as ApiResponse<AuthResponseData>;
    const token = json.data?.accessToken;
    const user = json.data?.user;

    if (!json.success || !token || !user) {
      return { success: false, error: json.error || "Authentication failed. Invalid response from server." };
    }

    // Set in-memory token
    setAccessToken(token);

    return {
      success: true,
      user,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Server connectivity error. Please check if the backend is running.",
    };
  }
}

/**
 * Restores session via POST /api/auth/refresh and GET /api/auth/me
 */
export async function restoreSessionApi(): Promise<AuthUser | null> {
  const token = await executeSingleFlightRefresh();
  if (!token) {
    return null;
  }

  // Fetch current user details
  const { data, error } = await apiFetch<any>("/api/auth/me");
  if (error || !data) {
    clearAccessToken();
    return null;
  }

  const user = data.user || data;
  return {
    id: user.id || user.user_id || "",
    email: user.email || "",
    role: (user.role || "").toUpperCase(),
    fullName: user.fullName || user.full_name || (user.email ? user.email.split("@")[0].toUpperCase() : "OPERATOR"),
    isVerified: user.isVerified || user.is_verified || true,
  };
}

/**
 * Logs out via POST /api/auth/logout and clears in-memory state.
 */
export async function logoutApi(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
    });
  } catch {
    // Ignore network error on logout
  } finally {
    clearAccessToken();
  }
}

/**
 * Fetches user profile from GET /api/auth/me.
 */
export async function getMeApi(): Promise<AuthUser | null> {
  const { data, error } = await apiFetch<any>("/api/auth/me");
  if (error || !data) {
    return null;
  }

  const user = data.user || data;
  return {
    id: user.id || user.user_id || "",
    email: user.email || "",
    role: (user.role || "").toUpperCase(),
    fullName: user.fullName || user.full_name || (user.email ? user.email.split("@")[0].toUpperCase() : "OPERATOR"),
    isVerified: user.isVerified || user.is_verified || true,
  };
}
