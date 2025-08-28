import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { emailService } from "@/lib/services/email-service";
import { userService } from "@/lib/services/user-service";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, customSession, openAPI } from "better-auth/plugins";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
}
if (!process.env.BETTER_AUTH_ADMIN_SECRET) {
  throw new Error("BETTER_AUTH_ADMIN_SECRET is not set");
}

export const adminAuthConfig = betterAuth({
  secret: process.env.BETTER_AUTH_ADMIN_SECRET,
  baseURL: process.env.BETTER_AUTH_ADMIN_URL,
  basePath: "/api/admin/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.admin_user,
      session: schema.admin_session,
      account: schema.admin_account,
      verification: schema.admin_verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await emailService.sendForgotPassEmail(user.email, user.name, url);
    },
    onPasswordReset: async ({ user }) => {
      await emailService.sendResetPasswordEmail(user.email, user.name);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "kudi-admin",
  },
  session: {
    expiresIn: 60 * 30, // 30 Minutes
    updateAge: 60 * 10, // 10 minutes
  },
});

export const publicAuthConfig = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await emailService.sendForgotPassEmail(user.email, user.name, url);
    },
    onPasswordReset: async ({ user }) => {
      await emailService.sendResetPasswordEmail(user.email, user.name);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await emailService.sendVerifyEmail(user.email, user.name, url);
    },
  },
  plugins: [
    openAPI(),
    bearer(),
    customSession(async ({ user, session }) => {
      const userDetails = await userService.getUser(session.userId);
      return {
        user: {
          ...user,
          isKycVerified: userDetails?.isKycVerified,
          kycStatus: userDetails?.kycStatus,
          kycIdType: userDetails?.kycIdType,
          kycIdNumber: userDetails?.kycIdNumber,
          kycIdUrl: userDetails?.kycIdUrl,
          advertiserRequestStatus: userDetails?.advertiserRequestStatus,
          advertiserBrand: userDetails?.advertiserBrand,
          advertiserDescription: userDetails?.advertiserDescription,
          advertiserWebsite: userDetails?.advertiserWebsite,
          advertiserLogo: userDetails?.advertiserLogo,
          bankName: userDetails?.bankName,
          bankAccountNumber: userDetails?.bankAccountNumber,
          bankAccountName: userDetails?.bankAccountName,
        },
        session,
      };
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      // role: {
      //   type: "string",
      //   input: false,
      // },
      walletBalance: {
        type: "number",
        input: false,
      },
      phoneNumber: {
        type: "string",
        input: false,
      },
      address: {
        type: "string",
        input: false,
      },
    },
  },
});
