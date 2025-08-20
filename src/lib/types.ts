import {
  activityEnum,
  statusEnum,
  type transactionTypeEnum,
  type campaign,
  type submission,
  type transaction,
  type user,
} from "@/lib/db/schema";
import { z } from "zod";

// DB Types
export type CampaignDB = typeof campaign.$inferSelect;
export type SubmissionDB = typeof submission.$inferSelect;
export type UserDB = typeof user.$inferSelect;
export type TransactionDB = typeof transaction.$inferSelect;

// DB Enums
export type StatusEnum = (typeof statusEnum.enumValues)[number];
export const STATUS_ENUM = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
} satisfies Record<string, StatusEnum>;
export type ActivityEnum = (typeof activityEnum.enumValues)[number];
export const ACTIVITY_ENUM = {
  ACTIVE: "active",
  PAUSED: "paused",
  ENDED: "ended",
} satisfies Record<string, ActivityEnum>;

export type TransactionTypeEnum =
  (typeof transactionTypeEnum.enumValues)[number];
export const TRANSACTION_TYPE_ENUM = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  EARNING: "earning",
  SPENDING: "spending",
  CAMPAIGN_CREATION: "campaign_creation",
} satisfies Record<string, TransactionTypeEnum>;

//Schemas
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
  expiryDate: z.date().optional(),
  estimatedTimeMinutes: z
    .number("Estimated time must be a number")
    .min(1, "Minimum 1 minute")
    .max(120, "Maximum 120 minutes"),
  bannerImageUrl: z.string().min(1, "Banner image is required"),
});

export const campaignQuerySchema = z.object({
  page: z.number().min(0),
  limit: z.number().min(1),
  search: z.string().optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  activity: z.enum(activityEnum.enumValues).optional(),
  advertiserId: z.string().optional(),
  minPayout: z.number().optional(),
  maxPayout: z.number().optional(),
  minMaxUsers: z.number().optional(),
  maxMaxUsers: z.number().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  expiryAfter: z.date().optional(),
  expiryBefore: z.date().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const brandSettingsSchema = z.object({
  brandName: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Brand description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  website: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Please enter a valid website URL",
      },
    ),
  logo: z.string().optional(),
});

export type BrandSettingsFormData = z.infer<typeof brandSettingsSchema>;

export type CampaignQuery = z.infer<typeof campaignQuerySchema>;
export type CreateCampaignData = z.infer<typeof createCampaignSchema>;

// Type for campaign with submission counts and approved submissions
export type CampaignWithCounts = CampaignDB & {
  totalSubmissions: number;
  approvedSubmissions: number;
};

// Type for campaign with full submission data and submissions
export type CampaignWithSubmissions = CampaignDB & {
  submissions: Array<SubmissionDB>;
};
