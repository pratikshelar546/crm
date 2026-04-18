import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import type { AuthUser } from "../api/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_USER = "crm_user";
const STORAGE_TOKEN = "token";

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed && typeof parsed.email === "string" && typeof parsed.name === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN));
  const [isReady] = useState(true);

  const persistSession = useCallback((nextUser: AuthUser, nextToken: string) => {
    const normalized: AuthUser = {
      ...nextUser,
      id: String(nextUser.id),
    };
    localStorage.setItem(STORAGE_TOKEN, nextToken);
    localStorage.setItem(STORAGE_USER, JSON.stringify(normalized));
    setToken(nextToken);
    setUser(normalized);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      persistSession(res.user, res.token);
    },
    [persistSession],
  );

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await authApi.signup(name, email, password);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      signup,
      logout,
    }),
    [user, token, isReady, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
