import { errorHandler } from "@/lib/error-handler";
import { brandSettingsSchema } from "@/lib/types";
import { advertiserService } from "@/lib/services/advertiser-service";
import { userService } from "@/lib/services/user-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Update brand settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);

    const body = await request.json();

    // Validate the request body
    const validationResult = brandSettingsSchema.parse(body);

    // Update brand settings
    await advertiserService.updateBrandSettings(user.id, validationResult);

    return NextResponse.json({
      message: "Brand settings updated successfully",
    });
  } catch (error) {
    return errorHandler.handleServerError(error);
  }
}
