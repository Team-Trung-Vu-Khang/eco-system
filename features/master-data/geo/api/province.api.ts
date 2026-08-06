import { AUTH_API_BASE } from "@/features/auth/api";

export const MASTER_DATA_API_BASE =
  process.env.NEXT_PUBLIC_MEVI_MASTER_DATA_API_BASE ?? AUTH_API_BASE;

export const PROVINCE_STATUSES = ["active", "inactive", "archived"] as const;

export type ProvinceStatus = (typeof PROVINCE_STATUSES)[number];

export type Province = {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  administrativeUnitId: number;
  status: ProvinceStatus;
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Ward = {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  provinceCode: string;
  administrativeUnitId: number;
  status: ProvinceStatus;
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type ListProvincesParams = {
  keyword?: string;
  status?: ProvinceStatus;
  page?: number;
  size?: number;
};

export type ListProvincesResponse = PaginatedResponse<Province>;

export type ListWardsParams = {
  provinceCode: string;
  keyword?: string;
  status?: ProvinceStatus;
  page?: number;
  size?: number;
};

export type ListWardsResponse = PaginatedResponse<Ward>;

function buildProvincesUrl(params: ListProvincesParams = {}) {
  const url = new URL("/api/master-data/geo/provinces", MASTER_DATA_API_BASE);

  if (params.keyword?.trim()) {
    url.searchParams.set("keyword", params.keyword.trim());
  }

  if (params.status) {
    url.searchParams.set("status", params.status);
  }

  if (typeof params.page === "number") {
    url.searchParams.set("page", String(params.page));
  }

  if (typeof params.size === "number") {
    url.searchParams.set("size", String(params.size));
  }

  return url.toString();
}

function buildWardsUrl(params: ListWardsParams) {
  const url = new URL("/api/master-data/geo/wards", MASTER_DATA_API_BASE);

  url.searchParams.set("provinceCode", params.provinceCode.trim());

  if (params.keyword?.trim()) {
    url.searchParams.set("keyword", params.keyword.trim());
  }

  if (params.status) {
    url.searchParams.set("status", params.status);
  }

  if (typeof params.page === "number") {
    url.searchParams.set("page", String(params.page));
  }

  if (typeof params.size === "number") {
    url.searchParams.set("size", String(params.size));
  }

  return url.toString();
}

function normalizeObjectKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeObjectKeys(item)) as T;
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.endsWith(":") ? key.slice(0, -1) : key,
        normalizeObjectKeys(value),
      ]),
    ) as T;
  }

  return input;
}

function getApiErrorMessage(payload: unknown) {
  const normalizedPayload = normalizeObjectKeys(payload);

  if (!normalizedPayload || typeof normalizedPayload !== "object") {
    return null;
  }

  const record = normalizedPayload as Record<string, unknown>;
  const message = record.message ?? record.error;

  return typeof message === "string" && message.trim() ? message.trim() : null;
}

export async function listProvinces(
  params: ListProvincesParams = {},
): Promise<ListProvincesResponse> {
  const response = await fetch(buildProvincesUrl(params), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });
  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể tải danh sách tỉnh/thành.");
  }

  return normalizeObjectKeys(responsePayload) as ListProvincesResponse;
}

export async function listWards(
  params: ListWardsParams,
): Promise<ListWardsResponse> {
  const provinceCode = params.provinceCode.trim();

  if (!provinceCode) {
    throw new Error("provinceCode is required.");
  }

  const response = await fetch(buildWardsUrl({ ...params, provinceCode }), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });
  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(responsePayload);

    throw new Error(message || "Không thể tải danh sách phường/xã.");
  }

  return normalizeObjectKeys(responsePayload) as ListWardsResponse;
}
