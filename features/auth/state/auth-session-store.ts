"use client";

import { useSyncExternalStore } from "react";
import type { AuthMeProfile } from "@/features/auth/api";

export type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthSessionState = {
  accessToken: string | null;
  profile: AuthMeProfile | null;
  status: AuthSessionStatus;
};

const initialState: AuthSessionState = {
  accessToken: null,
  profile: null,
  status: "loading",
};

let authSessionState = initialState;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getAuthSessionSnapshot() {
  return authSessionState;
}

export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setAuthSession(
  nextState: Partial<AuthSessionState> & { status?: AuthSessionStatus },
) {
  authSessionState = {
    ...authSessionState,
    ...nextState,
  };

  emitChange();
}

export function setAuthAccessToken(accessToken: string | null) {
  setAuthSession({
    accessToken,
    status: accessToken ? "authenticated" : "unauthenticated",
  });
}

export function setAuthProfile(profile: AuthMeProfile | null) {
  setAuthSession({
    profile,
    status: profile ? "authenticated" : authSessionState.status,
  });
}

export function clearAuthSession() {
  authSessionState = {
    accessToken: null,
    profile: null,
    status: "unauthenticated",
  };

  emitChange();
}

export function useAuthSession() {
  return useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    getAuthSessionSnapshot,
  );
}
