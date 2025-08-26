ALTER TABLE "kyc" ADD COLUMN "bank_account_name" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "bank_account_number" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "kyc" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "kyc" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "kyc" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "kyc" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "kyc" DROP COLUMN "country";