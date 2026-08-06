"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type {
  RegistrationAudienceType,
  RegistrationProfileRequest,
} from "@/features/registration/api";
import { useRegistrationMutation } from "@/features/registration/hooks";
import { RegistrationAudienceSection } from "./registration-audience-section";
import { RegistrationBasicFields } from "./registration-basic-fields";
import { RegistrationLocationFields } from "./registration-location-fields";
import { RegistrationReferrerField } from "./registration-referrer-field";
import { RegistrationSuccessModal } from "./registration-success-modal";
import type { RegistrationFormValues } from "./registration-form.types";

function getAudienceTypeLabel(audienceType: RegistrationAudienceType) {
  switch (audienceType) {
    case "individual":
      return "A. Cá nhân/Hộ nông dân.";
    case "cooperative":
      return "B. Tổ hợp tác/Hợp tác xã.";
    case "business":
      return "C. Doanh nghiệp/Cơ sở sản xuất.";
    case "other":
      return "D. Khác (Sinh viên, người yêu nông nghiệp...).";
    default:
      return audienceType;
  }
}

export function RegistrationForm() {
  const router = useRouter();
  const [submittedData, setSubmittedData] =
    useState<RegistrationProfileRequest | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const registrationMutation = useRegistrationMutation();

  const currentYear = new Date().getFullYear();
  const methods = useForm<RegistrationFormValues>({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      referrerSearchPhoneNumber: "",
      referrerPhoneNumber: "",
      birthYear: "",
      provinceSearchKeyword: "",
      provinceCode: "",
      wardSearchKeyword: "",
      commune: "",
      audienceType: "",
      audienceTypeOther: "",
    },
  });

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSubmittedData(null);
    router.replace("/");
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: RegistrationProfileRequest = {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      birthYear: Number(values.birthYear),
      province: values.provinceSearchKeyword.trim(),
      commune: values.commune.trim(),
      audienceType: values.audienceType as RegistrationAudienceType,
      referrerPhoneNumber: values.referrerPhoneNumber.trim() || undefined,
    };

    if (payload.audienceType === "other") {
      payload.audienceTypeOther = values.audienceTypeOther.trim();
    }

    try {
      await registrationMutation.mutateAsync(payload);
      setSubmittedData(payload);
      setIsSuccessModalOpen(true);
      methods.reset();
    } catch {
      setSubmittedData(null);
      setIsSuccessModalOpen(false);
    }
  });

  const submittedAudienceLabel = submittedData
    ? submittedData.audienceType === "other" && submittedData.audienceTypeOther
      ? submittedData.audienceTypeOther
      : getAudienceTypeLabel(submittedData.audienceType)
    : "";

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
        <div className="grid gap-2.5 pr-1">
          <RegistrationBasicFields currentYear={currentYear} />
          <RegistrationReferrerField />
          <RegistrationLocationFields />
          <RegistrationAudienceSection />

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
          disabled={registrationMutation.isPending}
        >
          <span className="flex items-center justify-center gap-2">
            {registrationMutation.isPending ? (
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

      <RegistrationSuccessModal
        open={isSuccessModalOpen}
        submittedData={submittedData}
        submittedAudienceLabel={submittedAudienceLabel}
        onClose={handleCloseSuccessModal}
      />
    </FormProvider>
  );
}
