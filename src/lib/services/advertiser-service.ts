import { db } from "@/lib/db";
import { advertiser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { UserDetails } from "@/lib/services/user-service";

class AdvertiserService {
  async requestAdvertiser(userId: UserDetails["id"]) {
    await db.insert(advertiser).values({
      userId,
      status: "pending",
    });
  }

  async approveAdvertiser(
    userId: UserDetails["id"],
    adminId: UserDetails["id"],
  ) {
    await db
      .update(advertiser)
      .set({
        status: "approved",
        statusUpdatedBy: adminId,
        statusUpdatedAt: new Date(),
      })
      .where(eq(advertiser.userId, userId));
  }

  async rejectAdvertiser(
    userId: UserDetails["id"],
    adminId: UserDetails["id"],
  ) {
    await db
      .update(advertiser)
      .set({
        status: "rejected",
        statusUpdatedBy: adminId,
        statusUpdatedAt: new Date(),
      })
      .where(eq(advertiser.userId, userId));
  }
}

export const advertiserService = new AdvertiserService();
