# Backend Dockerfile
FROM oven/bun:1.2.4-alpine AS base
WORKDIR /app

# Instala as dependências
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copia o código fonte
COPY . .

# Expõe a porta do backend
EXPOSE 3000

# Executa as migrações e inicia o servidor
# Em produção, você pode querer rodar as migrações em um step separado ou no início do container
CMD ["bun", "run", "src/index.ts"]
