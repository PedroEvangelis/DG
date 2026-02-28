export type CacheKey =
	| `receitaws:${string}`
	| `viacep:${string}`
	| `users:all`
	| `users:${string}`
	| `addresses:user:${string}`
	| `addresses:${string}`;

export const CacheKeys = {
	receitaWs: (cnpj: string): CacheKey => `receitaws:${cnpj}`,
	viaCep: (cep: string): CacheKey => `viacep:${cep}`,
	usersAll: (): CacheKey => `users:all`,
	user: (id: string): CacheKey => `users:${id}`,
	addressesByUser: (userId: string): CacheKey => `addresses:user:${userId}`,
	address: (id: string): CacheKey => `addresses:${id}`,
};
