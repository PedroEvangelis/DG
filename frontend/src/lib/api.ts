import type { App } from "@backend/index";
import { treaty } from "@elysiajs/eden";

export const { api } = treaty<App>(
	import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
);
