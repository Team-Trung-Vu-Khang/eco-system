import { NextResponse, type NextRequest } from "next/server";
import {
  fetchCurrentAuthUser,
  logoutMeviSession,
  refreshAccessToken,
} from "@/features/auth/api";
import {
  attachAuthSessionCookie,
  clearAuthSessionCookie,
} from "../_session";

type SessionBody = {
  token?: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as SessionBody | null;
  const token = payload?.token?.trim();

  if (!token) {
    const response = NextResponse.json(
      { message: "Thiếu token đăng nhập." },
      { status: 400 },
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
