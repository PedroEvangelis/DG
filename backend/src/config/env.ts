import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";

const envSchema = t.Object({
	DATABASE_URL: t.String({ minLength: 1, error: "DATABASE_URL é obrigatória" }),
	REDIS_URL: t.String({ minLength: 1, error: "REDIS_URL é obrigatória" }),
	BETTER_AUTH_SECRET: t.String({
		minLength: 10,
		error: "BETTER_AUTH_SECRET deve ter no mínimo 10 caracteres",
	}),
	FRONTEND_URL: t.String({
		minLength: 1,
		error: "FRONTEND_URL é obrigatória",
	}),
	PORT: t.Number({ default: 3000, error: "PORT deve ser um número" })
});

const processEnv = {
	DATABASE_URL: Bun.env.DATABASE_URL,
	REDIS_URL: Bun.env.REDIS_URL,
	BETTER_AUTH_SECRET: Bun.env.BETTER_AUTH_SECRET,
	FRONTEND_URL: Bun.env.FRONTEND_URL,
	PORT: process.env.PORT ? parseInt(process.env.PORT) : undefined,
};

const errors = [...Value.Errors(envSchema, processEnv)];

if (errors.length > 0) {
	console.error(
		"❌ Falha na inicialização: Erro nas variáveis de ambiente (.env)",
	);
	errors.forEach((e) => {
		console.error(`   -> ${e.path.replace("/", "")}: ${e.message}`);
	});
	process.exit(1); // Derruba o processo imediatamente (Fail-Fast)
}

export const env = processEnv as Static<typeof envSchema>;
