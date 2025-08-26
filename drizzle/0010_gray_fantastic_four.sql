ALTER TABLE "campaign_view" DROP CONSTRAINT "campaign_view_advertiser_id_advertiser_user_id_fk";
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_campaign_index" ON "campaign_view" USING btree ("campaign_id","user_id");--> statement-breakpoint
ALTER TABLE "campaign_view" DROP COLUMN "advertiser_id";--> statement-breakpoint
ALTER TABLE "campaign_view" DROP COLUMN "updated_at";