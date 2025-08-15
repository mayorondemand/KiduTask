import type { CreateCampaignData } from "@/lib/types";
import { db } from "@/lib/db";
import {
  ACTIVITY_ENUM,
  campaign,
  STATUS_ENUM,
  transaction,
  user,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
class CampaignService {
  async createCampaign(
    userId: string,
    data: CreateCampaignData,
    costOfCampaign: number,
    campaignCreationTransactionId: number,
  ): Promise<{
    campaign: typeof campaign.$inferSelect;
    campaignCreatedTransaction: typeof transaction.$inferSelect;
  }> {
    const requirementsArray = data.requirements.map(
      (requirement) => requirement.requirement,
    );
    const instructionsArray = data.instructions.map(
      (instruction) => instruction.instruction,
    );
    return db.transaction(async (tx) => {
      const newCampaign = await tx
        .insert(campaign)
        .values({
          payoutPerUser: data.payoutPerUser,
          totalCost: costOfCampaign,
          estimatedTimeMinutes: data.estimatedTimeMinutes,
          title: data.title,
          image: data.bannerImageUrl,
          bannerImageUrl: data.bannerImageUrl,
          description: data.description,
          maxUsers: data.maxUsers,
          createdBy: userId,
          expiryDate: data.expiryDate,
          instructions: instructionsArray,
          requirements: requirementsArray,
          status: STATUS_ENUM.PENDING,
          activity: ACTIVITY_ENUM.ACTIVE,
        })
        .returning();

      await tx
        .update(user)
        .set({
          walletBalance: sql`wallet_balance - ${costOfCampaign}`,
        })
        .where(eq(user.id, userId));

      const campaignCreatedTransaction = await tx
        .update(transaction)
        .set({
          status: STATUS_ENUM.APPROVED,
          campaignId: newCampaign[0].id,
        })
        .where(eq(transaction.id, campaignCreationTransactionId))
        .returning();

      return {
        campaign: newCampaign[0],
        campaignCreatedTransaction: campaignCreatedTransaction[0],
      };
    });
  }
}
export const campaignService = new CampaignService();
