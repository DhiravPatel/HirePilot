"use client";

import { useSession } from "next-auth/react";

export function useSessionToken() {
  const { data: session, status } = useSession();

  return {
    token: (session as { accessToken?: string })?.accessToken ?? null,
    email: session?.user?.email ?? null,
    user: session?.user ?? null,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
