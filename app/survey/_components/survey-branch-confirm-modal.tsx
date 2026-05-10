"use client";

import { ArrowRight, X } from "lucide-react";

type SurveyBranchConfirmModalProps = {
  surveyName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SurveyBranchConfirmModal({
  surveyName,
  onCancel,
  onConfirm,
}: SurveyBranchConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-[0_40px_100px_-24px_rgba(15,23,42,0.45)]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-green-200/60 blur-3xl" />
        </div>

        <div className="relative p-7 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div>
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Khảo sát chưa hoàn tất
                </span>

                <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-900">
                  Tiếp tục làm khảo sát?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bạn cần hoàn thành{" "}
                  <span className="font-semibold text-slate-700">
                    {surveyName}
                  </span>{" "}
                  trước khi truy cập phân hệ này.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              aria-label="Đóng"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:scale-105 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Info box */}
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-sm leading-6 text-emerald-900">
              Sau khi hoàn thành khảo sát, bạn sẽ được tiếp tục sử dụng đầy đủ
              các chức năng của hệ thống.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100"
            >
              Để sau
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-18px_rgba(5,150,105,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-18px_rgba(5,150,105,0.75)]"
            >
              Làm khảo sát ngay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
