import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "@/lib/db";
import { bearer } from "better-auth/plugins";
import * as schema from "@/lib/db/schema";
// import { emailService } from "@/lib/services/email-service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      users: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [openAPI(), bearer()],
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
    additionalFields: {},
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
