import { AppError, errorHandler } from "@/lib/error-handler";
import { userService } from "@/lib/services/user-service";
import { getUploadAuthParams } from "@imagekit/next/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await userService.validateSession(request);
    // Get ImageKit credentials from environment variables
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      throw new AppError(
        "ImageKit credentials not configured",
        "CREDENTIALS_NOT_CONFIGURED",
        500,
      );
    }

    // Generate upload authentication parameters
    const authParams = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    return NextResponse.json({
      ...authParams,
      publicKey,
    });
  } catch (error) {
    errorHandler.handleServerError(error);
  }
}
