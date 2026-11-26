import React, { createContext, useCallback, useContext, useState } from 'react';

const AUTH_SESSION_KEY = 'by_sawadhee_admin_auth_v1';

interface AuthContextValue {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readInitialAuth(): { isAuthenticated: boolean; adminEmail: string | null } {
  try {
    const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return { isAuthenticated: false, adminEmail: null };
    const parsed = JSON.parse(stored) as { email: string };
    return { isAuthenticated: true, adminEmail: parsed.email };
  } catch {
    return { isAuthenticated: false, adminEmail: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(readInitialAuth);

  const login = useCallback((email: string, password: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@bysawadhee.com' && password === 'sawadhee123') {
      sessionStorage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({ email: cleanEmail, loggedInAt: new Date().toISOString() })
      );
      setAuthState({ isAuthenticated: true, adminEmail: cleanEmail });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setAuthState({ isAuthenticated: false, adminEmail: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        adminEmail: authState.adminEmail,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return ctx;
}
