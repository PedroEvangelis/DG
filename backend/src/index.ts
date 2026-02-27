import { Elysia } from "elysia";
import { initRedis, redis } from "./db/redis";

const app = new Elysia()
	.decorate("redis", redis)
	.get("/", () => "Hello Elysia")
	.listen(3000);

await initRedis();
