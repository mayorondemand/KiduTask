import type { auth } from "@/lib/auth/auth-config";
import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { statusEnum } from "@/lib/db/schema";

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [customSessionClient<typeof auth>()],
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

export type Session = typeof auth.$Infer.Session;
export type UserSession = Session["user"] & {
  isKycVerified: boolean;
  advertiserRequestStatus: (typeof statusEnum.enumValues)[number] | null;
};
