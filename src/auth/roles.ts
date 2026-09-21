/**
 * Canonical role sets aligned with backend app.security.dependencies.
 */

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATIONS_MANAGER",
] as const;

export const STAFF_OR_ADMIN_ROLES = [
  ...ADMIN_ROLES,
  "DUTY_OFFICER",
  "DISPATCHER",
  "MEET_AND_ASSIST_STAFF",
  "CONCIERGE_TEAM",
  "CUSTOMER_SUPPORT",
] as const;

export const RECYCLE_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type StaffOrAdminRole = (typeof STAFF_OR_ADMIN_ROLES)[number];

export function isAdminRole(role?: string | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role.toUpperCase());
}

export function isStaffOrAdminRole(role?: string | null): boolean {
  return !!role && (STAFF_OR_ADMIN_ROLES as readonly string[]).includes(role.toUpperCase());
}

/** Default landing path after login based on role capability. */
export function homePathForRole(role?: string | null): string {
  const r = (role || "").toUpperCase();
  if ((ADMIN_ROLES as readonly string[]).includes(r)) return "/";
  if (r === "DUTY_OFFICER" || r === "DISPATCHER" || r === "MEET_AND_ASSIST_STAFF") {
    return "/operations";
  }
  if ((STAFF_OR_ADMIN_ROLES as readonly string[]).includes(r)) return "/operations";
  return "/access-denied";
}
