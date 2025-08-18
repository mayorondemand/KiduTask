import { STATUS_ENUM, TRANSACTION_TYPE_ENUM } from "@/lib/types";
import {
  AppError,
  BadRequestError,
  errorHandler,
  NotAuthorizedError,
} from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import { platForm } from "@/lib/services/platform-service";
import { transactionService } from "@/lib/services/transaction-service";
import { userService } from "@/lib/services/user-service";
import { createCampaignSchema } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const rawBody = await request.json();

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
