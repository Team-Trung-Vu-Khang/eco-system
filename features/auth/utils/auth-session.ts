export const TOKEN_STORAGE_KEY = "mevi_access_token";
export const USER_PROFILE_STORAGE_KEY = "mevi_user_profile";

export const AUTH_SESSION_KEYS = [
  TOKEN_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
  "mevi_sso_provider",
  "mevi_user_identifier",
  "mevi_user_lookup_type",
  "mevi_user_email",
  "mevi_user_name",
  "mevi_session_id",
  "mevi_company_id",
  "mevi_user_id",
] as const;

export function clearStoredAuthSession() {
  AUTH_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
}

export function getStoredAccessToken() {
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}
