"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import { DecorativeLeaves } from "@/app/survey/_components/decorative-leaves";
import { useAuthMeMutation, useLogoutMutation } from "@/features/auth/hooks";
import {
  USER_PROFILE_STORAGE_KEY,
  clearStoredAuthSession,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/features/auth/utils";
import {
  fetchSurveyDetail,
  type SurveyRequestContext,
  type SurveyResultDetails,
} from "@/features/survey/api";

function buildSurveyUrl(phone: string) {
  const surveyParams = new URLSearchParams({
    surveyType: "general",
    source: "login",
    returnTo: "/dashboard",
    type: "phone",
    phone,
  });

  const companyId = window.sessionStorage.getItem("mevi_company_id");
  const userId = window.sessionStorage.getItem("mevi_user_id");

  if (companyId) surveyParams.set("companyId", companyId);
  if (userId) surveyParams.set("userId", userId);

  return `/survey?${surveyParams.toString()}`;
}

function getStoredSurveyContext(): SurveyRequestContext {
  const companyId = window.sessionStorage.getItem("mevi_company_id");
  const userId = window.sessionStorage.getItem("mevi_user_id");

  return {
    companyId,
    userId,
  };
}

function hasPendingSurvey(surveyDetail: SurveyResultDetails | null) {
  return Boolean(
    surveyDetail &&
    surveyDetail.status !== "submitted" &&
    !surveyDetail.submittedAt,
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const { mutateAsync: getCurrentUser } = useAuthMeMutation();
  const { mutateAsync: logoutSession, isPending: isExiting } =
    useLogoutMutation();
  const isExitRequestedRef = useRef(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
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
        setStoredAccessToken(token);

        const profile = await getCurrentUser(token);
        const name = profile?.name || "";
        const phone = profile?.phoneNumber || "";
        const companyId = profile?.companyId || "";
        const userId = profile?.userId || "";

        if (!isActive || isExitRequestedRef.current) return;

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

        if (profile.mustChangePassword) {
          router.replace("/dashboard");
          return;
        }

        try {
          const surveyDetail = await fetchSurveyDetail(
            "general",
            phone,
            "phone",
            getStoredSurveyContext(),
          );

          if (!isActive || isExitRequestedRef.current) return;

          router.replace(
            hasPendingSurvey(surveyDetail)
              ? buildSurveyUrl(phone)
              : "/dashboard",
          );
        } catch {
          if (!isActive || isExitRequestedRef.current) return;

          router.replace("/dashboard");
        }
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
  }, [getCurrentUser, router, token]);

  const handleExit = async () => {
    if (isExiting) return;

    isExitRequestedRef.current = true;
    setCallbackError(null);

    const storedToken = getStoredAccessToken();
    const logoutToken = token || storedToken;

    try {
      if (logoutToken) {
        await logoutSession(logoutToken);
      }
    } catch {
      // Local exit should still complete even when the remote logout fails.
    } finally {
      clearStoredAuthSession();
      router.replace("/");
    }
  };

  const feedback = error
    ? "Xác thực chưa hoàn tất"
    : "Đang xác thực tài khoản MEVI Farm...";

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
