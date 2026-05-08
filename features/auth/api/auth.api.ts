export const AUTH_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_AUTH_API_BASE ??
  "https://api-be-mevi.otechz.com";

export type AuthMeProfile = {
  userId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  name?: string | null;
  provider?: string | null;
  sessionId?: string | null;
  companyId?: string | number | null;
  mustChangePassword?: boolean | null;
};

export type ChangePasswordPayload = {
  newPassword: string;
  confirmPassword: string;
};

export function buildAuthMeUrl() {
  return new URL("/auth/me", AUTH_API_BASE).toString();
}

export function buildLogoutUrl() {
  return new URL("/auth/logout", AUTH_API_BASE).toString();
}

export function buildRefreshUrl() {
  return new URL("/auth/refresh", AUTH_API_BASE).toString();
}

export function buildChangePasswordUrl() {
  return new URL("/auth/change-password", AUTH_API_BASE).toString();
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

function getStringClaim(
  payload: Record<string, unknown> | null,
  keys: string[],
) {
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

function getBooleanClaim(
  payload: Record<string, unknown> | null,
  keys: string[],
) {
  if (!payload) return null;

  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === "true" || normalizedValue === "1") {
        return true;
      }

      if (normalizedValue === "false" || normalizedValue === "0") {
        return false;
      }
    }

    if (typeof value === "number") {
      return value === 1;
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

function getAccessTokenFromPayload(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  const record = toRecord(normalizeObjectKeys(payload));
  if (!record) return null;

  for (const key of ["accessToken", "access_token", "token", "jwt"]) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return getAccessTokenFromPayload(record.data);
}

function getAccessTokenFromHeaders(headers: Headers) {
  const authorization = headers.get("authorization");

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  const accessToken = headers.get("x-access-token");

  return accessToken?.trim() || null;
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

  return payload;
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

export async function refreshAccessToken(token: string) {
  const response = await fetch(buildRefreshUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(payload);

    throw new Error(message || "Phiên đăng nhập đã hết hạn.");
  }

  const refreshedToken =
    getAccessTokenFromPayload(payload) ??
    getAccessTokenFromHeaders(response.headers);

  if (!refreshedToken) {
    throw new Error("Không nhận được token mới.");
  }

  return refreshedToken;
}

export async function changeCurrentUserPassword({
  token,
  payload,
}: {
  token: string;
  payload: ChangePasswordPayload;
}) {
  const response = await fetch(buildChangePasswordUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const responsePayload = await response.json().catch(() => null);
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
  }
}
