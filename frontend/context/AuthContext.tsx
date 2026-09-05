"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, fetchCurrentUser } from "@/services/authService";
import { getToken, saveToken, clearToken } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) {
      setLoading(false);
      return;
    }
    setToken(existingToken);
    fetchCurrentUser(existingToken)
      .then(setUser)
      .catch(() => {
        clearToken();
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = (newToken: string, newUser: User) => {
    saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}