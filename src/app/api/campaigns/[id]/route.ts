import { errorHandler, NotFoundError } from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import { userService } from "@/lib/services/user-service";
import { ACTIVITY_ENUM, STATUS_ENUM } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);
    const campaignId = (await params).id;

    const campaign = await campaignService.getCampaignById(campaignId);

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    // Only return approved and active campaigns to regular users
    if (
      campaign.status !== STATUS_ENUM.APPROVED ||
      campaign.activity !== ACTIVITY_ENUM.ACTIVE
    ) {
      throw new NotFoundError("Campaign not available");
    }

    // Log the campaign view without waiting
    campaignService.logCampaignView(campaignId, user.id);

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
