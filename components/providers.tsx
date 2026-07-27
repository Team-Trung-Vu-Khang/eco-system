"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  bootstrapAuthSession,
  logoutBrowserSession,
} from "@/features/auth/api";
import {
  clearStoredAuthSession,
  setStoredAccessToken,
  storeAuthenticatedProfile,
} from "@/features/auth/utils";
import {
  clearAuthSession,
  setAuthSession,
} from "@/features/auth/state/auth-session-store";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (window.location.pathname.startsWith("/auth/callback")) {
      return;
    }

    let isActive = true;

    async function bootstrapSession() {
      try {
        const session = await bootstrapAuthSession();

        if (!isActive) return;

        setStoredAccessToken(session.accessToken);
        storeAuthenticatedProfile(session.profile);
        setAuthSession({
          accessToken: session.accessToken,
          profile: session.profile,
          status: "authenticated",
        });
      } catch {
        if (!isActive) return;

        clearStoredAuthSession();
        clearAuthSession();

        await logoutBrowserSession().catch(() => null);
      }
    }

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
