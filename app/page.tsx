"use client";

import {
  ArrowRight,
  BookOpen,
  Factory,
  Link2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function EcosystemFlowMini() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 py-2 opacity-0 animate-fade-in-up delay-500"
      style={{ animationFillMode: "forwards" }}
    >
      {modules.map((mod, i) => (
        <div key={mod.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${mod.dotColor}`}></div>
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

/* ===== Login Page ===== */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mevi@gmail.com");
  const [password, setPassword] = useState("Admin1234!");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      window.sessionStorage.setItem("mevi_user_email", email);
      window.sessionStorage.setItem("mevi_user_name", "Tài khoản quản trị MEVI");
      router.push("/survey?surveyId=396&source=login&returnTo=%2Fdashboard");
    }, 1200);
  };

  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />

      <nav
        className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 opacity-0 animate-fade-in-up sm:px-6 md:px-10"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/mevi-logo.jpeg"
            alt="MEVI Logo"
            className="h-9 w-9 rounded-xl object-contain shadow-sm sm:h-10 sm:w-10"
            style={{ border: "1px solid var(--mevi-border)" }}
          />
          <div className="min-w-0">
            <h1
              className="text-base font-bold tracking-tight sm:text-lg"
              style={{ color: "var(--mevi-text-primary)" }}
            >
              MEVI
            </h1>
            <p
              className="mt-[-2px] truncate text-[10px] font-medium leading-tight sm:text-[11px]"
              style={{ color: "var(--mevi-text-muted)" }}
            >
              Hệ sinh thái Nông nghiệp
            </p>
          </div>
        </div>
        <div className="mevi-badge hidden sm:flex">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Nền tảng bảo mật</span>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center px-4 pb-4 pt-1 sm:px-6 md:justify-start md:px-8 md:pt-2">
        <div className="w-full md:hidden">
          <div className="mx-auto w-full max-w-[22rem]">
            <div
              className="mevi-login-card w-full p-4 opacity-0 animate-fade-in-scale delay-300"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="mb-4 text-center sm:mb-5">
                <div className="mb-3 inline-flex items-center justify-center animate-float">
                  <img
                    src="/mevi-logo.jpeg"
                    alt="MEVI Logo"
                    className="h-9 w-9 rounded-xl object-contain shadow-sm"
                    style={{ border: "1px solid var(--mevi-border)" }}
                  />
                </div>

                <h2
                  className="text-lg font-bold tracking-tight sm:text-[1.35rem]"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Chào mừng trở lại
                </h2>
                <p
                  className="mt-1 text-xs sm:text-sm"
                  style={{ color: "var(--mevi-text-muted)" }}
                >
                  Đăng nhập để tiếp tục
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Email / Số điện thoại
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                      style={{ color: "var(--mevi-text-muted)" }}
                    />
                    <input
                      id="login-email"
                      type="text"
                      className="mevi-input"
                      style={{ paddingLeft: "44px" }}
                      placeholder="nguyenvana@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium hover:underline"
                      style={{ color: "var(--mevi-green-600)" }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                      style={{ color: "var(--mevi-text-muted)" }}
                    />
                    <input
                      id="login-password"
                      type="password"
                      className="mevi-input"
                      style={{ paddingLeft: "44px" }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "var(--mevi-green-600)" }}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="pt-0.5">
                  <button
                    type="submit"
                    className="mevi-btn-primary"
                    disabled={isLoggingIn}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          Đăng nhập
                          <ArrowRight className="h-[18px] w-[18px]" />
                        </>
                      )}
                    </span>
                  </button>
                </div>

                <p
                  className="text-center text-sm"
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

                <div className="pt-1">
                  <EcosystemFlowMini />
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden w-full md:block">
          <div className="mevi-desktop-shell mx-auto flex w-full max-w-xl flex-col items-center">
            <div className="mb-4 max-w-2xl text-center lg:mb-6">
              <div
                className="opacity-0 animate-fade-in-up delay-100"
                style={{ animationFillMode: "forwards" }}
              >
                <div className="mevi-ecosystem-badge mx-auto mb-3 text-xs py-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Mevi Ecosystem</span>
                </div>
              </div>

              <h2
                className="text-balance text-[clamp(1.9rem,3.4vw,2.9rem)] font-extrabold leading-[1.08] tracking-tight opacity-0 animate-fade-in-up delay-200"
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
              </h2>

              <EcosystemFlowMini />
            </div>

            <div
              className="mevi-login-card mevi-desktop-card w-full max-w-[22rem] p-5 opacity-0 animate-fade-in-scale delay-300 md:p-6"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="mb-5 text-center sm:mb-6">
                <div className="mb-3 inline-flex items-center justify-center animate-float">
                  <img
                    src="/mevi-logo.jpeg"
                    alt="MEVI Logo"
                    className="h-9 w-9 rounded-xl object-contain shadow-sm"
                    style={{ border: "1px solid var(--mevi-border)" }}
                  />
                </div>
                <h3
                  className="text-base font-bold"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Chào mừng trở lại!
                </h3>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--mevi-text-muted)" }}
                >
                  Đăng nhập vào hệ thống MEVI
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email-tablet"
                    className="block text-sm font-medium"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Email / Số điện thoại
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                      style={{ color: "var(--mevi-text-muted)" }}
                    />
                    <input
                      id="login-email-tablet"
                      type="text"
                      className="mevi-input"
                      style={{ paddingLeft: "44px" }}
                      placeholder="nguyenvana@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password-tablet"
                      className="block text-sm font-medium"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium hover:underline"
                      style={{ color: "var(--mevi-green-600)" }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                      style={{ color: "var(--mevi-text-muted)" }}
                    />
                    <input
                      id="login-password-tablet"
                      type="password"
                      className="mevi-input"
                      style={{ paddingLeft: "44px" }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="remember-me-tablet"
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "var(--mevi-green-600)" }}
                  />
                  <label
                    htmlFor="remember-me-tablet"
                    className="text-sm"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="mevi-btn-primary"
                    disabled={isLoggingIn}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          Đăng nhập
                          <ArrowRight className="h-[18px] w-[18px]" />
                        </>
                      )}
                    </span>
                  </button>
                </div>

                <p
                  className="text-center text-sm"
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
            </div>
          </div>
        </div>
      </main>

      <footer
        className="mevi-desktop-footer relative z-10 mt-auto hidden w-full px-4 py-4 text-center md:block"
        style={{
          borderTop: "1px solid var(--mevi-border)",
          background: "rgba(255,255,255,0.3)",
        }}
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <img
            src="/mevi-logo.jpeg"
            alt="MEVI"
            className="h-6 w-6 rounded-lg object-contain"
          />
          <span
            className="text-sm font-bold"
            style={{ color: "var(--mevi-text-primary)" }}
          >
            MEVI
          </span>
        </div>
        <p
          className="mx-auto max-w-md whitespace-nowrap text-xs leading-relaxed sm:max-w-none"
          style={{ color: "var(--mevi-text-muted)" }}
        >
          © 2026 MEVI — Hệ sinh thái Nông nghiệp thông minh. Tất cả quyền được
          bảo lưu.
        </p>
      </footer>
    </div>
  );
}
