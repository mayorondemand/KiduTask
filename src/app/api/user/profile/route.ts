import { NextResponse, type NextRequest } from "next/server";
import { errorHandler } from "@/lib/error-handler";
import { updateProfileSchema } from "@/lib/types";
import { userService } from "@/lib/services/user-service";

export async function PATCH(request: NextRequest) {
  try {
    const user = await userService.validateUser(request);
    const json = await request.json();
    const data = updateProfileSchema.parse(json);
    const updated = await userService.updateProfile(user.id, data);
    return NextResponse.json({ user: updated });
  } catch (error) {
    return errorHandler.handleServerError(error, "PATCH /api/user/profile");
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await userService.validateSession(request);

    //TODO: Optimize into one query
    const [stats, recent] = await Promise.all([
      userService.getUserStats(user.id),
      userService.getRecentActivity(user.id, 10),
    ]);

    return NextResponse.json({ stats, recentActivity: recent });
  } catch (error) {
    return errorHandler.handleServerError(error, "GET /api/user/profile");
  }
}
