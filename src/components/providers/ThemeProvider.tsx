"use client";

import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode; [key: string]: any }) {
  React.useEffect(() => {
    // Standard dark mode initialization without script tag injection
    if (typeof window !== "undefined") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return <>{children}</>;
}
