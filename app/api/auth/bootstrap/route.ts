import { NextResponse, type NextRequest } from "next/server";
import {
  fetchCurrentAuthUser,
  logoutMeviSession,
  refreshAccessToken,
} from "@/features/auth/api";
import {
  attachAuthSessionCookie,
  clearAuthSessionCookie,
  readAuthSessionToken,
} from "../_session";

export async function GET(request: NextRequest) {
  const token = readAuthSessionToken(request);

  if (!token) {
    const response = NextResponse.json(
      { message: "Không tìm thấy phiên đăng nhập." },
      { status: 401 },
    );

    clearAuthSessionCookie(response, request);
    return response;
  }

  try {
    const accessToken = await refreshAccessToken(token);
    const profile = await fetchCurrentAuthUser(accessToken);
    const response = NextResponse.json({
      accessToken,
      profile,
    });

    attachAuthSessionCookie(response, request, accessToken);
    return response;
  } catch {
    await logoutMeviSession(token).catch(() => null);

    const response = NextResponse.json(
      { message: "Phiên đăng nhập đã hết hạn." },
      { status: 401 },
    );

    clearAuthSessionCookie(response, request);
    return response;
  }
}
