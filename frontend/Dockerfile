# Frontend Dockerfile
FROM node:24-alpine AS build
RUN npm install -g bun

WORKDIR /app

# Instala dependências (precisa de todos os package.json do workspace)
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN bun install

# Copia o código fonte (precisa do backend para as constantes compartilhadas)
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build da aplicação
WORKDIR /app/frontend
RUN bun run build

# Stage 2: Servindo o build estático com Nginx
FROM nginx:stable-alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Configuração do Nginx com Proxy para o Backend
RUN echo 'server { \
    listen 80; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy para API \
    location /api/ { \
        proxy_pass http://backend:3000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
