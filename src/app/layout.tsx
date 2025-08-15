import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KudiTask - Micro-Task Marketplace",
  description:
    "Complete micro-tasks and earn money or create campaigns to grow your business",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
