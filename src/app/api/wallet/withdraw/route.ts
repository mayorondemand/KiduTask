import { type NextRequest, NextResponse } from "next/server";
import { platForm } from "@/lib/services/platform-service";
import { userService } from "@/lib/services/user-service";
import { transactionService } from "@/lib/services/transaction-service";
import { STATUS_ENUM, TRANSACTION_TYPE_ENUM } from "@/lib/types";
import {
  BadRequestError,
  errorHandler,
  NotAuthorizedError,
} from "@/lib/error-handler";
import { formatCurrency } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);
    const body = await request.json();

    if (!user.isKycVerified) {
      throw new NotAuthorizedError("Your KYC is not verified");
    }

    //TODO check for bank settings

    const amount = Number(body?.amount);
    if (!amount || Number.isNaN(amount)) {
      throw new BadRequestError("Amount is required");
    }
    const settings = await platForm.getPlatformSettings();
    const withdrawalFee = settings.withdrawalFee;
    if (!settings) {
      throw new BadRequestError("Platform Settings not Found");
    }
    if (amount < settings.minimumWithdrawal) {
      throw new BadRequestError(
        `Minimum Withdrawal is ${formatCurrency(settings.minimumWithdrawal)}`,
      );
    }
    if (user.walletBalance < settings.minimumWithdrawal + amount) {
      throw new BadRequestError("Your balance is too low");
    }

    await transactionService.createTransaction(
      user.id,
      amount,
      TRANSACTION_TYPE_ENUM.WITHDRAWAL,
      `Wallet withdrawal request (fee ${withdrawalFee})`,
      STATUS_ENUM.PENDING,
    );

    return NextResponse.json({ message: "Withdrawal request created" });
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
