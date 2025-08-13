import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db";
import { kyc, user } from "@/lib/db/schema";
import { NotAuthorizedError, NotFoundError } from "@/lib/error-handler";
import { eq, sql } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import type { NextRequest } from "next/server";

type User = typeof user.$inferSelect;
export type UserDetails = User & {
  isKycVerified: boolean;
};

class UserService {
  async validateUser(request: NextRequest): Promise<User> {
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
        isKycVerified: sql<boolean>`CASE WHEN ${kyc.status} = 'verified' THEN true ELSE false END`,
      })
      .from(user)
      .leftJoin(kyc, eq(user.id, kyc.userId))
      .where(eq(user.id, userId))
      .limit(1);

    return userWithKyc[0] || null;
  }
}

export const userService = new UserService();
