"use client";

import { CheckCircle2, Phone, User } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FieldError } from "./field-error";
import { RequiredMark } from "./required-mark";
import type { RegistrationFormValues } from "./registration-form.types";

export function RegistrationBasicFields({
  currentYear,
}: {
  currentYear: number;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  return (
    <>
      <div className="space-y-1">
        <label
          htmlFor="fullName"
          className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
          style={{ color: "var(--mevi-text-secondary)" }}
        >
          <User className="h-4 w-4" />
          1. Họ và tên của bạn
          <RequiredMark />
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
          <RequiredMark />
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
              value: /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/,
              message: "Vui lòng nhập số điện thoại hợp lệ.",
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
          4. Năm sinh
          <RequiredMark />
        </label>
        <input
          id="birthYear"
          type="number"
          className="mevi-input"
          placeholder="1995"
          {...register("birthYear", {
            required: "Vui lòng nhập năm sinh.",
            validate: (value) => {
              const inputValue = String(value ?? "").trim();

              if (!inputValue) {
                return "Vui lòng nhập năm sinh.";
              }

              const year = Number(inputValue);

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
    </>
  );
}
