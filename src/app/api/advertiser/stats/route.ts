import { type NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/error-handler";
import { userService } from "@/lib/services/user-service";
import { advertiserService } from "@/lib/services/advertiser-service";

export async function GET(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);

    const stats = await advertiserService.getAdvertiserStats(user.id);
    return NextResponse.json({
      stats,
    });
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
