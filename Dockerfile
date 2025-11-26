# ================================
# Stage 1: Build (usa imagem full do Node, não Alpine)
# ================================
FROM node:20 AS build

WORKDIR /app

# Copia package.json
COPY package*.json ./

# Usa npm install em vez de npm ci (mais tolerante a inconsistências)
RUN npm install

# Copia o resto do código
COPY . .

# Build da aplicação
RUN npm run build

# ================================
# Stage 2: Serve com Nginx leve
# ================================
FROM nginx:alpine

# Copia os arquivos buildados
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
