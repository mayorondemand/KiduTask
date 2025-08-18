import { STATUS_ENUM } from "@/lib/types";
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
  { params }: { params: { id: string } },
) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const campaignId = params.id;

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
