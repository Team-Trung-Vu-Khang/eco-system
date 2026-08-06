"use client";

import { CheckCircle2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldError } from "./field-error";
import { RequiredMark } from "./required-mark";
import type { RegistrationFormValues } from "./registration-form.types";

const audienceOptions: Array<{
  value: NonNullable<RegistrationFormValues["audienceType"]>;
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

export function RegistrationAudienceSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();
  const selectedAudienceType = useWatch({
    control,
    name: "audienceType",
  });

  return (
    <div className="space-y-1.5">
      <p
        className="text-xs font-semibold sm:text-sm"
        style={{ color: "var(--mevi-text-secondary)" }}
      >
        8. Bạn thuộc nhóm đối tượng nào?
        <RequiredMark />
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
            <span className="text-xs leading-5">{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError message={errors.audienceType?.message} />

      {selectedAudienceType === "other" ? (
        <div className="space-y-1">
          <label
            htmlFor="audienceTypeOther"
            className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
            style={{ color: "var(--mevi-text-secondary)" }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Vui lòng mô tả nhóm đối tượng khác
            <RequiredMark />
          </label>
          <input
            id="audienceTypeOther"
            type="text"
            className="mevi-input"
            placeholder="Ví dụ: Sinh viên, người yêu nông nghiệp..."
            {...register("audienceTypeOther", {
              validate: (value, formValues) => {
                if (formValues.audienceType === "other" && !value.trim()) {
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
    </div>
  );
}
