import { db } from "@/lib/db";
import { platformSettings } from "@/lib/db/schema";

class PlatformService {
  async getPlatformSettings() {
    const settings = await db.select().from(platformSettings).limit(1);
    return settings[0];
  }

  async getAmountAfterPlatformFee(payoutPerUser: number, maxUsers: number) {
    const settings = await this.getPlatformSettings();
    const platformFee = settings.platformFee;
    const cost = payoutPerUser * maxUsers;
    return cost + platformFee;
  }
}

export const platForm = new PlatformService();
