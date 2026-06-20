import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, getProfile, signupCustomer, getStoredToken, clearStoredToken } from "./api";
import type { UserProfile } from "../components/types";

interface AuthContextValue {
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, name: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setProfile(null);
      return;
    }
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      console.error("Failed to load profile for active session:", e);
      // Token might be expired/invalid — clear it
      clearStoredToken();
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadProfile();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { profile: p } = await loginUser(email, password);
    setProfile(p);
    return p;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Create the user server-side, then sign in to get a JWT token.
    await signupCustomer(email, password, name);
    const { profile: p } = await loginUser(email, password);
    setProfile(p);
    return p;
  }, []);

  const signOut = useCallback(async () => {
    clearStoredToken();
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signUp, signOut, refresh: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
