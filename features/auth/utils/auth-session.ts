import {
  clearAuthSession,
  setAuthAccessToken,
  setAuthProfile,
  getAuthSessionSnapshot,
} from "@/features/auth/state/auth-session-store";

export const USER_PROFILE_STORAGE_KEY = "mevi_user_profile";

export const AUTH_SESSION_KEYS = [
  USER_PROFILE_STORAGE_KEY,
  "mevi_sso_provider",
  "mevi_user_identifier",
  "mevi_user_lookup_type",
  "mevi_user_name",
  "mevi_session_id",
  "mevi_company_id",
  "mevi_user_id",
] as const;

export function clearStoredAuthSession() {
  AUTH_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
  clearAuthSession();
}

export function getStoredAccessToken() {
  return getAuthSessionSnapshot().accessToken;
}

export function getStoredUserName() {
  return window.sessionStorage.getItem("mevi_user_name");
}

type StoredAuthProfile = {
  name?: string | null;
  phoneNumber?: string | null;
  companyId?: string | number | null;
  userId?: string | null;
};

export function storeAuthenticatedProfile(profile: StoredAuthProfile) {
  const name = profile.name || "";
  const phone = profile.phoneNumber?.trim() || "";
  const companyId = profile.companyId || "";
  const userId = profile.userId || "";

  window.sessionStorage.setItem(
    USER_PROFILE_STORAGE_KEY,
    JSON.stringify(profile),
  );
  window.sessionStorage.setItem("mevi_user_identifier", phone);
  window.sessionStorage.setItem(
    "mevi_user_name",
    name || "Tài khoản quản trị MEVI",
  );

  if (companyId) {
    window.sessionStorage.setItem("mevi_company_id", String(companyId));
  }

  if (userId) window.sessionStorage.setItem("mevi_user_id", userId);

  setAuthProfile(profile);
}

export function setStoredAccessToken(token: string) {
  setAuthAccessToken(token);
}
