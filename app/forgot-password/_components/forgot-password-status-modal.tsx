"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";

type FeedbackState =
  | {
      kind: "success";
      title: string;
      message: string;
    }
  | {
      kind: "error";
      title: string;
      message: string;
    };

type ForgotPasswordStatusModalProps = {
  feedback: FeedbackState;
  onClose: () => void;
};

export function ForgotPasswordStatusModal({
  feedback,
  onClose,
}: ForgotPasswordStatusModalProps) {
  const isSuccess = feedback.kind === "success";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-fade-in-scale">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: isSuccess
                ? "linear-gradient(135deg, var(--mevi-green-100), var(--mevi-green-200))"
                : "linear-gradient(135deg, #fef3c7, #fde68a)",
              color: isSuccess ? "var(--mevi-green-700)" : "#b45309",
            }}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <ShieldAlert className="h-6 w-6" />
            )}
          </div>

          <div>
            <p
              className="text-lg font-bold"
              style={{ color: "var(--mevi-text-primary)" }}
            >
              {feedback.title}
            </p>
            <p
              className="mt-2 text-sm leading-6"
              style={{ color: "var(--mevi-text-secondary)" }}
            >
              {feedback.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mevi-btn-primary w-auto px-5"
          >
            <span>{isSuccess ? "Về trang đăng nhập" : "Đóng"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

