import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";
import { db } from "@/db/postgres";
import { redis } from "@/db/redis";

import * as schema from "@/db/schema";
import { env } from "@/config/env";

export const auth = betterAuth({
	trustedOrigins: [env.FRONTEND_URL],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	secondaryStorage: {
		get: async (key) => {
			return await redis.get(key);
		},
		set: async (key, value, ttl) => {
			if (ttl) {
				await redis.set(key, value, "EX", ttl);
			} else {
				await redis.set(key, value);
			}
		},
		delete: async (key) => {
			await redis.del(key);
		},
	},
	plugins: [openAPI(), admin()],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
});
