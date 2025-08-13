import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db";
import { advertiser, kyc, user } from "@/lib/db/schema";
import { NotAuthorizedError, NotFoundError } from "@/lib/error-handler";
import { eq, sql } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import type { NextRequest } from "next/server";

type UserDb = typeof user.$inferSelect;
export type UserDetails = UserDb & {
  isKycVerified: boolean;
  isAdvertiser: boolean;
};

class UserService {
  async validateUser(request: NextRequest): Promise<UserDb> {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      throw new NotAuthorizedError("Authentication required");
    }
    const user = await this.getUser(session.user.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getUser(userId: string): Promise<UserDetails | null> {
    // Get the user
    const userWithKyc = await db
      .select({
        ...getTableColumns(user),
        isKycVerified: sql<boolean>`CASE WHEN ${kyc.status} = 'approved' THEN true ELSE false END`,
        isAdvertiser: sql<boolean>`CASE WHEN ${advertiser.status} = 'approved' THEN true ELSE false END`,
      })
      .from(user)
      .leftJoin(kyc, eq(user.id, kyc.userId))
      .leftJoin(advertiser, eq(user.id, advertiser.userId))
      .where(eq(user.id, userId))
      .limit(1);

    return userWithKyc[0] || null;
  }
}

export const userService = new UserService();
