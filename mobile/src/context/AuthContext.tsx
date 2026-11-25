/**
 * context/AuthContext.tsx
 * ------------------------------------------------------------------
 * State global autentikasi (React Context).
 * - Saat aplikasi dibuka: membaca token dari AsyncStorage lalu
 *   memverifikasinya ke GET /api/me (auto-login).
 * - login(): simpan token ke AsyncStorage + memori apiClient.
 * - logout(): hapus token dari keduanya.
 * Role pengguna (customer/admin/owner) dipakai navigasi untuk
 * menampilkan akses Dashboard Admin.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { ApiError, setAuthToken } from "../services/apiClient";
import { clearToken, getToken, saveToken } from "../services/storage";
import type { UserProfile } from "../types";

interface AuthContextValue {
  user: UserProfile | null;
  /** true selama proses auto-login awal */
  initializing: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Auto-login: pulihkan sesi dari token tersimpan
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        setAuthToken(token);
        setUser(await authService.fetchMe());
      } catch (err) {
        // Token kedaluwarsa/invalid → bersihkan sesi
        if (err instanceof ApiError && err.status === 401) {
          await clearToken();
          setAuthToken(null);
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, profile } = await authService.login(email.trim(), password);
    await saveToken(token);
    setAuthToken(token);
    setUser(profile);
    return profile;
  }, []);

  // Registrasi pelanggan, lalu langsung login agar UX lebih singkat
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authService.signup(name.trim(), email.trim(), password);
      return login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setAuthToken(null);
    setUser(null);
  }, []);

  // useMemo mencegah re-render seluruh pohon komponen yang tidak perlu
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAdmin: user?.role === "admin" || user?.role === "owner",
      login,
      register,
      logout,
    }),
    [user, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook untuk mengakses state autentikasi dari komponen mana pun */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
