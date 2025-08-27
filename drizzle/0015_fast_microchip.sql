ALTER TABLE "admin_session" RENAME COLUMN "admin_user_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "admin_session" DROP CONSTRAINT "admin_session_admin_user_id_admin_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_session" ADD CONSTRAINT "admin_session_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;