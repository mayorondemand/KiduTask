import {
  AppError,
  BadRequestError,
  errorHandler,
  NotAuthorizedError,
} from "@/lib/error-handler";
import {
  campaignQuerySchema,
  createCampaignSchema,
  STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
  type CampaignQuery,
} from "@/lib/types";
import { campaignService } from "@/lib/services/campaign-service";

import { userService } from "@/lib/services/user-service";
import { type NextRequest, NextResponse } from "next/server";
import { validateQueryParams } from "@/lib/utils";
import { platForm } from "@/lib/services/platform-service";
import { transactionService } from "@/lib/services/transaction-service";

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

    // Do not allow filtering by advertiserId
    if (queryParams.advertiserId) {
      throw new NotAuthorizedError(
        "You are not authorized to filter campaigns by advertiser",
      );
    }

    // Set advertiserId to the user's id
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

export async function POST(request: NextRequest) {
  try {
    const user = await userService.validateUser(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const rawBody = await request.json();

    rawBody.expiryDate = new Date(rawBody.expiryDate);

    const validatedBody = createCampaignSchema.parse(rawBody);

    const costOfCampaign = await platForm.getAmountAfterPlatformFee(
      validatedBody.payoutPerUser,
      validatedBody.maxUsers,
    );

    // Check if user has enough balance
    if (user.walletBalance < costOfCampaign) {
      throw new BadRequestError("Insufficient balance");
    }

    const campaignCreationTransaction =
      await transactionService.createTransaction(
        user.id,
        costOfCampaign,
        TRANSACTION_TYPE_ENUM.CAMPAIGN_CREATION,
        `Campaign creation for ${validatedBody.title}`,
        STATUS_ENUM.PENDING,
      );

    const { campaign, campaignCreatedTransaction } =
      await campaignService.createCampaign(
        user.id,
        validatedBody,
        costOfCampaign,
        campaignCreationTransaction.id,
      );

    if (campaignCreatedTransaction.status !== STATUS_ENUM.APPROVED) {
      await transactionService.updateTransaction(
        campaignCreatedTransaction.id,
        STATUS_ENUM.REJECTED,
      );
      throw new AppError(
        "Campaign creation failed",
        "CAMPAIGN_CREATION_FAILED",
      );
    }

    return NextResponse.json(
      {
        campaignId: campaign.id,
        message: "Campaign created successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
