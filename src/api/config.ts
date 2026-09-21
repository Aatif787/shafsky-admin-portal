/**
 * API Configuration Module
 * Resolves the backend base URL dynamically from environment variables.
 */

function readEnvUrl(...keys: string[]): string | null {
  for (const key of keys) {
    const value = import.meta.env[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim().replace(/\/+$/, "");
    }
  }
  return null;
}

export function getApiBaseUrl(): string {
  // Prefer VITE_API_BASE_URL; also accept VITE_BACKEND_API_URL (Vercel naming).
  const envUrl = readEnvUrl("VITE_API_BASE_URL", "VITE_BACKEND_API_URL");
  if (envUrl) {
    return envUrl;
  }

  // Fallback to local FastAPI development server
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
