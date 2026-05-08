"use client";

import {
  Sprout,
  BookOpen,
  Factory,
  ShoppingBag,
  ArrowRight,
  LogOut,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { SurveyBranchConfirmModal } from "@/app/survey/_components/survey-branch-confirm-modal";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import {
  useAuthMeQuery,
  useChangePasswordMutation,
  useLogoutMutation,
} from "@/features/auth/hooks";
import {
  USER_PROFILE_STORAGE_KEY,
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredUserName,
} from "@/features/auth/utils";
import { SURVEY_META } from "@/features/survey/constants/survey.constants";
import { useSurveyDetailMutation } from "@/features/survey/hooks";
import type {
  SurveyLookupType,
  SurveyRequestType,
  SurveyResultDetails,
} from "@/features/survey/api";
import { getStoredLookupType } from "@/features/survey/utils/survey-flow";

/* ===== Module Data ===== */

const modules = [
  {
    id: "edu",
    name: "Mevi Edu",
    description: "Đào tạo & hướng dẫn kỹ thuật nông nghiệp",
    longDesc:
      "Hệ thống giáo dục trực tuyến, tài liệu kỹ thuật canh tác, hướng dẫn sử dụng phân bón và quy trình sản xuất.",
    icon: BookOpen,
    variant: "edu" as const,
    href: "https://mevi-edu.otechz.com/",
    status: "Hoạt động",
    dotColor: "bg-blue-400",
  },
  {
    id: "farm",
    name: "Mevi Farm",
    description: "Quản lý nông trại & canh tác thông minh",
    longDesc:
      "Quản lý vùng trồng, mùa vụ, kế hoạch canh tác, vật tư nông nghiệp, nhân sự và toàn bộ hoạt động nông trại.",
    icon: Sprout,
    variant: "farm" as const,
    href: "/farm",
    status: "Hoạt động",
    dotColor: "bg-green-400",
  },
  {
    id: "factory",
    name: "Mevi Factory",
    description: "Quản lý nhà máy & chế biến nông sản",
    longDesc:
      "Theo dõi quy trình sản xuất, quản lý nguyên liệu đầu vào, kiểm soát chất lượng và xuất kho thành phẩm.",
    icon: Factory,
    variant: "factory" as const,
    href: "/factory",
    status: "Đang phát triển",
    dotColor: "bg-orange-400",
  },
  {
    id: "shop",
    name: "Mevi Shop",
    description: "Cửa hàng & phân phối sản phẩm",
    longDesc:
      "Kênh bán hàng trực tuyến, quản lý đơn hàng, chăm sóc khách hàng và truy xuất nguồn gốc sản phẩm.",
    icon: ShoppingBag,
    variant: "shop" as const,
    href: "/shop",
    status: "Đang phát triển",
    dotColor: "bg-purple-400",
  },
] as const;

type ModuleItem = (typeof modules)[number];
type BranchSurveyType = Extract<SurveyRequestType, "farm" | "factory" | "shop">;
type BranchModule = Extract<ModuleItem, { id: BranchSurveyType }>;
type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

function hasPendingSurvey(surveyDetail: SurveyResultDetails | null) {
  return Boolean(
    surveyDetail &&
      surveyDetail.status !== "submitted" &&
      !surveyDetail.submittedAt,
  );
}

function getDisplayName(
  profile: {
    name?: string | null;
    email?: string | null;
    userId?: string | null;
  },
  fallback?: string | null,
) {
  return (
    profile.name?.trim() ||
    profile.email?.trim() ||
    fallback?.trim() ||
    profile.userId?.trim() ||
    "Tài khoản MEVI"
  );
}

function getUserInitials(displayName: string) {
  const normalizedName = displayName.trim();
  const emailName = normalizedName.includes("@")
    ? normalizedName.split("@")[0]
    : normalizedName;
  const words = emailName
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-ZÀ-ỹ0-9]/g, ""))
    .filter(Boolean);

  if (!words.length) return "ME";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/* ===== Decorative Leaves ===== */

function DecorativeLeaves() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute -top-4 -right-12 w-64 h-64 opacity-[0.04] animate-leaf-sway"
        viewBox="0 0 200 200"
      >
        <path
          d="M120 20 C160 40, 180 80, 170 130 C160 160, 130 180, 90 170 C60 160, 40 130, 50 90 C55 60, 80 30, 120 20Z"
          fill="currentColor"
          className="text-green-700"
        />
      </svg>
      <svg
        className="absolute -bottom-8 -left-16 w-48 h-48 opacity-[0.03]"
        viewBox="0 0 200 200"
        style={{ animation: "leaf-sway 4s ease-in-out infinite 1.5s" }}
      >
        <path
          d="M40 160 C20 120, 30 70, 70 40 C100 20, 140 30, 160 60 C170 80, 165 110, 140 130 C110 155, 70 170, 40 160Z"
          fill="currentColor"
          className="text-green-600"
        />
      </svg>
    </div>
  );
}

/* ===== Dashboard Page ===== */

export default function DashboardPage() {
  const router = useRouter();
  const [accessToken] = useState(() =>
    typeof window === "undefined" ? null : getStoredAccessToken(),
  );
  const [storedUserName] = useState(() =>
    typeof window === "undefined" ? null : getStoredUserName(),
  );
  const authMeQuery = useAuthMeQuery(accessToken);
  const changePasswordMutation = useChangePasswordMutation();
  const logoutMutation = useLogoutMutation();
  const surveyDetailMutation = useSurveyDetailMutation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(
    null,
  );
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  const [pendingSurveyModule, setPendingSurveyModule] =
    useState<BranchModule | null>(null);
  const isLoggingOut = logoutMutation.isPending;
  const isChangingPassword = changePasswordMutation.isPending;
  const mustChangePassword = Boolean(authMeQuery.data?.mustChangePassword);
  const displayName = getDisplayName(authMeQuery.data ?? {}, storedUserName);
  const userInitials = getUserInitials(displayName);
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

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const openModule = (mod: ModuleItem) => {
    if (mod.id === "factory" || mod.id === "shop") {
      setLoadingModuleId(null);
      setToastMessage(
        `${mod.name} đang được hoàn thiện. Khi sẵn sàng, MEVI sẽ thông báo để bà con vào sử dụng thuận tiện hơn.`,
      );
      return;
    }

    setToastMessage(null);
    setLoadingModuleId(mod.id);

    const targetHref = mod.href;
    window.setTimeout(() => {
      window.open(targetHref, "_blank", "noopener,noreferrer");

      setLoadingModuleId(null);
    }, 2000);
  };

  const getSurveyLookup = () => {
    const storedValue =
      window.sessionStorage.getItem("mevi_user_identifier") || "";
    const lookupType = getStoredLookupType(storedValue);

    return {
      type: lookupType,
      value: storedValue,
      companyId: window.sessionStorage.getItem("mevi_company_id"),
      userId: window.sessionStorage.getItem("mevi_user_id"),
    };
  };

  const goToBranchSurvey = (mod: BranchModule) => {
    const lookup = getSurveyLookup();
    const surveyParams = new URLSearchParams({
      surveyType: mod.id,
      source: "module",
      returnTo: "/dashboard",
      [lookup.type]: lookup.value,
    });

    if (lookup.companyId) {
      surveyParams.set("companyId", lookup.companyId);
    }

    if (lookup.userId) {
      surveyParams.set("userId", lookup.userId);
    }

    router.push(`/survey?${surveyParams.toString()}`);
  };

  const goToGeneralSurvey = () => {
    const lookup = getSurveyLookup();
    const surveyParams = new URLSearchParams({
      surveyType: "general",
      source: "login",
      returnTo: "/dashboard",
      phone: lookup.value,
    });

    if (lookup.companyId) {
      surveyParams.set("companyId", lookup.companyId);
    }

    if (lookup.userId) {
      surveyParams.set("userId", lookup.userId);
    }

    router.push(`/survey?${surveyParams.toString()}`);
  };

  const shouldCheckSurvey = (mod: ModuleItem): mod is BranchModule =>
    mod.id === "farm" || mod.id === "factory" || mod.id === "shop";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setToastMessage(null);

    const token = getStoredAccessToken();

    try {
      if (token) {
        await logoutMutation.mutateAsync(token);
      }
    } catch {
      // Local logout should still complete even when the remote logout fails.
    } finally {
      clearStoredAuthSession();
      router.replace("/");
    }
  };

  const onChangePasswordSubmit = handlePasswordSubmit(async (values) => {
    setPasswordChangeError(null);
    setToastMessage(null);

    if (!accessToken) {
      setPasswordChangeError("Không tìm thấy token đăng nhập.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        token: accessToken,
        payload: {
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
      });

      const refreshedProfile = await authMeQuery.refetch();

      if (refreshedProfile.data) {
        window.sessionStorage.setItem(
          USER_PROFILE_STORAGE_KEY,
          JSON.stringify(refreshedProfile.data),
        );

        if (refreshedProfile.data.phoneNumber) {
          window.sessionStorage.setItem(
            "mevi_user_identifier",
            refreshedProfile.data.phoneNumber,
          );
        }
      }

      resetPasswordForm();

      try {
        const lookup = getSurveyLookup();
        const surveyDetail = await surveyDetailMutation.mutateAsync({
          type: "general",
          value: lookup.value,
          lookupType: "phone",
          context: {
            companyId: lookup.companyId,
            userId: lookup.userId,
          },
        });

        if (hasPendingSurvey(surveyDetail)) {
          goToGeneralSurvey();
        }
      } catch {
        // Password change has already succeeded; survey check can be retried later.
      }
    } catch (error) {
      setPasswordChangeError(
        error instanceof Error
          ? error.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    }
  });

  const handleModuleClick =
    (mod: ModuleItem) => async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setToastMessage(null);

      if (!shouldCheckSurvey(mod)) {
        openModule(mod);
        return;
      }

      setLoadingModuleId(mod.id);
      const lookup = getSurveyLookup();

      try {
        const surveyDetail = await surveyDetailMutation.mutateAsync({
          type: mod.id,
          value: lookup.value,
          lookupType: lookup.type as SurveyLookupType,
          context: {
            companyId: lookup.companyId,
            userId: lookup.type === "userId" ? lookup.value : lookup.userId,
          },
        });

        setLoadingModuleId(null);

        if (
          surveyDetail &&
          surveyDetail.status !== "submitted" &&
          !surveyDetail.submittedAt
        ) {
          setPendingSurveyModule(mod);
          return;
        }

        openModule(mod);
      } catch (error) {
        setLoadingModuleId(null);
        setToastMessage(
          error instanceof Error
            ? error.message
            : "Không kiểm tra được trạng thái khảo sát. Vui lòng thử lại.",
        );
      }
    };

  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      {pendingSurveyModule && (
        <SurveyBranchConfirmModal
          surveyName={SURVEY_META[pendingSurveyModule.id].name}
          onCancel={() => setPendingSurveyModule(null)}
          onConfirm={() => {
            goToBranchSurvey(pendingSurveyModule);
            setPendingSurveyModule(null);
          }}
        />
      )}

      {loadingModuleId && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--mevi-green-50), var(--mevi-green-100))",
              border: "1px solid var(--mevi-border)",
            }}
          >
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "var(--mevi-green-700)" }}
            />
          </div>
          <div className="text-center">
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--mevi-text-primary)" }}
            >
              Đang mở ứng dụng...
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--mevi-text-muted)" }}
            >
              {modules.find((mod) => mod.id === loadingModuleId)?.name ??
                "MEVI"}{" "}
              đang được tải
            </p>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div
            className="rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md"
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              border: "1px solid rgba(212, 229, 216, 0.9)",
              boxShadow: "0 16px 40px -12px rgba(6, 78, 59, 0.18)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mevi-earth-100), var(--mevi-warm-100))",
                  color: "var(--mevi-earth-700)",
                }}
              >
                <Factory className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Tính năng đang phát triển
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--mevi-text-secondary)" }}
                >
                  {toastMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="rounded-lg p-1 transition-colors hover:bg-black/5"
                aria-label="Đóng thông báo"
              >
                <X
                  className="h-4 w-4"
                  style={{ color: "var(--mevi-text-muted)" }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <DecorativeLeaves />

      {/* Top Nav */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28 sm:pb-32">
        <MeviPortalHeader
          badgeLabel="Dashboard"
          className="flex flex-col gap-4 px-4 pt-6 opacity-0 animate-fade-in-up sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6 md:px-12 md:pt-8"
          style={{ animationFillMode: "forwards" }}
          cardClassName="shrink-0"
          rightSlotClassName="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4"
          rightSlot={
            <>
              <div
                className="flex min-w-0 items-center gap-2 text-sm"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--mevi-green-500), var(--mevi-green-700))",
                  }}
                >
                  {userInitials}
                </div>
                <span className="truncate font-medium">{displayName}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-60"
                style={{
                  color: "var(--mevi-text-muted)",
                }}
                title="Thoát"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>{isLoggingOut ? "Đang thoát..." : "Thoát"}</span>
              </button>
            </>
          }
        />

        {/* Main Content */}
        <main className="flex w-full flex-1 flex-col items-center px-4 pb-10 pt-4 sm:px-6 md:px-8 md:pb-14 md:pt-8">
          {mustChangePassword ? (
            <section className="mevi-login-card mx-auto flex w-full max-w-md flex-col rounded-[24px] p-5 opacity-0 animate-fade-in-up sm:p-6">
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
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Đổi mật khẩu
                  </h2>
                  <p
                    className="mt-1 text-sm leading-6"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Vui lòng cập nhật mật khẩu trước khi tiếp tục sử dụng hệ
                    sinh thái MEVI.
                  </p>
                </div>
              </div>

              <form
                onSubmit={onChangePasswordSubmit}
                className="flex flex-col gap-3"
              >
                <div className="space-y-1">
                  <label
                    htmlFor="newPassword"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Mật khẩu mới
                  </label>
                  <input
                    id="newPassword"
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
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="confirmPassword"
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
            </section>
          ) : (
            <>
              {/* Section Header */}
              <div
                className="mb-8 text-center opacity-0 animate-fade-in-up delay-100 md:mb-10"
                style={{ animationFillMode: "forwards" }}
              >
                <h2
                  className="text-2xl font-bold tracking-tight md:text-3xl"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Hệ sinh thái MEVI
                </h2>
                <p
                  className="mt-2 text-sm md:text-base"
                  style={{ color: "var(--mevi-text-secondary)" }}
                >
                  Chuỗi giá trị nông nghiệp khép kín — từ kiến thức đến thị
                  trường
                </p>
              </div>

              {/* Connection Flow Visualization */}
              <div
                className="mb-10 hidden w-full max-w-3xl items-center justify-center opacity-0 animate-fade-in-up delay-200 md:flex"
                style={{ animationFillMode: "forwards" }}
              >
                <div className="flex items-center justify-center w-full">
                  {modules.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                      <div key={mod.id} className="flex items-center">
                        <a
                          href={mod.href}
                          onClick={handleModuleClick(mod)}
                          className="flex flex-col items-center gap-2 flex-shrink-0 group no-underline transition-transform duration-200 hover:scale-110"
                          style={{ textDecoration: "none" }}
                        >
                          <div
                            className={`mevi-module-icon ${mod.variant} shadow-sm group-hover:shadow-md transition-shadow duration-200`}
                            style={{ width: 48, height: 48, borderRadius: 14 }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "var(--mevi-text-secondary)" }}
                          >
                            {mod.name.replace("Mevi ", "")}
                          </span>
                        </a>
                        {i < modules.length - 1 && (
                          <div
                            className="w-16 mx-3 flex items-center justify-center"
                            style={{ marginTop: "-20px" }}
                          >
                            <div
                              className="h-0.5 w-full rounded-full animate-grow-line"
                              style={{
                                background:
                                  "linear-gradient(90deg, var(--mevi-green-200), var(--mevi-green-300), var(--mevi-green-200))",
                                animationDelay: `${0.4 + i * 0.2}s`,
                                animationFillMode: "forwards",
                                opacity: 0.7,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {modules.map((mod, i) => {
                  const Icon = mod.icon;
                  const isActive = mod.status === "Hoạt động";
                  return (
                    <a
                      key={mod.id}
                      href={mod.href}
                      onClick={handleModuleClick(mod)}
                      className={`mevi-module-card ${mod.variant} opacity-0 animate-fade-in-up group`}
                      style={{
                        animationDelay: `${0.3 + i * 0.1}s`,
                        animationFillMode: "forwards",
                        textDecoration: "none",
                      }}
                    >
                      {/* Card Header */}
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className={`mevi-module-icon ${mod.variant}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-right"
                          style={{
                            background: isActive
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(156, 163, 175, 0.1)",
                            color: isActive
                              ? "var(--mevi-green-700)"
                              : "var(--mevi-text-muted)",
                            border: isActive
                              ? "1px solid rgba(16, 185, 129, 0.2)"
                              : "1px solid rgba(156, 163, 175, 0.2)",
                          }}
                        >
                          {mod.status}
                        </span>
                      </div>

                      {/* Card Body */}
                      <h4
                        className="text-base font-bold mb-1.5"
                        style={{ color: "var(--mevi-text-primary)" }}
                      >
                        {mod.name}
                      </h4>
                      <p
                        className="text-sm leading-relaxed mb-4"
                        style={{ color: "var(--mevi-text-secondary)" }}
                      >
                        {mod.description}
                      </p>
                      <p
                        className="text-xs leading-relaxed mb-5"
                        style={{ color: "var(--mevi-text-muted)" }}
                      >
                        {mod.longDesc}
                      </p>

                      {/* Card Footer */}
                      <div
                        className="mt-auto flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                        style={{ color: "var(--mevi-green-600)" }}
                      >
                        <span>Truy cập</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <MeviPortalFooter />
    </div>
  );
}
