import { errorHandler, NotFoundError } from "@/lib/error-handler";
import { platForm } from "@/lib/services/platform-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await platForm.getPlatformSettings();
    if (!settings) {
      throw new NotFoundError("Platform settings not found");
    }
    return NextResponse.json({
      platformFee: settings.platformFee,
      minimumWithdrawal: settings.minimumWithdrawal,
      maximumWithdrawal: settings.maximumWithdrawal,
      minimumDeposit: settings.minimumDeposit,
      withdrawalFee: settings.withdrawalFee,
    });
  } catch (error) {
    errorHandler.handleServerError(error);
  }
}
