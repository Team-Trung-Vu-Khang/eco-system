"use client";

import {
  Sprout,
  BookOpen,
  Factory,
  ShoppingBag,
  ArrowRight,
  LogOut,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SurveyBranchConfirmModal } from "@/app/survey/_components/survey-branch-confirm-modal";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import {
  DEFAULT_SURVEY_LOOKUP_VALUE,
  SURVEY_META,
} from "@/features/survey/constants/survey.constants";
import { fetchSurveyDetail } from "@/features/survey/api";
import type {
  SurveyLookupType,
  SurveyRequestType,
} from "@/features/survey/api";
import { getStoredLookupType } from "@/features/survey/utils/survey-flow";

/* ===== Module Data ===== */

const SSO_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_AUTH_API_BASE ?? "http://api-be-mevi.otechz.com";
const TOKEN_STORAGE_KEY = "mevi_access_token";
const AUTH_SESSION_KEYS = [
  TOKEN_STORAGE_KEY,
  "mevi_user_profile",
  "mevi_sso_provider",
  "mevi_user_identifier",
  "mevi_user_lookup_type",
  "mevi_user_email",
  "mevi_user_name",
  "mevi_session_id",
  "mevi_company_id",
  "mevi_user_id",
] as const;

function buildLogoutUrl() {
  return new URL("/auth/logout", SSO_API_BASE).toString();
}

function clearStoredAuthSession() {
  AUTH_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
}

function getLogoutErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const message = record.message ?? record.error;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
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
    const message = getLogoutErrorMessage(payload);

    throw new Error(message || "Không thể đăng xuất. Vui lòng thử lại.");
  }
}

const modules = [
  {
    id: "edu",
    name: "Mevi Edu",
    description: "Đào tạo & hướng dẫn kỹ thuật nông nghiệp",
    longDesc:
      "Hệ thống giáo dục trực tuyến, tài liệu kỹ thuật canh tác, hướng dẫn sử dụng phân bón và quy trình sản xuất.",
    icon: BookOpen,
    variant: "edu" as const,
    href: "https://mevi.edtexco.vn",
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingSurveyModule, setPendingSurveyModule] =
    useState<BranchModule | null>(null);

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
      window.sessionStorage.getItem("mevi_user_identifier") ??
      window.sessionStorage.getItem("mevi_user_email") ??
      DEFAULT_SURVEY_LOOKUP_VALUE;
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

  const shouldCheckSurvey = (mod: ModuleItem): mod is BranchModule =>
    mod.id === "farm" || mod.id === "factory" || mod.id === "shop";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setToastMessage(null);
    setIsLoggingOut(true);

    const token = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);

    try {
      if (token) {
        await requestLogout(token);
      }

      clearStoredAuthSession();
      router.replace("/");
    } catch (error) {
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Không thể đăng xuất. Vui lòng thử lại.",
      );
      setIsLoggingOut(false);
    }
  };

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
        const surveyDetail = await fetchSurveyDetail(
          mod.id,
          lookup.value,
          lookup.type as SurveyLookupType,
          {
            companyId: lookup.companyId,
            userId: lookup.type === "userId" ? lookup.value : lookup.userId,
          },
        );

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
                  NV
                </div>
                <span className="truncate font-medium">Nguyễn Văn A</span>
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
            Chuỗi giá trị nông nghiệp khép kín — từ kiến thức đến thị trường
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
        </main>
      </div>

      {/* Footer */}
      <MeviPortalFooter />
    </div>
  );
}
