"use client";

import Link from "next/link";
import { ArrowRight, Loader2, LockKeyhole, RefreshCw } from "lucide-react";
import { type FormEventHandler } from "react";
import {
  type FieldErrors,
  type UseFormRegisterReturn,
} from "react-hook-form";

type ForgotPasswordFormValues = {
  phoneNumber: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

type ForgotPasswordFormCardProps = {
  currentStep: "phone" | "verify";
  currentPhone: string;
  verifiedPhone: string;
  requestId: string;
  isRequestingOtp: boolean;
  isResettingPassword: boolean;
  errors: FieldErrors<ForgotPasswordFormValues>;
  phoneField: UseFormRegisterReturn<"phoneNumber">;
  otpField: UseFormRegisterReturn<"otp">;
  newPasswordField: UseFormRegisterReturn<"newPassword">;
  confirmPasswordField: UseFormRegisterReturn<"confirmPassword">;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onRequestOtp: () => void;
  onChangePhoneNumber: () => void;
  onResendOtp: () => void;
};

export function ForgotPasswordFormCard({
  currentStep,
  currentPhone,
  verifiedPhone,
  requestId,
  isRequestingOtp,
  isResettingPassword,
  errors,
  phoneField,
  otpField,
  newPasswordField,
  confirmPasswordField,
  onSubmit,
  onRequestOtp,
  onChangePhoneNumber,
  onResendOtp,
}: ForgotPasswordFormCardProps) {
  const canShowVerifyStep = currentStep === "verify" && Boolean(requestId);

  return (
    <section
      className="mevi-login-card w-full p-4 opacity-0 animate-fade-in-scale delay-300 sm:p-5 md:p-6"
      style={{ animationFillMode: "forwards" }}
      aria-labelledby="forgot-password-card-title"
    >
      <div className="mb-5 text-center">
        <div className="mb-3 inline-flex items-center justify-center animate-float">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <LockKeyhole className="h-5 w-5" />
          </div>
        </div>

        <h2
          id="forgot-password-card-title"
          className="text-lg font-bold tracking-normal"
          style={{ color: "var(--mevi-text-primary)" }}
        >
          Quên mật khẩu
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--mevi-text-muted)" }}>
          {currentStep === "phone"
            ? "Nhập số điện thoại để gửi OTP"
            : "Xác thực OTP và tạo mật khẩu mới"}
        </p>
      </div>

      <form className="space-y-3.5" onSubmit={onSubmit}>
        {currentStep === "phone" ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="forgot-password-phone"
                className="text-sm font-medium"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                Số điện thoại
              </label>
              <input
                id="forgot-password-phone"
                className="mevi-input"
                placeholder="Nhập số điện thoại"
                inputMode="tel"
                autoComplete="tel"
                {...phoneField}
              />
              {errors.phoneNumber?.message ? (
                <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onRequestOtp}
              className="mevi-btn-primary"
              disabled={isRequestingOtp}
            >
              <span className="flex items-center justify-center gap-2">
                {isRequestingOtp ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi OTP...
                  </>
                ) : (
                  <>
                    Gửi OTP
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </>
                )}
              </span>
            </button>
          </>
        ) : null}

        {canShowVerifyStep ? (
          <>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">OTP đã được gửi tới</p>
                  <p className="mt-1 text-sm text-emerald-800">{verifiedPhone}</p>
                </div>
                <button
                  type="button"
                  onClick={onChangePhoneNumber}
                  className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
                >
                  Đổi số điện thoại
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="forgot-password-otp"
                className="text-sm font-medium"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                OTP xác nhận
              </label>
              <input
                id="forgot-password-otp"
                className="mevi-input tracking-[0.4em]"
                placeholder="Nhập OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                {...otpField}
              />
              {errors.otp?.message ? (
                <p className="text-xs text-red-600">{errors.otp.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="forgot-password-new-password"
                className="text-sm font-medium"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                Mật khẩu mới
              </label>
              <input
                id="forgot-password-new-password"
                className="mevi-input"
                placeholder="Nhập mật khẩu mới"
                type="password"
                autoComplete="new-password"
                {...newPasswordField}
              />
              {errors.newPassword?.message ? (
                <p className="text-xs text-red-600">{errors.newPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="forgot-password-confirm-password"
                className="text-sm font-medium"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="forgot-password-confirm-password"
                className="mevi-input"
                placeholder="Nhập lại mật khẩu mới"
                type="password"
                autoComplete="new-password"
                {...confirmPasswordField}
              />
              {errors.confirmPassword?.message ? (
                <p className="text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="mevi-btn-primary"
              disabled={isResettingPassword || !requestId}
            >
              <span className="flex items-center justify-center gap-2">
                {isResettingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    Xác nhận
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </>
                )}
              </span>
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onResendOtp}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                disabled={isRequestingOtp || !currentPhone}
              >
                <span className="flex items-center justify-center gap-2">
                  {isRequestingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang gửi lại...
                    </>
                  ) : (
                    <>
                      Chưa nhận được OTP?
                      <RefreshCw className="h-4 w-4" />
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={onChangePhoneNumber}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Thay đổi số điện thoại
              </button>
            </div>
          </>
        ) : null}

        <p className="text-center text-sm leading-6" style={{ color: "var(--mevi-text-secondary)" }}>
          Quay lại{" "}
          <Link
            href="/"
            className="font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--mevi-green-700)" }}
          >
            trang đăng nhập
          </Link>
        </p>
      </form>
    </section>
  );
}
