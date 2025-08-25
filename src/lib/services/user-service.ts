import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db";
import { advertiser, kyc, user } from "@/lib/db/schema";
import { NotAuthorizedError, NotFoundError } from "@/lib/error-handler";
import { eq, getTableColumns, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import type { Db, StatusEnum, Tx, UserDB } from "@/lib/types";

export type UserDetails = UserDB & {
  isKycVerified: boolean;
  advertiserRequestStatus: StatusEnum | null;
  advertiserBrand: string | null;
  advertiserDescription: string | null;
  advertiserWebsite: string | null;
  advertiserLogo: string | null;
};

class UserService {
  async validateSession(request: NextRequest): Promise<UserDetails> {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      throw new NotAuthorizedError("Authentication required");
    }

    return session?.user as UserDetails;
  }

  async validateUser(request: NextRequest): Promise<UserDetails> {
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

  async validateUserFromHeaders(headers: Headers): Promise<UserDetails> {
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) {
      throw new NotAuthorizedError("Authentication required");
    }
    const foundUser = await this.getUser(session.user.id);
    if (!foundUser) {
      throw new NotFoundError("User not found");
    }
    return foundUser;
  }

  async getUser(userId: string): Promise<UserDetails | null> {
    // Get the user
    const userWithKyc = await db
      .select({
        ...getTableColumns(user),
        isKycVerified: sql<boolean>`CASE WHEN ${kyc.status} = 'approved' THEN true ELSE false END`,
        advertiserRequestStatus: advertiser.status,
        advertiserBrand: advertiser.brandName,
        advertiserDescription: advertiser.brandDescription,
        advertiserWebsite: advertiser.brandWebsite,
        advertiserLogo: advertiser.brandLogo,
      })
      .from(user)
      .leftJoin(kyc, eq(user.id, kyc.userId))
      .leftJoin(advertiser, eq(user.id, advertiser.userId))
      .where(eq(user.id, userId))
      .limit(1);

    return userWithKyc[0] || null;
  }

  async incrementUserBalance(
    client: Db | Tx,
    userId: string,
    amount: number,
  ): Promise<void> {
    await client
      .update(user)
      .set({
        walletBalance: sql`${user.walletBalance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  }
}

export const userService = new UserService();
