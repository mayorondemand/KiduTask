import {
  activityEnum,
  type campaignRating,
  kycTypeEnum,
  proofTypeEnum,
  statusEnum,
  type campaign,
  type submission,
  type transaction,
  type transactionTypeEnum,
  type user,
} from "@/lib/db/schema";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type {
  PostgresJsDatabase,
  PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";
import { z } from "zod";

export type Db = PostgresJsDatabase;
export type Tx = PgTransaction<PostgresJsQueryResultHKT>;

export const ratingSchema = z
  .number()
  .min(1, "Rating must be between 1 and 5")
  .max(5, "Rating must be between 1 and 5");

export const ratingReviewSchema = z.object({
  rating: ratingSchema,
});

export type RatingReviewData = z.infer<typeof ratingReviewSchema>;

// DB Types
export type CampaignDB = typeof campaign.$inferSelect;
export type SubmissionDB = typeof submission.$inferSelect;
export type UserDB = typeof user.$inferSelect;
export type TransactionDB = typeof transaction.$inferSelect;
export type CampaignRatingDB = typeof campaignRating.$inferSelect;

// Extended types for joined data
export type SubmissionWithUser = SubmissionDB & {
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
};

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

export type ProofTypeEnum = (typeof proofTypeEnum.enumValues)[number];
export type KycTypeEnum = (typeof kycTypeEnum.enumValues)[number];

//Schemas
export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    image: z.url().optional(),
    phoneNumber: z
      .string()
      .regex(/^\d+$/, "Phone number must contain digits only")
      .optional(),
    address: z.string().optional(),
  })
  .strict();

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export const updateBankAccountSchema = z
  .object({
    bankAccountName: z.string().min(2, "Account name is required").max(200),
    bankAccountNumber: z
      .string()
      .regex(/^\d{10,}$/, "Account number must be at least 10 digits"),
    bankName: z.string().min(2, "Bank name is required").max(200),
  })
  .strict();

export type UpdateBankAccountData = z.infer<typeof updateBankAccountSchema>;

export const updateKycDetailsSchema = z
  .object({
    idType: z.enum(kycTypeEnum.enumValues),
    idNumber: z.string().min(3, "ID number is required").max(100),
    idUrl: z.url("A valid document URL is required"),
  })
  .strict();

export type UpdateKycDetailsData = z.infer<typeof updateKycDetailsSchema>;

export const createCampaignSchema = z
  .object({
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
      z.object({
        requirement: z.string().min(1, "Requirement cannot be empty"),
      }),
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
  })
  .strict();

export const campaignQuerySchema = z
  .object({
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
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "title",
        "payoutPerUser",
        "totalCost",
        "maxUsers",
        "estimatedTimeMinutes",
        "expiryDate",
        "status",
        "activity",
        "totalSubmissions",
        "approvedSubmissions",
        "remainingSlots",
        "completionRate",
      ])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .strict();

export const brandSettingsSchema = z
  .object({
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
  })
  .strict();

export type BrandSettingsFormData = z.infer<typeof brandSettingsSchema>;

export type CampaignQuery = z.infer<typeof campaignQuerySchema>;
export type CreateCampaignData = z.infer<typeof createCampaignSchema>;
export type CampaignFilters = Partial<CampaignQuery> &
  Pick<CampaignQuery, "page" | "limit">;

// Type for campaign with submission counts and approved submissions
export type CampaignWithCounts = CampaignDB & {
  totalSubmissions: number;
  approvedSubmissions: number;
  remainingSlots: number;
  completionRate: number;
  advertiserBrandName: string | null;
  advertiserBrandDescription: string | null;
  advertiserBrandWebsite: string | null;
  advertiserBrandLogo: string | null;
};

export type CampaignSubmissionAndCount = {
  submissions: SubmissionWithUser[];
  totalCount: number;
};

export const reviewSubmissionSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    advertiserFeedback: z.string().optional(),
    advertiserRating: ratingSchema,
    submissionId: z.number(), // This is the submission ID
  })
  .strict();

export type ReviewSubmissionData = z.infer<typeof reviewSubmissionSchema>;

export const updateCampaignSchema = createCampaignSchema
  .omit({
    payoutPerUser: true,
    maxUsers: true,
  })
  .partial()
  .extend({
    campaignId: z.string(),
    activity: z.enum(activityEnum.enumValues),
  })
  .strict();

export type UpdateCampaignActivityData = z.infer<typeof updateCampaignSchema>;

export const submissionFormSchema = z
  .object({
    proofType: z.enum(proofTypeEnum.enumValues), // required
    proofUrl: z.string().optional(),
    proofText: z.string().optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      if (!data.proofType) {
        return false;
      }
      if (data.proofType === "screenshot") {
        return !!data.proofUrl;
      }
      if (data.proofType === "link") {
        return !!data.proofText;
      }
      if (data.proofType === "text") {
        return !!data.proofText;
      }
      return true;
    },
    {
      message: "Please provide the required proof based on your selection",
      path: ["proofType"],
    },
  )
  .strict();

export type SubmissionFormData = z.infer<typeof submissionFormSchema>;

// User profile aggregates for profile page
export type UserStats = {
  totalEarnings: number;
  completedTasks: number;
  successRate: number; // integer percentage 0-100
  averageRating: number; // up to 1 decimal place
};

export type RecentActivityItem = Pick<CampaignDB, "title" | "payoutPerUser"> &
  Pick<
    SubmissionDB,
    | "id"
    | "campaignId"
    | "status"
    | "createdAt"
    | "statusUpdatedAt"
    | "advertiserFeedback"
    | "advertiserRating"
  > &
  Pick<CampaignRatingDB, "rating">;
