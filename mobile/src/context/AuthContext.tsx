// Context autentikasi global.
// - Saat aplikasi dibuka: membaca JWT dari AsyncStorage lalu memvalidasi ke /api/me.
// - Menyediakan login, register (langsung login setelah daftar), dan logout.
// - Jika server membalas 401 (token kedaluwarsa), sesi otomatis dibersihkan.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as api from "@/api/services";
import { setUnauthorizedHandler } from "@/api/client";
import { clearToken, getToken, setToken } from "@/storage/tokenStorage";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: UserProfile | null;
  initializing: boolean; // true selama sesi tersimpan sedang dipulihkan
  isStaff: boolean; // admin atau owner
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  // Pulihkan sesi dari token yang tersimpan.
  useEffect(() => {
    setUnauthorizedHandler(() => void logout());
    (async () => {
      try {
        if (await getToken()) setUser(await api.getMe());
      } catch {
        await clearToken();
      } finally {
        setInitializing(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, profile } = await api.login(email.trim(), password);
    await setToken(token);
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await api.signup(name.trim(), email.trim(), password);
      return login(email, password);
    },
    [login],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isStaff: user?.role === "admin" || user?.role === "owner",
      login,
      register,
      logout,
    }),
    [user, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
