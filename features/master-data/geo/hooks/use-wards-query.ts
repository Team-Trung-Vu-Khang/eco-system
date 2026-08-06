import { useQuery } from "@tanstack/react-query";
import { listWards } from "@/features/master-data/geo/api";

export function useWardsQuery(
  provinceCode?: string | null,
  keyword?: string | null,
  enabled = true,
) {
  const normalizedProvinceCode = provinceCode?.trim() ?? "";
  const normalizedKeyword = keyword?.trim() ?? "";

  return useQuery({
    queryKey: [
      "master-data",
      "geo",
      "wards",
      normalizedProvinceCode,
      normalizedKeyword,
    ],
    queryFn: () =>
      listWards({
        provinceCode: normalizedProvinceCode,
        keyword: normalizedKeyword || undefined,
      }),
    enabled: enabled && Boolean(normalizedProvinceCode),
    staleTime: 5 * 60 * 1000,
  });
}
