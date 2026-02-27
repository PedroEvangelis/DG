import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "@/db/postgres";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {},
	}),
	plugins: [openAPI()],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
});
