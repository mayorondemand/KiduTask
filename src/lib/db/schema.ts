import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const STATUS_ENUM = {
  APPROVED: statusEnum.enumValues.find(
    (value) => value === "approved",
  ) as StatusEnum,
  PENDING: statusEnum.enumValues.find(
    (value) => value === "pending",
  ) as StatusEnum,
  REJECTED: statusEnum.enumValues.find(
    (value) => value === "rejected",
  ) as StatusEnum,
};
export type StatusEnum = (typeof statusEnum.enumValues)[number];
export const activityEnum = pgEnum("activity", ["active", "paused", "ended"]);
export const ACTIVITY_ENUM = {
  ACTIVE: activityEnum.enumValues.find(
    (value) => value === "active",
  ) as ActivityEnum,
  PAUSED: activityEnum.enumValues.find(
    (value) => value === "paused",
  ) as ActivityEnum,
  ENDED: activityEnum.enumValues.find(
    (value) => value === "ended",
  ) as ActivityEnum,
};
export type ActivityEnum = (typeof activityEnum.enumValues)[number];

export const kycTypeEnum = pgEnum("kyc_type", [
  "national_id",
  "passport",
  "driver_license",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdrawal",
  "earning",
  "spending",
  "campaign_creation",
]);
export const TRANSACTION_TYPE_ENUM = {
  DEPOSIT: transactionTypeEnum.enumValues.find(
    (value) => value === "deposit",
  ) as TransactionTypeEnum,
  WITHDRAWAL: transactionTypeEnum.enumValues.find(
    (value) => value === "withdrawal",
  ) as TransactionTypeEnum,
  EARNING: transactionTypeEnum.enumValues.find(
    (value) => value === "earning",
  ) as TransactionTypeEnum,
  SPENDING: transactionTypeEnum.enumValues.find(
    (value) => value === "spending",
  ) as TransactionTypeEnum,
  CAMPAIGN_CREATION: transactionTypeEnum.enumValues.find(
    (value) => value === "campaign_creation",
  ) as TransactionTypeEnum,
};
export type TransactionTypeEnum =
  (typeof transactionTypeEnum.enumValues)[number];

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),

  //Additional fields
  walletBalance: integer("wallet_balance").notNull().default(0),
});

export const kyc = pgTable("kyc", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "no action" }),
  idType: kycTypeEnum("id_type").notNull(),
  idNumber: text("id_number").notNull(),
  idUrl: text("id_url").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address").notNull(),
  country: text("country").notNull(),
  status: statusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const advertiser = pgTable("advertiser", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: text("user_id")
    .unique()
    .notNull()
    .references(() => user.id),
  brandName: text("brand_name"),
  brandWebsite: text("brand_website"),
  brandLogo: text("brand_logo"),
  brandDescription: text("brand_description"),
  status: statusEnum("status").notNull().default("pending"),
  statusUpdatedAt: timestamp("status_updated_at"),
  statusUpdatedBy: text("status_updated_by").references(() => user.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const campaign = pgTable("campaign", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  createdBy: text("created_by")
    .notNull()
    .references(() => advertiser.userId),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").array().notNull(),
  requirements: text("requirements").array().notNull(),
  payoutPerUser: integer("payout_per_user").notNull(),
  totalCost: integer("total_cost").notNull(),
  maxUsers: integer("max_users").notNull(),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull(),
  image: text("image"),
  bannerImageUrl: text("banner_image_url"),
  expiryDate: timestamp("expiry_date"),
  status: statusEnum("status").notNull().default("pending"),
  activity: activityEnum("activity").notNull().default("active"),
  statusUpdatedAt: timestamp("status_updated_at"),
  statusUpdatedBy: text("status_updated_by").references(() => user.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const campaignView = pgTable("campaign_view", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaign.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  advertiserId: text("advertiser_id")
    .notNull()
    .references(() => advertiser.userId),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const campaignRating = pgTable("campaign_rating", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaign.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const submission = pgTable("submission", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaign.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  status: statusEnum("status").notNull().default("pending"),
  statusUpdatedAt: timestamp("status_updated_at"),
  statusUpdatedBy: text("status_updated_by").references(() => user.id),
  proofType: text("proof_type").notNull(),
  proofUrl: text("proof_url"),
  proofText: text("proof_text"),
  notes: text("notes"),
  advertiserFeedback: text("advertiser_feedback"),
  advertiserRating: integer("advertiser_rating"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const platformSettings = pgTable("platform_settings", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  platformFee: integer("platform_fee").notNull(),
  minimumWithdrawal: integer("minimum_withdrawal").notNull(),
  maximumWithdrawal: integer("maximum_withdrawal").notNull(),
  minimumDeposit: integer("minimum_deposit").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedBy: text("updated_by").references(() => user.id),
});

export const transaction = pgTable("transaction", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  campaignId: integer("campaign_id").references(() => campaign.id),
  status: statusEnum("status").notNull().default("pending"),
  amount: integer("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedBy: text("updated_by").references(() => user.id),
});
