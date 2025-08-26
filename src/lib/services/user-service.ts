import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db";
import { advertiser, kyc, user } from "@/lib/db/schema";
import { NotAuthorizedError, NotFoundError } from "@/lib/error-handler";
import type {
  Db,
  Tx,
  UpdateBankAccountData,
  UpdateKycDetailsData,
  UpdateProfileData,
} from "@/lib/types";
import { eq, getTableColumns, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";

export type UserDetails = Awaited<ReturnType<UserService["getUser"]>>;

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

  async getUser(userId: string) {
    // Get the user
    const userWithKyc = await db
      .select({
        ...getTableColumns(user),
        isKycVerified: sql<boolean>`CASE WHEN ${kyc.status} = 'approved' THEN true ELSE false END`,
        kycStatus: kyc.status,
        advertiserRequestStatus: advertiser.status,
        advertiserBrand: advertiser.brandName,
        advertiserDescription: advertiser.brandDescription,
        advertiserWebsite: advertiser.brandWebsite,
        advertiserLogo: advertiser.brandLogo,
        bankAccountName: kyc.bankAccountName,
        bankAccountNumber: kyc.bankAccountNumber,
        bankName: kyc.bankName,
        kycIdType: kyc.idType,
        kycIdNumber: kyc.idNumber,
        kycIdUrl: kyc.idUrl,
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

  async updateProfile(userId: string, data: UpdateProfileData) {
    await db
      .update(user)
      .set({
        name: data.name,
        image: data.image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
    return this.getUser(userId);
  }

  async updateBankAccount(userId: string, data: UpdateBankAccountData) {
    await db
      .update(kyc)
      .set({
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        bankName: data.bankName,
        updatedAt: new Date(),
      })
      .where(eq(kyc.userId, userId));
  }

  async updateKycDetails(userId: string, data: UpdateKycDetailsData) {
    await db
      .insert(kyc)
      .values({
        userId,
        idType: data.idType,
        idNumber: data.idNumber,
        idUrl: data.idUrl,
        status: "pending",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: kyc.userId,
        set: {
          idType: data.idType,
          idNumber: data.idNumber,
          idUrl: data.idUrl,
          status: "pending",
          updatedAt: new Date(),
        },
      });
    return this.getUser(userId);
  }
}

export const userService = new UserService();
