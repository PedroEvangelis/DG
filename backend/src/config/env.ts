import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";

const envSchema = t.Object({
	DATABASE_URL: t.String({ minLength: 1, error: "DATABASE_URL é obrigatória" }),
	REDIS_URL: t.String({ minLength: 1, error: "REDIS_URL é obrigatória" }),
	JWT_SECRET: t.String({
		minLength: 10,
		error: "JWT_SECRET deve ter no mínimo 10 caracteres",
	}),
	PORT: t.String({ default: "3000" }),
});

const processEnv = {
	DATABASE_URL: Bun.env.DATABASE_URL,
	REDIS_URL: Bun.env.REDIS_URL,
	JWT_SECRET: Bun.env.JWT_SECRET,
	PORT: Bun.env.PORT || "3000",
};

const errors = [...Value.Errors(envSchema, processEnv)];

if (errors.length > 0) {
	console.error(
		"❌ Falha na inicialização: Erro nas variáveis de ambiente (.env)",
	);
	errors.forEach((e) =>
		console.error(`   -> ${e.path.replace("/", "")}: ${e.message}`),
	);
	process.exit(1); // Derruba o processo imediatamente (Fail-Fast)
}

export const env = processEnv as Static<typeof envSchema>;
