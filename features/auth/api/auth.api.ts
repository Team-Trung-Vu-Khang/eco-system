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

export type ForgotPasswordRequestOtpPayload = {
  phoneNumber: string;
};

export type ForgotPasswordRequestOtpResponse = {
  requestId?: string | null;
  message?: string | null;
  messageKey?: string | null;
};

export type ForgotPasswordResetPayload = {
  requestId: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export type LogoutMeviSessionResponse = {
  message?: string | null;
  logoutUrl?: string | null;
};

export function buildAuthMeUrl() {
  return new URL("/auth/me", AUTH_API_BASE).toString();
}

export function buildLogoutUrl() {
  const logoutUrl = new URL("/auth/logout", AUTH_API_BASE);
  logoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    "https://mevi-center.otechz.com/",
  );

  return logoutUrl.toString();
}

export function buildRefreshUrl() {
  return new URL("/auth/refresh", AUTH_API_BASE).toString();
}

export function buildChangePasswordUrl() {
  return new URL("/auth/change-password", AUTH_API_BASE).toString();
}

export function buildForgotPasswordRequestOtpUrl() {
  return new URL("/auth/password-reset/otp", AUTH_API_BASE).toString();
}

export function buildForgotPasswordResetUrl() {
  return new URL("/auth/password-reset/confirm", AUTH_API_BASE).toString();
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

function getApiErrorMessage(payload: unknown) {
  const normalizedPayload = normalizeObjectKeys(payload);
  const record = toRecord(normalizedPayload);
  const message = getStringClaim(record, ["message", "error"]);

  return message;
}

function getRequestIdFromPayload(payload: unknown) {
  const normalizedPayload = normalizeObjectKeys(payload);
  const record = toRecord(normalizedPayload);

  return getStringClaim(record, ["requestId", "request_id", "id"]);
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

export async function logoutMeviSession(
  token: string,
): Promise<LogoutMeviSessionResponse> {
  const response = await fetch(buildLogoutUrl(), {
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

    throw new Error(message || "Không thể đăng xuất. Vui lòng thử lại.");
  }

  const record = toRecord(normalizeObjectKeys(payload));

  return {
    message: typeof record?.message === "string" ? record.message : null,
    logoutUrl:
      typeof record?.logoutUrl === "string" ? record.logoutUrl.trim() : null,
  };
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

export async function requestForgotPasswordOtp(
  payload: ForgotPasswordRequestOtpPayload,
): Promise<ForgotPasswordRequestOtpResponse> {
  const response = await fetch(buildForgotPasswordRequestOtpUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      identifier: payload.phoneNumber,
    }),
    cache: "no-store",
  });

  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể gửi OTP. Vui lòng thử lại.");
  }

  return {
    requestId: getRequestIdFromPayload(responsePayload),
    message:
      typeof responsePayload?.message === "string"
        ? responsePayload.message
        : null,
    messageKey:
      typeof responsePayload?.messageKey === "string"
        ? responsePayload.messageKey
        : null,
  };
}

export async function resetForgotPassword(
  payload: ForgotPasswordResetPayload,
) {
  const response = await fetch(buildForgotPasswordResetUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      requestId: payload.requestId,
      otp: payload.otp,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    }),
    cache: "no-store",
  });

  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
  }

  return responsePayload;
}
