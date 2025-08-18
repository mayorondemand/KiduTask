import { STATUS_ENUM } from "@/lib/types";
import { errorHandler, NotAuthorizedError, NotFoundError, BadRequestError } from "@/lib/error-handler";
import { campaignService } from "@/lib/services/campaign-service";
import { userService } from "@/lib/services/user-service";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSubmissionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  advertiserFeedback: z.string().optional(),
  advertiserRating: z.number().min(1).max(5).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await userService.validateSession(request);

    // Check if user is an advertiser
    if (user.advertiserRequestStatus !== STATUS_ENUM.APPROVED) {
      throw new NotAuthorizedError("User is not an advertiser");
    }

    const submissionId = parseInt(params.id);
    const body = await request.json();
    
    const validatedBody = updateSubmissionSchema.parse(body);

    // Validate that feedback is provided when rejecting
    if (validatedBody.status === "rejected" && !validatedBody.advertiserFeedback?.trim()) {
      throw new BadRequestError("Feedback is required when rejecting a submission");
    }

    // Validate that rating is provided when approving
    if (validatedBody.status === "approved" && !validatedBody.advertiserRating) {
      throw new BadRequestError("Rating is required when approving a submission");
    }

    await campaignService.updateSubmissionStatus(
      submissionId,
      validatedBody.status,
      validatedBody.advertiserFeedback,
      validatedBody.advertiserRating
    );

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
