"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
  token: string;
  nome: string;
  email: string;
  permissao: string;
  emoji?: string;
}

const AUTH_KEY = "colmeia_auth";

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getAuthUser());
    setLoading(false);
  }, []);

  function logout() {
    clearAuthUser();
    setUser(null);
  }

  return { user, loading, logout, setUser };
}
