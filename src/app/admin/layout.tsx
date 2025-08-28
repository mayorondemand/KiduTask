import { AdminAuthProvider } from "@/components/providers/admin-auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type React from "react";
import "../globals.css";
import AdminSidebar from "@/components/layout/admin-sidebar";

const inter = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kuditask Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AdminAuthProvider>
            <AdminSidebar>{children}</AdminSidebar>
            <Toaster richColors />
          </AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
