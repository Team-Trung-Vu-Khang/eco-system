"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import { DecorativeLeaves } from "@/app/survey/_components/decorative-leaves";
import {
  requestForgotPasswordOtp,
  resetForgotPassword,
} from "@/features/auth/api";
import { ForgotPasswordFormCard } from "./_components/forgot-password-form-card";
import { ForgotPasswordHero } from "./_components/forgot-password-hero";
import { ForgotPasswordStatusModal } from "./_components/forgot-password-status-modal";

type ForgotPasswordFormValues = {
  phoneNumber: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

type ForgotPasswordStep = "phone" | "verify";

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
    }
  | null;

function normalizePhoneInput(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

function formatPhoneDisplay(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function ForgotPasswordPage() {
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("phone");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const redirectTimerRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      phoneNumber: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const phoneValue = useWatch({
    control,
    name: "phoneNumber",
  });

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (feedback?.kind !== "success") return;

    redirectTimerRef.current = window.setTimeout(() => {
      window.location.assign("/");
    }, 1800);

    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [feedback]);

  const currentPhone = normalizePhoneInput(phoneValue);

  const phoneField = register("phoneNumber", {
    required: "Vui lòng nhập số điện thoại.",
    validate: (value) =>
      normalizePhoneInput(value).length >= 8 || "Số điện thoại chưa hợp lệ.",
    setValueAs: (value) => formatPhoneDisplay(String(value ?? "")),
  });

  const otpField = register("otp", {
    required: "Vui lòng nhập OTP.",
    minLength: {
      value: 4,
      message: "OTP chưa đúng định dạng.",
    },
    setValueAs: (value) => String(value ?? "").replace(/[^\d]/g, ""),
  });

  const newPasswordField = register("newPassword", {
    required: "Vui lòng nhập mật khẩu mới.",
    minLength: {
      value: 8,
      message: "Mật khẩu mới cần tối thiểu 8 ký tự.",
    },
  });

  const confirmPasswordField = register("confirmPassword", {
    required: "Vui lòng xác nhận mật khẩu.",
    validate: (value) =>
      value === getValues("newPassword") || "Mật khẩu xác nhận không khớp.",
  });

  async function handleRequestOtp() {
    setFeedback(null);
    setRequestId("");

    const isPhoneValid = await trigger("phoneNumber");

    if (!isPhoneValid) return;

    setIsRequestingOtp(true);

    try {
      const normalizedPhone = normalizePhoneInput(getValues("phoneNumber"));
      const response = await requestForgotPasswordOtp({
        phoneNumber: normalizedPhone,
      });

      const requestId = response.requestId?.trim() ?? "";

      if (!requestId) {
        setFeedback({
          kind: "error",
          title: "Thiếu requestId",
          message:
            "API đã nhận yêu cầu OTP nhưng không trả về requestId. Vui lòng kiểm tra backend response.",
        });
        return;
      }

      setOtpRequested(true);
      setCurrentStep("verify");
      setVerifiedPhone(normalizedPhone);
      setRequestId(requestId);
      setValue("otp", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("phoneNumber", normalizedPhone, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        title: "Không thể gửi OTP",
        message:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra số điện thoại và thử lại.",
      });
    } finally {
      setIsRequestingOtp(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);

    if (!otpRequested) {
      setFeedback({
        kind: "error",
        title: "Cần xác thực OTP",
        message: "Bạn hãy yêu cầu OTP trước khi xác nhận đặt lại mật khẩu.",
      });
      return;
    }

    if (!requestId) {
      setFeedback({
        kind: "error",
        title: "Thiếu requestId",
        message:
          "Không tìm thấy requestId từ bước gửi OTP. Vui lòng gửi lại OTP.",
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      await resetForgotPassword({
        requestId,
        otp: values.otp.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      setFeedback({
        kind: "success",
        title: "Đặt lại mật khẩu thành công",
        message:
          "Mật khẩu của bạn đã được cập nhật. Hệ thống sẽ tự động chuyển về trang đăng nhập.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        title: "Đặt lại mật khẩu thất bại",
        message:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra OTP hoặc mật khẩu mới và thử lại.",
      });
    } finally {
      setIsResettingPassword(false);
    }
  });

  const handleCloseModal = () => {
    if (feedback?.kind === "success") {
      window.location.assign("/");
      return;
    }

    setFeedback(null);
  };

  const handleChangePhoneNumber = () => {
    setCurrentStep("phone");
    setOtpRequested(false);
    setRequestId("");
    setVerifiedPhone("");
    setValue("otp", "", { shouldDirty: true, shouldValidate: true });
    setValue("newPassword", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("confirmPassword", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setFeedback(null);
  };

  const handleResendOtp = () => {
    if (currentPhone) {
      void handleRequestOtp();
    }
  };

  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />

      {feedback ? (
        <ForgotPasswordStatusModal
          feedback={feedback}
          onClose={handleCloseModal}
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28 sm:pb-32">
        <MeviPortalHeader
          badgeLabel="Quên mật khẩu"
          className="opacity-0 animate-fade-in-up px-4 py-4 sm:px-6 md:px-10"
          style={{ animationFillMode: "forwards" }}
          rightSlot={
            <>
              <span className="hidden md:block">Khôi phục an toàn</span>
            </>
          }
          rightSlotClassName="mevi-badge hidden sm:flex"
        />

        <main className="relative z-10 flex w-full flex-1 items-center px-4 pb-6 pt-2 sm:px-6 sm:pt-4 md:px-10 md:pb-8 lg:px-14">
          <section className="mx-auto grid w-full max-w-6xl items-center gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] md:gap-10 lg:gap-14">
            <ForgotPasswordHero currentStep={currentStep} />

            <div className="mx-auto w-full max-w-[24rem] md:mx-0 md:justify-self-end">
              <ForgotPasswordFormCard
                currentStep={currentStep}
                currentPhone={currentPhone}
                verifiedPhone={verifiedPhone}
                requestId={requestId}
                isRequestingOtp={isRequestingOtp}
                isResettingPassword={isResettingPassword}
                errors={errors}
                phoneField={phoneField}
                otpField={otpField}
                newPasswordField={newPasswordField}
                confirmPasswordField={confirmPasswordField}
                onSubmit={onSubmit}
                onRequestOtp={() => void handleRequestOtp()}
                onChangePhoneNumber={handleChangePhoneNumber}
                onResendOtp={handleResendOtp}
              />
            </div>
          </section>
        </main>
      </div>

      <MeviPortalFooter />
    </div>
  );
}
