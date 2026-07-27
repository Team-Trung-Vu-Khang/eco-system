import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_SESSION_COOKIE_MAX_AGE_SECONDS,
  AUTH_SESSION_COOKIE_NAME,
  LEGACY_AUTH_COOKIE_NAME,
} from "@/features/auth/constants";

export function readAuthSessionToken(request: NextRequest) {
  return (
    request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value ??
    request.cookies.get(LEGACY_AUTH_COOKIE_NAME)?.value ??
    null
  );
}

export function attachAuthSessionCookie(
  response: NextResponse,
  request: NextRequest,
  token: string,
) {
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, token, {
    path: "/",
    maxAge: AUTH_SESSION_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  response.cookies.delete(LEGACY_AUTH_COOKIE_NAME);
}

export function clearAuthSessionCookie(
  response: NextResponse,
  request: NextRequest,
) {
  response.cookies.delete(AUTH_SESSION_COOKIE_NAME);
  response.cookies.delete(LEGACY_AUTH_COOKIE_NAME);

  if (request.cookies.get(LEGACY_AUTH_COOKIE_NAME)?.value) {
    response.cookies.delete(LEGACY_AUTH_COOKIE_NAME);
  }
}
