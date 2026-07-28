import { NextResponse, type NextRequest } from "next/server";
import { logoutMeviSession } from "@/features/auth/api";
import {
  clearAuthSessionCookie,
  readAuthSessionToken,
} from "../_session";

export async function POST(request: NextRequest) {
  const token = readAuthSessionToken(request);

  if (token) {
    await logoutMeviSession(token).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthSessionCookie(response, request);
  return response;
}
