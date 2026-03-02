import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth } from "@/lib/auth";
import { addressController } from "@/modules/addresses/address.controller";
import { integrationsController } from "@/modules/integrations/integrations.controller";
import { userController } from "@/modules/users/user.controller";
import { initRedis } from "./db/redis";
import { env } from "@/config/env";

await initRedis();

const app = new Elysia()
	.use(
		cors({
			origin: [env.FRONTEND_URL],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(openapi({ path: "/api/docs" }))
	.mount(auth.handler)
	.use(userController)
	.use(addressController)
	.use(integrationsController)
	.listen(3000);

export type App = typeof app;
