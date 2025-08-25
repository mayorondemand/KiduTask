import {
  BadRequestError,
  errorHandler,
  NotAuthorizedError,
} from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import {
  ACTIVITY_ENUM,
  campaignQuerySchema,
  STATUS_ENUM,
  type CampaignQuery,
} from "@/lib/types";

import { userService } from "@/lib/services/user-service";
import { validateQueryParams } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await userService.validateSession(request);

    const { searchParams } = new URL(request.url);

    const queryParams = validateQueryParams(
      searchParams,
      campaignQuerySchema,
    ) as CampaignQuery;

    // Limit the number of campaigns to 50
    if (queryParams.limit && queryParams.limit > 50) {
      throw new BadRequestError("Limit cannot be greater than 50");
    }

    // Do not allow filtering by advertiserId
    if (queryParams.advertiserId) {
      throw new NotAuthorizedError(
        "You are not authorized to filter campaigns by advertiser",
      );
    }

    // Only return campaigns that are active and approved
    queryParams.status = STATUS_ENUM.APPROVED;
    queryParams.activity = ACTIVITY_ENUM.ACTIVE;

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
