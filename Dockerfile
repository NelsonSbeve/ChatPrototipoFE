# ================================
# Stage 1: Build (usa imagem full do Node, não Alpine)
# ================================
FROM node:20 AS build

WORKDIR /app

# Copia package.json e lock
COPY package*.json ./
RUN npm ci --quiet

# Copia o resto
COPY . .

# Usa npx (funciona sempre na imagem full do Node)
RUN npx ng build --configuration production

# ================================
# Stage 2: Serve com Nginx leve
# ================================
FROM nginx:alpine

# Copia os arquivos buildados (ajusta o nome do projeto se necessário)
COPY --from=build /app/dist/chat-prototipo/browser /usr/share/nginx/html

# Opcional: config para SPA (refresh de rotas)

EXPOSE 80
