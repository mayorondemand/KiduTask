import { NextResponse, type NextRequest } from "next/server";
import { errorHandler, NotAuthorizedError } from "@/lib/error-handler";
import { updateBankAccountSchema } from "@/lib/types";
import { userService } from "@/lib/services/user-service";

export async function PATCH(request: NextRequest) {
  try {
    const user = await userService.validateUser(request);
    const json = await request.json();
    const data = updateBankAccountSchema.parse(json);

    if (!user.isKycVerified) {
      throw new NotAuthorizedError(
        "KYC not approved. Bank details cannot be updated.",
      );
    }
    
    const updated = await userService.updateBankAccount(user.id, data);
    return NextResponse.json({ user: updated });
  } catch (error) {
    return errorHandler.handleServerError(error, "PATCH /api/user/bank");
  }
}
