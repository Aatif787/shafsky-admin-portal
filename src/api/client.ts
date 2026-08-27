/**
 * Centralized API Client with Single-Flight Token Refresh Mutex.
 *
 * Implements:
 * 1. Automatic Bearer Access Token injection from in-memory tokenStore.
 * 2. Automatic credentials: "include" for HttpOnly refresh cookie management.
 * 3. Single-Flight Mutex: Concurrent 401 responses share a single refresh request.
 * 4. Automatic retry on token expiration (max 1 retry per request).
 * 5. Clean session termination when refresh fails.
 */

import { buildApiUrl } from "./config";
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth/tokenStore";
import type { ApiResponse, AuthResponseData } from "../types/auth";

type RefreshPromise = Promise<string | null>;
let activeRefreshPromise: RefreshPromise | null = null;
let onSessionExpiredCallback: (() => void) | null = null;

export function registerSessionExpiredCallback(callback: () => void) {
  onSessionExpiredCallback = callback;
}

/**
 * Executes a single-flight token refresh call against POST /api/auth/refresh.
 * Multiple simultaneous 401 callers await the same active promise.
 */
export async function executeSingleFlightRefresh(): Promise<string | null> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const refreshUrl = buildApiUrl("/api/auth/refresh");
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include", // Sends HttpOnly refreshToken cookie automatically
      });

      if (!res.ok) {
        clearAccessToken();
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
        return null;
      }

      const json = (await res.json()) as ApiResponse<AuthResponseData>;
      const newAccessToken = json.data?.accessToken;

      if (!json.success || !newAccessToken) {
        clearAccessToken();
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
        return null;
      }

      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch {
      clearAccessToken();
      if (onSessionExpiredCallback) {
        onSessionExpiredCallback();
      }
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
  _isRetry?: boolean;
}

/**
 * Primary Fetch wrapper with automatic RS256 token attachment,
 * single-flight refresh on 401, and 1-time retry.
 */
export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = buildApiUrl(path);
  const headers = new Headers(options.headers || {});

  headers.set("ngrok-skip-browser-warning", "true");

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const fetchInit: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Always include cookies for FastAPI session tracking
  };

  try {
    const response = await fetch(url, fetchInit);

    // If 401 Unauthorized, attempt single-flight token refresh and retry ONCE
    if (response.status === 401 && !options.skipAuth && !options._isRetry) {
      const newToken = await executeSingleFlightRefresh();

      if (newToken) {
        // Retry the original request with the new access token
        return apiFetch<T>(path, {
          ...options,
          _isRetry: true,
        });
      }

      return {
        data: null,
        error: "Session expired. Please sign in again.",
        status: 401,
      };
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorMessage = errJson.detail || errJson.error || errJson.message || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const json = await response.json();
    return {
      data: (json.data !== undefined ? json.data : json) as T,
      error: null,
      status: response.status,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "Unable to reach server. Please check network connection.",
      status: 0,
    };
  }
}
