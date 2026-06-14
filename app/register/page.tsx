"use client";

import {
  CheckCircle2,
  LogOut,
  Loader2,
  MapPin,
  Phone,
  Sprout,
  X,
  User,
} from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import type {
  RegistrationAudienceType,
  RegistrationProfileRequest,
} from "@/features/registration/api";
import { useRegistrationMutation } from "@/features/registration/hooks";

const audienceOptions: Array<{
  value: RegistrationAudienceType;
  label: string;
}> = [
  { value: "individual", label: "A. Cá nhân/Hộ nông dân." },
  { value: "cooperative", label: "B. Tổ hợp tác/Hợp tác xã." },
  { value: "business", label: "C. Doanh nghiệp/Cơ sở sản xuất." },
  {
    value: "other",
    label: "D. Khác (Sinh viên, người yêu nông nghiệp...).",
  },
];

const DEFAULT_REGISTERED_PASSWORD = "123456";

type RegistrationFormValues = {
  fullName: string;
  phoneNumber: string;
  birthYear: string;
  operatingArea: string;
  audienceType: RegistrationAudienceType | "";
  audienceTypeOther: string;
};

function getAudienceTypeLabel(audienceType: RegistrationAudienceType) {
  return (
    audienceOptions.find((option) => option.value === audienceType)?.label ??
    audienceType
  );
}

function DecorativeLeaves() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute -top-4 -right-12 h-64 w-64 opacity-[0.04] animate-leaf-sway"
        viewBox="0 0 200 200"
      >
        <path
          d="M120 20 C160 40, 180 80, 170 130 C160 160, 130 180, 90 170 C60 160, 40 130, 50 90 C55 60, 80 30, 120 20Z"
          fill="currentColor"
          className="text-green-700"
        />
      </svg>
      <svg
        className="absolute -bottom-8 -left-16 h-48 w-48 opacity-[0.03]"
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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-600">{message}</p>;
}

export default function RegistrationPage() {
  const [submittedData, setSubmittedData] =
    useState<RegistrationProfileRequest | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const registrationMutation = useRegistrationMutation();

  const currentYear = new Date().getFullYear();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      birthYear: "",
      operatingArea: "",
      audienceType: "",
      audienceTypeOther: "",
    },
  });

  const selectedAudienceType = useWatch({
    control,
    name: "audienceType",
  });
  const isSubmittingForm = registrationMutation.isPending;
  const submittedAudienceLabel = submittedData
    ? submittedData.audienceType === "other" && submittedData.audienceTypeOther
      ? submittedData.audienceTypeOther
      : getAudienceTypeLabel(submittedData.audienceType)
    : "";

  const onSubmit = handleSubmit(async (values) => {
    const payload: RegistrationProfileRequest = {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      birthYear: Number(values.birthYear),
      operatingArea: values.operatingArea.trim(),
      audienceType: values.audienceType as RegistrationAudienceType,
    };

    if (payload.audienceType === "other") {
      payload.audienceTypeOther = values.audienceTypeOther.trim();
    }

    try {
      await registrationMutation.mutateAsync(payload);
      setSubmittedData(payload);
      setIsSuccessModalOpen(true);
      reset();
    } catch {
      setSubmittedData(null);
      setIsSuccessModalOpen(false);
    }
  });

  const successModal =
    submittedData && isSuccessModalOpen ? (
      <div
        className="fixed inset-0 z-[9999] flex min-h-[100dvh] w-[100dvw] items-center justify-center bg-black/35 px-2.5 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-success-title"
      >
        <div className="w-full max-w-[680px] overflow-hidden rounded-[22px] bg-white shadow-[0_30px_90px_-24px_rgba(15,23,42,0.45)] animate-fade-in-scale sm:max-w-2xl">
          <div className="flex items-center justify-between border-b border-emerald-100 px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
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
              onClick={() => setIsSuccessModalOpen(false)}
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
                  <span className="font-semibold">Khu vực:</span>{" "}
                  {submittedData.operatingArea}
                </p>
                <p>
                  <span className="font-semibold">Nhóm đối tượng:</span>{" "}
                  {submittedAudienceLabel}
                </p>
              </div>
            </div>

            <div className="rounded-[20px] border border-amber-200 bg-amber-50/90 p-3.5 sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.18em]">
                Tài khoản đăng nhập
              </p>
              <div className="mt-2.5 space-y-2.5 text-[13px] leading-5 text-amber-950 sm:mt-3 sm:space-y-3 sm:text-base sm:leading-6">
                <div>
                  <p className="text-xs font-medium text-amber-800">
                    Tài khoản
                  </p>
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
    ) : null;

  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(13rem+env(safe-area-inset-bottom))] sm:pb-32">
        <MeviPortalHeader
          badgeLabel="Đăng ký"
          className="px-4 py-4 sm:px-6 md:px-10"
          rightSlot={
            <>
              <div className="sm:hidden">
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium opacity-80 transition hover:opacity-100"
                  style={{ color: "var(--mevi-text-muted)" }}
                >
                  <LogOut className="h-4 w-4" />
                  Quay lại
                </Link>
              </div>

              <div className="hidden items-center gap-5 sm:flex">
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium opacity-80 transition hover:opacity-100"
                  style={{ color: "var(--mevi-text-muted)" }}
                >
                  <LogOut className="h-4 w-4" />
                  Quay lại
                </Link>
              </div>
            </>
          }
        />

        <main className="flex w-full flex-1 items-center px-3 py-2 sm:px-6 md:px-10">
          <div className="mx-auto grid w-full max-w-5xl gap-3 lg:grid-cols-[0.88fr_1.12fr]">
            <section className="hidden flex-col justify-center lg:flex">
              <div className="mevi-ecosystem-badge mb-3 w-fit px-3 py-1 text-[11px]">
                <Sprout className="h-3 w-3" />
                <span>Mevi Registration</span>
              </div>

              <h2
                className="max-w-xl text-balance text-[clamp(1.75rem,3.2vw,2.85rem)] font-bold leading-[1.07] tracking-[-0.02em]"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                Đăng ký để tham gia
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--mevi-green-600), var(--mevi-earth-600))",
                  }}
                >
                  hệ sinh thái nông nghiệp MEVI
                </span>
              </h2>

              <p
                className="mt-3 max-w-lg text-[15px] leading-7"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                Điền nhanh các thông tin cơ bản để đội ngũ MEVI hiểu hơn về khu
                vực hoạt động và nhóm đối tượng bạn đang hướng tới.
              </p>

              <div className="mt-4 grid gap-2.5">
                <div className="mevi-login-card rounded-2xl p-3 shadow-[0_8px_18px_-14px_rgba(6,78,59,0.25)]">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Bước 1
                  </p>
                  <p
                    className="mt-1.5 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Cung cấp thông tin cá nhân
                  </p>
                </div>

                <div className="mevi-login-card rounded-2xl p-3 shadow-[0_8px_18px_-14px_rgba(6,78,59,0.25)]">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Bước 2
                  </p>
                  <p
                    className="mt-1.5 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Xác định khu vực hoạt động
                  </p>
                </div>

                <div className="mevi-login-card rounded-2xl p-3 shadow-[0_8px_18px_-14px_rgba(6,78,59,0.25)]">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Bước 3
                  </p>
                  <p
                    className="mt-1.5 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Chọn nhóm đối tượng phù hợp
                  </p>
                </div>
              </div>
            </section>

            <section className="mevi-login-card mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col rounded-[24px] p-4 sm:p-[18px] md:p-5">
              <div className="mb-3">
                <h3
                  className="text-base font-bold md:text-lg"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Phiếu đăng ký
                </h3>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
                <div className="grid gap-2.5 pr-1">
                  <div className="space-y-1">
                    <label
                      htmlFor="fullName"
                      className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      <User className="h-4 w-4" />
                      1. Họ và tên của bạn
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="mevi-input"
                      placeholder="Nguyễn Văn A"
                      {...register("fullName", {
                        required: "Vui lòng nhập họ và tên.",
                        maxLength: {
                          value: 255,
                          message: "Họ và tên tối đa 255 ký tự.",
                        },
                      })}
                    />
                    <FieldError message={errors.fullName?.message} />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="phoneNumber"
                      className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      <Phone className="h-4 w-4" />
                      2. Số điện thoại
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      className="mevi-input"
                      placeholder="09xxxxxxxx"
                      {...register("phoneNumber", {
                        required: "Vui lòng nhập số điện thoại.",
                        maxLength: {
                          value: 32,
                          message: "Số điện thoại tối đa 32 ký tự.",
                        },
                        pattern: {
                          value: /^(?:\+84|0)(3|5|7|8|9)\d{8}$/,
                          message: "Số điện thoại chưa đúng định dạng.",
                        },
                      })}
                    />
                    <FieldError message={errors.phoneNumber?.message} />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="birthYear"
                      className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      3. Năm sinh
                    </label>
                    <input
                      id="birthYear"
                      type="number"
                      className="mevi-input"
                      placeholder="1995"
                      {...register("birthYear", {
                        required: "Vui lòng nhập năm sinh.",
                        validate: (value) => {
                          const year = Number(value);
                          if (!Number.isInteger(year)) {
                            return "Năm sinh không hợp lệ.";
                          }
                          if (year < 1900 || year > 2100) {
                            return "Năm sinh cần nằm trong khoảng 1900 - 2100.";
                          }
                          if (year > currentYear) {
                            return `Năm sinh không được lớn hơn ${currentYear}.`;
                          }
                          return true;
                        },
                      })}
                    />
                    <FieldError message={errors.birthYear?.message} />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="operatingArea"
                      className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      <MapPin className="h-4 w-4" />
                      4. Địa chỉ khu vực bạn đang hoạt động (Tỉnh/Thành phố)
                    </label>
                    <input
                      id="operatingArea"
                      type="text"
                      className="mevi-input"
                      placeholder="Ví dụ: Đắk Lắk, Cần Thơ, Hà Nội"
                      {...register("operatingArea", {
                        required: "Vui lòng nhập tỉnh/thành phố.",
                        maxLength: {
                          value: 150,
                          message: "Khu vực hoạt động tối đa 150 ký tự.",
                        },
                      })}
                    />
                    <FieldError message={errors.operatingArea?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <p
                      className="text-xs font-semibold sm:text-sm"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      5. Bạn thuộc nhóm đối tượng nào?
                    </p>

                    <div className="grid gap-1.5 rounded-xl border border-[var(--mevi-border)] bg-white/60 p-2.5">
                      {audienceOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-0.5"
                          style={{ color: "var(--mevi-text-primary)" }}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            className="mt-0.5 h-4 w-4"
                            style={{ accentColor: "var(--mevi-green-600)" }}
                            {...register("audienceType", {
                              required: "Vui lòng chọn một nhóm đối tượng.",
                            })}
                          />
                          <span className="text-xs leading-5">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <FieldError message={errors.audienceType?.message} />
                  </div>

                  {selectedAudienceType === "other" ? (
                    <div className="space-y-1">
                      <label
                        htmlFor="audienceTypeOther"
                        className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
                        style={{ color: "var(--mevi-text-secondary)" }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Vui lòng mô tả nhóm đối tượng khác
                      </label>
                      <input
                        id="audienceTypeOther"
                        type="text"
                        className="mevi-input"
                        placeholder="Ví dụ: Sinh viên, người yêu nông nghiệp..."
                        {...register("audienceTypeOther", {
                          validate: (value, formValues) => {
                            if (
                              formValues.audienceType === "other" &&
                              !value.trim()
                            ) {
                              return "Vui lòng nhập nhóm đối tượng khác.";
                            }

                            return true;
                          },
                          maxLength: {
                            value: 255,
                            message: "Nội dung tối đa 255 ký tự.",
                          },
                        })}
                      />
                      <FieldError message={errors.audienceTypeOther?.message} />
                    </div>
                  ) : null}

                  {registrationMutation.isError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50/90 p-2.5">
                      <p className="text-xs font-semibold text-red-700 sm:text-sm">
                        {registrationMutation.error.message}
                      </p>
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="mevi-btn-primary h-10 rounded-xl text-sm"
                  disabled={isSubmittingForm}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isSubmittingForm ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang gửi đăng ký...
                      </>
                    ) : (
                      "Gửi thông tin đăng ký"
                    )}
                  </span>
                </button>
              </form>

              {typeof document !== "undefined"
                ? createPortal(successModal, document.body)
                : null}
            </section>
          </div>
        </main>
      </div>

      <MeviPortalFooter />
    </div>
  );
}
