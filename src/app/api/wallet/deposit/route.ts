import {
  BadRequestError,
  errorHandler,
  NotFoundError,
} from "@/lib/error-handler";
import { paymentService } from "@/lib/services/payment-service";
import { platForm } from "@/lib/services/platform-service";
import { transactionService } from "@/lib/services/transaction-service";
import { userService } from "@/lib/services/user-service";
import { STATUS_ENUM, TRANSACTION_TYPE_ENUM } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);

    const body = await request.json();
    const amount = Number(body?.amount);
    if (!amount || Number.isNaN(amount)) {
      throw new BadRequestError("Amount is required");
    }

    const settings = await platForm.getPlatformSettings();
    if (!settings) {
      throw new NotFoundError("Platform Settings not Found");
    }

    if (amount < settings.minimumDeposit) {
      throw new BadRequestError(
        `Minimum Deposit is ${formatCurrency(settings.minimumDeposit)}`,
      );
    }

    const tx = await transactionService.createTransaction(
      user.id,
      amount,
      TRANSACTION_TYPE_ENUM.DEPOSIT,
      "Wallet deposit via Flutterwave",
      STATUS_ENUM.PENDING,
    );

    const txRef = tx.id;

    const flw = await paymentService.initiatePayment({
      name: user.name,
      amount,
      email: user.email,
      txRef,
    });

    return NextResponse.json({
      link: flw?.data?.link,
    });
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
