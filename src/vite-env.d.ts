/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Alias used on some Vercel projects — accepted by getApiBaseUrl(). */
  readonly VITE_BACKEND_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
