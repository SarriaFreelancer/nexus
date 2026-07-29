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
      <body suppressHydrationWarning className="h-full bg-white dark:bg-[#0b0e1a] text-slate-900 dark:text-slate-100 antialiased flex overflow-hidden transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <SessionProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
