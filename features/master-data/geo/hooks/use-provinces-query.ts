import { useQuery } from "@tanstack/react-query";
import { listProvinces } from "@/features/master-data/geo/api";

export function useProvincesQuery(
  keyword?: string | null,
  enabled = true,
) {
  const normalizedKeyword = keyword?.trim() ?? "";

  return useQuery({
    queryKey: ["master-data", "geo", "provinces", normalizedKeyword],
    queryFn: () =>
      listProvinces({
        keyword: normalizedKeyword || undefined,
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
