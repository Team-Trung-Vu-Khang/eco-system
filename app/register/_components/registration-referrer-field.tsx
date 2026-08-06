"use client";

import { Loader2, Search } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldError } from "./field-error";
import { RequiredMark } from "./required-mark";
import type { RegistrationFormValues } from "./registration-form.types";
import { useReferrerLookupQuery } from "@/features/registration/hooks";

function normalizeReferrerPhoneNumberInput(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/[^\d+]/g, "").trim();

  if (!digitsOnly) return "";

  if (digitsOnly.startsWith("+84")) {
    return `0${digitsOnly.slice(3)}`;
  }

  if (digitsOnly.startsWith("84") && digitsOnly.length === 11) {
    return `0${digitsOnly.slice(2)}`;
  }

  return digitsOnly;
}

function canLookupReferrerPhoneNumber(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  return digitsOnly.length >= 6;
}

function validateReferrerSearchPhoneNumber(phoneNumber: string) {
  const normalizedPhoneNumber = normalizeReferrerPhoneNumberInput(
    phoneNumber.trim(),
  );
  const digitsOnly = normalizedPhoneNumber.replace(/\D/g, "");

  if (!digitsOnly) {
    return true;
  }

  if (digitsOnly.length < 6) {
    return "Vui lòng nhập ít nhất 6 số để tra cứu.";
  }

  return true;
}

export function RegistrationReferrerField() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();
  const referrerSearchPhoneNumber = useWatch({
    control,
    name: "referrerSearchPhoneNumber",
  });
  const referrerPhoneNumber = useWatch({
    control,
    name: "referrerPhoneNumber",
  });
  const referrerSearchBoxRef = useRef<HTMLDivElement | null>(null);
  const normalizedReferrerSearchPhoneNumber = normalizeReferrerPhoneNumberInput(
    referrerSearchPhoneNumber?.trim() ?? "",
  );
  const deferredReferrerSearchPhoneNumber = useDeferredValue(
    normalizedReferrerSearchPhoneNumber,
  );
  const canLookupReferrer = canLookupReferrerPhoneNumber(
    deferredReferrerSearchPhoneNumber,
  );
  const referrerLookupQuery = useReferrerLookupQuery(
    canLookupReferrer ? deferredReferrerSearchPhoneNumber : null,
  );
  const [isReferrerDropdownOpen, setIsReferrerDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isReferrerDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        referrerSearchBoxRef.current &&
        !referrerSearchBoxRef.current.contains(event.target as Node)
      ) {
        setIsReferrerDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsReferrerDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isReferrerDropdownOpen]);

  const selectedReferrer = referrerLookupQuery.data?.find(
    (item) => item.phoneNumber === referrerPhoneNumber,
  );

  return (
    <div className="space-y-1.5">
      <div className="relative" ref={referrerSearchBoxRef}>
        <input
          type="hidden"
          {...register("referrerPhoneNumber", {
            validate: (value) =>
              value.trim() ? true : "Vui lòng chọn người giới thiệu.",
          })}
        />
        <label
          htmlFor="referrerSearchPhoneNumber"
          className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
          style={{ color: "var(--mevi-text-secondary)" }}
        >
          <Search className="h-4 w-4" />
          3. Người giới thiệu
          <RequiredMark />
        </label>
        <input
          id="referrerSearchPhoneNumber"
          type="tel"
          inputMode="numeric"
          className="mevi-input"
          placeholder="Nhập 6-7 số đầu để tìm"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isReferrerDropdownOpen}
          aria-controls="referrer-search-dropdown"
          {...register("referrerSearchPhoneNumber", {
            validate: validateReferrerSearchPhoneNumber,
            onChange: (event) => {
              const nextValue = event.target.value?.trim() ?? "";
              const normalizedNextValue =
                normalizeReferrerPhoneNumberInput(nextValue);

              setValue("referrerPhoneNumber", "", {
                shouldDirty: true,
                shouldValidate: false,
              });
              setIsReferrerDropdownOpen(Boolean(normalizedNextValue));
            },
          })}
          onFocus={(event) => {
            if (
              normalizeReferrerPhoneNumberInput(event.currentTarget.value.trim())
            ) {
              setIsReferrerDropdownOpen(true);
            }
          }}
        />
        <FieldError message={errors.referrerSearchPhoneNumber?.message} />
        <FieldError message={errors.referrerPhoneNumber?.message} />

        {selectedReferrer ? (
          <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-emerald-900">
                Đã chọn: {selectedReferrer.fullName}
              </p>
              <p className="text-[11px] text-emerald-700">
                {selectedReferrer.phoneNumber}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
              onClick={() => {
                setValue("referrerPhoneNumber", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("referrerSearchPhoneNumber", "");
                setIsReferrerDropdownOpen(false);
              }}
            >
              Xóa
            </button>
          </div>
        ) : null}

        {isReferrerDropdownOpen && canLookupReferrer ? (
          <div
            id="referrer-search-dropdown"
            className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-2xl border border-[var(--mevi-border)] bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.2)]"
          >
            <div className="border-b border-[var(--mevi-border)] px-3 py-2 text-[11px] font-medium text-[var(--mevi-text-muted)]">
              {referrerLookupQuery.isFetching
                ? "Đang tra cứu..."
                : referrerLookupQuery.isError
                  ? "Không thể tra cứu người giới thiệu"
                  : referrerLookupQuery.data?.length
                    ? `${referrerLookupQuery.data.length} kết quả phù hợp`
                    : "Không tìm thấy kết quả"}
            </div>

            {referrerLookupQuery.isError ? (
              <div className="px-3 py-3 text-xs text-red-600">
                Vui lòng nhập số điện thoại khác
              </div>
            ) : referrerLookupQuery.isFetching ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-[var(--mevi-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tìm người giới thiệu...
              </div>
            ) : referrerLookupQuery.data?.length ? (
              <div className="max-h-56 overflow-y-auto p-1.5">
                {referrerLookupQuery.data.map((item) => (
                  <button
                    key={item.phoneNumber}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50"
                    onClick={() => {
                      setValue("referrerPhoneNumber", item.phoneNumber, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("referrerSearchPhoneNumber", item.phoneNumber, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setIsReferrerDropdownOpen(false);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--mevi-text-primary)]">
                        {item.fullName}
                      </p>
                      <p className="text-xs text-[var(--mevi-text-muted)]">
                        {item.phoneNumber}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Chọn
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-3 text-xs text-amber-700">
                Không tìm thấy người giới thiệu phù hợp.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
