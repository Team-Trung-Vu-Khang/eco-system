import type { RegistrationAudienceType } from "@/features/registration/api";

export type RegistrationFormValues = {
  fullName: string;
  phoneNumber: string;
  referrerSearchPhoneNumber: string;
  referrerPhoneNumber: string;
  birthYear: string;
  provinceSearchKeyword: string;
  provinceCode: string;
  wardSearchKeyword: string;
  commune: string;
  audienceType: RegistrationAudienceType | "";
  audienceTypeOther: string;
};
