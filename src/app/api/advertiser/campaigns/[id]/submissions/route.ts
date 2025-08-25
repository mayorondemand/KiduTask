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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const campaignId = (await params).id;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // First verify the campaign exists and belongs to the user
    const campaign = await campaignService.getCampaignById(campaignId);

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    if (campaign.createdBy !== user.id) {
      throw new NotAuthorizedError(
        "You can only view submissions for your own campaigns",
      );
    }

    const { submissions, totalCount } =
      await campaignService.getCampaignSubmissions(campaignId, page, limit);

    return NextResponse.json(
      {
        submissions,
        totalCount,
        page,
        limit,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
