import { publicAuthConfig } from "@/lib/auth/auth-config";
import { db } from "@/lib/db";
import {
  advertiser,
  campaign,
  campaignRating,
  kyc,
  submission,
  transaction,
  user,
} from "@/lib/db/schema";
import { NotAuthorizedError, NotFoundError } from "@/lib/error-handler";
import type {
  Db,
  RecentActivityItem,
  Tx,
  UpdateBankAccountData,
  UpdateKycDetailsData,
  UpdateProfileData,
  UserStats,
} from "@/lib/types";
import {
  and,
  avg,
  count,
  desc,
  eq,
  getTableColumns,
  sql,
  sum,
} from "drizzle-orm";
import type { NextRequest } from "next/server";

export type UserDetails = Awaited<ReturnType<UserService["getUser"]>>;

class UserService {
  async validateSession(request: NextRequest): Promise<UserDetails> {
    const session = await publicAuthConfig.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      throw new NotAuthorizedError("Authentication required");
    }

    return session?.user as UserDetails;
  }

  async validateUser(request: NextRequest): Promise<UserDetails> {
    const session = await publicAuthConfig.api.getSession({
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

  async getUserStats(userId: string): Promise<UserStats> {
    const [earningsRows, approvals, rejects, avgRows] = await Promise.all([
      // total earnings = sum of transaction amounts of type earning for this user and approved also get the total number of approved transactions by counting
      db
        .select({ total: sum(transaction.amount), count: count() })
        .from(transaction)
        .where(
          and(
            eq(transaction.userId, userId),
            eq(transaction.type, "earning"),
            eq(transaction.status, "approved"),
          ),
        ),

      // success rate = approved submissions / all submissions (approved+rejected+pending?) use approved/(approved+rejected) to reflect review outcome
      db
        .select({ total: count() })
        .from(submission)
        .where(
          and(
            eq(submission.createdBy, userId),
            eq(submission.status, "approved"),
          ),
        ),

      db
        .select({ total: count() })
        .from(submission)
        .where(
          and(
            eq(submission.createdBy, userId),
            eq(submission.status, "rejected"),
          ),
        ),

      // average rating = average advertiserRating on user's submissions
      db
        .select({ avgRating: avg(submission.advertiserRating) })
        .from(submission)
        .where(and(eq(submission.createdBy, userId))),
    ]);

    const totalEarnings = Number(earningsRows[0]?.total ?? 0);
    const completedTasks = Number(earningsRows[0]?.count ?? 0);

    const approvedCount = Number(approvals[0]?.total ?? 0);
    const rejectedCount = Number(rejects[0]?.total ?? 0);
    const denominator = approvedCount + rejectedCount;
    const successRate =
      denominator === 0 ? 0 : Math.round((approvedCount / denominator) * 100);

    const averageRatingRaw = Number(avgRows[0]?.avgRating ?? 0);
    const averageRating = Number.isFinite(averageRatingRaw)
      ? Number(averageRatingRaw.toFixed(1))
      : 0;

    return { totalEarnings, completedTasks, successRate, averageRating };
  }

  async getRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<RecentActivityItem[]> {
    // recent submissions by user joined with campaign title and transaction amount (payout per user)
    const rows = await db
      .select({
        id: submission.id,
        campaignId: submission.campaignId,
        title: campaign.title,
        payoutPerUser: campaign.payoutPerUser,
        status: submission.status,
        createdAt: submission.createdAt,
        statusUpdatedAt: submission.statusUpdatedAt,
        advertiserFeedback: submission.advertiserFeedback,
        advertiserRating: submission.advertiserRating,
        rating: campaignRating.rating,
      })
      .from(submission)
      .leftJoin(campaign, eq(campaign.id, submission.campaignId))
      .leftJoin(
        campaignRating,
        eq(campaignRating.campaignId, submission.campaignId),
      )
      .where(eq(submission.createdBy, userId))
      .orderBy(desc(submission.createdAt))
      .limit(limit);

    // Placeholder for userRating (user rating given to campaign). We do not currently store a separate user rating field on submission; keep null.
    return rows.map((r) => ({
      id: r.id,
      campaignId: r.campaignId,
      title: r.title ?? "",
      payoutPerUser: r.payoutPerUser ?? 0,
      status: r.status,
      createdAt: r.createdAt,
      statusUpdatedAt: r.statusUpdatedAt,
      advertiserFeedback: r.advertiserFeedback ?? null,
      advertiserRating: r.advertiserRating ?? null,
      rating: r.rating ?? 0,
    }));
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
        phoneNumber: data.phoneNumber,
        address: data.address,
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
