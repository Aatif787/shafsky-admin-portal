/**
 * API Configuration Module
 * Resolves the backend base URL dynamically from environment variables.
 */

const PRODUCTION_API_FALLBACK = "https://shafsky-backend-1.onrender.com";

function readEnvUrl(...keys: string[]): string | null {
  for (const key of keys) {
    const value = import.meta.env[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim().replace(/\/+$/, "");
    }
  }
  return null;
}

function isLocalDevUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export function getApiBaseUrl(): string {
  // Collect both supported Vite env names (order preserved for local preference).
  const candidates = [
    readEnvUrl("VITE_API_BASE_URL"),
    readEnvUrl("VITE_BACKEND_API_URL"),
  ].filter((u): u is string => Boolean(u));

  if (import.meta.env.PROD) {
    // Production builds must never call the developer machine.
    // Prefer a remote URL even if VITE_API_BASE_URL was mistakenly set to localhost on Vercel.
    const remote = candidates.find((u) => !isLocalDevUrl(u));
    if (remote) return remote;
    return PRODUCTION_API_FALLBACK;
  }

  if (candidates[0]) return candidates[0];
  return "http://127.0.0.1:8003";
}

export function isNgrokBackend(): boolean {
  const base = getApiBaseUrl().toLowerCase();
  return base.includes("ngrok");
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
