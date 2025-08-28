import type { publicAuthConfig } from "@/lib/auth/auth-config";
import { createAuthClient } from "better-auth/react";
import type { StatusEnum, KycTypeEnum } from "@/lib/types";

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
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

export type Session = typeof publicAuthConfig.$Infer.Session;
export type UserSession = Session["user"] & {
  isKycVerified: boolean;
  kycStatus?: StatusEnum;
  kycIdType?: KycTypeEnum;
  kycIdNumber?: string;
  kycIdUrl?: string;
  advertiserRequestStatus: StatusEnum;
  advertiserBrand: string;
  advertiserDescription: string;
  advertiserWebsite: string;
  advertiserLogo: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
};
