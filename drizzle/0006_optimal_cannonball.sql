ALTER TABLE "campaign" RENAME COLUMN "total_slots" TO "max_users";--> statement-breakpoint
ALTER TABLE "campaign" DROP COLUMN "estimated_time";