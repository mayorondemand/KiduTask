import { db } from "@/lib/db";
import {
  advertiser,
  campaign,
  campaignView,
  submission,
  transaction,
  user,
} from "@/lib/db/schema";
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
} from "@/lib/error-handler";
import { transactionService } from "@/lib/services/transaction-service";
import { userService } from "@/lib/services/user-service";
import {
  ACTIVITY_ENUM,
  type CampaignDB,
  type CampaignQuery,
  type CampaignSubmissionAndCount,
  type CampaignWithCounts,
  type CreateCampaignData,
  type ReviewSubmissionData,
  STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
  type TransactionDB,
  type UpdateCampaignActivityData,
} from "@/lib/types";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm";

// interface CampaignQuery {
//   advertiserId?: UserDetails["id"];
//   page: number;
//   limit: number;
//   search?: string;
//   status?: CampaignDb["status"];
//   activity?: CampaignDb["activity"];
//   minPayout?: CampaignDb["payoutPerUser"];
//   maxPayout?: CampaignDb["payoutPerUser"];
//   minMaxUsers?: CampaignDb["maxUsers"];
//   maxMaxUsers?: CampaignDb["maxUsers"];
//   createdAfter?: CampaignDb["createdAt"];
//   createdBefore?: CampaignDb["createdAt"];
//   expiryAfter?: CampaignDb["expiryDate"];
//   expiryBefore?: CampaignDb["expiryDate"];
//   sortBy?: keyof CampaignDb;
//   sortOrder?: "asc" | "desc";
// }

class CampaignService {
  async createCampaign(
    userId: string,
    data: CreateCampaignData,
    costOfCampaign: number,
    campaignCreationTransactionId: number,
  ): Promise<{
    campaign: CampaignDB;
    campaignCreatedTransaction: TransactionDB;
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

  async getCampaigns(
    campaignQuery: CampaignQuery,
  ): Promise<{ campaigns: CampaignWithCounts[]; totalCount: number }> {
    const {
      page,
      limit,
      search,
      status,
      activity,
      advertiserId,
      minPayout,
      maxPayout,
      minMaxUsers,
      maxMaxUsers,
      createdAfter,
      createdBefore,
      expiryAfter,
      expiryBefore,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = campaignQuery;

    // Build filter conditions
    const conditions = [];

    // Search in title and description
    if (search) {
      conditions.push(
        or(
          ilike(campaign.title, `%${search}%`),
          ilike(campaign.description, `%${search}%`),
        ),
      );
    }

    // Status filter
    if (status) {
      conditions.push(eq(campaign.status, status));
    }

    // Activity filter
    if (activity) {
      conditions.push(eq(campaign.activity, activity));
    }

    // Advertiser filter
    if (advertiserId) {
      conditions.push(eq(campaign.createdBy, advertiserId));
    }

    // Payout range filters
    if (minPayout !== undefined) {
      conditions.push(gte(campaign.payoutPerUser, minPayout));
    }
    if (maxPayout !== undefined) {
      conditions.push(lte(campaign.payoutPerUser, maxPayout));
    }

    // Max users range filters
    if (minMaxUsers !== undefined) {
      conditions.push(gte(campaign.maxUsers, minMaxUsers));
    }
    if (maxMaxUsers !== undefined) {
      conditions.push(lte(campaign.maxUsers, maxMaxUsers));
    }

    // Date range filters
    if (createdAfter) {
      conditions.push(gte(campaign.createdAt, createdAfter));
    }
    if (createdBefore) {
      conditions.push(lte(campaign.createdAt, createdBefore));
    }
    if (expiryAfter) {
      conditions.push(gte(campaign.expiryDate, expiryAfter));
    }
    if (expiryBefore) {
      conditions.push(lte(campaign.expiryDate, expiryBefore));
    }

    // Build the base query with filters and sorting, including submission counts
    const sortDirection = sortOrder === "asc" ? asc : desc;

    // Define submission count columns for sorting
    const totalSubmissionsColumn = sql<number>`COALESCE(COUNT(${submission.id}), 0)`;
    const approvedSubmissionsColumn = sql<number>`COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)`;
    const remainingSlotsColumn = sql<number>`${campaign.maxUsers} - COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)`;
    const completionRateColumn = sql<number>`CASE WHEN ${campaign.maxUsers} > 0 THEN (COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)::float / ${campaign.maxUsers}::float * 100) ELSE 0 END`;

    let sortColumn: SQLWrapper;

    switch (sortBy) {
      case "totalSubmissions":
        sortColumn = totalSubmissionsColumn;
        break;
      case "approvedSubmissions":
        sortColumn = approvedSubmissionsColumn;
        break;
      case "remainingSlots":
        sortColumn = remainingSlotsColumn;
        break;
      case "completionRate":
        sortColumn = completionRateColumn;
        break;
      default:
        // Default to campaign table fields
        sortColumn = campaign[sortBy as keyof typeof campaign] as SQLWrapper;
        break;
    }

    const query = db
      .select({
        // All campaign fields
        id: campaign.id,
        createdBy: campaign.createdBy,
        advertiserBrandName: advertiser.brandName,
        advertiserBrandDescription: advertiser.brandDescription,
        advertiserBrandWebsite: advertiser.brandWebsite,
        advertiserBrandLogo: advertiser.brandLogo,
        title: campaign.title,
        description: campaign.description,
        instructions: campaign.instructions,
        requirements: campaign.requirements,
        payoutPerUser: campaign.payoutPerUser,
        totalCost: campaign.totalCost,
        maxUsers: campaign.maxUsers,
        estimatedTimeMinutes: campaign.estimatedTimeMinutes,
        image: campaign.image,
        bannerImageUrl: campaign.bannerImageUrl,
        expiryDate: campaign.expiryDate,
        status: campaign.status,
        activity: campaign.activity,
        statusUpdatedAt: campaign.statusUpdatedAt,
        statusUpdatedBy: campaign.statusUpdatedBy,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,

        // Submission counts and calculated fields
        totalSubmissions: totalSubmissionsColumn,
        approvedSubmissions: approvedSubmissionsColumn,
        remainingSlots: remainingSlotsColumn,
        completionRate: completionRateColumn,
      })
      .from(campaign)
      .leftJoin(submission, eq(campaign.id, submission.campaignId))
      .leftJoin(advertiser, eq(campaign.createdBy, advertiser.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(
        campaign.id,
        advertiser.id,
        advertiser.brandName,
        advertiser.brandDescription,
        advertiser.brandWebsite,
        advertiser.brandLogo,
      )
      .orderBy(sortDirection(sortColumn));

    // Get total count for pagination (counting distinct campaigns)
    const totalCountResult = await db
      .select({ count: count() })
      .from(campaign)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    // Apply pagination and execute query
    const campaigns = await query.limit(limit).offset((page - 1) * limit);

    return { campaigns, totalCount };
  }

  async getCampaignById(
    campaignId: string,
  ): Promise<CampaignWithCounts | null> {
    const parsedCampaignId = parseInt(campaignId);
    if (Number.isNaN(parsedCampaignId)) {
      throw new BadRequestError("Invalid campaign ID");
    }

    const result = await db
      .select({
        id: campaign.id,
        createdBy: campaign.createdBy,
        advertiserBrandName: advertiser.brandName,
        advertiserBrandDescription: advertiser.brandDescription,
        advertiserBrandWebsite: advertiser.brandWebsite,
        advertiserBrandLogo: advertiser.brandLogo,
        title: campaign.title,
        description: campaign.description,
        instructions: campaign.instructions,
        requirements: campaign.requirements,
        payoutPerUser: campaign.payoutPerUser,
        totalCost: campaign.totalCost,
        maxUsers: campaign.maxUsers,
        estimatedTimeMinutes: campaign.estimatedTimeMinutes,
        image: campaign.image,
        bannerImageUrl: campaign.bannerImageUrl,
        expiryDate: campaign.expiryDate,
        status: campaign.status,
        activity: campaign.activity,
        statusUpdatedAt: campaign.statusUpdatedAt,
        statusUpdatedBy: campaign.statusUpdatedBy,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,

        // Submission counts and calculated fields
        totalSubmissions: sql<number>`COALESCE(COUNT(${submission.id}), 0)`,
        approvedSubmissions: sql<number>`COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)`,
        remainingSlots: sql<number>`${campaign.maxUsers} - COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)`,
        completionRate: sql<number>`CASE WHEN ${campaign.maxUsers} > 0 THEN (COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)::float / ${campaign.maxUsers}::float * 100) ELSE 0 END`,
      })
      .from(campaign)
      .leftJoin(submission, eq(campaign.id, submission.campaignId))
      .leftJoin(advertiser, eq(campaign.createdBy, advertiser.userId))
      .where(eq(campaign.id, parsedCampaignId))
      .groupBy(
        campaign.id,
        advertiser.id,
        advertiser.brandName,
        advertiser.brandDescription,
        advertiser.brandWebsite,
        advertiser.brandLogo,
      );

    return result[0] || null;
  }

  // Only advertiser can see submissions for their campaigns
  async getCampaignSubmissions(
    campaignId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CampaignSubmissionAndCount> {
    const parsedCampaignId = parseInt(campaignId);
    if (Number.isNaN(parsedCampaignId)) {
      throw new BadRequestError("Invalid campaign ID");
    }

    const offset = (page - 1) * limit;

    const submissions = await db
      .select({
        id: submission.id,
        campaignId: submission.campaignId,
        createdBy: submission.createdBy,
        status: submission.status,
        statusUpdatedAt: submission.statusUpdatedAt,
        statusUpdatedBy: submission.statusUpdatedBy,
        proofType: submission.proofType,
        proofUrl: submission.proofUrl,
        proofText: submission.proofText,
        notes: submission.notes,
        advertiserFeedback: submission.advertiserFeedback,
        advertiserRating: submission.advertiserRating,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,

        // User information
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(submission)
      .leftJoin(user, eq(submission.createdBy, user.id))
      .where(eq(submission.campaignId, parsedCampaignId))
      .orderBy(desc(submission.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: count() })
      .from(submission)
      .where(eq(submission.campaignId, parsedCampaignId));

    const totalCount = totalCountResult[0]?.count || 0;

    return { submissions, totalCount };
  }

  async reviewSubmission({
    submissionId,
    status,
    advertiserRating,
    advertiserFeedback,
  }: ReviewSubmissionData): Promise<void> {
    // Find existing submission
    const existingSubmission = await db
      .select({
        id: submission.id,
        status: submission.status,
        createdBy: submission.createdBy,
        campaignId: submission.campaignId,
        payoutPerUser: campaign.payoutPerUser,
        title: campaign.title,
        maxUsers: campaign.maxUsers,
        totalSubmissions: sql<number>`COALESCE(COUNT(${submission.id}), 0)`,
      })
      .from(submission)
      .where(
        and(
          eq(submission.id, submissionId),
          eq(submission.status, STATUS_ENUM.PENDING),
        ),
      )
      .innerJoin(campaign, eq(submission.campaignId, campaign.id))
      .groupBy(
        submission.id,
        submission.status,
        submission.createdBy,
        submission.campaignId,
        campaign.payoutPerUser,
        campaign.title,
        campaign.maxUsers,
      )
      .limit(1);

    if (existingSubmission.length === 0) {
      throw new NotFoundError("Submission not found");
    }

    const submissionData = existingSubmission[0];

    // Check if maxUsers is reached

    const isNewApproval =
      status === "approved" && submissionData.status !== STATUS_ENUM.APPROVED;

    let newTransaction: TransactionDB | null = null;

    if (isNewApproval) {
      // TODO: Check if this is correct
      if (
        submissionData.maxUsers &&
        submissionData.maxUsers <= submissionData.totalSubmissions
      ) {
        throw new TooManyRequestsError("Max users reached for this campaign");
      }

      // Create a new transaction for the payout
      newTransaction = await transactionService.createTransaction(
        submissionData.createdBy,
        submissionData.payoutPerUser,
        TRANSACTION_TYPE_ENUM.EARNING,
        `Payout for approved submission in campaign: ${submissionData.title}`,
        STATUS_ENUM.PENDING,
        submissionData.campaignId,
      );
    }

    // Make the entire review and payout process a single transaction
    await db.transaction(async (tx) => {
      // Update submission status
      await tx
        .update(submission)
        .set({
          status:
            status === "approved" ? STATUS_ENUM.APPROVED : STATUS_ENUM.REJECTED,
          advertiserFeedback: advertiserFeedback || null,
          advertiserRating: advertiserRating,
        })
        .where(eq(submission.id, submissionId));

      // If this is a new approval, handle payout
      if (isNewApproval) {
        if (!newTransaction) {
          throw new NotFoundError("Transaction not found");
        }

        // Get campaign details for payout amount
        const payoutAmount = submissionData.payoutPerUser;

        // Update user wallet balance
        await userService.incrementUserBalance(
          tx,
          submissionData.createdBy,
          payoutAmount,
        );

        // Create transaction record
        await transactionService.updateTransaction(
          newTransaction.id,
          "approved",
        );
      }
    });
  }

  async updateCampaign(
    campaignId: string,
    userId: string,
    data: UpdateCampaignActivityData,
  ): Promise<void> {
    const id = parseInt(campaignId);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid campaign ID");
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.activity) {
      updatePayload.activity =
        data.activity === "active"
          ? ACTIVITY_ENUM.ACTIVE
          : ACTIVITY_ENUM.PAUSED;
    }
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined)
      updatePayload.description = data.description;
    if (data.instructions) {
      updatePayload.instructions = data.instructions.map((i) => i.instruction);
    }
    if (data.requirements) {
      updatePayload.requirements = data.requirements.map((r) => r.requirement);
    }
    if (data.estimatedTimeMinutes !== undefined)
      updatePayload.estimatedTimeMinutes = data.estimatedTimeMinutes;
    if (data.expiryDate !== undefined)
      updatePayload.expiryDate = data.expiryDate;
    if (data.bannerImageUrl !== undefined)
      updatePayload.bannerImageUrl = data.bannerImageUrl;

    await db
      .update(campaign)
      .set(updatePayload)
      .where(and(eq(campaign.id, id), eq(campaign.createdBy, userId)));
  }

  async logCampaignView(campaignId: string, userId: string): Promise<void> {
    try {
      const parsedCampaignId = parseInt(campaignId);
      if (Number.isNaN(parsedCampaignId)) {
        throw new BadRequestError("Invalid campaign ID");
      }

      await db
        .insert(campaignView)
        .values({
          campaignId: parsedCampaignId,
          userId: userId,
        })
        .onConflictDoNothing();
    } catch (error) {
      // Log the error but don't throw
      console.warn("Failed to log campaign view:", error);
    }
  }

  // async getCampaignViewCount(campaignId: string): Promise<number> {
  //   const parsedCampaignId = parseInt(campaignId);
  //   if (Number.isNaN(parsedCampaignId)) {
  //     throw new BadRequestError("Invalid campaign ID");
  //   }

  //   const result = await db
  //     .select({ count: count() })
  //     .from(campaignView)
  //     .where(eq(campaignView.campaignId, parsedCampaignId));

  //   return result[0]?.count || 0;
  // }

  // async getCampaignViewsByAdvertiser(advertiserId: string): Promise<{ campaignId: number; campaignTitle: string; viewCount: number; }[]> {
  //   const result = await db
  //     .select({
  //       campaignId: campaign.id,
  //       campaignTitle: campaign.title,
  //       viewCount: count(campaignView.id),
  //     })
  //     .from(campaign)
  //     .leftJoin(campaignView, eq(campaign.id, campaignView.campaignId))
  //     .where(eq(campaign.createdBy, advertiserId))
  //     .groupBy(campaign.id, campaign.title)
  //     .orderBy(desc(count(campaignView.id)));

  //   return result.map(row => ({
  //     campaignId: row.campaignId,
  //     campaignTitle: row.campaignTitle,
  //     viewCount: row.viewCount || 0,
  //   }));
  // }
}
export const campaignService = new CampaignService();
