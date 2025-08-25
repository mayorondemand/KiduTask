import { db } from "@/lib/db";
import { submission, campaign, campaignRating } from "@/lib/db/schema";
import { STATUS_ENUM, type SubmissionDB } from "@/lib/types";
import { and, eq, desc, or } from "drizzle-orm";
import { BadRequestError, NotAuthorizedError } from "../error-handler";

export interface CreateSubmissionData {
  campaignId: number;
  createdBy: string;
  proofType: "screenshot" | "link" | "text";
  proofUrl?: string;
  proofText: string;
  notes?: string;
}

export interface UpdateSubmissionData {
  proofType: "screenshot" | "link" | "text";
  proofUrl?: string;
  proofText: string;
  notes?: string;
}

class SubmissionService {
  async createSubmission(data: CreateSubmissionData): Promise<SubmissionDB> {
    const newSubmission = await db
      .insert(submission)
      .values({
        campaignId: data.campaignId,
        createdBy: data.createdBy,
        proofType: data.proofType,
        proofUrl: data.proofUrl,
        proofText: data.proofText,
        notes: data.notes,
        status: STATUS_ENUM.PENDING,
      })
      .returning();

    return newSubmission[0];
  }

  async getUserSubmissionsForCampaign(
    campaignId: number,
    userId: string,
  ): Promise<SubmissionDB[]> {
    const submissions = await db
      .select()
      .from(submission)
      .where(
        and(
          eq(submission.campaignId, campaignId),
          eq(submission.createdBy, userId),
        ),
      )
      .orderBy(desc(submission.createdAt));

    return submissions;
  }

  async canUserSubmitToCampaign(
    campaignId: number,
    userId: string,
  ): Promise<{ canSubmit: boolean; reason?: string }> {
    const campaignAndSubmission = await db
      .select({
        campaignStatus: campaign.status,
        campaignActivity: campaign.activity,
        submissionStatus: submission.status,
      })
      .from(campaign)
      .leftJoin(
        submission,
        and(
          eq(submission.campaignId, campaignId),
          eq(submission.createdBy, userId),
          or(
            eq(submission.status, STATUS_ENUM.PENDING),
            eq(submission.status, STATUS_ENUM.APPROVED),
          ),
        ),
      )
      .where(eq(campaign.id, campaignId))
      .limit(1);

    if (campaignAndSubmission.length === 0) {
      return { canSubmit: false, reason: "Campaign not found" };
    }

    const { campaignStatus, campaignActivity, submissionStatus } =
      campaignAndSubmission[0];

    if (campaignStatus !== STATUS_ENUM.APPROVED) {
      return { canSubmit: false, reason: "Campaign is not approved" };
    }

    if (campaignActivity !== "active") {
      return { canSubmit: false, reason: "Campaign is not active" };
    }

    if (
      submissionStatus === STATUS_ENUM.PENDING ||
      submissionStatus === STATUS_ENUM.APPROVED
    ) {
      return {
        canSubmit: false,
        reason: "You already have an active submission for this campaign",
      };
    }

    return { canSubmit: true };
  }

  async submitCampaignRating(
    campaignId: number,
    userId: string,
    rating: number,
  ): Promise<void> {
    const result = await db
      .select({
        submissionId: submission.id,
        submissionStatus: submission.status,
        ratingId: campaignRating.id,
      })
      .from(submission)
      .leftJoin(
        campaignRating,
        and(
          eq(campaignRating.campaignId, campaignId),
          eq(campaignRating.userId, userId),
        ),
      )
      .where(
        and(
          eq(submission.campaignId, campaignId),
          eq(submission.createdBy, userId),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      throw new NotAuthorizedError(
        "You can only rate campaigns for which you have participated",
      );
    }

    const { submissionStatus, ratingId } = result[0];

    if (submissionStatus === STATUS_ENUM.PENDING) {
      throw new BadRequestError(
        "You can only rate campaigns after your submission has been reviewed",
      );
    }

    if (ratingId) {
      throw new BadRequestError(
        "You have already rated this campaign and cannot change your rating",
      );
    }

    // Insert new rating
    await db.insert(campaignRating).values({
      campaignId,
      userId,
      rating,
    });
  }

  async getUserCampaignRating(
    campaignId: number,
    userId: string,
  ): Promise<number | null> {
    const result = await db
      .select({ rating: campaignRating.rating })
      .from(campaignRating)
      .where(
        and(
          eq(campaignRating.campaignId, campaignId),
          eq(campaignRating.userId, userId),
        ),
      )
      .limit(1);

    return result[0]?.rating || null;
  }
}

export const submissionService = new SubmissionService();
