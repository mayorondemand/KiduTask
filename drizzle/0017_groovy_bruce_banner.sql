ALTER TABLE "admin_roles" DROP CONSTRAINT "admin_roles_admin_id_admin_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_roles" DROP CONSTRAINT "admin_roles_created_by_admin_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_roles" DROP CONSTRAINT "admin_roles_updated_by_admin_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_user" ADD COLUMN "role_id" integer;--> statement-breakpoint
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_roles" DROP COLUMN "admin_id";--> statement-breakpoint
ALTER TABLE "admin_roles" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "admin_roles" DROP COLUMN "updated_by";--> statement-breakpoint
ALTER TABLE "admin_user" DROP COLUMN "role";