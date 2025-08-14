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
  APPROVED: statusEnum.enumValues.find((value) => value === "approved"),
  PENDING: statusEnum.enumValues.find((value) => value === "pending"),
  REJECTED: statusEnum.enumValues.find((value) => value === "rejected"),
};
export const activityEnum = pgEnum("activity", ["active", "paused", "ended"]);
export const ACTIVITY_ENUM = {
  ACTIVE: activityEnum.enumValues.find((value) => value === "active"),
  PAUSED: activityEnum.enumValues.find((value) => value === "paused"),
  ENDED: activityEnum.enumValues.find((value) => value === "ended"),
};

export const kycTypeEnum = pgEnum("kyc_type", [
  "national_id",
  "passport",
  "driver_license",
]);

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
  steps: text("steps").array().notNull(),
  requirements: text("requirements").array().notNull(),
  payoutPerUser: integer("payout_per_user").notNull(),
  totalCost: integer("total_cost").notNull(),
  totalSlots: integer("total_slots").notNull(),
  image: text("image"),
  estimatedTime: text("estimated_time").notNull(),
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
