import React, { createContext, useState, useEffect, useCallback } from "react";
import type { AuthContextType, AuthState, AuthUser } from "../types/auth";
import { loginApi, logoutApi, restoreSessionApi } from "../api/auth";
import { registerSessionExpiredCallback } from "../api/client";
import { clearAccessToken } from "./tokenStore";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const handleSessionExpired = useCallback(() => {
    clearAccessToken();
    setState({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: "Your session has expired. Please sign in again.",
    });
  }, []);

  // Register the 401 expiration handler on client
  useEffect(() => {
    registerSessionExpiredCallback(handleSessionExpired);
  }, [handleSessionExpired]);

  // Attempt initial session restore on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const user = await restoreSessionApi();
        if (isMounted) {
          if (user) {
            setState({
              user,
              role: user.role,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            setState({
              user: null,
              role: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch {
        if (isMounted) {
          setState({
            user: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await loginApi(email, password);

    if (result.success && result.user) {
      const user: AuthUser = {
        ...result.user,
        role: (result.user.role || "").toUpperCase(),
      };
      setState({
        user,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } else {
      const errorMsg = result.error || "Invalid email or password.";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      return { success: false, error: errorMsg };
    }
  };

  const logout = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await logoutApi();
    setState({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const user = await restoreSessionApi();
      if (user) {
        setState({
          user,
          role: user.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
    } catch {
      // Ignore refresh error
    }
    handleSessionExpired();
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
