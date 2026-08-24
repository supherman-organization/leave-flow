import { createContext, useContext, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import type { AuthUser } from '../types/user';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mustSetPassword: boolean }>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUserState] = useState<AuthUser | null>(() => readStoredUser());

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setToken(res.token);
    setUserState(res.user);
    return { mustSetPassword: res.mustSetPassword };
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUserState(null);
  }

  function setUser(u: AuthUser) {
    localStorage.setItem('user', JSON.stringify(u));
    setUserState(u);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}