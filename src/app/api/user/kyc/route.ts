import { NextResponse, type NextRequest } from "next/server";
import { BadRequestError, errorHandler } from "@/lib/error-handler";
import { updateKycDetailsSchema } from "@/lib/types";
import { userService } from "@/lib/services/user-service";

export async function PATCH(request: NextRequest) {
  try {
    const user = await userService.validateUser(request);
    const json = await request.json();
    const data = updateKycDetailsSchema.parse(json);
    if (user.kycStatus !== "rejected") {
      throw new BadRequestError(
        "You can only update your KYC after processing",
      );
    }
    const updated = await userService.updateKycDetails(user.id, data);
    return NextResponse.json({ user: updated });
  } catch (error) {
    return errorHandler.handleServerError(error, "PATCH /api/user/kyc");
  }
}
