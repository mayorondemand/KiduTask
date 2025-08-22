import { errorHandler, NotFoundError } from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import { userService } from "@/lib/services/user-service";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await userService.validateSession(request);
    const campaignId = (await params).id;

    const campaign = await campaignService.getCampaignById(campaignId);

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    // Only return approved and active campaigns to regular users
    if (campaign.status !== "approved" || campaign.activity !== "active") {
      throw new NotFoundError("Campaign not available");
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
