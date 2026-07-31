import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "SarriaTech Studio | Nexus Enterprise Platform",
  description: "ERP DevSecOps integral para empresas de desarrollo de software",
  icons: {
    icon: "/nexus-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head />
      <body suppressHydrationWarning className="h-full bg-white dark:bg-[#0b0e1a] text-slate-900 dark:text-slate-100 antialiased flex overflow-hidden transition-colors duration-300">
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
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
