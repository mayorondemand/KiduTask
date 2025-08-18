import { errorHandler, NotAuthorizedError } from "@/lib/error-handler";
import {
  STATUS_ENUM,
  campaignQuerySchema,
  type CampaignQuery,
} from "@/lib/types";
import { campaignService } from "@/lib/services/campaign-service";

import { userService } from "@/lib/services/user-service";
import { type NextRequest, NextResponse } from "next/server";
import { validateQueryParams } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const { searchParams } = new URL(request.url);

    const queryParams = validateQueryParams(
      searchParams,
      campaignQuerySchema,
    ) as CampaignQuery;

    queryParams.advertiserId = user.id;

    const { campaigns, totalCount } =
      await campaignService.getCampaigns(queryParams);

    return NextResponse.json(
      {
        campaigns,
        totalCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
