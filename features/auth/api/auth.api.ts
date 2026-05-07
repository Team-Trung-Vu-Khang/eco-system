export const AUTH_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_AUTH_API_BASE ??
  "https://api-be-mevi.otechz.com";

export type AuthMeProfile = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  provider?: string | null;
  sessionId?: string | null;
  companyId?: string | number | null;
};

export function buildAuthMeUrl() {
  return new URL("/auth/me", AUTH_API_BASE).toString();
}

export function buildLogoutUrl() {
  return new URL("/auth/logout", AUTH_API_BASE).toString();
}

function normalizeObjectKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeObjectKeys(item)) as T;
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.endsWith(":") ? key.slice(0, -1) : key,
        normalizeObjectKeys(value),
      ]),
    ) as T;
  }

  return input;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function getStringClaim(payload: Record<string, unknown> | null, keys: string[]) {
  if (!payload) return null;

  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function getApiErrorMessage(payload: unknown) {
  const normalizedPayload = normalizeObjectKeys(payload);
  const record = toRecord(normalizedPayload);
  const message = getStringClaim(record, ["message", "error"]);

  return message;
}

function getAuthMeProfile(payload: unknown): AuthMeProfile {
  const normalizedPayload = normalizeObjectKeys(payload);
  const root = toRecord(normalizedPayload);
  const data = toRecord(root?.data);
  const profile = data ?? root;

  if (!profile) return {};

  return {
    userId: getStringClaim(profile, ["userId", "user_id", "sub", "id"]),
    email: getStringClaim(profile, ["email", "mail"]),
    name: getStringClaim(profile, [
      "name",
      "fullName",
      "full_name",
      "preferred_username",
    ]),
    provider: getStringClaim(profile, ["provider"]),
    sessionId: getStringClaim(profile, ["sessionId", "session_id", "sid"]),
    companyId: getStringClaim(profile, [
      "companyId",
      "company_id",
      "tenantId",
      "tenant_id",
    ]),
  };
}

export async function fetchCurrentAuthUser(
  token: string,
): Promise<AuthMeProfile> {
  const response = await fetch(buildAuthMeUrl(), {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(payload);

    throw new Error(message || "Token SSO không hợp lệ hoặc đã hết hạn.");
  }

  return getAuthMeProfile(payload);
}

export async function logoutMeviSession(token: string) {
  const response = await fetch(buildLogoutUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = getApiErrorMessage(payload);

    throw new Error(message || "Không thể đăng xuất. Vui lòng thử lại.");
  }
}
