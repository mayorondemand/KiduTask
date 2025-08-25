import { db } from "@/lib/db";
import { paymentLog } from "@/lib/db/schema";
import { BadRequestError, errorHandler } from "@/lib/error-handler";
import { paymentService } from "@/lib/services/payment-service";
import { transactionService } from "@/lib/services/transaction-service";
import { STATUS_ENUM } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const rawBody = await request.text();

  paymentService.verifySignature(request);

  const { event, parsedTransaction, amount, flwId } =
    paymentService.parseAndValidateEvent(rawBody);
  try {
    const initialTransaction =
      await transactionService.getTransactionById(parsedTransaction);
    if (!initialTransaction) {
      throw new BadRequestError("Transaction ID not Found");
    }

    // Persist event log
    await db.insert(paymentLog).values({
      provider: "flutterwave",
      eventType: event?.event || "payment.event",
      transactionId: initialTransaction.id,
      userId: initialTransaction.userId,
      amount: amount ?? null,
      payLoad: event,
    });

    // Only proceed to verify if still pending
    if (initialTransaction.status !== STATUS_ENUM.PENDING) {
      return NextResponse.json({});
    }

    // Verify with Flutterwave
    const verify = await paymentService.verifyTransaction(flwId);
    const verified =
      verify?.status === "success" &&
      Number(verify?.data?.charged_amount) >= initialTransaction.amount &&
      verify?.data?.currency === "NGN" &&
      String(verify?.data?.tx_ref) === String(initialTransaction.id);

    if (!verified) {
      console.error(verify, event);
      return NextResponse.json({ ok: true });
    }

    await paymentService.commitApprovedDeposit(initialTransaction);

    return NextResponse.json({ ok: true });
  } catch (error) {
    errorHandler.handleServerError(error);
  }
}
