"use client";

import { Loader2, MapPin } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldError } from "./field-error";
import type { RegistrationFormValues } from "./registration-form.types";
import { useProvincesQuery, useWardsQuery } from "@/features/master-data/geo";

export function RegistrationLocationFields() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();
  const provinceSearchKeyword = useWatch({
    control,
    name: "provinceSearchKeyword",
  });
  const provinceCode = useWatch({
    control,
    name: "provinceCode",
  });
  const wardSearchKeyword = useWatch({
    control,
    name: "wardSearchKeyword",
  });
  const commune = useWatch({
    control,
    name: "commune",
  });
  const provinceSearchBoxRef = useRef<HTMLDivElement | null>(null);
  const wardSearchBoxRef = useRef<HTMLDivElement | null>(null);
  const deferredProvinceSearchKeyword = useDeferredValue(
    provinceSearchKeyword?.trim() ?? "",
  );
  const deferredWardSearchKeyword = useDeferredValue(
    wardSearchKeyword?.trim() ?? "",
  );
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const provincesQuery = useProvincesQuery(
    deferredProvinceSearchKeyword,
    isProvinceDropdownOpen || Boolean(deferredProvinceSearchKeyword),
  );
  const wardsQuery = useWardsQuery(
    provinceCode,
    deferredWardSearchKeyword,
    (isWardDropdownOpen || Boolean(deferredWardSearchKeyword)) &&
      Boolean(provinceCode?.trim()),
  );

  useEffect(() => {
    if (!isProvinceDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        provinceSearchBoxRef.current &&
        !provinceSearchBoxRef.current.contains(event.target as Node)
      ) {
        setIsProvinceDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProvinceDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isProvinceDropdownOpen]);

  useEffect(() => {
    if (!isWardDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        wardSearchBoxRef.current &&
        !wardSearchBoxRef.current.contains(event.target as Node)
      ) {
        setIsWardDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsWardDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isWardDropdownOpen]);

  const selectedProvince = provincesQuery.data?.content?.find(
    (item) => item.code === provinceCode,
  );
  const selectedWard = wardsQuery.data?.content?.find(
    (item) => item.fullName === commune,
  );

  return (
    <>
      <input
        type="hidden"
        {...register("provinceCode", {
          validate: (value) =>
            value.trim() ? true : "Vui lòng chọn tỉnh/thành phố.",
        })}
      />
      <input
        type="hidden"
        {...register("commune", {
          validate: (value) => (value.trim() ? true : "Vui lòng chọn phường/xã."),
        })}
      />

      <div className="space-y-1.5 relative" ref={provinceSearchBoxRef}>
        <label
          htmlFor="provinceSearchKeyword"
          className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
          style={{ color: "var(--mevi-text-secondary)" }}
        >
          <MapPin className="h-4 w-4" />
          5. Tỉnh/Thành phố
        </label>
        <input
          id="provinceSearchKeyword"
          type="text"
          className="mevi-input"
          placeholder="Tìm tỉnh/thành phố"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isProvinceDropdownOpen}
          aria-controls="province-search-dropdown"
          {...register("provinceSearchKeyword", {
            onChange: (event) => {
              const nextValue = event.target.value?.trim() ?? "";

              setValue("provinceCode", "", {
                shouldDirty: true,
                shouldValidate: false,
              });
              setValue("commune", "", {
                shouldDirty: true,
                shouldValidate: false,
              });
              setValue("wardSearchKeyword", "", {
                shouldDirty: true,
                shouldValidate: false,
              });
              setIsWardDropdownOpen(false);
              setIsProvinceDropdownOpen(Boolean(nextValue));
            },
          })}
          onFocus={() => {
            setIsProvinceDropdownOpen(true);
          }}
        />
        <FieldError message={errors.provinceCode?.message} />

        {selectedProvince ? (
          <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-emerald-900">
                Đã chọn: {selectedProvince.fullName}
              </p>
              <p className="text-[11px] text-emerald-700">
                {selectedProvince.code}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
              onClick={() => {
                setValue("provinceCode", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("provinceSearchKeyword", "");
                setValue("commune", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("wardSearchKeyword", "");
                setIsProvinceDropdownOpen(false);
                setIsWardDropdownOpen(false);
              }}
            >
              Xóa
            </button>
          </div>
        ) : null}

        {isProvinceDropdownOpen ? (
          <div
            id="province-search-dropdown"
            className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-2xl border border-[var(--mevi-border)] bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.2)]"
          >
            <div className="border-b border-[var(--mevi-border)] px-3 py-2 text-[11px] font-medium text-[var(--mevi-text-muted)]">
              {provincesQuery.isFetching
                ? "Đang tra cứu..."
                : provincesQuery.isError
                  ? "Không thể tra cứu tỉnh/thành phố"
                  : provincesQuery.data?.content.length
                    ? `${provincesQuery.data.content.length} kết quả phù hợp`
                    : "Không tìm thấy kết quả"}
            </div>

            {provincesQuery.isError ? (
              <div className="px-3 py-3 text-xs text-red-600">Vui lòng thử lại</div>
            ) : provincesQuery.isFetching ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-[var(--mevi-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tìm tỉnh/thành phố...
              </div>
            ) : provincesQuery.data?.content.length ? (
              <div className="max-h-56 overflow-y-auto p-1.5">
                {provincesQuery.data.content.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50"
                    onClick={() => {
                      setValue("provinceCode", item.code, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("provinceSearchKeyword", item.fullName, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("commune", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("wardSearchKeyword", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                      setIsProvinceDropdownOpen(false);
                      setIsWardDropdownOpen(false);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--mevi-text-primary)]">
                        {item.fullName}
                      </p>
                      <p className="text-xs text-[var(--mevi-text-muted)]">
                        {item.code}
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
                Không tìm thấy tỉnh/thành phố phù hợp.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5 relative" ref={wardSearchBoxRef}>
        <label
          htmlFor="wardSearchKeyword"
          className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
          style={{ color: "var(--mevi-text-secondary)" }}
        >
          <MapPin className="h-4 w-4" />
          6. Phường / Xã
        </label>
        <input
          id="wardSearchKeyword"
          type="text"
          className="mevi-input"
          placeholder={
            provinceCode?.trim() ? "Tìm phường/xã" : "Chọn tỉnh/thành phố trước"
          }
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isWardDropdownOpen}
          aria-controls="ward-search-dropdown"
          disabled={!provinceCode?.trim()}
          {...register("wardSearchKeyword", {
            onChange: (event) => {
              const nextValue = event.target.value?.trim() ?? "";

              setValue("commune", "", {
                shouldDirty: true,
                shouldValidate: false,
              });
              setIsWardDropdownOpen(Boolean(nextValue));
            },
          })}
          onFocus={() => {
            if (provinceCode?.trim()) {
              setIsWardDropdownOpen(true);
            }
          }}
        />
        <FieldError message={errors.commune?.message} />

        {selectedWard ? (
          <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-emerald-900">
                Đã chọn: {selectedWard.fullName}
              </p>
              <p className="text-[11px] text-emerald-700">{selectedWard.code}</p>
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
              onClick={() => {
                setValue("commune", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("wardSearchKeyword", "");
                setIsWardDropdownOpen(false);
              }}
            >
              Xóa
            </button>
          </div>
        ) : null}

        {isWardDropdownOpen && provinceCode?.trim() ? (
          <div
            id="ward-search-dropdown"
            className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-2xl border border-[var(--mevi-border)] bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.2)]"
          >
            <div className="border-b border-[var(--mevi-border)] px-3 py-2 text-[11px] font-medium text-[var(--mevi-text-muted)]">
              {wardsQuery.isFetching
                ? "Đang tra cứu..."
                : wardsQuery.isError
                  ? "Không thể tra cứu phường/xã"
                  : wardsQuery.data?.content.length
                    ? `${wardsQuery.data.content.length} kết quả phù hợp`
                    : "Không tìm thấy kết quả"}
            </div>

            {wardsQuery.isError ? (
              <div className="px-3 py-3 text-xs text-red-600">Vui lòng thử lại</div>
            ) : wardsQuery.isFetching ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-[var(--mevi-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tìm phường/xã...
              </div>
            ) : wardsQuery.data?.content.length ? (
              <div className="max-h-56 overflow-y-auto p-1.5">
                {wardsQuery.data.content.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50"
                    onClick={() => {
                      setValue("commune", item.fullName, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("wardSearchKeyword", item.fullName, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setIsWardDropdownOpen(false);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--mevi-text-primary)]">
                        {item.fullName}
                      </p>
                      <p className="text-xs text-[var(--mevi-text-muted)]">
                        {item.code}
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
                Không tìm thấy phường/xã phù hợp.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
