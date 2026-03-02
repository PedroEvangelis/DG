CREATE TYPE "public"."userRole" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."userType" AS ENUM('pf', 'pj');--> statement-breakpoint
CREATE TYPE "public"."userGender" AS ENUM('M', 'F', 'O', 'N');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."userRole" USING "role"::"public"."userRole";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "type" SET DATA TYPE "public"."userType" USING "type"::"public"."userType";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE "public"."userGender" USING "gender"::"public"."userGender";