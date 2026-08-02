"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { IdleTimeout } from "./IdleTimeout";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <IdleTimeout timeoutMinutes={15} />
      {children}
    </NextAuthSessionProvider>
  );
}
