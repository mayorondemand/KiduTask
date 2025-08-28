import type { adminAuthConfig } from "@/lib/auth/auth-config";
import { createAuthClient } from "better-auth/react";

if (!process.env.NEXT_PUBLIC_ADMIN_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_ADMIN_APP_URL}/api/admin/auth`,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  requestPasswordReset,
  sendVerificationEmail,
  resetPassword,
} = authClient;

export type Session = typeof adminAuthConfig.$Infer.Session;
export type UserSession = Session["user"];
