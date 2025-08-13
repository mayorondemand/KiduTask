import { db } from "@/lib/db";
import { emailService } from "@/lib/services/email-service";
import { userService } from "@/lib/services/user-service";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer, customSession, openAPI } from "better-auth/plugins";
import * as schema from "@/lib/db/schema";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
}

export const auth = betterAuth({
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
    admin(),
    customSession(async ({ user, session }) => {
      const userDetails = await userService.getUser(session.userId);
      return {
        user: {
          ...user,
          isKycVerified: userDetails?.isKycVerified,
          advertiserRequestStatus: userDetails?.advertiserRequestStatus,
        },
        session,
      };
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  databaseHooks: {
    // user: {
    //   create: {
    //     after: async (user) => {
    //       await emailService.sendWelcomeEmail(user.email, user.name);
    //     },
    //   },
    // },
  },

  user: {
    additionalFields: {
      walletBalance: {
        type: "number",
        input: false,
      },
    },
  },
});
