# Backend Dockerfile
FROM node:24-alpine AS base
RUN npm install -g bun

WORKDIR /app

# Instala as dependências (precisa de todos os package.json do workspace)
COPY package.json bun.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN bun install

# Copia o código fonte
COPY backend/ ./backend/

WORKDIR /app/backend

# Expõe a porta do backend
EXPOSE 3000

# Executa o servidor
CMD ["bun", "run", "src/index.ts"]
