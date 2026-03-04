# Frontend Dockerfile
FROM oven/bun:1.2.4-alpine AS build
WORKDIR /app

# Instala dependências
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copia o código fonte
COPY . .

# Build da aplicação
RUN bun run build

# Stage 2: Servindo o build estático com Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Se você usar TanStack Router com URLs amigáveis, precisará configurar o Nginx para redirecionar para index.html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
