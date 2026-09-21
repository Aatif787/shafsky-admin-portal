export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OPERATIONS_MANAGER"
  | "DUTY_OFFICER"
  | "MEET_AND_ASSIST_STAFF"
  | "DRIVER"
  | "CONCIERGE_TEAM"
  | "CUSTOMER_SUPPORT"
  | "DISPATCHER"
  | "FINANCE"
  | "CUSTOMER"
  | string;

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  isVerified?: boolean;
}

export interface AuthResponseData {
  accessToken?: string;
  refreshToken?: string | null;
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}
