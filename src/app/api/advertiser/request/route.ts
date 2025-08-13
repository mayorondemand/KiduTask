import { type NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/error-handler";
import { userService } from "@/lib/services/user-service";
import { advertiserService } from "@/lib/services/advertiser-service";

export async function POST(request: NextRequest) {
  try {
    const user = await userService.validateUser(request);

    await advertiserService.requestAdvertiser(user.id);

    return NextResponse.json({
      message: "Advertiser request sent successfully",
    });
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
