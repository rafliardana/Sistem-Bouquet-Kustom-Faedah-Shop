/**
 * services/authService.ts
 * ------------------------------------------------------------------
 * Endpoint autentikasi (JWT) pada backend Express:
 *   POST /api/auth/login → { token, profile }
 *   POST /api/signup     → { profile }
 *   GET  /api/me         → { profile }   (butuh header Authorization)
 */
import { apiRequest } from "./apiClient";
import type { UserProfile } from "../types";

export async function login(email: string, password: string) {
  return apiRequest<{ token: string; profile: UserProfile }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function signup(name: string, email: string, password: string) {
  const { profile } = await apiRequest<{ profile: UserProfile }>("/signup", {
    method: "POST",
    body: { name, email, password },
  });
  return profile;
}

export async function fetchMe() {
  const { profile } = await apiRequest<{ profile: UserProfile }>("/me");
  return profile;
}
