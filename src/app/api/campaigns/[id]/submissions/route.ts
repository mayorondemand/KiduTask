import { BadRequestError, errorHandler } from "@/lib/error-handler";
import { submissionService } from "@/lib/services/submission-service";
import { userService } from "@/lib/services/user-service";
import { submissionFormSchema } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server";

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

    const userSubmissions =
      await submissionService.getUserSubmissionsForCampaign(
        campaignId,
        user.id,
      );

    return NextResponse.json(
      {
        submissions: userSubmissions,
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
    const data = submissionFormSchema.parse(body);

    const canSubmitResult = await submissionService.canUserSubmitToCampaign(
      campaignId,
      user.id,
    );

    if (!canSubmitResult.canSubmit) {
      throw new BadRequestError(
        canSubmitResult.reason || "Cannot submit to this campaign",
      );
    }

    // Create new submission using service
    const newSubmission = await submissionService.createSubmission({
      campaignId,
      createdBy: user.id,
      proofType: data.proofType,
      proofUrl: data.proofUrl,
      proofText: data.proofText || "",
      notes: data.notes,
    });

    return NextResponse.json(
      {
        message: "Submission created successfully",
        submission: newSubmission,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
