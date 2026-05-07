"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import { DecorativeLeaves } from "@/app/survey/_components/decorative-leaves";
import { DEFAULT_SURVEY_LOOKUP_VALUE } from "@/features/survey/constants/survey.constants";

type SurveyLookupType = "phone" | "email" | "code" | "userId";
type JwtPayload = Record<string, unknown>;

const SSO_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_AUTH_API_BASE ?? "http://api-be-mevi.otechz.com";
const SSO_PROVIDER = "center";
const TOKEN_STORAGE_KEY = "mevi_access_token";
const USER_PROFILE_STORAGE_KEY = "mevi_user_profile";
const AUTH_SESSION_KEYS = [
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

type AuthMeProfile = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  provider?: string | null;
  sessionId?: string | null;
  companyId?: string | number | null;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const payload = token.split(".")[1];

  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    return JSON.parse(window.atob(paddedPayload)) as JwtPayload;
  } catch {
    return null;
  }
}

function getStringClaim(payload: JwtPayload | null, keys: string[]) {
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

function buildAuthMeUrl() {
  return new URL("/auth/me", SSO_API_BASE).toString();
}

function buildLogoutUrl() {
  return new URL("/auth/logout", SSO_API_BASE).toString();
}

function clearStoredAuthSession() {
  AUTH_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
}

function getApiErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const normalizedPayload = normalizeObjectKeys(payload);
  const record = toRecord(normalizedPayload);
  const message = getStringClaim(record, ["message", "error"]);

  return message;
}

async function fetchCurrentUser(token: string): Promise<AuthMeProfile> {
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

async function requestLogout(token: string) {
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

    throw new Error(message || "Không thể thoát phiên đăng nhập.");
  }
}

function getSurveyLookup(
  payload: JwtPayload | null,
  profile?: AuthMeProfile,
): {
  type: SurveyLookupType;
  value: string;
} {
  const profileUserId = profile?.userId?.trim();
  if (profileUserId) return { type: "userId", value: profileUserId };

  const profileEmail = profile?.email?.trim();
  if (profileEmail) return { type: "email", value: profileEmail };

  const phone = getStringClaim(payload, [
    "phone",
    "phone_number",
    "mobile",
    "mobilePhone",
  ]);
  if (phone) return { type: "phone", value: phone };

  const email = getStringClaim(payload, ["email", "mail"]);
  if (email) return { type: "email", value: email };

  const userId = getStringClaim(payload, ["userId", "user_id", "sub", "id"]);
  if (userId) return { type: "userId", value: userId };

  return { type: "phone", value: DEFAULT_SURVEY_LOOKUP_VALUE };
}

function buildSurveyUrl(lookup: { type: SurveyLookupType; value: string }) {
  const surveyParams = new URLSearchParams({
    surveyType: "general",
    source: "login",
    returnTo: "/dashboard",
    type: lookup.type,
    [lookup.type]: lookup.value,
  });

  const companyId = window.sessionStorage.getItem("mevi_company_id");
  const userId = window.sessionStorage.getItem("mevi_user_id");

  if (companyId) surveyParams.set("companyId", companyId);
  if (userId) surveyParams.set("userId", userId);

  return `/survey?${surveyParams.toString()}`;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const isExitRequestedRef = useRef(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const error =
    callbackError ??
    (token ? null : "Không nhận được token SSO. Vui lòng thử truy cập lại.");

  useEffect(() => {
    if (!token) return;

    let isActive = true;
    isExitRequestedRef.current = false;

    async function syncAuthenticatedUser() {
      try {
        clearStoredAuthSession();
        window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

        const payload = decodeJwtPayload(token);
        const profile = await fetchCurrentUser(token);
        const lookup = getSurveyLookup(payload, profile);
        const email = profile.email ?? getStringClaim(payload, ["email", "mail"]);
        const name =
          profile.name ??
          getStringClaim(payload, [
            "name",
            "fullName",
            "full_name",
            "preferred_username",
          ]);
        const provider = profile.provider ?? SSO_PROVIDER;
        const companyId =
          profile.companyId ??
          getStringClaim(payload, [
            "companyId",
            "company_id",
            "tenantId",
            "tenant_id",
          ]);
        const userId =
          profile.userId ??
          (lookup.type === "userId"
            ? lookup.value
            : getStringClaim(payload, ["userId", "user_id", "sub", "id"]));

        if (!isActive || isExitRequestedRef.current) return;

        window.sessionStorage.setItem(
          USER_PROFILE_STORAGE_KEY,
          JSON.stringify(profile),
        );
        window.sessionStorage.setItem("mevi_sso_provider", provider);
        window.sessionStorage.setItem("mevi_user_identifier", lookup.value);
        window.sessionStorage.setItem("mevi_user_lookup_type", lookup.type);
        window.sessionStorage.setItem("mevi_user_email", email ?? lookup.value);
        window.sessionStorage.setItem(
          "mevi_user_name",
          name ?? "Tài khoản quản trị MEVI",
        );

        if (profile.sessionId) {
          window.sessionStorage.setItem("mevi_session_id", profile.sessionId);
        }

        if (companyId) {
          window.sessionStorage.setItem("mevi_company_id", String(companyId));
        }

        if (userId) window.sessionStorage.setItem("mevi_user_id", userId);

        router.replace(buildSurveyUrl(lookup));
      } catch (error) {
        if (!isActive || isExitRequestedRef.current) return;

        clearStoredAuthSession();
        setCallbackError(
          error instanceof Error
            ? error.message
            : "Không lấy được thông tin tài khoản. Vui lòng thử lại.",
        );
      }
    }

    void syncAuthenticatedUser();

    return () => {
      isActive = false;
    };
  }, [router, token]);

  const handleExit = async () => {
    if (isExiting) return;

    isExitRequestedRef.current = true;
    setIsExiting(true);
    setCallbackError(null);

    const storedToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const logoutToken = token || storedToken;

    try {
      if (logoutToken) {
        await requestLogout(logoutToken);
      }

      clearStoredAuthSession();
      router.replace("/");
    } catch (error) {
      clearStoredAuthSession();
      setCallbackError(
        error instanceof Error
          ? error.message
          : "Không thể thoát phiên đăng nhập.",
      );
      setIsExiting(false);
    }
  };

  const feedback = useMemo(
    () =>
      error
        ? "Xác thực chưa hoàn tất"
        : "Đang xác thực tài khoản MEVI Farm...",
    [error],
  );

  return (
    <AuthCallbackShell
      error={error}
      feedback={feedback}
      isExiting={isExiting}
      onExit={handleExit}
    />
  );
}

function AuthCallbackShell({
  error,
  feedback,
  isExiting = false,
  onExit,
}: {
  error?: string | null;
  feedback: string;
  isExiting?: boolean;
  onExit?: () => void;
}) {
  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28 sm:pb-32">
        <MeviPortalHeader
          badgeLabel="SSO"
          className="px-4 py-4 sm:px-6 md:px-10"
          rightSlot={
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Nền tảng bảo mật</span>
            </>
          }
          rightSlotClassName="mevi-badge hidden sm:flex"
        />

        <main className="flex w-full flex-1 items-center justify-center px-4">
          <section className="mevi-login-card w-full max-w-[22rem] p-6 text-center">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-sm">
              {error ? (
                <AlertCircle
                  className="h-6 w-6"
                  style={{ color: "var(--mevi-green-700)" }}
                />
              ) : (
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: "var(--mevi-green-700)" }}
                />
              )}
            </div>

            <h1
              className="text-lg font-bold"
              style={{ color: "var(--mevi-text-primary)" }}
            >
              {feedback}
            </h1>

            {error && (
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                {error}
              </p>
            )}

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                disabled={isExiting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-60"
                style={{
                  color: "var(--mevi-text-muted)",
                  border: "1px solid var(--mevi-border)",
                  background: "rgba(255, 255, 255, 0.72)",
                }}
              >
                {isExiting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>{isExiting ? "Đang thoát..." : "Thoát"}</span>
              </button>
            )}
          </section>
        </main>
      </div>

      <MeviPortalFooter />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthCallbackShell
          feedback="Đang xác thực tài khoản MEVI Farm..."
          error={null}
        />
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
