import { STATUS_ENUM, reviewSubmissionSchema } from "@/lib/types";
import {
  errorHandler,
  NotAuthorizedError,
  BadRequestError,
} from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import { userService } from "@/lib/services/user-service";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const submissionId = parseInt((await params).id);
    const body = await request.json();

    // Add submissionId to the body to avoid zod validation error
    const validatedBody = reviewSubmissionSchema.parse({
      ...body,
      submissionId,
    });

    // Validate that feedback is provided when rejecting
    if (
      validatedBody.status === "rejected" &&
      !validatedBody.advertiserFeedback?.trim()
    ) {
      throw new BadRequestError(
        "Feedback is required when rejecting a submission",
      );
    }

    await campaignService.reviewSubmission({
      submissionId,
      status: validatedBody.status,
      advertiserRating: validatedBody.advertiserRating,
      advertiserFeedback: validatedBody.advertiserFeedback,
    });

    return NextResponse.json(
      {
        message: `Submission ${validatedBody.status} successfully`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
