"use client";

import { CheckCircle2, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { RegistrationProfileRequest } from "@/features/registration/api";

const DEFAULT_REGISTERED_PASSWORD = "123456";

export function RegistrationSuccessModal({
  open,
  submittedData,
  submittedAudienceLabel,
  onClose,
}: {
  open: boolean;
  submittedData: RegistrationProfileRequest | null;
  submittedAudienceLabel: string;
  onClose: () => void;
}) {
  if (!open || !submittedData) {
    return null;
  }

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-3 py-6 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] border border-emerald-100 bg-white shadow-[0_30px_80px_-30px_rgba(15,118,110,0.35)]">
        <div className="flex items-start justify-between gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
              style={{
                background:
                  "linear-gradient(135deg, var(--mevi-green-100), var(--mevi-green-200))",
                color: "var(--mevi-green-700)",
              }}
            >
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p
                id="registration-success-title"
                className="text-[15px] font-extrabold leading-[1.15] text-emerald-900 sm:text-xl"
              >
                Đăng ký thành công cho {submittedData.fullName}
              </p>
              <p className="mt-0.5 text-[11px] font-medium leading-4 text-emerald-700 sm:text-sm">
                Thông tin tài khoản bên dưới để bà con xem lại ngay.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-900 sm:h-9 sm:w-9"
            aria-label="Đóng thông báo"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        <div className="grid gap-2.5 px-3 py-3 sm:px-5 sm:py-5 lg:grid-cols-2">
          <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/80 p-3.5 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 sm:text-[11px] sm:tracking-[0.18em]">
              Thông tin đăng ký
            </p>
            <div className="mt-2.5 space-y-2 text-[13px] leading-5 text-emerald-900 sm:mt-3 sm:space-y-2.5 sm:text-base sm:leading-6">
              <p>
                <span className="font-semibold">Họ và tên:</span>{" "}
                {submittedData.fullName}
              </p>
              <p>
                <span className="font-semibold">SĐT:</span>{" "}
                {submittedData.phoneNumber}
              </p>
              <p>
                <span className="font-semibold">Năm sinh:</span>{" "}
                {submittedData.birthYear}
              </p>
              <p>
                <span className="font-semibold">Tỉnh/Thành phố:</span>{" "}
                {submittedData.province}
              </p>
              <p>
                <span className="font-semibold">Phường/Xã:</span>{" "}
                {submittedData.commune}
              </p>
              {submittedData.operatingArea ? (
                <p>
                  <span className="font-semibold">Khu vực hoạt động:</span>{" "}
                  {submittedData.operatingArea}
                </p>
              ) : null}
              <p>
                <span className="font-semibold">Nhóm đối tượng:</span>{" "}
                {submittedAudienceLabel}
              </p>
              {submittedData.referrerPhoneNumber ? (
                <p>
                  <span className="font-semibold">Người giới thiệu:</span>{" "}
                  {submittedData.referrerPhoneNumber}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[20px] border border-amber-200 bg-amber-50/90 p-3.5 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.18em]">
              Tài khoản đăng nhập
            </p>
            <div className="mt-2.5 space-y-2.5 text-[13px] leading-5 text-amber-950 sm:mt-3 sm:space-y-3 sm:text-base sm:leading-6">
              <div>
                <p className="text-xs font-medium text-amber-800">Tài khoản</p>
                <p className="text-lg font-bold tracking-[0.01em] sm:text-2xl">
                  {submittedData.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-amber-800">Mật khẩu</p>
                <p className="text-lg font-bold tracking-[0.1em] sm:text-2xl">
                  {DEFAULT_REGISTERED_PASSWORD}
                </p>
              </div>
              <p className="mt-1 text-[11px] italic leading-5 text-amber-900/80 sm:text-sm">
                Vui lòng lưu lại tài khoản và mật khẩu để đăng nhập lần sau.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
