ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."userRole";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "type" SET DATA TYPE "public"."userType";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE "public"."userGender";