import { db } from "@/lib/db";
import {
  campaign,
  advertiser,
  submission,
  transaction,
  user,
} from "@/lib/db/schema";
import {
  ACTIVITY_ENUM,
  STATUS_ENUM,
  type CreateCampaignData,
  type CampaignWithCounts,
  type CampaignWithSubmissions,
  type CampaignDB,
  type TransactionDB,
  type CampaignQuery,
  type SubmissionDB,
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

  async getCampaignsWithSubmissions(
    campaignQuery: CampaignQuery,
  ): Promise<{ campaigns: CampaignWithSubmissions[]; totalCount: number }> {
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

    // Build the base query with left join to submissions
    const sortColumn = campaign[sortBy as keyof typeof campaign] as SQLWrapper;
    const sortDirection = sortOrder === "asc" ? asc : desc;

    const query = db
      .select({
        // Campaign fields
        id: campaign.id,
        createdBy: campaign.createdBy,
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

        // Submission fields (will be null if no submissions)
        submissionId: submission.id,
        submissionCreatedBy: submission.createdBy,
        submissionStatus: submission.status,
        submissionStatusUpdatedAt: submission.statusUpdatedAt,
        submissionStatusUpdatedBy: submission.statusUpdatedBy,
        submissionProofType: submission.proofType,
        submissionProofUrl: submission.proofUrl,
        submissionProofText: submission.proofText,
        submissionNotes: submission.notes,
        submissionAdvertiserFeedback: submission.advertiserFeedback,
        submissionAdvertiserRating: submission.advertiserRating,
        submissionCreatedAt: submission.createdAt,
        submissionUpdatedAt: submission.updatedAt,
      })
      .from(campaign)
      .leftJoin(submission, eq(campaign.id, submission.campaignId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortDirection(sortColumn));

    // Get total count for pagination (counting distinct campaigns, not rows)
    const countQuery = db
      .selectDistinct({ count: count(campaign.id) })
      .from(campaign)
      .leftJoin(submission, eq(campaign.id, submission.campaignId))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const [{ count: totalCount }] = await countQuery;

    // Apply pagination and execute query
    const results = await query.limit(limit).offset((page - 1) * limit);

    // Group submissions by campaign
    const campaignsWithSubmissions = results.reduce(
      (acc, row) => {
        const campaignId = row.id;

        // Find existing campaign in accumulator
        let existingCampaign = acc.find((c) => c.id === campaignId);

        if (!existingCampaign) {
          // Create new campaign entry
          existingCampaign = {
            id: row.id,
            createdBy: row.createdBy,
            title: row.title,
            description: row.description,
            instructions: row.instructions,
            requirements: row.requirements,
            payoutPerUser: row.payoutPerUser,
            totalCost: row.totalCost,
            maxUsers: row.maxUsers,
            estimatedTimeMinutes: row.estimatedTimeMinutes,
            image: row.image,
            bannerImageUrl: row.bannerImageUrl,
            expiryDate: row.expiryDate,
            status: row.status,
            activity: row.activity,
            statusUpdatedAt: row.statusUpdatedAt,
            statusUpdatedBy: row.statusUpdatedBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            submissions: [],
          };
          acc.push(existingCampaign);
        }

        // Add submission if it exists
        if (
          row.submissionId &&
          row.submissionCreatedBy &&
          row.submissionStatus &&
          row.submissionProofType &&
          row.submissionCreatedAt &&
          row.submissionUpdatedAt
        ) {
          existingCampaign.submissions.push({
            id: row.submissionId,
            campaignId: campaignId,
            createdBy: row.submissionCreatedBy,
            status: row.submissionStatus,
            statusUpdatedAt: row.submissionStatusUpdatedAt,
            statusUpdatedBy: row.submissionStatusUpdatedBy,
            proofType: row.submissionProofType,
            proofUrl: row.submissionProofUrl,
            proofText: row.submissionProofText,
            notes: row.submissionNotes,
            advertiserFeedback: row.submissionAdvertiserFeedback,
            advertiserRating: row.submissionAdvertiserRating,
            createdAt: row.submissionCreatedAt,
            updatedAt: row.submissionUpdatedAt,
          });
        }

        return acc;
      },
      [] as Array<CampaignWithSubmissions>,
    );

    return { campaigns: campaignsWithSubmissions, totalCount };
  }

  async getCampaignById(
    campaignId: string,
  ): Promise<CampaignWithCounts | null> {
    const id = parseInt(campaignId);
    if (Number.isNaN(id)) {
      return null;
    }

    const result = await db
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
        totalSubmissions: sql<number>`COALESCE(COUNT(${submission.id}), 0)`,
        approvedSubmissions: sql<number>`COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)`,
        remainingSlots: sql<number>`${campaign.maxUsers} - COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)`,
        completionRate: sql<number>`CASE WHEN ${campaign.maxUsers} > 0 THEN (COALESCE(COUNT(CASE WHEN ${submission.status} = ${sql.param(STATUS_ENUM.APPROVED)} THEN 1 END), 0)::float / ${campaign.maxUsers}::float * 100) ELSE 0 END`,
      })
      .from(campaign)
      .leftJoin(submission, eq(campaign.id, submission.campaignId))
      .leftJoin(advertiser, eq(campaign.createdBy, advertiser.userId))
      .where(eq(campaign.id, id))
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

  async getCampaignSubmissions(
    campaignId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ submissions: SubmissionDB[]; totalCount: number }> {
    const id = parseInt(campaignId);
    if (Number.isNaN(id)) {
      return { submissions: [], totalCount: 0 };
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
      .where(eq(submission.campaignId, id))
      .orderBy(desc(submission.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: count() })
      .from(submission)
      .where(eq(submission.campaignId, id));

    const totalCount = totalCountResult[0]?.count || 0;

    return { submissions, totalCount };
  }

  async updateSubmissionStatus(
    submissionId: number,
    status: "approved" | "rejected",
    advertiserFeedback?: string,
    advertiserRating?: number,
  ): Promise<void> {
    await db
      .update(submission)
      .set({
        status:
          status === "approved" ? STATUS_ENUM.APPROVED : STATUS_ENUM.REJECTED,
        advertiserFeedback: advertiserFeedback || null,
        advertiserRating: advertiserRating || null,
        statusUpdatedAt: new Date(),
      })
      .where(eq(submission.id, submissionId));
  }
}
export const campaignService = new CampaignService();
