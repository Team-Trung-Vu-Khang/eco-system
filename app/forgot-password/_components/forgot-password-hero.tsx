"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import { ForgotPasswordStepPill } from "./forgot-password-step-pill";

type ForgotPasswordHeroProps = {
  currentStep: "phone" | "verify";
};

export function ForgotPasswordHero({ currentStep }: ForgotPasswordHeroProps) {
  return (
    <div className="mx-auto w-full max-w-2xl text-center md:mx-0 md:text-left">
      <div
        className="opacity-0 animate-fade-in-up delay-100"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="mevi-ecosystem-badge mx-auto mb-3 text-xs md:mx-0">
          <LockKeyhole className="h-3.5 w-3.5" />
          <span>Khôi phục truy cập</span>
        </div>
      </div>

      <h1
        className="text-balance text-3xl font-extrabold leading-tight tracking-normal opacity-0 animate-fade-in-up delay-200 sm:text-4xl lg:text-5xl"
        style={{
          color: "var(--mevi-text-primary)",
          animationFillMode: "forwards",
        }}
      >
        Lấy lại mật khẩu
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--mevi-green-600), var(--mevi-green-800))",
          }}
        >
          trong vài bước đơn giản
        </span>
      </h1>

      <p
        className="mx-auto mt-3 max-w-xl text-sm leading-6 opacity-0 animate-fade-in-up delay-300 sm:text-base md:mx-0"
        style={{
          color: "var(--mevi-text-secondary)",
          animationFillMode: "forwards",
        }}
      >
        Nhập số điện thoại trước, sau đó xác thực OTP và tạo mật khẩu mới trong
        cùng một luồng rõ ràng, không bị nhảy giữa các bước.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2 text-left md:justify-start">
        <ForgotPasswordStepPill
          index={1}
          label="Số điện thoại"
          active={currentStep === "phone"}
          completed={currentStep === "verify"}
        />
        <ForgotPasswordStepPill
          index={2}
          label="Xác thực OTP"
          active={currentStep === "verify"}
          completed={false}
        />
        <ForgotPasswordStepPill index={3} label="Đăng nhập lại" active={false} completed={false} />
      </div>

      <div className="mt-4 hidden items-center gap-2 text-sm text-[var(--mevi-text-muted)] md:inline-flex">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <span>Đặt lại mật khẩu an toàn trong một luồng duy nhất</span>
      </div>
    </div>
  );
}

