export const TOKEN_STORAGE_KEY = "mevi_access_token";
export const TOKEN_COOKIE_NAME = "mevi_access_token";
export const USER_PROFILE_STORAGE_KEY = "mevi_user_profile";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const AUTH_SESSION_KEYS = [
  TOKEN_STORAGE_KEY,
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
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getStoredAccessToken() {
  const cookieToken = getCookieValue(TOKEN_COOKIE_NAME);

  if (cookieToken) {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, cookieToken);
    return cookieToken;
  }

  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUserName() {
  return window.sessionStorage.getItem("mevi_user_name");
}

export function setStoredAccessToken(token: string) {
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

  const secureFlag = window.location.protocol === "https:" ? "; secure" : "";

  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; path=/; max-age=${TOKEN_COOKIE_MAX_AGE_SECONDS}; samesite=lax${secureFlag}`;
}

function getCookieValue(name: string) {
  const cookiePrefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(cookiePrefix));

  if (!cookie) return null;

  return decodeURIComponent(cookie.slice(cookiePrefix.length));
}
