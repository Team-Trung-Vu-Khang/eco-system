import { AUTH_API_BASE } from "@/features/auth/api";

export const REGISTRATION_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_REGISTRATION_API_BASE ?? AUTH_API_BASE;

export const REGISTRATION_AUDIENCE_TYPES = [
  "individual",
  "cooperative",
  "business",
  "other",
] as const;

export type RegistrationAudienceType =
  (typeof REGISTRATION_AUDIENCE_TYPES)[number];

export type RegistrationProfileRequest = {
  fullName: string;
  phoneNumber: string;
  birthYear: number;
  province: string;
  commune: string;
  operatingArea?: string;
  audienceType: RegistrationAudienceType;
  audienceTypeOther?: string;
  referrerPhoneNumber?: string;
};

export type RegistrationReferrerLookupRequest = {
  phoneNumber: string;
};

export type RegistrationReferrerLookupItem = {
  fullName: string;
  phoneNumber: string;
};

function buildRegistrationUrl() {
  return new URL("/api/registrations", REGISTRATION_API_BASE).toString();
}

function buildReferrerLookupUrl(phoneNumber: string) {
  const url = new URL(
    "/api/registrations/referrer-lookup",
    REGISTRATION_API_BASE,
  );
  url.searchParams.set("phoneNumber", phoneNumber);

  return url.toString();
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

function getApiErrorMessage(payload: unknown) {
  const normalizedPayload = normalizeObjectKeys(payload);

  if (!normalizedPayload || typeof normalizedPayload !== "object") {
    return null;
  }

  const record = normalizedPayload as Record<string, unknown>;
  const messageKey = record.messageKey;

  if (messageKey === "api.message.common.conflict") {
    return "Thông tin đăng ký đã tồn tại, vui lòng kiểm tra lại.";
  }

  const message = record.message ?? record.error;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

export async function submitRegistrationProfile(
  payload: RegistrationProfileRequest,
) {
  const requestBody = {
    ...payload,
    fullName: payload.fullName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    province: payload.province.trim(),
    commune: payload.commune.trim(),
    operatingArea: payload.operatingArea?.trim() || undefined,
    audienceTypeOther: payload.audienceTypeOther?.trim() || undefined,
    referrerPhoneNumber: payload.referrerPhoneNumber?.trim() || undefined,
  };

  const response = await fetch(buildRegistrationUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });
  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể gửi đăng ký. Vui lòng thử lại.");
  }

  return normalizeObjectKeys(responsePayload);
}

export async function lookupRegistrationReferrer(
  payload: RegistrationReferrerLookupRequest,
): Promise<RegistrationReferrerLookupItem[]> {
  const phoneNumber = payload.phoneNumber.trim();

  if (!phoneNumber) {
    return [];
  }

  const response = await fetch(buildReferrerLookupUrl(phoneNumber), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });
  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể tra cứu người giới thiệu.");
  }

  if (!Array.isArray(responsePayload)) {
    return [];
  }

  return responsePayload as RegistrationReferrerLookupItem[];
}
