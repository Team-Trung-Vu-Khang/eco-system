import { NextResponse, type NextRequest } from "next/server";
import { refreshAccessToken } from "@/features/auth/api";
import {
  AUTH_SESSION_COOKIE_NAME,
  LEGACY_AUTH_COOKIE_NAME,
} from "@/features/auth/constants";

const TOKEN_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_WINDOW_SECONDS = 60;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split(".")[1];

  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    return JSON.parse(atob(paddedPayload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getTokenExpiration(token: string) {
  const payload = decodeJwtPayload(token);
  const expiration = payload?.exp;

  return typeof expiration === "number" ? expiration : null;
}

function shouldRefreshToken(token: string) {
  const expiration = getTokenExpiration(token);

  if (!expiration) return false;

  const currentTime = Math.floor(Date.now() / 1000);

  return expiration - currentTime <= REFRESH_WINDOW_SECONDS;
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.delete(AUTH_SESSION_COOKIE_NAME);
  response.cookies.delete(LEGACY_AUTH_COOKIE_NAME);

  return response;
}

export async function middleware(request: NextRequest) {
  const token =
    request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value ??
    request.cookies.get(LEGACY_AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  if (!shouldRefreshToken(token)) {
    return NextResponse.next();
  }

  try {
    const refreshedToken = await refreshAccessToken(token);
    const response = NextResponse.next();

    response.cookies.set(AUTH_SESSION_COOKIE_NAME, refreshedToken, {
      path: "/",
      maxAge: TOKEN_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });

    response.cookies.delete(LEGACY_AUTH_COOKIE_NAME);

    return response;
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/survey/:path*",
    "/farm/:path*",
    "/factory/:path*",
    "/shop/:path*",
  ],
};
