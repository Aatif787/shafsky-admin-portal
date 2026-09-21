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

import { buildApiUrl, isNgrokBackend } from "./config";
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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      // Only for ngrok free-tier interstitial — sending this on Render/prod
      // causes CORS preflight 400 when the header is not allowlisted.
      if (isNgrokBackend()) {
        headers["ngrok-skip-browser-warning"] = "true";
      }
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers,
        credentials: "include",
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

  if (isNgrokBackend()) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

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
    credentials: "include",
  };

  try {
    const response = await fetch(url, fetchInit);

    if (response.status === 401 && !options.skipAuth && !options._isRetry) {
      const newToken = await executeSingleFlightRefresh();

      if (newToken) {
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
        const detail = errJson.detail;
        if (typeof detail === "string" && detail.trim()) {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail
            .map((e: { msg?: string; loc?: unknown; message?: string } | string) => {
              if (typeof e === "string") return e;
              const loc = Array.isArray(e.loc) ? e.loc.slice(1).join(".") : "";
              const msg = e.msg || e.message || JSON.stringify(e);
              return loc ? `${loc}: ${msg}` : msg;
            })
            .filter(Boolean)
            .join("; ");
        } else if (detail && typeof detail === "object") {
          errorMessage = (detail as { message?: string }).message || JSON.stringify(detail);
        } else {
          errorMessage = errJson.error || errJson.message || errorMessage;
        }
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          /* keep default */
        }
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
      error: err?.message || "Network request failed.",
      status: 0,
    };
  }
}
