# ================================
# Stage 1: Build (usa imagem full do Node, não Alpine)
# ================================
FROM node:20 AS build

WORKDIR /app

# Copia package.json e lock
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies necessárias para build)
RUN npm ci

# Copia o resto do código
COPY . .

# Build da aplicação
RUN npm run build

# ================================
# Stage 2: Serve com Nginx leve
# ================================
FROM nginx:alpine

# Copia os arquivos buildados (CAMINHO CORRIGIDO)
COPY --from=build /app/dist/ChatProrotipo/browser /usr/share/nginx/html

# Config para SPA (refresh de rotas funcionar)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
