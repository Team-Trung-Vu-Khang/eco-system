import { useQuery } from "@tanstack/react-query";
import { lookupRegistrationReferrer } from "@/features/registration/api";

export function useReferrerLookupQuery(phoneNumber?: string | null) {
  const normalizedPhoneNumber = phoneNumber?.trim() ?? "";

  return useQuery({
    queryKey: ["registration", "referrer-lookup", normalizedPhoneNumber],
    queryFn: () =>
      lookupRegistrationReferrer({ phoneNumber: normalizedPhoneNumber }),
    enabled: Boolean(normalizedPhoneNumber),
    staleTime: 5 * 60 * 1000,
  });
}
