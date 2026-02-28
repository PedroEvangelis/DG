import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";
import { redis } from "@/db/redis";
import { CacheKeys } from "@/types/cache";

export const viaCepResponseSchema = t.Object({
	cep: t.String(),
	logradouro: t.String(),
	complemento: t.Optional(t.String()),
	bairro: t.String(),
	localidade: t.String(),
	uf: t.String(),
	ibge: t.Optional(t.String()),
	gia: t.Optional(t.String()),
	ddd: t.Optional(t.String()),
	siafi: t.Optional(t.String()),
	erro: t.Optional(t.Union([t.Boolean(), t.String()])),
});

export type ViaCepResponse = Static<typeof viaCepResponseSchema>;

export const ViaCepService = {
	async getAddressByCep(cep: string): Promise<ViaCepResponse | null> {
		try {
			const cleanCep = cep.replace(/\D/g, "");
			if (cleanCep.length !== 8) {
				return null;
			}

			const cacheKey = CacheKeys.viaCep(cleanCep);
			const cached = await redis.get(cacheKey);

			if (cached) {
				const parsed = JSON.parse(cached);
				if (Value.Check(viaCepResponseSchema, parsed)) {
					return parsed;
				}
				return null;
			}

			const response = await fetch(
				`https://viacep.com.br/ws/${cleanCep}/json/`,
			);
			if (!response.ok) {
				return null;
			}

			const json = await response.json();
			if (!Value.Check(viaCepResponseSchema, json)) {
				return null;
			}

			const data = json as ViaCepResponse;

			if (data.erro) {
				return null;
			}

			// Cache for 7 days
			await redis.set(cacheKey, JSON.stringify(json), "EX", 60 * 60 * 24 * 7);

			return data;
		} catch (error) {
			console.error(`[ViaCepService] Error fetching CEP ${cep}:`, error);
			return null;
		}
	},
};
