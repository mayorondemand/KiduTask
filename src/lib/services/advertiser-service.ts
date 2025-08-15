import { db } from "@/lib/db";
import {
  ACTIVITY_ENUM,
  advertiser,
  campaign,
  campaignView,
  STATUS_ENUM,
  submission,
} from "@/lib/db/schema";
import type { UserDetails } from "@/lib/services/user-service";
import { eq, sql } from "drizzle-orm";

export interface AdvertiserStats {
  activeCampaigns: number;
  pendingApprovals: number;
  totalSpentMonth: number;
  totalReach: number;
  conversionRate: number;
  totalCampaigns: number;
  submissionsToday: number;
  approvalRate: number;
}

class AdvertiserService {
  async getAdvertiserStats(
    advertiserId: UserDetails["id"],
  ): Promise<AdvertiserStats> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({
        activeCampaigns: sql<number>`COUNT(DISTINCT ${campaign.id}) FILTER (WHERE ${campaign.activity} = ${sql.param(ACTIVITY_ENUM.ACTIVE)})`,
        pendingApprovals: sql<number>`COUNT(DISTINCT ${campaign.id}) FILTER (WHERE ${campaign.status} = ${sql.param(STATUS_ENUM.PENDING)})`,
        totalSpentMonth: sql<number>`SUM(CASE WHEN ${campaign.createdAt} >= ${startOfMonth} THEN ${campaign.totalCost} ELSE 0 END)`,
        totalReach: sql<number>`COUNT(${campaignView.id})`,
        submissionsCount: sql<number>`COUNT(${submission.id})`,
        approvedSubmissions: sql<number>`COUNT(${submission.id}) FILTER (WHERE ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)})`,
        totalCampaigns: sql<number>`COUNT(DISTINCT ${campaign.id})`,
        submissionsToday: sql<number>`COUNT(${submission.id}) FILTER (WHERE ${submission.createdAt} >= ${today})`,
      })
      .from(campaign)
      .leftJoin(campaignView, eq(campaignView.campaignId, campaign.id))
      .leftJoin(submission, eq(submission.campaignId, campaign.id))
      .where(eq(campaign.createdBy, advertiserId));

    const conversionRate =
      result.totalReach > 0
        ? (result.submissionsCount / result.totalReach) * 100
        : 0;

    const approvalRate =
      result.submissionsCount > 0
        ? (result.approvedSubmissions / result.submissionsCount) * 100
        : 0;

    return {
      activeCampaigns: Number(result.activeCampaigns ?? 0),
      pendingApprovals: Number(result.pendingApprovals ?? 0),
      totalSpentMonth: Number(result.totalSpentMonth ?? 0),
      totalReach: Number(result.totalReach ?? 0),
      conversionRate,
      totalCampaigns: Number(result.totalCampaigns ?? 0),
      submissionsToday: Number(result.submissionsToday ?? 0),
      approvalRate,
    };
  }

  async requestAdvertiser(userId: UserDetails["id"]) {
    await db.insert(advertiser).values({
      userId,
      status: "pending",
    });
  }

  async approveAdvertiser(
    userId: UserDetails["id"],
    adminId: UserDetails["id"],
  ) {
    await db
      .update(advertiser)
      .set({
        status: "approved",
        statusUpdatedBy: adminId,
        statusUpdatedAt: new Date(),
      })
      .where(eq(advertiser.userId, userId));
  }

  async rejectAdvertiser(
    userId: UserDetails["id"],
    adminId: UserDetails["id"],
  ) {
    await db
      .update(advertiser)
      .set({
        status: "rejected",
        statusUpdatedBy: adminId,
        statusUpdatedAt: new Date(),
      })
      .where(eq(advertiser.userId, userId));
  }
}

export const advertiserService = new AdvertiserService();
