"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider
      // Refetch session every 0 seconds when tab is focused to keep it in sync
      refetchInterval={0}
      // Refetch session when window is focused
      refetchOnWindowFocus={true}
      // Keep session data fresh
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
