import { useMutation } from "@tanstack/react-query";
import { logoutMeviSession } from "@/features/auth/api";

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logoutMeviSession,
  });
}
