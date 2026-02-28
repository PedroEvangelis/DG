import { Elysia } from "elysia";
import { redis } from "@/db/redis";
import { auth } from "@/lib/auth";

export const pluginContext = new Elysia({ name: "plugin-context" })
	.decorate("redis", redis)
	.derive({ as: "global" }, async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		return { session };
	});
