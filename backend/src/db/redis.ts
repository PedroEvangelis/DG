export const redis = new Bun.RedisClient();

redis.onclose = (err) => {
	if (err) {
		console.error("Conexão com Redis fechada com erro:", err);
		return;
	}

	console.log("Conexão com Redis fechada");
};

redis.onconnect = () => console.log("Conexão com Redis estabelecida");

export const initRedis = async () => {
	await redis.connect();
};
