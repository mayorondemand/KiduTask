import { type NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { transactionService } from "@/lib/services/transaction-service";
import { errorHandler } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);
    const data = await transactionService.getUserTransactions(user.id);
    return NextResponse.json({ transactions: data });
  } catch {
    return errorHandler.handleServerError;
  }
}
