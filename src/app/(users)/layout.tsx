import type React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "../globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { PublicAuthProvider } from "@/components/providers/public-auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KudiTask - Micro-Task Marketplace",
  description:
    "Complete micro-tasks and earn money or create campaigns to grow your business",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <PublicAuthProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster richColors />
          </PublicAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
