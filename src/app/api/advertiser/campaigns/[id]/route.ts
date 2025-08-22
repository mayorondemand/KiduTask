import { STATUS_ENUM, updateCampaignSchema } from "@/lib/types";
import {
  errorHandler,
  NotAuthorizedError,
  NotFoundError,
} from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import { userService } from "@/lib/services/user-service";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const campaignId = (await params).id;

    const campaign = await campaignService.getCampaignById(campaignId);

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    // Check if the campaign belongs to the authenticated user
    if (campaign.createdBy !== user.id) {
      throw new NotAuthorizedError("You can only view your own campaigns");
    }

    return NextResponse.json(
      {
        campaign,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const campaignId = (await params).id;
    const body = await request.json();
    const validatedBody = updateCampaignSchema.parse(body);

    // Verify the campaign exists and belongs to the user
    const campaign = await campaignService.getCampaignById(campaignId);

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    if (campaign.createdBy !== user.id) {
      throw new NotAuthorizedError("You can only modify your own campaigns");
    }

    // Update campaign activity
    await campaignService.updateCampaign(
      campaignId,
      validatedBody.activity,
      user.id,
    );

    return NextResponse.json(
      {
        message: `Campaign ${validatedBody.activity === "active" ? "activated" : "paused"} successfully`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
