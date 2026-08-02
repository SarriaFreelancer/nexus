import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

import CookieBannerComponent from "@/components/ui/CookieBanner";
import GuidedTour from "@/components/dashboard/GuidedTour";

export const metadata: Metadata = {
  title: "SarriaTech Studio | Nexus Enterprise Platform",
  description: "ERP DevSecOps integral para empresas de desarrollo de software",
  icons: {
    icon: [
      { url: "/nexus-logo-n.jpg", type: "image/jpeg" },
      { url: "/icon.jpg", type: "image/jpeg" }
    ],
    shortcut: "/nexus-logo-n.jpg",
    apple: "/nexus-logo-n.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
        <link rel="icon" href="/nexus-logo-n.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/nexus-logo-n.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/nexus-logo-n.jpg" />
      </head>
      <body suppressHydrationWarning className="h-full bg-white dark:bg-[#0b0e1a] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <GuidedTour />
            <CookieBannerComponent />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
