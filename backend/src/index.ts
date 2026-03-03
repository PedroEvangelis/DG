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
			origin: [env.FRONTEND_URL, `http://localhost:${env.PORT}`],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(openapi({ path: "/api/docs" }))
	.mount(auth.handler)
	.use(userController)
	.use(addressController)
	.use(integrationsController)
	.on("start", () => {
		console.log(`Server is running on http://localhost:${env.PORT}`);
	})
	.listen(env.PORT);

export type App = typeof app;
