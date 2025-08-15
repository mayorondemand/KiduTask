import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(1, "Campaign title is required")
    .min(3, "Campaign title must be at least 3 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
  instructions: z
    .array(
      z.object({
        instruction: z.string().min(1, "Instruction cannot be empty"),
      }),
    )
    .min(1, "At least one instruction is required"),
  requirements: z.array(
    z.object({ requirement: z.string().min(1, "Requirement cannot be empty") }),
  ),
  payoutPerUser: z
    .number("Payout per user must be a number")
    .min(10, "Minimum payout is ₦10")
    .max(10000, "Maximum payout is ₦10,000"),
  maxUsers: z
    .number("Maximum users must be a number")
    .min(1, "At least 1 user required")
    .max(10000, "Maximum 10,000 users allowed"),
  expiryDate: z.string().optional(),
  estimatedTimeMinutes: z
    .number("Estimated time must be a number")
    .min(1, "Minimum 1 minute")
    .max(120, "Maximum 120 minutes"),
  bannerImageUrl: z.string().min(1, "Banner image is required"),
});

export type CreateCampaignData = z.infer<typeof createCampaignSchema>;
