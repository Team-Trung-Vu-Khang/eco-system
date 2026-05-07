import { useMutation } from "@tanstack/react-query";
import { fetchCurrentAuthUser } from "@/features/auth/api";

export function useAuthMeMutation() {
  return useMutation({
    mutationFn: fetchCurrentAuthUser,
  });
}
