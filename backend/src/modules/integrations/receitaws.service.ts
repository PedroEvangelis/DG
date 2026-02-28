import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";
import { redis } from "@/db/redis";
import { CacheKeys } from "@/types/cache";

export const receitaWsResponseSchema = t.Object({
	cnpj: t.String(),
	tipo: t.Optional(t.String()),
	abertura: t.Optional(t.String()),
	nome: t.String(),
	fantasia: t.Optional(t.String()),
	status: t.Optional(t.String()),
	message: t.Optional(t.String()),
});

export type ReceitaWsResponse = Static<typeof receitaWsResponseSchema>;

export const ReceitaWsService = {
	async getCompanyByCnpj(cnpj: string): Promise<ReceitaWsResponse | null> {
		try {
			const cleanCnpj = cnpj.replace(/\D/g, "");
			if (cleanCnpj.length !== 14) {
				return null;
			}

			const cacheKey = CacheKeys.receitaWs(cleanCnpj);
			const cached = await redis.get(cacheKey);

			if (cached) {
				const parsed = JSON.parse(cached);
				if (Value.Check(receitaWsResponseSchema, parsed)) {
					return parsed;
				}
				return null;
			}

			// Note: ReceitaWS public API has rate limits (3 requests per minute).
			const response = await fetch(
				`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`,
			);
			if (!response.ok) {
				return null;
			}
			const json = await response.json();

			if (json.status === "ERROR") {
				return null;
			}

			if (!Value.Check(receitaWsResponseSchema, json)) {
				return null;
			}

			const data = json as ReceitaWsResponse;

			// Cache for 7 days
			await redis.set(cacheKey, JSON.stringify(json), "EX", 60 * 60 * 24 * 7);

			return data;
		} catch (error) {
			console.error(`[ReceitaWsService] Error fetching CNPJ ${cnpj}:`, error);
			return null;
		}
	},
};
