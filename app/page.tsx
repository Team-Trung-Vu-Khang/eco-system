"use client";

import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import {
  ArrowRight,
  BookOpen,
  Factory,
  Link2,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Sprout,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SSO_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_AUTH_API_BASE ??
  "https://api-be-mevi.otechz.com";
const SSO_PROVIDER = "center";

function buildSsoLoginUrl(origin: string) {
  const callbackUrl = new URL("/auth/callback", origin);
  const loginUrl = new URL(`/auth/login/${SSO_PROVIDER}`, SSO_API_BASE);

  loginUrl.searchParams.set("callback_url", callbackUrl.toString());

  return loginUrl.toString();
}

/* ===== Module Quick Access Data ===== */

const modules = [
  {
    id: "edu",
    name: "Edu",
    icon: BookOpen,
    variant: "edu" as const,
    dotColor: "bg-blue-400",
  },
  {
    id: "farm",
    name: "Farm",
    icon: Sprout,
    variant: "farm" as const,
    dotColor: "bg-green-400",
  },
  {
    id: "factory",
    name: "Factory",
    icon: Factory,
    variant: "factory" as const,
    dotColor: "bg-orange-400",
  },
  {
    id: "shop",
    name: "Shop",
    icon: ShoppingBag,
    variant: "shop" as const,
    dotColor: "bg-purple-400",
  },
];

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

/* ===== Ecosystem Flow Mini ===== */

type EcosystemFlowMiniProps = {
  className?: string;
};

function EcosystemFlowMini({ className = "" }: EcosystemFlowMiniProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 py-2 opacity-0 animate-fade-in-up delay-500 ${className}`.trim()}
      style={{ animationFillMode: "forwards" }}
    >
      {modules.map((mod, i) => (
        <div key={mod.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 shadow-sm ring-1 ring-[rgba(212,229,216,0.55)]">
            <span className={`h-2 w-2 rounded-full ${mod.dotColor}`} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--mevi-text-muted)" }}
            >
              {mod.name}
            </span>
          </div>
          {i < modules.length - 1 && (
            <div
              className="hidden sm:block w-4 h-px bg-gradient-to-r from-green-300 to-green-200 animate-grow-line"
              style={{
                animationDelay: `${0.6 + i * 0.1}s`,
                animationFillMode: "forwards",
              }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}

type LoginPanelProps = {
  isLoggingIn: boolean;
  onSubmit: (event: React.FormEvent) => void;
};

function LoginPanel({ isLoggingIn, onSubmit }: LoginPanelProps) {
  return (
    <section
      className="mevi-login-card w-full p-4 opacity-0 animate-fade-in-scale delay-300 sm:p-5 md:p-6"
      style={{ animationFillMode: "forwards" }}
      aria-labelledby="login-card-title"
    >
      <div className="mb-5 text-center">
        <div className="mb-3 inline-flex items-center justify-center animate-float">
          <Image
            src="/mevi-logo.jpeg"
            alt="MEVI Logo"
            className="h-10 w-10 rounded-xl object-contain shadow-sm"
            width={40}
            height={40}
            style={{ border: "1px solid var(--mevi-border)" }}
          />
        </div>

        <h2
          id="login-card-title"
          className="text-lg font-bold tracking-normal"
          style={{ color: "var(--mevi-text-primary)" }}
        >
          Chào mừng trở lại
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--mevi-text-muted)" }}>
          Đăng nhập vào hệ thống MEVI
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <button
          type="submit"
          className="mevi-btn-primary"
          disabled={isLoggingIn}
        >
          <span className="flex items-center justify-center gap-2">
            {isLoggingIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang truy cập...
              </>
            ) : (
              <>
                Truy cập
                <ArrowRight className="h-[18px] w-[18px]" />
              </>
            )}
          </span>
        </button>

        <p
          className="text-center text-sm leading-6"
          style={{ color: "var(--mevi-text-secondary)" }}
        >
          Bạn đã có tài khoản chưa?{" "}
          <Link
            href="/register"
            className="font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--mevi-green-700)" }}
          >
            Đăng ký
          </Link>
        </p>
      </form>
    </section>
  );
}

/* ===== Login Page ===== */

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handlePageShow = () => {
      setIsLoggingIn(false);
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      window.location.assign(buildSsoLoginUrl(window.location.origin));
    } catch {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28 sm:pb-32">
        <MeviPortalHeader
          badgeLabel="Đăng nhập"
          className="opacity-0 animate-fade-in-up px-4 py-4 sm:px-6 md:px-10"
          style={{ animationFillMode: "forwards" }}
          rightSlot={
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nền tảng bảo mật</span>
            </>
          }
          rightSlotClassName="mevi-badge hidden sm:flex"
        />

        <main className="relative z-10 flex w-full flex-1 items-center px-4 pb-6 pt-2 sm:px-6 sm:pt-4 md:px-10 md:pb-8 lg:px-14">
          <section className="mx-auto grid w-full max-w-6xl items-center gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] md:gap-10 lg:gap-14">
            <div className="mx-auto w-full max-w-2xl text-center md:mx-0 md:text-left">
              <div
                className="opacity-0 animate-fade-in-up delay-100"
                style={{ animationFillMode: "forwards" }}
              >
                <div className="mevi-ecosystem-badge mx-auto mb-3 text-xs md:mx-0">
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Mevi Ecosystem</span>
                </div>
              </div>

              <h1
                className="text-balance text-3xl font-extrabold leading-tight tracking-normal opacity-0 animate-fade-in-up delay-200 sm:text-4xl lg:text-5xl"
                style={{
                  color: "var(--mevi-text-primary)",
                  animationFillMode: "forwards",
                }}
              >
                Nền tảng quản lý
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--mevi-green-600), var(--mevi-green-800))",
                  }}
                >
                  Nông nghiệp thông minh
                </span>
              </h1>

              <p
                className="mx-auto mt-3 max-w-xl text-sm leading-6 opacity-0 animate-fade-in-up delay-300 sm:text-base md:mx-0"
                style={{
                  color: "var(--mevi-text-secondary)",
                  animationFillMode: "forwards",
                }}
              >
                Một cổng đăng nhập cho toàn bộ hệ sinh thái MEVI, giúp kết nối
                giáo dục, nông trại, nhà máy và cửa hàng trong cùng một luồng
                làm việc.
              </p>

              <EcosystemFlowMini className="mt-3 md:justify-start" />
            </div>

            <div className="mx-auto w-full max-w-[24rem] md:mx-0 md:justify-self-end">
              <LoginPanel isLoggingIn={isLoggingIn} onSubmit={handleLogin} />
            </div>
          </section>
        </main>
      </div>

      <MeviPortalFooter />
    </div>
  );
}
