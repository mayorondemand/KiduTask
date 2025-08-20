import { errorHandler, NotAuthorizedError } from "@/lib/error-handler";
import {
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

    const { searchParams } = new URL(request.url);

    const queryParams = validateQueryParams(
      searchParams,
      campaignQuerySchema,
    ) as CampaignQuery;

    // Check if query id is from the same advertiser
    if (queryParams.advertiserId && queryParams.advertiserId !== user.id) {
      throw new NotAuthorizedError("You are not authorized to filter campaigns by advertiser");
    }
    

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
