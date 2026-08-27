/**
 * In-Memory Access Token Storage
 *
 * CRITICAL SECURITY INVARIANT:
 * Access tokens are stored ONLY in volatile JavaScript memory to prevent
 * exfiltration via XSS. The Refresh Token is stored securely in an
 * HttpOnly, Secure, SameSite=Strict cookie managed solely by the FastAPI backend.
 */

let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}
