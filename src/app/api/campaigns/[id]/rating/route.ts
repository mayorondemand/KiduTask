import { errorHandler, BadRequestError } from "@/lib/error-handler";
import { userService } from "@/lib/services/user-service";
import { submissionService } from "@/lib/services/submission-service";
import { type NextRequest, NextResponse } from "next/server";
import { ratingReviewSchema } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);
    const campaignId = Number.parseInt((await params).id);

    if (Number.isNaN(campaignId)) {
      throw new BadRequestError("Invalid campaign ID");
    }

    const rating = await submissionService.getUserCampaignRating(
      campaignId,
      user.id,
    );

    return NextResponse.json(
      {
        rating,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);
    const campaignId = Number.parseInt((await params).id);

    if (Number.isNaN(campaignId)) {
      throw new BadRequestError("Invalid campaign ID");
    }

    const body = await request.json();
    const data = ratingReviewSchema.parse(body);

    await submissionService.submitCampaignRating(
      campaignId,
      user.id,
      data.rating,
    );

    return NextResponse.json(
      {
        message: "Campaign rating submitted successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
