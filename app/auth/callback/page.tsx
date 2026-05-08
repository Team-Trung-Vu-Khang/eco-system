"use client";

import {
  Suspense,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Loader2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import { DecorativeLeaves } from "@/app/survey/_components/decorative-leaves";
import type { AuthMeProfile } from "@/features/auth/api";
import {
  useAuthMeMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} from "@/features/auth/hooks";
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

type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

function getProfilePhone(profile: AuthMeProfile) {
  return profile.phoneNumber?.trim() || "";
}

function storeAuthenticatedProfile(profile: AuthMeProfile) {
  const name = profile.name || "";
  const phone = getProfilePhone(profile);
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
}

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
  const changePasswordMutation = useChangePasswordMutation();
  const { mutateAsync: logoutSession, isPending: isExiting } =
    useLogoutMutation();
  const isExitRequestedRef = useRef(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(
    null,
  );
  const {
    register: registerPasswordField,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    control: passwordFormControl,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPasswordValue =
    useWatch({
      control: passwordFormControl,
      name: "newPassword",
    }) ?? "";
  const isChangingPassword = changePasswordMutation.isPending;
  const error =
    callbackError ??
    (token ? null : "Không nhận được token SSO. Vui lòng thử truy cập lại.");

  const checkSurveyAndRedirect = useCallback(
    async (phone: string, canRedirect: () => boolean = () => true) => {
      try {
        const surveyDetail = await fetchSurveyDetail(
          "general",
          phone,
          "phone",
          getStoredSurveyContext(),
        );

        if (!canRedirect()) return;

        router.replace(
          hasPendingSurvey(surveyDetail) ? buildSurveyUrl(phone) : "/dashboard",
        );
      } catch {
        if (!canRedirect()) return;

        router.replace("/dashboard");
      }
    },
    [router],
  );

  useEffect(() => {
    if (!token) return;

    let isActive = true;
    isExitRequestedRef.current = false;

    async function syncAuthenticatedUser() {
      try {
        clearStoredAuthSession();
        setStoredAccessToken(token);

        const profile = await getCurrentUser(token);
        const phone = getProfilePhone(profile);

        if (!isActive || isExitRequestedRef.current) return;

        storeAuthenticatedProfile(profile);

        if (profile.mustChangePassword) {
          setMustChangePassword(true);
          return;
        }

        await checkSurveyAndRedirect(
          phone,
          () => isActive && !isExitRequestedRef.current,
        );
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
  }, [checkSurveyAndRedirect, getCurrentUser, token]);

  const onChangePasswordSubmit = handlePasswordSubmit(async (values) => {
    setPasswordChangeError(null);

    if (!token) {
      setPasswordChangeError("Không tìm thấy token đăng nhập.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        token,
        payload: {
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
      });

      const refreshedProfile = await getCurrentUser(token);
      const phone = getProfilePhone(refreshedProfile);

      storeAuthenticatedProfile(refreshedProfile);
      resetPasswordForm();
      setMustChangePassword(false);

      await checkSurveyAndRedirect(phone);
    } catch (error) {
      setPasswordChangeError(
        error instanceof Error
          ? error.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    }
  });

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
    : mustChangePassword
      ? "Đổi mật khẩu"
      : "Đang xác thực tài khoản MEVI Farm...";

  return (
    <AuthCallbackShell
      error={error}
      feedback={feedback}
      isExiting={isExiting}
      onExit={handleExit}
    >
      {mustChangePassword && !error ? (
        <div className="text-left">
          <div className="mb-5 flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--mevi-green-50), var(--mevi-green-100))",
                color: "var(--mevi-green-700)",
              }}
            >
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-lg font-bold"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                Đổi mật khẩu
              </h1>
              <p
                className="mt-1 text-sm leading-6"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                Vui lòng cập nhật mật khẩu trước khi tiếp tục sử dụng hệ sinh
                thái MEVI.
              </p>
            </div>
          </div>

          <form onSubmit={onChangePasswordSubmit} className="flex flex-col gap-3">
            <div className="space-y-1">
              <label
                htmlFor="callbackNewPassword"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                <ShieldCheck className="h-4 w-4" />
                Mật khẩu mới
              </label>
              <input
                id="callbackNewPassword"
                type="password"
                autoComplete="new-password"
                className="mevi-input"
                {...registerPasswordField("newPassword", {
                  required: "Vui lòng nhập mật khẩu mới.",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu cần có ít nhất 6 ký tự.",
                  },
                })}
              />
              {passwordErrors.newPassword?.message ? (
                <p className="text-xs text-red-600">
                  {passwordErrors.newPassword.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="callbackConfirmPassword"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                <ShieldCheck className="h-4 w-4" />
                Xác nhận mật khẩu
              </label>
              <input
                id="callbackConfirmPassword"
                type="password"
                autoComplete="new-password"
                className="mevi-input"
                {...registerPasswordField("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu.",
                  validate: (value) =>
                    value === newPasswordValue ||
                    "Mật khẩu xác nhận không khớp.",
                })}
              />
              {passwordErrors.confirmPassword?.message ? (
                <p className="text-xs text-red-600">
                  {passwordErrors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            {passwordChangeError ? (
              <div className="rounded-xl border border-red-200 bg-red-50/90 p-3">
                <p className="text-sm font-semibold text-red-700">
                  {passwordChangeError}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              className="mevi-btn-primary mt-1 h-11 rounded-xl text-sm"
              disabled={isChangingPassword}
            >
              <span className="flex items-center justify-center gap-2">
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật mật khẩu"
                )}
              </span>
            </button>
          </form>
        </div>
      ) : null}
    </AuthCallbackShell>
  );
}

function AuthCallbackShell({
  error,
  feedback,
  isExiting = false,
  onExit,
  children,
}: {
  error?: string | null;
  feedback: string;
  isExiting?: boolean;
  onExit?: () => void;
  children?: ReactNode;
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
            {children ? (
              children
            ) : (
              <>
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
              </>
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
